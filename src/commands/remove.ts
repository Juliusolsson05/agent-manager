import { join } from "path";
import chalk from "chalk";
import { findProjectRoot, getCommandsDir, GLOBAL_COMMANDS_DIR } from "../lib/paths.js";
import { removeFile } from "../lib/fs-utils.js";
import { loadConfig } from "../lib/config.js";
import { getAdapters } from "../adapters/index.js";

export async function removeCommand(name: string, options: { global?: boolean }): Promise<void> {
  const scope = options.global ? "global" : "project";
  const cleanName = name.replace(/\.md$/, "");

  let commandsDir: string;
  let projectRoot: string;

  if (scope === "global") {
    commandsDir = GLOBAL_COMMANDS_DIR;
    projectRoot = "";
  } else {
    const root = findProjectRoot();
    if (!root) {
      console.log(chalk.red("Not in an agent-mgr project. Run `agent-mgr init` first."));
      return;
    }
    projectRoot = root;
    commandsDir = getCommandsDir("project", root);
  }

  // Remove source file
  const sourcePath = join(commandsDir, `${cleanName}.md`);
  const removed = removeFile(sourcePath);
  if (!removed) {
    console.log(chalk.red(`Command "${cleanName}" not found.`));
    return;
  }
  console.log(chalk.green(`✓ Removed ${sourcePath}`));

  // Remove from all target adapters
  const config = loadConfig(scope === "global" ? "global" : "project", projectRoot || undefined);
  const targetAdapters = getAdapters(config.targets);

  for (const adapter of targetAdapters) {
    if (!adapter.supportsCommands) continue;

    // File-based removal
    const dir = adapter.getCommandsDir(scope, projectRoot);
    if (dir) {
      const targetPath = join(dir, `${cleanName}.md`);
      if (removeFile(targetPath)) {
        console.log(chalk.green(`✓ Removed from ${adapter.name}`));
      }
    }

    // Config-based removal
    if (adapter.removeCommand) {
      const didRemove = await adapter.removeCommand(cleanName, scope, projectRoot);
      if (didRemove) {
        console.log(chalk.green(`✓ Removed from ${adapter.name} config`));
      }
    }
  }
}
