import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prism } from "../client.js";
import { RENDER_HINTS } from "../render-hints.js";

export function registerStockTools(server: McpServer) {
  // ─── QUOTES ────────────────────────────────────────────

  server.registerTool(
    "get_stock_quote",
    {
      description: "Get real-time stock quote with price, change, volume, and market cap",
      inputSchema: {
        symbol: z.string().describe("Stock ticker (e.g. 'AAPL', 'TSLA', 'NVDA')"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.get_stock_quote },
    },
    async ({ symbol }) => {
      const result = await prism.stocks.getQuote(symbol);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.get_stock_quote }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_batch_stock_quotes",
    {
      description: "Get real-time quotes for multiple stocks at once",
      inputSchema: {
        symbols: z.array(z.string()).describe("Array of stock tickers"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.batch_stock_quotes },
    },
    async ({ symbols }) => {
      const result = await prism.stocks.getBatchQuotes(symbols);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ data: result, _ui: RENDER_HINTS.batch_stock_quotes }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_stock_sparkline",
    {
      description: "Get mini price chart data (sparkline) for a stock",
      inputSchema: {
        symbol: z.string().describe("Stock ticker"),
        days: z.number().optional().describe("Number of days (default 30)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.stock_sparkline },
    },
    async ({ symbol, days }) => {
      const result = await prism.stocks.getSparkline(symbol, days);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.stock_sparkline }, null, 2),
        }],
      };
    }
  );

  // ─── COMPANY DATA ──────────────────────────────────────

  server.registerTool(
    "get_stock_profile",
    {
      description: "Get company profile with name, sector, industry, description, and key stats",
      inputSchema: {
        symbol: z.string().describe("Stock ticker"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.stock_profile },
    },
    async ({ symbol }) => {
      const result = await prism.stocks.getProfile(symbol);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.stock_profile }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_stock_fundamentals",
    {
      description: "Get fundamental metrics: P/E, P/B, EPS, ROE, margins, growth rates",
      inputSchema: {
        symbol: z.string().describe("Stock ticker"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.stock_fundamentals },
    },
    async ({ symbol }) => {
      const result = await prism.stocks.getFundamentals(symbol);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.stock_fundamentals }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_stock_financials",
    {
      description: "Get financial statements: income, balance sheet, or cash flow",
      inputSchema: {
        symbol: z.string().describe("Stock ticker"),
        statement: z.enum(['income', 'balance', 'cash_flow']).optional().describe("Statement type"),
        period: z.enum(['annual', 'quarterly']).optional().describe("Reporting period"),
        limit: z.number().optional().describe("Number of periods to return"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.stock_financials },
    },
    async ({ symbol, statement, period, limit }) => {
      const result = await prism.stocks.getFinancials(symbol, { statement, period, limit });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.stock_financials }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_stock_peers",
    {
      description: "Get peer companies in the same sector/industry",
      inputSchema: {
        symbol: z.string().describe("Stock ticker"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.stock_peers },
    },
    async ({ symbol }) => {
      const result = await prism.stocks.getPeers(symbol);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ peers: result, _ui: RENDER_HINTS.stock_peers }, null, 2),
        }],
      };
    }
  );

  // ─── EARNINGS & CORPORATE ACTIONS ──────────────────────

  server.registerTool(
    "get_stock_earnings",
    {
      description: "Get historical earnings with EPS actuals vs estimates and surprises",
      inputSchema: {
        symbol: z.string().describe("Stock ticker"),
        limit: z.number().optional().describe("Number of quarters to return (default 8)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.stock_earnings },
    },
    async ({ symbol, limit }) => {
      const result = await prism.stocks.getEarnings(symbol, limit);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ earnings: result, _ui: RENDER_HINTS.stock_earnings }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_stock_dividends",
    {
      description: "Get dividend payment history with dates, amounts, and yields",
      inputSchema: {
        symbol: z.string().describe("Stock ticker"),
        limit: z.number().optional().describe("Number of dividends to return (default 20)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.stock_dividends },
    },
    async ({ symbol, limit }) => {
      const result = await prism.stocks.getDividends(symbol, limit);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ dividends: result, _ui: RENDER_HINTS.stock_dividends }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_stock_splits",
    {
      description: "Get stock split history with dates and ratios",
      inputSchema: {
        symbol: z.string().describe("Stock ticker"),
        limit: z.number().optional().describe("Number of splits to return (default 10)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.stock_splits },
    },
    async ({ symbol, limit }) => {
      const result = await prism.stocks.getSplits(symbol, limit);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ splits: result, _ui: RENDER_HINTS.stock_splits }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_stock_filings",
    {
      description: "Get SEC filings (10-K, 10-Q, 8-K, proxy statements)",
      inputSchema: {
        symbol: z.string().describe("Stock ticker"),
        filing_type: z.string().optional().describe("Filing type filter (e.g. '10-K', '10-Q', '8-K')"),
        limit: z.number().optional().describe("Number of filings to return"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.stock_filings },
    },
    async ({ symbol, filing_type, limit }) => {
      const result = await prism.stocks.getFilings(symbol, { filing_type, limit });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ filings: result, _ui: RENDER_HINTS.stock_filings }, null, 2),
        }],
      };
    }
  );

  // ─── OWNERSHIP ─────────────────────────────────────────

  server.registerTool(
    "get_insider_trades",
    {
      description: "Get insider trading activity (Form 4 filings)",
      inputSchema: {
        symbol: z.string().describe("Stock ticker"),
        limit: z.number().optional().describe("Number of trades to return (default 20)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.insider_trades },
    },
    async ({ symbol, limit }) => {
      const result = await prism.stocks.getInsiders(symbol, limit);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ insider_trades: result, _ui: RENDER_HINTS.insider_trades }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_institutional_holders",
    {
      description: "Get institutional ownership data from 13F filings",
      inputSchema: {
        symbol: z.string().describe("Stock ticker"),
        limit: z.number().optional().describe("Number of institutions to return (default 20)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.institutional_holders },
    },
    async ({ symbol, limit }) => {
      const result = await prism.stocks.getInstitutional(symbol, limit);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ institutions: result, _ui: RENDER_HINTS.institutional_holders }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_analyst_ratings",
    {
      description: "Get analyst buy/hold/sell ratings and price targets",
      inputSchema: {
        symbol: z.string().describe("Stock ticker"),
        limit: z.number().optional().describe("Number of ratings to return (default 20)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.analyst_ratings },
    },
    async ({ symbol, limit }) => {
      const result = await prism.stocks.getAnalystRatings(symbol, limit);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.analyst_ratings }, null, 2),
        }],
      };
    }
  );

  // ─── VALUATION ─────────────────────────────────────────

  server.registerTool(
    "get_valuation_ratios",
    {
      description: "Get valuation multiples: P/E, P/B, EV/EBITDA, PEG, P/S ratios",
      inputSchema: {
        symbol: z.string().describe("Stock ticker"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.valuation_ratios },
    },
    async ({ symbol }) => {
      const result = await prism.stocks.getValuationRatios(symbol);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.valuation_ratios }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "calculate_dcf",
    {
      description: "Calculate DCF intrinsic value estimate with custom assumptions",
      inputSchema: {
        symbol: z.string().describe("Stock ticker"),
        growth_rate: z.number().optional().describe("Revenue growth rate (decimal, e.g. 0.15 for 15%)"),
        discount_rate: z.number().optional().describe("Discount rate / WACC (decimal)"),
        terminal_growth: z.number().optional().describe("Terminal growth rate (decimal)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.dcf_valuation },
    },
    async ({ symbol, growth_rate, discount_rate, terminal_growth }) => {
      const result = await prism.stocks.getDCF(symbol, { growth_rate, discount_rate, terminal_growth });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.dcf_valuation }, null, 2),
        }],
      };
    }
  );

  // ─── MARKET MOVERS ─────────────────────────────────────

  server.registerTool(
    "get_stock_gainers",
    {
      description: "Get top gaining stocks today by percentage change",
      inputSchema: {
        limit: z.number().optional().describe("Number of stocks to return (default 20)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.stock_gainers },
    },
    async ({ limit }) => {
      const result = await prism.stocks.getGainers(limit);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ gainers: result, _ui: RENDER_HINTS.stock_gainers }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_stock_losers",
    {
      description: "Get top losing stocks today by percentage change",
      inputSchema: {
        limit: z.number().optional().describe("Number of stocks to return (default 20)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.stock_losers },
    },
    async ({ limit }) => {
      const result = await prism.stocks.getLosers(limit);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ losers: result, _ui: RENDER_HINTS.stock_losers }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_most_active_stocks",
    {
      description: "Get most actively traded stocks by volume",
      inputSchema: {
        limit: z.number().optional().describe("Number of stocks to return (default 20)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.most_active_stocks },
    },
    async ({ limit }) => {
      const result = await prism.stocks.getMostActive(limit);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ most_active: result, _ui: RENDER_HINTS.most_active_stocks }, null, 2),
        }],
      };
    }
  );

  // ─── INDEXES ───────────────────────────────────────────

  server.registerTool(
    "get_market_indexes",
    {
      description: "Get all major market indexes (SPX, DJIA, NDX, VIX, etc.)",
      inputSchema: {},
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.market_indexes },
    },
    async () => {
      const result = await prism.stocks.getIndexes();
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ indexes: result, _ui: RENDER_HINTS.market_indexes }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_sector_performance",
    {
      description: "Get sector performance (GICS sectors)",
      inputSchema: {},
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.sector_performance },
    },
    async () => {
      const result = await prism.stocks.getSectors();
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ sectors: result, _ui: RENDER_HINTS.sector_performance }, null, 2),
        }],
      };
    }
  );
}
