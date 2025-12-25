# AI Agent Development Best Practices
## Context Management & Multi-Agent Orchestration

> **Version**: 1.0.0
> **Last Updated**: 2025-12-25
> **Applicable To**: Claude Code, Codex, Gemini CLI, LangGraph, CrewAI

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Core Concepts](#2-core-concepts)
3. [The Context Problem](#3-the-context-problem)
4. [Solution Architecture](#4-solution-architecture)
5. [Implementation Guide](#5-implementation-guide)
6. [Multi-Agent Orchestration](#6-multi-agent-orchestration)
7. [Platform-Specific Guidelines](#7-platform-specific-guidelines)
8. [Reference Architecture](#8-reference-architecture)

---

## 1. Executive Summary

### 1.1 Purpose

This document consolidates best practices for AI agent development, focusing on:

- **Context Optimization**: Minimizing token consumption while maximizing capability
- **Scalability**: From single agent to multi-agent societies
- **Interoperability**: Cross-platform standards (Claude, Gemini, OpenAI)

### 1.2 Key Insights

| Problem | Solution | Impact |
|---------|----------|--------|
| Context bloat from MCP tools | Hierarchical indexing + Skills wrapping | 20-50% token reduction |
| Subagent overhead | Skills replacement + selective isolation | Improved efficiency |
| Scaling complexity | Protocol-driven orchestration (MCP/A2A) | Linear scalability |

### 1.3 Target Audience

- AI Agent developers
- Claude Code / Codex users
- Gemini CLI practitioners
- Multi-agent system architects

---

## 2. Core Concepts

### 2.1 MCP (Model Context Protocol)

```
┌─────────────────────────────────────────────────────────┐
│                    MCP Overview                          │
├─────────────────────────────────────────────────────────┤
│  Role: External tool/API connection protocol             │
│  Format: JSON/TOML (.mcp.json, config.toml)             │
│  Strength: Secure, standardized external access          │
│  Weakness: Context explosion with many tools             │
└─────────────────────────────────────────────────────────┘
```

**Definition**: Open standard protocol for securely connecting AI agents to external data sources, APIs, and tools.

**Key Characteristics**:
- Standardized tool definitions
- Secure authentication handling
- Cross-platform compatibility (Anthropic, OpenAI, Microsoft)

**Configuration Example**:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" }
    }
  }
}
```

### 2.2 Agent Skills

```
┌─────────────────────────────────────────────────────────┐
│                   Skills Overview                        │
├─────────────────────────────────────────────────────────┤
│  Role: Task specialization packages                      │
│  Format: Directory structure (.skills/name/SKILL.md)     │
│  Strength: Consistency, progressive context loading      │
│  Weakness: Requires MCP for external connections         │
└─────────────────────────────────────────────────────────┘
```

**Definition**: Packaged expertise that transforms generalist agents into specialists with consistent, high-quality outputs.

**Key Characteristics**:
- Directory-based organization
- Metadata-first loading (progressive disclosure)
- Workflow and best practice encapsulation

**Structure**:
```
.skills/
└── skill-name/
    ├── SKILL.md      # Main definition with frontmatter
    ├── scripts/      # Executable scripts, MCP configs
    └── assets/       # Data, templates, resources
```

### 2.3 Subagents

```
┌─────────────────────────────────────────────────────────┐
│                  Subagent Overview                       │
├─────────────────────────────────────────────────────────┤
│  Role: Context isolation & parallel processing           │
│  Format: Spawned agent instances                         │
│  Strength: Independent context windows                   │
│  Weakness: High overhead, full context reference         │
└─────────────────────────────────────────────────────────┘
```

**Definition**: Independent agent instances delegated tasks from a main agent, operating in isolated context windows.

**When to Use**:
- Parallel processing requirements
- Security isolation needs
- Long-running background tasks

**When NOT to Use**:
- Simple sequential tasks (use Skills instead)
- Tasks requiring shared context

### 2.4 Relationship Matrix

```
┌──────────────┬─────────────────┬─────────────────┬─────────────────┐
│              │      MCP        │     Skills      │   Subagents     │
├──────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Primary Role │ External        │ Task            │ Context         │
│              │ Connection      │ Specialization  │ Isolation       │
├──────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Context      │ High (all tools │ Low (metadata   │ Separate        │
│ Impact       │ loaded)         │ first)          │ window          │
├──────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Best For     │ API calls,      │ Workflows,      │ Parallel tasks, │
│              │ data access     │ procedures      │ isolation       │
├──────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Combine With │ Skills (wrap)   │ MCP (integrate) │ Skills (spawn)  │
└──────────────┴─────────────────┴─────────────────┴─────────────────┘
```

---

## 3. The Context Problem

### 3.1 Problem Statement

```
┌─────────────────────────────────────────────────────────┐
│              Context Window Explosion                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   Main Context Window                                    │
│   ┌─────────────────────────────────────────────────┐   │
│   │ System Prompt                          ~2K tokens│   │
│   ├─────────────────────────────────────────────────┤   │
│   │ MCP Tool #1 Definition                  ~500    │   │
│   │ MCP Tool #2 Definition                  ~500    │   │
│   │ MCP Tool #3 Definition                  ~500    │   │
│   │ ... (×50 tools)                       ~25,000   │   │
│   ├─────────────────────────────────────────────────┤   │
│   │ Subagent #1 Context                    ~3,000   │   │
│   │ Subagent #2 Context                    ~3,000   │   │
│   ├─────────────────────────────────────────────────┤   │
│   │ Conversation History                   ~10,000  │   │
│   ├─────────────────────────────────────────────────┤   │
│   │ Actual Task Space                      ~???     │   │
│   └─────────────────────────────────────────────────┘   │
│                                                          │
│   Problem: Task space shrinks as tools/agents grow       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Impact Analysis

| Metric | Without Optimization | With Optimization |
|--------|---------------------|-------------------|
| Token consumption | High (~50K base) | Low (~15K base) |
| Response latency | 3-5 seconds | 1-2 seconds |
| Tool selection accuracy | 70-80% | 90-95% |
| Cost per request | $0.15-0.30 | $0.05-0.10 |

### 3.3 Root Causes

1. **MCP Full Loading**: All tool definitions loaded into main context
2. **Subagent Overhead**: Full context reference for delegated tasks
3. **Flat Structure**: No hierarchical organization of capabilities

---

## 4. Solution Architecture

### 4.1 Hierarchical Context Management

```
┌─────────────────────────────────────────────────────────┐
│           Progressive Disclosure Architecture            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   Layer 1: Index Only (Always Loaded)                    │
│   ┌─────────────────────────────────────────────────┐   │
│   │ overview.md                                      │   │
│   │ - Skill: code-review "Reviews code quality"     │   │
│   │ - Skill: deploy "Handles deployments"           │   │
│   │ - Tool: github "GitHub API access"              │   │
│   │                                    ~500 tokens   │   │
│   └─────────────────────────────────────────────────┘   │
│                          │                               │
│                          ▼ (on demand)                   │
│   Layer 2: Skill Metadata                                │
│   ┌─────────────────────────────────────────────────┐   │
│   │ SKILL.md frontmatter                             │   │
│   │ - triggers, dependencies, workflow outline       │   │
│   │                                   ~1,000 tokens  │   │
│   └─────────────────────────────────────────────────┘   │
│                          │                               │
│                          ▼ (when activated)              │
│   Layer 3: Full Content                                  │
│   ┌─────────────────────────────────────────────────┐   │
│   │ Complete workflow, scripts, assets               │   │
│   │                                   ~5,000 tokens  │   │
│   └─────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Hybrid Model

```
┌─────────────────────────────────────────────────────────┐
│                    Hybrid Architecture                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│                   ┌─────────────┐                        │
│                   │ Main Agent  │                        │
│                   └──────┬──────┘                        │
│                          │                               │
│         ┌────────────────┼────────────────┐              │
│         │                │                │              │
│         ▼                ▼                ▼              │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│   │  Skills  │    │   MCP    │    │ Subagent │          │
│   │ (Primary)│◄───│ (Wrapped)│    │(Limited) │          │
│   └──────────┘    └──────────┘    └──────────┘          │
│        │                                │                │
│        │    Skills contain MCP tools    │                │
│        │    for progressive loading     │                │
│        │                                │                │
│        └────────── Subagent spawned ────┘                │
│                    only when isolation                   │
│                    is required                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 4.3 Design Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Index First** | Load descriptions only | overview.md with YAML frontmatter |
| **Lazy Loading** | Full content on demand | Skill activation triggers |
| **MCP Wrapping** | Tools inside Skills | scripts/ directory containment |
| **Selective Isolation** | Subagents for parallel only | Explicit spawn criteria |

---

## 5. Implementation Guide

### 5.1 Directory Structure

```
.claude/                          # Or .gemini/ for Gemini CLI
├── overview.md                   # Master index (REQUIRED)
├── settings.json                 # Agent configuration
│
├── skills/                       # Skills directory
│   ├── README.md                 # Skills index
│   │
│   ├── code-review/              # Executable skill
│   │   ├── SKILL.md              # Skill definition
│   │   ├── scripts/
│   │   │   └── review.sh         # Execution scripts
│   │   └── assets/
│   │       └── checklist.md      # Reference materials
│   │
│   └── mcp-manager/              # MCP wrapper skill
│       ├── SKILL.md              # Tool search interface
│       ├── scripts/
│       │   ├── mcp-config.json   # Hidden MCP definitions
│       │   └── tool-search.py    # Dynamic tool loader
│       └── references/
│           └── tool-index.md     # Tool descriptions only
│
├── agents/                       # Subagent definitions (limited)
│   └── parallel-executor/
│       └── AGENT.md              # Isolation-specific agent
│
├── commands/                     # Slash commands
│   └── deploy.md
│
└── prompts/                      # Shared prompts
    └── protocols.md
```

### 5.2 Overview.md Template

```markdown
---
version: "1.0"
last_updated: "2025-12-25"
---

# Project Agent Configuration

## Available Skills

| Skill | Description | Triggers |
|-------|-------------|----------|
| code-review | Analyzes code quality and security | /review, "review code" |
| deploy | Handles CI/CD deployments | /deploy, "deploy to" |
| mcp-manager | Searches and loads MCP tools | Tool requests |

## Available Tools (via mcp-manager)

| Category | Tools | Description |
|----------|-------|-------------|
| github | issues, prs, repos | GitHub API operations |
| docker | build, run, logs | Container management |
| database | query, migrate | Database operations |

## Subagents (Isolation Required)

| Agent | Purpose | Spawn Condition |
|-------|---------|-----------------|
| parallel-executor | Concurrent task processing | >3 independent tasks |

## Loading Rules

1. Always load: This overview only
2. On skill trigger: Load SKILL.md metadata
3. On execution: Load full skill content
4. On isolation need: Spawn subagent
```

### 5.3 SKILL.md Template

```markdown
---
name: "code-review"
version: "1.0.0"
description: "Comprehensive code review with security analysis"
triggers:
  - "/review"
  - "review this code"
  - "check for bugs"
dependencies:
  - "eslint"
  - "security-scanner"
mcp_tools:
  - "github.pull_requests"
  - "github.comments"
---

# Code Review Skill

## Purpose

Performs thorough code review focusing on:
- Code quality
- Security vulnerabilities
- Performance issues
- Best practice adherence

## Workflow

### Phase 1: Analysis
1. Parse code structure
2. Run static analysis
3. Check against patterns

### Phase 2: Security
1. Scan for vulnerabilities
2. Check dependencies
3. Review access patterns

### Phase 3: Report
1. Generate findings
2. Prioritize issues
3. Suggest fixes

## Scripts

- `scripts/analyze.sh` - Static analysis runner
- `scripts/security-scan.py` - Vulnerability scanner

## Integration

This skill wraps the following MCP tools:
- GitHub PR API for inline comments
- Security scanner for vulnerability detection
```

### 5.4 MCP Tool Management

#### 5.4.1 Tool Index (Not Full Definitions)

```markdown
<!-- references/tool-index.md -->

# MCP Tool Index

## GitHub Tools
- `github.issues.list` - List repository issues
- `github.issues.create` - Create new issue
- `github.prs.list` - List pull requests
- `github.prs.review` - Add PR review

## Docker Tools
- `docker.build` - Build container image
- `docker.run` - Run container
- `docker.logs` - Get container logs

## Database Tools
- `database.query` - Execute SQL query
- `database.migrate` - Run migrations
```

#### 5.4.2 Dynamic Tool Loader

```python
# scripts/tool-search.py

"""
MCP Tool Search - Dynamic loader for progressive disclosure
"""

import json
from pathlib import Path

def search_tools(query: str, category: str = None) -> list:
    """
    Search MCP tools by query and optionally filter by category.
    Returns tool definitions only for matching tools.
    """
    config_path = Path(__file__).parent / "mcp-config.json"
    with open(config_path) as f:
        all_tools = json.load(f)

    results = []
    for tool in all_tools["tools"]:
        if category and tool["category"] != category:
            continue
        if query.lower() in tool["name"].lower() or \
           query.lower() in tool["description"].lower():
            results.append(tool)

    return results

def load_tool(tool_name: str) -> dict:
    """
    Load full tool definition for execution.
    Called only when tool is actually needed.
    """
    config_path = Path(__file__).parent / "mcp-config.json"
    with open(config_path) as f:
        all_tools = json.load(f)

    for tool in all_tools["tools"]:
        if tool["name"] == tool_name:
            return tool["full_definition"]

    raise ValueError(f"Tool not found: {tool_name}")
```

### 5.5 Subagent Usage Guidelines

#### When to Use Subagents

```
┌─────────────────────────────────────────────────────────┐
│                Subagent Decision Tree                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   Task received                                          │
│        │                                                 │
│        ▼                                                 │
│   ┌─────────────────┐                                   │
│   │ Parallel tasks  │──Yes──► Use Subagent              │
│   │ (>3 independent)│                                   │
│   └────────┬────────┘                                   │
│            │ No                                          │
│            ▼                                             │
│   ┌─────────────────┐                                   │
│   │ Security        │──Yes──► Use Subagent              │
│   │ isolation needed│                                   │
│   └────────┬────────┘                                   │
│            │ No                                          │
│            ▼                                             │
│   ┌─────────────────┐                                   │
│   │ Long-running    │──Yes──► Use Subagent              │
│   │ background task │                                   │
│   └────────┬────────┘                                   │
│            │ No                                          │
│            ▼                                             │
│   Use Skills instead                                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### Subagent Spawn Pattern

```markdown
<!-- agents/parallel-executor/AGENT.md -->

---
name: "parallel-executor"
type: "subagent"
spawn_conditions:
  - "independent_tasks > 3"
  - "explicit_parallel_request"
context_inheritance: "minimal"  # Only task-specific context
---

# Parallel Executor Subagent

## Purpose

Executes multiple independent tasks in parallel to reduce total execution time.

## Spawn Protocol

1. Receive task list from main agent
2. Validate task independence
3. Execute tasks concurrently
4. Aggregate results
5. Return to main agent

## Context Rules

- Inherits: Task definitions only
- Does NOT inherit: Full conversation history
- Shares: MCP tool access via skill wrapper
```

---

## 6. Multi-Agent Orchestration

### 6.1 Communication Protocols

```
┌─────────────────────────────────────────────────────────┐
│              Protocol Stack for Multi-Agent              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   ┌─────────────────────────────────────────────────┐   │
│   │              Application Layer                   │   │
│   │         (Task-specific protocols)                │   │
│   └─────────────────────────────────────────────────┘   │
│                          │                               │
│   ┌─────────────────────────────────────────────────┐   │
│   │     A2A (Agent-to-Agent) Communication          │   │
│   │     - Intent sharing                             │   │
│   │     - Task delegation                            │   │
│   │     - Result aggregation                         │   │
│   └─────────────────────────────────────────────────┘   │
│                          │                               │
│   ┌─────────────────────────────────────────────────┐   │
│   │           MCP (Tool/Data Layer)                  │   │
│   │     - External API access                        │   │
│   │     - Shared data sources                        │   │
│   │     - Tool invocation                            │   │
│   └─────────────────────────────────────────────────┘   │
│                          │                               │
│   ┌─────────────────────────────────────────────────┐   │
│   │         AG-UI (User Interaction Layer)           │   │
│   │     - User commands                              │   │
│   │     - Progress reporting                         │   │
│   │     - Confirmation requests                      │   │
│   └─────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Team-Level Orchestration (Agent Groups)

```
┌─────────────────────────────────────────────────────────┐
│              Team Orchestration Pattern                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│                   ┌─────────────┐                        │
│                   │ Coordinator │                        │
│                   │   (Lead)    │                        │
│                   └──────┬──────┘                        │
│                          │                               │
│          ┌───────────────┼───────────────┐               │
│          │               │               │               │
│          ▼               ▼               ▼               │
│   ┌────────────┐ ┌────────────┐ ┌────────────┐          │
│   │  Planning  │ │ Execution  │ │  Review    │          │
│   │   Team     │ │   Team     │ │   Team     │          │
│   └────────────┘ └────────────┘ └────────────┘          │
│          │               │               │               │
│          ▼               ▼               ▼               │
│   ┌──────────────────────────────────────────┐          │
│   │         Shared Context (via MCP)          │          │
│   │   - Project state                         │          │
│   │   - Task queue                            │          │
│   │   - Results store                         │          │
│   └──────────────────────────────────────────┘          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### A2A Message Format

```json
{
  "message_id": "uuid-v4",
  "timestamp": "2025-12-25T10:00:00Z",
  "from_agent": "coordinator",
  "to_agent": "execution-team",
  "intent": "execute_task",
  "payload": {
    "task_id": "task-123",
    "description": "Implement user authentication",
    "priority": "high",
    "dependencies": ["task-120", "task-121"],
    "context": {
      "files": ["src/auth/"],
      "requirements": "Use JWT tokens"
    }
  },
  "expected_response": {
    "type": "completion_report",
    "timeout_ms": 300000
  }
}
```

### 6.3 Society-Level Scaling

```
┌─────────────────────────────────────────────────────────┐
│            Society-Level Architecture                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   Society A                      Society B               │
│   ┌──────────────────┐          ┌──────────────────┐    │
│   │  ┌────┐ ┌────┐   │          │  ┌────┐ ┌────┐   │    │
│   │  │Team│ │Team│   │          │  │Team│ │Team│   │    │
│   │  │ 1  │ │ 2  │   │          │  │ 1  │ │ 2  │   │    │
│   │  └────┘ └────┘   │          │  └────┘ └────┘   │    │
│   │       │          │          │       │          │    │
│   │       ▼          │          │       ▼          │    │
│   │  ┌─────────┐     │          │  ┌─────────┐     │    │
│   │  │ Society │     │◄────────►│  │ Society │     │    │
│   │  │ Gateway │     │   A2A    │  │ Gateway │     │    │
│   │  └─────────┘     │  + MCP   │  └─────────┘     │    │
│   └──────────────────┘          └──────────────────┘    │
│                                                          │
│   Inter-Society Protocol:                                │
│   - MCP for shared tool access                           │
│   - A2A for intent communication                         │
│   - ACP for consensus/coordination                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### Society Gateway Responsibilities

1. **Message Routing**: Direct A2A messages to appropriate teams
2. **Authentication**: Verify inter-society communications
3. **Rate Limiting**: Prevent resource exhaustion
4. **Translation**: Convert between protocol versions
5. **Logging**: Audit trail for all interactions

---

## 7. Platform-Specific Guidelines

### 7.1 Claude Code / Codex

```yaml
# Claude-specific configuration

directory_structure:
  root: ".claude/"
  skills: ".claude/skills/"
  agents: ".claude/agents/"
  commands: ".claude/commands/"

features:
  code_execution: true
  projects: true  # Long-term context
  hooks: true     # Quality gates

integration:
  - VS Code extension
  - CLI (claude-code)
  - API (Agent SDK)

best_practices:
  - Use SKILL.md format for skills
  - Leverage code_execution for testing
  - Integrate with Projects for context persistence
  - Use hooks for automated validation
```

### 7.2 Gemini CLI

```yaml
# Gemini-specific configuration

directory_structure:
  root: ".gemini/"
  templates: ".gemini/templates/"
  tools: ".gemini/tools/"

features:
  function_calling: true
  grounding: true
  code_execution: limited

simulation:
  skills_via: "prompt templates"
  mcp_via: "custom tool definitions"
  subagents_via: "subprocess spawning"

best_practices:
  - Use --prompt-template for skill-like behavior
  - Implement tool search with Python wrapper
  - Use subprocess for parallel execution
  - Leverage grounding for external data
```

### 7.3 OpenAI CLI / Other LLMs

```yaml
# General LLM configuration

adaptation:
  skills:
    implementation: "System prompt templates"
    loading: "Dynamic prompt injection"

  mcp:
    implementation: "Function calling / Tool use"
    loading: "Lazy definition loading"

  subagents:
    implementation: "Separate API calls"
    coordination: "External orchestrator"

frameworks:
  - LangGraph: "DAG-based orchestration"
  - CrewAI: "Role-based agents"
  - AutoGen: "Conversational agents"

best_practices:
  - Abstract platform-specific APIs
  - Use portable skill definitions
  - Implement protocol adapters
```

---

## 8. Reference Architecture

### 8.1 Complete System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │   CLI       │  │   IDE       │  │   Web UI    │                  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                  │
└─────────┼────────────────┼────────────────┼─────────────────────────┘
          │                │                │
          └────────────────┼────────────────┘
                           │ AG-UI Protocol
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Agent Orchestration Layer                     │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                      Coordinator Agent                          │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │ │
│  │  │ Task Queue  │  │ Context Mgr │  │ Result Agg  │             │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                           │ A2A Protocol                             │
│         ┌─────────────────┼─────────────────┐                       │
│         ▼                 ▼                 ▼                       │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐                │
│  │   Skills   │    │   Skills   │    │  Subagent  │                │
│  │ (Planning) │    │ (Execution)│    │ (Parallel) │                │
│  └────────────┘    └────────────┘    └────────────┘                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                           │ MCP Protocol
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        External Resources Layer                      │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │
│  │   GitHub    │  │   Docker    │  │  Database   │  │  APIs     │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.2 Implementation Checklist

```markdown
## Setup Phase

- [ ] Create `.claude/` (or `.gemini/`) directory
- [ ] Write `overview.md` with all indexes
- [ ] Set up `skills/` directory structure
- [ ] Configure MCP tool index (not full definitions)
- [ ] Define subagent spawn criteria

## Skill Development

- [ ] Create SKILL.md with proper frontmatter
- [ ] Add scripts/ for executable components
- [ ] Wrap MCP tools within skills
- [ ] Write tests for skill workflows
- [ ] Document triggers and dependencies

## Integration

- [ ] Test progressive disclosure loading
- [ ] Verify token consumption reduction
- [ ] Validate tool search functionality
- [ ] Test subagent spawn/return cycle
- [ ] Performance benchmark

## Scaling

- [ ] Define team structures
- [ ] Implement A2A messaging
- [ ] Set up shared context (MCP)
- [ ] Configure society gateways
- [ ] Monitor and optimize
```

### 8.3 Performance Benchmarks

| Metric | Target | Measurement |
|--------|--------|-------------|
| Base context tokens | <15,000 | Count via API |
| Skill load time | <500ms | Stopwatch |
| Tool search latency | <200ms | Stopwatch |
| Token reduction | >30% | Compare before/after |
| Accuracy improvement | >10% | Task success rate |

---

## Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| **MCP** | Model Context Protocol - External tool connection standard |
| **Skills** | Task specialization packages with progressive loading |
| **Subagent** | Isolated agent instance for parallel/secure tasks |
| **A2A** | Agent-to-Agent communication protocol |
| **AG-UI** | Agent-User Interaction protocol |
| **Progressive Disclosure** | Loading only what's needed, when needed |

### B. References

- [Anthropic Skills Documentation](https://docs.anthropic.com)
- [MCP Specification](https://modelcontextprotocol.io)
- [Claude Code Guide](https://claude.com/claude-code)
- Community discussions: X #AgentSkills, #MCP

### C. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-25 | Initial release |

---

*This document is maintained as part of the Miyabi project. Contributions welcome.*
