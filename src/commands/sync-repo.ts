import { join } from "path";
import { existsSync, copyFileSync, rmSync } from "fs";
import { execSync } from "child_process";
import chalk from "chalk";
import { loadConfig, saveConfig } from "../lib/config.js";
import { ensureDir, listMarkdownFiles } from "../lib/fs-utils.js";
import { GLOBAL_REPOS_DIR, GLOBAL_COMMANDS_DIR, getProfileCommandsDir } from "../lib/paths.js";

function parseRepoUrl(url: string): { owner: string; name: string; cloneUrl: string } | null {
  const match = url.match(/(?:https?:\/\/)?(?:github\.com\/)?([^\/]+)\/([^\/\s.]+?)(?:\.git)?$/);
  if (!match) return null;
  const owner = match[1];
  const name = match[2];
  const cloneUrl = `https://github.com/${owner}/${name}.git`;
  return { owner, name, cloneUrl };
}

function getRepoCacheDir(owner: string, name: string): string {
  return join(GLOBAL_REPOS_DIR, `${owner}-${name}`);
}

export function syncRepoCommand(url: string, options: { profile?: string }): void {
  const parsed = parseRepoUrl(url);
  if (!parsed) {
    console.log(chalk.red("Invalid repo URL. Use: github.com/owner/repo or owner/repo"));
    return;
  }

  const { owner, name, cloneUrl } = parsed;
  const cacheDir = getRepoCacheDir(owner, name);

  if (existsSync(cacheDir)) {
    console.log(chalk.dim(`Updating ${owner}/${name}...`));
    try {
      execSync("git pull --ff-only", { cwd: cacheDir, stdio: "pipe" });
    } catch {
      console.log(chalk.yellow("Pull failed, re-cloning..."));
      rmSync(cacheDir, { recursive: true, force: true });
      execSync(`git clone --depth 1 ${cloneUrl} ${cacheDir}`, { stdio: "pipe" });
    }
  } else {
    console.log(chalk.dim(`Cloning ${owner}/${name}...`));
    ensureDir(GLOBAL_REPOS_DIR);
    try {
      execSync(`git clone --depth 1 ${cloneUrl} ${cacheDir}`, { stdio: "pipe" });
    } catch {
      console.log(chalk.red(`Failed to clone ${cloneUrl}. Check the URL and your git authentication.`));
      return;
    }
  }

  const repoCommandsDir = join(cacheDir, "commands");
  if (!existsSync(repoCommandsDir)) {
    console.log(chalk.red(`No commands/ directory found in ${owner}/${name}.`));
    return;
  }

  const files = listMarkdownFiles(repoCommandsDir);
  if (files.length === 0) {
    console.log(chalk.yellow(`No .md files found in ${owner}/${name}/commands/`));
    return;
  }

  let destDir: string;
  const config = loadConfig("global");

  if (options.profile) {
    destDir = getProfileCommandsDir(options.profile);
    ensureDir(destDir);
  } else if (config.activeProfile) {
    destDir = getProfileCommandsDir(config.activeProfile);
    ensureDir(destDir);
  } else {
    destDir = GLOBAL_COMMANDS_DIR;
    ensureDir(destDir);
  }

  let copied = 0;
  for (const file of files) {
    const src = join(repoCommandsDir, file);
    const dest = join(destDir, file);
    copyFileSync(src, dest);
    console.log(chalk.green(`✓ ${file}`));
    copied++;
  }

  if (!config.repos) config.repos = [];
  if (!config.repos.includes(url)) {
    config.repos.push(url);
    saveConfig(config, "global");
  }

  console.log("");
  console.log(`Imported ${chalk.green(String(copied))} command(s) from ${owner}/${name}`);
  console.log(chalk.dim("Run `amgr sync` to distribute to your platforms."));
}

export function syncRepoUpdateCommand(): void {
  const config = loadConfig("global");
  if (!config.repos || config.repos.length === 0) {
    console.log(chalk.yellow("No tracked repos. Add one with: amgr sync-repo add <url>"));
    return;
  }

  for (const url of config.repos) {
    console.log(chalk.bold(`\n${url}`));
    syncRepoCommand(url, {});
  }
}

export function syncRepoListCommand(): void {
  const config = loadConfig("global");
  if (!config.repos || config.repos.length === 0) {
    console.log(chalk.yellow("No tracked repos."));
    return;
  }

  console.log(chalk.bold("\nTracked repos:\n"));
  for (const url of config.repos) {
    const parsed = parseRepoUrl(url);
    if (parsed) {
      const cacheDir = getRepoCacheDir(parsed.owner, parsed.name);
      const cached = existsSync(cacheDir) ? chalk.green("cached") : chalk.dim("not cached");
      console.log(`  ${url} (${cached})`);
    } else {
      console.log(`  ${url}`);
    }
  }
  console.log("");
}

export function syncRepoRemoveCommand(url: string): void {
  const config = loadConfig("global");
  if (!config.repos || !config.repos.includes(url)) {
    console.log(chalk.red(`Repo "${url}" is not tracked.`));
    return;
  }

  config.repos = config.repos.filter(r => r !== url);
  saveConfig(config, "global");

  const parsed = parseRepoUrl(url);
  if (parsed) {
    const cacheDir = getRepoCacheDir(parsed.owner, parsed.name);
    if (existsSync(cacheDir)) {
      rmSync(cacheDir, { recursive: true, force: true });
    }
  }

  console.log(chalk.green(`✓ Removed ${url}`));
}
