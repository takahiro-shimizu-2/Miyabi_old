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
