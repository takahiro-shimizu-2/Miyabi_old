# Ω-System: Autonomous Execution Engine

## Overview

The Ω-System is the core execution engine for Miyabi's autonomous agent operations. Based on the SWML (Shunsuke World Model Logic) mathematical framework, it transforms user intent into executable results through a 6-stage pipeline.

### Mathematical Foundation

```
Ω: I × W → R

Where:
- I = Intent Space (goals, preferences, objectives, modality)
- W = World Space (temporal, spatial, contextual, resources, environmental)
- R = Result Space (artifacts, metadata, quality)
```

## Architecture

### 6-Stage Transformation Pipeline

```
E = θ₆ ∘ θ₅ ∘ θ₄ ∘ θ₃ ∘ θ₂ ∘ θ₁

┌──────────────────────────────────────────────────────────────────────┐
│                        Ω-System Pipeline                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Intent (I)      World (W)                                           │
│      │               │                                               │
│      └───────┬───────┘                                               │
│              ▼                                                       │
│     ┌────────────────┐                                               │
│     │ θ₁ Understanding│ → Strategic Plan (S)                         │
│     └────────┬───────┘                                               │
│              ▼                                                       │
│     ┌────────────────┐                                               │
│     │ θ₂ Generation   │ → Task Set (𝕋)                              │
│     └────────┬───────┘                                               │
│              ▼                                                       │
│     ┌────────────────┐                                               │
│     │ θ₃ Allocation   │ → Agent Allocation (A)                       │
│     └────────┬───────┘                                               │
│              ▼                                                       │
│     ┌────────────────┐                                               │
│     │ θ₄ Execution    │ → Result Set (R)                             │
│     └────────┬───────┘                                               │
│              ▼                                                       │
│     ┌────────────────┐                                               │
│     │ θ₅ Integration  │ → Deliverable (D)                            │
│     └────────┬───────┘                                               │
│              ▼                                                       │
│     ┌────────────────┐                                               │
│     │ θ₆ Learning     │ → Knowledge (K)                              │
│     └────────────────┘                                               │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### Stage Details

| Stage | Transform | Input | Output | Purpose |
|-------|-----------|-------|--------|---------|
| θ₁ | Understanding | I × W | S | Analyze intent and create strategic plan |
| θ₂ | Generation | S × W | 𝕋 | Generate executable task set with DAG |
| θ₃ | Allocation | 𝕋 × W | A | Assign agents and allocate resources |
| θ₄ | Execution | A | R | Execute tasks and collect results |
| θ₅ | Integration | R | D | Integrate results into deliverable |
| θ₆ | Learning | D × I × W | K | Extract knowledge and patterns |

## Usage

### Basic Usage

```typescript
import { OmegaEngine, issueToIntent, contextToWorld } from '@miyabi/coding-agents';

// Create engine
const engine = new OmegaEngine({
  enableLearning: true,
  validateBetweenStages: true,
});

// Convert input to SWML spaces
const intent = issueToIntent(issue);
const world = contextToWorld({ projectRoot: process.cwd() });

// Execute pipeline
const result = await engine.execute(intent, world);

if (result.success) {
  console.log('Deliverable:', result.deliverable);
  console.log('Knowledge:', result.knowledge);
}
```

### Using with Agents

```typescript
import { OmegaAgentAdapter } from '@miyabi/coding-agents';

const adapter = new OmegaAgentAdapter({
  enableLearning: true,
  maxExecutionTimeMs: 600000,
});

// Execute with Issue
const response = await adapter.execute({
  issue: myIssue,
  agentType: 'CodeGenAgent',
});

// Execute with Tasks
const response = await adapter.execute({
  tasks: [task1, task2, task3],
  agentType: 'CodeGenAgent',
  context: {
    projectRoot: '/path/to/project',
    config: { language: 'typescript' },
  },
});
```

### Agent Integration

All coding agents support Ω-System execution:

```typescript
import { CodeGenAgent, ReviewAgent } from '@miyabi/coding-agents';

