/**
 * Decomposition Validator Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DecompositionValidator } from '../../src/decomposition/decomposition-validator.js';
import { createManagedTask } from '../../src/types/task.js';
import type { ManagedTask } from '../../src/types/task.js';

describe('DecompositionValidator', () => {
  let validator: DecompositionValidator;

  beforeEach(() => {
    validator = new DecompositionValidator();
  });

  describe('validate', () => {
    it('should pass for valid tasks', () => {
      const tasks: ManagedTask[] = [
        createManagedTask({
          title: 'Task 1',
          description: 'Description for task 1',
          type: 'feature',
        }, 'task-1'),
        createManagedTask({
          title: 'Task 2',
          description: 'Description for task 2',
          type: 'test',
          dependencies: ['task-1'],
        }, 'task-2'),
      ];

      const result = validator.validate(tasks);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for empty tasks', () => {
      const result = validator.validate([]);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'NO_TASKS_GENERATED')).toBe(true);
    });

    it('should warn for duplicate task IDs', () => {
      const tasks: ManagedTask[] = [
        createManagedTask({ title: 'Task 1', description: 'Desc', type: 'feature' }, 'task-1'),
        createManagedTask({ title: 'Task 2', description: 'Desc', type: 'feature' }, 'task-1'),
      ];

      const result = validator.validate(tasks);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'DUPLICATE_TASK_ID')).toBe(true);
    });

    it('should warn for invalid task types', () => {
      const task = createManagedTask({
        title: 'Task 1',
        description: 'Desc',
        type: 'invalid' as any,
      }, 'task-1');

      const result = validator.validate([task]);
      expect(result.warnings.some(w => w.code === 'INVALID_TASK_TYPE')).toBe(true);
    });

    it('should warn for missing dependencies', () => {
      const task = createManagedTask({
        title: 'Task 1',
        description: 'Desc',
        type: 'feature',
        dependencies: ['non-existent'],
      }, 'task-1');

      const result = validator.validate([task]);
      expect(result.warnings.some(w => w.code === 'MISSING_DEPENDENCY')).toBe(true);
    });

    it('should warn for too many tasks', () => {
      const tasks: ManagedTask[] = Array.from({ length: 25 }, (_, i) =>
        createManagedTask({
          title: `Task ${i}`,
          description: `Description ${i}`,
          type: 'feature',
        }, `task-${i}`)
      );

      const result = validator.validate(tasks);
      expect(result.warnings.some(w => w.code === 'TOO_MANY_TASKS')).toBe(true);
    });

    it('should suggest test tasks when missing', () => {
      const tasks: ManagedTask[] = [
        createManagedTask({
          title: 'Implement feature',
          description: 'Desc',
          type: 'feature',
        }, 'task-1'),
      ];

      const result = validator.validate(tasks);
      expect(result.suggestions.some(s => s.includes('test'))).toBe(true);
    });
  });

  describe('validateTask', () => {
    it('should warn for short title', () => {
      const task = createManagedTask({
        title: 'AB',
        description: 'This is a good description',
        type: 'feature',
      }, 'task-1');

      const warnings = validator.validateTask(task);
      expect(warnings.some(w => w.code === 'SHORT_TITLE')).toBe(true);
    });

    it('should warn for short description', () => {
      const task = createManagedTask({
        title: 'Good Title',
        description: 'Short',
        type: 'feature',
      }, 'task-1');

      const warnings = validator.validateTask(task);
      expect(warnings.some(w => w.code === 'SHORT_DESCRIPTION')).toBe(true);
    });

    it('should warn for long duration', () => {
      const task = createManagedTask({
        title: 'Long Task',
        description: 'This task takes forever',
        type: 'feature',
        estimatedDuration: 500,
      }, 'task-1');

      const warnings = validator.validateTask(task);
      expect(warnings.some(w => w.code === 'LONG_DURATION')).toBe(true);
    });

    it('should warn for invalid priority', () => {
      const task = createManagedTask({
        title: 'Task',
        description: 'Description here',
        type: 'feature',
        priority: 150,
      }, 'task-1');

      const warnings = validator.validateTask(task);
      expect(warnings.some(w => w.code === 'INVALID_PRIORITY')).toBe(true);
    });
  });

  describe('hasValidDAG', () => {
    it('should return true for valid DAG', () => {
      const tasks: ManagedTask[] = [
        createManagedTask({ title: 'Task 1', description: 'Desc', type: 'feature' }, 'task-1'),
        createManagedTask({
          title: 'Task 2',
          description: 'Desc',
          type: 'feature',
          dependencies: ['task-1'],
        }, 'task-2'),
        createManagedTask({
          title: 'Task 3',
          description: 'Desc',
          type: 'feature',
          dependencies: ['task-2'],
        }, 'task-3'),
      ];

      expect(validator.hasValidDAG(tasks)).toBe(true);
    });

    it('should return false for DAG with cycle', () => {
      const tasks: ManagedTask[] = [
        createManagedTask({
          title: 'Task 1',
          description: 'Desc',
          type: 'feature',
          dependencies: ['task-2'],
        }, 'task-1'),
        createManagedTask({
          title: 'Task 2',
          description: 'Desc',
          type: 'feature',
          dependencies: ['task-1'],
        }, 'task-2'),
      ];

      expect(validator.hasValidDAG(tasks)).toBe(false);
    });
  });

  describe('findCycles', () => {
    it('should find cycles in task graph', () => {
      const tasks: ManagedTask[] = [
        createManagedTask({
          title: 'Task A',
          description: 'Desc',
          type: 'feature',
          dependencies: ['task-b'],
        }, 'task-a'),
        createManagedTask({
          title: 'Task B',
          description: 'Desc',
          type: 'feature',
          dependencies: ['task-c'],
        }, 'task-b'),
        createManagedTask({
          title: 'Task C',
          description: 'Desc',
          type: 'feature',
          dependencies: ['task-a'],
        }, 'task-c'),
      ];

      const cycles = validator.findCycles(tasks);
      expect(cycles.length).toBeGreaterThan(0);
    });

    it('should return empty array for acyclic graph', () => {
      const tasks: ManagedTask[] = [
        createManagedTask({ title: 'Task 1', description: 'Desc', type: 'feature' }, 'task-1'),
        createManagedTask({
          title: 'Task 2',
          description: 'Desc',
          type: 'feature',
          dependencies: ['task-1'],
        }, 'task-2'),
      ];

      const cycles = validator.findCycles(tasks);
      expect(cycles).toHaveLength(0);
    });
  });
});
