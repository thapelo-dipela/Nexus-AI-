"""
NEXUS Position Sizing — volatility-scaled sizing based on risk and confidence.
"""
import math
import config


def compute_position_size(
    portfolio_value: float,
    atr_pct: float,
    confidence: float,
) -> float:
    """
    Risk 1% of portfolio equity per trade, scaled by confidence and volatility.

    Args:
        portfolio_value: Total portfolio value in USD
        atr_pct: ATR as percentage of current price (0.0–1.0)
        confidence: Consensus confidence (0.0–1.0)

    Returns:
        Position size in USD, clamped to [MIN, MAX]
    """
    if not all(math.isfinite(value) for value in (portfolio_value, atr_pct, confidence)):
        return 0.0
    if portfolio_value <= 0 or atr_pct < 0 or not 0 < confidence <= 1:
        return 0.0
    cap = min(config.MAX_TRADE_SIZE_USD, portfolio_value * config.MAX_POSITION_PCT / 100)
    if cap < config.MIN_TRADE_SIZE_USD:
        return 0.0

    # Base risk: 1% of portfolio
    base_risk = portfolio_value * config.RISK_PCT_PER_TRADE

    # Volatility scalar: high volatility → smaller position
    # At ATR = VOLATILITY_THRESHOLD, scalar = 0.3 (30% of base)
    # At ATR = 0, scalar = 1.0 (100% of base)
    vol_scalar = max(0.3, 1.0 - (atr_pct / max(config.VOLATILITY_THRESHOLD, 0.01)))

    # Size = base_risk * confidence * volatility_scalar
    sized = base_risk * confidence * vol_scalar

    # Clamp to config limits
    return min(cap, max(config.MIN_TRADE_SIZE_USD, sized))