// Enable Ω-System in agent config
const agent = new CodeGenAgent({
  useOmegaSystem: true,
  timeoutMs: 600000,
  // ... other config
});

// Use Ω-System pipeline
const result = await agent.executeWithOmega(task);

// Check if enabled
if (agent.isOmegaEnabled()) {
  const adapter = agent.getOmegaAdapter();
}
```

### Parallel Execution

```typescript
const adapter = new OmegaAgentAdapter();

// Execute multiple requests in parallel
const responses = await adapter.executeParallel([
  { issue: issue1, agentType: 'CodeGenAgent' },
  { issue: issue2, agentType: 'ReviewAgent' },
  { issue: issue3, agentType: 'PRAgent' },
]);

// Or sequentially (stops on failure)
const responses = await adapter.executeSequential(requests);
```

## Configuration

### OmegaEngineConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enableLearning` | boolean | true | Enable θ₆ learning stage |
| `validateBetweenStages` | boolean | true | Validate outputs between stages |
| `maxExecutionTimeMs` | number | 600000 | Maximum execution time |
| `onStageStart` | callback | - | Called when stage starts |
| `onStageComplete` | callback | - | Called when stage completes |
| `onStageError` | callback | - | Called on stage error |

### AgentConfig Extensions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `useOmegaSystem` | boolean | false | Enable Ω-System for agent |
| `timeoutMs` | number | 600000 | Ω-System timeout |

## Input Spaces

### Intent Space (I)

```typescript
interface IntentSpace {
  metadata: IntentMetadata;
  goals: {
    primary: { main: Goal; supporting: Goal[] };
    secondary: { goals: Goal[]; priorityOrder: string[] };
    implicit: { inferred: Goal[]; confidence: number; source: string };
    allGoals: Goal[];
  };
  preferences: {
    qualityVsSpeed: QualitySpeedTradeOff;
    costVsPerformance: CostPerformanceTradeOff;
    automationVsControl: AutomationControlTradeOff;
    risk: RiskPreferences;
  };
  objectives: {
    functional: FunctionalRequirement[];
    nonFunctional: NonFunctionalRequirement[];
    quality: QualityAttribute[];
    constraints: Constraint[];
  };
  modality: OutputModality;
}
```

### World Space (W)

```typescript
interface WorldSpace {
  metadata: WorldMetadata;
  temporal: {
    currentTime: string;
    horizon: TimeHorizon;
    scheduling: SchedulingConstraints;
  };
  spatial: {
    locations: SpatialLocation[];
    topology: DependencyGraph;
    boundaries: SpatialBoundary[];
  };
  contextual: {
    domain: DomainContext;
    knowledge: KnowledgeBase;
    history: ExecutionHistory[];
  };
  resources: {
    computational: ComputationalResources;
    human: HumanResources;
    data: DataResources;
    external: ExternalServices;
  };
  environmental: {
    constraints: EnvironmentalConstraints;
    conditions: EnvironmentalConditions;
    integrations: IntegrationPoints;
  };
}
```

## Output Spaces

### Execution Report

```typescript
interface ExecutionReport {
  id: string;
  status: 'success' | 'partial' | 'failure';
  summary: string;
  results: {
    tasksCompleted: number;
    tasksFailed: number;
    totalTasks: number;
    successRate: number;
  };
  artifacts: Array<{ type: string; path?: string; content?: string }>;
  quality?: { score: number; grade: string; issues: string[] };
  performance?: { durationMs: number; tokensUsed: number };
  messages: Array<{ level: string; message: string }>;
  recommendations?: string[];
  timestamp: string;
}
```

### Knowledge

