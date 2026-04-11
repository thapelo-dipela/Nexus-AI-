import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prism } from "../client.js";
import { RENDER_HINTS } from "../render-hints.js";

export function registerOrderBookTools(server: McpServer) {
  server.registerTool(
    "get_orderbook",
    {
      description: "Get aggregated order book (consolidated across exchanges)",
      inputSchema: {
        symbol: z.string().describe("Asset symbol"),
        levels: z.number().optional().describe("Number of price levels to return (default 10)"),
        exchanges: z.string().optional().describe("Filter by specific exchanges"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.orderbook },
    },
    async ({ symbol, levels, exchanges }) => {
      const result = await prism.orderbook.get(symbol, { levels, exchanges });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.orderbook }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_orderbook_depth",
    {
      description: "Get full order book depth data",
      inputSchema: {
        symbol: z.string().describe("Asset symbol"),
        levels: z.number().optional().describe("Number of price levels (default 10)"),
        exchange: z.string().optional().describe("Specific exchange filter"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.orderbook_depth },
    },
    async ({ symbol, levels, exchange }) => {
      const result = await prism.orderbook.getDepth(symbol, { levels, exchange });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.orderbook_depth }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_bid_ask_spread",
    {
      description: "Get bid-ask spread (absolute and percentage)",
      inputSchema: {
        symbol: z.string().describe("Asset symbol"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.spread },
    },
    async ({ symbol }) => {
      const result = await prism.orderbook.getSpread(symbol);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.spread }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_orderbook_imbalance",
    {
      description: "Get order book imbalance (bid vs ask pressure). Positive = bullish, negative = bearish",
      inputSchema: {
        symbol: z.string().describe("Asset symbol"),
        depth: z.number().optional().describe("Depth to analyze (default 10)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.imbalance },
    },
    async ({ symbol, depth }) => {
      const result = await prism.orderbook.getImbalance(symbol, depth);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.imbalance }, null, 2),
        }],
      };
    }
  );
}
