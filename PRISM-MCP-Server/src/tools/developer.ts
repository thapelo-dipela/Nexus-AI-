import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prism } from "../client.js";
import { RENDER_HINTS } from "../render-hints.js";

export function registerDeveloperTools(server: McpServer) {
  server.registerTool(
    "get_api_key",
    {
      description: "Get a free PRISM API key instantly (no signup). Returns key with agent tier (5 req/min, 100/day, 7-day expiry). Store the key securely and use it with X-API-Key header.",
      annotations: { readOnlyHint: false },
    },
    async () => {
      const response = await fetch("https://api.prismapi.ai/auth/keys/instant");
      if (!response.ok) {
        throw new Error(`Failed to get instant key: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            api_key: result.api_key,
            tier: result.tier,
            limits: result.limits,
            expires_at: result.expires_at,
            message: result.message,
            _hint: "Store this key securely. Use header: X-API-Key: <api_key>. Get higher limits at https://prismapi.ai/dashboard/keys"
          }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "check_usage",
    {
      description: "Check API usage and rate limits for the configured PRISM API key. Returns tier, usage counts, and rate limits.",
      annotations: { readOnlyHint: true },
    },
    async () => {
      const result = await prism.developer.getUsageStats();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "check_tiers",
    {
      description: "List all available PRISM API tiers and their rate limits. Compare Free, Starter, Dev, Pro, and Enterprise plans.",
      annotations: { readOnlyHint: true },
    },
    async () => {
      const result = await prism.developer.getTiers();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "verify_key",
    {
      description: "Verify if a PRISM API key is valid and get its details (tier, expiry). Useful for checking if a key is still active before making requests.",
      inputSchema: {
        key: z.string().describe("The PRISM API key to verify (format: prism_sk_...)"),
      },
      annotations: { readOnlyHint: true },
    },
    async (params: { key: string }) => {
      const result = await prism.developer.verifyKey(params.key);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "api_health",
    {
      description: "Check PRISM API health status and service availability.",
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.api_health },
    },
    async () => {
      const result = await prism.developer.getHealth();
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.api_health }, null, 2),
        }],
      };
    }
  );
}
