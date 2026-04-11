import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prism } from "../client.js";
import { RENDER_HINTS } from "../render-hints.js";

export function registerOddsTools(server: McpServer) {
  server.registerTool(
    "find_arbitrage",
    {
      description: "Find cross-platform arbitrage opportunities across sportsbooks",
      inputSchema: {
        category: z.string().optional().describe("Category filter"),
        min_profit_pct: z.number().optional().describe("Minimum profit percentage"),
        max_stake: z.number().optional().describe("Maximum stake amount"),
        include_expired: z.boolean().optional().describe("Include expired opportunities"),
        limit: z.number().optional().describe("Number of opportunities to return"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.find_arbitrage },
    },
    async ({ category, min_profit_pct, max_stake, include_expired, limit }) => {
      const result = await prism.odds.findArbitrage({ category, min_profit_pct, max_stake, include_expired, limit });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ opportunities: result, _ui: RENDER_HINTS.find_arbitrage }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_event_arbitrage",
    {
      description: "Get arbitrage opportunities for a specific event",
      inputSchema: {
        event_id: z.string().describe("Event ID"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.event_arbitrage },
    },
    async ({ event_id }) => {
      const result = await prism.odds.getEventArbitrage(event_id);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.event_arbitrage }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "compare_odds",
    {
      description: "Side-by-side odds comparison across all bookmakers for an event",
      inputSchema: {
        event_id: z.string().describe("Event ID"),
        market: z.string().optional().describe("Market type filter"),
        format: z.string().optional().describe("Odds format (e.g. 'decimal', 'american')"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.compare_odds },
    },
    async ({ event_id, market, format }) => {
      const result = await prism.odds.compareOdds(event_id, { market, format });
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_odds_history",
    {
      description: "Get historical odds movement for a market",
      inputSchema: {
        market_id: z.string().describe("Market ID"),
        outcome: z.string().optional().describe("Outcome filter"),
        platform: z.string().optional().describe("Platform filter"),
        interval: z.string().optional().describe("Data interval"),
        days: z.number().optional().describe("Number of days back"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.odds_history },
    },
    async ({ market_id, outcome, platform, interval, days }) => {
      const result = await prism.odds.getOddsHistory(market_id, { outcome, platform, interval, days });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ history: result, _ui: RENDER_HINTS.odds_history }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_best_odds",
    {
      description: "Get best available odds across all platforms",
      inputSchema: {
        category: z.string().optional().describe("Category filter"),
        sport: z.string().optional().describe("Sport filter"),
        sort: z.string().optional().describe("Sort criteria"),
        limit: z.number().optional().describe("Number of odds to return"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.best_odds },
    },
    async ({ category, sport, sort, limit }) => {
      const result = await prism.odds.getBestOdds({ category, sport, sort, limit });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ odds: result, _ui: RENDER_HINTS.best_odds }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_odds_platforms",
    {
      description: "Get all supported odds platforms",
      inputSchema: {
        category: z.string().optional().describe("Category filter"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.odds_platforms },
    },
    async ({ category }) => {
      const result = await prism.odds.getPlatforms(category);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ platforms: result, _ui: RENDER_HINTS.odds_platforms }, null, 2),
        }],
      };
    }
  );
}
