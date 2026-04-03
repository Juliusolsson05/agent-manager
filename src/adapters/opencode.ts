import { homedir } from "os";
import { join } from "path";
import type { Adapter, McpServer } from "./types.js";
import { readJson, writeJson } from "../lib/fs-utils.js";

export const opencodeAdapter: Adapter = {
  name: "OpenCode",
  id: "opencode",
  supportsCommands: true,

  getCommandsDir() {
    // OpenCode doesn't use a file-based commands directory
    // Commands are synced via syncCommand() into the JSON config
    return null;
  },

  getMcpConfigPath(scope, projectRoot) {
    if (scope === "global") return join(homedir(), ".config", "opencode", "config.json");
    return join(projectRoot, "opencode.json");
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

  async syncCommand(name, description, body, scope, projectRoot) {
    const path = this.getMcpConfigPath(scope, projectRoot);
    const existing = readJson(path);
    const commands = (existing.commands ?? {}) as Record<string, { description: string; prompt: string }>;
    commands[name] = { description: description || `${name} command`, prompt: body };
    existing.commands = commands;
    writeJson(path, existing);
  },
};
