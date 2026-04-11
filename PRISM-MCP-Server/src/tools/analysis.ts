import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prism } from "../client.js";
import { RENDER_HINTS } from "../render-hints.js";

export function registerAnalysisTools(server: McpServer) {
  server.registerTool(
    "technical_analysis",
    {
      description: "Run full technical analysis on any asset: trend, RSI, MACD, moving averages, volume signals, and summary.",
      inputSchema: {
        symbol: z.string().describe("Asset symbol (e.g. 'BTC', 'AAPL', 'EUR/USD')"),
        timeframe: z.string().optional().describe("Timeframe (e.g. '1d', '4h', '1h'). Default: '1d'"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.technical_analysis },
    },
    async ({ symbol, timeframe }) => {
      const result = await prism.technicals.analyze(symbol, timeframe);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.technical_analysis }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_signals",
    {
      description: "Get trading signals across momentum, volume spikes, breakouts, and divergences.",
      inputSchema: {
        symbols: z.string().optional().describe("Comma-separated symbols to scan, or omit for all"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.get_signals },
    },
    async ({ symbols }) => {
      const result = await prism.signals.getSummary(symbols);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ data: result, _ui: RENDER_HINTS.get_signals }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_risk",
    {
      description: "Get risk metrics for an asset: volatility, Sharpe ratio, max drawdown, beta, and Value-at-Risk.",
      inputSchema: {
        symbol: z.string().describe("Asset symbol"),
        period: z.number().optional().describe("Lookback period in days"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.get_risk },
    },
    async ({ symbol, period }) => {
      const result = await prism.risk.getMetrics(symbol, { period });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.get_risk }, null, 2),
        }],
      };
    }
  );
}
