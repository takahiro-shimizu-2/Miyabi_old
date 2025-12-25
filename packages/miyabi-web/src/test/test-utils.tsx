import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';

// Wrapper for React Flow components
function ReactFlowWrapper({ children }: { children: React.ReactNode }) {
  return <ReactFlowProvider>{children}</ReactFlowProvider>;
}

// Custom render with React Flow provider
export function renderWithReactFlow(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: ReactFlowWrapper, ...options });
}

export * from '@testing-library/react';
