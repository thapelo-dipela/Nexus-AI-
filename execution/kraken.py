"""
Kraken Execution Layer — order placement and portfolio balance only.
No data fetching of any kind belongs here. All market data comes from PRISM.
"""
import subprocess
import json
import logging
from typing import Tuple, Dict, Any, List, Optional

import config
from agents.base import Candle

logger = logging.getLogger(__name__)


class KrakenClient:
    """Kraken CLI execution client."""

    def __init__(self, cli_path: str = config.KRAKEN_CLI_PATH, pair: str = config.PAIR, dry_run: bool = False):
        self.cli_path = cli_path
        self.pair = pair
        self.dry_run = dry_run

    def market_buy(self, volume: float) -> Dict[str, Any]:
        """
        Execute a market buy order.
        Args:
            volume: Asset volume to buy (not USD)
        Returns:
            Response dict from Kraken CLI
        """
        if self.dry_run:
            return {"dry_run": True, "side": "buy", "volume": volume, "pair": self.pair}
        try:
            cmd = [
                self.cli_path,
                "order",
                "buy",
                "--type",
                "market",
                "-o",
                "json",
                self.pair,
                str(volume),
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

            if result.returncode == 0:
                try:
                    response = json.loads(result.stdout)
                    logger.info(f"[bold green]Market BUY {volume} {self.pair}: {response}[/bold green]")
                    return response
                except json.JSONDecodeError:
                    logger.error(f"[red]Kraken CLI returned invalid JSON: {result.stdout}[/red]")
                    return {"error": "invalid_json", "raw": result.stdout}
            else:
                logger.error(f"[red]Kraken CLI error: {result.stderr}[/red]")
                return {"error": "cli_error", "stderr": result.stderr}

        except subprocess.TimeoutExpired:
            logger.error("[red]Kraken CLI timeout on market_buy[/red]")
            return {"error": "timeout"}
        except Exception as e:
            logger.error(f"[red]market_buy exception: {e}[/red]")
            return {"error": str(e)}

    def market_sell(self, volume: float) -> Dict[str, Any]:
        """
        Execute a market sell order.
        Args:
            volume: Asset volume to sell (not USD)
        Returns:
            Response dict from Kraken CLI
        """
        if self.dry_run:
            return {"dry_run": True, "side": "sell", "volume": volume, "pair": self.pair}
        try:
            cmd = [
                self.cli_path,
                "order",
                "sell",
                "--type",
                "market",
                "-o",
                "json",
                self.pair,
                str(volume),
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

            if result.returncode == 0:
                try:
                    response = json.loads(result.stdout)
                    logger.info(f"[bold green]Market SELL {volume} {self.pair}: {response}[/bold green]")
                    return response
                except json.JSONDecodeError:
                    logger.error(f"[red]Kraken CLI returned invalid JSON: {result.stdout}[/red]")
                    return {"error": "invalid_json", "raw": result.stdout}
            else:
                logger.error(f"[red]Kraken CLI error: {result.stderr}[/red]")
                return {"error": "cli_error", "stderr": result.stderr}

        except subprocess.TimeoutExpired:
            logger.error("[red]Kraken CLI timeout on market_sell[/red]")
            return {"error": "timeout"}
        except Exception as e:
            logger.error(f"[red]market_sell exception: {e}[/red]")
            return {"error": str(e)}

    def portfolio_summary(self) -> Tuple[float, float]:
        """
        Fetch portfolio summary from Kraken.
        Uses: kraken balance -o json
        Returns: (portfolio_value_usd, open_position_usd)
        If query fails, returns (0.0, 0.0) with a single clean warning.
        """
        # In dry-run mode, return mock portfolio data
        if self.dry_run:
            logger.debug("[dim]DRY-RUN: Returning mock portfolio (10000 USD)[/dim]")
            return (10000.0, 0.0)
        
        try:
            # Query cash balances: kraken balance -o json
            # Response format: {"ZUSD": "10234.56", "XXBT": "0.0312", ...}
            cmd = [self.cli_path, "balance", "-o", "json"]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

            if result.returncode != 0:
                logger.warning(f"[yellow]Kraken balance command failed[/yellow]")
                return (0.0, 0.0)

            try:
                balance_data = json.loads(result.stdout)
            except json.JSONDecodeError:
                logger.warning("[yellow]Kraken returned invalid JSON for balance[/yellow]")
                return (0.0, 0.0)

            # Extract USD balance (ZUSD is Kraken's USD currency code)
            usd_balance = float(balance_data.get("ZUSD", "0.0"))
            
            # Extract BTC balance if available (XXBT is Kraken's BTC currency code)
            btc_balance_str = balance_data.get("XXBT", "0.0")
            btc_balance = float(btc_balance_str)
            
            # Calculate BTC position value using current ticker price
            btc_position_usd = 0.0
            if btc_balance > 0:
                try:
                    btc_price = self.get_ticker_price()
                    if btc_price:
                        btc_position_usd = btc_balance * btc_price
                except Exception as e:
                    logger.debug(f"[dim]Could not fetch BTC price for position valuation: {e}[/dim]")
            
            # Total portfolio value = USD + BTC position
            portfolio_value = usd_balance + btc_position_usd
            
            logger.debug(
                f"[dim]Portfolio: ${portfolio_value:.2f} (USD: ${usd_balance:.2f}, BTC: ${btc_position_usd:.2f})[/dim]"
            )
            return (portfolio_value, btc_position_usd)

        except subprocess.TimeoutExpired:
            logger.warning("[yellow]Kraken CLI timeout on portfolio_summary[/yellow]")
            return (0.0, 0.0)
        except Exception as e:
            logger.warning(f"[yellow]portfolio_summary exception: {e}[/yellow]")
            return (0.0, 0.0)

    def usd_to_volume(self, usd: float, current_price: float) -> float:
        """
        Convert USD amount to asset volume using current PRISM price.
        Args:
            usd: Dollar amount to convert
            current_price: Current asset price from PRISM
        Returns:
            Asset volume
        """
        if current_price <= 0:
            logger.warning("[yellow]Invalid price for USD to volume conversion[/yellow]")
            return 0.0
        return usd / current_price

    def get_ticker_price(self) -> Optional[float]:
        """
        Fetch current ticker price from Kraken CLI.
        Command: kraken ticker -o json PAIR
        Returns current price as float or None on failure.
        """
        try:
            cmd = [
                self.cli_path,
                "ticker",
                "-o",
                "json",
                self.pair,
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)

            if result.returncode == 0:
                try:
                    data = json.loads(result.stdout)
                    # Kraken CLI ticker output format: {"XBTUSD": {"a": ["price", ...], "b": [...], "c": ["last", "lot"], ...}}
                    if isinstance(data, dict) and self.pair in data:
                        # 'c' is close/last trade price, first element is the price
                        last_trade_price = float(data[self.pair]["c"][0])
                        return last_trade_price
                    else:
                        logger.error(f"[red]Kraken CLI ticker returned unexpected format: {result.stdout}[/red]")
                        return None
                except (json.JSONDecodeError, KeyError, IndexError, ValueError) as e:
                    logger.error(f"[red]Kraken CLI ticker parsing failed: {e} | Raw: {result.stdout}[/red]")
                    return None
            else:
                logger.error(f"[red]Kraken CLI ticker error: {result.stderr}[/red]")
                return None

        except subprocess.TimeoutExpired:
            logger.error("[red]Kraken CLI timeout on get_ticker_price[/red]")
            return None
        except Exception as e:
            logger.error(f"[red]get_ticker_price exception: {e}[/red]")
            return None

    def fetch_ohlcv(
        self, symbol: str, interval_minutes: int, limit: int = 100
    ) -> Optional[List[Candle]]:
        """
        Fetch OHLCV candles from Kraken CLI.
        Command: kraken ohlc --interval MINUTES -o json PAIR
        Returns list of Candle objects or None on failure.
        """
        try:
            cmd = [
                self.cli_path,
                "ohlc",
                "--interval",
                str(interval_minutes),
                "-o",
                "json",
                self.pair,
            ]
            # Limit is handled by parsing the output (take last N candles)
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

            if result.returncode == 0:
                try:
                    data = json.loads(result.stdout)
                    if isinstance(data, dict) and self.pair in data:
                        ohlcv_data = data[self.pair]
                        candles = []
                        # Kraken CLI OHLC output format: [timestamp, open, high, low, close, vwap, volume, count]
                        for entry in ohlcv_data[-limit:]:
                            candles.append(
                                Candle(
                                    timestamp=int(entry[0]),
                                    open=float(entry[1]),
                                    high=float(entry[2]),
                                    low=float(entry[3]),
                                    close=float(entry[4]),
                                    volume=float(entry[6]),  # Volume is at index 6
                                )
                            )
                        return candles
                    else:
                        logger.error(f"[red]Kraken CLI OHLCV returned unexpected format: {result.stdout}[/red]")
                        return None
                except json.JSONDecodeError:
                    logger.error(f"[red]Kraken CLI OHLCV returned invalid JSON: {result.stdout}[/red]")
                    return None
            else:
                logger.error(f"[red]Kraken CLI OHLCV error: {result.stderr}[/red]")
                return None

        except subprocess.TimeoutExpired:
            logger.error("[red]Kraken CLI timeout on fetch_ohlcv[/red]")
            return None
        except Exception as e:
            logger.error(f"[red]fetch_ohlcv exception: {e}[/red]")
            return None
