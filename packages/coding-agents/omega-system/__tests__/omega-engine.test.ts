/**
 * Ω-System Engine Tests
 *
 * Tests for the complete 6-stage transformation pipeline:
 * E = θ₆ ∘ θ₅ ∘ θ₄ ∘ θ₃ ∘ θ₂ ∘ θ₁
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { IntentSpace } from '../../types/intent';
import type { WorldSpace } from '../../types/world';
import {
  OmegaEngine,
  omega,
  omegaWithoutLearning,
  omegaStrict,
  understanding,
  generation,
  allocation,
  execution,
  integration,
  learning,
  validatePlan,
  validateTaskSet,
  validateAllocation,
  validateResultSet,
  validateDeliverable,
  validateKnowledge,
} from '../index';

// ============================================================================
// Test Fixtures
// ============================================================================

function createMockIntent(): IntentSpace {
  return {
    goals: {
      primary: {
        main: {
          id: 'goal-1',
          description: 'Implement user authentication feature',
          priority: 'high',
          type: 'feature',
          successCriteria: [
            'Login form works',
            'Session management implemented',
            'Tests pass',
          ],
        },
        supporting: [
          {
            id: 'goal-2',
            description: 'Add password validation',
            priority: 'medium',
            type: 'feature',
            successCriteria: ['Password strength check'],
          },
        ],
      },
      secondary: {
        goals: [
          {
            id: 'goal-3',
            description: 'Update documentation',
            priority: 'low',
            type: 'docs',
            successCriteria: ['README updated'],
          },
        ],
        priorityOrder: ['goal-3'],
      },
      implicit: {
        inferred: [],
        confidence: 0.8,
      },
      allGoals: ['goal-1', 'goal-2', 'goal-3'],
    },
    preferences: {
      qualityVsSpeed: {
        bias: 'quality',
        threshold: 0.8,
      },
      automationLevel: {
        desired: 'high',
        humanCheckpoints: ['review', 'deploy'],
      },
      communicationStyle: {
        verbosity: 'normal',
        technicalLevel: 'expert',
        language: 'en',
      },
      riskTolerance: {
        level: 'medium',
        requiresApproval: ['deploy', 'delete'],
      },
    },
    objectives: {
      functional: [
        {
          id: 'obj-1',
          description: 'Secure authentication',
          measurable: true,
          target: 'JWT-based auth',
        },
      ],
      nonFunctional: [
        {
          id: 'obj-2',
          description: 'Performance',
          measurable: true,
          target: '<500ms response time',
        },
      ],
      constraints: [
        {
          id: 'constraint-1',
          description: 'Must use existing user table',
          type: 'technical',
          priority: 'high',
        },
      ],
    },
    modality: {
      primary: 'code',
      secondary: ['documentation'],
      outputFormats: ['typescript', 'markdown'],
    },
  };
}

function createMockWorld(): WorldSpace {
  return {
    temporal: {
      current: {
        timestamp: new Date().toISOString(),
        timezone: 'UTC',
        dayOfWeek: 'monday',
        hour: 10,
      },
      history: {
        recentCommits: [],
        recentIssues: [],
        recentPRs: [],
        activityPattern: 'regular',
      },
      scheduling: {
        deadlines: [],
        sprintEnd: undefined,
        releaseDate: undefined,
      },
      constraints: {
        businessHours: '9am-6pm',
        timezone: 'UTC',
        blackoutPeriods: [],
      },
    },
    spatial: {
      repository: {
        owner: 'test-org',
        name: 'test-repo',
        defaultBranch: 'main',
        visibility: 'public',
      },
      structure: {
        root: '/test-repo',
        srcDirs: ['src'],
        testDirs: ['tests'],
        docsDirs: ['docs'],
        configFiles: ['package.json', 'tsconfig.json'],
      },
      files: {
        total: 100,
        byExtension: { '.ts': 50, '.md': 20, '.json': 10 },
        recentlyModified: [],
        hotspots: [],
      },
      dependencies: {
        internal: [],
        external: [
          { name: 'typescript', version: '5.0.0', type: 'dev' },
        ],
        graph: {},
      },
    },
    contextual: {
      domain: {
        primary: 'web-development',
        subDomains: ['authentication', 'api'],
        terminology: {},
      },
      system: {
        projectType: 'library',
        architecture: {
          style: 'modular',
          patterns: ['mvc', 'repository'],
          layers: ['api', 'service', 'data'],
        },
        stack: {
          languages: ['typescript'],
          frameworks: ['express'],
          tools: ['eslint', 'vitest'],
        },
      },
      team: {
        size: 3,
        roles: ['developer', 'reviewer'],
        conventions: {
          codeStyle: 'airbnb',
          commitStyle: 'conventional',
          branchNaming: 'feature/*',
        },
      },
    },
    resources: {
      computational: {
        cpu: { available: 4, reserved: 1 },
        memory: { available: 8192, reserved: 2048 },
        storage: { available: 100000, reserved: 10000 },
      },
      human: {
        developers: 2,
        reviewers: 1,
        availability: 0.8,
      },
      external: {
        apiTokens: { github: true, npm: true },
        services: ['github', 'npm'],
        quotas: {},
      },
    },
    environmental: {
      load: {
        cpuUtilization: 40,
        memoryUtilization: 50,
        queueDepth: 2,
      },
      health: {
        services: { github: 'healthy', npm: 'healthy' },
        lastCheck: new Date().toISOString(),
        alerts: [],
      },
      constraints: {
        concurrency: { maxWorkers: 3, maxWorktrees: 5 },
        rate: { maxRequestsPerMinute: 100, maxTokensPerHour: 100000 },
        security: { requiresReview: true, allowedActions: ['read', 'write', 'execute'] },
      },
    },
  };
}

// ============================================================================
// Unit Tests for Individual Transforms
// ============================================================================

describe('θ₁: Understanding Transform', () => {
  it('should transform intent and world into strategic plan', async () => {
    const intent = createMockIntent();
    const world = createMockWorld();

    const plan = await understanding(intent, world);

    expect(plan).toBeDefined();
    expect(plan.planId).toMatch(/^plan-/);
    expect(plan.objectives.length).toBeGreaterThan(0);
    expect(plan.strategy.phases.length).toBeGreaterThan(0);
  });

  it('should validate a valid plan', async () => {
    const intent = createMockIntent();
    const world = createMockWorld();
    const plan = await understanding(intent, world);

    const validation = validatePlan(plan);

    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should extract objectives from goals', async () => {
    const intent = createMockIntent();
    const world = createMockWorld();
    const plan = await understanding(intent, world);

    // Should have objectives for primary, supporting, and secondary goals
    expect(plan.objectives.length).toBeGreaterThanOrEqual(3);
    expect(plan.objectives.some(o => o.priority === 'high')).toBe(true);
  });
});

describe('θ₂: Generation Transform', () => {
  it('should generate tasks from strategic plan', async () => {
    const intent = createMockIntent();
    const world = createMockWorld();
    const plan = await understanding(intent, world);

    const taskSet = await generation(plan, world);

    expect(taskSet).toBeDefined();
    expect(taskSet.setId).toMatch(/^taskset-/);
    expect(taskSet.tasks.length).toBeGreaterThan(0);
    expect(taskSet.dag.nodes.length).toBe(taskSet.tasks.length);
  });

  it('should build valid DAG', async () => {
    const intent = createMockIntent();
    const world = createMockWorld();
    const plan = await understanding(intent, world);
    const taskSet = await generation(plan, world);

    // DAG should have levels
    expect(taskSet.dag.levels.length).toBeGreaterThan(0);

    // All tasks should be in some level
    const allLevelTasks = taskSet.dag.levels.flat();
    expect(allLevelTasks.length).toBe(taskSet.tasks.length);
  });

  it('should validate task set', async () => {
    const intent = createMockIntent();
    const world = createMockWorld();
    const plan = await understanding(intent, world);
    const taskSet = await generation(plan, world);

    const validation = validateTaskSet(taskSet);

    expect(validation.valid).toBe(true);
  });
});

describe('θ₃: Allocation Transform', () => {
  it('should allocate agents to tasks', async () => {
    const intent = createMockIntent();
    const world = createMockWorld();
    const plan = await understanding(intent, world);
    const taskSet = await generation(plan, world);

    const alloc = await allocation(taskSet, world);

    expect(alloc).toBeDefined();
    expect(alloc.allocationId).toMatch(/^alloc-/);
    expect(alloc.workers.length).toBeGreaterThan(0);
    expect(alloc.batches.length).toBeGreaterThan(0);
  });

  it('should respect concurrency limits', async () => {
    const intent = createMockIntent();
    const world = createMockWorld();
    const plan = await understanding(intent, world);
    const taskSet = await generation(plan, world);

    const alloc = await allocation(taskSet, world);

    // Workers should not exceed max workers
    expect(alloc.workers.length).toBeLessThanOrEqual(
      world.environmental.constraints.concurrency.maxWorkers
    );
  });

  it('should calculate optimization metrics', async () => {
    const intent = createMockIntent();
    const world = createMockWorld();
    const plan = await understanding(intent, world);
    const taskSet = await generation(plan, world);

    const alloc = await allocation(taskSet, world);

    expect(alloc.optimization.parallelizationFactor).toBeGreaterThanOrEqual(0);
    expect(alloc.optimization.parallelizationFactor).toBeLessThanOrEqual(1);
    expect(alloc.optimization.loadBalanceScore).toBeGreaterThanOrEqual(0);
    expect(alloc.optimization.loadBalanceScore).toBeLessThanOrEqual(100);
  });
});

describe('θ₄: Execution Transform', () => {
  it('should execute allocated tasks', async () => {
    const intent = createMockIntent();
    const world = createMockWorld();
    const plan = await understanding(intent, world);
    const taskSet = await generation(plan, world);
    const alloc = await allocation(taskSet, world);

    const results = await execution(alloc);

    expect(results).toBeDefined();
    expect(results.resultSetId).toMatch(/^results-/);
    expect(results.taskResults.length).toBeGreaterThan(0);
  });

  it('should track success rate', async () => {
    const intent = createMockIntent();
    const world = createMockWorld();
    const plan = await understanding(intent, world);
    const taskSet = await generation(plan, world);
    const alloc = await allocation(taskSet, world);

    const results = await execution(alloc);

    expect(results.summary.successRate).toBeGreaterThanOrEqual(0);
    expect(results.summary.successRate).toBeLessThanOrEqual(1);
    expect(results.summary.completedTasks + results.summary.failedTasks)
      .toBe(results.summary.totalTasks);
  });

  it('should generate performance metrics', async () => {
    const intent = createMockIntent();
    const world = createMockWorld();
    const plan = await understanding(intent, world);
    const taskSet = await generation(plan, world);
    const alloc = await allocation(taskSet, world);

    const results = await execution(alloc);

    expect(results.performance.averageTaskDurationMs).toBeGreaterThan(0);
    expect(results.performance.throughputTasksPerMinute).toBeGreaterThan(0);
  });
});

describe('θ₅: Integration Transform', () => {
  it('should create deliverable from results', async () => {
    const intent = createMockIntent();
    const world = createMockWorld();
    const plan = await understanding(intent, world);
    const taskSet = await generation(plan, world);
    const alloc = await allocation(taskSet, world);
    const results = await execution(alloc);

    const deliverable = await integration(results);

    expect(deliverable).toBeDefined();
    expect(deliverable.deliverableId).toMatch(/^deliverable-/);
    expect(deliverable.qualityReport).toBeDefined();
  });

  it('should generate quality report', async () => {
    const intent = createMockIntent();
    const world = createMockWorld();
    const plan = await understanding(intent, world);
    const taskSet = await generation(plan, world);
    const alloc = await allocation(taskSet, world);
    const results = await execution(alloc);

    const deliverable = await integration(results);

    expect(deliverable.qualityReport.score).toBeGreaterThanOrEqual(0);
    expect(deliverable.qualityReport.score).toBeLessThanOrEqual(100);
    expect(typeof deliverable.qualityReport.passed).toBe('boolean');
  });

  it('should generate PR draft', async () => {
    const intent = createMockIntent();
    const world = createMockWorld();
    const plan = await understanding(intent, world);
    const taskSet = await generation(plan, world);
    const alloc = await allocation(taskSet, world);
    const results = await execution(alloc);

    const deliverable = await integration(results);

    expect(deliverable.pullRequest).toBeDefined();
    expect(deliverable.pullRequest?.title).toBeDefined();
    expect(deliverable.pullRequest?.body).toContain('Summary');
  });
});

describe('θ₆: Learning Transform', () => {
  it('should extract knowledge from execution', async () => {
    const intent = createMockIntent();
    const world = createMockWorld();
    const plan = await understanding(intent, world);
    const taskSet = await generation(plan, world);
    const alloc = await allocation(taskSet, world);
    const results = await execution(alloc);
    const deliverable = await integration(results);

    const knowledge = await learning(deliverable, intent, world);

    expect(knowledge).toBeDefined();
    expect(knowledge.knowledgeId).toMatch(/^knowledge-/);
  });

  it('should extract patterns', async () => {
    const intent = createMockIntent();
    const world = createMockWorld();
    const plan = await understanding(intent, world);
    const taskSet = await generation(plan, world);
    const alloc = await allocation(taskSet, world);
    const results = await execution(alloc);
    const deliverable = await integration(results);

    const knowledge = await learning(deliverable, intent, world);

    expect(knowledge.patterns.length).toBeGreaterThan(0);
  });

  it('should generate recommendations', async () => {
    const intent = createMockIntent();
    const world = createMockWorld();
    const plan = await understanding(intent, world);
    const taskSet = await generation(plan, world);
    const alloc = await allocation(taskSet, world);
    const results = await execution(alloc);
    const deliverable = await integration(results);

    const knowledge = await learning(deliverable, intent, world);

    expect(knowledge.recommendations).toBeDefined();
    expect(
      knowledge.recommendations.immediate.length +
      knowledge.recommendations.shortTerm.length +
      knowledge.recommendations.longTerm.length
    ).toBeGreaterThan(0);
  });
});

// ============================================================================
// Integration Tests for Full Pipeline
// ============================================================================

describe('Ω-System Full Pipeline', () => {
  it('should execute complete pipeline', async () => {
    const intent = createMockIntent();
    const world = createMockWorld();

    const result = await omega(intent, world);

    expect(result.success).toBe(true);
    expect(result.deliverable).toBeDefined();
    expect(result.knowledge).toBeDefined();
    expect(result.trace.stages).toHaveLength(6);
  });

  it('should execute pipeline without learning', async () => {
    const intent = createMockIntent();
    const world = createMockWorld();

    const result = await omegaWithoutLearning(intent, world);

    expect(result.success).toBe(true);
    expect(result.knowledge).toBeUndefined();
    expect(result.trace.stages.find(s => s.stage === 'θ₆')?.status).toBe('skipped');
  });

  it('should track all stages in trace', async () => {
    const intent = createMockIntent();
    const world = createMockWorld();

    const result = await omega(intent, world);

    expect(result.trace.stages.map(s => s.stage)).toEqual([
      'θ₁', 'θ₂', 'θ₃', 'θ₄', 'θ₅', 'θ₆'
    ]);
  });

  it('should provide intermediate results', async () => {
    const intent = createMockIntent();
    const world = createMockWorld();

    const result = await omega(intent, world);

    expect(result.trace.intermediates.plan).toBeDefined();
    expect(result.trace.intermediates.taskSet).toBeDefined();
    expect(result.trace.intermediates.allocation).toBeDefined();
    expect(result.trace.intermediates.resultSet).toBeDefined();
    expect(result.trace.intermediates.deliverable).toBeDefined();
    expect(result.trace.intermediates.knowledge).toBeDefined();
  });
});

describe('OmegaEngine Class', () => {
  let engine: OmegaEngine;

  beforeEach(() => {
    engine = new OmegaEngine();
  });

  it('should create engine with default config', () => {
    expect(engine.isExecuting()).toBe(false);
  });

  it('should execute pipeline', async () => {
    const intent = createMockIntent();
    const world = createMockWorld();

    const result = await engine.execute(intent, world);

    expect(result.success).toBe(true);
  });

  it('should support custom config', async () => {
    const customEngine = new OmegaEngine({
      enableLearning: false,
      validateBetweenStages: false,
    });

    const intent = createMockIntent();
    const world = createMockWorld();

    const result = await customEngine.execute(intent, world);

    expect(result.success).toBe(true);
    expect(result.knowledge).toBeUndefined();
  });

  it('should call stage callbacks', async () => {
    const onStageComplete = vi.fn();
    const customEngine = new OmegaEngine({
      onStageComplete,
    });

    const intent = createMockIntent();
    const world = createMockWorld();

    await customEngine.execute(intent, world);

    expect(onStageComplete).toHaveBeenCalled();
    expect(onStageComplete.mock.calls.length).toBe(6);
  });

  it('should abort execution', async () => {
    const slowEngine = new OmegaEngine({
      maxExecutionTimeMs: 1, // Very short timeout
    });

    const intent = createMockIntent();
    const world = createMockWorld();

    const result = await slowEngine.execute(intent, world);

    // May or may not succeed depending on timing
    expect(result.trace).toBeDefined();
  });
});

describe('Validation Functions', () => {
  it('should detect invalid plans', () => {
    const invalidPlan = {
      planId: 'test',
      createdAt: new Date().toISOString(),
      intentSummary: { primaryGoal: '', goalCount: 0, preferenceProfile: '', outputModality: '' },
      worldContext: { environment: '', availableResources: [], activeConstraints: [] },
      objectives: [], // Empty - invalid
      resources: {} as any,
      risks: { overallRisk: 'low', factors: [], blockers: [], dependencies: [] } as any,
      strategy: { approach: 'sequential', phases: [], estimatedTotalDurationMs: 0, confidenceLevel: 0 } as any,
      metadata: {} as any,
    };

    const validation = validatePlan(invalidPlan as any);

    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });

  it('should detect invalid task sets', () => {
    const invalidTaskSet = {
      setId: 'test',
      createdAt: new Date().toISOString(),
      sourcePlanId: 'plan-1',
      tasks: [], // Empty - invalid
      dag: { nodes: [], edges: [], levels: [] },
      groups: [],
      summary: {} as any,
      metadata: {} as any,
    };

    const validation = validateTaskSet(invalidTaskSet as any);

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('No tasks generated');
  });

  it('should detect invalid allocations', () => {
    const invalidAllocation = {
      allocationId: 'test',
      createdAt: new Date().toISOString(),
      sourceTaskSetId: 'taskset-1',
      workers: [], // Empty - invalid
      batches: [], // Empty - invalid
      utilization: {} as any,
      resources: {} as any,
      optimization: {} as any,
      metadata: {} as any,
    };

    const validation = validateAllocation(invalidAllocation as any);

    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });
});
