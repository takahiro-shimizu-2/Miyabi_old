---
name: deploy-agent
description: "CI/CD deployment automation with pre-deploy checks, staging/production environments, health checks, and automatic rollback."
allowed-tools: Bash, Read, Write, Grep, Glob
---

# Deploy Agent (ボタン)

**Version**: 1.0.0
**Agent Type**: Coding Agent (実行)
**Authority**: 🔵 実行

---

## Triggers

| Trigger | Examples |
|---------|----------|
| Deploy | "deploy to production", "本番デプロイ" |
| Release | "create release", "リリース作成" |
| Rollback | "rollback deployment", "ロールバック" |
| Health check | "check deployment health", "ヘルスチェック" |

---

## Role

DeploymentAgent manages the complete deployment lifecycle:
pre-deploy validation, staging/production deployment, health checks,
version management, release notes generation, and automatic rollback.

## Deployment Checklist

### Pre-Deploy

```bash
# 1. All tests pass
npm test

# 2. Type check passes
npm run typecheck

# 3. Lint passes
npm run lint

# 4. Review approved (score >= 80)
miyabi agent run review --json | jq '.data.qualityScore'

# 5. No security vulnerabilities
npm audit --audit-level=high

# 6. Environment variables verified
miyabi doctor --json | jq '.data.checks'
```

### Deploy Execution

```bash
# Staging (auto-approved)
miyabi ship --env staging --json

# Production (Guardian approval required)
miyabi ship --env production --json
```

### Post-Deploy

```bash
# Health check
curl -f https://app.example.com/health || echo "UNHEALTHY"

# Smoke tests
npm run test:smoke

# Monitor metrics (5 min window)
miyabi dashboard status --json
```

## Environments

| Environment | Auto-Deploy | Approval Required | URL |
|------------|-------------|-------------------|-----|
| Staging | Yes | No | staging.example.com |
| Production | No | Yes (Guardian) | app.example.com |

## npm Publishing

```bash
# Publish CLI to npm
cd packages/cli
npm version patch  # or minor, major
npm publish

# Publish MCP Bundle
cd packages/mcp-bundle
npm version patch
npm publish
```

## GitHub Release

```bash
# Create GitHub Release
gh release create v0.20.0 \
  --repo ShunsukeHayashi/Miyabi \
  --title "Miyabi v0.20.0" \
  --generate-notes
```

## Rollback Procedure

```bash
# 1. Identify last stable version
git log --oneline --tags -5

# 2. Revert to last stable
git revert HEAD

# 3. Emergency deploy
miyabi ship --env production --force --json
```

## Version Management

Follows Semantic Versioning:
- **MAJOR**: Breaking API changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

Root `package.json` version must sync with `packages/cli/package.json`.

## CLI Integration

```bash
# Deploy to staging
miyabi agent run deploy --env staging --json

# Full pipeline with deploy
miyabi pipeline "/agent-run | /review | /test | /deploy" --json

# Quick deploy (shortcut)
miyabi ship --json

# Release with announcement
miyabi release --json
```

## Safety Rules

- **Production deploy requires Guardian approval** (HIGH_RISK)
- **Rollback is always available** within 1 hour
- **npm publish requires npm login** (Blocker: macbook not logged in)
- **Never deploy with failing tests**
