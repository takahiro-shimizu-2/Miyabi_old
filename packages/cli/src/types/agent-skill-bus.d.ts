/**
 * Type declarations for agent-skill-bus
 * Used by bus.ts command for native ASB API integration
 */
declare module "agent-skill-bus" {
  export interface PromptRequest {
    id: string;
    source: string;
    agent: string;
    task: string;
    priority: "critical" | "high" | "medium" | "low";
    status: string;
    dependsOn: string[];
    affectedFiles: string[];
    affectedSkills: string[];
    createdAt: string;
  }

  export interface EnqueueOptions {
    source: string;
    agent: string;
    task: string;
    priority: "critical" | "high" | "medium" | "low";
    dependsOn?: string[];
    affectedFiles?: string[];
    affectedSkills?: string[];
  }

  export interface QueueStats {
    total: number;
    activeLocks: number;
    byStatus: Record<string, number>;
  }

  export interface FileLock {
    prId: string;
    agent: string;
    files: string[];
    lockedAt: string;
  }

  export class PromptRequestQueue {
    constructor(queueDir: string);
    enqueue(options: EnqueueOptions): PromptRequest | null;
    getDispatchable(count?: number): PromptRequest[];
    stats(): QueueStats;
    startExecution(id: string): PromptRequest;
    complete(id: string, result: string): void;
    fail(id: string, reason: string): void;
    readLocks(): FileLock[];
  }

  export interface SkillHealthEntry {
    avgScore: number;
    trend: string;
    runs: number;
    flagged: boolean;
    consecutiveFails: number;
    name: string;
  }

  export interface HealthState {
    lastUpdated: string;
    skills: Record<string, SkillHealthEntry>;
  }

  export interface SkillRunRecord {
    agent: string;
    skill: string;
    task: string;
    result: string;
    score: number;
  }

  export interface DriftEntry {
    name: string;
    lastWeekAvg: number;
    thisWeekAvg: number;
    drop: number;
  }

  export class SkillMonitor {
    constructor(monitorDir: string);
    updateHealth(): HealthState;
    readHealth(): HealthState;
    getFlagged(): SkillHealthEntry[];
    detectDrift(): DriftEntry[];
    recordRun(record: SkillRunRecord): SkillRunRecord;
  }
}
