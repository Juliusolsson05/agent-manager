import chalk from "chalk";

const AGENT_PROMPT = `# agent-mgr — CLI Tool Reference

You have access to \`agent-mgr\` (alias: \`amgr\`), a CLI tool that manages AI agent commands, prompts, and MCP server configs across multiple platforms (Claude Code, Cursor, Codex, OpenCode).

## How It Works

Commands are markdown files stored in source directories. When synced, they get symlinked to each platform's expected directory. Commands are merged from three scopes with priority: project > profile > global.

## Available Commands

### Setup
- \`amgr init\` — Initialize in current repo (interactive)
- \`amgr init --all --gitignore\` — Init with all platforms, gitignore generated dirs
- \`amgr init --targets claude-code,cursor\` — Init with specific platforms
- \`amgr init --global\` — Initialize global config at ~/.agent-mgr/

### Managing Commands
- \`amgr add <name>\` — Create a new command template
- \`amgr add <name> --from <path>\` — Import command from an existing .md file
- \`amgr add <name> --content "prompt text"\` — Create command with inline content
- \`amgr add <name> --global\` — Add to global commands
- \`amgr remove <name>\` — Remove command from source and all synced targets
- \`amgr list\` — Show all commands with scope and sync status per platform

### Syncing
- \`amgr sync\` — Merge and distribute project + profile + global commands
- \`amgr sync --global\` — Sync global commands only

### Profiles
- \`amgr profile create <name>\` — Create a named command set
- \`amgr profile switch <name>\` — Activate a profile
- \`amgr profile list\` — Show all profiles and which is active
- \`amgr profile delete <name>\` — Delete a profile

### Import from GitHub
- \`amgr sync-repo add <url>\` — Clone a repo and import its commands/ directory
- \`amgr sync-repo add <url> --profile <name>\` — Import into a specific profile
- \`amgr sync-repo update\` — Pull latest from all tracked repos
- \`amgr sync-repo list\` — Show tracked repos
- \`amgr sync-repo remove <url>\` — Stop tracking a repo

### MCP Server Management
- \`amgr mcp add\` — Interactive: add an MCP server config to selected platforms
- \`amgr mcp remove <name>\` — Remove MCP server from all platforms
- \`amgr mcp list\` — Show MCP servers and which platforms have them

### Git Hooks
- \`amgr hook install\` — Install post-checkout/post-merge hooks for auto-sync
- \`amgr hook remove\` — Remove the git hooks

### Help
- \`amgr help\` — Detailed help with workflow and examples
- \`amgr help-agent\` — Output this reference (for AI agents)

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

## Command Priority (when syncing)

1. Project commands (\`commands/\`) — highest priority
2. Active profile commands (\`~/.agent-mgr/profiles/<name>/commands/\`)
3. Global commands (\`~/.agent-mgr/commands/\`) — lowest priority

Same filename = higher scope wins.

## Config Files

- Project config: \`.agent-mgr.yml\` (targets, overrides)
- Global config: \`~/.agent-mgr/config.yml\` (targets, active profile, tracked repos)
- Source commands: \`commands/\` (project) or \`~/.agent-mgr/commands/\` (global)
- Profiles: \`~/.agent-mgr/profiles/<name>/commands/\`
- Repo cache: \`~/.agent-mgr/repos/\`

## Supported Platforms

| Platform | Commands | MCP |
|----------|----------|-----|
| Claude Code | ✓ (.claude/commands/) | ✓ (.claude/mcp.json) |
| Cursor | ✓ (.cursor/prompts/) | ✓ (.cursor/mcp.json) |
| Codex | ✗ | ✓ (.codex/mcp.json) |
| OpenCode | ✗ | ✓ (opencode.json) |
`;

export function helpAgentCommand(): void {
  console.log(AGENT_PROMPT);
  console.log(chalk.dim("Copy the above and paste it to your AI agent, or pipe it:"));
  console.log(chalk.dim("  amgr help-agent | pbcopy"));
}
