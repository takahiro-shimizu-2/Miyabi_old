import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithReactFlow } from '@/test/test-utils';
import IssueNode from './IssueNode';
import type { IssueNodeData } from '@/lib/types';

describe('IssueNode', () => {
  const defaultData: IssueNodeData = {
    label: 'Issue #42',
    issueNumber: 42,
    status: 'open',
  };

  it('should render issue label', () => {
    renderWithReactFlow(<IssueNode data={defaultData} />);
    expect(screen.getByText('Issue #42')).toBeInTheDocument();
  });

  it('should render issue number in details', () => {
    renderWithReactFlow(<IssueNode data={defaultData} />);
    // The details section also shows Issue #42
    const issueTexts = screen.getAllByText(/Issue #42/);
    expect(issueTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('should render status when provided', () => {
    renderWithReactFlow(<IssueNode data={defaultData} />);
    expect(screen.getByText(/open/)).toBeInTheDocument();
  });

  it('should render title when provided', () => {
    renderWithReactFlow(
      <IssueNode data={{ ...defaultData, title: 'Fix critical bug' }} />
    );
    expect(screen.getByText('Fix critical bug')).toBeInTheDocument();
  });

  it('should not render title when not provided', () => {
    renderWithReactFlow(<IssueNode data={defaultData} />);
    expect(screen.queryByText('Fix critical bug')).not.toBeInTheDocument();
  });

  it('should apply green color for open status', () => {
    const { container } = renderWithReactFlow(
      <IssueNode data={{ ...defaultData, status: 'open' }} />
    );
    const node = container.firstChild as HTMLElement;
    expect(node.className).toContain('bg-green-100');
  });

  it('should apply gray color for closed status', () => {
    const { container } = renderWithReactFlow(
      <IssueNode data={{ ...defaultData, status: 'closed' }} />
    );
    const node = container.firstChild as HTMLElement;
    expect(node.className).toContain('bg-gray-100');
  });

  it('should apply selected styles when selected', () => {
    const { container } = renderWithReactFlow(
      <IssueNode data={defaultData} selected={true} />
    );
    const node = container.firstChild as HTMLElement;
    expect(node.className).toContain('ring-2');
  });

  it('should render clipboard emoji', () => {
    renderWithReactFlow(<IssueNode data={defaultData} />);
    expect(screen.getByText('📋')).toBeInTheDocument();
  });

  it('should truncate long titles', () => {
    const longTitle = 'This is a very long title that should be truncated when displayed in the issue node component';
    const { container } = renderWithReactFlow(
      <IssueNode data={{ ...defaultData, title: longTitle }} />
    );
    const titleElement = container.querySelector('.truncate');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement?.className).toContain('max-w-[200px]');
  });
});
