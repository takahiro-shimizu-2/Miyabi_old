/**
 * hub-paths — Path resolution for miyabi-hub integrations
 * Resolves HAYASHI_SHUNSUKE repo paths for GNI, skills, tasks
 */
import { resolve } from "node:path";
import { existsSync } from "node:fs";

/** HAYASHI_SHUNSUKE repository root */
export function getHayashiRoot(): string {
  if (process.env.HAYASHI_ROOT) return process.env.HAYASHI_ROOT;

  const home = process.env.HOME ?? "/Users/shunsukehayashi";
  return resolve(home, "dev", "HAYASHI_SHUNSUKE");
}

/** GNI script path */
export function getGniPath(): string {
  return resolve(getHayashiRoot(), "scripts", "gni");
}

/** task-sync.sh path */
export function getTaskSyncPath(): string {
  return resolve(getHayashiRoot(), "AGENT", "task-sync.sh");
}

/** Skill dispatcher path */
export function getSkillDispatcherPath(): string {
  return resolve(getHayashiRoot(), "AGENT", "skill-dispatcher.sh");
}

/** Skill catalog path */
export function getSkillCatalogPath(): string {
  return resolve(getHayashiRoot(), "SKILL", "SKILL_CATALOG.md");
}

/** Skill root directory */
export function getSkillRoot(): string {
  return resolve(getHayashiRoot(), "SKILL");
}

/** Check if HAYASHI_SHUNSUKE repo is available */
export function isHayashiRepoAvailable(): boolean {
  return existsSync(getHayashiRoot());
}
