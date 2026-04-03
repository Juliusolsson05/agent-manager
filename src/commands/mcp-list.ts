import chalk from "chalk";
import { findProjectRoot } from "../lib/paths.js";
import { loadConfig } from "../lib/config.js";
import { getAdapters } from "../adapters/index.js";

export async function mcpListCommand(options: { global?: boolean }): Promise<void> {
  const scope = options.global ? "global" : "project";

  let projectRoot: string;
  if (scope === "project") {
    const root = findProjectRoot();
    if (!root) {
      console.log(chalk.red("Not in an agent-commands project. Run `agent-commands init` first."));
      return;
    }
    projectRoot = root;
  } else {
    projectRoot = "";
  }

  const config = loadConfig(scope, projectRoot || undefined);
  const targetAdapters = getAdapters(config.targets);

  const serversByTarget = new Map<string, Set<string>>();
  const allServers = new Set<string>();

  for (const adapter of targetAdapters) {
    try {
      const servers = await adapter.readMcpConfig(scope, projectRoot);
      const names = new Set(Object.keys(servers));
      serversByTarget.set(adapter.id, names);
      for (const n of names) allServers.add(n);
    } catch {
      serversByTarget.set(adapter.id, new Set());
    }
  }

  if (allServers.size === 0) {
    console.log(chalk.yellow("No MCP servers configured."));
    return;
  }

  console.log(chalk.bold("\nMCP Servers:\n"));

  for (const server of allServers) {
    const statuses: string[] = [];
    for (const adapter of targetAdapters) {
      const has = serversByTarget.get(adapter.id)?.has(server);
      statuses.push(has ? chalk.green(`${adapter.id} ✓`) : chalk.red(`${adapter.id} ✗`));
    }
    console.log(`  ${server.padEnd(25)} ${statuses.join("  ")}`);
  }

  console.log("");
}
