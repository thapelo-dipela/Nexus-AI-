import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prism } from "../client.js";
import { RENDER_HINTS } from "../render-hints.js";

export function registerMarketTools(server: McpServer) {
  server.registerTool(
    "get_price",
    {
      description: "Get the consensus price for any crypto asset. Aggregates across sources for accuracy.",
      inputSchema: {
        symbol: z.string().describe("Crypto ticker or name (e.g. 'BTC', 'ETH', 'SOL')"),
        include_sources: z.boolean().optional().describe("Include per-source price breakdown"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.get_price },
    },
    async ({ symbol, include_sources }) => {
      const result = await prism.crypto.getPrice(symbol, { include_sources });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.get_price }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_trending",
    {
      description: "Get trending crypto assets by volume, social buzz, and price action.",
      inputSchema: {
        include_pools: z.boolean().optional().describe("Include trending DEX pools"),
        include_solana: z.boolean().optional().describe("Include Solana bonding/graduated tokens"),
        limit_per_source: z.number().optional().describe("Max results per source"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.get_trending },
    },
    async ({ include_pools, include_solana, limit_per_source }) => {
      const result = await prism.crypto.getAllTrending({ include_pools, include_solana, limit_per_source });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ data: result, _ui: RENDER_HINTS.get_trending }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "market_overview",
    {
      description: "Get a full crypto market overview: global stats, fear & greed index, top gainers and losers.",
      inputSchema: {
        include_trending: z.boolean().optional().describe("Include trending assets"),
        include_movers: z.boolean().optional().describe("Include top gainers/losers"),
        movers_limit: z.number().optional().describe("Number of movers to return"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.market_overview },
    },
    async ({ include_trending, include_movers, movers_limit }) => {
      const [overview, global, fearGreed] = await Promise.all([
        prism.crypto.getMarketOverview({ include_trending, include_movers, movers_limit }),
        prism.crypto.getGlobal(),
        prism.crypto.getFearGreed(),
      ]);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ overview, global, fear_greed: fearGreed, _ui: RENDER_HINTS.market_overview }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_stock_quote",
    {
      description: "Get a real-time stock quote with price, change, volume, and market cap.",
      inputSchema: {
        symbol: z.string().describe("Stock ticker (e.g. 'AAPL', 'TSLA', 'NVDA')"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.get_stock_quote },
    },
    async ({ symbol }) => {
      const result = await prism.stocks.getQuote(symbol);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.get_stock_quote }, null, 2),
        }],
      };
    }
  );
}
