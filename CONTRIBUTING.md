# Contributing

NEXUS is an experimental project. Start with the offline demo and small changes
that can be reproduced without credentials. Read [project status](docs/PROJECT_STATUS.md)
and [licensing status](docs/LICENSING.md) before contributing or distributing a fork.

## Local workflow

1. Use Python 3.11 or 3.12 and create a virtual environment as described in README.md.
2. Install `requirements.txt`, then run `python demo.py`.
3. Run `python -m unittest discover -s tests -v` and `node tests/dashboard.test.cjs`.
4. Create a feature branch. Include the problem, changed behavior, and test results in a pull request.

Use Node.js 22 for the dashboard checks. For template changes, run `npm ci`,
`npm run typecheck`, and `npm run test:config` in `ai-trading-agent-template/`.
Contract changes additionally require `npm test`; compiler downloads may require internet.
The independent MCP server has its own build and test commands in its README.

## Change expectations

- Keep strategy calculations separate from network calls and order execution.
- Use synthetic fixtures and temporary state in tests. Never depend on funded wallets.
- Cover failure paths: missing market data, rejected orders, malformed state, and risk vetoes.
- Do not introduce random or simulated values into dashboards without explicit labeling.
- Avoid unrelated formatting changes or dependency upgrades in functional patches.
- Document new settings in `.env.example` with empty values or clear placeholders.
- Preserve upstream notices; identify the origin and license of imported code.
- Do not restore old repository history after the privacy rewrite; start from a fresh clone.

Do not include private data in issues or pull requests. See SECURITY.md for reporting.
Describe bugs with versions, reproduction steps, expected/actual behavior, and redacted logs.
Be respectful, discuss the code, and keep feedback specific and constructive.
