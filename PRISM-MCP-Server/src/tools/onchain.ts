import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prism } from "../client.js";
import { RENDER_HINTS } from "../render-hints.js";

export function registerOnchainTools(server: McpServer) {
  server.registerTool(
    "whale_movements",
    {
      description: "Track large whale transactions for a given contract address. Shows big transfers, exchange deposits/withdrawals.",
      inputSchema: {
        address: z.string().describe("Contract or wallet address to monitor"),
        chain: z.string().optional().describe("Chain (e.g. 'ethereum', 'solana')"),
        min_value_usd: z.number().optional().describe("Minimum transaction value in USD"),
        limit: z.number().optional().describe("Max results"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.whale_movements },
    },
    async ({ address, chain, min_value_usd, limit }) => {
      const result = await prism.onchain.getWhaleMovements(address, { chain, min_value_usd, limit });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ data: result, _ui: RENDER_HINTS.whale_movements }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "exchange_flows",
    {
      description: "Get exchange inflow/outflow data for an asset. Shows net deposits and withdrawals from exchanges.",
      inputSchema: {
        symbol: z.string().describe("Asset symbol (e.g. 'BTC', 'ETH')"),
        address: z.string().describe("Contract address of the token"),
        chain: z.string().optional().describe("Chain name"),
        period: z.string().optional().describe("Time period (e.g. '24h', '7d')"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.exchange_flows },
    },
    async ({ symbol, address, chain, period }) => {
      const result = await prism.onchain.getExchangeFlows(symbol, address, { chain, period });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.exchange_flows }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "wallet_balances",
    {
      description: "Get all token balances for a wallet address across chains.",
      inputSchema: {
        address: z.string().describe("Wallet address"),
        chain: z.string().optional().describe("Filter by chain"),
        min_value_usd: z.number().optional().describe("Minimum token value in USD"),
        exclude_spam: z.boolean().optional().describe("Exclude spam tokens"),
        limit: z.number().optional().describe("Max results"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.wallet_balances },
    },
    async ({ address, chain, min_value_usd, exclude_spam, limit }) => {
      const result = await prism.defi.getWalletBalances(address, { chain, min_value_usd, exclude_spam, limit });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ data: result, _ui: RENDER_HINTS.wallet_balances }, null, 2),
        }],
      };
    }
  );
}
