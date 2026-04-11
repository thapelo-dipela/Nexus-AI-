import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prism } from "../client.js";
import { RENDER_HINTS } from "../render-hints.js";

export function registerTechnicalsTools(server: McpServer) {
  server.registerTool(
    "technical_analysis",
    {
      description: "Full technical analysis: trend, RSI, MACD, MAs, volume signal, summary (crypto, stocks, forex, commodities)",
      inputSchema: {
        symbol: z.string().describe("Asset symbol"),
        timeframe: z.string().optional().describe("Timeframe (default '1d')"),
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
    "get_technical_indicators",
    {
      description: "Get specific technical indicators (RSI, MACD, EMA20, etc.)",
      inputSchema: {
        symbol: z.string().describe("Asset symbol"),
        indicators: z.string().optional().describe("Comma-separated indicators (e.g. 'RSI,MACD,EMA20')"),
        timeframe: z.string().optional().describe("Timeframe (default '1d')"),
        period: z.number().optional().describe("Period for calculations"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.technical_indicators },
    },
    async ({ symbol, indicators, timeframe, period }) => {
      const result = await prism.technicals.getIndicators(symbol, { indicators, timeframe, period });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.technical_indicators }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_support_resistance",
    {
      description: "Get key support and resistance price levels",
      inputSchema: {
        symbol: z.string().describe("Asset symbol"),
        timeframe: z.string().optional().describe("Timeframe (default '1d')"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.support_resistance },
    },
    async ({ symbol, timeframe }) => {
      const result = await prism.technicals.getSupportResistance(symbol, timeframe);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.support_resistance }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_trend",
    {
      description: "Get trend direction and strength (bullish, bearish, neutral)",
      inputSchema: {
        symbol: z.string().describe("Asset symbol"),
        timeframe: z.string().optional().describe("Timeframe (default '1d')"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.trend },
    },
    async ({ symbol, timeframe }) => {
      const result = await prism.technicals.getTrend(symbol, timeframe);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.trend }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "analyze_forex_technicals",
    {
      description: "Technical analysis for a forex pair (EUR/USD, GBP/JPY, etc.)",
      inputSchema: {
        pair: z.string().describe("Forex pair (e.g. 'EUR/USD', 'GBP/JPY')"),
        timeframe: z.string().optional().describe("Timeframe (default '1d')"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.forex_technicals },
    },
    async ({ pair, timeframe }) => {
      const result = await prism.technicals.analyzeFX(pair, timeframe);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.forex_technicals }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "analyze_commodity_technicals",
    {
      description: "Technical analysis for a commodity (GOLD, OIL, NATGAS, etc.)",
      inputSchema: {
        symbol: z.string().describe("Commodity symbol"),
        timeframe: z.string().optional().describe("Timeframe (default '1d')"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.commodity_technicals },
    },
    async ({ symbol, timeframe }) => {
      const result = await prism.technicals.analyzeCommodity(symbol, timeframe);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.commodity_technicals }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "compare_vs_benchmark",
    {
      description: "Compare asset performance vs a benchmark (SPY, BTC, etc.)",
      inputSchema: {
        asset: z.string().describe("Asset to compare"),
        benchmark: z.string().optional().describe("Benchmark symbol (default 'SPY')"),
        days: z.number().optional().describe("Number of days (default 30)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.benchmark_compare },
    },
    async ({ asset, benchmark, days }) => {
      const result = await prism.technicals.compareVsBenchmark(asset, benchmark, days);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_correlations",
    {
      description: "Get cross-asset correlation matrix (works with any mix of stocks, crypto, ETFs)",
      inputSchema: {
        assets: z.array(z.string()).optional().describe("Array of asset symbols (optional)"),
        days: z.number().optional().describe("Number of days (default 30)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.correlations },
    },
    async ({ assets, days }) => {
      const result = await prism.technicals.getCorrelations(assets, days);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2),
        }],
      };
    }
  );
}
