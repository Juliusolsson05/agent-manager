import { join } from "path";
import { existsSync, lstatSync, readlinkSync } from "fs";
import { resolve, dirname } from "path";
import chalk from "chalk";
import { findProjectRoot, getCommandsDir, GLOBAL_COMMANDS_DIR, getProfileCommandsDir } from "../lib/paths.js";
import { loadConfig } from "../lib/config.js";
import { getAdapters } from "../adapters/index.js";
import { listMarkdownFiles } from "../lib/fs-utils.js";

interface CommandEntry {
  file: string;
  sourcePath: string;
  scope: "project" | "profile" | "global";
}

function collectAllCommands(projectRoot: string | null): CommandEntry[] {
  const seen = new Map<string, CommandEntry>();

  const globalFiles = listMarkdownFiles(GLOBAL_COMMANDS_DIR);
  for (const file of globalFiles) {
    seen.set(file, { file, sourcePath: join(GLOBAL_COMMANDS_DIR, file), scope: "global" });
  }

  const globalConfig = loadConfig("global");
  if (globalConfig.activeProfile) {
    const profileDir = getProfileCommandsDir(globalConfig.activeProfile);
    const profileFiles = listMarkdownFiles(profileDir);
    for (const file of profileFiles) {
      seen.set(file, { file, sourcePath: join(profileDir, file), scope: "profile" });
    }
  }

  if (projectRoot) {
    const projectDir = getCommandsDir("project", projectRoot);
    const projectFiles = listMarkdownFiles(projectDir);
    for (const file of projectFiles) {
      seen.set(file, { file, sourcePath: join(projectDir, file), scope: "project" });
    }
  }

  return Array.from(seen.values());
}

export function listCommand(options: { global?: boolean }): void {
  let projectRoot: string | null = null;

  if (!options.global) {
    projectRoot = findProjectRoot();
    if (!projectRoot) {
      console.log(chalk.red("Not in an agent-mgr project. Run `agent-mgr init` first."));
      return;
    }
  }

  const config = options.global
    ? loadConfig("global")
    : loadConfig("project", projectRoot!);
  const targetAdapters = getAdapters(config.targets).filter(a => a.supportsCommands);

  const commands = options.global
    ? listMarkdownFiles(GLOBAL_COMMANDS_DIR).map(f => ({ file: f, sourcePath: join(GLOBAL_COMMANDS_DIR, f), scope: "global" as const }))
    : collectAllCommands(projectRoot);

  if (commands.length === 0) {
    console.log(chalk.yellow("No commands found."));
    return;
  }

  console.log(chalk.bold("\nCommands:\n"));

  for (const cmd of commands) {
    const statuses: string[] = [];

    for (const adapter of targetAdapters) {
      // All commands (regardless of source scope) are synced into project target dirs
      const dir = adapter.getCommandsDir(options.global ? "global" : "project", projectRoot ?? "");
      if (!dir) {
        statuses.push(chalk.dim(`${adapter.id} —`));
        continue;
      }
      const targetPath = join(dir, cmd.file);
      if (existsSync(targetPath)) {
        const isSymlink = lstatSync(targetPath).isSymbolicLink();
        if (isSymlink) {
          const linkTarget = resolve(dirname(targetPath), readlinkSync(targetPath));
          const inSync = linkTarget === resolve(cmd.sourcePath);
          statuses.push(inSync ? chalk.green(`${adapter.id} ✓`) : chalk.yellow(`${adapter.id} ⚠`));
        } else {
          statuses.push(chalk.yellow(`${adapter.id} ✓ (copy)`));
        }
      } else {
        statuses.push(chalk.red(`${adapter.id} ✗`));
      }
    }

    const scopeTag = chalk.dim(`[${cmd.scope}]`);
    console.log(`  ${cmd.file.padEnd(25)} ${scopeTag.padEnd(20)} ${statuses.join("  ")}`);
  }

  console.log("");
}
