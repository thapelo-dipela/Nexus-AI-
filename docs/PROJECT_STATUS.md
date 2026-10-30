# Project status

**Stage: experimental development preview.** The project is intended to become a
reusable foundation. Original NEXUS material is Apache-2.0 licensed; production trading
and bundled-component attribution still require work.

| Component | Current status |
| --- | --- |
| Offline agent demo | Synthetic inputs, four actual agents, in-memory consensus, no credentials or orders |
| Python live mode | Disabled until execution and accounting are reconciled |
| Python dry-run | Available; still reads external services and writes local simulation state |
| Dashboard | Local API reporting; depends on available records and external data |
| Contract template | Separate project; configuration tests and type-check available |
| PRISM MCP server | Separate project with its own SDK dependency and tests |
| Licensing | Original NEXUS: Apache-2.0; bundled MIT declarations preserved; provenance review outstanding |

Passing unit tests does not establish profitability, exchange compatibility, or
contract correctness. See KNOWN_LIMITATIONS.md and ROADMAP.md for release gates.

The Python live-mode restriction does not disable the independent template's
deployment or transaction scripts. Those require deliberate private configuration.
