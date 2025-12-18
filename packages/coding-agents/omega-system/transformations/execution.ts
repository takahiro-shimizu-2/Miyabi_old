/**
 * θ₄: Execution Transform
 *
 * Mathematical Definition: θ₄: A → R
 *
 * Transforms Agent Allocation into Result Set.
 * Executes tasks in parallel using worktrees and collects results.
 *
 * @module omega-system/transformations/execution
 */

import type { AgentType, AgentResult, AgentStatus } from '../../types';
import type { AgentAllocation, WorkerAssignment, ExecutionBatch } from './allocation';

// ============================================================================
// Result Set Types
// ============================================================================

/**
 * Task execution result
 */
export interface TaskExecutionResult {
  taskId: string;
  workerId: string;
  agentType: AgentType;
  status: AgentStatus;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  tokensUsed: number;
  result: AgentResult;
  artifacts: ExecutionArtifact[];
  logs: ExecutionLog[];
}

/**
 * Execution artifact
 */
export interface ExecutionArtifact {
  artifactId: string;
  type: 'code' | 'test' | 'documentation' | 'config' | 'report';
  path: string;
  content?: string;
  hash?: string;
  sizeBytes: number;
  createdAt: string;
}

/**
 * Execution log entry
 */
export interface ExecutionLog {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, unknown>;
}

/**
 * Worker execution result
 */
export interface WorkerExecutionResult {
  workerId: string;
  agentType: AgentType;
  worktreePath?: string;
  status: 'success' | 'partial' | 'failed';
  taskResults: TaskExecutionResult[];
  totalDurationMs: number;
  totalTokensUsed: number;
  errors: string[];
}

/**
 * Batch execution result
 */
export interface BatchExecutionResult {
  batchId: string;
  level: number;
  status: 'success' | 'partial' | 'failed';
  workerResults: WorkerExecutionResult[];
  startedAt: string;
  completedAt: string;
  durationMs: number;
}

/**
 * Result Set - Output of θ₄
 *
 * R = θ₄(A)
 */
export interface ResultSet {
  resultSetId: string;
  createdAt: string;

  /** Source allocation */
  sourceAllocationId: string;

  /** All task results */
  taskResults: TaskExecutionResult[];

  /** Worker results */
  workerResults: WorkerExecutionResult[];

  /** Batch results */
  batchResults: BatchExecutionResult[];

  /** All artifacts produced */
  artifacts: ExecutionArtifact[];

  /** Execution summary */
  summary: {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    successRate: number;
    totalDurationMs: number;
    totalTokensUsed: number;
  };

  /** Performance metrics */
  performance: {
    parallelismAchieved: number;
    averageTaskDurationMs: number;
    throughputTasksPerMinute: number;
    resourceEfficiency: number; // 0-100
  };

  /** Errors encountered */
  errors: Array<{
    taskId?: string;
    workerId?: string;
    error: string;
    timestamp: string;
    recoverable: boolean;
  }>;

  /** Metadata */
  metadata: {
    executionVersion: string;
    executionTimeMs: number;
    worktreesUsed: number;
  };
}

// ============================================================================
// Execution Simulation
// ============================================================================

/**
 * Simulate task execution (in real implementation, this would call Claude Code)
 */
async function executeTask(
  taskId: string,
  workerId: string,
  agentType: AgentType
): Promise<TaskExecutionResult> {
  const startTime = Date.now();
  const startedAt = new Date().toISOString();

  // Simulate execution time (50-500ms)
  const executionTime = 50 + Math.random() * 450;
  await new Promise(resolve => setTimeout(resolve, executionTime));

  // Simulate success/failure (95% success rate)
  const succeeded = Math.random() > 0.05;

  const result: TaskExecutionResult = {
    taskId,
    workerId,
    agentType,
    status: succeeded ? 'completed' : 'failed',
    startedAt,
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - startTime,
    tokensUsed: Math.floor(1000 + Math.random() * 5000),
    result: {
      status: succeeded ? 'success' : 'failed',
      data: succeeded ? { message: 'Task completed successfully' } : undefined,
      error: succeeded ? undefined : 'Simulated failure',
    },
    artifacts: succeeded ? [
      {
        artifactId: `artifact-${taskId}`,
        type: 'code',
        path: `src/generated/${taskId}.ts`,
        sizeBytes: Math.floor(500 + Math.random() * 2000),
        createdAt: new Date().toISOString(),
      },
    ] : [],
    logs: [
      {
        timestamp: startedAt,
        level: 'info',
        message: `Starting task ${taskId}`,
      },
      {
        timestamp: new Date().toISOString(),
        level: succeeded ? 'info' : 'error',
        message: succeeded ? `Task ${taskId} completed` : `Task ${taskId} failed`,
      },
    ],
  };

  return result;
}

/**
 * Execute a worker's tasks
 */
async function executeWorker(
  worker: WorkerAssignment,
  parallel: boolean = false
): Promise<WorkerExecutionResult> {
  const taskResults: TaskExecutionResult[] = [];
  const errors: string[] = [];

  if (parallel) {
    // Execute all tasks in parallel
    const results = await Promise.all(
      worker.assignedTasks.map(taskId =>
        executeTask(taskId, worker.workerId, worker.agentType)
      )
    );
    taskResults.push(...results);
  } else {
    // Execute tasks sequentially
    for (const taskId of worker.assignedTasks) {
      const result = await executeTask(taskId, worker.workerId, worker.agentType);
      taskResults.push(result);

      if (result.status === 'failed') {
        errors.push(`Task ${taskId} failed: ${result.result.error}`);
      }
    }
  }

  const successCount = taskResults.filter(r => r.status === 'completed').length;
  const status = successCount === taskResults.length ? 'success' :
                 successCount > 0 ? 'partial' : 'failed';

  return {
    workerId: worker.workerId,
    agentType: worker.agentType,
    worktreePath: worker.worktreePath,
    status,
    taskResults,
    totalDurationMs: taskResults.reduce((sum, r) => sum + r.durationMs, 0),
    totalTokensUsed: taskResults.reduce((sum, r) => sum + r.tokensUsed, 0),
    errors,
  };
}

