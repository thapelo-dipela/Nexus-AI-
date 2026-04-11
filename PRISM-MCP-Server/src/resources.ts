import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { prism } from "./client.js";

/**
 * Register MCP resources for passive data access.
 * Resources provide frequently-accessed data that can be read without tool invocation.
 */
export function registerResources(server: McpServer) {
  // Note: Resources temporarily disabled due to API changes in MCP SDK
  // Will be re-enabled once MCP resource API is stabilized
  
  // Resources can be added later via server.registerResource() once the API is confirmed
  console.log("Resources registration skipped - will be added in future update");
}
