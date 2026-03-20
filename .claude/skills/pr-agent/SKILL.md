---
name: pr-agent
description: "Automated Pull Request creation with Conventional Commits, quality checks, and merge strategy selection."
allowed-tools: Bash, Read, Write, Grep, Glob
---

# PR Agent (ツバキ)

**Version**: 1.0.0
**Agent Type**: Coding Agent (実行)
**Authority**: 🔵 実行

---

## Triggers

| Trigger | Examples |
|---------|----------|
| PR creation | "create PR", "PRを作成して" |
| Merge | "merge this PR", "マージして" |
| PR review | "check PR status", "PRの状態確認" |
| Branch cleanup | "clean branches", "ブランチ整理" |

---

## Role

PRAgent automates the Pull Request lifecycle: branch creation,
commit message generation (Conventional Commits), PR description,
reviewer assignment, merge strategy selection, and branch cleanup.

## PR Creation Workflow

### Step 1: Branch Naming

```
Format: {type}/{issue_number}-{short_description}

Examples:
  feature/123-user-authentication
  fix/456-null-pointer-error
  refactor/789-api-cleanup
  chore/101-update-deps
```

### Step 2: Commit Messages (Conventional Commits)

```
<type>(<scope>): <subject>

<body>

Closes #<issue_number>

Co-Authored-By: <agent-name>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`
Scopes: `cli`, `core`, `mcp`, `agents`, `dashboard`, `api`

### Step 3: PR Description Template

```markdown
## Summary
- {1-2 bullet points summarizing changes}

## Changes
- {file1}: {what changed}
- {file2}: {what changed}

## Related Issues
- Closes #{issue_number}

## Quality Gate
- [ ] ReviewAgent score: {score}/100 (80+ required)
- [ ] TypeScript: no errors
- [ ] ESLint: no errors
- [ ] Tests: all passing

## Test plan
- [ ] {test scenario 1}
- [ ] {test scenario 2}
```

### Step 4: Merge Strategy Selection

| Context | Strategy | When |
|---------|----------|------|
| Feature → main | Squash | Default for feature branches |
| Release → main | Merge | Preserve full history |
| Main → feature | Rebase | Sync with upstream |

## Quality Requirements

Before PR creation:
1. **ReviewAgent score >= 80** (mandatory)
2. `npm run lint` → 0 errors
3. `npm run typecheck` → 0 errors
4. `npm test` → all passing
5. No secrets in diff (`.env`, API keys)

## CLI Integration

```bash
# Create PR for issue
miyabi agent run pr --issue=123 --json

# Check PR status
gh pr view <number> --json state,reviews,checks

# Merge with squash
gh pr merge <number> --squash --delete-branch

# List open PRs
gh pr list --repo ShunsukeHayashi/Miyabi --state open
```

## Branch Cleanup

After merge, PRAgent automatically:
1. Deletes the remote feature branch
2. Prunes local tracking references
3. Updates local main branch

```bash
git fetch --prune
git checkout main && git pull
git branch -d <merged-branch>
```

## Merge Policy

- Pipeline creates PR and auto-APPROVEs but **does NOT merge**
- Merge requires Guardian (human) approval or explicit command
- Draft PRs with failing tests require manual review
