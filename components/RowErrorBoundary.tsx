"use client";

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface RowErrorBoundaryProps {
  /** Shown in the fallback so it is clear which repo's details failed. */
  repoName?: string;
  children: ReactNode;
}

interface RowErrorBoundaryState {
  error: Error | null;
}

/**
 * Contains a render error inside one repo's expanded details.
 *
 * Without this, a single bad field in one repo's data (an unguarded
 * `.toFixed()` on a Postgres NUMERIC string did exactly this) threw during
 * render and unmounted the ENTIRE dashboard -- "This page couldn't load" --
 * so no row could be expanded at all. With it, only that row's details degrade
 * to an inline message and every other row keeps working.
 */
export class RowErrorBoundary extends Component<RowErrorBoundaryProps, RowErrorBoundaryState> {
  state: RowErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RowErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(
      `Failed to render details${this.props.repoName ? ` for ${this.props.repoName}` : ''}:`,
      error,
      info.componentStack
    );
  }

  private retry = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (!this.state.error) return this.props.children;

    return (
      <div
        role="alert"
        className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
      >
        <p className="font-medium">
          Couldn&apos;t render details{this.props.repoName ? ` for ${this.props.repoName}` : ''}.
        </p>
        <p className="mt-1 text-red-300/80">
          The rest of the dashboard is unaffected. Try syncing the repo, or reload.
        </p>
        <button
          type="button"
          onClick={this.retry}
          className="mt-3 rounded border border-red-400/40 px-2 py-1 text-xs hover:bg-red-500/20"
        >
          Retry
        </button>
      </div>
    );
  }
}
