import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prism } from "../client.js";
import { RENDER_HINTS } from "../render-hints.js";

export function registerHistoricalTools(server: McpServer) {
  server.registerTool(
    "get_historical_prices",
    {
      description: "Get OHLCV price history for any asset (crypto, stocks, ETFs, forex, commodities)",
      inputSchema: {
        symbol: z.string().describe("Asset symbol"),
        from_date: z.string().optional().describe("Start date (ISO format YYYY-MM-DD)"),
        to_date: z.string().optional().describe("End date (ISO format)"),
        days: z.number().optional().describe("Alternative to from/to: number of days back"),
        interval: z.enum(['1d', '1h', '5m', '15m']).optional().describe("Data interval"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.historical_prices },
    },
    async ({ symbol, from_date, to_date, days, interval }) => {
      const result = await prism.historical.getPrices(symbol, { from_date, to_date, days, interval });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ data: result, _ui: RENDER_HINTS.historical_prices }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_historical_volume",
    {
      description: "Get volume history for an asset",
      inputSchema: {
        symbol: z.string().describe("Asset symbol"),
        days: z.number().optional().describe("Number of days (default 30)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.historical_volume },
    },
    async ({ symbol, days }) => {
      const result = await prism.historical.getVolume(symbol, days);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ data: result, _ui: RENDER_HINTS.historical_volume }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_historical_metrics",
    {
      description: "Get multiple historical metrics over time (price, volume, market cap combined)",
      inputSchema: {
        symbol: z.string().describe("Asset symbol"),
        days: z.number().optional().describe("Number of days (default 30)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.historical_metrics },
    },
    async ({ symbol, days }) => {
      const result = await prism.historical.getMetrics(symbol, days);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ data: result, _ui: RENDER_HINTS.historical_metrics }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_returns",
    {
      description: "Get period returns (1d, 7d, 30d, 1y, etc.)",
      inputSchema: {
        symbol: z.string().describe("Asset symbol"),
        periods: z.string().optional().describe("Comma-separated periods (e.g. '1d,7d,30d,1y')"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.returns },
    },
    async ({ symbol, periods }) => {
      const result = await prism.historical.getReturns(symbol, periods);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.returns }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_historical_volatility",
    {
      description: "Get historical volatility with rolling window calculation",
      inputSchema: {
        symbol: z.string().describe("Asset symbol"),
        window: z.number().optional().describe("Rolling window in days (default 30)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.historical_volatility },
    },
    async ({ symbol, window }) => {
      const result = await prism.historical.getVolatility(symbol, window);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.historical_volatility }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "compare_assets",
    {
      description: "Compare multiple assets over time with normalized performance (all start at 100)",
      inputSchema: {
        symbols: z.array(z.string()).describe("Array of asset symbols to compare"),
        days: z.number().optional().describe("Number of days (default 30)"),
        metric: z.string().optional().describe("Metric to compare (default 'price')"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.compare_assets },
    },
    async ({ symbols, days, metric }) => {
      const result = await prism.historical.compare(symbols, days, metric);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ data: result, _ui: RENDER_HINTS.compare_assets }, null, 2),
        }],
      };
    }
  );
}
