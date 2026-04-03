import { homedir } from "os";
import { join, resolve } from "path";
import { existsSync } from "fs";

export const GLOBAL_DIR = join(homedir(), ".agent-mgr");
export const GLOBAL_CONFIG_PATH = join(GLOBAL_DIR, "config.yml");
export const GLOBAL_COMMANDS_DIR = join(GLOBAL_DIR, "commands");
export const GLOBAL_MCP_PATH = join(GLOBAL_DIR, "mcp.json");

export const PROJECT_CONFIG_FILE = ".agent-mgr.yml";
export const PROJECT_MCP_FILE = ".agent-mgr-mcp.json";
export const PROJECT_COMMANDS_DIR = "commands";

export function findProjectRoot(from: string = process.cwd()): string | null {
  let dir = resolve(from);
  while (true) {
    if (existsSync(join(dir, PROJECT_CONFIG_FILE))) return dir;
    const parent = resolve(dir, "..");
    if (parent === dir) return null;
    dir = parent;
  }
}

export function getCommandsDir(scope: "project" | "global", projectRoot?: string): string {
  if (scope === "global") return GLOBAL_COMMANDS_DIR;
  return join(projectRoot ?? process.cwd(), PROJECT_COMMANDS_DIR);
}

export function getConfigPath(scope: "project" | "global", projectRoot?: string): string {
  if (scope === "global") return GLOBAL_CONFIG_PATH;
  return join(projectRoot ?? process.cwd(), PROJECT_CONFIG_FILE);
}

export function getMcpSourcePath(scope: "project" | "global", projectRoot?: string): string {
  if (scope === "global") return GLOBAL_MCP_PATH;
  return join(projectRoot ?? process.cwd(), PROJECT_MCP_FILE);
}

export const GLOBAL_PROFILES_DIR = join(GLOBAL_DIR, "profiles");
export const GLOBAL_REPOS_DIR = join(GLOBAL_DIR, "repos");

export function getProfileDir(profileName: string): string {
  return join(GLOBAL_PROFILES_DIR, profileName);
}

export function getProfileCommandsDir(profileName: string): string {
  return join(GLOBAL_PROFILES_DIR, profileName, "commands");
}

export function getRepoDir(owner: string, name: string): string {
  return join(GLOBAL_REPOS_DIR, `${owner}-${name}`);
}
