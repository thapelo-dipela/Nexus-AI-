"""Offline regression tests; no credentials, orders, or external API calls."""
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import config
import dashboard_server as dashboard
from execution import compute_position_size
from execution.kraken import KrakenClient


class DashboardTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.directory = Path(self.temp.name)
        for key in ('WEIGHTS_FILE', 'POSITIONS_FILE', 'EQUITY_CURVE_FILE'):
            patcher = patch.object(config, key, str(self.directory / (key + '.json')))
            patcher.start()
            self.addCleanup(patcher.stop)
        self.client = dashboard.app.test_client()

    def save(self, key, records):
        Path(getattr(config, key)).write_text(json.dumps(records), encoding='utf-8')

    def test_dashboard_starts(self):
        with self.client.get('/') as response:
            self.assertEqual(response.status_code, 200)

    def test_missing_state_is_empty(self):
        self.assertEqual(self.client.get('/api/equity').json['data'], [])
        self.assertEqual(self.client.get('/api/agents').json['agents'], [])
        self.assertEqual(self.client.get('/api/positions').json['count'], 0)

    def test_corrupt_state_is_not_reported_as_empty_success(self):
        Path(config.WEIGHTS_FILE).write_text('{bad json', encoding='utf-8')
        self.assertEqual(self.client.get('/api/agents').status_code, 500)

    def test_positions_excludes_closed_and_uses_notional(self):
        self.save('POSITIONS_FILE', [
            {'status': 'open', 'entry_price': 100, 'volume': 2},
            {'status': 'closed', 'entry_price': 200, 'volume': 3},
        ])
        data = self.client.get('/api/positions').json
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['total_exposure'], 200)

    def test_performance_counts_positions_not_agent_votes(self):
        self.save('POSITIONS_FILE', [{'status': 'closed', 'pnl_usd': 10},
                                    {'status': 'closed', 'pnl_usd': -5},
                                    {'status': 'closed', 'pnl_usd': 0}])
        self.save('WEIGHTS_FILE', [{'trades_closed': 50, 'pnl_total': 900}])
        data = self.client.get('/api/performance').json['performance']
        self.assertEqual(data['total_trades'], 3)
        self.assertEqual(data['total_pnl'], 5)
        self.assertEqual(data['wins'], 1)
        self.assertEqual(data['losses'], 1)

    def test_rising_equity_has_no_drawdown(self):
        self.save('EQUITY_CURVE_FILE', [{'equity': x} for x in [100, 110, 120]])
        self.assertEqual(dashboard.portfolio_performance()['max_drawdown'], 0)

    def test_drawdown_follows_running_peak(self):
        self.save('EQUITY_CURVE_FILE', [{'equity': x} for x in [100, 80, 200, 190]])
        self.assertEqual(dashboard.portfolio_performance()['max_drawdown'], 20)

    def test_zero_equity_is_handled(self):
        self.save('EQUITY_CURVE_FILE', [{'equity': 0}, {'equity': 100}])
        self.assertEqual(self.client.get('/api/performance').status_code, 200)

    @patch.object(dashboard, 'prism_client')
    def test_market_price_matches_client_contract(self, prism):
        prism.get_price.return_value = {'price': 12345}
        prism.get_signals.return_value = None
        prism.get_risk.return_value = None
        response = self.client.get('/api/market')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['price'], 12345)
        self.assertIsNone(response.json['risk_score'])

    @patch.object(dashboard, 'prism_client')
    def test_missing_market_and_risk_are_unavailable(self, prism):
        prism.get_price.return_value = None
        prism.get_risk.return_value = None
        for endpoint in ['market', 'risk']:
            response = self.client.get('/api/' + endpoint)
            self.assertEqual(response.status_code, 503)
            self.assertFalse(response.json['success'])

    def test_health_does_not_claim_connectivity(self):
        self.assertNotIn('prism_connected', self.client.get('/api/health').json)


class ExecutionTests(unittest.TestCase):
    @patch('execution.kraken.subprocess.run')
    def test_dry_run_never_places_orders(self, run):
        client = KrakenClient(dry_run=True)
        self.assertTrue(client.market_buy(1)['dry_run'])
        self.assertTrue(client.market_sell(1)['dry_run'])
        run.assert_not_called()

    def test_invalid_position_inputs_are_rejected(self):
        for values in [(0, 0, 1), (-100, 0, 1), (100, 0, 0),
                       (100, -1, 1), (100, 0, 2), (float('nan'), 0, 1),
                       (100, float('inf'), 1)]:
            with self.subTest(values=values):
                self.assertEqual(compute_position_size(*values), 0)

    def test_small_portfolio_cannot_exceed_cap_to_meet_minimum(self):
        self.assertEqual(compute_position_size(10, 0, 1), 0)

    def test_valid_position_within_limits(self):
        size = compute_position_size(10000, 0.01, 0.8)
        self.assertGreaterEqual(size, config.MIN_TRADE_SIZE_USD)
        self.assertLessEqual(size, config.MAX_TRADE_SIZE_USD)


if __name__ == '__main__':
    unittest.main()
