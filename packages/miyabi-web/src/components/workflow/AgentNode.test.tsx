import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithReactFlow } from '@/test/test-utils';
import AgentNode from './AgentNode';
import type { AgentNodeData } from '@/lib/types';

describe('AgentNode', () => {
  const defaultData: AgentNodeData = {
    label: 'Test Agent',
    agentType: 'coordinator',
    status: 'pending',
  };

  it('should render agent label', () => {
    renderWithReactFlow(<AgentNode data={defaultData} />);
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
  });

  it('should render agent type', () => {
    renderWithReactFlow(<AgentNode data={defaultData} />);
    expect(screen.getByText('coordinator Agent')).toBeInTheDocument();
  });

  it('should render status icon for pending', () => {
    renderWithReactFlow(<AgentNode data={{ ...defaultData, status: 'pending' }} />);
    expect(screen.getByText('⏳')).toBeInTheDocument();
  });

  it('should render status icon for running', () => {
    renderWithReactFlow(<AgentNode data={{ ...defaultData, status: 'running' }} />);
    expect(screen.getByText('🔄')).toBeInTheDocument();
  });

  it('should render status icon for completed', () => {
    renderWithReactFlow(<AgentNode data={{ ...defaultData, status: 'completed' }} />);
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('should render status icon for failed', () => {
    renderWithReactFlow(<AgentNode data={{ ...defaultData, status: 'failed' }} />);
    expect(screen.getByText('❌')).toBeInTheDocument();
  });

  it('should render issue number when provided', () => {
    renderWithReactFlow(
      <AgentNode data={{ ...defaultData, issueNumber: 123 }} />
    );
    expect(screen.getByText('Issue #123')).toBeInTheDocument();
  });

  it('should not render issue number when not provided', () => {
    renderWithReactFlow(<AgentNode data={defaultData} />);
    expect(screen.queryByText(/Issue #/)).not.toBeInTheDocument();
  });

  it('should apply selected styles when selected', () => {
    const { container } = renderWithReactFlow(
      <AgentNode data={defaultData} selected={true} />
    );
    const node = container.firstChild as HTMLElement;
    expect(node.className).toContain('ring-2');
  });

  it('should render robot emoji', () => {
    renderWithReactFlow(<AgentNode data={defaultData} />);
    expect(screen.getByText('🤖')).toBeInTheDocument();
  });

  it('should apply correct color for codegen agent', () => {
    const { container } = renderWithReactFlow(
      <AgentNode data={{ ...defaultData, agentType: 'codegen' }} />
    );
    const node = container.firstChild as HTMLElement;
    expect(node.className).toContain('bg-blue-100');
  });

  it('should apply correct color for review agent', () => {
    const { container } = renderWithReactFlow(
      <AgentNode data={{ ...defaultData, agentType: 'review' }} />
    );
    const node = container.firstChild as HTMLElement;
    expect(node.className).toContain('bg-green-100');
  });

  it('should apply default color for unknown agent type', () => {
    const { container } = renderWithReactFlow(
      <AgentNode data={{ ...defaultData, agentType: 'unknown' as never }} />
    );
    const node = container.firstChild as HTMLElement;
    expect(node.className).toContain('bg-gray-100');
  });
});