```typescript
interface Knowledge {
  sessionId: string;
  createdAt: string;
  patterns: ExecutionPattern[];
  insights: PerformanceInsight[];
  recommendations: KnowledgeRecommendation[];
  lessons: LessonLearned[];
  updates: KnowledgeUpdate[];
  calibrations: ModelCalibration[];
}
```

## Adapters

### Issue to Intent

Converts GitHub Issues to SWML Intent Space:

```typescript
import { issueToIntent, IssueToIntentAdapter } from '@miyabi/coding-agents';

// Simple function
const intent = issueToIntent(issue);

// Or use adapter class
const adapter = new IssueToIntentAdapter();
const intent = adapter.convert(issue);
```

**Mapping:**
- Issue title/body → Goals
- Labels (`priority:P0`) → Goal priority
- Labels (`security`) → Quality bias
- Labels (`urgent`) → Speed bias
- Acceptance criteria → Success criteria

### Context to World

Converts execution context to SWML World Space:

```typescript
import { contextToWorld, createWorldFromEnvironment } from '@miyabi/coding-agents';

// From context
const world = contextToWorld({
  projectRoot: process.cwd(),
  repository: { owner: 'user', name: 'repo', branch: 'main' },
  config: { language: 'typescript', framework: 'nextjs' },
  constraints: { maxConcurrency: 5 },
});

// From current environment
const world = createWorldFromEnvironment();
```

### Deliverable to Report

Converts Ω-System Deliverable to ExecutionReport:

```typescript
import { deliverableToReport, summarizeReport } from '@miyabi/coding-agents';

const report = deliverableToReport(deliverable, knowledge);
const markdown = summarizeReport(report);
```

## Testing

Run Ω-System tests:

```bash
# All Ω-System tests
npm run test:omega

# Or with vitest directly
npx vitest run packages/coding-agents/omega-system
```

### Test Coverage

| Test Suite | Tests | Description |
|------------|-------|-------------|
| omega-engine.test.ts | 30 | Core engine and stages |
| adapters.test.ts | 31 | Adapter functions |
| integration.test.ts | 33 | End-to-end integration |
| **Total** | **94** | |

## Performance

### Benchmarks

| Operation | Duration | Notes |
|-----------|----------|-------|
| Single pipeline execution | ~1-2s | Full 6-stage pipeline |
| Parallel 5 requests | ~3-5s | Concurrent execution |
| Stage θ₁ (Understanding) | ~200-400ms | Intent analysis |
| Stage θ₂ (Generation) | ~300-500ms | Task generation |
| Stage θ₃ (Allocation) | ~100-200ms | Agent assignment |
| Stage θ₄ (Execution) | ~200-400ms | Simulation |
| Stage θ₅ (Integration) | ~200-400ms | Result integration |
| Stage θ₆ (Learning) | ~100-300ms | Knowledge extraction |

### Optimization Tips

1. **Disable learning for speed**: Set `enableLearning: false` to skip θ₆
2. **Parallel execution**: Use `executeParallel()` for independent requests
3. **Timeout management**: Set appropriate `maxExecutionTimeMs`
4. **Validation**: Disable `validateBetweenStages` for production

## Error Handling

```typescript
try {
  const result = await engine.execute(intent, world);

  if (!result.success) {
    console.error('Errors:', result.errors);
    // Handle partial failure
  }
} catch (error) {
  // Handle fatal error
}
```

### Error Types

| Error | Description | Recovery |
|-------|-------------|----------|
| Validation Error | Invalid input | Check intent/world structure |
| Stage Error | Stage failed | Check stage trace |
| Timeout Error | Execution timeout | Increase timeout or simplify |

## Related Documentation

- [SWML Type Definitions](../packages/coding-agents/types/intent.ts)
- [World Space Types](../packages/coding-agents/types/world.ts)
- [Agent Integration](./AGENT_OPERATIONS_MANUAL.md)
- [miyabi_def Foundation](../miyabi_def/README.md)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-12 | Initial release |

---

**Ω-System** - The mathematical foundation for autonomous execution.
