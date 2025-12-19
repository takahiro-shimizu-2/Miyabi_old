/**
 * Decomposition Validator
 * Validates decomposed tasks for correctness
 */

import type {
  ManagedTask,
  DecompositionWarning,
  DecompositionValidationResult,
  TaskType,
  AgentType,
} from '../types/index.js';
import { DECOMPOSITION_WARNING_CODES } from '../types/index.js';

/**
 * Valid task types
 */
const VALID_TASK_TYPES: TaskType[] = [
  'feature',
  'bug',
  'refactor',
  'docs',
  'test',
  'deployment',
  'chore',
];

/**
 * Valid agent types
 */
const VALID_AGENT_TYPES: AgentType[] = [
  'CoordinatorAgent',
  'CodeGenAgent',
  'ReviewAgent',
  'IssueAgent',
  'PRAgent',
  'DeploymentAgent',
  'TaskManagerAgent',
];

/**
 * Decomposition Validator
 */
export class DecompositionValidator {
  /**
   * Validate a list of tasks
   */
  validate(tasks: ManagedTask[]): DecompositionValidationResult {
    const errors: DecompositionWarning[] = [];
    const warnings: DecompositionWarning[] = [];
    const suggestions: string[] = [];

    // Check for empty tasks
    if (tasks.length === 0) {
      errors.push({
        code: DECOMPOSITION_WARNING_CODES.NO_TASKS_GENERATED,
        message: 'No tasks to validate',
        severity: 'error',
      });
      return { valid: false, errors, warnings, suggestions };
    }

    // Validate each task
    const taskIds = new Set<string>();
    for (const task of tasks) {
      // Check for duplicate IDs
      if (taskIds.has(task.id)) {
        errors.push({
          code: DECOMPOSITION_WARNING_CODES.DUPLICATE_TASK_ID,
          message: `Duplicate task ID: ${task.id}`,
          severity: 'error',
          affectedTaskIds: [task.id],
        });
      }
      taskIds.add(task.id);

      // Validate task type
      if (!VALID_TASK_TYPES.includes(task.type)) {
        warnings.push({
          code: DECOMPOSITION_WARNING_CODES.INVALID_TASK_TYPE,
          message: `Invalid task type "${task.type}" for task ${task.id}`,
          severity: 'warning',
          affectedTaskIds: [task.id],
        });
      }

      // Validate agent type
      if (task.assignedAgent && !VALID_AGENT_TYPES.includes(task.assignedAgent)) {
        warnings.push({
          code: DECOMPOSITION_WARNING_CODES.INVALID_AGENT_TYPE,
          message: `Invalid agent type "${task.assignedAgent}" for task ${task.id}`,
          severity: 'warning',
          affectedTaskIds: [task.id],
        });
      }

      // Check for missing dependencies
      for (const depId of task.dependencies) {
        if (!taskIds.has(depId) && !tasks.some(t => t.id === depId)) {
          warnings.push({
            code: DECOMPOSITION_WARNING_CODES.MISSING_DEPENDENCY,
            message: `Task ${task.id} depends on non-existent task ${depId}`,
            severity: 'warning',
            affectedTaskIds: [task.id, depId],
          });
        }
      }

      // Validate task has title
      if (!task.title || task.title.trim().length === 0) {
        errors.push({
          code: 'MISSING_TITLE',
          message: `Task ${task.id} is missing a title`,
          severity: 'error',
          affectedTaskIds: [task.id],
        });
      }
    }

    // Check for reasonable task count
    if (tasks.length > 20) {
      warnings.push({
        code: DECOMPOSITION_WARNING_CODES.TOO_MANY_TASKS,
        message: `Large number of tasks (${tasks.length}). Consider grouping or simplifying.`,
        severity: 'warning',
      });
      suggestions.push('Consider breaking the request into smaller, focused requests');
    }

    // Suggest test tasks if none exist
    const hasTestTask = tasks.some(t => t.type === 'test');
    if (!hasTestTask && tasks.some(t => t.type === 'feature' || t.type === 'bug')) {
      suggestions.push('Consider adding test tasks for code changes');
    }

    // Suggest review tasks if none exist
    const hasReviewTask = tasks.some(t => t.assignedAgent === 'ReviewAgent');
    if (!hasReviewTask && tasks.length > 2) {
      suggestions.push('Consider adding a review task for quality assurance');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Validate a single task
   */
  validateTask(task: ManagedTask): DecompositionWarning[] {
    const warnings: DecompositionWarning[] = [];

    // Check title
    if (!task.title || task.title.length < 3) {
      warnings.push({
        code: 'SHORT_TITLE',
        message: `Task ${task.id} has a very short title`,
        severity: 'warning',
        affectedTaskIds: [task.id],
      });
    }

    if (task.title && task.title.length > 200) {
      warnings.push({
        code: 'LONG_TITLE',
        message: `Task ${task.id} has a very long title (${task.title.length} chars)`,
        severity: 'warning',
        affectedTaskIds: [task.id],
      });
    }

    // Check description
    if (!task.description || task.description.length < 10) {
      warnings.push({
        code: 'SHORT_DESCRIPTION',
        message: `Task ${task.id} has a very short or missing description`,
        severity: 'info',
        affectedTaskIds: [task.id],
      });
    }

    // Check duration
    if (task.estimatedDuration && task.estimatedDuration > 480) {
      warnings.push({
        code: 'LONG_DURATION',
        message: `Task ${task.id} has a very long estimated duration (${task.estimatedDuration} min)`,
        severity: 'warning',
        affectedTaskIds: [task.id],
      });
    }

    // Check priority
    if (task.priority < 0 || task.priority > 100) {
      warnings.push({
        code: 'INVALID_PRIORITY',
        message: `Task ${task.id} has an invalid priority (${task.priority})`,
        severity: 'warning',
        affectedTaskIds: [task.id],
      });
    }

    return warnings;
  }

  /**
   * Check if tasks form a valid DAG (no cycles)
   */
  hasValidDAG(tasks: ManagedTask[]): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const taskMap = new Map(tasks.map(t => [t.id, t]));

    const hasCycle = (taskId: string): boolean => {
      visited.add(taskId);
      recursionStack.add(taskId);

      const task = taskMap.get(taskId);
      if (task) {
        for (const depId of task.dependencies) {
          if (recursionStack.has(depId)) {
            return true; // Cycle found
          }
          if (!visited.has(depId) && taskMap.has(depId)) {
            if (hasCycle(depId)) {
              return true;
            }
          }
        }
      }

      recursionStack.delete(taskId);
      return false;
    };

    for (const task of tasks) {
      if (!visited.has(task.id)) {
        if (hasCycle(task.id)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Find cycles in the task graph
   */
  findCycles(tasks: ManagedTask[]): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Map<string, number>();
    const taskMap = new Map(tasks.map(t => [t.id, t]));

    const findCycle = (taskId: string, path: string[]): void => {
      visited.add(taskId);
      recursionStack.set(taskId, path.length);

      const task = taskMap.get(taskId);
      if (task) {
        for (const depId of task.dependencies) {
          if (recursionStack.has(depId)) {
            // Found a cycle
            const cycleStart = recursionStack.get(depId)!;
            const cycle = [...path.slice(cycleStart), depId];
            cycles.push(cycle);
          } else if (!visited.has(depId) && taskMap.has(depId)) {
            findCycle(depId, [...path, depId]);
          }
        }
      }

      recursionStack.delete(taskId);
    };

    for (const task of tasks) {
      if (!visited.has(task.id)) {
        findCycle(task.id, [task.id]);
      }
    }

    return cycles;
  }
}
