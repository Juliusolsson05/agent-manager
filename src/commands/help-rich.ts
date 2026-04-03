import chalk from "chalk";

export function helpCommand(): void {
  console.log(`
${chalk.bold("agent-commands")} — Write commands once, sync everywhere.

${chalk.bold.underline("WORKFLOW")}

  ${chalk.cyan("1.")} ${chalk.bold("ac init")}                    Set up in your repo or globally
  ${chalk.cyan("2.")} ${chalk.bold("ac add <name>")}              Create a command (or --from/--content)
  ${chalk.cyan("3.")} ${chalk.bold("ac sync")}                    Distribute to all platforms
  ${chalk.cyan("4.")} Use ${chalk.bold("/command-name")} in your AI tool

${chalk.bold.underline("COMMANDS")}

  ${chalk.bold("Setup")}
  ac init                         Interactive setup
  ac init --all --gitignore       All platforms, auto-gitignore
  ac init --global                Global config at ~/.agent-commands/

  ${chalk.bold("Commands")}
  ac add <name>                   Create template
  ac add <name> --from <file>     Import from existing .md
  ac add <name> --content "..."   Inline content
  ac remove <name>                Delete command + synced copies
  ac sync                         Sync all (project + profile + global)
  ac list                         Show commands with sync status

  ${chalk.bold("Profiles")}
  ac profile create <name>        Create a named command set
  ac profile switch <name>        Activate a profile
  ac profile list                 Show all profiles
  ac profile delete <name>        Delete a profile

  ${chalk.bold("Sync from GitHub")}
  ac sync-repo add <url>          Import commands from a repo
  ac sync-repo update             Pull latest from tracked repos
  ac sync-repo list               Show tracked repos
  ac sync-repo remove <url>       Stop tracking a repo

  ${chalk.bold("MCP Servers")}
  ac mcp add                      Add MCP server (interactive)
  ac mcp remove <name>            Remove from all platforms
  ac mcp list                     Show MCP servers per platform

  ${chalk.bold("Git Hooks")}
  ac hook install                 Auto-sync on checkout/merge
  ac hook remove                  Remove hooks

  ${chalk.bold("Help")}
  ac help                         This help page
  ac help-agent                   Output reference for AI agents

${chalk.bold.underline("COMMAND PRIORITY")}

  When syncing, commands are merged from three sources:
  ${chalk.green("project")} > ${chalk.blue("profile")} > ${chalk.dim("global")}
  If the same filename exists in multiple scopes, the higher priority wins.

${chalk.bold.underline("CONFIG FILES")}

  Project:  .agent-commands.yml + commands/
  Global:   ~/.agent-commands/config.yml + commands/
  Profiles: ~/.agent-commands/profiles/<name>/commands/
  Repos:    ~/.agent-commands/repos/ (cached clones)
`);
}
