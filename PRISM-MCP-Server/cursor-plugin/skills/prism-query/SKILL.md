# PRISM Data Query Skill

Query PRISM API for real-time financial data across crypto, stocks, DeFi, macro, predictions, sports, and more.

## When to Use This Skill

Use this skill whenever you need:
- Real-time price data for crypto or stocks
- Market intelligence (trending assets, gainers/losers, market overview)
- Financial fundamentals (earnings, dividends, analyst ratings, valuation)
- Technical analysis (RSI, MACD, support/resistance, signals)
- Risk metrics (volatility, VaR, Sharpe ratio, portfolio risk)
- DeFi data (yields, TVL, stablecoins, gas prices)
- Onchain data (whale movements, exchange flows, holder distribution)
- Macro indicators (Fed rate, inflation, GDP, treasury yields)
- Prediction markets (Polymarket, Kalshi, Manifold)
- Sports betting (live scores, odds comparison, arbitrage)

## Available Domains

### Resolution
Canonical asset identity resolution across chains and exchanges
- `resolve_asset` - Resolve any ticker/name/address to canonical ID
- `batch_resolve` - Bulk resolution

### Crypto
Prices, market data, trending tokens
- `get_price` - Consensus crypto price
- `get_trending` - Trending crypto assets
- `market_overview` - Full market snapshot
- `get_crypto_gainers`, `get_crypto_losers` - Top movers

### Stocks
Quotes, fundamentals, earnings, ratings
- `get_stock_quote` - Real-time stock quote
- `get_stock_profile` - Company profile
- `get_stock_fundamentals` - Key metrics (P/E, ROE, margins)
- `get_stock_financials` - Income, balance, cash flow
- `get_stock_earnings` - Historical earnings
- `get_insider_trades`, `get_institutional_holders` - Ownership
- `get_analyst_ratings` - Buy/hold/sell ratings
- `calculate_dcf` - DCF intrinsic value
- `get_stock_gainers`, `get_stock_losers`, `get_most_active_stocks` - Market movers

### ETFs, Forex, Commodities
- `get_popular_etfs`, `get_etf_holdings`, `get_etf_sector_weights`
- `get_forex_pairs`, `get_forex_tradeable_forms`
- `get_commodity_prices`, `get_commodity_tradeable_forms`

### DeFi & Onchain
TVL, yields, gas, wallet balances, whale tracking
- `get_defi_yields` - Top yield opportunities
- `get_protocols` - DeFi protocols with TVL
- `get_gas` - Gas prices across all chains
- `get_wallet_balances` - All token balances for a wallet
- `whale_movements` - Large whale transactions
- `exchange_flows` - Exchange inflow/outflow

### Historical
OHLCV, volume, returns, volatility
- `get_historical_prices` - OHLCV data
- `get_returns` - Period returns (1d, 7d, 30d, 1y)
- `get_historical_volatility` - Rolling volatility
- `compare_assets` - Relative performance

### Calendar
- `get_earnings_calendar`, `get_earnings_this_week` - Earnings reports
- `get_economic_calendar` - FOMC, CPI, GDP, jobs reports

### Technicals & Signals
RSI, MACD, support/resistance, momentum, breakouts
- `technical_analysis` - Full TA (trend, RSI, MACD, MAs)
- `get_technical_indicators` - Specific indicators
- `get_support_resistance` - Key price levels
- `get_signals` - Trading signals (momentum, volume, breakout)
- `detect_volume_spikes`, `detect_breakouts`, `detect_divergence`

### Risk
Volatility, VaR, Sharpe, portfolio risk
- `get_risk` - Volatility, Sharpe, max drawdown, beta
- `calculate_var` - Value at Risk
- `analyze_portfolio_risk` - Portfolio-level risk

### Order Book & Trades
- `get_orderbook`, `get_orderbook_depth`, `get_bid_ask_spread`, `get_orderbook_imbalance`
- `get_recent_trades`, `get_large_trades`

### Social
Sentiment, mentions, GitHub activity
- `social_sentiment` - Bullish/bearish sentiment
- `get_social_mentions`, `get_trending_score`
- `get_github_activity` - Commits, stars, contributors

### Macro
Fed rate, inflation, GDP, unemployment, treasury yields
- `macro_summary` - Full macro dashboard
- Individual series: `get_fed_rate`, `get_inflation`, `get_treasury_yields`, `get_gdp`, `get_unemployment`

### News
- `get_news` - Latest crypto/stock news with sentiment

### Predictions
Polymarket, Kalshi, Manifold
- `prediction_markets`, `search_predictions` - Market discovery
- `get_trending_predictions` - Trending markets

### Sports & Odds
Live scores, odds comparison, arbitrage
- `list_sports`, `get_sports_events`, `get_event_details`, `get_event_odds`
- `find_arbitrage`, `compare_odds`, `get_best_odds`

### Developer
- `api_health` - Check API status

## Usage Examples

Just ask natural language questions:

**Crypto:**
- "What's the price of Bitcoin?"
- "Show me the trending crypto assets"
- "Get the market overview with fear & greed index"

**Stocks:**
- "Get AAPL stock quote"
- "Show me the fundamentals for Tesla"
- "What are the latest insider trades for NVDA?"
- "Calculate DCF valuation for Microsoft"

**DeFi:**
- "Show me the top DeFi yields on Arbitrum with at least 10% APY"
- "What are the current gas prices?"
- "Get the wallet balances for 0x..."

**Technical Analysis:**
- "Run technical analysis on ETH on the 4h timeframe"
- "Get RSI and MACD for AAPL"
- "Detect volume spikes and breakouts"

**Risk:**
- "Calculate portfolio risk for my positions: 50% BTC, 30% ETH, 20% SOL"
- "Get the Value at Risk for TSLA with 95% confidence"

**Macro:**
- "Get the macro summary — are we in an inverted yield curve?"
- "What's the current Fed rate?"

**Predictions:**
- "What are the trending prediction markets?"
- "Search for markets about the 2024 election"

**Sports:**
- "Show me tonight's NBA games"
- "Find arbitrage opportunities in NFL betting"

## Best Practices

1. **Be specific with symbols:** Use tickers (BTC, AAPL, ETH) or canonical IDs when available
2. **Use filters:** Most tools support filtering by chain, timeframe, limit, etc.
3. **Combine tools:** Pair technical analysis with risk metrics, or price data with social sentiment
4. **Leverage resources:** For frequently accessed data, check MCP resources first (e.g., `prism://market/overview`)
5. **Cache awareness:** Prices are cached for 10-15s, fundamentals for 1h, static data for 24h

## Resources (Passive Data Access)

Access frequently-used data without tool invocation:
- `prism://market/overview` - Market snapshot
- `prism://gas/prices` - Gas prices
- `prism://macro/summary` - Macro dashboard
- `prism://news/crypto`, `prism://news/stocks` - Latest news
- `prism://stocks/gainers`, `prism://stocks/losers` - Market movers
- And 20+ more...
