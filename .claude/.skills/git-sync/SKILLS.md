---
name: git-sync
description: Commit and push changes across all projects in the workspace
version: 1.0.0
author: dev-workspace
triggers:
  - /git-sync
  - /sync-all
inputs:
  - name: message
    type: string
    description: Commit message (optional, will prompt if not provided)
    required: false
---

# Git Sync Skill

Synchronizes all projects by committing and pushing changes.

## Workflow

1. Check status of all projects (Miyabi, Gen-Studio, ai-course-content-generator-v2, miyabi-mcp-bundle)
2. For each project with uncommitted changes:
   - Show diff summary
   - Generate commit message if not provided
   - Commit changes
   - Push to remote
3. Report final status

## Usage

```
/git-sync
/git-sync "feat: update dependencies"
```

## Prerequisites

- Git configured with push access to all remotes
- No merge conflicts in working directories
