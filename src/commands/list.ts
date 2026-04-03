import { join } from "path";
import { existsSync, lstatSync, readlinkSync } from "fs";
import { resolve, dirname } from "path";
import chalk from "chalk";
import { findProjectRoot, getCommandsDir, GLOBAL_COMMANDS_DIR } from "../lib/paths.js";
import { loadConfig } from "../lib/config.js";
import { getAdapters } from "../adapters/index.js";
import { listMarkdownFiles } from "../lib/fs-utils.js";

export function listCommand(options: { global?: boolean }): void {
  const scope = options.global ? "global" : "project";

  let projectRoot: string;
  let commandsDir: string;

  if (scope === "global") {
    projectRoot = "";
    commandsDir = GLOBAL_COMMANDS_DIR;
  } else {
    const root = findProjectRoot();
    if (!root) {
      console.log(chalk.red("Not in an agent-commands project. Run `agent-commands init` first."));
      return;
    }
    projectRoot = root;
    commandsDir = getCommandsDir("project", root);
  }

  const config = loadConfig(scope, projectRoot || undefined);
  const targetAdapters = getAdapters(config.targets).filter(a => a.supportsCommands);
  const files = listMarkdownFiles(commandsDir);

  if (files.length === 0) {
    console.log(chalk.yellow("No commands found."));
    return;
  }

  console.log(chalk.bold("\nCommands:\n"));

  for (const file of files) {
    const sourcePath = join(commandsDir, file);
    const statuses: string[] = [];

    for (const adapter of targetAdapters) {
      const dir = adapter.getCommandsDir(scope, projectRoot);
      if (!dir) {
        statuses.push(chalk.dim(`${adapter.id} —`));
        continue;
      }
      const targetPath = join(dir, file);
      if (existsSync(targetPath)) {
        const isSymlink = lstatSync(targetPath).isSymbolicLink();
        if (isSymlink) {
          const linkTarget = resolve(dirname(targetPath), readlinkSync(targetPath));
          const inSync = linkTarget === resolve(sourcePath);
          statuses.push(inSync ? chalk.green(`${adapter.id} ✓`) : chalk.yellow(`${adapter.id} ⚠`));
        } else {
          statuses.push(chalk.yellow(`${adapter.id} ✓ (copy)`));
        }
      } else {
        statuses.push(chalk.red(`${adapter.id} ✗`));
      }
    }

    console.log(`  ${file.padEnd(25)} ${statuses.join("  ")}`);
  }

  console.log("");
}
