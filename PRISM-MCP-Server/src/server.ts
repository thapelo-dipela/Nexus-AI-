import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerResolutionTools } from "./tools/resolution.js";
import { registerMarketTools } from "./tools/market.js";
import { registerDefiTools } from "./tools/defi.js";
import { registerOnchainTools } from "./tools/onchain.js";
import { registerAnalysisTools } from "./tools/analysis.js";
import { registerNewsTools } from "./tools/news.js";
import { registerPredictionTools } from "./tools/predictions.js";
import { registerMacroTools } from "./tools/macro.js";
import { registerDeveloperTools } from "./tools/developer.js";
import { registerScaffoldTools } from "./tools/scaffold.js";
// New tool modules
import { registerStockTools } from "./tools/stocks.js";
import { registerETFTools } from "./tools/etfs.js";
import { registerForexTools } from "./tools/forex.js";
import { registerCommodityTools } from "./tools/commodities.js";
import { registerHistoricalTools } from "./tools/historical.js";
import { registerCalendarTools } from "./tools/calendar.js";
import { registerTechnicalsTools } from "./tools/technicals.js";
import { registerSignalsTools } from "./tools/signals.js";
import { registerRiskTools } from "./tools/risk.js";
import { registerOrderBookTools } from "./tools/orderbook.js";
import { registerTradesTools } from "./tools/trades.js";
import { registerSocialTools } from "./tools/social.js";
import { registerSportsTools } from "./tools/sports.js";
import { registerOddsTools } from "./tools/odds.js";
import { registerResources } from "./resources.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "prism-os",
    version: "2.0.0",
  });

  // Original tools (21 tools)
  registerResolutionTools(server);
  registerMarketTools(server);
  registerDefiTools(server);
  registerOnchainTools(server);
  registerAnalysisTools(server);
  registerNewsTools(server);
  registerPredictionTools(server);
  registerMacroTools(server);
  registerDeveloperTools(server);
  registerScaffoldTools(server);

  // New tools (80+ tools)
  registerStockTools(server);
  registerETFTools(server);
  registerForexTools(server);
  registerCommodityTools(server);
  registerHistoricalTools(server);
  registerCalendarTools(server);
  registerTechnicalsTools(server);
  registerSignalsTools(server);
  registerRiskTools(server);
  registerOrderBookTools(server);
  registerTradesTools(server);
  registerSocialTools(server);
  registerSportsTools(server);
  registerOddsTools(server);

  // MCP Resources (20+ resources)
  registerResources(server);

  return server;
}
