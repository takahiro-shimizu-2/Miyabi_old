# Claude Code Skills Guide

## Overview

Skills are reusable workflow definitions that Claude automatically discovers and uses based on context.

## Directory Structure

```
.claude/skills/skill-name/
├── SKILL.md          # Required - Main skill definition
├── reference.md      # Optional - Additional documentation
├── examples.md       # Optional - Usage examples
├── scripts/          # Optional - Helper scripts
│   └── helper.py
└── templates/        # Optional - Templates
    └── template.txt
```

## SKILL.md Format

```yaml
---
name: skill-name
description: What it does and when to use it
allowed-tools: Read, Grep, Glob
---

# Skill Name

## Instructions

Step-by-step guidance for Claude.

## Examples

Concrete usage examples.
```

## YAML Frontmatter

| Field | Required | Description | Constraints |
|-------|----------|-------------|-------------|
| `name` | Yes | Skill identifier | lowercase, numbers, hyphens only, max 64 chars |
| `description` | Yes | What & when to use | max 1024 chars |
| `allowed-tools` | No | Tool restrictions | comma-separated tool names |

## Storage Locations

| Location | Scope | Path |
|----------|-------|------|
| Personal | All projects | `~/.claude/skills/` |
| Project | Team-shared | `.claude/skills/` |

## Writing Effective Descriptions

### Good Examples

```yaml
description: Generate commit messages from git diff. Use when committing changes or when user mentions git commit.

description: Extract text and tables from PDF files. Use when working with PDF files or document extraction.

description: Run project tests and report results. Use when user asks to test, verify, or check code.
```

### Bad Examples

```yaml
description: Helps with git  # Too vague
description: Document processing  # Too broad
description: Does stuff  # Not useful
```

## Skills vs Slash Commands

| Aspect | Skills | Slash Commands |
|--------|--------|----------------|
| Invocation | Claude auto-detects | User types `/command` |
| Discovery | Based on description | Explicit user action |
| Use case | Auto-discovered capabilities | Deliberate operations |
| File | `SKILL.md` | `command.md` in `/commands` |

## Best Practices

1. **One skill = One capability**
   - Split broad skills into focused ones
   - Example: "pdf-extract", "pdf-fill-form", "pdf-merge" instead of "pdf-tools"

2. **Specific descriptions**
   - Include WHAT it does
   - Include WHEN to use it
   - Use searchable terms

3. **Tool restrictions**
   - Use `allowed-tools` for security
   - Read-only: `allowed-tools: Read, Grep, Glob`

4. **Progressive disclosure**
   - Keep SKILL.md concise
   - Put details in reference.md
   - Claude reads supporting files when needed

5. **Version tracking**
   - Add version history section
   - Document breaking changes

## Debugging

If Claude doesn't use your skill:

1. **Check description** - Is it specific enough?
2. **Verify path** - Correct location?
3. **YAML syntax** - Valid frontmatter?
4. **Run debug** - `claude --debug` for errors

## Example Skills

### Simple Skill

```yaml
---
name: commit-helper
description: Generate conventional commit messages from staged changes. Use when committing or user asks for commit message.
---

# Commit Helper

## Instructions

1. Run `git diff --cached` to see staged changes
2. Analyze the changes
3. Generate a conventional commit message
4. Format: `type(scope): description`

## Examples

- `feat(auth): add OAuth login support`
- `fix(api): handle null response`
- `docs(readme): update installation steps`
```

### Skill with Tool Restrictions

```yaml
---
name: code-reviewer
description: Review code for best practices, bugs, and security issues. Use when reviewing code or checking quality.
allowed-tools: Read, Grep, Glob
---

# Code Reviewer

## Instructions

1. Read the target files
2. Check for:
   - Code style issues
   - Potential bugs
   - Security vulnerabilities
   - Performance concerns
3. Provide actionable feedback

## Output Format

| Issue | Severity | Location | Suggestion |
|-------|----------|----------|------------|
| ... | ... | ... | ... |
```

### Multi-file Skill

```
project-setup/
├── SKILL.md
├── CHECKLIST.md
├── scripts/
│   ├── init.sh
│   └── validate.py
└── templates/
    ├── package.json
    └── tsconfig.json
```

## References

- [Claude Code Skills Documentation](https://docs.anthropic.com/claude-code/skills)
- [Slash Commands](https://docs.anthropic.com/claude-code/slash-commands)
