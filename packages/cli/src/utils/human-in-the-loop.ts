/**
 * Human-in-the-Loop Mode
 *
 * Steve Jobs Principle: "You've got to start with the customer experience
 * and work backward to the technology."
 *
 * This module provides approval gates for critical operations,
 * giving users control over autonomous agent actions.
 */

import chalk from 'chalk';
import inquirer from 'inquirer';

export type ApprovalLevel = 'auto' | 'critical' | 'all';

export interface ApprovalGate {
  id: string;
  action: string;
  description: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, unknown>;
  suggestedAction?: 'approve' | 'reject' | 'modify';
}

export interface ApprovalResult {
  approved: boolean;
  modified?: Record<string, unknown>;
  reason?: string;
  timestamp: Date;
}

export interface HumanInTheLoopConfig {
  approvalLevel: ApprovalLevel;
  autoApproveRisks: Array<'low' | 'medium'>;
  notifyOnAutoApprove: boolean;
  timeoutSeconds: number;
}

const DEFAULT_CONFIG: HumanInTheLoopConfig = {
  approvalLevel: 'critical',
  autoApproveRisks: ['low'],
  notifyOnAutoApprove: true,
  timeoutSeconds: 300, // 5 minutes
};

const RISK_COLORS: Record<string, (text: string) => string> = {
  low: chalk.green,
  medium: chalk.yellow,
  high: chalk.red,
  critical: chalk.bgRed.white,
};

const RISK_ICONS: Record<string, string> = {
  low: '○',
  medium: '◐',
  high: '●',
  critical: '⚠',
};

/**
 * Human-in-the-Loop Manager
 */
export class HumanInTheLoop {
  private config: HumanInTheLoopConfig;
  private history: Array<{ gate: ApprovalGate; result: ApprovalResult }> = [];
  private isInteractive: boolean;

  constructor(config: Partial<HumanInTheLoopConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.isInteractive = process.stdin.isTTY && process.stdout.isTTY;
  }

  /**
   * Check if approval is required for a given gate
   */
  private requiresApproval(gate: ApprovalGate): boolean {
    if (this.config.approvalLevel === 'auto') {
      return false;
    }

    if (this.config.approvalLevel === 'all') {
      return true;
    }

    // 'critical' level - only require approval for high/critical risks
    return gate.risk === 'high' || gate.risk === 'critical';
  }

  /**
   * Format gate details for display
   */
  private formatGateDetails(gate: ApprovalGate): string[] {
    const lines: string[] = [];
    const riskColor = RISK_COLORS[gate.risk];
    const riskIcon = RISK_ICONS[gate.risk];

    lines.push('');
    lines.push(chalk.yellow.bold('━'.repeat(60)));
    lines.push(chalk.yellow.bold('  🚨 Human Approval Required'));
    lines.push(chalk.yellow.bold('━'.repeat(60)));
    lines.push('');
    lines.push(`  ${chalk.white.bold('Action:')} ${gate.action}`);
    lines.push(`  ${chalk.white.bold('Description:')} ${gate.description}`);
    lines.push(`  ${chalk.white.bold('Risk Level:')} ${riskColor(`${riskIcon} ${gate.risk.toUpperCase()}`)}`);

    if (gate.details) {
      lines.push('');
      lines.push(chalk.white.bold('  Details:'));
      for (const [key, value] of Object.entries(gate.details)) {
        lines.push(`    ${chalk.gray(key)}: ${chalk.white(String(value))}`);
      }
    }

    lines.push('');
    return lines;
  }

