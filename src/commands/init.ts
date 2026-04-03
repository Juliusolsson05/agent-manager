import { join } from "path";
import { existsSync, appendFileSync, readFileSync } from "fs";
import chalk from "chalk";
import { checkbox, confirm } from "@inquirer/prompts";
import { saveConfig } from "../lib/config.js";
import { ensureDir } from "../lib/fs-utils.js";
import {
  GLOBAL_DIR,
  GLOBAL_COMMANDS_DIR,
  PROJECT_CONFIG_FILE,
  PROJECT_COMMANDS_DIR,
} from "../lib/paths.js";

export async function initCommand(options: { global?: boolean }): Promise<void> {
  const scope = options.global ? "global" : "project";
  const cwd = process.cwd();

  if (scope === "project" && existsSync(join(cwd, PROJECT_CONFIG_FILE))) {
    console.log(chalk.yellow("Already initialized in this directory."));
    return;
  }

  if (scope === "global" && existsSync(join(GLOBAL_DIR, "config.yml"))) {
    console.log(chalk.yellow("Global config already exists at ~/.agent-commands/"));
    return;
  }

  const targets = await checkbox({
    message: "What platforms do you want to sync?",
    choices: [
      { name: "Claude Code", value: "claude-code" },
      { name: "Cursor", value: "cursor" },
      { name: "Codex", value: "codex" },
      { name: "OpenCode", value: "opencode" },
    ],
  });

  if (targets.length === 0) {
    console.log(chalk.red("No targets selected. Aborting."));
    return;
  }

  if (scope === "global") {
    ensureDir(GLOBAL_DIR);
    ensureDir(GLOBAL_COMMANDS_DIR);
    saveConfig({ targets }, "global");
    console.log(chalk.green("✓ Created ~/.agent-commands/config.yml"));
    console.log(chalk.green("✓ Created ~/.agent-commands/commands/"));
  } else {
    const commandsDir = join(cwd, PROJECT_COMMANDS_DIR);
    ensureDir(commandsDir);
    saveConfig({ targets }, "project", cwd);
    console.log(chalk.green(`✓ Created ${PROJECT_CONFIG_FILE}`));
    console.log(chalk.green(`✓ Created ${PROJECT_COMMANDS_DIR}/`));

    if (existsSync(join(cwd, ".git"))) {
      const shouldGitignore = await confirm({
        message: "Gitignore the generated platform command directories?",
        default: true,
      });

      if (shouldGitignore) {
        const excludePath = join(cwd, ".git", "info", "exclude");
        const excludeContent = existsSync(excludePath) ? readFileSync(excludePath, "utf-8") : "";
        const linesToAdd: string[] = [];

        for (const target of targets) {
          const dirs: Record<string, string> = {
            "claude-code": ".claude/commands/",
            cursor: ".cursor/prompts/",
            codex: ".codex/",
            opencode: "",
          };
          const dir = dirs[target];
          if (dir && !excludeContent.includes(dir)) {
            linesToAdd.push(dir);
          }
        }

        if (linesToAdd.length > 0) {
          const addition = "\n# agent-commands generated dirs\n" + linesToAdd.join("\n") + "\n";
          appendFileSync(excludePath, addition);
          console.log(chalk.green("✓ Added generated dirs to .git/info/exclude"));
        }
      }
    }
  }

  console.log(chalk.dim("\nAdd commands with: agent-commands add <name>"));
  console.log(chalk.dim("Sync with: agent-commands sync"));
}
