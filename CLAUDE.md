# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Miyabi is an autonomous AI development platform that automates the entire software development lifecycle from Issue to Deploy. The system uses 21 specialized AI agents (7 Coding + 14 Business) orchestrated through GitHub as an operating system.

**Core Concept**: `Issue → Agent → Code → Review → PR → Deploy` (10-15 minutes)

## Development Commands

### Root Level (Monorepo)
```bash
npm test                    # Run vitest tests
npm run build               # TypeScript compile
npm run lint                # ESLint check
npm run typecheck           # TypeScript type check
npm run verify:all          # lint + typecheck + test + security:scan

# Agent Operations
npm run agents:parallel:exec -- --issues=123,124 --concurrency=2
npm run agents:verify       # Verify all agents pass lint/type/test
npm run agents:status       # Check agent status
```

### CLI Package (`packages/cli/`)
```bash
cd packages/cli
npm run build               # tsc + fix-esm-imports + post-build
npm run dev                 # tsx src/index.ts (development)
npm test                    # vitest run
npm run test:watch          # vitest watch mode
npm run test:coverage       # vitest with coverage
```

### MCP Bundle (`packages/mcp-bundle/`)
```bash
cd packages/mcp-bundle
npm run build               # TypeScript compile
npm test                    # vitest
```

### Running Single Test
```bash
# From root
npx vitest run path/to/file.test.ts
npx vitest run -t "test name pattern"

# Watch mode for specific file
npx vitest path/to/file.test.ts
```

## Architecture

### Monorepo Structure
```
packages/
├── cli/                    # Main CLI (npx miyabi) - Commander.js
│   └── src/
│       ├── commands/       # CLI commands (init, status, agent, auto, etc.)
│       ├── utils/          # Shared utilities
│       └── index.ts        # Entry point with Commander setup
├── core/                   # @agentic-os/core - Agent system base
├── mcp-bundle/             # MCP Server with 172+ tools
├── business-agents/        # Business automation agents
├── coding-agents/          # Development automation agents
└── shared-utils/           # Cross-package utilities
```

### Agent System (21 Agents)

**Coding Agents (7)** - Development automation:
| Agent | Role | Authority |
|-------|------|-----------|
| CoordinatorAgent | Task decomposition, DAG building | 🔴 統括 |
| CodeGenAgent | Code generation (Claude Sonnet 4) | 🔵 実行 |
| ReviewAgent | Code quality (80+ score required) | 🔵 実行 |
| IssueAgent | Issue analysis, 53-label classification | 🟢 分析 |
| PRAgent | Pull Request creation (Conventional Commits) | 🔵 実行 |
| DeploymentAgent | CI/CD automation | 🔵 実行 |
| TestAgent | Test execution, coverage | 🔵 実行 |

**Business Agents (14)** - Strategy, Marketing, Sales, Analytics

Agent specifications: `.claude/agents/specs/`
Execution prompts: `.claude/agents/prompts/`

### GitHub as Operating System
- **Issues** = Task queue
- **Labels** = State machine (53 labels across 10 categories)
- **Projects V2** = Kanban board / Data layer
- **Actions** = Execution engine (24 workflows)
- **Webhooks** = Event bus

### State Flow
```
pending → analyzing → implementing → reviewing → done
```

### Quality Gate (Auto-Loop Pattern)
ReviewAgent scores code 0-100. Score ≥80 required for PR creation. Auto-retry up to 3 times if below threshold.

## Key Configuration

### Environment Variables
```bash
export GITHUB_TOKEN=ghp_xxx   # Required for all GitHub operations
export MIYABI_JSON=1          # Force JSON output (for AI agents)
export MIYABI_AUTO_YES=1      # Skip interactive prompts
```

### CLI JSON Mode
All commands support `--json` flag for structured output:
```bash
miyabi status --json
miyabi doctor --json
miyabi agent run codegen --issue=123 --json
```

### Exit Codes
| Code | Meaning |
|------|---------|
| 0 | Success |
| 2 | CONFIG_ERROR (missing GITHUB_TOKEN) |
| 3 | VALIDATION_ERROR |
| 4 | NETWORK_ERROR |
| 5 | AUTH_ERROR |

## CLI Commands (30 commands)

### Core
```bash
miyabi init <name>          # Create new project
miyabi install              # Add Miyabi to existing project
miyabi status --json        # Project status
miyabi doctor --json        # System health check
miyabi setup                # Setup wizard
miyabi onboard              # First-time onboarding
miyabi config               # Configuration management
miyabi auth                 # GitHub authentication
```

### Agent Execution
```bash
miyabi agent run codegen --issue=123   # Run specific agent
miyabi auto                            # Water Spider full automation
miyabi omega --issue 123               # Omega pipeline (6-stage)
miyabi run --task codegen              # Unified execution
miyabi pipeline "/review | /deploy"    # Command composition
miyabi fix 123                         # Bug fix shortcut
miyabi build 123                       # Feature build shortcut
miyabi ship                            # Deploy shortcut
```

### DevOps Integration (miyabi-hub)
```bash
miyabi gni impact <symbol>     # GitNexus code intelligence (14 subcommands)
miyabi gni query "search"      # Semantic code search
miyabi gni hotspots            # Most-depended-on symbols
miyabi bus stats               # Agent Skill Bus queue stats (11 subcommands)
miyabi bus enqueue "task"      # Add task to queue
miyabi bus health              # Skill health monitoring
miyabi bus record-run <skill>  # Record skill execution
miyabi task list               # Task management (4 subcommands)
miyabi task add "title"        # Add new task
miyabi task done <id>          # Complete task
miyabi cycle full              # Feedback loop (CHECK→DISPATCH→HEALTH→RECORD)
miyabi release                 # Release management
miyabi voice                   # Voice-First control
miyabi skills                  # Claude Code skills management
miyabi health                  # Quick health check
miyabi todos                   # TODO comment detection
miyabi dashboard               # Dashboard management
miyabi docs                    # Documentation generation
```

## Code Standards

- **TypeScript**: Strict mode, ESM (`"type": "module"`)
- **Testing**: Vitest with snapshot testing
- **Commits**: Conventional Commits format
- **Quality**: 80+ score from ReviewAgent

## Slash Commands

Located in `.claude/commands/`:
- `/agent-run` - Execute agent on issue
- `/deploy` - Deploy to production
- `/review` - Code review with auto-fix option
- `/security-scan` - Security audit
- `/verify` - System health check
- `/create-issue` - Create GitHub issue
- `/test` - Run tests

## Skills

Located in `.claude/skills/`:
- `code-reviewer/` - Code review automation
- `commit-helper/` - Commit message generation
- `test-generator/` - Test scaffolding
- `doc-generator/` - Documentation generation
- `refactor-helper/` - Refactoring assistance
- `autonomous-coding-agent/` - Full automation

## npm Packages

| Package | npm | Description |
|---------|-----|-------------|
| miyabi | [npmjs.com/package/miyabi](https://npmjs.com/package/miyabi) | CLI tool |
| miyabi-mcp-bundle | [npmjs.com/package/miyabi-mcp-bundle](https://npmjs.com/package/miyabi-mcp-bundle) | MCP Server (172+ tools) |

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **Miyabi** (6035 symbols, 15045 relationships, 300 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/Miyabi/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/Miyabi/context` | Codebase overview, check index freshness |
| `gitnexus://repo/Miyabi/clusters` | All functional areas |
| `gitnexus://repo/Miyabi/processes` | All execution flows |
| `gitnexus://repo/Miyabi/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
