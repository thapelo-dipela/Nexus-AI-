# Development context

This directory contains a reusable ERC-8004 trading-agent template.
Configure your own deployment using `.env.example`; never commit wallet keys,
server credentials, deployment identity files, or operational notes.

## Validation

Run `npm ci`, `npm run compile`, and `npm test` from this directory.
Use a local Hardhat network for development. External-network scripts require
explicit environment configuration and can submit transactions.

## Components

- `contracts/`: registries, vault, and risk router.
- `src/`: agent identity, exchange adapter, and signed decision records.
- `scripts/`: deployment and optional administration utilities.
- `tutorial/`: reusable integration walkthroughs.

The leaderboard uses ethers v5; the TypeScript source uses ethers v6.
