import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prism } from "../client.js";
import { RENDER_HINTS } from "../render-hints.js";

export function registerRiskTools(server: McpServer) {
  server.registerTool(
    "get_risk",
    {
      description: "Get risk metrics: volatility, Sharpe ratio, max drawdown, beta",
      inputSchema: {
        symbol: z.string().describe("Asset symbol"),
        asset_type: z.string().optional().describe("Asset type filter"),
        period: z.number().optional().describe("Lookback period in days"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.get_risk },
    },
    async ({ symbol, asset_type, period }) => {
      const result = await prism.risk.getMetrics(symbol, { asset_type, period });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.get_risk }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "calculate_var",
    {
      description: "Calculate Value at Risk (VaR) for a position",
      inputSchema: {
        symbol: z.string().describe("Asset symbol"),
        asset_type: z.string().optional().describe("Asset type filter"),
        confidence: z.number().optional().describe("Confidence level (e.g. 0.95 for 95% VaR)"),
        period: z.number().optional().describe("Lookback period in days"),
        position_size: z.number().optional().describe("Position size for VaR calculation"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.var_calculation },
    },
    async ({ symbol, asset_type, confidence, period, position_size }) => {
      const result = await prism.risk.getVaR(symbol, { asset_type, confidence, period, position_size });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.var_calculation }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "analyze_portfolio_risk",
    {
      description: "Calculate portfolio-level risk analysis for mixed positions (stocks + crypto + ETFs)",
      inputSchema: {
        positions: z.array(z.object({
          symbol: z.string(),
          weight: z.number(),
          quantity: z.number().optional(),
          asset_type: z.string().optional(),
        })).describe("Array of portfolio positions with weights or quantities"),
        period_days: z.number().optional().describe("Lookback period in days (default 30)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.portfolio_risk },
    },
    async ({ positions, period_days }) => {
      // Cast to any to avoid type mismatch with SDK
      const result = await prism.risk.analyzePortfolio(positions as any, period_days);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.portfolio_risk }, null, 2),
        }],
      };
    }
  );
}
