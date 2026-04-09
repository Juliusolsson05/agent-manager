import chalk from "chalk";
import { input, checkbox } from "@inquirer/prompts";
import { findProjectRoot } from "../lib/paths.js";
import { loadConfig } from "../lib/config.js";
import { getAdapters, ALL_TARGET_IDS } from "../adapters/index.js";
import type { McpServer } from "../adapters/types.js";

interface McpAddOptions {
  global?: boolean;
  name?: string;
  command?: string;
  args?: string;
  env?: string;
  targets?: string;
}

export async function mcpAddCommand(options: McpAddOptions): Promise<void> {
  const scope = options.global ? "global" : "project";

  let projectRoot: string;
  if (scope === "project") {
    const root = findProjectRoot();
    if (!root) {
      console.log(chalk.red("Not in an agent-mgr project. Run `agent-mgr init` first."));
      return;
    }
    projectRoot = root;
  } else {
    projectRoot = "";
  }

  const config = loadConfig(scope, projectRoot || undefined);

  const name = options.name ?? await input({ message: "MCP server name:" });
  const command = options.command ?? await input({ message: "Command:" });

  const argsRaw = options.args ?? await input({ message: "Arguments (space-separated, or empty):" });
  const envRaw = options.env ?? await input({ message: "Environment variables (KEY=VAL KEY=VAL, or empty):" });

  const args = argsRaw.trim() ? argsRaw.trim().split(/\s+/) : undefined;
  const env: Record<string, string> | undefined = envRaw.trim()
    ? Object.fromEntries(envRaw.trim().split(/\s+/).map(pair => {
        const [k, ...v] = pair.split("=");
        return [k, v.join("=")];
      }))
    : undefined;

  let targets: string[];
  if (options.targets) {
    targets = options.targets.split(",").map(t => t.trim());
    const invalid = targets.filter(t => !ALL_TARGET_IDS.includes(t));
    if (invalid.length > 0) {
      console.log(chalk.red(`Unknown targets: ${invalid.join(", ")}`));
      console.log(chalk.dim(`Available: ${ALL_TARGET_IDS.join(", ")}`));
      return;
    }
  } else {
    const availableTargets = config.targets.length > 0 ? config.targets : ALL_TARGET_IDS;
    targets = await checkbox({
      message: "Which tools?",
      choices: availableTargets.map(id => ({ name: id, value: id })),
    });
  }

  const targetAdapters = getAdapters(targets);

  for (const adapter of targetAdapters) {
    try {
      await adapter.writeMcpConfig(
        { [name]: { name, command, args: args ?? [], env: env ?? {} } },
        scope,
        projectRoot,
      );
      console.log(chalk.green(`✓ ${name} → ${adapter.name}`));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(chalk.red(`✗ ${adapter.name}: ${msg}`));
    }
  }
}
