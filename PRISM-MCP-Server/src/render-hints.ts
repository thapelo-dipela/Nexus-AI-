/**
 * PRISM Render Hints — UI metadata for every MCP tool.
 *
 * Agents read these hints from `_meta['x-prism-ui']` (tool listing)
 * or `_ui` (embedded in the JSON response payload) and use them to
 * pick the right @prismapi/ui component, layout, and companion tools.
 */

export interface PrismRenderHint {
  /** Primary @prismapi/ui component to render the result */
  suggestedComponent: string;
  /** Chart type when the component supports multiple visualizations */
  chartType?: string;
  /** Recommended layout slot: card | table | grid | dashboard */
  layout: 'card' | 'table' | 'grid' | 'dashboard';
  /** Which response fields to emphasize in a summary view */
  highlightFields?: string[];
  /** Tool names that pair well in a dashboard composition */
  pairedWith?: string[];
  /** Copy-paste code example using @prismapi/ui */
  exampleCode?: string;
  /** Dashboard templates this data feeds into */
  dashboardTemplates?: string[];
}

export const RENDER_HINTS: Record<string, PrismRenderHint> = {
  resolve_asset: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'card',
    highlightFields: ['symbol', 'name', 'asset_type', 'price', 'confidence'],
    pairedWith: ['get_price', 'technical_analysis'],
    exampleCode: `<PrismMetricCard title={result.symbol} value={result.price} subtitle={result.name} />`,
    dashboardTemplates: ['equity-overview', 'crypto-trader'],
  },

  batch_resolve: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['symbol', 'name', 'asset_type', 'price'],
    pairedWith: ['get_price'],
    exampleCode: `<PrismStockTable data={results} />`,
  },

  get_price: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'card',
    highlightFields: ['symbol', 'price', 'change_24h', 'volume_24h', 'market_cap'],
    pairedWith: ['technical_analysis', 'social_sentiment', 'get_news'],
    exampleCode: `<PrismMetricCard title={result.symbol} value={result.price} change={result.change_24h} />`,
    dashboardTemplates: ['crypto-trader', 'portfolio-tracker'],
  },

  get_trending: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['symbol', 'name', 'price', 'change_pct_24h', 'volume_24h'],
    pairedWith: ['get_price', 'social_sentiment'],
    exampleCode: `<PrismStockTable data={results} />`,
    dashboardTemplates: ['crypto-trader'],
  },

  market_overview: {
    suggestedComponent: 'PrismFearGreed',
    layout: 'dashboard',
    highlightFields: ['total_market_cap', 'btc_dominance', 'fear_greed.value', 'fear_greed.classification'],
    pairedWith: ['get_trending', 'get_news'],
    exampleCode: `<PrismFearGreed value={result.fear_greed.value} label={result.fear_greed.classification} />`,
    dashboardTemplates: ['crypto-trader'],
  },

  get_stock_quote: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'card',
    highlightFields: ['symbol', 'price', 'change', 'change_pct', 'volume', 'market_cap'],
    pairedWith: ['technical_analysis', 'get_news', 'get_risk'],
    exampleCode: `<PrismMetricCard title={quote.symbol} value={quote.price} change={quote.change_pct} />`,
    dashboardTemplates: ['equity-overview'],
  },

  get_yields: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['pool', 'protocol', 'chain', 'apy', 'tvl_usd'],
    pairedWith: ['get_protocols', 'get_gas'],
    exampleCode: `<PrismStockTable data={yields} />`,
  },

  get_protocols: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['name', 'category', 'chain', 'tvl', 'change_1d'],
    pairedWith: ['get_yields'],
    exampleCode: `<PrismStockTable data={protocols} />`,
  },

  get_gas: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['chain', 'slow', 'standard', 'fast'],
    pairedWith: ['get_protocols'],
    exampleCode: `<PrismStockTable data={gas} />`,
  },

  whale_movements: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['tx_hash', 'from', 'to', 'value_usd', 'type'],
    pairedWith: ['exchange_flows', 'social_sentiment'],
    exampleCode: `<PrismStockTable data={movements} />`,
    dashboardTemplates: ['crypto-trader'],
  },

  exchange_flows: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'card',
    highlightFields: ['inflow', 'outflow', 'net_flow'],
    pairedWith: ['whale_movements', 'get_price'],
    exampleCode: `<PrismMetricCard title="Net Flow" value={flow.net_flow} />`,
    dashboardTemplates: ['crypto-trader'],
  },

  wallet_balances: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['token', 'symbol', 'balance', 'value_usd'],
    pairedWith: ['get_price'],
    exampleCode: `<PrismStockTable data={balances} />`,
    dashboardTemplates: ['portfolio-tracker'],
  },

  technical_analysis: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'card',
    highlightFields: ['symbol', 'trend', 'rsi', 'summary'],
    pairedWith: ['get_signals', 'get_risk', 'get_price'],
    exampleCode: `<PrismMetricCard title={ta.symbol} value={ta.trend} subtitle={ta.summary} />`,
    dashboardTemplates: ['equity-overview', 'crypto-trader'],
  },

  get_signals: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['symbol', 'signal_type', 'direction', 'strength'],
    pairedWith: ['technical_analysis'],
    exampleCode: `<PrismStockTable data={signals} />`,
  },

  get_risk: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'card',
    highlightFields: ['symbol', 'volatility', 'sharpe_ratio', 'max_drawdown', 'var'],
    pairedWith: ['technical_analysis', 'get_price'],
    exampleCode: `<PrismMetricCard title={risk.symbol} value={risk.sharpe_ratio} subtitle="Sharpe Ratio" />`,
    dashboardTemplates: ['equity-overview', 'portfolio-tracker'],
  },

  get_news: {
    suggestedComponent: 'PrismNewsCard',
    layout: 'grid',
    highlightFields: ['title', 'source', 'sentiment', 'published_at'],
    pairedWith: ['social_sentiment', 'get_price'],
    exampleCode: `<PrismNewsGrid items={news} />`,
    dashboardTemplates: ['equity-overview', 'crypto-trader'],
  },

  social_sentiment: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'card',
    highlightFields: ['sentiment_score', 'label', 'bullish_pct', 'bearish_pct'],
    pairedWith: ['get_news', 'get_price', 'whale_movements'],
    exampleCode: `<PrismMetricCard title="Sentiment" value={s.sentiment_score} subtitle={s.label} />`,
    dashboardTemplates: ['crypto-trader'],
  },

  prediction_markets: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['title', 'source', 'yes_price', 'volume'],
    pairedWith: ['search_predictions'],
    exampleCode: `<PrismStockTable data={markets} />`,
  },

  search_predictions: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['title', 'source', 'yes_price', 'volume'],
    pairedWith: ['prediction_markets'],
    exampleCode: `<PrismStockTable data={results} />`,
  },

  macro_summary: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'dashboard',
    highlightFields: ['fed_rate', 'inflation', 'gdp', 'unemployment'],
    pairedWith: ['get_news'],
    exampleCode: `<PrismMetricCard title="Fed Rate" value={macro.fed_rate} />`,
  },

  api_health: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'card',
    highlightFields: ['status', 'uptime', 'latency'],
    exampleCode: `<PrismMetricCard title="API Health" value={health.status} />`,
  },

  // ─── STOCKS ────────────────────────────────────────────

  batch_stock_quotes: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['symbol', 'price', 'change', 'change_pct', 'volume'],
    pairedWith: ['get_stock_quote'],
    exampleCode: `<PrismStockTable data={quotes} />`,
  },

  stock_sparkline: {
    suggestedComponent: 'PrismSparkline',
    layout: 'card',
    chartType: 'line',
    highlightFields: ['prices'],
    exampleCode: `<PrismSparkline data={sparkline.prices} />`,
  },

  stock_profile: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'card',
    highlightFields: ['name', 'sector', 'industry', 'description', 'market_cap'],
    pairedWith: ['get_stock_fundamentals', 'get_stock_quote'],
    exampleCode: `<PrismMetricCard title={profile.name} subtitle={profile.sector} />`,
    dashboardTemplates: ['equity-overview'],
  },

  stock_fundamentals: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'dashboard',
    highlightFields: ['pe_ratio', 'pb_ratio', 'eps', 'roe', 'profit_margin'],
    pairedWith: ['stock_profile', 'valuation_ratios'],
    exampleCode: `<PrismMetricCard title="P/E Ratio" value={fundamentals.pe_ratio} />`,
    dashboardTemplates: ['equity-overview'],
  },

  stock_financials: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['date', 'revenue', 'net_income', 'eps', 'assets', 'liabilities'],
    pairedWith: ['stock_fundamentals'],
    exampleCode: `<PrismStockTable data={financials} />`,
  },

  stock_peers: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['symbol', 'name'],
    pairedWith: ['get_stock_quote'],
    exampleCode: `<PrismStockTable data={peers} />`,
  },

  stock_earnings: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['date', 'eps_actual', 'eps_estimate', 'surprise_pct'],
    pairedWith: ['stock_fundamentals'],
    exampleCode: `<PrismStockTable data={earnings} />`,
    dashboardTemplates: ['equity-overview'],
  },

  stock_dividends: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['ex_date', 'amount', 'yield'],
    exampleCode: `<PrismStockTable data={dividends} />`,
  },

  stock_splits: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['date', 'ratio'],
    exampleCode: `<PrismStockTable data={splits} />`,
  },

  stock_filings: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['type', 'date', 'description'],
    exampleCode: `<PrismStockTable data={filings} />`,
  },

  insider_trades: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['name', 'transaction_type', 'shares', 'value', 'date'],
    pairedWith: ['institutional_holders'],
    exampleCode: `<PrismStockTable data={insider_trades} />`,
  },

  institutional_holders: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['institution', 'shares', 'value', 'pct_outstanding'],
    pairedWith: ['insider_trades'],
    exampleCode: `<PrismStockTable data={institutions} />`,
  },

  analyst_ratings: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'card',
    highlightFields: ['consensus', 'avg_target', 'ratings'],
    pairedWith: ['stock_fundamentals'],
    exampleCode: `<PrismMetricCard title="Consensus" value={ratings.consensus} />`,
    dashboardTemplates: ['equity-overview'],
  },

  valuation_ratios: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'dashboard',
    highlightFields: ['pe_ratio', 'pb_ratio', 'ev_ebitda', 'peg_ratio', 'ps_ratio'],
    pairedWith: ['stock_fundamentals', 'dcf_valuation'],
    exampleCode: `<PrismMetricCard title="P/E" value={ratios.pe_ratio} />`,
    dashboardTemplates: ['equity-overview'],
  },

  dcf_valuation: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'card',
    highlightFields: ['intrinsic_value', 'current_price', 'upside_pct'],
    pairedWith: ['valuation_ratios'],
    exampleCode: `<PrismMetricCard title="Intrinsic Value" value={dcf.intrinsic_value} />`,
    dashboardTemplates: ['equity-overview'],
  },

  stock_gainers: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['symbol', 'name', 'price', 'change_pct', 'volume'],
    pairedWith: ['stock_losers', 'most_active_stocks'],
    exampleCode: `<PrismStockTable data={gainers} />`,
    dashboardTemplates: ['equity-overview'],
  },

  stock_losers: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['symbol', 'name', 'price', 'change_pct', 'volume'],
    pairedWith: ['stock_gainers'],
    exampleCode: `<PrismStockTable data={losers} />`,
    dashboardTemplates: ['equity-overview'],
  },

  most_active_stocks: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['symbol', 'name', 'price', 'volume'],
    pairedWith: ['stock_gainers'],
    exampleCode: `<PrismStockTable data={most_active} />`,
  },

  market_indexes: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['symbol', 'name', 'value', 'change'],
    pairedWith: ['sector_performance'],
    exampleCode: `<PrismStockTable data={indexes} />`,
    dashboardTemplates: ['equity-overview'],
  },

  sector_performance: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['sector', 'performance'],
    pairedWith: ['market_indexes'],
    exampleCode: `<PrismStockTable data={sectors} />`,
    dashboardTemplates: ['equity-overview'],
  },

  // ─── ETFS & FOREX & COMMODITIES ───────────────────────

  popular_etfs: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['symbol', 'name'],
    pairedWith: ['etf_holdings'],
    exampleCode: `<PrismStockTable data={etfs} />`,
  },

  etf_holdings: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['symbol', 'name', 'weight', 'shares'],
    pairedWith: ['etf_sectors'],
    exampleCode: `<PrismStockTable data={holdings} />`,
  },

  etf_sectors: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['sector', 'weight'],
    pairedWith: ['etf_holdings'],
    exampleCode: `<PrismStockTable data={sectors} />`,
  },

  forex_pairs: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['pair', 'rate', 'change'],
    pairedWith: ['forex_tradeable'],
    exampleCode: `<PrismStockTable data={pairs} />`,
  },

  forex_tradeable: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['form', 'ticker', 'venue'],
    exampleCode: `<PrismStockTable data={tradeable_forms} />`,
  },

  commodity_prices: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['commodity', 'price', 'change'],
    pairedWith: ['commodity_tradeable'],
    exampleCode: `<PrismStockTable data={commodities} />`,
  },

  commodity_tradeable: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['form', 'ticker', 'venue'],
    exampleCode: `<PrismStockTable data={tradeable_forms} />`,
  },

  // ─── HISTORICAL ────────────────────────────────────────

  historical_prices: {
    suggestedComponent: 'PrismChart',
    layout: 'card',
    chartType: 'candlestick',
    highlightFields: ['date', 'open', 'high', 'low', 'close', 'volume'],
    pairedWith: ['historical_volume', 'returns'],
    exampleCode: `<PrismChart type="candlestick" data={prices} />`,
    dashboardTemplates: ['equity-overview', 'crypto-trader'],
  },

  historical_volume: {
    suggestedComponent: 'PrismChart',
    layout: 'card',
    chartType: 'bar',
    highlightFields: ['date', 'volume'],
    pairedWith: ['historical_prices'],
    exampleCode: `<PrismChart type="bar" data={volume} />`,
  },

  historical_metrics: {
    suggestedComponent: 'PrismChart',
    layout: 'card',
    chartType: 'line',
    highlightFields: ['date', 'price', 'volume', 'market_cap'],
    exampleCode: `<PrismChart type="line" data={metrics} />`,
  },

  returns: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'dashboard',
    highlightFields: ['1d', '7d', '30d', '1y'],
    pairedWith: ['historical_prices'],
    exampleCode: `<PrismMetricCard title="30d Return" value={returns['30d']} />`,
  },

  historical_volatility: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'card',
    highlightFields: ['volatility', 'annualized'],
    pairedWith: ['get_risk'],
    exampleCode: `<PrismMetricCard title="Volatility" value={vol.volatility} />`,
  },

  compare_assets: {
    suggestedComponent: 'PrismChart',
    layout: 'card',
    chartType: 'line',
    highlightFields: ['normalized performance'],
    pairedWith: ['correlations'],
    exampleCode: `<PrismChart type="line" data={comparison} />`,
  },

  // ─── CALENDAR ──────────────────────────────────────────

  earnings_calendar: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['symbol', 'date', 'time', 'eps_estimate'],
    pairedWith: ['stock_earnings'],
    exampleCode: `<PrismStockTable data={earnings} />`,
  },

  earnings_week: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['symbol', 'date', 'time', 'eps_estimate'],
    pairedWith: ['earnings_calendar'],
    exampleCode: `<PrismStockTable data={earnings} />`,
  },

  economic_calendar: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['event', 'date', 'forecast', 'previous', 'actual'],
    pairedWith: ['macro_summary'],
    exampleCode: `<PrismStockTable data={events} />`,
  },

  // ─── TECHNICALS & SIGNALS & RISK ──────────────────────

  technical_indicators: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'dashboard',
    highlightFields: ['RSI', 'MACD', 'EMA20', 'SMA50'],
    pairedWith: ['technical_analysis'],
    exampleCode: `<PrismMetricCard title="RSI" value={indicators.RSI} />`,
  },

  support_resistance: {
    suggestedComponent: 'PrismChart',
    layout: 'card',
    chartType: 'line',
    highlightFields: ['support_levels', 'resistance_levels'],
    pairedWith: ['technical_analysis'],
    exampleCode: `<PrismChart type="line" data={levels} />`,
  },

  trend: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'card',
    highlightFields: ['trend', 'strength'],
    pairedWith: ['technical_analysis'],
    exampleCode: `<PrismMetricCard title="Trend" value={trend.trend} />`,
  },

  forex_technicals: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'card',
    highlightFields: ['trend', 'rsi', 'macd'],
    pairedWith: ['forex_pairs'],
    exampleCode: `<PrismMetricCard title="FX Trend" value={ta.trend} />`,
  },

  commodity_technicals: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'card',
    highlightFields: ['trend', 'rsi', 'macd'],
    pairedWith: ['commodity_prices'],
    exampleCode: `<PrismMetricCard title="Commodity Trend" value={ta.trend} />`,
  },

  benchmark_compare: {
    suggestedComponent: 'PrismChart',
    layout: 'card',
    chartType: 'line',
    highlightFields: ['relative_performance'],
    exampleCode: `<PrismChart type="line" data={comparison} />`,
  },

  correlations: {
    suggestedComponent: 'PrismHeatmap',
    layout: 'card',
    highlightFields: ['correlation_matrix'],
    pairedWith: ['compare_assets'],
    exampleCode: `<PrismHeatmap data={correlations} />`,
  },

  volume_spikes: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['symbol', 'spike_ratio', 'current_volume', 'avg_volume'],
    pairedWith: ['get_signals', 'breakouts'],
    exampleCode: `<PrismStockTable data={spikes} />`,
  },

  breakouts: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['symbol', 'direction', 'breakout_level', 'current_price'],
    pairedWith: ['get_signals'],
    exampleCode: `<PrismStockTable data={breakouts} />`,
  },

  divergence: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['symbol', 'divergence_type', 'strength'],
    pairedWith: ['get_signals'],
    exampleCode: `<PrismStockTable data={divergences} />`,
  },

  signal_summary: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'dashboard',
    highlightFields: ['momentum', 'volume', 'breakout', 'divergence'],
    pairedWith: ['get_signals'],
    exampleCode: `<PrismMetricCard title="Signals" value={summary} />`,
  },

  var_calculation: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'card',
    highlightFields: ['var', 'confidence'],
    pairedWith: ['get_risk'],
    exampleCode: `<PrismMetricCard title="Value at Risk" value={var.var} />`,
  },

  portfolio_risk: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'dashboard',
    highlightFields: ['portfolio_var', 'sharpe_ratio', 'max_drawdown'],
    pairedWith: ['get_risk'],
    exampleCode: `<PrismMetricCard title="Portfolio VaR" value={risk.portfolio_var} />`,
    dashboardTemplates: ['portfolio-tracker'],
  },

  // ─── ORDERBOOK & TRADES ────────────────────────────────

  orderbook: {
    suggestedComponent: 'PrismOrderBook',
    layout: 'card',
    highlightFields: ['bids', 'asks'],
    pairedWith: ['orderbook_depth', 'spread'],
    exampleCode: `<PrismOrderBook bids={ob.bids} asks={ob.asks} />`,
    dashboardTemplates: ['crypto-trader'],
  },

  orderbook_depth: {
    suggestedComponent: 'PrismChart',
    layout: 'card',
    chartType: 'area',
    highlightFields: ['depth'],
    pairedWith: ['orderbook'],
    exampleCode: `<PrismChart type="area" data={depth} />`,
  },

  spread: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'card',
    highlightFields: ['spread', 'spread_pct'],
    pairedWith: ['orderbook'],
    exampleCode: `<PrismMetricCard title="Spread" value={spread.spread_pct} />`,
  },

  imbalance: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'card',
    highlightFields: ['imbalance', 'bid_volume', 'ask_volume'],
    pairedWith: ['orderbook'],
    exampleCode: `<PrismMetricCard title="Imbalance" value={imb.imbalance} />`,
  },

  recent_trades: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['time', 'price', 'amount', 'side'],
    pairedWith: ['large_trades'],
    exampleCode: `<PrismStockTable data={trades} />`,
  },

  large_trades: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['time', 'price', 'amount', 'value_usd'],
    pairedWith: ['recent_trades', 'whale_movements'],
    exampleCode: `<PrismStockTable data={large_trades} />`,
    dashboardTemplates: ['crypto-trader'],
  },

  // ─── SOCIAL ────────────────────────────────────────────

  social_mentions: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'card',
    highlightFields: ['total', 'change_24h'],
    pairedWith: ['social_sentiment'],
    exampleCode: `<PrismMetricCard title="Mentions" value={mentions.total} />`,
  },

  trending_score: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'card',
    highlightFields: ['score', 'rank'],
    pairedWith: ['social_sentiment'],
    exampleCode: `<PrismMetricCard title="Trending Score" value={ts.score} />`,
  },

  github_activity: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'dashboard',
    highlightFields: ['commits', 'contributors', 'stars'],
    pairedWith: ['social_sentiment'],
    exampleCode: `<PrismMetricCard title="Commits" value={gh.commits} />`,
  },

  trending_social: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['symbol', 'score'],
    pairedWith: ['social_sentiment'],
    exampleCode: `<PrismStockTable data={trending} />`,
  },

  // ─── SPORTS & ODDS ─────────────────────────────────────

  list_sports: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['sport', 'name', 'active'],
    pairedWith: ['sports_events'],
    exampleCode: `<PrismStockTable data={sports} />`,
  },

  sports_events: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['event', 'date', 'status'],
    pairedWith: ['event_details', 'event_odds'],
    exampleCode: `<PrismStockTable data={events} />`,
  },

  event_details: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'card',
    highlightFields: ['event', 'date', 'teams', 'venue'],
    pairedWith: ['event_odds'],
    exampleCode: `<PrismMetricCard title={event.event} />`,
  },

  event_odds: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['bookmaker', 'market', 'odds'],
    pairedWith: ['compare_odds'],
    exampleCode: `<PrismStockTable data={odds} />`,
  },

  resolve_sports: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'card',
    highlightFields: ['event'],
    pairedWith: ['event_details'],
    exampleCode: `<PrismMetricCard title={event.event} />`,
  },

  search_sports: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['event', 'date', 'sport'],
    pairedWith: ['sports_events'],
    exampleCode: `<PrismStockTable data={events} />`,
  },

  sportsbooks: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['name'],
    exampleCode: `<PrismStockTable data={sportsbooks} />`,
  },

  find_arbitrage: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['event', 'profit_pct', 'stake_required'],
    pairedWith: ['event_arbitrage'],
    exampleCode: `<PrismStockTable data={opportunities} />`,
  },

  event_arbitrage: {
    suggestedComponent: 'PrismMetricCard',
    layout: 'card',
    highlightFields: ['profit_pct', 'stake_required'],
    pairedWith: ['find_arbitrage'],
    exampleCode: `<PrismMetricCard title="Profit %" value={arb.profit_pct} />`,
  },

  compare_odds: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['bookmaker', 'odds'],
    pairedWith: ['event_odds'],
    exampleCode: `<PrismStockTable data={comparison} />`,
  },

  odds_history: {
    suggestedComponent: 'PrismChart',
    layout: 'card',
    chartType: 'line',
    highlightFields: ['date', 'odds'],
    pairedWith: ['compare_odds'],
    exampleCode: `<PrismChart type="line" data={history} />`,
  },

  best_odds: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['event', 'bookmaker', 'odds'],
    pairedWith: ['compare_odds'],
    exampleCode: `<PrismStockTable data={odds} />`,
  },

  odds_platforms: {
    suggestedComponent: 'PrismStockTable',
    layout: 'table',
    highlightFields: ['name', 'type'],
    exampleCode: `<PrismStockTable data={platforms} />`,
  },
};
