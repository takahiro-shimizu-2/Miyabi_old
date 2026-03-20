---
name: miyabi-pipeline
description: "Command composition and pipeline orchestration. Chain agent commands with pipe (|), AND (&&), OR (||), and parallel (&) operators."
allowed-tools: Bash, Read, Write, Grep, Glob
---

# Miyabi Pipeline

**Version**: 1.0.0
**Purpose**: Command composition and orchestrated agent execution

---

## Triggers

| Trigger | Examples |
|---------|----------|
| Pipeline execution | "run pipeline", "パイプライン実行" |
| Full cycle | "full cycle", "フルサイクル" |
| Preset pipeline | "run quality gate", "品質ゲート実行" |
| Command composition | "chain commands", "コマンド連鎖" |

---

## Pipeline Operators

| Operator | Name | Description |
|----------|------|-------------|
| `\|` | Pipe | Sequential execution, pass context |
| `&&` | AND | Run next only if previous succeeds |
| `\|\|` | OR | Run next only if previous fails |
| `&` | Parallel | Run commands concurrently |

## Preset Pipelines

| Preset | Pipeline | Use Case |
|--------|----------|----------|
| `full-cycle` | `/agent-run \| /review \| /test \| /security-scan \| /deploy \| /verify` | Complete automation |
| `quick-deploy` | `/verify && /deploy` | Fast deployment |
| `quality-gate` | `/review && /test && /security-scan` | Quality check only |
| `auto-fix` | `/review --auto-fix` | Auto-fix review issues |

## Usage

```bash
# Execute preset pipeline
miyabi pipeline --preset full-cycle --issue 123 --json

# Custom pipeline
miyabi pipeline "/agent-run | /review | /deploy" --json

# Dry run (preview)
miyabi pipeline --preset quality-gate --dry-run --json

# Resume from checkpoint
miyabi pipeline --resume <checkpoint-id> --json

# List available presets
miyabi pipeline --list-presets
```

## Pipeline State Flow

```
1. Agent Run     → Code generation from Issue
2. Review        → Quality scoring (80+ required)
3. Test          → All tests must pass
4. Security Scan → No high/critical vulnerabilities
5. Deploy        → Staging → Production
6. Verify        → Health check + smoke tests
```

## Checkpoint System

Each pipeline step creates a checkpoint for resumability:
- Pipeline ID: `pipeline-<uuid>`
- Checkpoints stored in pipeline context
- Resume from any failed step

## Error Handling

| Error | Action |
|-------|--------|
| Review score < 80 | Auto-retry up to 3 times with feedback |
| Test failure | Stop pipeline, report failing tests |
| Security alert | Block deploy, escalate to human |
| Deploy failure | Automatic rollback to last stable |

## JSON Response

```json
{
  "pipelineId": "pipeline-xxx",
  "startedAt": "2026-03-20T00:00:00Z",
  "issueNumber": 123,
  "prNumber": 456,
  "qualityScore": 85,
  "testsPassed": true,
  "success": true,
  "currentStep": 5,
  "totalSteps": 5
}
```
