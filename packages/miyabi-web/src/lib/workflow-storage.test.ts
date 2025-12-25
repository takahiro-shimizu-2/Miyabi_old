import { describe, it, expect, beforeEach } from 'vitest';
import { workflowStorage } from './workflow-storage';
import type { Workflow } from './types';

describe('workflowStorage', () => {
  // Clear storage before each test
  beforeEach(() => {
    workflowStorage.clear();
  });

  const createWorkflow = (id: string, name: string): Workflow => ({
    id,
    name,
    nodes: [],
    edges: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  });

  describe('create', () => {
    it('should create and return a workflow', () => {
      const workflow = createWorkflow('test-1', 'Test Workflow');
      const result = workflowStorage.create(workflow);

      expect(result).toEqual(workflow);
    });

    it('should store the workflow', () => {
      const workflow = createWorkflow('test-1', 'Test Workflow');
      workflowStorage.create(workflow);

      const retrieved = workflowStorage.get('test-1');
      expect(retrieved).toEqual(workflow);
    });
  });

  describe('get', () => {
    it('should return workflow by ID', () => {
      const workflow = createWorkflow('test-1', 'Test Workflow');
      workflowStorage.create(workflow);

      const result = workflowStorage.get('test-1');
      expect(result).toEqual(workflow);
    });

    it('should return undefined for non-existent ID', () => {
      const result = workflowStorage.get('non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('list', () => {
    it('should return empty array when no workflows', () => {
      const result = workflowStorage.list();
      expect(result).toEqual([]);
    });

    it('should return all workflows', () => {
      workflowStorage.create(createWorkflow('test-1', 'Workflow 1'));
      workflowStorage.create(createWorkflow('test-2', 'Workflow 2'));

      const result = workflowStorage.list();
      expect(result).toHaveLength(2);
    });

    it('should sort workflows by updatedAt descending', () => {
      const older: Workflow = {
        ...createWorkflow('test-1', 'Older'),
        updatedAt: '2024-01-01T00:00:00Z',
      };
      const newer: Workflow = {
        ...createWorkflow('test-2', 'Newer'),
        updatedAt: '2024-01-02T00:00:00Z',
      };

      workflowStorage.create(older);
      workflowStorage.create(newer);

      const result = workflowStorage.list();
      expect(result[0].name).toBe('Newer');
      expect(result[1].name).toBe('Older');
    });
  });

  describe('update', () => {
    it('should update existing workflow', () => {
      const workflow = createWorkflow('test-1', 'Original Name');
      workflowStorage.create(workflow);

      const result = workflowStorage.update('test-1', { name: 'Updated Name' });

      expect(result?.name).toBe('Updated Name');
    });

    it('should preserve ID even if update tries to change it', () => {
      const workflow = createWorkflow('test-1', 'Test');
      workflowStorage.create(workflow);

      const result = workflowStorage.update('test-1', { id: 'new-id' } as Partial<Workflow>);

      expect(result?.id).toBe('test-1');
    });

    it('should update updatedAt timestamp', () => {
      const workflow = createWorkflow('test-1', 'Test');
      workflowStorage.create(workflow);

      const result = workflowStorage.update('test-1', { name: 'Updated' });

      expect(result?.updatedAt).not.toBe('2024-01-01T00:00:00Z');
    });

    it('should return undefined for non-existent ID', () => {
      const result = workflowStorage.update('non-existent', { name: 'Test' });
      expect(result).toBeUndefined();
    });

    it('should preserve existing data not in updates', () => {
      const workflow: Workflow = {
        ...createWorkflow('test-1', 'Test'),
        description: 'Original description',
      };
      workflowStorage.create(workflow);

      const result = workflowStorage.update('test-1', { name: 'Updated' });

      expect(result?.description).toBe('Original description');
    });
  });

  describe('delete', () => {
    it('should delete existing workflow', () => {
      workflowStorage.create(createWorkflow('test-1', 'Test'));

      const result = workflowStorage.delete('test-1');

      expect(result).toBe(true);
      expect(workflowStorage.get('test-1')).toBeUndefined();
    });

    it('should return false for non-existent ID', () => {
      const result = workflowStorage.delete('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all workflows', () => {
      workflowStorage.create(createWorkflow('test-1', 'Workflow 1'));
      workflowStorage.create(createWorkflow('test-2', 'Workflow 2'));

      workflowStorage.clear();

      expect(workflowStorage.list()).toEqual([]);
    });
  });
});
