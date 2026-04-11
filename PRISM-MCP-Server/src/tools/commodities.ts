import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prism } from "../client.js";
import { RENDER_HINTS } from "../render-hints.js";

export function registerCommodityTools(server: McpServer) {
  server.registerTool(
    "get_commodity_prices",
    {
      description: "Get live prices for all tracked commodities (gold, oil, natural gas, corn, etc.)",
      inputSchema: {},
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.commodity_prices },
    },
    async () => {
      const result = await prism.commodities.getAll();
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ commodities: result, _ui: RENDER_HINTS.commodity_prices }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_commodity_tradeable_forms",
    {
      description: "Get tradeable forms of a commodity (futures, ETF, CFD)",
      inputSchema: {
        commodity: z.string().describe("Commodity name (e.g. 'GOLD', 'OIL', 'NATGAS')"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.commodity_tradeable },
    },
    async ({ commodity }) => {
      const result = await prism.commodities.getTradeableForms(commodity);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ tradeable_forms: result, _ui: RENDER_HINTS.commodity_tradeable }, null, 2),
        }],
      };
    }
  );
}
