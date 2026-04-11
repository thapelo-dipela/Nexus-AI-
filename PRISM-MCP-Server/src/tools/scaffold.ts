import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

type Template = "equity-overview" | "crypto-trader" | "portfolio-tracker";
type Framework = "nextjs" | "react";

interface ScaffoldFile {
  filename: string;
  content: string;
}

function defaultSymbol(template: Template): string {
  return template === "crypto-trader" ? "BTC" : "AAPL";
}

// ---------------------------------------------------------------------------
// Template component mapping
// ---------------------------------------------------------------------------

function componentForTemplate(template: Template): { name: string; import: string } {
  switch (template) {
    case "equity-overview":
      return { name: "EquityOverview", import: "EquityOverview" };
    case "crypto-trader":
      return { name: "CryptoTrader", import: "CryptoTrader" };
    case "portfolio-tracker":
      return { name: "PortfolioTracker", import: "PortfolioTracker" };
  }
}

// ---------------------------------------------------------------------------
// Shared: PrismOS client init
// ---------------------------------------------------------------------------

function prismClientFile(includeTypes: boolean): string {
  const ts = includeTypes
    ? `import PrismFinanceOS from "prism-finance-os";

const prism = new PrismFinanceOS({
  apiKey: process.env.PRISM_API_KEY!,
});

export default prism;
`
    : `import PrismFinanceOS from "prism-finance-os";

const prism = new PrismFinanceOS({
  apiKey: process.env.PRISM_API_KEY,
});

export default prism;
`;
  return ts;
}

// ---------------------------------------------------------------------------
// Next.js generators
// ---------------------------------------------------------------------------

function nextjsFiles(
  template: Template,
  symbol: string,
  includeTypes: boolean,
): ScaffoldFile[] {
  const comp = componentForTemplate(template);

  const page = `"use client";

import { ${comp.import} } from "@prismapi/ui";
import prism from "../../lib/prism";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-zinc-950 p-6">
      <${comp.name} symbol="${symbol}" client={prism} />
    </main>
  );
}
`;

  const layout = `import type { Metadata } from "next";
import { PrismProvider } from "@prismapi/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "PRISM Dashboard",
  description: "Financial dashboard powered by PrismOS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PrismProvider>
          {children}
        </PrismProvider>
      </body>
    </html>
  );
}
`;

  const prismFile = prismClientFile(includeTypes);

  return [
    { filename: "app/dashboard/page.tsx", content: page },
    { filename: "app/layout.tsx", content: layout },
    { filename: "lib/prism.ts", content: prismFile },
  ];
}

// ---------------------------------------------------------------------------
// React (Vite / CRA) generators
// ---------------------------------------------------------------------------

function reactFiles(
  template: Template,
  symbol: string,
  includeTypes: boolean,
): ScaffoldFile[] {
  const comp = componentForTemplate(template);

  const dashboard = `import { ${comp.import} } from "@prismapi/ui";
import prism from "./prism";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-zinc-950 p-6">
      <${comp.name} symbol="${symbol}" client={prism} />
    </main>
  );
}
`;

  const app = `import { PrismProvider } from "@prismapi/ui";
import Dashboard from "./Dashboard";

export default function App() {
  return (
    <PrismProvider>
      <Dashboard />
    </PrismProvider>
  );
}
`;

  const prismFile = prismClientFile(includeTypes);

  return [
    { filename: "src/Dashboard.tsx", content: dashboard },
    { filename: "src/App.tsx", content: app },
    { filename: "src/prism.ts", content: prismFile },
  ];
}

// ---------------------------------------------------------------------------
// Tool registration
// ---------------------------------------------------------------------------

export function registerScaffoldTools(server: McpServer) {
  server.registerTool(
    "prism_scaffold",
    {
      description:
        "Generate ready-to-run dashboard code using @prismapi/ui components. " +
        "Returns an array of { filename, content } objects that can be written to disk " +
        "to create a working financial dashboard.",
      inputSchema: {
        template: z.enum(["equity-overview", "crypto-trader", "portfolio-tracker"])
          .describe("Dashboard template to scaffold"),
        symbol: z.string().optional()
          .describe('Ticker or token symbol (default "AAPL" for equity, "BTC" for crypto)'),
        framework: z.enum(["nextjs", "react"]).optional().default("nextjs")
          .describe("Target framework (default nextjs)"),
        includeTypes: z.boolean().optional().default(true)
          .describe("Include TypeScript type annotations (default true)"),
      },
    },
    async ({ template, symbol, framework, includeTypes }) => {
      const resolvedSymbol = symbol ?? defaultSymbol(template);
      const resolvedFramework: Framework = framework ?? "nextjs";
      const resolvedTypes = includeTypes ?? true;

      const files: ScaffoldFile[] =
        resolvedFramework === "nextjs"
          ? nextjsFiles(template, resolvedSymbol, resolvedTypes)
          : reactFiles(template, resolvedSymbol, resolvedTypes);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(files, null, 2),
          },
        ],
      };
    },
  );
}
