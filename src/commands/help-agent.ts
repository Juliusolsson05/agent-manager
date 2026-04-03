import chalk from "chalk";

const AGENT_PROMPT = `# agent-commands — CLI Tool Reference

You have access to \`agent-commands\` (alias: \`ac\`), a CLI tool that manages AI agent commands, prompts, and MCP server configs across multiple platforms (Claude Code, Cursor, Codex, OpenCode).

## How It Works

Commands are markdown files stored in a single source directory (\`commands/\` in the project or \`~/.agent-commands/commands/\` globally). When synced, they get symlinked to each platform's expected directory (.claude/commands/, .cursor/prompts/, etc.).

## Available Commands

### Setup
- \`ac init\` — Initialize in current repo (interactive)
- \`ac init --all --gitignore\` — Init with all platforms, gitignore generated dirs
- \`ac init --targets claude-code,cursor\` — Init with specific platforms
- \`ac init --global\` — Initialize global config at ~/.agent-commands/

### Managing Commands
- \`ac add <name>\` — Create a new command template
- \`ac add <name> --from <path>\` — Import command from an existing .md file
- \`ac add <name> --content "prompt text"\` — Create command with inline content
- \`ac add <name> --global\` — Add to global commands
- \`ac remove <name>\` — Remove command from source and all synced targets
- \`ac list\` — Show all commands and their sync status per platform

### Syncing
- \`ac sync\` — Distribute all commands to configured platform directories
- \`ac sync --global\` — Sync global commands

### MCP Server Management
- \`ac mcp add\` — Interactive: add an MCP server config to selected platforms
- \`ac mcp remove <name>\` — Remove MCP server from all platforms
- \`ac mcp list\` — Show MCP servers and which platforms have them

### Git Hooks
- \`ac hook install\` — Install post-checkout/post-merge hooks for auto-sync
- \`ac hook remove\` — Remove the git hooks

### Help
- \`ac help-agent\` — Output this reference (for AI agents)

## Command File Format

Commands are markdown files with optional YAML frontmatter:

\`\`\`markdown
---
description: What this command does
---

Your prompt content here.

$ARGUMENTS
\`\`\`

\`$ARGUMENTS\` gets replaced with whatever the user types after the slash command.

## Config Files

- Project config: \`.agent-commands.yml\` (lists target platforms)
- Global config: \`~/.agent-commands/config.yml\`
- Source commands: \`commands/\` (project) or \`~/.agent-commands/commands/\` (global)

## Supported Platforms

| Platform | Commands | MCP |
|----------|----------|-----|
| Claude Code | ✓ (.claude/commands/) | ✓ (.claude/mcp.json) |
| Cursor | ✓ (.cursor/prompts/) | ✓ (.cursor/mcp.json) |
| Codex | ✗ | ✓ (.codex/mcp.json) |
| OpenCode | ✗ | ✓ (opencode.json) |

## Tips

- Run \`ac sync\` after adding or editing commands
- Use \`ac list\` to check if commands are in sync
- Global commands (--global) are available across all repos
- Project commands override global ones with the same name
`;

export function helpAgentCommand(): void {
  console.log(AGENT_PROMPT);
  console.log(chalk.dim("Copy the above and paste it to your AI agent, or pipe it:"));
  console.log(chalk.dim("  ac help-agent | pbcopy"));
}
