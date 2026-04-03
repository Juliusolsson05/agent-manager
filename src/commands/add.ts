import { join, basename } from "path";
import { existsSync, writeFileSync, readFileSync } from "fs";
import chalk from "chalk";
import { findProjectRoot, getCommandsDir, GLOBAL_COMMANDS_DIR } from "../lib/paths.js";
import { ensureDir } from "../lib/fs-utils.js";

interface AddOptions {
  global?: boolean;
  from?: string;
  content?: string;
}

export function addCommand(name: string, options: AddOptions): void {
  const scope = options.global ? "global" : "project";

  let commandsDir: string;
  if (scope === "global") {
    commandsDir = GLOBAL_COMMANDS_DIR;
  } else {
    const root = findProjectRoot();
    if (!root) {
      console.log(chalk.red("Not in an agent-mgr project. Run `agent-mgr init` first."));
      return;
    }
    commandsDir = getCommandsDir("project", root);
  }

  const cleanName = name.replace(/\.md$/, "");
  const filePath = join(commandsDir, `${cleanName}.md`);

  if (existsSync(filePath)) {
    console.log(chalk.yellow(`Command "${cleanName}" already exists at ${filePath}`));
    return;
  }

  ensureDir(commandsDir);

  let fileContent: string;

  if (options.from) {
    const sourcePath = options.from;
    if (!existsSync(sourcePath)) {
      console.log(chalk.red(`File not found: ${sourcePath}`));
      return;
    }
    const sourceContent = readFileSync(sourcePath, "utf-8");
    // If the source already has frontmatter, use it as-is
    if (sourceContent.trimStart().startsWith("---")) {
      fileContent = sourceContent;
    } else {
      fileContent = `---\ndescription: ${cleanName} command\n---\n\n${sourceContent}`;
    }
  } else if (options.content) {
    fileContent = `---\ndescription: ${cleanName} command\n---\n\n${options.content}\n\n$ARGUMENTS\n`;
  } else {
    fileContent = `---\ndescription: ${cleanName} command\n---\n\n$ARGUMENTS\n`;
  }

  writeFileSync(filePath, fileContent);
  console.log(chalk.green(`✓ Created ${filePath}`));
  console.log(chalk.dim("Sync with: amgr sync"));
}
