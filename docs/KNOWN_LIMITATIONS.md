# Remaining engineering work

This project is an experimental trading prototype. Passing offline tests does not establish trading profitability or production readiness.

## Execution and accounting

Python `--live` and direct live-loop calls are now blocked. The following issues
must be resolved before enabling them; the separate TypeScript transaction scripts remain available.

- The live orchestration path records entries without reconciling confirmed exchange fills. Exit handling closes the local record without placing the corresponding exchange order. Implement and test order acknowledgement, fills, partial fills, retries, and exchange reconciliation before using live mode.
- Dry-run and live sessions currently share local state filenames. Use separate checkouts and credentials; a future change should isolate state by execution mode.
- The equity writer combines cash and PnL rather than maintaining a complete exchange-reconciled ledger. Dashboard calculations reflect recorded inputs, not independently verified exchange performance.
- Outcome learning uses votes collected at exit rather than the original entry votes. Persist entry votes before refining learning behavior.
- Regime multipliers are logged but are not applied to the consensus calculation.

## Integrations

- PRISM price responses currently supply placeholder zeros for unavailable 24-hour volume and change. The dashboard marks these fields unavailable rather than displaying those zeros as observations.
- Historical candles, sentiment sources, exchange CLI behavior, on-chain registrations, and competition submissions require independent integration verification.
- `PRISM-MCP-Server/` and `ai-trading-agent-template/` are independent TypeScript projects. Their builds and contract tests are separate from the root Python regression suite.
- The Flask development server binds to loopback. A public deployment needs a production server, authentication, and an explicit data-access policy.

## Repository maintenance

The cleanup removes generated completion reports, duplicate onboarding documents, machine-specific setup instructions, Finder metadata, a pre-populated weights file, and a sample release workflow that generated dummy artifacts. Sensitive historical material has been rewritten; do not restore old clones into this repository. The standalone integrations and their tutorials remain in place.
