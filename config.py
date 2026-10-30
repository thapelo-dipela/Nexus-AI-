"""
NEXUS Configuration — all env vars, defaults, and constants.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env", override=False)

# PRISM Configuration
PRISM_API_KEY = os.getenv("PRISM_API_KEY", "")
PRISM_API_BASE_URL = "https://api.prismapi.ai"
PRISM_SYMBOL = os.getenv("PRISM_SYMBOL", "BTC")
PRISM_OHLCV_INTERVAL = int(os.getenv("PRISM_OHLCV_INTERVAL", "60"))  # minutes

# PRISM Cache TTLs (seconds)
PRISM_CACHE_TTL_RESOLVE = 3600  # 1 hour
PRISM_CACHE_TTL_PRICE = 15  # 15 seconds
PRISM_CACHE_TTL_SIGNALS = 180  # 3 minutes (increased from 2m to reduce API calls)
PRISM_CACHE_TTL_RISK = 300  # 5 minutes

# PRISM Risk Thresholds
PRISM_RISK_VETO_THRESHOLD = float(os.getenv("PRISM_RISK_VETO_THRESHOLD", "75"))

# Kraken Configuration
KRAKEN_CLI_PATH = os.getenv("KRAKEN_CLI_PATH", "kraken")
PAIR = os.getenv("NEXUS_PAIR", "XXBTZUSD")

# Kraken API (read-only for lablab.ai competition leaderboard)
KRAKEN_API_KEY = os.getenv("KRAKEN_API_KEY", "")
KRAKEN_API_SECRET = os.getenv("KRAKEN_API_SECRET", "")
KRAKEN_SUBMISSION_ENABLED = os.getenv("KRAKEN_SUBMISSION_ENABLED", "false").lower() == "true"

# Loop Configuration
LOOP_INTERVAL_SECONDS = int(os.getenv("NEXUS_LOOP_INTERVAL", "300"))

# Risk Limits
MAX_DRAWDOWN_PCT = float(os.getenv("MAX_DRAWDOWN_PCT", "5.0"))
MAX_POSITION_PCT = float(os.getenv("MAX_POSITION_PCT", "20.0"))
VOLATILITY_THRESHOLD = float(os.getenv("VOLATILITY_THRESHOLD", "0.04"))

# Position Sizing
RISK_PCT_PER_TRADE = float(os.getenv("RISK_PCT_PER_TRADE", "0.01"))
MIN_TRADE_SIZE_USD = float(os.getenv("MIN_TRADE_SIZE_USD", "10.0"))
MAX_TRADE_SIZE_USD = float(os.getenv("MAX_TRADE_SIZE_USD", "500.0"))

# Risk-Adjusted Returns & Compliance (Hackathon Standards)
MAX_LEVERAGE = float(os.getenv("MAX_LEVERAGE", "3.0"))
MIN_VOLUME_24H_USD = float(os.getenv("MIN_VOLUME_24H_USD", "1e9"))  # 1B minimum
MAX_SLIPPAGE_PCT = float(os.getenv("MAX_SLIPPAGE_PCT", "0.5"))
MIN_SHARPE_RATIO = float(os.getenv("MIN_SHARPE_RATIO", "0.5"))
TARGET_VOLATILITY_PCT = float(os.getenv("TARGET_VOLATILITY_PCT", "10.0"))

# Consensus Configuration
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.55"))
INITIAL_AGENT_WEIGHT = 1.0
WEIGHT_LEARN_RATE = 0.1
AGENT_RETIREMENT_FLOOR_TRADES = 10  # consecutive trades at floor before retirement
ROLLING_ACCURACY_WINDOW = 20  # trades

# On-chain Configuration (ERC-8004 Base Sepolia)
RPC_URL = os.getenv("RPC_URL", "https://sepolia.base.org")
AGENT_WALLET_KEY = os.getenv("AGENT_WALLET_KEY", "")
REPUTATION_REGISTRY_ADDRESS = os.getenv("REPUTATION_REGISTRY_ADDRESS", "")
VALIDATION_REGISTRY_ADDRESS = os.getenv("VALIDATION_REGISTRY_ADDRESS", "")

# Sentiment Configuration — Free, no-signup multi-source APIs
FEAR_GREED_URL = "https://api.alternative.me/fng/?limit=1"
COINGECKO_TRENDING = "https://api.coingecko.com/api/v3/search/trending"
COINGECKO_COMMUNITY = "https://api.coingecko.com/api/v3/coins/bitcoin"
MESSARI_METRICS = "https://data.messari.io/api/v1/assets/btc/metrics"

# Position Management (exit conditions)
TAKE_PROFIT_PCT = float(os.getenv("TAKE_PROFIT_PCT", "5.0"))  # close if up 5%
STOP_LOSS_PCT = float(os.getenv("STOP_LOSS_PCT", "2.0"))  # close if down 2%
MAX_HOLD_TIME_MINUTES = int(os.getenv("MAX_HOLD_TIME_MINUTES", "1440"))  # 24 hours

# Persistence Files
WEIGHTS_FILE = "nexus_weights.json"
HOLD_LOG_FILE = "hold_log.json"
POSITIONS_FILE = "nexus_positions.json"
EQUITY_CURVE_FILE = "nexus_equity_curve.json"

