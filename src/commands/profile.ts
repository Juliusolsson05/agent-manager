import { existsSync, readdirSync, rmSync } from "fs";
import chalk from "chalk";
import { loadConfig, saveConfig } from "../lib/config.js";
import { ensureDir, listMarkdownFiles } from "../lib/fs-utils.js";
import { GLOBAL_PROFILES_DIR, getProfileDir, getProfileCommandsDir } from "../lib/paths.js";

export function profileCreateCommand(name: string): void {
  const profileDir = getProfileDir(name);
  if (existsSync(profileDir)) {
    console.log(chalk.yellow(`Profile "${name}" already exists.`));
    return;
  }

  ensureDir(getProfileCommandsDir(name));
  console.log(chalk.green(`✓ Created profile "${name}"`));
  console.log(chalk.dim(`  Commands dir: ${getProfileCommandsDir(name)}`));
  console.log(chalk.dim(`  Switch to it: ac profile switch ${name}`));
}

export function profileSwitchCommand(name: string): void {
  const profileDir = getProfileDir(name);
  if (!existsSync(profileDir)) {
    console.log(chalk.red(`Profile "${name}" does not exist. Create it first: ac profile create ${name}`));
    return;
  }

  const config = loadConfig("global");
  config.activeProfile = name;
  saveConfig(config, "global");
  console.log(chalk.green(`✓ Switched to profile "${name}"`));
  console.log(chalk.dim("Run `ac sync` to apply."));
}

export function profileListCommand(): void {
  if (!existsSync(GLOBAL_PROFILES_DIR)) {
    console.log(chalk.yellow("No profiles found."));
    return;
  }

  const entries = readdirSync(GLOBAL_PROFILES_DIR, { withFileTypes: true });
  const profiles = entries.filter(e => e.isDirectory()).map(e => e.name);

  if (profiles.length === 0) {
    console.log(chalk.yellow("No profiles found."));
    return;
  }

  const config = loadConfig("global");
  const active = config.activeProfile;

  console.log(chalk.bold("\nProfiles:\n"));
  for (const p of profiles) {
    const commands = listMarkdownFiles(getProfileCommandsDir(p));
    const isActive = p === active;
    const marker = isActive ? chalk.green(" (active)") : "";
    console.log(`  ${p}${marker} — ${commands.length} command(s)`);
  }
  console.log("");
}

export function profileDeleteCommand(name: string): void {
  const profileDir = getProfileDir(name);
  if (!existsSync(profileDir)) {
    console.log(chalk.red(`Profile "${name}" does not exist.`));
    return;
  }

  const config = loadConfig("global");
  if (config.activeProfile === name) {
    config.activeProfile = undefined;
    saveConfig(config, "global");
  }

  rmSync(profileDir, { recursive: true, force: true });
  console.log(chalk.green(`✓ Deleted profile "${name}"`));
}
