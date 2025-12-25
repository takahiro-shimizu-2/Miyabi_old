---
name: project-status
description: Comprehensive status check for all workspace projects
version: 1.0.0
triggers:
  - /project-status
  - /ps
outputs:
  - type: table
    columns: [project, branch, changes, deps, build]
---

# Project Status Skill

Displays status of all projects in a unified view.

## Checks

- Git branch and uncommitted changes
- node_modules presence
- dist/ build status and timestamp
- Remote sync status (ahead/behind)

## Output Format

| Project | Branch | Changes | Deps | Build |
|---------|--------|---------|------|-------|
| Miyabi  | main   | clean   | OK   | OK    |

## Usage

```
/project-status
/ps
```