/**
 * Execute a batch of workers
 */
async function executeBatch(
  batch: ExecutionBatch
): Promise<BatchExecutionResult> {
  const startedAt = new Date().toISOString();
  const startTime = Date.now();

  // Execute workers in parallel if batch allows
  const workerResults = batch.canExecuteInParallel
    ? await Promise.all(batch.workers.map(w => executeWorker(w, false)))
    : await (async () => {
        const results: WorkerExecutionResult[] = [];
        for (const worker of batch.workers) {
          results.push(await executeWorker(worker, false));
        }
        return results;
      })();

  const successCount = workerResults.filter(r => r.status === 'success').length;
  const status = successCount === workerResults.length ? 'success' :
                 successCount > 0 ? 'partial' : 'failed';

  return {
    batchId: batch.batchId,
    level: batch.level,
    status,
    workerResults,
    startedAt,
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - startTime,
  };
}

// ============================================================================
// Main Transform Function
// ============================================================================

/**
 * θ₄: Execution Transform
 *
 * Transforms Agent Allocation (A) into Result Set (R)
 *
 * @param allocation - The agent allocation from θ₃
 * @returns Result set from execution
 *
 * @example
 * ```typescript
 * const results = await execution(allocation);
 * console.log(results.summary.successRate); // 0.95
 * ```
 */
export async function execution(
  allocation: AgentAllocation
): Promise<ResultSet> {
  const startTime = Date.now();

  // Execute batches sequentially (respecting dependencies)
  const batchResults: BatchExecutionResult[] = [];

  for (const batch of allocation.batches) {
    const result = await executeBatch(batch);
    batchResults.push(result);
  }

  // Collect all task results
  const allTaskResults = batchResults.flatMap(br =>
    br.workerResults.flatMap(wr => wr.taskResults)
  );

  // Collect all worker results
  const allWorkerResults = batchResults.flatMap(br => br.workerResults);

  // Collect all artifacts
  const allArtifacts = allTaskResults.flatMap(tr => tr.artifacts);

  // Collect all errors
  const allErrors = allTaskResults
    .filter(tr => tr.status === 'failed')
    .map(tr => ({
      taskId: tr.taskId,
      workerId: tr.workerId,
      error: tr.result.error || 'Unknown error',
      timestamp: tr.completedAt,
      recoverable: true,
    }));

  // Calculate summary
  const completedTasks = allTaskResults.filter(r => r.status === 'completed').length;
  const failedTasks = allTaskResults.filter(r => r.status === 'failed').length;
  const totalDuration = Date.now() - startTime;
  const totalTokens = allTaskResults.reduce((sum, r) => sum + r.tokensUsed, 0);

  // Calculate performance metrics
  const avgTaskDuration = allTaskResults.length > 0
    ? allTaskResults.reduce((sum, r) => sum + r.durationMs, 0) / allTaskResults.length
    : 0;

  const throughput = totalDuration > 0
    ? (allTaskResults.length / totalDuration) * 60000
    : 0;

  const parallelBatches = batchResults.filter(br =>
    br.workerResults.length > 1
  ).length;

  const resultSet: ResultSet = {
    resultSetId: `results-${Date.now()}`,
    createdAt: new Date().toISOString(),
    sourceAllocationId: allocation.allocationId,
    taskResults: allTaskResults,
    workerResults: allWorkerResults,
    batchResults,
    artifacts: allArtifacts,
    summary: {
      totalTasks: allTaskResults.length,
      completedTasks,
      failedTasks,
      successRate: allTaskResults.length > 0
        ? completedTasks / allTaskResults.length
        : 0,
      totalDurationMs: totalDuration,
      totalTokensUsed: totalTokens,
    },
    performance: {
      parallelismAchieved: batchResults.length > 0
        ? parallelBatches / batchResults.length
        : 0,
      averageTaskDurationMs: avgTaskDuration,
      throughputTasksPerMinute: throughput,
      resourceEfficiency: Math.min(100, (completedTasks / allTaskResults.length) * 100),
    },
    errors: allErrors,
    metadata: {
      executionVersion: '1.0.0',
      executionTimeMs: totalDuration,
      worktreesUsed: allocation.resources.worktreesRequired,
    },
  };

  return resultSet;
}

/**
 * Validate a result set
 */
export function validateResultSet(results: ResultSet): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (results.summary.successRate < 0.5) {
    errors.push(`Low success rate: ${(results.summary.successRate * 100).toFixed(1)}%`);
  }

  if (results.errors.length > results.summary.totalTasks * 0.1) {
    errors.push(`High error rate: ${results.errors.length} errors`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Retry failed tasks
 */
export async function retryFailedTasks(
  results: ResultSet,
  allocation: AgentAllocation
): Promise<TaskExecutionResult[]> {
  const failedTaskIds = results.taskResults
    .filter(tr => tr.status === 'failed')
    .map(tr => tr.taskId);

  if (failedTaskIds.length === 0) {
    return [];
  }

  // Find workers for failed tasks
  const retryResults: TaskExecutionResult[] = [];

  for (const taskId of failedTaskIds) {
    const worker = allocation.workers.find(w =>
      w.assignedTasks.includes(taskId)
    );

    if (worker) {
      const result = await executeTask(taskId, worker.workerId, worker.agentType);
      retryResults.push(result);
    }
  }

  return retryResults;
}
