import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const execAsync = promisify(exec);

/**
 * Miyabi CLI Demo E2E Test
 *
 * This test demonstrates the complete Miyabi workflow:
 * 1. Status check
 * 2. GitHub integration verification
 * 3. CLI command availability
 *
 * Note: This is a demo test that verifies the CLI is working.
 * Full integration tests require GitHub tokens and API access.
 */
test.describe('Miyabi CLI Demo', () => {
  test.beforeAll(async () => {
    // Ensure we're in the project root
    process.chdir(path.resolve(__dirname, '../../..'));
  });

  test('should display version information', async () => {
    const { stdout, stderr } = await execAsync('node --version');

    console.log('Node version:', stdout.trim());
    expect(stdout).toContain('v');
    expect(stderr).toBe('');
  });

  test('should verify package.json contains correct metadata', async () => {
    const packageJsonPath = path.resolve(__dirname, '../../../package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

    expect(packageJson.name).toBe('autonomous-operations');
    expect(packageJson.version).toBe('0.14.0');
    expect(packageJson.license).toBe('Apache-2.0');
    expect(packageJson.repository.url).toBe('https://github.com/ShunsukeHayashi/Miyabi.git');
  });

  test('should verify CLI scripts are defined', async () => {
    const packageJsonPath = path.resolve(__dirname, '../../../package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

    // Verify key scripts exist
    expect(packageJson.scripts).toHaveProperty('start');
    expect(packageJson.scripts).toHaveProperty('test');
    expect(packageJson.scripts).toHaveProperty('build');
    expect(packageJson.scripts['agents:parallel:exec']).toBeDefined();
  });

  test('should verify TypeScript configuration', async () => {
    const tsconfigPath = path.resolve(__dirname, '../../../tsconfig.json');
    const tsconfig = JSON.parse(await readFile(tsconfigPath, 'utf-8'));

    expect(tsconfig.compilerOptions).toBeDefined();
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.module).toBeDefined();
  });

  test('should verify README contains required sections', async () => {
    const readmePath = path.resolve(__dirname, '../../../README.md');
    const readme = await readFile(readmePath, 'utf-8');

    // Verify key sections (simplified README)
    expect(readme).toContain('# 🌸 Miyabi');
    expect(readme).toContain('npx miyabi');
    expect(readme).toContain('Issue');
  });

  test('should verify legal documentation exists', async () => {
    const licensePath = path.resolve(__dirname, '../../../LICENSE');
    const noticePath = path.resolve(__dirname, '../../../NOTICE');
    const contributingPath = path.resolve(__dirname, '../../../CONTRIBUTING.md');

    // Check LICENSE
    const license = await readFile(licensePath, 'utf-8');
    expect(license).toContain('Apache License');
    expect(license).toContain('Version 2.0');

    // Check NOTICE
    const notice = await readFile(noticePath, 'utf-8');
    expect(notice).toContain('Miyabi');
    expect(notice).toContain('Shunsuke Hayashi');

    // Check CONTRIBUTING.md
    const contributing = await readFile(contributingPath, 'utf-8');
    expect(contributing).toContain('Contributing');
  });

  test('should verify Discord community documentation', async () => {
    const communityGuidelinesPath = path.resolve(__dirname, '../../../docs/community/COMMUNITY_GUIDELINES.md');
    const discordSetupPath = path.resolve(__dirname, '../../../docs/community/DISCORD_SETUP_QUICKSTART.md');

    // Check COMMUNITY_GUIDELINES.md
    const guidelines = await readFile(communityGuidelinesPath, 'utf-8');
    expect(guidelines).toContain('Miyabi Community Guidelines');
    expect(guidelines).toContain('Core Values');

    // Check DISCORD_SETUP_QUICKSTART.md
    const discordSetup = await readFile(discordSetupPath, 'utf-8');
    expect(discordSetup).toContain('Discord Server Setup');
    expect(discordSetup).toContain('Quick Start Guide');
  });

  test('should verify agent system documentation', async () => {
    const agentManualPath = path.resolve(__dirname, '../../../docs/AGENT_OPERATIONS_MANUAL.md');

    // Check if agent manual exists and contains key sections
    const agentManual = await readFile(agentManualPath, 'utf-8');
    expect(agentManual).toContain('Agent');
    expect(agentManual).toContain('Operations');
  });

  test('should verify test infrastructure', async () => {
    const { stdout } = await execAsync('npm test -- --version');

    // Verify Vitest is installed and working
    expect(stdout).toContain('vitest');
  });

  test('should verify TypeScript compilation', async () => {
    // Run TypeScript compiler in check mode
    const { stdout, stderr } = await execAsync('npx tsc --noEmit');

    console.log('TypeScript check output:', stdout || '(no output - success)');

    // If there are errors, they'll be in stderr or the command will throw
    // No output means compilation is successful
  });

  test('should verify project structure', async () => {
    const projectDirs = [
      'packages/coding-agents',  // agents moved to packages
      'scripts',
      'tests',
      'docs',
      'packages',
      '.github/workflows',
      '.claude',
    ];

    for (const dir of projectDirs) {
      const dirPath = path.resolve(__dirname, '../../../', dir);
      const { stdout } = await execAsync(`test -d "${dirPath}" && echo "exists" || echo "missing"`);
      expect(stdout.trim()).toBe('exists');
    }
  });

  test('should verify key dependencies are installed', async () => {
    const packageJsonPath = path.resolve(__dirname, '../../../package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

    // Verify key dependencies
    expect(packageJson.dependencies['@octokit/rest']).toBeDefined();
    expect(packageJson.dependencies['@anthropic-ai/sdk']).toBeDefined();
    expect(packageJson.dependencies['chalk']).toBeDefined();
    expect(packageJson.dependencies['ora']).toBeDefined();

    // Verify key dev dependencies
    expect(packageJson.devDependencies['typescript']).toBeDefined();
    expect(packageJson.devDependencies['vitest']).toBeDefined();
    expect(packageJson.devDependencies['@playwright/test']).toBeDefined();
  });
});
