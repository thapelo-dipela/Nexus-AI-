import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { prism } from "../client.js";
import { RENDER_HINTS } from "../render-hints.js";

export function registerMacroTools(server: McpServer) {
  server.registerTool(
    "macro_summary",
    {
      description: "Get a macroeconomic dashboard: Fed rate, inflation, GDP, unemployment, treasury yields, and yield curve status.",
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.macro_summary },
    },
    async () => {
      const result = await prism.macro.getSummary();
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.macro_summary }, null, 2),
        }],
      };
    }
  );
}
