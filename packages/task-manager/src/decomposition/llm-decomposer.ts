/**
 * LLM Task Decomposer
 * Uses Claude/GPT to decompose prompts into executable tasks
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  LLMConfig,
  DecompositionRequest,
  DecompositionResult,
  DecompositionWarning,
  RawLLMTask,
  ManagedTask,
  TaskType,
  AgentType,
  DAGEdge,
} from '../types/index.js';
import { createManagedTask, DECOMPOSITION_WARNING_CODES } from '../types/index.js';
import { SYSTEM_PROMPT, buildDecompositionPrompt, buildSimplePrompt } from './prompt-templates.js';
import { DecompositionValidator } from './decomposition-validator.js';

/**
 * LLM Decomposer for task decomposition
 */
export class LLMDecomposer {
  private client: Anthropic;
  private config: LLMConfig;
  private validator: DecompositionValidator;

  constructor(config: LLMConfig) {
    if (config.provider !== 'anthropic') {
      throw new Error('Only Anthropic provider is currently supported');
    }

    this.config = config;
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.validator = new DecompositionValidator();
  }

  /**
   * Decompose a prompt into tasks
   */
  async decompose(request: DecompositionRequest): Promise<DecompositionResult> {
    const startTime = Date.now();
    const warnings: DecompositionWarning[] = [];

    // Build prompts
    const userPrompt = request.context || request.constraints
      ? buildDecompositionPrompt(request)
      : buildSimplePrompt(request.prompt);

    // Call Claude API
    const response = await this.client.messages.create({
      model: this.config.model,
      max_tokens: this.config.maxTokens,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    // Extract text content
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse response
    const parsed = this.parseResponse(content.text, warnings);

    // Validate tasks
    const validation = this.validator.validate(parsed.tasks);
    warnings.push(...validation.warnings);

    // Build DAG
    const dag = this.buildDAG(parsed.tasks);

    // Check for cycles
    const cycles = this.detectCycles(dag);
    if (cycles.length > 0) {
      warnings.push({
        code: DECOMPOSITION_WARNING_CODES.CIRCULAR_DEPENDENCY,
        message: `Circular dependency detected: ${cycles.join(' -> ')}`,
        severity: 'error',
        affectedTaskIds: cycles,
      });
    }

    // Calculate critical path
    const criticalPath = this.calculateCriticalPath(parsed.tasks, dag);

    // Calculate confidence
    const confidence = this.calculateConfidence(parsed.tasks, validation, warnings);

    const result: DecompositionResult = {
      id: `decomp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      originalPrompt: request.prompt,
      tasks: parsed.tasks,
      dag: {
        nodes: parsed.tasks,
        edges: dag.edges,
        levels: dag.levels,
        criticalPath,
        estimatedDurationMinutes: this.calculateTotalDuration(parsed.tasks, criticalPath),
      },
      metadata: {
        model: this.config.model,
        tokenUsage: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
        },
        processingTimeMs: Date.now() - startTime,
        confidence,
      },
      warnings: [...parsed.warnings, ...warnings],
      createdAt: new Date().toISOString(),
    };

    return result;
  }

  /**
   * Parse LLM response into tasks
   */
  private parseResponse(
    text: string,
    warnings: DecompositionWarning[]
  ): { tasks: ManagedTask[]; warnings: DecompositionWarning[] } {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();

    try {
      const parsed = JSON.parse(jsonStr);
      const rawTasks: RawLLMTask[] = parsed.tasks || [];
      const rawWarnings: DecompositionWarning[] = parsed.warnings || [];

      if (rawTasks.length === 0) {
        warnings.push({
          code: DECOMPOSITION_WARNING_CODES.NO_TASKS_GENERATED,
          message: 'No tasks were generated from the prompt',
          severity: 'error',
        });
      }

      const tasks = rawTasks.map((raw, index) => this.normalizeTask(raw, index));

      return { tasks, warnings: rawWarnings };
    } catch (e) {
      warnings.push({
        code: DECOMPOSITION_WARNING_CODES.PARSE_ERROR,
        message: `Failed to parse LLM response: ${e instanceof Error ? e.message : 'Unknown error'}`,
        severity: 'error',
      });
      return { tasks: [], warnings: [] };
    }
  }

  /**
   * Normalize raw LLM task to ManagedTask
   */
  private normalizeTask(raw: RawLLMTask, index: number): ManagedTask {
    const taskType = this.normalizeTaskType(raw.type);
    const agentType = this.normalizeAgentType(raw.assignedAgent || raw.assigned_agent);

    return createManagedTask(
      {
        title: raw.title,
        description: raw.description || '',
        type: taskType,
        priority: raw.priority ?? (100 - index * 10),
        dependencies: raw.dependencies || [],
        estimatedDuration: raw.estimatedDuration || raw.estimated_duration || 30,
        assignedAgent: agentType,
      },
      raw.id || `task-${index}`
    );
  }

  /**
   * Normalize task type
   */
  private normalizeTaskType(type?: string): TaskType {
    const validTypes: TaskType[] = ['feature', 'bug', 'refactor', 'docs', 'test', 'deployment', 'chore'];
    const normalized = type?.toLowerCase() as TaskType;
    return validTypes.includes(normalized) ? normalized : 'feature';
  }

  /**
   * Normalize agent type
   */
  private normalizeAgentType(agent?: string): AgentType | undefined {
    if (!agent) return 'CodeGenAgent';

    const agentMap: Record<string, AgentType> = {
      'codegenagent': 'CodeGenAgent',
      'codegen': 'CodeGenAgent',
      'reviewagent': 'ReviewAgent',
      'review': 'ReviewAgent',
      'deploymentagent': 'DeploymentAgent',
      'deployment': 'DeploymentAgent',
      'deploy': 'DeploymentAgent',
      'issueagent': 'IssueAgent',
      'issue': 'IssueAgent',
      'pragent': 'PRAgent',
      'pr': 'PRAgent',
    };

    const normalized = agent.toLowerCase().replace(/[^a-z]/g, '');
    return agentMap[normalized] || 'CodeGenAgent';
  }

  /**
   * Build DAG from tasks
   */
  private buildDAG(tasks: ManagedTask[]): { edges: DAGEdge[]; levels: string[][] } {
    const edges: DAGEdge[] = [];
    const taskMap = new Map(tasks.map(t => [t.id, t]));

    // Build edges from dependencies
    for (const task of tasks) {
      for (const depId of task.dependencies) {
        if (taskMap.has(depId)) {
          edges.push({ from: depId, to: task.id, type: 'depends-on' });
        }
      }
    }

    // Topological sort to get levels
    const levels = this.topologicalSort(tasks, edges);

    return { edges, levels };
  }

  /**
   * Topological sort to get execution levels
   */
  private topologicalSort(tasks: ManagedTask[], edges: DAGEdge[]): string[][] {
    const inDegree = new Map<string, number>();
    const adjacency = new Map<string, string[]>();

    // Initialize
    for (const task of tasks) {
      inDegree.set(task.id, 0);
      adjacency.set(task.id, []);
    }

    // Build adjacency list and in-degrees
    for (const edge of edges) {
      const neighbors = adjacency.get(edge.from) || [];
      neighbors.push(edge.to);
      adjacency.set(edge.from, neighbors);

      inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
    }

    // Process levels
    const levels: string[][] = [];
    let remaining = new Set(tasks.map(t => t.id));

    while (remaining.size > 0) {
      // Find all nodes with in-degree 0
      const currentLevel: string[] = [];
      for (const id of remaining) {
        if ((inDegree.get(id) || 0) === 0) {
          currentLevel.push(id);
        }
      }

      if (currentLevel.length === 0) {
        // Cycle detected - break with remaining nodes
        break;
      }

      levels.push(currentLevel);

      // Remove processed nodes and update in-degrees
      for (const id of currentLevel) {
        remaining.delete(id);
        for (const neighbor of adjacency.get(id) || []) {
          inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
        }
      }
    }

    return levels;
  }

  /**
   * Detect cycles in DAG
   */
  private detectCycles(dag: { edges: DAGEdge[]; levels: string[][] }): string[] {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const adjacency = new Map<string, string[]>();

    // Build adjacency list
    for (const edge of dag.edges) {
      const neighbors = adjacency.get(edge.from) || [];
      neighbors.push(edge.to);
      adjacency.set(edge.from, neighbors);
    }

    const dfs = (node: string, path: string[]): string[] => {
      visited.add(node);
      recursionStack.add(node);

      for (const neighbor of adjacency.get(node) || []) {
        if (recursionStack.has(neighbor)) {
          return [...path, neighbor];
        }
        if (!visited.has(neighbor)) {
          const cycle = dfs(neighbor, [...path, neighbor]);
          if (cycle.length > 0) return cycle;
        }
      }

      recursionStack.delete(node);
      return [];
    };

    for (const [node] of adjacency) {
      if (!visited.has(node)) {
        const cycle = dfs(node, [node]);
        if (cycle.length > 0) return cycle;
      }
    }

    return [];
  }

  /**
   * Calculate critical path (longest path in DAG)
   */
  private calculateCriticalPath(tasks: ManagedTask[], dag: { edges: DAGEdge[]; levels: string[][] }): string[] {
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    const dist = new Map<string, number>();
    const prev = new Map<string, string>();

    // Initialize distances
    for (const task of tasks) {
      dist.set(task.id, 0);
    }

    // Process levels in order
    for (const level of dag.levels) {
      for (const taskId of level) {
        const task = taskMap.get(taskId);
        if (!task) continue;

        const currentDist = dist.get(taskId) || 0;

        for (const depId of task.dependencies) {
          const depDist = dist.get(depId) || 0;
          const depTask = taskMap.get(depId);
          const depDuration = depTask?.estimatedDuration || 0;

          if (depDist + depDuration > currentDist) {
            dist.set(taskId, depDist + depDuration);
            prev.set(taskId, depId);
          }
        }
      }
    }

    // Find the task with maximum distance
    let maxDist = 0;
    let endTask = '';
    for (const [id, d] of dist) {
      const task = taskMap.get(id);
      const totalDist = d + (task?.estimatedDuration || 0);
      if (totalDist > maxDist) {
        maxDist = totalDist;
        endTask = id;
      }
    }

    // Reconstruct path
    const path: string[] = [];
    let current = endTask;
    while (current) {
      path.unshift(current);
      current = prev.get(current) || '';
    }

    return path;
  }

  /**
   * Calculate total duration based on critical path
   */
  private calculateTotalDuration(tasks: ManagedTask[], criticalPath: string[]): number {
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    let total = 0;

    for (const taskId of criticalPath) {
      const task = taskMap.get(taskId);
      if (task) {
        total += task.estimatedDuration || 0;
      }
    }

    return total;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    tasks: ManagedTask[],
    validation: { errors: DecompositionWarning[]; warnings: DecompositionWarning[] },
    allWarnings: DecompositionWarning[]
  ): number {
    let score = 1.0;

    // Penalize for errors and warnings
    score -= validation.errors.length * 0.15;
    score -= validation.warnings.length * 0.05;
    score -= allWarnings.filter(w => w.severity === 'error').length * 0.1;
    score -= allWarnings.filter(w => w.severity === 'warning').length * 0.03;

    // Bonus for well-structured output
    if (tasks.length > 0 && tasks.length <= 10) {
      score += 0.05;
    }

    // Bonus for having tests and reviews
    const hasTestTask = tasks.some(t => t.type === 'test');
    const hasReviewTask = tasks.some(t => t.assignedAgent === 'ReviewAgent');
    if (hasTestTask) score += 0.05;
    if (hasReviewTask) score += 0.05;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Get the current configuration
   */
  getConfig(): LLMConfig {
    return { ...this.config };
  }
}
