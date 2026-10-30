"""
NEXUS Consensus Engine — reputation-weighted voting with PnL-proportional learning.
"""
import json
import logging
import math
import time
from collections import deque
from dataclasses import dataclass, field, asdict
from typing import List, Optional, Dict, Any

import config

logger = logging.getLogger(__name__)


@dataclass
class AgentRecord:
    """Reputation record for a single agent."""
    agent_id: str
    weight: float = config.INITIAL_AGENT_WEIGHT
    trades_closed: int = 0
    pnl_total: float = 0.0
    wins: int = 0
    losses: int = 0
    retired: bool = False
    consecutive_floor_trades: int = 0

    # Rolling accuracy window (last 20 trades)
    recent_outcomes: deque = field(default_factory=lambda: deque(maxlen=config.ROLLING_ACCURACY_WINDOW))

    def accuracy_pct(self) -> float:
        """Accuracy in rolling window (0–100%)."""
        if len(self.recent_outcomes) == 0:
            return 0.0
        return (sum(self.recent_outcomes) / len(self.recent_outcomes)) * 100.0

    def to_dict(self) -> Dict[str, Any]:
        """Serialize to dict for JSON storage."""
        return {
            "agent_id": self.agent_id,
            "weight": self.weight,
            "trades_closed": self.trades_closed,
            "pnl_total": self.pnl_total,
            "wins": self.wins,
            "losses": self.losses,
            "retired": self.retired,
            "consecutive_floor_trades": self.consecutive_floor_trades,
        }


