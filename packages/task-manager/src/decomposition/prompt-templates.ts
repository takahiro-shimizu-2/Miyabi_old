/**
 * Prompt Templates for LLM Task Decomposition
 */

import type { DecompositionRequest, DecompositionContext, DecompositionConstraints } from '../types/index.js';

/**
 * System prompt for task decomposition
 */
export const SYSTEM_PROMPT = `You are an expert task decomposition assistant for software development projects. Your role is to analyze user requests and break them down into concrete, actionable tasks that can be executed by autonomous AI agents.

## Core Principles

1. **Atomic Tasks**: Each task should be independently testable and completable
2. **Clear Dependencies**: Explicitly define which tasks must complete before others
3. **Parallel Potential**: Identify tasks that can run concurrently
4. **Quality Gates**: Include appropriate review and test tasks
5. **Security Awareness**: Consider security implications in all tasks

## Task Structure

Each task must include:
- **id**: Unique identifier (format: task-{index})
- **title**: Clear, specific title (imperative form, e.g., "Implement user authentication")
- **description**: Detailed description of what needs to be done
- **type**: One of: feature, bug, refactor, docs, test, deployment, chore
- **priority**: 1-100 (higher = more important)
- **dependencies**: Array of task IDs that must complete first
- **estimatedDuration**: Estimated minutes to complete
- **assignedAgent**: Recommended agent (CodeGenAgent, ReviewAgent, DeploymentAgent, IssueAgent, PRAgent)

## Agent Capabilities

- **CodeGenAgent**: Writes code, implements features, fixes bugs
- **ReviewAgent**: Code review, quality scoring, security scanning
- **DeploymentAgent**: CI/CD, deployments, infrastructure
- **IssueAgent**: Issue analysis, labeling, triage
- **PRAgent**: Pull request creation, documentation

## Output Format

Respond with a JSON object containing:
\`\`\`json
{
  "tasks": [
    {
      "id": "task-0",
      "title": "Task title",
      "description": "Detailed description",
      "type": "feature",
      "priority": 80,
      "dependencies": [],
      "estimatedDuration": 30,
      "assignedAgent": "CodeGenAgent"
    }
  ],
  "warnings": [
    { "code": "WARNING_CODE", "message": "Warning message", "severity": "warning" }
  ]
}
\`\`\``;

/**
 * Build the user prompt for decomposition
 */
export function buildDecompositionPrompt(request: DecompositionRequest): string {
  const parts: string[] = [];

  // Main request
  parts.push('## User Request\n');
  parts.push(request.prompt);
  parts.push('\n');

  // Add context if provided
  if (request.context) {
    parts.push(buildContextSection(request.context));
  }

  // Add constraints if provided
  if (request.constraints) {
    parts.push(buildConstraintsSection(request.constraints));
  }

  // Output format reminder
  parts.push('\n## Instructions\n');
  parts.push('Analyze the request above and decompose it into executable tasks.');
  parts.push(' Return your response as a JSON object with "tasks" and "warnings" arrays.');
  parts.push(' Ensure tasks form a valid DAG (no circular dependencies).');

  return parts.join('');
}

/**
 * Build context section of prompt
 */
function buildContextSection(context: DecompositionContext): string {
  const parts: string[] = ['\n## Context\n'];

  if (context.projectDescription) {
    parts.push(`### Project Description\n${context.projectDescription}\n`);
  }

  if (context.codebaseContext) {
    parts.push('### Codebase\n');
    parts.push(`- Languages: ${context.codebaseContext.languages.join(', ')}\n`);
    parts.push(`- Frameworks: ${context.codebaseContext.frameworks.join(', ')}\n`);
    parts.push(`- Architecture: ${context.codebaseContext.architecture}\n`);
    if (context.codebaseContext.keyFiles?.length) {
      parts.push(`- Key Files: ${context.codebaseContext.keyFiles.join(', ')}\n`);
    }
  }

  if (context.existingTasks?.length) {
    parts.push('### Existing Tasks\n');
    for (const task of context.existingTasks) {
      parts.push(`- [${task.currentState}] ${task.title} (${task.id})\n`);
    }
  }

  if (context.relatedIssues?.length) {
    parts.push(`### Related Issues: #${context.relatedIssues.join(', #')}\n`);
  }

  return parts.join('');
}

/**
 * Build constraints section of prompt
 */
function buildConstraintsSection(constraints: DecompositionConstraints): string {
  const parts: string[] = ['\n## Constraints\n'];

  if (constraints.maxTasks) {
    parts.push(`- Maximum tasks: ${constraints.maxTasks}\n`);
  }

  if (constraints.maxDepth) {
    parts.push(`- Maximum dependency depth: ${constraints.maxDepth}\n`);
  }

  if (constraints.preferredAgents?.length) {
    parts.push(`- Preferred agents: ${constraints.preferredAgents.join(', ')}\n`);
  }

  if (constraints.excludeTypes?.length) {
    parts.push(`- Exclude task types: ${constraints.excludeTypes.join(', ')}\n`);
  }

  if (constraints.estimatedTotalDurationMinutes) {
    parts.push(`- Target total duration: ${constraints.estimatedTotalDurationMinutes} minutes\n`);
  }

  if (constraints.requireTests) {
    parts.push('- Tests are required for all code changes\n');
  }

  if (constraints.requireReview) {
    parts.push('- Code review is required before completion\n');
  }

  return parts.join('');
}

/**
 * Simple decomposition prompt (no context/constraints)
 */
export function buildSimplePrompt(prompt: string): string {
  return `## User Request

${prompt}

## Instructions

Analyze the request above and decompose it into executable tasks. Return your response as a JSON object with:
- "tasks": Array of task objects (id, title, description, type, priority, dependencies, estimatedDuration, assignedAgent)
- "warnings": Array of any warnings or concerns

Ensure tasks form a valid DAG (no circular dependencies). Include appropriate test and review tasks.`;
}
