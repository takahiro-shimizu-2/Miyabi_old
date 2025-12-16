/**
 * TUI Dashboard - Terminal User Interface for Agent Status
 *
 * Steve Jobs Principle: "Design is not just what it looks like.
 * Design is how it works."
 */

import chalk from 'chalk';

export interface AgentStatus {
  name: string;
  displayName: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'waiting';
  progress?: number;
  message?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface DashboardState {
  title: string;
  agents: AgentStatus[];
  currentPhase: string;
  overallProgress: number;
  logs: string[];
  humanApprovalRequired?: {
    action: string;
    description: string;
    options: string[];
  };
}

const STATUS_ICONS: Record<AgentStatus['status'], string> = {
  idle: '○',
  running: '●',
  completed: '✓',
  failed: '✗',
  waiting: '◐',
};

const STATUS_COLORS: Record<AgentStatus['status'], (text: string) => string> = {
  idle: chalk.gray,
  running: chalk.cyan,
  completed: chalk.green,
  failed: chalk.red,
  waiting: chalk.yellow,
};

/**
 * Clear screen and move cursor to top
 */
export function clearScreen(): void {
  process.stdout.write('\x1B[2J\x1B[0;0H');
}

/**
 * Draw a horizontal line
 */
function drawLine(width: number, char = '─'): string {
  return char.repeat(width);
}

/**
 * Draw progress bar
 */
function drawProgressBar(progress: number, width = 30): string {
  const filled = Math.round((progress / 100) * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `[${bar}] ${progress}%`;
}

/**
 * Format elapsed time
 */
function formatElapsed(start: Date, end?: Date): string {
  const elapsed = (end || new Date()).getTime() - start.getTime();
  const seconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Render the TUI Dashboard
 */
export function renderDashboard(state: DashboardState): string {
  const width = Math.min(process.stdout.columns || 80, 80);
  const lines: string[] = [];

  // Header
  lines.push('');
  lines.push(chalk.cyan.bold(`  ✨ ${state.title}`));
  lines.push(chalk.gray(`  ${drawLine(width - 4)}`));
  lines.push('');

  // Overall Progress
  lines.push(chalk.white(`  📊 Phase: ${chalk.cyan(state.currentPhase)}`));
  lines.push(`  ${chalk.white('Progress:')} ${drawProgressBar(state.overallProgress)}`);
  lines.push('');

  // Agent Status
  lines.push(chalk.white.bold('  🤖 Agent Status'));
  lines.push(chalk.gray(`  ${drawLine(width - 4)}`));

  for (const agent of state.agents) {
    const icon = STATUS_ICONS[agent.status];
    const colorFn = STATUS_COLORS[agent.status];
    const statusText = colorFn(`${icon} ${agent.status.toUpperCase()}`);

    let line = `  ${statusText.padEnd(20)} ${chalk.white(agent.displayName)}`;

    if (agent.progress !== undefined && agent.status === 'running') {
      line += chalk.gray(` [${agent.progress}%]`);
    }

    if (agent.startTime && agent.status === 'running') {
      line += chalk.gray(` (${formatElapsed(agent.startTime)})`);
    }

    if (agent.message) {
      line += chalk.gray(` - ${agent.message}`);
    }

    lines.push(line);
  }

  lines.push('');

  // Human Approval Section (if needed)
  if (state.humanApprovalRequired) {
    lines.push(chalk.yellow.bold('  ⚠️  Human Approval Required'));
    lines.push(chalk.gray(`  ${drawLine(width - 4)}`));
    lines.push(`  ${chalk.white(state.humanApprovalRequired.action)}`);
    lines.push(`  ${chalk.gray(state.humanApprovalRequired.description)}`);
    lines.push('');
    for (let i = 0; i < state.humanApprovalRequired.options.length; i++) {
      lines.push(`  ${chalk.cyan(`[${i + 1}]`)} ${state.humanApprovalRequired.options[i]}`);
    }
    lines.push('');
  }

  // Recent Logs
  if (state.logs.length > 0) {
    lines.push(chalk.white.bold('  📜 Recent Activity'));
    lines.push(chalk.gray(`  ${drawLine(width - 4)}`));

    const recentLogs = state.logs.slice(-5);
    for (const log of recentLogs) {
      lines.push(`  ${chalk.gray('›')} ${log}`);
    }
    lines.push('');
  }

  // Footer
  lines.push(chalk.gray(`  ${drawLine(width - 4)}`));
  lines.push(chalk.gray('  Press [q] to quit, [h] for help'));
  lines.push('');

  return lines.join('\n');
}

/**
 * Create initial dashboard state
 */
export function createDashboardState(title: string): DashboardState {
  return {
    title,
    agents: [],
    currentPhase: 'Initializing',
    overallProgress: 0,
    logs: [],
  };
}

/**
 * Add agent to dashboard
 */
export function addAgent(state: DashboardState, agent: AgentStatus): void {
  state.agents.push(agent);
}

/**
 * Update agent status
 */
export function updateAgentStatus(
  state: DashboardState,
  agentName: string,
  updates: Partial<AgentStatus>
): void {
  const agent = state.agents.find(a => a.name === agentName);
  if (agent) {
    Object.assign(agent, updates);
  }
}

/**
 * Add log entry
 */
export function addLog(state: DashboardState, message: string): void {
  const timestamp = new Date().toLocaleTimeString();
  state.logs.push(`${chalk.gray(timestamp)} ${message}`);

  // Keep only last 100 logs
  if (state.logs.length > 100) {
    state.logs = state.logs.slice(-100);
  }
}

/**
 * Request human approval
 */
export function requestHumanApproval(
  state: DashboardState,
  action: string,
  description: string,
  options: string[]
): void {
  state.humanApprovalRequired = { action, description, options };
}

/**
 * Clear human approval request
 */
export function clearHumanApproval(state: DashboardState): void {
  state.humanApprovalRequired = undefined;
}

/**
 * Calculate overall progress from agent statuses
 */
export function calculateOverallProgress(state: DashboardState): number {
  if (state.agents.length === 0) return 0;

  let totalProgress = 0;
  for (const agent of state.agents) {
    if (agent.status === 'completed') {
      totalProgress += 100;
    } else if (agent.status === 'running' && agent.progress !== undefined) {
      totalProgress += agent.progress;
    } else if (agent.status === 'failed') {
      totalProgress += 0;
    }
  }

  return Math.round(totalProgress / state.agents.length);
}

/**
 * Simplified Agent Names (Steve Jobs: "Simplicity is the ultimate sophistication")
 */
export const AGENT_DISPLAY_NAMES: Record<string, string> = {
  coordinator: 'しきるん (Coordinator)',
  codegen: 'つくるん (Builder)',
  review: 'めだまん (Reviewer)',
  issue: 'みつけるん (Analyzer)',
  pr: 'まとめるん (Packager)',
  deploy: 'はこぶん (Deployer)',
  test: 'ためすん (Tester)',
};

/**
 * Get display name for agent
 */
export function getAgentDisplayName(agentName: string): string {
  return AGENT_DISPLAY_NAMES[agentName.toLowerCase()] || agentName;
}
