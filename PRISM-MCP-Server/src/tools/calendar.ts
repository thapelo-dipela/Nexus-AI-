import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prism } from "../client.js";
import { RENDER_HINTS } from "../render-hints.js";

export function registerCalendarTools(server: McpServer) {
  server.registerTool(
    "get_earnings_calendar",
    {
      description: "Get upcoming earnings reports with date range filter",
      inputSchema: {
        from_date: z.string().optional().describe("Start date (ISO format YYYY-MM-DD)"),
        to_date: z.string().optional().describe("End date (ISO format)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.earnings_calendar },
    },
    async ({ from_date, to_date }) => {
      const result = await prism.calendar.getEarnings(from_date, to_date);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ earnings: result, _ui: RENDER_HINTS.earnings_calendar }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_earnings_this_week",
    {
      description: "Get earnings reports scheduled for this week",
      inputSchema: {
        limit: z.number().optional().describe("Number of earnings to return (default 50)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.earnings_week },
    },
    async ({ limit }) => {
      const result = await prism.calendar.getEarningsThisWeek(limit);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ earnings: result, _ui: RENDER_HINTS.earnings_week }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_economic_calendar",
    {
      description: "Get economic events calendar (FOMC, CPI, GDP, jobs reports) with forecasts",
      inputSchema: {
        from_date: z.string().optional().describe("Start date (ISO format YYYY-MM-DD)"),
        to_date: z.string().optional().describe("End date (ISO format)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.economic_calendar },
    },
    async ({ from_date, to_date }) => {
      const result = await prism.calendar.getEconomic(from_date, to_date);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ events: result, _ui: RENDER_HINTS.economic_calendar }, null, 2),
        }],
      };
    }
  );
}
