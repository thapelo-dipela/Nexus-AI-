import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prism } from "../client.js";
import { RENDER_HINTS } from "../render-hints.js";

export function registerNewsTools(server: McpServer) {
  server.registerTool(
    "get_news",
    {
      description: "Get the latest crypto and stock market news with sentiment analysis.",
      inputSchema: {
        category: z.enum(["crypto", "stocks"]).optional().describe("News category. Default: 'crypto'"),
        symbol: z.string().optional().describe("Filter stock news by ticker (only for stocks category)"),
        limit: z.number().optional().describe("Max articles (default 20)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.get_news },
    },
    async ({ category, symbol, limit }) => {
      const cat = category ?? "crypto";
      const result = cat === "stocks"
        ? await prism.news.getStockNews(symbol, limit)
        : await prism.news.getCryptoNews(limit);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ data: result, _ui: RENDER_HINTS.get_news }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "social_sentiment",
    {
      description: "Get social media sentiment for a crypto asset: bullish/bearish ratio, mention volume, and trending score.",
      inputSchema: {
        symbol: z.string().describe("Crypto symbol (e.g. 'BTC', 'ETH', 'SOL')"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.social_sentiment },
    },
    async ({ symbol }) => {
      const [sentiment, mentions, trending] = await Promise.all([
        prism.social.getSentiment(symbol),
        prism.social.getMentions(symbol),
        prism.social.getTrendingScore(symbol),
      ]);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ sentiment, mentions, trending, _ui: RENDER_HINTS.social_sentiment }, null, 2),
        }],
      };
    }
  );
}
