# Full Dev Cycle - Quick Reference Card

## 🚀 Quick Commands

### One-liner Deploy
```bash
./scripts/deploy-workflow.sh "feat: add feature"
```

### Skip Tests
```bash
./scripts/deploy-workflow.sh "fix: hotfix" --skip-tests
```

### Force on Main
```bash
./scripts/deploy-workflow.sh "chore: update" --force
```

---

## 📋 Phase Checklist

### Phase 1: Pre-flight ✈️
- [ ] Changes exist
- [ ] On correct branch
- [ ] Docker running

### Phase 2: Git 📝
- [ ] Changes staged
- [ ] Commit created
- [ ] Pushed to remote

### Phase 3: Test 🧪
- [ ] Unit tests pass
- [ ] Integration tests pass

### Phase 4: Deploy 🐳
- [ ] Old containers stopped
- [ ] New images built
- [ ] Services started

### Phase 5: Verify ✓
- [ ] Containers healthy
- [ ] Ports accessible
- [ ] No errors in logs

---

## 🔧 MCP Tools by Phase

| Phase | Tools |
|-------|-------|
| Pre-flight | git_status, git_current_branch |
| Git | git_diff, git_log |
| Deploy | compose_down, compose_up |
| Verify | compose_ps, health_check, network_port_check |

---

## 📊 Commit Types

| Type | When to Use |
|------|-------------|
| feat | New feature |
| fix | Bug fix |
| docs | Documentation |
| style | Formatting |
| refactor | Code restructure |
| test | Tests |
| chore | Maintenance |
| perf | Performance |
| ci | CI/CD |

---

## ⚡ Emergency Commands

### Rollback
```bash
docker compose down
git checkout HEAD~1
docker compose up -d --build
```

### View Errors
```bash
docker compose logs --tail=50 | grep -i error
```

### Force Restart
```bash
docker compose restart
```

---

## 🔗 Related Skills

- `mcp-context-optimizer` - Find the right tools
- `docker-compose-workflow` - Detailed Docker ops
- `ci-cd-pipeline` - GitHub Actions
- `miyabi-agent-orchestration` - Multi-agent deploy
