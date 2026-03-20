---
name: miyabi-github-os
description: "GitHub as Operating System - Use Issues as task queue, Labels as state machine, Projects V2 as data layer, Actions as execution engine, and Webhooks as event bus."
allowed-tools: Bash, Read, Write, Grep, Glob
---

# GitHub as Operating System

**Version**: 1.0.0
**Purpose**: Treat GitHub as a full operating system for autonomous development

---

## Triggers

| Trigger | Examples |
|---------|----------|
| GitHub setup | "setup github os", "GitHub OS設定" |
| Label management | "setup labels", "ラベル設定" |
| Project management | "manage project board", "プロジェクト管理" |
| Workflow automation | "setup actions", "Actions設定" |

---

## GitHub OS Architecture

| GitHub Feature | OS Analogy | Miyabi Usage |
|---------------|------------|--------------|
| Issues | Task queue | Incoming work items |
| Labels | State machine | 53 labels across 10 categories |
| Projects V2 | Kanban / Data layer | Visual workflow tracking |
| Actions | Execution engine | 24 automated workflows |
| Webhooks | Event bus | Trigger agent pipelines |
| Pages | Dashboard hosting | Status dashboard |
| Discussions | Message queue | Agent communication |

## Label System (53 Labels, 10 Categories)

### Setup Command

```bash
# Create all 53 labels
miyabi install --json --yes

# Or manually
gh label create "priority:critical" --color "B60205" --description "Critical priority"
gh label create "status:pending" --color "FBCA04" --description "Pending analysis"
```

### State Machine Flow

```
[pending] → [analyzing] → [implementing] → [reviewing] → [done]
     ↓           ↓             ↓              ↓
  [blocked]   [blocked]     [blocked]      [changes-requested]
```

### Label Categories

| # | Category | Labels | Color |
|---|----------|--------|-------|
| 1 | Priority | critical, high, medium, low | Red shades |
| 2 | Type | feature, bug, refactor, docs, test, chore, security | Blue shades |
| 3 | Status | pending, analyzing, implementing, reviewing, done, blocked | Yellow/Green |
| 4 | Scope | cli, core, mcp, agents, dashboard, api | Purple shades |
| 5 | Size | tiny, small, medium, large, xlarge | Gray shades |
| 6 | Agent | coordinator, codegen, review, issue, pr, deploy, test | Cyan shades |
| 7 | Quality | needs-review, approved, changes-requested | Orange shades |
| 8 | Risk | high, medium, low | Red/Yellow/Green |
| 9 | Automation | pipeline, manual, hybrid | Teal shades |
| 10 | Release | milestone-1, milestone-2, milestone-3, milestone-4 | Indigo |

## Projects V2 Integration

```bash
# Create project
gh project create "Miyabi Development" --owner ShunsukeHayashi

# Add issue to project
gh project item-add <project-number> --owner ShunsukeHayashi --url <issue-url>

# Update status field
gh project item-edit --id <item-id> --field-id <status-field> --single-select-option-id <option>
```

## GitHub Actions (24 Workflows)

| Category | Workflows | Purpose |
|----------|-----------|---------|
| CI | build, test, lint, typecheck | Quality checks |
| Agent | issue-triage, codegen, review | Agent automation |
| Deploy | staging-deploy, production-deploy | Deployment |
| Maintenance | dependabot, stale-issues | Housekeeping |

## Webhook Integration

```bash
# Check webhook status
miyabi doctor --json | jq '.data.checks.miyabiConfig'

# Install webhooks
miyabi install --json --yes
```

## Issue-Driven Development (IDD)

```
1. Create Issue with clear requirements
2. IssueAgent auto-labels (53-label system)
3. CoordinatorAgent decomposes into subtasks
4. CodeGenAgent implements
5. ReviewAgent scores (80+ gate)
6. PRAgent creates PR
7. Guardian merges
8. DeploymentAgent deploys
9. Issue auto-closes
```

## CLI Commands

```bash
# Full project status
miyabi status --json

# Health check
miyabi doctor --json

# Setup GitHub OS on new repo
miyabi init my-project --json --yes

# Add GitHub OS to existing repo
miyabi install --json --yes
```
