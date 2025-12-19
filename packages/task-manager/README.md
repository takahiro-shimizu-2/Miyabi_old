# @miyabi/task-manager

LLM-based task decomposition and Linear-like status sync for Miyabi.

## Features

- **LLM Task Decomposition**: Uses Claude API to decompose prompts into executable tasks
- **GitHub Sync**: Bidirectional sync with GitHub Labels and Projects V2
- **State Machine**: 10-state task lifecycle with validated transitions
- **Parallel Execution**: Execute tasks in parallel using git worktrees
- **Agent Integration**: Pluggable agent executor system

## Installation

```bash
npm install @miyabi/task-manager
```

## Quick Start

```typescript
import {
  TaskManager,
  createDefaultConfig,
} from '@miyabi/task-manager';

// Create config
const config = createDefaultConfig({
  llm: { apiKey: process.env.ANTHROPIC_API_KEY! },
  sync: {
    github: {
      owner: 'your-org',
      repo: 'your-repo',
      token: process.env.GITHUB_TOKEN!,
    },
  },
});

// Initialize task manager
const taskManager = new TaskManager(config);
await taskManager.initialize();

// Decompose a prompt into tasks
const result = await taskManager.decompose({
  prompt: 'Add user authentication with JWT tokens',
});

console.log(`Generated ${result.tasks.length} tasks`);
console.log(`Estimated duration: ${result.dag.estimatedDurationMinutes} minutes`);

// Execute tasks following DAG order
const executionResults = await taskManager.executeByDAG(result);

// Sync state to GitHub
await taskManager.syncTasks('push');
```

## Core Components

### TaskStateMachine

Manages valid state transitions for tasks.

```typescript
import { TaskStateMachine } from '@miyabi/task-manager';

const stateMachine = new TaskStateMachine();

// Check if transition is valid
const canTransition = stateMachine.canTransition('pending', 'analyzing');
// true

// Get valid next states
const validStates = stateMachine.getValidTransitions('implementing');
// ['reviewing', 'blocked', 'failed', 'cancelled']
```

**State Diagram:**

```
draft → pending → analyzing → implementing → reviewing → deploying → done
                     ↓             ↓             ↓           ↓
                  blocked ←────────┴─────────────┴───────────┘
                     ↓
                  failed → (retry) → pending
                     ↓
                 cancelled
```

### LLMDecomposer

Decomposes prompts into tasks using Claude.

```typescript
import { LLMDecomposer } from '@miyabi/task-manager';

const decomposer = new LLMDecomposer({
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514',
  apiKey: process.env.ANTHROPIC_API_KEY!,
  maxTokens: 4096,
  temperature: 0.3,
});

const result = await decomposer.decompose({
  prompt: 'Build a REST API for user management',
  context: {
    codebaseInfo: 'TypeScript + Express + PostgreSQL',
    existingPatterns: ['Repository pattern', 'Dependency injection'],
  },
  constraints: {
    maxTasks: 10,
    preferredAgents: ['CodeGenAgent', 'ReviewAgent'],
  },
});

// Result includes:
// - tasks: ManagedTask[]
// - dag: { nodes, edges, levels, criticalPath, estimatedDurationMinutes }
// - metadata: { model, tokenUsage, confidence }
// - warnings: DecompositionWarning[]
```

### GitHub Sync

#### GitHubLabelSync

Syncs task state with GitHub Issue labels.

```typescript
import { GitHubLabelSync } from '@miyabi/task-manager';

const labelSync = new GitHubLabelSync({
  github: { owner, repo, token },
  labelMapping: {},
  fieldMapping: {},
});

// Ensure state labels exist
await labelSync.ensureStateLabels();

// Push task state to labels
await labelSync.pushState(task);

// Pull state from labels
const { state, labels } = await labelSync.pullState(issueNumber);
```

#### ProjectsV2Sync

Syncs with GitHub Projects V2 custom fields.

```typescript
import { ProjectsV2Sync } from '@miyabi/task-manager';

const projectsSync = new ProjectsV2Sync({
  github: { owner, repo, token, projectNumber: 1 },
  labelMapping: {},
  fieldMapping: {},
});

await projectsSync.initialize();

// Push task status to project
await projectsSync.pushState(task, 'Status');

// Pull status from project
const { state, fieldValues } = await projectsSync.pullState(issueNumber, 'Status');
```

