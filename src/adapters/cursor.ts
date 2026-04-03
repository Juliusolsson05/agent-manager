import { homedir } from "os";
import { join } from "path";
import type { Adapter, McpServer } from "./types.js";
import { readJson, writeJson } from "../lib/fs-utils.js";

export const cursorAdapter: Adapter = {
  name: "Cursor",
  id: "cursor",
  supportsCommands: true,

  getCommandsDir(scope, projectRoot) {
    if (scope === "global") return join(homedir(), ".cursor", "commands");
    return join(projectRoot, ".cursor", "commands");
  },

  getMcpConfigPath(scope, projectRoot) {
    if (scope === "global") return join(homedir(), ".cursor", "mcp.json");
    return join(projectRoot, ".cursor", "mcp.json");
  },

  async readMcpConfig(scope, projectRoot) {
    const path = this.getMcpConfigPath(scope, projectRoot);
    const data = readJson(path) as { mcpServers?: Record<string, McpServer> };
    return data.mcpServers ?? {};
  },

  async writeMcpConfig(servers, scope, projectRoot) {
    const path = this.getMcpConfigPath(scope, projectRoot);
    const existing = readJson(path);
    existing.mcpServers = {
      ...(existing.mcpServers as Record<string, unknown> ?? {}),
      ...servers,
    };
    writeJson(path, existing);
  },
};
