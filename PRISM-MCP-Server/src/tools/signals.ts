import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prism } from "../client.js";
import { RENDER_HINTS } from "../render-hints.js";

export function registerSignalsTools(server: McpServer) {
  server.registerTool(
    "get_signals",
    {
      description: "Get trading signals: momentum, volume spikes, breakouts, divergences",
      inputSchema: {
        symbols: z.string().optional().describe("Comma-separated symbols (optional, defaults to all)"),
        rsi_oversold: z.number().optional().describe("RSI oversold threshold (default 30)"),
        rsi_overbought: z.number().optional().describe("RSI overbought threshold (default 70)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.get_signals },
    },
    async ({ symbols, rsi_oversold, rsi_overbought }) => {
      const result = await prism.signals.getMomentum({ symbols, rsi_oversold, rsi_overbought });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ signals: result, _ui: RENDER_HINTS.get_signals }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "detect_volume_spikes",
    {
      description: "Detect unusual volume surges vs average (potential breakout signals)",
      inputSchema: {
        symbols: z.string().optional().describe("Comma-separated symbols (optional)"),
        spike_threshold: z.number().optional().describe("Volume spike threshold (default 2.0 = 2x avg)"),
        lookback_periods: z.number().optional().describe("Periods to look back"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.volume_spikes },
    },
    async ({ symbols, spike_threshold, lookback_periods }) => {
      const result = await prism.signals.getVolumeSpikes({ symbols, spike_threshold, lookback_periods });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ spikes: result, _ui: RENDER_HINTS.volume_spikes }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "detect_breakouts",
    {
      description: "Detect price breakouts above resistance or below support",
      inputSchema: {
        symbols: z.string().optional().describe("Comma-separated symbols (optional)"),
        lookback_periods: z.number().optional().describe("Periods to determine support/resistance"),
        breakout_threshold: z.number().optional().describe("Breakout threshold percentage"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.breakouts },
    },
    async ({ symbols, lookback_periods, breakout_threshold }) => {
      const result = await prism.signals.getBreakouts({ symbols, lookback_periods, breakout_threshold });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ breakouts: result, _ui: RENDER_HINTS.breakouts }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "detect_divergence",
    {
      description: "Detect price vs indicator divergence (potential reversal signals)",
      inputSchema: {
        symbols: z.string().optional().describe("Comma-separated symbols (optional)"),
        lookback_periods: z.number().optional().describe("Periods to analyze"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.divergence },
    },
    async ({ symbols, lookback_periods }) => {
      const result = await prism.signals.getDivergence({ symbols, lookback_periods });
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ divergences: result, _ui: RENDER_HINTS.divergence }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_signal_summary",
    {
      description: "Get unified signal summary aggregating all signal types",
      inputSchema: {
        symbols: z.string().optional().describe("Comma-separated symbols (optional)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.signal_summary },
    },
    async ({ symbols }) => {
      const result = await prism.signals.getSummary(symbols);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.signal_summary }, null, 2),
        }],
      };
    }
  );
}
