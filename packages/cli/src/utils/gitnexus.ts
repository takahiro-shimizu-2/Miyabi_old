/**
 * gitnexus — GitNexus shell bridge for code intelligence
 */
import { getGniPath } from "./hub-paths.js";
import { runScript, scriptExists } from "./shell-bridge.js";

export type GniResult = {
  success: boolean;
  output: string;
  command: string;
};

/** Run a GNI subcommand */
export function runGni(args: string[]): GniResult {
  const gniPath = getGniPath();

  if (!scriptExists(gniPath)) {
    return {
      success: false,
      output: `gni script not found: ${gniPath}`,
      command: `gni ${args.join(" ")}`,
    };
  }

  try {
    const output = runScript(gniPath, args, { timeout: 60_000 });
    return { success: true, output, command: `gni ${args.join(" ")}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      output: message,
      command: `gni ${args.join(" ")}`,
    };
  }
}

/** Check if GNI is available */
export function isGniAvailable(): boolean {
  return scriptExists(getGniPath());
}
