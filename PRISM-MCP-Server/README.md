# PRISM MCP Server

MCP server that exposes PRISM financial data tools for MCP clients (Cursor, Claude Desktop, and compatible hosts).

- Package: `@prism/mcp-server`
- Current version: `1.0.1`
- Runtime: Node.js 18+
- Upstream API: `https://api.prismapi.ai`

## Tool Surface

Current stable release exposes 21 financial-data tools through the MCP protocol.

## Quick Start

```bash
git clone https://github.com/Strykr-Prism/PRISM-MCP-Server.git
cd PRISM-MCP-Server
npm install
npm run build
npm start
```

## Claude Desktop Config

```json
{
  "mcpServers": {
    "prism-os": {
      "command": "node",
      "args": ["/absolute/path/to/PRISM-MCP-Server/dist/index.js"],
      "env": {
        "PRISM_API_KEY": "prism_sk_your_key_here"
      }
    }
  }
}
```

## Environment

- `PRISM_API_KEY` (required)

## Development

```bash
npm run dev
npm run test
```

## Notes

- This server currently depends on the `prism-os` SDK package specified in `package.json`.
- Keep this README aligned with `package.json` for version and tool-count claims.
