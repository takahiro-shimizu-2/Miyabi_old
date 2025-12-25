import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithReactFlow } from '@/test/test-utils';
import ConditionNode from './ConditionNode';
import type { ConditionNodeData } from '@/lib/types';

describe('ConditionNode', () => {
  const defaultData: ConditionNodeData = {
    label: 'Condition',
    condition: 'status === "success"',
    trueLabel: 'Yes',
    falseLabel: 'No',
  };

  it('should render condition label', () => {
    renderWithReactFlow(<ConditionNode data={defaultData} />);
    expect(screen.getByText('Condition')).toBeInTheDocument();
  });

  it('should render condition expression', () => {
    renderWithReactFlow(<ConditionNode data={defaultData} />);
    expect(screen.getByText('status === "success"')).toBeInTheDocument();
  });

  it('should render true label', () => {
    renderWithReactFlow(<ConditionNode data={defaultData} />);
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('should render false label', () => {
    renderWithReactFlow(<ConditionNode data={defaultData} />);
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('should use default true label when not provided', () => {
    renderWithReactFlow(
      <ConditionNode data={{ ...defaultData, trueLabel: undefined }} />
    );
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('should use default false label when not provided', () => {
    renderWithReactFlow(
      <ConditionNode data={{ ...defaultData, falseLabel: undefined }} />
    );
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('should render custom true label', () => {
    renderWithReactFlow(
      <ConditionNode data={{ ...defaultData, trueLabel: 'Pass' }} />
    );
    expect(screen.getByText('Pass')).toBeInTheDocument();
  });

  it('should render custom false label', () => {
    renderWithReactFlow(
      <ConditionNode data={{ ...defaultData, falseLabel: 'Fail' }} />
    );
    expect(screen.getByText('Fail')).toBeInTheDocument();
  });

  it('should apply selected styles when selected', () => {
    const { container } = renderWithReactFlow(
      <ConditionNode data={defaultData} selected={true} />
    );
    const node = container.firstChild as HTMLElement;
    expect(node.className).toContain('ring-2');
  });

  it('should apply amber background color', () => {
    const { container } = renderWithReactFlow(
      <ConditionNode data={defaultData} />
    );
    const node = container.firstChild as HTMLElement;
    expect(node.className).toContain('bg-amber-100');
  });

  it('should render question mark emoji', () => {
    renderWithReactFlow(<ConditionNode data={defaultData} />);
    expect(screen.getByText('❓')).toBeInTheDocument();
  });

  it('should render condition in monospace font', () => {
    const { container } = renderWithReactFlow(
      <ConditionNode data={defaultData} />
    );
    const conditionElement = container.querySelector('.font-mono');
    expect(conditionElement).toBeInTheDocument();
    expect(conditionElement?.textContent).toBe('status === "success"');
  });

  it('should render true label with green color', () => {
    const { container } = renderWithReactFlow(
      <ConditionNode data={defaultData} />
    );
    const greenText = container.querySelector('.text-green-600');
    expect(greenText).toBeInTheDocument();
    expect(greenText?.textContent).toBe('Yes');
  });

  it('should render false label with red color', () => {
    const { container } = renderWithReactFlow(
      <ConditionNode data={defaultData} />
    );
    const redText = container.querySelector('.text-red-600');
    expect(redText).toBeInTheDocument();
    expect(redText?.textContent).toBe('No');
  });
});
