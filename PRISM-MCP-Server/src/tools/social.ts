import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { prism } from "../client.js";
import { RENDER_HINTS } from "../render-hints.js";

export function registerSocialTools(server: McpServer) {
  server.registerTool(
    "social_sentiment",
    {
      description: "Get social sentiment score for a crypto asset with bullish/bearish breakdown",
      inputSchema: {
        symbol: z.string().describe("Crypto asset symbol"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.social_sentiment },
    },
    async ({ symbol }) => {
      const result = await prism.social.getSentiment(symbol);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.social_sentiment }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_social_mentions",
    {
      description: "Get social mention count and trending posts",
      inputSchema: {
        symbol: z.string().describe("Crypto asset symbol"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.social_mentions },
    },
    async ({ symbol }) => {
      const result = await prism.social.getMentions(symbol);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.social_mentions }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_trending_score",
    {
      description: "Get trending score (composite of social velocity and mentions)",
      inputSchema: {
        symbol: z.string().describe("Crypto asset symbol"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.trending_score },
    },
    async ({ symbol }) => {
      const result = await prism.social.getTrendingScore(symbol);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.trending_score }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_github_activity",
    {
      description: "Get GitHub development activity (commits, contributors, stars)",
      inputSchema: {
        symbol: z.string().describe("Crypto asset symbol"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.github_activity },
    },
    async ({ symbol }) => {
      const result = await prism.social.getGithub(symbol);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ ...result, _ui: RENDER_HINTS.github_activity }, null, 2),
        }],
      };
    }
  );

  server.registerTool(
    "get_trending_social",
    {
      description: "Get trending tokens by social velocity",
      inputSchema: {
        limit: z.number().optional().describe("Number of assets to return (default 20)"),
      },
      annotations: { readOnlyHint: true },
      _meta: { 'x-prism-ui': RENDER_HINTS.trending_social },
    },
    async ({ limit }) => {
      const result = await prism.social.getTrending(limit);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ trending: result, _ui: RENDER_HINTS.trending_social }, null, 2),
        }],
      };
    }
  );
}
