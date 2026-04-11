import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prism } from "../client.js";
import { RENDER_HINTS } from "../render-hints.js";

export function registerTradesTools(server: McpServer) {
  server.registerTool(
    "get_recent_trades",
    {
      description: "Get recent trades for a symbol",
      inputSchema: {
        symbol: z.string().describe("Asset symbol"),
        limit: z.number().optional().describe("Number of trades to return"),
        exchange: z.string().optional().describe("Filter by specific exchange"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.recent_trades },
    },
    async ({ symbol, limit, exchange }) => {
      const result = await prism.trades.getRecent(symbol, { limit, exchange });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ trades: result, _ui: RENDER_HINTS.recent_trades }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_large_trades",
    {
      description: "Get large trades / block trades (institutional-size prints)",
      inputSchema: {
        symbol: z.string().describe("Asset symbol"),
        min_value: z.number().optional().describe("Minimum USD value threshold (e.g. 100000 for $100k+)"),
        limit: z.number().optional().describe("Number of trades to return"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.large_trades },
    },
    async ({ symbol, min_value, limit }) => {
      const result = await prism.trades.getLarge(symbol, { min_value, limit });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ large_trades: result, _ui: RENDER_HINTS.large_trades }, null, 2),
        }],
      };
    }
  );
}
