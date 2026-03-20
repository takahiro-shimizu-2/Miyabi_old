---
name: miyabi-quality-gate
description: "Automated quality gate with 100-point scoring system. ReviewAgent scores code and auto-retries below threshold. Ensures 80+ score before PR creation."
allowed-tools: Bash, Read, Write, Grep, Glob
---

# Miyabi Quality Gate

**Version**: 1.0.0
**Purpose**: Automated code quality enforcement with auto-retry loop

---

## Triggers

| Trigger | Examples |
|---------|----------|
| Quality check | "check quality", "品質チェック" |
| Score review | "what's the quality score?", "品質スコアは？" |
| Auto-fix loop | "fix quality issues", "品質問題を修正" |
| Gate enforcement | "enforce quality gate", "品質ゲート適用" |

---

## Scoring System (100 points)

| Category | Weight | Criteria |
|----------|--------|----------|
| Correctness | 25 | Logic errors, edge cases, null handling |
| Security | 20 | Injection, XSS, auth bypass, secrets |
| Performance | 15 | N+1, memory leaks, unnecessary re-renders |
| Readability | 15 | Naming, structure, comments |
| Maintainability | 15 | DRY, coupling, dependency management |
| Test Coverage | 10 | Unit tests, edge case tests |

## Scoring Thresholds

| Score | Verdict | Action |
|-------|---------|--------|
| 90-100 | Excellent | Proceed to PR immediately |
| 80-89 | Good | Proceed to PR |
| 60-79 | Needs work | Auto-retry with feedback (max 3x) |
| 40-59 | Poor | Escalate to human |
| 0-39 | Critical | Block and escalate immediately |

## Auto-Retry Loop

```
Attempt 1: CodeGen → Review (score: 65)
  ↓ Feedback: "Missing null checks in auth middleware"
Attempt 2: CodeGen (with feedback) → Review (score: 78)
  ↓ Feedback: "Add input validation for email field"
Attempt 3: CodeGen (with feedback) → Review (score: 85)
  ↓ Score >= 80 → Proceed to PR
```

Maximum 3 retry attempts. After 3 failures, escalate to human.

## Quality Check Commands

```bash
# Run full quality gate
npm run verify:all

# Individual checks
npm run lint          # ESLint
npm run typecheck     # TypeScript strict
npm test              # Vitest

# Agent-based review
miyabi agent run review --issue=123 --json
```

## Blocking Gates

These must pass before PR creation:

| Gate | Command | Blocking |
|------|---------|----------|
| ESLint | `npm run lint` | Yes (0 errors) |
| TypeScript | `npm run typecheck` | Yes (0 errors) |
| Unit Tests | `npm test` | Yes (100% pass) |
| Coverage | `npm run test:coverage` | No (target 90%) |
| Review Score | `miyabi agent run review` | Yes (>= 80) |
| Security | `npm audit` | No (0 high/critical) |

## Integration with Pipeline

Quality Gate is step 2 in the standard pipeline:

```
Issue → CodeGen → [Quality Gate] → PR → Deploy
                   ↑        ↓
                   └─ retry ─┘ (max 3x)
```
