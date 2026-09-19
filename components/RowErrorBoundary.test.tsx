import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { RowErrorBoundary } from './RowErrorBoundary';

afterEach(cleanup);

function Boom(): never {
  throw new Error('kaboom');
}

describe('RowErrorBoundary', () => {
  it('contains a render error to one row and keeps its siblings rendering', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <div>
        <RowErrorBoundary repoName="broken-repo">
          <Boom />
        </RowErrorBoundary>
        <RowErrorBoundary repoName="healthy-repo">
          <p>healthy details</p>
        </RowErrorBoundary>
      </div>
    );

    expect(screen.getByRole('alert').textContent).toContain("Couldn't render details for broken-repo");
    expect(screen.getByText('healthy details')).toBeTruthy();
    spy.mockRestore();
  });

  it('renders children untouched when nothing throws', () => {
    render(
      <RowErrorBoundary repoName="ok">
        <p>fine</p>
      </RowErrorBoundary>
    );
    expect(screen.getByText('fine')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('recovers when Retry is clicked after the underlying problem is gone', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    let shouldThrow = true;
    function Flaky() {
      if (shouldThrow) throw new Error('first render fails');
      return <p>recovered</p>;
    }

    render(
      <RowErrorBoundary repoName="flaky">
        <Flaky />
      </RowErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeTruthy();

    shouldThrow = false;
    fireEvent.click(screen.getByText('Retry'));
    expect(screen.getByText('recovered')).toBeTruthy();
    spy.mockRestore();
  });
});
