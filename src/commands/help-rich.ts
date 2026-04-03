import chalk from "chalk";

export function helpCommand(): void {
  console.log(`
${chalk.bold("agent-manager")} — Write commands once, sync everywhere.

${chalk.bold.underline("WORKFLOW")}

  ${chalk.cyan("1.")} ${chalk.bold("amgr init")}                    Set up in your repo or globally
  ${chalk.cyan("2.")} ${chalk.bold("amgr add <name>")}              Create a command (or --from/--content)
  ${chalk.cyan("3.")} ${chalk.bold("amgr sync")}                    Distribute to all platforms
  ${chalk.cyan("4.")} Use ${chalk.bold("/command-name")} in your AI tool

${chalk.bold.underline("COMMANDS")}

  ${chalk.bold("Setup")}
  amgr init                         Interactive setup
  amgr init --all --gitignore       All platforms, auto-gitignore
  amgr init --global                Global config at ~/.agent-mgr/

  ${chalk.bold("Commands")}
  amgr add <name>                   Create template
  amgr add <name> --from <file>     Import from existing .md
  amgr add <name> --content "..."   Inline content
  amgr remove <name>                Delete command + synced copies
  amgr sync                         Sync all (project + profile + global)
  amgr list                         Show commands with sync status

  ${chalk.bold("Profiles")}
  amgr profile create <name>        Create a named command set
  amgr profile switch <name>        Activate a profile
  amgr profile list                 Show all profiles
  amgr profile delete <name>        Delete a profile

  ${chalk.bold("Sync from GitHub")}
  amgr sync-repo add <url>          Import commands from a repo
  amgr sync-repo update             Pull latest from tracked repos
  amgr sync-repo list               Show tracked repos
  amgr sync-repo remove <url>       Stop tracking a repo

  ${chalk.bold("MCP Servers")}
  amgr mcp add                      Add MCP server (interactive)
  amgr mcp remove <name>            Remove from all platforms
  amgr mcp list                     Show MCP servers per platform

  ${chalk.bold("Git Hooks")}
  amgr hook install                 Auto-sync on checkout/merge
  amgr hook remove                  Remove hooks

  ${chalk.bold("Help")}
  amgr help                         This help page
  amgr help-agent                   Output reference for AI agents

${chalk.bold.underline("COMMAND PRIORITY")}

  When syncing, commands are merged from three sources:
  ${chalk.green("project")} > ${chalk.blue("profile")} > ${chalk.dim("global")}
  If the same filename exists in multiple scopes, the higher priority wins.

${chalk.bold.underline("CONFIG FILES")}

  Project:  .agent-mgr.yml + commands/
  Global:   ~/.agent-mgr/config.yml + commands/
  Profiles: ~/.agent-mgr/profiles/<name>/commands/
  Repos:    ~/.agent-mgr/repos/ (cached clones)
`);
}
