import { join } from "path";
import chalk from "chalk";
import { findProjectRoot, getCommandsDir, GLOBAL_COMMANDS_DIR, getProfileCommandsDir } from "../lib/paths.js";
import { loadConfig } from "../lib/config.js";
import { getAdapters } from "../adapters/index.js";
import { listMarkdownFiles, syncFile } from "../lib/fs-utils.js";
import type { SyncResult } from "../adapters/types.js";

interface CommandSource {
  file: string;
  sourcePath: string;
  scope: "project" | "profile" | "global";
}

function collectCommands(projectRoot: string | null): CommandSource[] {
  const seen = new Map<string, CommandSource>();

  // Global commands (lowest priority)
  const globalConfig = loadConfig("global");
  const globalFiles = listMarkdownFiles(GLOBAL_COMMANDS_DIR);
  for (const file of globalFiles) {
    seen.set(file, { file, sourcePath: join(GLOBAL_COMMANDS_DIR, file), scope: "global" });
  }

  // Profile commands (medium priority)
  if (globalConfig.activeProfile) {
    const profileDir = getProfileCommandsDir(globalConfig.activeProfile);
    const profileFiles = listMarkdownFiles(profileDir);
    for (const file of profileFiles) {
      seen.set(file, { file, sourcePath: join(profileDir, file), scope: "profile" });
    }
  }

  // Project commands (highest priority)
  if (projectRoot) {
    const projectDir = getCommandsDir("project", projectRoot);
    const projectFiles = listMarkdownFiles(projectDir);
    for (const file of projectFiles) {
      seen.set(file, { file, sourcePath: join(projectDir, file), scope: "project" });
    }
  }

  return Array.from(seen.values());
}

export function syncCommand(options: { global?: boolean }): void {
  if (options.global) {
    syncSingleScope("global", "", GLOBAL_COMMANDS_DIR);
    return;
  }

  const root = findProjectRoot();
  if (!root) {
    console.log(chalk.red("Not in an agent-mgr project. Run `agent-mgr init` first."));
    return;
  }

  const config = loadConfig("project", root);
  if (config.targets.length === 0) {
    console.log(chalk.red("No targets configured. Run `agent-mgr init` first."));
    return;
  }

  const commands = collectCommands(root);
  if (commands.length === 0) {
    console.log(chalk.yellow("No commands found. Add some with: amgr add <name>"));
    return;
  }

  const targetAdapters = getAdapters(config.targets);
  const results: (SyncResult & { scope: string })[] = [];

  for (const cmd of commands) {
    for (const adapter of targetAdapters) {
      if (!adapter.supportsCommands) {
        results.push({ target: adapter.name, command: cmd.file, status: "skipped", reason: "no command support", scope: cmd.scope });
        continue;
      }

      const targetDir = adapter.getCommandsDir("project", root);
      if (!targetDir) {
        results.push({ target: adapter.name, command: cmd.file, status: "skipped", reason: "no directory for scope", scope: cmd.scope });
        continue;
      }

      try {
        const destPath = join(targetDir, cmd.file);
        syncFile(cmd.sourcePath, destPath);
        results.push({ target: adapter.name, command: cmd.file, status: "synced", scope: cmd.scope });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        results.push({ target: adapter.name, command: cmd.file, status: "failed", reason: msg, scope: cmd.scope });
      }
    }
  }

  let synced = 0;
  let skipped = 0;
  let failed = 0;

  for (const r of results) {
    if (r.status === "synced") {
      const scopeTag = chalk.dim(`[${r.scope}]`);
      console.log(chalk.green(`✓ ${r.command} → ${r.target} ${scopeTag}`));
      synced++;
    } else if (r.status === "skipped") {
      skipped++;
    } else {
      console.log(chalk.red(`✗ ${r.command} → ${r.target}: ${r.reason}`));
      failed++;
    }
  }

  console.log("");
  console.log(`Synced ${chalk.green(String(synced))} command(s) to ${targetAdapters.filter(a => a.supportsCommands).length} target(s)`);
  if (skipped > 0) console.log(chalk.dim(`Skipped ${skipped} (no command support)`));
  if (failed > 0) console.log(chalk.red(`Failed: ${failed}`));
}

function syncSingleScope(scope: "project" | "global", projectRoot: string, commandsDir: string): void {
  const config = loadConfig(scope, projectRoot || undefined);
  if (config.targets.length === 0) {
    console.log(chalk.red("No targets configured."));
    return;
  }

  const files = listMarkdownFiles(commandsDir);
  if (files.length === 0) {
    console.log(chalk.yellow("No commands found."));
    return;
  }

  const targetAdapters = getAdapters(config.targets);
  let synced = 0;

  for (const file of files) {
    const sourcePath = join(commandsDir, file);
    for (const adapter of targetAdapters) {
      if (!adapter.supportsCommands) continue;
      const targetDir = adapter.getCommandsDir(scope, projectRoot);
      if (!targetDir) continue;
      try {
        syncFile(sourcePath, join(targetDir, file));
        console.log(chalk.green(`✓ ${file} → ${adapter.name}`));
        synced++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.log(chalk.red(`✗ ${file} → ${adapter.name}: ${msg}`));
      }
    }
  }

  console.log(`\nSynced ${chalk.green(String(synced))} command(s)`);
}