#### BidirectionalSync

Orchestrates both label and project sync.

```typescript
import { BidirectionalSync } from '@miyabi/task-manager';

const sync = new BidirectionalSync(config, {
  conflictStrategy: 'local-wins',
  syncLabels: true,
  syncProjects: true,
});

await sync.initialize();
await sync.sync(tasks, 'bidirectional');
```

### Task Execution

#### TaskExecutor

Execute tasks with pluggable agent system.

```typescript
import { TaskExecutor, AgentExecutor } from '@miyabi/task-manager';

const executor = new TaskExecutor(config.execution);

// Register custom agent
const myAgent: AgentExecutor = {
  agentType: 'CodeGenAgent',
  canExecute: (task) => task.type === 'feature',
  execute: async (task) => {
    // Custom execution logic
    return {
      taskId: task.id,
      success: true,
      state: 'done',
      output: 'Generated code',
      durationMs: 5000,
      agentType: 'CodeGenAgent',
    };
  },
};

executor.registerAgent(myAgent);

// Execute single task
const result = await executor.execute(task);

// Execute in parallel
const results = await executor.executeParallel(tasks, 3);
```

#### WorktreeCoordinator

Execute tasks in isolated git worktrees.

```typescript
import { WorktreeCoordinator } from '@miyabi/task-manager';

const coordinator = new WorktreeCoordinator(
  '/path/to/repo',
  config.execution
);

await coordinator.initialize();

// Execute task in worktree
const result = await coordinator.executeInWorktree(task);

// Execute multiple in parallel worktrees
const results = await coordinator.executeParallel(tasks, 3);
```

## Configuration

```typescript
interface TaskManagerConfig {
  llm: {
    provider: 'anthropic' | 'openai';
    model: string;
    apiKey: string;
    maxTokens: number;
    temperature: number;
  };
  sync: {
    github: {
      owner: string;
      repo: string;
      token: string;
      projectNumber?: number;
    };
    labelMapping: LabelMapping;
    fieldMapping: FieldMapping;
  };
  execution: {
    maxConcurrency: number;
    worktreeBasePath: string;
    timeoutMinutes: number;
    retryConfig: RetryConfig;
    stopOnFailure: boolean;
    useWorktrees: boolean;
  };
  state: {
    persistenceEnabled: boolean;
    persistenceDir: string;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    outputDir: string;
  };
}
```

## Task States

| State | Description |
|-------|-------------|
| `draft` | Task created but not ready |
| `pending` | Ready for execution |
| `analyzing` | Being analyzed by IssueAgent/CoordinatorAgent |
| `implementing` | Being implemented by CodeGenAgent |
| `reviewing` | Under review by ReviewAgent |
| `deploying` | Being deployed by DeploymentAgent |
| `done` | Successfully completed |
| `blocked` | Waiting for dependencies |
| `failed` | Execution failed |
| `cancelled` | Cancelled by user |

## Agent Types

- `CoordinatorAgent` - Task decomposition and orchestration
- `CodeGenAgent` - Code generation
- `ReviewAgent` - Code review and quality checks
- `IssueAgent` - Issue analysis and labeling
- `PRAgent` - Pull request creation
- `DeploymentAgent` - Deployment automation
- `TaskManagerAgent` - Task state management

## Label System

Uses Miyabi's 53-label system for state sync:

```
state:pending → state:analyzing → state:implementing → state:reviewing → state:done
```

## API Reference

### TaskManager

Main entry point for task management.

| Method | Description |
|--------|-------------|
| `initialize()` | Initialize sync and worktree components |
| `decompose(request)` | Decompose prompt into tasks |
| `createTask(input)` | Create a single task |
| `getTask(id)` | Get task by ID |
| `getTasks()` | Get all tasks |
| `getTasksByState(state)` | Get tasks in specific state |
| `updateTaskState(id, state, triggeredBy)` | Update task state |
| `executeTask(id)` | Execute single task |
| `executeTasks(ids, options)` | Execute multiple tasks |
| `executeByDAG(result)` | Execute following DAG order |
| `syncTasks(direction)` | Sync with GitHub |
| `validateTasks()` | Validate all tasks |
| `cancelTask(id)` | Cancel running task |
| `getRunningTasks()` | Get currently running tasks |

## Testing

```bash
npm test
```

## License

MIT
