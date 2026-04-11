import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prism } from "../client.js";
import { RENDER_HINTS } from "../render-hints.js";

export function registerPredictionTools(server: McpServer) {
  server.registerTool(
    "prediction_markets",
    {
      description: "Get trending prediction markets from Polymarket, Kalshi, and Manifold.",
      inputSchema: {
        limit: z.number().optional().describe("Max results (default 20)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.prediction_markets },
    },
    async ({ limit }) => {
      const result = await prism.predictions.getTrending(limit);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ data: result, _ui: RENDER_HINTS.prediction_markets }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "search_predictions",
    {
      description: "Search prediction markets by query. Find markets about elections, crypto, sports, and more.",
      inputSchema: {
        query: z.string().describe("Search query (e.g. 'Bitcoin 100k', 'US election')"),
        category: z.string().optional().describe("Filter by category"),
        source: z.string().optional().describe("Platform: 'polymarket', 'kalshi', or 'manifold'"),
        limit: z.number().optional().describe("Max results"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.search_predictions },
    },
    async ({ query, category, source, limit }) => {
      const result = await prism.predictions.searchMarkets(query, { category, source, limit });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ data: result, _ui: RENDER_HINTS.search_predictions }, null, 2),
        }],
      };
    }
  );
}
