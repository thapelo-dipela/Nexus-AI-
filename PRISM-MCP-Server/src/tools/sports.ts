import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prism } from "../client.js";
import { RENDER_HINTS } from "../render-hints.js";

export function registerSportsTools(server: McpServer) {
  server.registerTool(
    "list_sports",
    {
      description: "Get all supported sports with activity status",
      inputSchema: {
        active_only: z.boolean().optional().describe("Only show active sports"),
        region: z.string().optional().describe("Filter by region"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.list_sports },
    },
    async ({ active_only, region }) => {
      const result = await prism.sports.listSports({ active_only, region });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ sports: result, _ui: RENDER_HINTS.list_sports }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_sports_events",
    {
      description: "Get upcoming or live events for a sport",
      inputSchema: {
        sport: z.string().describe("Sport name (e.g. 'basketball', 'football', 'soccer')"),
        status: z.string().optional().describe("Filter by status (e.g. 'upcoming', 'live')"),
        days_ahead: z.number().optional().describe("Number of days ahead to fetch"),
        limit: z.number().optional().describe("Number of events to return"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.sports_events },
    },
    async ({ sport, status, days_ahead, limit }) => {
      const result = await prism.sports.getEvents(sport, { status, days_ahead, limit });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ events: result }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_event_details",
    {
      description: "Get detailed information for a sports event",
      inputSchema: {
        event_id: z.string().describe("Event ID"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.event_details },
    },
    async ({ event_id }) => {
      const result = await prism.sports.getEvent(event_id);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.event_details }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_event_odds",
    {
      description: "Get odds for a sports event across all bookmakers",
      inputSchema: {
        event_id: z.string().describe("Event ID"),
        market: z.string().optional().describe("Market type filter (e.g. 'moneyline', 'spread', 'totals')"),
        bookmakers: z.string().optional().describe("Comma-separated bookmaker filter"),
        region: z.string().optional().describe("Region filter"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.event_odds },
    },
    async ({ event_id, market, bookmakers, region }) => {
      const result = await prism.sports.getEventOdds(event_id, { market, bookmakers, region });
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "resolve_sports_event",
    {
      description: "Natural language sports resolution (e.g. 'Lakers vs Warriors tonight')",
      inputSchema: {
        query: z.string().describe("Natural language query"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.resolve_sports },
    },
    async ({ query }) => {
      const result = await prism.sports.resolve(query);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "search_sports_events",
    {
      description: "Search sports events by text query",
      inputSchema: {
        query: z.string().describe("Search query"),
        sport: z.string().optional().describe("Filter by sport"),
        status: z.string().optional().describe("Filter by status"),
        limit: z.number().optional().describe("Number of results"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.search_sports },
    },
    async ({ query, sport, status, limit }) => {
      const result = await prism.sports.search(query, { sport, status, limit });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ events: result, _ui: RENDER_HINTS.search_sports }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_sportsbooks",
    {
      description: "Get list of available sportsbooks by region",
      inputSchema: {
        region: z.string().optional().describe("Region filter"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.sportsbooks },
    },
    async ({ region }) => {
      const result = await prism.sports.getSportsbooks(region);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ sportsbooks: result, _ui: RENDER_HINTS.sportsbooks }, null, 2),
        }],
      };
    }
  );
}
