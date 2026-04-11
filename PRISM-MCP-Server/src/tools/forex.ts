import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prism } from "../client.js";
import { RENDER_HINTS } from "../render-hints.js";

export function registerForexTools(server: McpServer) {
  server.registerTool(
    "get_forex_pairs",
    {
      description: "Get all tracked forex pairs with live exchange rates",
      inputSchema: {},
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.forex_pairs },
    },
    async () => {
      const result = await prism.forex.getAll();
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ pairs: result, _ui: RENDER_HINTS.forex_pairs }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_forex_tradeable_forms",
    {
      description: "Get tradeable forms of a currency (spot, CFD, ETF, futures)",
      inputSchema: {
        currency: z.string().describe("Currency code (e.g. 'EUR', 'GBP', 'JPY')"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.forex_tradeable },
    },
    async ({ currency }) => {
      const result = await prism.forex.getTradeableForms(currency);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ tradeable_forms: result, _ui: RENDER_HINTS.forex_tradeable }, null, 2),
        }],
      };
    }
  );
}
