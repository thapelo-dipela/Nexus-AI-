"""
SentimentAgent — contrarian sentiment analysis from multiple free sources.
Uses four no-signup APIs: Alternative.me Fear/Greed, CoinGecko Trending, CoinGecko Community, Messari Metrics.
"""
import logging
import requests
from typing import List

from agents.base import BaseAgent, MarketData, Vote, VoteDirection

logger = logging.getLogger(__name__)


def fetch_composite_sentiment() -> float:
    """
    Blends four free public APIs into a single sentiment float (-1.0 to +1.0).
    All sources require zero API keys or signup.
    Falls back gracefully — any single source failure does not crash the blend.
    """
    scores = []

    # SOURCE 1 — Alternative.me Fear & Greed (weight: 40%)
    try:
        r = requests.get("https://api.alternative.me/fng/?limit=1", timeout=5)
        r.raise_for_status()
        value = int(r.json()["data"][0]["value"])
        # Normalise 0-100 → -1.0 to +1.0
        # Contrarian: extreme greed → negative signal, extreme fear → positive
        normalised = -((value - 50) / 50.0)
        scores.append(("fear_greed", normalised, 0.40))
        logger.debug(f"[dim]Fear/Greed: {value}/100 → signal={normalised:+.2f}[/dim]")
    except Exception as e:
        logger.debug(f"[dim]Fear/Greed fetch failed: {e}[/dim]")

    # SOURCE 2 — CoinGecko Trending (weight: 20%)
    try:
        r = requests.get(
            "https://api.coingecko.com/api/v3/search/trending", timeout=5
        )
        r.raise_for_status()
        coins = [c["item"]["symbol"].upper() for c in r.json().get("coins", [])]
        if "BTC" in coins:
            position = coins.index("BTC")
            # Position 0-2 = top trending = overheated = mild sell
            # Position 3-6 = moderate attention = neutral
            trending_signal = -0.4 if position <= 2 else -0.1
        else:
            trending_signal = 0.1  # not trending = less crowded = slight positive
        scores.append(("trending", trending_signal, 0.20))
        rank_str = f"#{position+1}" if "BTC" in coins else "not trending"
        logger.debug(f"[dim]CoinGecko trending: BTC {rank_str} → signal={trending_signal:+.2f}[/dim]")
    except Exception as e:
        logger.debug(f"[dim]CoinGecko trending fetch failed: {e}[/dim]")

    # SOURCE 3 — CoinGecko Community Votes (weight: 25%)
    try:
        r = requests.get(
            "https://api.coingecko.com/api/v3/coins/bitcoin"
            "?localization=false&tickers=false&market_data=false"
            "&community_data=false&developer_data=false&sparkline=false",
            timeout=5,
        )
        r.raise_for_status()
        data = r.json()
        up_pct = data.get("sentiment_votes_up_percentage") or 50.0
        down_pct = data.get("sentiment_votes_down_percentage") or 50.0
        # Normalise: 100% up = +1.0, 100% down = -1.0
        community_signal = (up_pct - down_pct) / 100.0
        scores.append(("community", community_signal, 0.25))
        logger.debug(f"[dim]CoinGecko community: up={up_pct:.1f}% → signal={community_signal:+.2f}[/dim]")
    except Exception as e:
        logger.debug(f"[dim]CoinGecko community fetch failed: {e}[/dim]")

    # SOURCE 4 — Messari 24h price change as momentum-sentiment (weight: 15%)
    try:
        r = requests.get(
            "https://data.messari.io/api/v1/assets/btc/metrics", timeout=5
        )
        r.raise_for_status()
        change = r.json()["data"]["market_data"]["percent_change_usd_last_24_hours"]
        # Normalise: cap at ±10% → ±1.0 signal
        momentum_signal = max(-1.0, min(1.0, change / 10.0))
        scores.append(("messari_momentum", momentum_signal, 0.15))
        logger.debug(f"[dim]Messari 24h change: {change:+.2f}% → signal={momentum_signal:+.2f}[/dim]")
    except Exception as e:
        logger.debug(f"[dim]Messari fetch failed: {e}[/dim]")

    # Blend all available scores weighted by their declared weight
    if not scores:
        logger.debug("[dim]All sentiment sources failed — returning 0.0[/dim]")
        return 0.0

    total_weight = sum(w for _, _, w in scores)
    blended = sum(s * w for _, s, w in scores) / total_weight
    result = max(-1.0, min(1.0, blended))

    sources_used = ", ".join(name for name, _, _ in scores)
    logger.debug(f"[dim]Sentiment blend ({sources_used}): {result:+.3f}[/dim]")
    return result