  /**
   * Request approval from user
   */
  async requestApproval(gate: ApprovalGate): Promise<ApprovalResult> {
    // Check if approval is needed
    if (!this.requiresApproval(gate)) {
      // Auto-approve low risk actions
      if (this.config.notifyOnAutoApprove && !this.config.autoApproveRisks.includes(gate.risk as 'low' | 'medium')) {
        console.log(chalk.gray(`  ⚡ Auto-approved: ${gate.action}`));
      }

      const result: ApprovalResult = {
        approved: true,
        reason: 'Auto-approved based on configuration',
        timestamp: new Date(),
      };
      this.history.push({ gate, result });
      return result;
    }

    // Display gate information
    console.log(this.formatGateDetails(gate).join('\n'));

    // Non-interactive mode - use suggested action or reject
    if (!this.isInteractive) {
      const approved = gate.suggestedAction === 'approve';
      const result: ApprovalResult = {
        approved,
        reason: approved ? 'Auto-approved (non-interactive mode)' : 'Rejected (non-interactive mode)',
        timestamp: new Date(),
      };
      this.history.push({ gate, result });
      return result;
    }

    // Interactive approval
    const { decision } = await inquirer.prompt([
      {
        type: 'list',
        name: 'decision',
        message: 'What would you like to do?',
        choices: [
          { name: `${chalk.green('✓ Approve')  } - Proceed with this action`, value: 'approve' },
          { name: `${chalk.red('✗ Reject')  } - Skip this action`, value: 'reject' },
          { name: `${chalk.yellow('ℹ More Info')  } - Show detailed information`, value: 'info' },
          { name: `${chalk.gray('⏸ Pause')  } - Pause execution`, value: 'pause' },
        ],
        default: gate.suggestedAction === 'approve' ? 'approve' : 'reject',
      },
    ]);

    if (decision === 'info') {
      // Show more details and ask again
      console.log(chalk.white.bold('\n  Additional Information:'));
      console.log(chalk.gray(`  Gate ID: ${gate.id}`));
      console.log(chalk.gray(`  Created: ${new Date().toISOString()}`));
      if (gate.details) {
        console.log(chalk.gray(`  Full Details: ${JSON.stringify(gate.details, null, 2)}`));
      }
      return this.requestApproval(gate);
    }

    if (decision === 'pause') {
      console.log(chalk.yellow('\n  ⏸ Execution paused. Press Enter to continue...'));
      await inquirer.prompt([{ type: 'input', name: 'continue', message: '' }]);
      return this.requestApproval(gate);
    }

    let reason: string | undefined;
    if (decision === 'reject') {
      const { rejectReason } = await inquirer.prompt([
        {
          type: 'input',
          name: 'rejectReason',
          message: 'Reason for rejection (optional):',
          default: '',
        },
      ]);
      reason = rejectReason || 'User rejected';
    }

    const result: ApprovalResult = {
      approved: decision === 'approve',
      reason: decision === 'approve' ? 'User approved' : reason,
      timestamp: new Date(),
    };

    this.history.push({ gate, result });

    if (result.approved) {
      console.log(chalk.green('\n  ✓ Approved. Proceeding...\n'));
    } else {
      console.log(chalk.red('\n  ✗ Rejected. Skipping this action.\n'));
    }

    return result;
  }

  /**
   * Create approval gates for common operations
   */
  static createGate(
    type: 'deploy' | 'merge' | 'delete' | 'publish' | 'execute',
    details: Record<string, unknown> = {}
  ): ApprovalGate {
    const gates: Record<string, Partial<ApprovalGate>> = {
      deploy: {
        action: 'Deploy to Production',
        description: 'Deploy changes to production environment',
        risk: 'high',
        suggestedAction: 'approve',
      },
      merge: {
        action: 'Merge Pull Request',
        description: 'Merge code changes into main branch',
        risk: 'medium',
        suggestedAction: 'approve',
      },
      delete: {
        action: 'Delete Resources',
        description: 'Delete files, branches, or other resources',
        risk: 'high',
        suggestedAction: 'reject',
      },
      publish: {
        action: 'Publish Package',
        description: 'Publish package to npm registry',
        risk: 'critical',
        suggestedAction: 'approve',
      },
      execute: {
        action: 'Execute Command',
        description: 'Run a shell command',
        risk: 'medium',
        suggestedAction: 'approve',
      },
    };

    const baseGate = gates[type] || {
      action: 'Unknown Action',
      description: 'An unknown action requires approval',
      risk: 'high' as const,
    };

    return {
      id: `${type}-${Date.now()}`,
      ...baseGate,
      details,
    } as ApprovalGate;
  }

  /**
   * Get approval history
   */
  getHistory(): Array<{ gate: ApprovalGate; result: ApprovalResult }> {
    return [...this.history];
  }

  /**
   * Get summary of approvals
   */
  getSummary(): { approved: number; rejected: number; total: number } {
    const approved = this.history.filter(h => h.result.approved).length;
    return {
      approved,
      rejected: this.history.length - approved,
      total: this.history.length,
    };
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<HumanInTheLoopConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): HumanInTheLoopConfig {
    return { ...this.config };
  }
}

/**
 * Quick approval helper for common use cases
 */
export async function requireApproval(
  action: string,
  description: string,
  risk: ApprovalGate['risk'] = 'medium'
): Promise<boolean> {
  const hitl = new HumanInTheLoop();
  const gate: ApprovalGate = {
    id: `quick-${Date.now()}`,
    action,
    description,
    risk,
    suggestedAction: 'approve',
  };
  const result = await hitl.requestApproval(gate);
  return result.approved;
}

/**
 * Decorator for functions that require approval
 */
export function withApproval(
  action: string,
  description: string,
  risk: ApprovalGate['risk'] = 'medium'
) {
  return function <T extends (...args: unknown[]) => Promise<unknown>>(
    _target: unknown,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> {
    const originalMethod = descriptor.value;
    if (!originalMethod) {return descriptor;}

    descriptor.value = async function (this: unknown, ...args: unknown[]) {
      const approved = await requireApproval(action, description, risk);
      if (!approved) {
        throw new Error(`Action rejected: ${action}`);
      }
      return originalMethod.apply(this, args);
    } as T;

    return descriptor;
  };
}
