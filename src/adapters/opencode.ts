import { homedir } from "os";
import { join } from "path";
import type { Adapter, McpServer } from "./types.js";
import { readJson, writeJson } from "../lib/fs-utils.js";

export const opencodeAdapter: Adapter = {
  name: "OpenCode",
  id: "opencode",
  supportsCommands: true,

  getCommandsDir(scope, projectRoot) {
    if (scope === "global") return join(homedir(), ".config", "opencode", "commands");
    return join(projectRoot, ".opencode", "commands");
  },

  getMcpConfigPath(scope, projectRoot) {
    if (scope === "global") return join(homedir(), ".config", "opencode", ".opencode.json");
    return join(projectRoot, ".opencode.json");
  },

  async readMcpConfig(scope, projectRoot) {
    const path = this.getMcpConfigPath(scope, projectRoot);
    const data = readJson(path) as { mcpServers?: Record<string, Record<string, unknown>> };
    const mcpServers = data.mcpServers ?? {};
    const result: Record<string, McpServer> = {};
    for (const [name, cfg] of Object.entries(mcpServers)) {
      const envArray = (cfg.env as string[]) ?? [];
      const envMap: Record<string, string> = {};
      for (const entry of envArray) {
        const [k, ...v] = entry.split("=");
        if (k) envMap[k] = v.join("=");
      }
      result[name] = {
        name,
        command: (cfg.command as string) ?? "",
        args: (cfg.args as string[]) ?? [],
        env: envMap,
      };
    }
    return result;
  },

  async writeMcpConfig(servers, scope, projectRoot) {
    const path = this.getMcpConfigPath(scope, projectRoot);
    const existing = readJson(path);
    const mcpServers = (existing.mcpServers ?? {}) as Record<string, unknown>;
    for (const [name, server] of Object.entries(servers)) {
      const envArray = Object.entries(server.env ?? {}).map(([k, v]) => `${k}=${v}`);
      mcpServers[name] = {
        command: server.command,
        args: server.args ?? [],
        env: envArray.length > 0 ? envArray : undefined,
      };
    }
    existing.mcpServers = mcpServers;
    writeJson(path, existing);
  },
};
