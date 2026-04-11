import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prism } from "../client.js";
import { RENDER_HINTS } from "../render-hints.js";

export function registerDefiTools(server: McpServer) {
  server.registerTool(
    "get_yields",
    {
      description: "Get top DeFi yield opportunities across chains. Filter by chain, minimum APY, TVL, and stablecoin-only pools.",
      inputSchema: {
        chain: z.string().optional().describe("Filter by chain (e.g. 'ethereum', 'arbitrum')"),
        min_tvl: z.number().optional().describe("Minimum TVL in USD"),
        min_apy: z.number().optional().describe("Minimum APY percentage"),
        stablecoin: z.boolean().optional().describe("Only stablecoin pools"),
        limit: z.number().optional().describe("Max results (default 20)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.get_yields },
    },
    async ({ chain, min_tvl, min_apy, stablecoin, limit }) => {
      const result = await prism.defi.getYields({ chain, min_tvl, min_apy, stablecoin, limit });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ data: result, _ui: RENDER_HINTS.get_yields }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_protocols",
    {
      description: "List DeFi protocols with TVL, category, and chain information.",
      inputSchema: {
        category: z.string().optional().describe("Protocol category (e.g. 'DEX', 'Lending', 'Yield')"),
        chain: z.string().optional().describe("Filter by chain"),
        min_tvl: z.number().optional().describe("Minimum TVL in USD"),
        limit: z.number().optional().describe("Max results"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.get_protocols },
    },
    async ({ category, chain, min_tvl, limit }) => {
      const result = await prism.defi.getProtocols({ category, chain, min_tvl, limit });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ data: result, _ui: RENDER_HINTS.get_protocols }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_gas",
    {
      description: "Get current gas prices across all supported chains.",
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.get_gas },
    },
    async () => {
      const result = await prism.defi.getAllGas();
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ data: result, _ui: RENDER_HINTS.get_gas }, null, 2),
        }],
      };
    }
  );
}
