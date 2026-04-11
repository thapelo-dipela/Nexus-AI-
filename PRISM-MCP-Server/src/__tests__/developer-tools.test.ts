/**
 * Tests for OpenClaw-first MCP developer tools.
 * 
 * Uses official MCP SDK testing pattern with InMemoryTransport.
 * 
 * Tests:
 * - get_api_key tool
 * - check_usage tool
 * - check_tiers tool
 * - verify_key tool
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { registerDeveloperTools } from '../tools/developer';

// Mock the prism client
vi.mock('../client.js', () => ({
  prism: {
    developer: {
      getUsageStats: vi.fn(),
      getTiers: vi.fn(),
      verifyKey: vi.fn(),
      getHealth: vi.fn()
    }
  }
}));

// Mock fetch for get_api_key
global.fetch = vi.fn();

describe('MCP Developer Tools', () => {
  let server: McpServer;
  let client: Client;
  let clientTransport: InMemoryTransport;
  let serverTransport: InMemoryTransport;

  beforeEach(async () => {
    // Create in-memory transport pair
    [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    // Create and connect server with McpServer (high-level API)
    server = new McpServer({
      name: 'test-prism-mcp',
      version: '1.0.0'
    });
    registerDeveloperTools(server);
    await server.connect(serverTransport);

    // Create and connect client
    client = new Client(
      {
        name: 'test-client',
        version: '1.0.0'
      },
      {
        capabilities: {}
      }
    );
    await client.connect(clientTransport);

    vi.clearAllMocks();
  });

  afterEach(async () => {
    await client.close();
    await server.close();
  });

  describe('get_api_key tool', () => {
    it('should fetch an instant API key from the public endpoint', async () => {
      const mockResponse = {
        api_key: 'prism_sk_test_instant_mcp_123',
        tier: 'agent',
        limits: {
          requests_per_minute: 5,
          requests_per_day: 100
        },
        expires_at: '2026-03-04T00:00:00Z',
        message: 'Free instant API key created (7-day expiry)'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // List tools to verify registration
      const tools = await client.listTools();
      const getApiKeyTool = tools.tools.find(t => t.name === 'get_api_key');
      
      expect(getApiKeyTool).toBeDefined();
      expect(getApiKeyTool?.description).toContain('instant');
      expect(getApiKeyTool?.description).toContain('no signup');

      // Execute the tool
      const result = await client.callTool({
        name: 'get_api_key',
        arguments: {}
      });
      
      expect(result.content[0].type).toBe('text');
      const content = JSON.parse((result.content[0] as any).text);
      
      expect(content.api_key).toBe('prism_sk_test_instant_mcp_123');
      expect(content.tier).toBe('agent');
      expect(content._hint).toContain('Store this key securely');
      
      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.prismapi.ai/auth/keys/instant'
      );
    });

    it('should handle API failures gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });
      
      const result = await client.callTool({ name: 'get_api_key', arguments: {} });
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed to get instant key');
    });

    it('should be marked as non-read-only', async () => {
      const tools = await client.listTools();
      const getApiKeyTool = tools.tools.find(t => t.name === 'get_api_key');
      
      // Non-read-only tools should have readOnlyHint false or undefined
      expect(getApiKeyTool?.annotations?.readOnlyHint).toBeFalsy();
    });
  });

  describe('check_usage tool', () => {
    it('should return usage stats for the configured API key', async () => {
      const { prism } = await import('../client.js');
      (prism.developer.getUsageStats as any).mockResolvedValueOnce({
        tier: 'pro',
        usage_count_today: 42,
        requests_per_minute_limit: 300
      });

      const result = await client.callTool({
        name: 'check_usage',
        arguments: {}
      });
      
      expect(result.content[0].type).toBe('text');
      const content = JSON.parse((result.content[0] as any).text);
      expect(content.tier).toBe('pro');
      expect(content.usage_count_today).toBe(42);
    });

    it('should be marked as read-only', async () => {
      const tools = await client.listTools();
      const checkUsageTool = tools.tools.find(t => t.name === 'check_usage');
      
      expect(checkUsageTool?.annotations?.readOnlyHint).toBe(true);
    });
  });

  describe('check_tiers tool', () => {
    it('should list all available API tiers', async () => {
      const { prism } = await import('../client.js');
      (prism.developer.getTiers as any).mockResolvedValueOnce({
        tiers: { free: { qps: 1 }, pro: { qps: 300 } }
      });

      const result = await client.callTool({
        name: 'check_tiers',
        arguments: {}
      });
      
      expect(result.content[0].type).toBe('text');
      const content = JSON.parse((result.content[0] as any).text);
      expect(content.tiers).toBeDefined();
    });

    it('should be marked as read-only', async () => {
      const tools = await client.listTools();
      const checkTiersTool = tools.tools.find(t => t.name === 'check_tiers');
      
      expect(checkTiersTool?.annotations?.readOnlyHint).toBe(true);
    });
  });

  describe('verify_key tool', () => {
    it('should verify a valid API key', async () => {
      const { prism } = await import('../client.js');
      (prism.developer.verifyKey as any).mockResolvedValueOnce({
        valid: true,
        tier: 'pro',
        expires_at: '2027-01-01'
      });

      const result = await client.callTool({
        name: 'verify_key',
        arguments: { key: 'prism_sk_test_123' }
      });
      
      expect(result.content[0].type).toBe('text');
      const content = JSON.parse((result.content[0] as any).text);
      expect(content.valid).toBe(true);
      expect(content.tier).toBe('pro');
    });

    it('should handle invalid keys', async () => {
      const { prism } = await import('../client.js');
      (prism.developer.verifyKey as any).mockResolvedValueOnce({
        valid: false,
        message: 'Invalid key'
      });

      const result = await client.callTool({
        name: 'verify_key',
        arguments: { key: 'invalid_key' }
      });
      
      expect(result.content[0].type).toBe('text');
      const content = JSON.parse((result.content[0] as any).text);
      expect(content.valid).toBe(false);
    });

    it('should require key parameter', async () => {
      const tools = await client.listTools();
      const verifyKeyTool = tools.tools.find(t => t.name === 'verify_key');
      
      expect(verifyKeyTool?.inputSchema).toBeDefined();
      expect(verifyKeyTool?.inputSchema.required).toContain('key');
    });

    it('should be marked as read-only', async () => {
      const tools = await client.listTools();
      const verifyKeyTool = tools.tools.find(t => t.name === 'verify_key');
      
      expect(verifyKeyTool?.annotations?.readOnlyHint).toBe(true);
    });
  });

  describe('Tool registration', () => {
    it('should register all 4 new developer tools', async () => {
      const tools = await client.listTools();
      
      const developerTools = tools.tools.filter(t => 
        ['get_api_key', 'check_usage', 'check_tiers', 'verify_key'].includes(t.name)
      );
      
      expect(developerTools).toHaveLength(4);
    });

    it('should still have api_health tool', async () => {
      const tools = await client.listTools();
      
      const healthTool = tools.tools.find(t => t.name === 'api_health');
      expect(healthTool).toBeDefined();
    });
  });

  describe('Integration: Agent workflow', () => {
    it('should support complete agent onboarding flow', async () => {
      // Step 1: Get instant key
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          api_key: 'prism_sk_test_workflow',
          tier: 'agent',
          limits: { requests_per_minute: 5 },
          expires_at: '2026-03-04T00:00:00Z',
          message: 'Free instant API key created'
        })
      });

      const keyResult = await client.callTool({
        name: 'get_api_key',
        arguments: {}
      });
      const keyContent = JSON.parse((keyResult.content[0] as any).text);
      
      expect(keyContent.api_key).toBe('prism_sk_test_workflow');

      // Step 2: Verify key works
      const { prism } = await import('../client.js');
      (prism.developer.verifyKey as any).mockResolvedValueOnce({
        valid: true,
        tier: 'agent'
      });

      const verifyResult = await client.callTool({
        name: 'verify_key',
        arguments: { key: keyContent.api_key }
      });
      const verifyContent = JSON.parse((verifyResult.content[0] as any).text);
      
      expect(verifyContent.valid).toBe(true);
      expect(verifyContent.tier).toBe('agent');

      // Step 3: Check available tiers for upgrade
      (prism.developer.getTiers as any).mockResolvedValueOnce({
        tiers: { agent: { rpm: 5 }, pro: { rpm: 300 } }
      });

      const tiersResult = await client.callTool({
        name: 'check_tiers',
        arguments: {}
      });
      const tiersContent = JSON.parse((tiersResult.content[0] as any).text);
      
      expect(tiersContent.tiers).toBeDefined();
      expect(tiersContent.tiers.pro).toBeDefined();
    });
  });
});
