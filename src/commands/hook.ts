import { join } from "path";
import { existsSync, writeFileSync, readFileSync, chmodSync } from "fs";
import chalk from "chalk";
import { ensureDir } from "../lib/fs-utils.js";

const HOOK_MARKER = "# agent-mgr auto-sync";
const HOOK_CONTENT = `${HOOK_MARKER}
npx agent-mgr sync 2>/dev/null || true
`;

export function hookInstallCommand(): void {
  const gitDir = join(process.cwd(), ".git");
  if (!existsSync(gitDir)) {
    console.log(chalk.red("Not a git repository."));
    return;
  }

  const hooksDir = join(gitDir, "hooks");
  ensureDir(hooksDir);

  const hookNames = ["post-checkout", "post-merge"];

  for (const hookName of hookNames) {
    const hookPath = join(hooksDir, hookName);

    if (existsSync(hookPath)) {
      const content = readFileSync(hookPath, "utf-8");
      if (content.includes(HOOK_MARKER)) {
        console.log(chalk.dim(`  ${hookName}: already installed`));
        continue;
      }
      writeFileSync(hookPath, content.trimEnd() + "\n\n" + HOOK_CONTENT);
    } else {
      writeFileSync(hookPath, "#!/bin/sh\n\n" + HOOK_CONTENT);
    }

    chmodSync(hookPath, 0o755);
    console.log(chalk.green(`✓ Installed ${hookName} hook`));
  }
}

export function hookRemoveCommand(): void {
  const gitDir = join(process.cwd(), ".git");
  if (!existsSync(gitDir)) {
    console.log(chalk.red("Not a git repository."));
    return;
  }

  const hookNames = ["post-checkout", "post-merge"];

  for (const hookName of hookNames) {
    const hookPath = join(join(gitDir, "hooks"), hookName);
    if (!existsSync(hookPath)) continue;

    const content = readFileSync(hookPath, "utf-8");
    if (!content.includes(HOOK_MARKER)) continue;

    const lines = content.split("\n");
    const filtered = lines.filter(
      (line) => !line.includes(HOOK_MARKER) && !line.includes("npx agent-mgr sync")
    );
    const cleaned = filtered.join("\n").trim();

    if (cleaned === "#!/bin/sh" || cleaned === "") {
      writeFileSync(hookPath, "#!/bin/sh\n");
    } else {
      writeFileSync(hookPath, cleaned + "\n");
    }

    console.log(chalk.green(`✓ Removed ${hookName} hook`));
  }
}
