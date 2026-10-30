# Roadmap and acceptance criteria

## Development preview

- [x] Remove identified private configuration and rewrite affected history.
- [x] Add an offline, synthetic demonstration using the actual agents.
- [x] Enforce the guardian's explicit risk veto in consensus.
- [x] Disable unfinished Python live execution.
- [x] Add contributor instructions and repeatable local checks.
- [ ] Choose a root license and verify bundled-code provenance and notices.
- [ ] Restore hosted CI availability and verify a clean install on supported platforms.
- [ ] Triage dependency audit results by reachable code and supported runtime; review upgrades individually.

## Reliable simulation

- [ ] Separate runtime data by execution mode and make writes atomic.
- [ ] Store entry votes with each position; attribute learning to those votes.
- [ ] Apply regime weights in consensus with defined normalization and tests.
- [ ] Define a ledger covering cash, holdings, fees, and realized/unrealized PnL.
- [ ] Add reproducible simulations with explicit assumptions and no performance guarantees.
- [ ] Add provider contract tests and clear missing/stale-data behavior.

## Live execution gate

Do not remove the live-mode block until all of these are implemented and verified:

- [ ] Persist exchange order IDs and reconcile acknowledgements, fills, and partial fills.
- [ ] Submit and confirm exit orders before closing local positions.
- [ ] Recover safely from retries, timeouts, restarts, and ambiguous exchange responses.
- [ ] Reconcile balances and positions against the exchange ledger.
- [ ] Test risk limits, duplicate-order prevention, and emergency shutdown.
- [ ] Complete dependency and contract security review appropriate to the deployment.

No release dates are committed. Prefer small, testable pull requests tied to these criteria.