class SentimentAgent(BaseAgent):
    """
    Contrarian sentiment analysis from four free sources:
    - Alternative.me Fear & Greed Index (40% weight): Extreme greed → sell, extreme fear → buy
    - CoinGecko Trending (20% weight): BTC in top 3 trending → overheated → mild sell
    - CoinGecko Community Votes (25% weight): Direct crowd sentiment
    - Messari 24h momentum (15% weight): Price change as momentum-sentiment proxy
    """

    def __init__(self, agent_id: str = "sentiment", reasoning: str = "Contrarian sentiment analysis from four free sources."):
        super().__init__(agent_id, reasoning)

    def analyze(self, market_data: MarketData) -> Vote:
        """Analyze market sentiment and return a vote."""
        component_scores = {}

        # PRISM signal score (40% weight) — faded mildly as crowded positioning proxy
        # Map PRISM direction values to numeric scores
        prism_signal_score = 0.0
        if market_data.signal_4h:
            prism_direction_score = self._prism_direction_to_score(market_data.signal_4h.direction)
            prism_signal_score = prism_direction_score * 0.4  # Fade by 0.4
            logger.debug(
                f"[dim]PRISM signal: {market_data.signal_4h.direction} (strength={market_data.signal_4h.score:+.2f})[/dim]"
            )

        # PRISM 24h price change (20% weight)
        # Strong up move = potential exhaustion → mild sell signal
        price_change_score = self._price_change_score(market_data.change_24h_pct)

        # Fear/Greed Index (30% weight) — contrarian
        fng_score = self._fear_greed_score(market_data.fear_greed_index)

        # Multi-source composite sentiment (10% weight) — replaces CryptoPanic news NLP
        composite_sentiment = market_data.news_sentiment
        if composite_sentiment is None:
            composite_sentiment = fetch_composite_sentiment()

        # Composite score with weights
        composite = (prism_signal_score * 0.40) + (price_change_score * 0.20) + (fng_score * 0.30) + (composite_sentiment * 0.10)

        component_scores = {
            "prism_signal": prism_signal_score,
            "price_change": price_change_score,
            "fear_greed": fng_score,
            "composite_sentiment": composite_sentiment,
            "composite": composite,
        }

        logger.debug(
            f"[dim]SentimentAgent: "
            f"PRISM={prism_signal_score:.3f} PriceChg={price_change_score:.3f} "
            f"FnG={fng_score:.3f} Composite={composite_sentiment:.3f} Total={composite:.3f}[/dim]"
        )

        # Determine direction and confidence
        threshold = 0.15
        if composite > threshold:
            direction = VoteDirection.BUY
            confidence = min(1.0, abs(composite) / threshold)
        elif composite < -threshold:
            direction = VoteDirection.SELL
            confidence = min(1.0, abs(composite) / threshold)
        else:
            direction = VoteDirection.HOLD
            confidence = 0.1

        return Vote(
            agent_id=self.agent_id,
            direction=direction,
            confidence=confidence,
            reasoning=f"Sentiment composite: {composite:.3f}",
            component_scores=component_scores,
        )

    @staticmethod
    def _price_change_score(change_24h_pct: float) -> float:
        """
        Score 24h price change.
        Strong up move = exhaustion → negative signal (contrarian).
        Normalize to [-1, +1].
        """
        # Invert: +30% change → -1 (bearish), -30% change → +1 (bullish)
        # Clamp to [-1, +1]
        import math

        # Strong up move is exhaustion (sell signal)
        normalized = -math.tanh(change_24h_pct / 20.0)
        return max(-1.0, min(1.0, normalized))

    @staticmethod
    def _fear_greed_score(fear_greed_index) -> float:
        """
        Score Fear & Greed Index (contrarian).
        Extreme fear (0–25) → buy signal (+1)
        Extreme greed (75–100) → sell signal (-1)
        """
        if fear_greed_index is None:
            return 0.0

        fng = max(0, min(100, fear_greed_index))

        if fng <= 25:
            # Extreme fear → buy
            return 1.0
        elif fng >= 75:
            # Extreme greed → sell
            return -1.0
        else:
            # Linear interpolation: 50 (neutral) → 0
            return (50 - fng) / 50.0

    @staticmethod
    def _prism_direction_to_score(direction: str) -> float:
        """
        Map PRISM signal direction to numeric score [-1.0, +1.0].
        strong_bullish=1.0, bullish=0.5, neutral=0.0, bearish=-0.5, strong_bearish=-1.0
        """
        direction_lower = direction.lower() if direction else "neutral"
        
        if direction_lower in ("strong_bullish", "strongbullish"):
            return 1.0
        elif direction_lower == "bullish":
            return 0.5
        elif direction_lower == "neutral":
            return 0.0
        elif direction_lower == "bearish":
            return -0.5
        elif direction_lower in ("strong_bearish", "strongbearish"):
            return -1.0
        else:
            return 0.0
