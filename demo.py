"""Offline, synthetic demonstration of the actual agent and consensus pipeline."""
import json

from agents import create_default_agents
from agents.base import Candle, MarketData, PrismRisk
from consensus.engine import ConsensusEngine


def run_demo():
    candles = [Candle(timestamp=1700000000 + i * 3600,
                      open=30000 + i * 10, high=30030 + i * 10,
                      low=29970 + i * 10, close=30010 + i * 10, volume=100)
               for i in range(100)]
    market = MarketData(
        pair="DEMO-BTCUSD", candles=candles, current_price=candles[-1].close,
        change_24h_pct=0.8, volume_24h=2_000_000_000,
        signal_1h=None, signal_4h=None,
        prism_risk=PrismRisk(risk_score=90, atr_pct=0.01, volatility_30d=10,
                            max_drawdown_30d=2, sharpe_ratio=0, timestamp=1700356400),
        fear_greed_index=40, news_sentiment=0.1,
        portfolio_value_usd=10000, open_position_usd=0, cash_usd=10000,
        timestamp=1700356400,
    )
    votes = [agent.analyze(market) for agent in create_default_agents()]
    direction, confidence, _ = ConsensusEngine(persist=False).vote(votes)
    return {
        "mode": "offline-demo", "data_source": "synthetic", "orders_submitted": 0,
        "scenario": "High synthetic risk demonstrates the guardian veto",
        "decision": direction.value, "confidence": confidence,
        "votes": [{"agent": v.agent_id, "direction": v.direction.value,
                   "confidence": v.confidence, "reasoning": v.reasoning} for v in votes],
    }


if __name__ == "__main__":
    print(json.dumps(run_demo(), indent=2))
