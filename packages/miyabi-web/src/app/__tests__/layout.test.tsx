import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RootLayout, { metadata } from '../layout';

describe('RootLayout', () => {
  it('should render children', () => {
    render(
      <RootLayout>
        <div data-testid="child">Test Child</div>
      </RootLayout>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should have correct metadata title', () => {
    expect(metadata.title).toBe('Miyabi Workflow Editor');
  });

  it('should have correct metadata description', () => {
    expect(metadata.description).toBe('Visual workflow editor for autonomous AI development');
  });
});
