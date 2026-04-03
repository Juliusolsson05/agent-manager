import chalk from "chalk";
import { findProjectRoot } from "../lib/paths.js";
import { loadConfig } from "../lib/config.js";
import { getAdapters } from "../adapters/index.js";
import { readJson, writeJson } from "../lib/fs-utils.js";

export async function mcpRemoveCommand(name: string, options: { global?: boolean }): Promise<void> {
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

  for (const adapter of targetAdapters) {
    try {
      const mcpPath = adapter.getMcpConfigPath(scope, projectRoot);
      const data = readJson(mcpPath) as { mcpServers?: Record<string, unknown> };
      if (data.mcpServers && name in data.mcpServers) {
        delete data.mcpServers[name];
        writeJson(mcpPath, data);
        console.log(chalk.green(`✓ Removed ${name} from ${adapter.name}`));
      } else {
        console.log(chalk.dim(`  ${adapter.name}: ${name} not found`));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(chalk.red(`✗ ${adapter.name}: ${msg}`));
    }
  }
}
