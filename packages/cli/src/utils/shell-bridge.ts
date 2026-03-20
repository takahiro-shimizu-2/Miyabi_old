/**
 * shell-bridge — Shell script execution utilities
 * Ported from miyabi-hub for GitNexus and task-sync integration
 */
import { execFileSync, execSync } from "node:child_process";
import { existsSync } from "node:fs";

export interface ShellOptions {
  cwd?: string;
  timeout?: number;
  env?: Record<string, string>;
}

const DEFAULT_TIMEOUT = 30_000;

/** Execute a bash script and return stdout */
export function runScript(
  scriptPath: string,
  args: string[] = [],
  options: ShellOptions = {}
): string {
  if (!existsSync(scriptPath)) {
    throw new Error(`Script not found: ${scriptPath}`);
  }

  const cwd = options.cwd ?? process.cwd();
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;

  return execFileSync("bash", [scriptPath, ...args], {
    encoding: "utf-8",
    cwd,
    timeout,
    env: { ...process.env, ...options.env },
    maxBuffer: 10 * 1024 * 1024,
  }).trim();
}

/** Execute an arbitrary shell command */
export function runCommand(
  command: string,
  options: ShellOptions = {}
): string {
  const cwd = options.cwd ?? process.cwd();
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;

  return execSync(command, {
    encoding: "utf-8",
    cwd,
    timeout,
    env: { ...process.env, ...options.env },
    maxBuffer: 10 * 1024 * 1024,
  }).trim();
}

/** Check if a script file exists */
export function scriptExists(scriptPath: string): boolean {
  return existsSync(scriptPath);
}
