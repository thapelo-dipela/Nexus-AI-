# Third-party and separately licensed components

The root Apache-2.0 license applies to original NEXUS material, not to the
components below. Preserve their applicable notices when redistributing them.
This inventory does not replace license texts or grant additional permissions.

| Component | Location / source evidence | Existing declaration | Verification status |
| --- | --- | --- | --- |
| PRISM MCP server | `PRISM-MCP-Server/`; its README references `https://github.com/Strykr-Prism/PRISM-MCP-Server` | `package.json`: MIT | Full upstream license text, copyright holder, and imported revision still need verification. A request for the upstream LICENSE file returned 404 on 2026-10-30. |
| Trading-agent template | `ai-trading-agent-template/` | README: MIT; five Solidity files: `SPDX-License-Identifier: MIT` | Existing MIT declarations are preserved. Confirm original provenance, copyright notices, and the applicable full license text before redistributing this component. |
| Python dependencies | `requirements.txt` | Package-specific | Consult each installed distribution's license and notices; no blanket Apache grant applies. |
| JavaScript dependencies | Both nested `package.json` and `package-lock.json` files | Package-specific | Preserve required dependency notices for the artifacts you distribute. |
| Browser-loaded assets | Script/style links in the HTML interfaces | Asset-specific | Review provider licenses when bundling or redistributing assets locally. |

Do not attribute third-party code to Thapelo Dipela solely because it is present
in this repository. Do not replace existing MIT headers with Apache headers.
For each imported component, record its source URL, pinned revision, full license,
copyright notices, and local modifications when those details are verified.