class ConsensusEngine:
    """Reputation-weighted consensus with PnL-proportional learning."""

    def __init__(self, persist: bool = True):
        self.persist = persist
        self.records: Dict[str, AgentRecord] = {}
        self.hold_log: List[Dict] = []
        self.hold_log_timestamps: Dict[int, Dict] = {}  # For counterfactual tracking
        if self.persist:
            self.load_weights()

    def load_weights(self):
        """Load agent weights from nexus_weights.json."""
        try:
            with open(config.WEIGHTS_FILE, "r") as f:
                data = json.load(f)
                for record_data in data:
                    rec = AgentRecord(
                        agent_id=record_data["agent_id"],
                        weight=record_data.get("weight", config.INITIAL_AGENT_WEIGHT),
                        trades_closed=record_data.get("trades_closed", 0),
                        pnl_total=record_data.get("pnl_total", 0.0),
                        wins=record_data.get("wins", 0),
                        losses=record_data.get("losses", 0),
                        retired=record_data.get("retired", False),
                        consecutive_floor_trades=record_data.get("consecutive_floor_trades", 0),
                    )
                    self.records[rec.agent_id] = rec
            logger.info(f"[green]Loaded weights for {len(self.records)} agents[/green]")
        except FileNotFoundError:
            logger.info("[dim]No existing weights file; starting fresh[/dim]")

    def save_weights(self):
        """Persist agent weights to nexus_weights.json."""
        if not self.persist:
            return
        try:
            data = [rec.to_dict() for rec in self.records.values()]
            with open(config.WEIGHTS_FILE, "w") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"[red]Failed to save weights: {e}[/red]")

    def register_agent(self, agent_id: str):
        """Register a new agent."""
        if agent_id not in self.records:
            self.records[agent_id] = AgentRecord(
                agent_id=agent_id,
                weight=config.INITIAL_AGENT_WEIGHT,
            )

    def vote(self, votes: List) -> tuple:
        """
        Compute consensus from agent votes.
        Returns: (consensus_direction, consensus_confidence, weighted_votes)
        """
        if not votes:
            logger.error("[red]No votes provided to consensus engine[/red]")
            from agents.base import VoteDirection, Vote
            return VoteDirection.HOLD, 0.0, []

        # Ensure all voting agents are registered
        for vote in votes:
            self.register_agent(vote.agent_id)

        # Filter out retired agents
        active_votes = [v for v in votes if not self.records[v.agent_id].retired]

        if not active_votes:
            logger.warning("[yellow]All agents retired; cannot vote[/yellow]")
            from agents.base import VoteDirection
            return VoteDirection.HOLD, 0.0, votes

        # Risk controls cannot be outvoted by directional agents.
        if any(v.agent_id == "risk_guardian" and v.component_scores.get("veto_triggered")
               for v in votes):
            from agents.base import VoteDirection
            return VoteDirection.HOLD, 1.0, active_votes

        # Compute weighted scores
        buy_score = 0.0
        sell_score = 0.0
        total_weight = 0.0

        for vote in active_votes:
            record = self.records[vote.agent_id]
            weight = record.weight

            if vote.direction.value == "BUY":
                buy_score += weight * vote.confidence
            elif vote.direction.value == "SELL":
                sell_score += weight * vote.confidence

            total_weight += weight

        # Normalize
        if total_weight > 0:
            buy_score /= total_weight
            sell_score /= total_weight

        # Determine consensus
        from agents.base import VoteDirection

        if buy_score > config.CONFIDENCE_THRESHOLD and buy_score > sell_score:
            consensus_direction = VoteDirection.BUY
            consensus_confidence = buy_score
        elif sell_score > config.CONFIDENCE_THRESHOLD and sell_score > buy_score:
            consensus_direction = VoteDirection.SELL
            consensus_confidence = sell_score
        else:
            consensus_direction = VoteDirection.HOLD
            consensus_confidence = max(buy_score, sell_score)

        logger.debug(
            f"[dim]Consensus: {consensus_direction.value} "
            f"(buy={buy_score:.3f}, sell={sell_score:.3f})[/dim]"
        )

        return consensus_direction, consensus_confidence, active_votes

    def record_hold(self, market_data, votes: List, current_price: float):
        """
        Record a HOLD decision for counterfactual analysis.
        After 12 cycles (~1 hour), check what the PnL would have been.
        """
        timestamp = int(time.time())
        self.hold_log_timestamps[timestamp] = {
            "price": current_price,
            "agent_votes": [
                {
                    "agent_id": v.agent_id,
                    "direction": v.direction.value,
                    "confidence": v.confidence,
                }
                for v in votes
            ],
        }

        # Check for counterfactuals (12 cycles later = ~60 minutes)
        cutoff = timestamp - (12 * config.LOOP_INTERVAL_SECONDS)
        for old_timestamp in list(self.hold_log_timestamps.keys()):
            if old_timestamp < cutoff:
                old_entry = self.hold_log_timestamps[old_timestamp]
                old_price = old_entry["price"]
                price_change = current_price - old_price
                pnl_usd = price_change  # Simplified; assumes 1 unit

                # Determine majority direction
                buy_count = sum(
                    1 for v in old_entry["agent_votes"] if v["direction"] == "BUY"
                )
                sell_count = sum(
                    1 for v in old_entry["agent_votes"] if v["direction"] == "SELL"
                )
                majority_dir = "BUY" if buy_count > sell_count else "SELL"

                if price_change > 0 and majority_dir == "BUY":
                    logger.debug(
                        f"[dim]Counterfactual HOLD: would have been +${pnl_usd:.2f} "
                        f"if {majority_dir}[/dim]"
                    )
                elif price_change < 0 and majority_dir == "SELL":
                    logger.debug(
                        f"[dim]Counterfactual HOLD: would have been +${abs(pnl_usd):.2f} "
                        f"if {majority_dir}[/dim]"
                    )

                del self.hold_log_timestamps[old_timestamp]

    def record_outcome(
        self,
        direction_str: str,
        confidence: float,
        votes: List,
        pnl_usd: float,
        current_price: float,
    ):
        """
        Record a closed trade and update agent weights via PnL-proportional learning.

        Args:
            direction_str: "BUY" or "SELL" (the direction that was executed)
            confidence: consensus confidence from vote()
            votes: list of Vote objects
            pnl_usd: profit/loss in USD
            current_price: current price at close
        """
        # Determine winners and losers
        from agents.base import VoteDirection

        direction_enum = VoteDirection(direction_str)
        winners = [v for v in votes if v.direction == direction_enum]
        losers = [v for v in votes if v.direction != direction_enum]

        # Update records
        for vote in votes:
            if vote.agent_id not in self.records:
                self.register_agent(vote.agent_id)

            record = self.records[vote.agent_id]
            record.trades_closed += 1

            is_win = vote in winners and pnl_usd >= 0
            record.recent_outcomes.append(1 if is_win else 0)

            if pnl_usd >= 0:
                # Profitable trade
                if vote in winners:
                    # Agent was correct
                    self._boost(record, vote.confidence, pnl_usd)
                    record.wins += 1
                    record.pnl_total += pnl_usd
                    logger.debug(
                        f"[green]Agent {vote.agent_id} boosted +${pnl_usd:.2f} "
                        f"(weight={record.weight:.2f})[/green]"
                    )
                else:
                    # Agent dissented (loss avoidance credit)
                    self._boost(record, 0.3 * vote.confidence, pnl_usd)
                    record.pnl_total += pnl_usd * 0.1  # Partial credit
                    logger.debug(f"[dim]Agent {vote.agent_id} dissent credit +${pnl_usd * 0.1:.2f}[/dim]")
            else:
                # Loss
                if vote in losers:
                    # Agent was wrong
                    self._penalise(record, vote.confidence, pnl_usd)
                    record.losses += 1
                    record.pnl_total += pnl_usd
                    logger.debug(
                        f"[red]Agent {vote.agent_id} penalised ${pnl_usd:.2f} "
                        f"(weight={record.weight:.2f})[/red]"
                    )
                else:
                    # Agent dissented (loss avoidance credit)
                    self._boost(record, 0.3 * vote.confidence, abs(pnl_usd))
                    record.pnl_total += abs(pnl_usd) * 0.1
                    logger.debug(f"[dim]Agent {vote.agent_id} dissent credit +${abs(pnl_usd) * 0.1:.2f}[/dim]")

            # Check for retirement (weight at floor for 10 consecutive trades)
            if record.weight <= 0.15:
                record.consecutive_floor_trades += 1
                if record.consecutive_floor_trades >= config.AGENT_RETIREMENT_FLOOR_TRADES:
                    record.retired = True
                    logger.warning(
                        f"[yellow]Agent {vote.agent_id} retired — "
                        f"weight at floor for {config.AGENT_RETIREMENT_FLOOR_TRADES} trades[/yellow]"
                    )
            else:
                record.consecutive_floor_trades = 0

        self.save_weights()

    def _boost(self, record: AgentRecord, confidence: float, pnl_usd: float):
        """Boost agent weight for correct/dissenting vote."""
        magnitude = math.tanh(abs(pnl_usd) / max(config.MAX_TRADE_SIZE_USD, 1.0))
        delta = config.WEIGHT_LEARN_RATE * confidence * magnitude
        record.weight = max(0.1, min(5.0, record.weight + delta))

    def _penalise(self, record: AgentRecord, confidence: float, pnl_usd: float):
        """Penalise agent weight for incorrect vote."""
        magnitude = math.tanh(abs(pnl_usd) / max(config.MAX_TRADE_SIZE_USD, 1.0))
        delta = config.WEIGHT_LEARN_RATE * confidence * magnitude
        record.weight = max(0.1, min(5.0, record.weight - delta))

    def leaderboard(self) -> str:
        """Generate leaderboard string."""
        if not self.records:
            return "[dim]No agent records yet[/dim]"

        lines = ["NEXUS Agent Leaderboard (rolling 20-trade window):", ""]
        for agent_id, record in sorted(self.records.items(), key=lambda x: -x[1].pnl_total):
            retired_marker = " [RETIRED]" if record.retired else ""
            lines.append(
                f"  {agent_id:20} | Weight: {record.weight:5.2f} | "
                f"Accuracy: {record.accuracy_pct():5.1f}% | "
                f"PnL: ${record.pnl_total:8.2f} | "
                f"W/L: {record.wins}/{record.losses}{retired_marker}"
            )
        return "\n".join(lines)
