import unittest
from unittest.mock import patch

from agents.base import Vote, VoteDirection
from consensus.engine import ConsensusEngine
from demo import run_demo


class OfflineDemoTests(unittest.TestCase):
    def test_demo_uses_no_network_subprocess_or_state_files(self):
        with patch('socket.socket', side_effect=AssertionError('Network prohibited')), \
             patch('subprocess.run', side_effect=AssertionError('Processes prohibited')), \
             patch('builtins.open', side_effect=AssertionError('State access prohibited')):
            first = run_demo()
            self.assertEqual(first, run_demo())
        self.assertEqual(first['decision'], 'HOLD')
        self.assertEqual(first['orders_submitted'], 0)
        self.assertEqual(len(first['votes']), 4)

    def test_guardian_veto_overrides_unanimous_directional_votes(self):
        votes = [Vote(name, VoteDirection.BUY, 1, 'test')
                 for name in ['momentum', 'sentiment', 'mean_reversion']]
        votes.append(Vote('risk_guardian', VoteDirection.HOLD, 1, 'risk',
                          {'veto_triggered': True}))
        engine = ConsensusEngine(persist=False)
        self.assertEqual(engine.vote(votes)[0], VoteDirection.HOLD)

    def test_normal_guardian_hold_does_not_veto(self):
        votes = [Vote(name, VoteDirection.BUY, 1, 'test')
                 for name in ['momentum', 'sentiment', 'mean_reversion']]
        votes.append(Vote('risk_guardian', VoteDirection.HOLD, 0.2, 'normal'))
        self.assertEqual(ConsensusEngine(persist=False).vote(votes)[0], VoteDirection.BUY)

    def test_live_cli_rejected_before_loop(self):
        import main
        with patch('sys.argv', ['main.py', '--live']), patch.object(main, 'live_trading_loop') as loop:
            with self.assertRaises(SystemExit) as error:
                main.main()
            self.assertEqual(error.exception.code, 2)
            loop.assert_not_called()

    def test_direct_live_loop_rejected(self):
        from main import live_trading_loop
        with self.assertRaises(ValueError):
            live_trading_loop(dry_run=False)
