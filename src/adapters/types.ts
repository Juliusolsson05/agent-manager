export interface CommandFile {
  name: string;
  description?: string;
  content: string;
  sourcePath: string;
}

export interface McpServer {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface SyncResult {
  target: string;
  command: string;
  status: "synced" | "skipped" | "failed";
  reason?: string;
}

export interface McpSyncResult {
  target: string;
  server: string;
  status: "synced" | "removed" | "failed";
  reason?: string;
}

export interface Adapter {
  name: string;
  id: string;
  supportsCommands: boolean;
  getCommandsDir(scope: "project" | "global", projectRoot: string): string | null;
  getMcpConfigPath(scope: "project" | "global", projectRoot: string): string;
  readMcpConfig(scope: "project" | "global", projectRoot: string): Promise<Record<string, McpServer>>;
  writeMcpConfig(servers: Record<string, McpServer>, scope: "project" | "global", projectRoot: string): Promise<void>;
  /** For adapters that sync commands via config (not files). Called instead of symlinking. */
  syncCommand?(name: string, description: string, body: string, scope: "project" | "global", projectRoot: string): Promise<void>;
  /** Remove a command from this adapter's config. For config-based adapters. */
  removeCommand?(name: string, scope: "project" | "global", projectRoot: string): Promise<boolean>;
  /** List command names currently configured in this adapter. For config-based adapters. */
  listCommands?(scope: "project" | "global", projectRoot: string): Promise<string[]>;
}
