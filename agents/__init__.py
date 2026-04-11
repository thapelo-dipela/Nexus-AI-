"""
NEXUS Agents — register and export all trading agents.
"""
from agents.base import BaseAgent
from agents.momentum import MomentumAgent
from agents.sentiment import SentimentAgent
from agents.risk_guardian import RiskGuardianAgent
from agents.mean_reversion import MeanReversionAgent

__all__ = [
    "BaseAgent",
    "MomentumAgent",
    "SentimentAgent",
    "RiskGuardianAgent",
    "MeanReversionAgent",
]


def create_default_agents() -> list[BaseAgent]:
    """Create and return all default trading agents."""
    return [
        MomentumAgent(reasoning="Blends local technical analysis with PRISM multi-timeframe signals."),
        SentimentAgent(reasoning="Contrarian sentiment analysis from multiple sources."),
        RiskGuardianAgent(reasoning="Hard veto triggers and volatility-scaled signal."),
        MeanReversionAgent(reasoning="Mean reversion strategy based on RSI, Bollinger Bands, and SMA."),
    ]
