import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prism } from "../client.js";
import { RENDER_HINTS } from "../render-hints.js";

export function registerETFTools(server: McpServer) {
  server.registerTool(
    "get_popular_etfs",
    {
      description: "Get most popular ETFs by trading volume",
      inputSchema: {
        limit: z.number().optional().describe("Number of ETFs to return (default 20)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.popular_etfs },
    },
    async ({ limit }) => {
      const result = await prism.etfs.getPopular(limit);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ etfs: result, _ui: RENDER_HINTS.popular_etfs }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_etf_holdings",
    {
      description: "Get full holdings breakdown for an ETF with weights and positions",
      inputSchema: {
        symbol: z.string().describe("ETF ticker (e.g. 'SPY', 'QQQ', 'VOO')"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.etf_holdings },
    },
    async ({ symbol }) => {
      const result = await prism.etfs.getHoldings(symbol);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ holdings: result, _ui: RENDER_HINTS.etf_holdings }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_etf_sector_weights",
    {
      description: "Get sector allocation breakdown for an ETF",
      inputSchema: {
        symbol: z.string().describe("ETF ticker"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.etf_sectors },
    },
    async ({ symbol }) => {
      const result = await prism.etfs.getSectorWeights(symbol);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ sectors: result, _ui: RENDER_HINTS.etf_sectors }, null, 2),
        }],
      };
    }
  );
}
