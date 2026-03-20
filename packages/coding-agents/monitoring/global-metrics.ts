/**
 * Global Metrics Collector Stub
 *
 * This is a local stub that provides a no-op implementation of the metrics collector.
 * The actual dashboard metrics collection is handled by .claude/monitoring/metrics-collector.ts
 * which runs as a separate process.
 */

import type { AgentType } from '../types/index';

interface AgentCompletionMetrics {
  taskId: string;
  agentType: AgentType;
  durationMs: number;
  qualityScore?: number;
  linesChanged?: number;
  testsAdded?: number;
  coveragePercent?: number;
  errorsFound?: number;
  timestamp: string;
}

/**
 * MetricsCollectorStub - No-op implementation for package isolation
 */
class MetricsCollectorStub {
  onAgentStart(_agentType: AgentType, _taskId: string, _taskTitle?: string): void {
    // No-op - actual metrics collected by external dashboard process
  }

  onAgentComplete(_agentType: AgentType, _taskId: string, _metrics: AgentCompletionMetrics): void {
    // No-op - actual metrics collected by external dashboard process
  }

  onAgentFailed(_agentType: AgentType, _taskId: string, _errorMessage: string, _durationMs: number): void {
    // No-op - actual metrics collected by external dashboard process
  }
}

export const globalMetricsCollector = new MetricsCollectorStub();
