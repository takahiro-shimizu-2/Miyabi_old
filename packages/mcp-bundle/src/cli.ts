#!/usr/bin/env node
/**
 * Miyabi MCP Bundle - CLI with Onboarding Flow
 *
 * Commands:
 *   miyabi-mcp          Start the MCP server (default)
 *   miyabi-mcp init     Interactive setup wizard
 *   miyabi-mcp doctor   Diagnose setup issues
 *   miyabi-mcp info     Show system information
 *   miyabi-mcp --help   Show help
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { homedir, platform } from 'os';
import { execSync } from 'child_process';
import * as readline from 'readline';
import { fileURLToPath } from 'url';

type PackageJson = {
  version?: string;
};

type ToolStats = {
  toolCount: number;
  categoryCount: number;
  categoryCountExcludingHealth: number;
  healthToolCount: number;
};

let cachedPackageJson: PackageJson | null = null;
let cachedToolStats: ToolStats | null = null;

function getPackageRoot(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return dirname(currentDir);
}

function loadPackageJson(): PackageJson {
  if (cachedPackageJson) return cachedPackageJson;

  const root = getPackageRoot();
  const packageJsonPath = join(root, 'package.json');

  try {
    cachedPackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as PackageJson;
  } catch {
    cachedPackageJson = {};
  }

  return cachedPackageJson;
}

function getBundleVersion(): string {
  return loadPackageJson().version ?? 'unknown';
}

function loadToolStats(): ToolStats {
  if (cachedToolStats) return cachedToolStats;

  const root = getPackageRoot();
  const candidates = [join(root, 'dist', 'index.js'), join(root, 'src', 'index.ts')];

  let content: string | null = null;
  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    try {
      content = readFileSync(candidate, 'utf-8');
      break;
    } catch {
      // Try next candidate
    }
  }

  if (!content) {
    cachedToolStats = { toolCount: 0, categoryCount: 0, categoryCountExcludingHealth: 0, healthToolCount: 0 };
    return cachedToolStats;
  }

  const toolRegex = /\{ name: ['"]([a-z0-9_]+)['"], description:/g;
  const categoryCounts: Record<string, number> = {};
  let toolCount = 0;

  let match: RegExpExecArray | null;
  while ((match = toolRegex.exec(content))) {
    toolCount++;
    const category = match[1].split('_')[0];
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  }

  const healthToolCount = categoryCounts.health || 0;
  const categoryCount = Object.keys(categoryCounts).length;
  const categoryCountExcludingHealth = healthToolCount ? categoryCount - 1 : categoryCount;

  cachedToolStats = { toolCount, categoryCount, categoryCountExcludingHealth, healthToolCount };
  return cachedToolStats;
}

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const c = colors;

function print(msg: string) {
  console.log(msg);
}

function printBanner() {
  const version = getBundleVersion();
  const { toolCount } = loadToolStats();
  const toolCountLabel = toolCount ? String(toolCount) : '?';

  print('');
  print(`${c.magenta}${c.bright}┌─────────────────────────────────────────────────────────────┐${c.reset}`);
  print(`${c.magenta}${c.bright}│${c.reset}                                                             ${c.magenta}${c.bright}│${c.reset}`);
  print(`${c.magenta}${c.bright}│${c.reset}   ${c.cyan}███╗   ███╗██╗██╗   ██╗ █████╗ ██████╗ ██╗${c.reset}               ${c.magenta}${c.bright}│${c.reset}`);
  print(`${c.magenta}${c.bright}│${c.reset}   ${c.cyan}████╗ ████║██║╚██╗ ██╔╝██╔══██╗██╔══██╗██║${c.reset}               ${c.magenta}${c.bright}│${c.reset}`);
  print(`${c.magenta}${c.bright}│${c.reset}   ${c.cyan}██╔████╔██║██║ ╚████╔╝ ███████║██████╔╝██║${c.reset}               ${c.magenta}${c.bright}│${c.reset}`);
  print(`${c.magenta}${c.bright}│${c.reset}   ${c.cyan}██║╚██╔╝██║██║  ╚██╔╝  ██╔══██║██╔══██╗██║${c.reset}               ${c.magenta}${c.bright}│${c.reset}`);
  print(`${c.magenta}${c.bright}│${c.reset}   ${c.cyan}██║ ╚═╝ ██║██║   ██║   ██║  ██║██████╔╝██║${c.reset}               ${c.magenta}${c.bright}│${c.reset}`);
  print(`${c.magenta}${c.bright}│${c.reset}   ${c.cyan}╚═╝     ╚═╝╚═╝   ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚═╝${c.reset}               ${c.magenta}${c.bright}│${c.reset}`);
  print(`${c.magenta}${c.bright}│${c.reset}                                                             ${c.magenta}${c.bright}│${c.reset}`);
  print(`${c.magenta}${c.bright}│${c.reset}   ${c.bright}The Most Comprehensive MCP Server${c.reset}  ${c.dim}v${version}${c.reset}            ${c.magenta}${c.bright}│${c.reset}`);
  print(`${c.magenta}${c.bright}│${c.reset}   ${c.green}${toolCountLabel} Tools${c.reset} · ${c.yellow}Enterprise Security${c.reset} · ${c.blue}Zero Config${c.reset}       ${c.magenta}${c.bright}│${c.reset}`);
  print(`${c.magenta}${c.bright}│${c.reset}                                                             ${c.magenta}${c.bright}│${c.reset}`);
  print(`${c.magenta}${c.bright}└─────────────────────────────────────────────────────────────┘${c.reset}`);
  print('');
}

function printHelp() {
  printBanner();
  print(`${c.bright}Usage:${c.reset}`);
  print(`  ${c.cyan}miyabi-mcp${c.reset}              Start the MCP server`);
  print(`  ${c.cyan}miyabi-mcp init${c.reset}         Interactive setup wizard`);
  print(`  ${c.cyan}miyabi-mcp doctor${c.reset}       Diagnose setup issues`);
  print(`  ${c.cyan}miyabi-mcp info${c.reset}         Show system information`);
  print(`  ${c.cyan}miyabi-mcp --version${c.reset}    Show version`);
  print(`  ${c.cyan}miyabi-mcp --help${c.reset}       Show this help`);
  print('');
  print(`${c.bright}Quick Start:${c.reset}`);
  print(`  1. Run ${c.cyan}miyabi-mcp init${c.reset} to generate Claude Desktop config`);
  print(`  2. Restart Claude Desktop`);
  const { toolCount } = loadToolStats();
  const toolCountLabel = toolCount ? String(toolCount) : 'many';
  print(`  3. Start using ${toolCountLabel} MCP tools!`);
  print('');
  print(`${c.bright}Documentation:${c.reset}`);
  print(`  ${c.blue}https://github.com/ShunsukeHayashi/miyabi-mcp-bundle${c.reset}`);
  print('');
}

function getClaudeConfigPath(): string {
  const p = platform();
  if (p === 'darwin') {
    return join(homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  } else if (p === 'win32') {
    return join(process.env.APPDATA || '', 'Claude', 'claude_desktop_config.json');
  } else {
    return join(homedir(), '.config', 'claude', 'claude_desktop_config.json');
  }
}

function getClaudeConfigDir(): string {
  const p = platform();
  if (p === 'darwin') {
    return join(homedir(), 'Library', 'Application Support', 'Claude');
  } else if (p === 'win32') {
    return join(process.env.APPDATA || '', 'Claude');
  } else {
    return join(homedir(), '.config', 'claude');
  }
}

async function question(rl: readline.Interface, query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function runInit() {
  printBanner();
  print(`${c.bright}${c.green}🚀 Miyabi MCP Bundle - Setup Wizard${c.reset}`);
  print('');
  print(`This wizard will help you configure Miyabi for Claude Desktop.`);
  print('');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    // Step 1: Check prerequisites
    print(`${c.bright}Step 1/4: Checking prerequisites...${c.reset}`);

    const nodeVersion = process.version;
    const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0], 10);
    if (nodeMajor >= 18) {
      print(`  ${c.green}✓${c.reset} Node.js ${nodeVersion} (>=18 required)`);
    } else {
      print(`  ${c.red}✗${c.reset} Node.js ${nodeVersion} - Please upgrade to v18+`);
      process.exit(1);
    }

    // Check if npm is available
    try {
      execSync('npm --version', { stdio: 'pipe' });
      print(`  ${c.green}✓${c.reset} npm is installed`);
    } catch {
      print(`  ${c.red}✗${c.reset} npm not found`);
    }

    // Check if git is available
    try {
      execSync('git --version', { stdio: 'pipe' });
      print(`  ${c.green}✓${c.reset} git is installed`);
    } catch {
      print(`  ${c.yellow}!${c.reset} git not found (optional, for Git tools)`);
    }

    print('');

    // Step 2: Get repository path
    print(`${c.bright}Step 2/4: Configure repository path${c.reset}`);
    const defaultRepo = process.cwd();
    const repoPath = await question(rl, `  Repository path [${c.dim}${defaultRepo}${c.reset}]: `);
    const finalRepoPath = repoPath.trim() || defaultRepo;
    print(`  ${c.green}✓${c.reset} Using: ${finalRepoPath}`);
    print('');

    // Step 3: GitHub token (optional)
    print(`${c.bright}Step 3/4: GitHub integration (optional)${c.reset}`);
    print(`  ${c.dim}Enter your GitHub token for GitHub tools, or press Enter to skip.${c.reset}`);
    print(`  ${c.dim}Get a token at: https://github.com/settings/tokens${c.reset}`);
    const githubToken = await question(rl, `  GitHub token: `);
    if (githubToken.trim()) {
      print(`  ${c.green}✓${c.reset} GitHub token configured`);
    } else {
      print(`  ${c.yellow}!${c.reset} Skipped (GitHub tools will have limited functionality)`);
    }
    print('');

    // Step 4: Generate config
    print(`${c.bright}Step 4/4: Generating Claude Desktop configuration...${c.reset}`);

    const configPath = getClaudeConfigPath();
    const configDir = getClaudeConfigDir();

    // Create directory if it doesn't exist
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
      print(`  ${c.green}✓${c.reset} Created config directory`);
    }

    // Read existing config or create new
    let config: Record<string, unknown> = {};
    if (existsSync(configPath)) {
      try {
        config = JSON.parse(readFileSync(configPath, 'utf-8'));
        print(`  ${c.green}✓${c.reset} Found existing config`);
      } catch {
        print(`  ${c.yellow}!${c.reset} Could not parse existing config, creating new`);
      }
    }

    // Add Miyabi configuration
    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    const mcpServers = config.mcpServers as Record<string, unknown>;
    const env: Record<string, string> = {
      MIYABI_REPO_PATH: finalRepoPath,
    };

    if (githubToken.trim()) {
      env.GITHUB_TOKEN = githubToken.trim();
    }

    mcpServers.miyabi = {
      command: 'npx',
      args: ['-y', 'miyabi-mcp-bundle'],
      env,
    };

    // Write config
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    print(`  ${c.green}✓${c.reset} Configuration saved to:`);
    print(`    ${c.dim}${configPath}${c.reset}`);
    print('');

    // Success message
    print(`${c.green}${c.bright}✨ Setup complete!${c.reset}`);
    print('');
    print(`${c.bright}Next steps:${c.reset}`);
    print(`  1. ${c.cyan}Restart Claude Desktop${c.reset} to load the new configuration`);
    print(`  2. Open Claude Desktop and try: ${c.dim}"Show me system resources"${c.reset}`);
    print('');
    const { toolCount, categoryCountExcludingHealth, healthToolCount } = loadToolStats();
    const toolCountLabel = toolCount ? String(toolCount) : 'unknown';
    const categoriesLabel = categoryCountExcludingHealth
      ? `${categoryCountExcludingHealth}${healthToolCount ? ' + Health Check' : ''}`
      : 'unknown';
    print(`${c.bright}Available tools:${c.reset}`);
    print(`  ${c.cyan}${toolCountLabel}${c.reset} tools across ${c.cyan}${categoriesLabel}${c.reset}`);
    print(`  ${c.dim}See README for the complete tool reference.${c.reset}`);
    print('');
    print(`${c.dim}Need help? Run: miyabi-mcp doctor${c.reset}`);
    print('');

  } finally {
    rl.close();
  }
}

async function runDoctor() {
  printBanner();
  print(`${c.bright}${c.blue}🔍 Miyabi MCP Bundle - Diagnostics${c.reset}`);
  print('');

  let issues = 0;

  // Check Node.js version
  print(`${c.bright}Environment:${c.reset}`);
  const nodeVersion = process.version;
  const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0], 10);
  if (nodeMajor >= 18) {
    print(`  ${c.green}✓${c.reset} Node.js ${nodeVersion}`);
  } else {
    print(`  ${c.red}✗${c.reset} Node.js ${nodeVersion} - Please upgrade to v18+`);
    issues++;
  }

  print(`  ${c.green}✓${c.reset} Platform: ${platform()}`);

  // Check npm
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
    print(`  ${c.green}✓${c.reset} npm ${npmVersion}`);
  } catch {
    print(`  ${c.red}✗${c.reset} npm not found`);
    issues++;
  }

  // Check git
  try {
    const gitVersion = execSync('git --version', { encoding: 'utf-8' }).trim();
    print(`  ${c.green}✓${c.reset} ${gitVersion}`);
  } catch {
    print(`  ${c.yellow}!${c.reset} git not found (optional)`);
  }

  // Check tmux
  try {
    execSync('tmux -V', { stdio: 'pipe' });
    print(`  ${c.green}✓${c.reset} tmux is installed`);
  } catch {
    print(`  ${c.yellow}!${c.reset} tmux not found (optional, for Tmux tools)`);
  }

  print('');

  // Check Claude Desktop config
  print(`${c.bright}Claude Desktop Configuration:${c.reset}`);
  const configPath = getClaudeConfigPath();

  if (existsSync(configPath)) {
    print(`  ${c.green}✓${c.reset} Config file exists`);
    print(`    ${c.dim}${configPath}${c.reset}`);

    try {
      const config = JSON.parse(readFileSync(configPath, 'utf-8'));

      if (config.mcpServers?.miyabi) {
        print(`  ${c.green}✓${c.reset} Miyabi is configured`);

        const miyabiConfig = config.mcpServers.miyabi;
        if (miyabiConfig.env?.MIYABI_REPO_PATH) {
          const repoPath = miyabiConfig.env.MIYABI_REPO_PATH;
          if (existsSync(repoPath)) {
            print(`  ${c.green}✓${c.reset} Repository path exists: ${c.dim}${repoPath}${c.reset}`);
          } else {
            print(`  ${c.red}✗${c.reset} Repository path not found: ${repoPath}`);
            issues++;
          }
        }

        if (miyabiConfig.env?.GITHUB_TOKEN) {
          print(`  ${c.green}✓${c.reset} GitHub token configured`);
        } else {
          print(`  ${c.yellow}!${c.reset} GitHub token not set (optional)`);
        }
      } else {
        print(`  ${c.red}✗${c.reset} Miyabi not configured`);
        print(`    ${c.dim}Run: miyabi-mcp init${c.reset}`);
        issues++;
      }
    } catch (e) {
      print(`  ${c.red}✗${c.reset} Could not parse config file`);
      issues++;
    }
  } else {
    print(`  ${c.red}✗${c.reset} Config file not found`);
    print(`    ${c.dim}Run: miyabi-mcp init${c.reset}`);
    issues++;
  }

  print('');

  // Summary
  if (issues === 0) {
    print(`${c.green}${c.bright}✨ All checks passed! Miyabi is ready to use.${c.reset}`);
  } else {
    print(`${c.yellow}${c.bright}⚠ Found ${issues} issue(s). Please fix them for optimal experience.${c.reset}`);
  }
  print('');
}

function runInfo() {
  printBanner();
  print(`${c.bright}System Information:${c.reset}`);
  print(`  Node.js:    ${process.version}`);
  print(`  Platform:   ${platform()}`);
  print(`  Home:       ${homedir()}`);
  print(`  CWD:        ${process.cwd()}`);
  print('');
  print(`${c.bright}Miyabi MCP Bundle:${c.reset}`);
  const version = getBundleVersion();
  const { toolCount, categoryCountExcludingHealth, healthToolCount } = loadToolStats();
  const categoryLabel = categoryCountExcludingHealth
    ? `${categoryCountExcludingHealth}${healthToolCount ? ' + Health Check' : ''}`
    : 'unknown';
  print(`  Version:    ${version}`);
  print(`  Tools:      ${toolCount || 'unknown'}`);
  print(`  Categories: ${categoryLabel}`);
  print('');
  print(`${c.bright}Config Path:${c.reset}`);
  print(`  ${getClaudeConfigPath()}`);
  print('');
}

function runServer() {
  // Import and run the main server
  import('./index.js');
}

// Main CLI entry point
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'init':
    runInit().catch(console.error);
    break;
  case 'doctor':
    runDoctor().catch(console.error);
    break;
  case 'info':
    runInfo();
    break;
  case '--help':
  case '-h':
    printHelp();
    break;
  case '--version':
  case '-v':
    print(`miyabi-mcp-bundle v${getBundleVersion()}`);
    break;
  default:
    // Default: run the MCP server
    runServer();
}
