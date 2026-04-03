import { program } from "commander";
import { initCommand } from "./commands/init.js";
import { addCommand } from "./commands/add.js";
import { removeCommand } from "./commands/remove.js";
import { syncCommand } from "./commands/sync.js";
import { listCommand } from "./commands/list.js";
import { mcpAddCommand } from "./commands/mcp-add.js";
import { mcpRemoveCommand } from "./commands/mcp-remove.js";
import { mcpListCommand } from "./commands/mcp-list.js";
import { hookInstallCommand, hookRemoveCommand } from "./commands/hook.js";
import { helpAgentCommand } from "./commands/help-agent.js";
import { profileCreateCommand, profileSwitchCommand, profileListCommand, profileDeleteCommand } from "./commands/profile.js";
import { syncRepoCommand, syncRepoUpdateCommand, syncRepoListCommand, syncRepoRemoveCommand } from "./commands/sync-repo.js";

program
  .name("agent-commands")
  .description(
    "Write commands once, sync everywhere. Manage AI agent commands, prompts, and MCP configs."
  )
  .version("0.0.1");

program
  .command("init")
  .description("Initialize agent-commands in this repo or globally")
  .option("-g, --global", "Initialize global config at ~/.agent-commands/")
  .option("-t, --targets <targets>", "Comma-separated list of targets (claude-code,cursor,codex,opencode)")
  .option("-a, --all", "Select all available targets")
  .option("--gitignore", "Add generated dirs to .git/info/exclude")
  .option("--no-gitignore", "Skip gitignoring generated dirs")
  .action(initCommand);

program
  .command("add <name>")
  .description("Create a new command template")
  .option("-g, --global", "Add to global commands")
  .option("-f, --from <path>", "Import command from an existing .md file")
  .option("-c, --content <text>", "Set the command content inline")
  .action(addCommand);

program
  .command("remove <name>")
  .description("Remove a command from source and all targets")
  .option("-g, --global", "Remove from global commands")
  .action(removeCommand);

program
  .command("sync")
  .description("Sync all commands to configured targets")
  .option("-g, --global", "Sync global commands")
  .action(syncCommand);

program
  .command("list")
  .description("Show commands and their sync status")
  .option("-g, --global", "List global commands")
  .action(listCommand);

const mcp = program
  .command("mcp")
  .description("Manage MCP server configs across tools");

mcp
  .command("add")
  .description("Add an MCP server to configured targets")
  .option("-g, --global", "Add to global MCP config")
  .action(mcpAddCommand);

mcp
  .command("remove <name>")
  .description("Remove an MCP server from all targets")
  .option("-g, --global", "Remove from global MCP config")
  .action(mcpRemoveCommand);

mcp
  .command("list")
  .description("List MCP servers across targets")
  .option("-g, --global", "List global MCP servers")
  .action(mcpListCommand);

const hook = program
  .command("hook")
  .description("Manage git hooks for auto-sync");

hook
  .command("install")
  .description("Install post-checkout and post-merge hooks")
  .action(hookInstallCommand);

hook
  .command("remove")
  .description("Remove agent-commands git hooks")
  .action(hookRemoveCommand);

program
  .command("help-agent")
  .description("Output a full reference for AI agents to understand this tool")
  .action(helpAgentCommand);

const profile = program
  .command("profile")
  .description("Manage command profiles");

profile
  .command("create <name>")
  .description("Create a new profile")
  .action(profileCreateCommand);

profile
  .command("switch <name>")
  .description("Switch to a profile")
  .action(profileSwitchCommand);

profile
  .command("list")
  .description("List all profiles")
  .action(profileListCommand);

profile
  .command("delete <name>")
  .description("Delete a profile")
  .action(profileDeleteCommand);

const syncRepo = program
  .command("sync-repo")
  .description("Import commands from a GitHub repo");

syncRepo
  .command("add <url>")
  .description("Clone a repo and import its commands")
  .option("-p, --profile <name>", "Import into a specific profile")
  .action(syncRepoCommand);

syncRepo
  .command("update")
  .description("Pull latest from all tracked repos")
  .action(syncRepoUpdateCommand);

syncRepo
  .command("list")
  .description("List tracked repos")
  .action(syncRepoListCommand);

syncRepo
  .command("remove <url>")
  .description("Stop tracking a repo and remove cached clone")
  .action(syncRepoRemoveCommand);

program.parse();
