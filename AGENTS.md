# Repository Guidelines

## Project Structure & Module Organization
- `packages/` contains the workspace packages (CLI, coding agents, business agents, SDKs, MCP bundle, etc.).
- `scripts/` holds operational automation and tooling entry points (most `npm run` commands call into here).
- `services/` includes service backends such as the context API.
- `tests/` contains repo-wide tests; some packages also keep tests under `packages/**/tests`.
- `docs/`, `assets/`, `templates/`, and `miyabi_def/` store documentation, media, and system templates.
- `mcp-servers/`, `workflow-automation/`, and `database/` support MCP integrations, workflow agents, and data.

## Build, Test, and Development Commands
- `npm install` installs workspace dependencies.
- `npm start` runs the main agentic workflow (`scripts/operations/agentic.ts`).
- `npm run build` compiles TypeScript with `tsc`.
- `npm test` runs the Vitest suite; `npm run test:e2e` runs Playwright.
- `npm run lint` and `npm run typecheck` enforce ESLint + TypeScript checks.
- `npm run verify:all` runs lint, typecheck, tests, and security scan.

## Coding Style & Naming Conventions
- TypeScript strict mode is required; avoid `any` and return types should be explicit.
- ESLint must pass with 0 errors; follow existing formatting in each file.
- Naming: classes and interfaces use `PascalCase`, functions use `camelCase`, constants use `UPPER_SNAKE_CASE`.
- Private methods may use an underscore prefix (e.g., `_internalMethod`).

## Testing Guidelines
- Frameworks: Vitest for unit/integration tests, Playwright for end-to-end.
- Coverage targets: 80% minimum overall; 100% for critical paths; test error handling.
- Test files typically live in `tests/` or `packages/**/tests` and follow `*.test.ts`.

## Commit & Pull Request Guidelines
- Commit messages follow Conventional Commits (`feat(scope): description`).
- Include the Claude Code attribution lines shown in `CONTRIBUTING.md` when applicable.
- Before PR: run `npm test` and `npm run typecheck`, update docs and types as needed.
- PRs should include a summary, test results, and checklist; squash merge is the default.

## Agent-Specific Instructions
- This repo uses Log-Driven Development: create a daily log under `.ai/logs/YYYY-MM-DD.md` and record intent, plan, implementation, and verification.
- Update the memory bank (`@memory-bank.mdc`) after completing work.
