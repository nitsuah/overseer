import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { RoadmapSection } from './RoadmapSection';
import type { RoadmapItem } from '@/types/repo';

const baseItem: RoadmapItem = {
  id: '1',
  title: 'Ship feature X',
  quarter: 'Q2 2025',
  status: 'in-progress',
};

afterEach(cleanup);

describe('RoadmapSection', () => {
  it('renders a linked PR badge when linked_pr_number is set', () => {
    render(
      <RoadmapSection
        roadmapItems={[{ ...baseItem, linked_pr_number: 42 }]}
        repoUrl="https://github.com/acme/widgets"
      />
    );

    const link = screen.getByRole('link', { name: /#42/ });
    expect(link.getAttribute('href')).toBe('https://github.com/acme/widgets/pull/42');
  });

  it('does not render a PR badge when linked_pr_number is not set', () => {
    render(<RoadmapSection roadmapItems={[baseItem]} repoUrl="https://github.com/acme/widgets" />);

    expect(screen.queryByRole('link')).toBeNull();
  });

  it('does not render a PR badge when repoUrl is missing', () => {
    render(<RoadmapSection roadmapItems={[{ ...baseItem, linked_pr_number: 42 }]} />);

    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders a linked agent task badge when agent_task_id is set', () => {
    render(<RoadmapSection roadmapItems={[{ ...baseItem, agent_task_id: 'task-abc123' }]} />);

    expect(screen.getByTitle('Linked agent task: task-abc123')).toBeTruthy();
  });
});

describe('RoadmapSection link editor', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not render an edit control when not authenticated or repoName is missing', () => {
    render(<RoadmapSection roadmapItems={[baseItem]} isAuthenticated={true} />);
    expect(screen.queryByTitle('Link to a PR or Agent Task Queue entry')).toBeNull();

    cleanup();

    render(<RoadmapSection roadmapItems={[baseItem]} repoName="widgets" isAuthenticated={false} />);
    expect(screen.queryByTitle('Link to a PR or Agent Task Queue entry')).toBeNull();
  });

  it('saves a PR number and agent task id and updates the badges', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, item: { id: '1', linked_pr_number: 99, agent_task_id: 'task-xyz' } }),
    });

    render(<RoadmapSection roadmapItems={[baseItem]} repoName="widgets" repoUrl="https://github.com/acme/widgets" isAuthenticated={true} />);

    fireEvent.click(screen.getByTitle('Link to a PR or Agent Task Queue entry'));
    fireEvent.change(screen.getByPlaceholderText('PR #'), { target: { value: '99' } });
    fireEvent.change(screen.getByPlaceholderText('Agent task ID'), { target: { value: 'task-xyz' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /#99/ })).toBeTruthy();
    });
    expect(screen.getByTitle('Linked agent task: task-xyz')).toBeTruthy();

    expect(global.fetch).toHaveBeenCalledWith('/api/repos/widgets/roadmap-items/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkedPrNumber: 99, agentTaskId: 'task-xyz' }),
    });
  });

  it('clears existing links via the Clear button', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, item: { id: '1', linked_pr_number: null, agent_task_id: null } }),
    });

    render(
      <RoadmapSection
        roadmapItems={[{ ...baseItem, linked_pr_number: 42, agent_task_id: 'task-abc' }]}
        repoName="widgets"
        repoUrl="https://github.com/acme/widgets"
        isAuthenticated={true}
      />
    );

    expect(screen.getByRole('link', { name: /#42/ })).toBeTruthy();

    fireEvent.click(screen.getByTitle('Link to a PR or Agent Task Queue entry'));
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

    await waitFor(() => {
      expect(screen.queryByRole('link')).toBeNull();
    });
    expect(screen.queryByTitle(/Linked agent task/)).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith('/api/repos/widgets/roadmap-items/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkedPrNumber: null, agentTaskId: null }),
    });
  });

  it('shows a validation error for a non-numeric PR number without calling the API', () => {
    render(<RoadmapSection roadmapItems={[baseItem]} repoName="widgets" isAuthenticated={true} />);

    fireEvent.click(screen.getByTitle('Link to a PR or Agent Task Queue entry'));
    fireEvent.change(screen.getByPlaceholderText('PR #'), { target: { value: 'abc' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('PR # must be a positive number')).toBeTruthy();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
