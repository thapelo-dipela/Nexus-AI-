# Nexus AI

NEXUS is an experimental BTC trading system with agent voting, reputation weights, PRISM market data, Kraken integration, and optional on-chain reputation tooling.

**Start in dry-run mode. Live execution and accounting have unresolved correctness issues described in [known limitations](docs/KNOWN_LIMITATIONS.md).**

## Setup

Use Python 3.11 or 3.12. From the repository root:

```sh
python -m venv .venv
# Windows PowerShell:
.venv/Scripts/Activate.ps1
# macOS/Linux: source .venv/bin/activate
python -m pip install -r requirements.txt
```

Copy `.env.example` to `.env` and supply the services you intend to use. Configuration loads this file automatically; existing environment variables take precedence. Keep credentials out of Git. PRISM needs an API key, and market/portfolio fallbacks require the Kraken CLI to be installed and configured separately.

```sh
python main.py --help
python main.py --dry-run
```

Dry-run suppresses order submission and writes simulated local positions and learning state. It still reads external market/portfolio data. Run from the repository root so runtime state matches the dashboard. Competition submission is disabled by default.

## Dashboard

```sh
python dashboard_server.py
```

Open http://127.0.0.1:5000. The browser reads the Flask API, displays observed price samples, and uses locally recorded positions and equity. Missing data appears as empty charts or `Unavailable`; it is never replaced with random performance. Optional chart styling and chart libraries require internet access.

## Tests

```sh
python -m unittest discover -s tests -v
node tests/dashboard.test.cjs
```

Tests use temporary state and mocked market clients. They cover dashboard startup, missing data, position filtering, performance accounting, drawdowns, dry-run order suppression, and position sizing. GitHub Actions runs the same suite and checks the CLI entry point. No credentials are required.

## Project map

| Location | Purpose |
| --- | --- |
| `main.py`, `config.py` | CLI orchestration and environment configuration |
| `agents/`, `consensus/` | Trading signals and weighted voting |
| `data/`, `execution/` | Market data, exchange access, and position records |
| `onchain/`, `validation.py`, `compliance.py`, `yield.py` | Reputation, decision records, and risk/portfolio helpers |
| `dashboard_server.py`, `dashboard.html` | Local dashboard API and interface |
| `training_monitor.py`, `diagnose_prism.py` | Diagnostic utilities |
| `PRISM-MCP-Server/` | Independent TypeScript MCP integration; see its README |
| `ai-trading-agent-template/` | Independent contract/template project and tutorials |

The independent TypeScript projects retain their own dependencies and lockfiles. They are not prerequisites for running the Python dashboard. Historical status reports were consolidated into this README and the limitations document; Git history preserves the originals.
