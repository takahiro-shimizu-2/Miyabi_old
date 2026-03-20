/**
 * gni — GitNexus code intelligence (14 subcommands)
 * Integrated from miyabi-hub
 */
import type { Command } from "commander";
import chalk from "chalk";
import { runGni, isGniAvailable } from "../utils/gitnexus.js";

function ensureGni(): boolean {
  if (!isGniAvailable()) {
    console.error(chalk.red("✗ gni (GitNexus) is not available. Check scripts/gni exists."));
    return false;
  }
  return true;
}

function gniPassthrough(subcommand: string, args: string[]): void {
  if (!ensureGni()) {process.exit(1);}
  const result = runGni([subcommand, ...args]);
  if (result.success) {
    console.log(result.output);
  } else {
    console.error(chalk.red(`✗ ${result.output}`));
    process.exit(1);
  }
}

export function registerGniCommand(program: Command): void {
  const gni = program
    .command("gni")
    .description("🧠 GitNexus code intelligence — impact analysis, queries, hotspots");

  gni.command("impact")
    .description("Analyze blast radius of a symbol")
    .argument("<symbol>", "Symbol name to analyze")
    .option("--direction <dir>", "upstream or downstream", "upstream")
    .action((symbol, opts) =>
      gniPassthrough("impact", [symbol, ...(opts.direction ? ["--direction", opts.direction] : [])])
    );

  gni.command("safe-impact")
    .description("Impact analysis with JSON fallback (no segfault)")
    .argument("<symbol>", "Symbol name")
    .action((symbol) => gniPassthrough("safe-impact", [symbol]));

  gni.command("query")
    .description("Search code by concept")
    .argument("<search>", "Search query")
    .action((search) => gniPassthrough("query", [search]));

  gni.command("context")
    .description("360-degree view of a symbol")
    .argument("<symbol>", "Symbol name")
    .action((symbol) => gniPassthrough("context", [symbol]));

  gni.command("cypher")
    .description("Run raw Cypher query")
    .argument("<query>", "Cypher query string")
    .action((query) => gniPassthrough("cypher", [query]));

  gni.command("hotspots")
    .description("Top 20 most-depended-on symbols")
    .action(() => gniPassthrough("hotspots", []));

  gni.command("orphans")
    .description("Find orphaned (unreferenced) functions")
    .action(() => gniPassthrough("orphans", []));

  gni.command("clusters")
    .description("List functional clusters")
    .action(() => gniPassthrough("clusters", []));

  gni.command("files")
    .description("List indexed files")
    .action(() => gniPassthrough("files", []));

  gni.command("deps")
    .description("Show dependencies of a symbol")
    .argument("<symbol>", "Symbol name")
    .action((symbol) => gniPassthrough("deps", [symbol]));

  gni.command("reindex")
    .description("Reindex the repository")
    .option("--embeddings", "Preserve embeddings")
    .action((opts) => gniPassthrough("reindex", opts.embeddings ? ["--embeddings"] : []));

  gni.command("status")
    .description("GitNexus index status")
    .action(() => gniPassthrough("status", []));

  gni.command("doctor")
    .description("GitNexus health diagnostics")
    .action(() => gniPassthrough("doctor", []));

  gni.command("smoke")
    .description("Quick smoke test")
    .action(() => gniPassthrough("smoke", []));
}
