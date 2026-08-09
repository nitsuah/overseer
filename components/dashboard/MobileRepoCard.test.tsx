import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { MobileRepoCard } from './MobileRepoCard';
import type { Repo, RepoDetails } from '@/types/repo';

// ── Child-component mocks ─────────────────────────────────────────────────────

vi.mock('@/components/ExpandableRow', () => ({
  default: () => <div data-testid="expandable-row" />,
}));

vi.mock('@/components/dashboard/repo-row/HealthBreakdown', () => ({
  HealthBreakdown: ({ health }: { health: { grade: string } }) => (
    <span data-testid="health-breakdown">{health.grade}</span>
  ),
}));

vi.mock('@/components/dashboard/repo-row/TypeEditor', () => ({
  TypeEditor: () => <span data-testid="type-editor" />,
}));

vi.mock('@/components/dashboard/repo-row/repo-row-utils', () => ({
  getTypeIcon: () => null,
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const baseRepo: Repo = {
  id: '1',
  name: 'my-repo',
  full_name: 'acme/my-repo',
  description: 'A test repo',
  language: 'TypeScript',
  stars: 5,
  forks: 0,
  branches_count: 1,
  url: 'https://github.com/acme/my-repo',
  homepage: null,
  topics: [],
  last_synced: new Date().toISOString(),
  health_score: 75,
};

const baseDetails: RepoDetails = {
  tasks: [],
  roadmapItems: [],
  docStatuses: [
    { doc_type: 'readme',  exists: true,  health_state: 'healthy' },
    { doc_type: 'roadmap', exists: false, health_state: 'missing' },
    { doc_type: 'tasks',   exists: false, health_state: 'missing' },
    { doc_type: 'metrics', exists: false, health_state: 'missing' },
    { doc_type: 'features',exists: false, health_state: 'missing' },
  ],
  metrics: [],
  features: [],
  bestPractices: [],
  communityStandards: [],
};

function baseProps(overrides: Partial<Parameters<typeof MobileRepoCard>[0]> = {}) {
  return {
    repo: baseRepo,
    details: undefined,
    isExpanded: false,
    syncingRepo: null,
    generatingSummary: null,
    isAuthenticated: true,
    onToggleHealth: vi.fn(),
    onToggleExpanded: vi.fn(),
    onRemove: vi.fn(),
    onFixAllDocs: vi.fn(),
    onFixDoc: vi.fn(),
    onFixStandard: vi.fn(),
    onFixAllStandards: vi.fn(),
    onFixPractice: vi.fn(),
    onFixAllPractices: vi.fn(),
    onGenerateSummary: vi.fn(),
    onSyncSingleRepo: vi.fn(),
    ...overrides,
  };
}

afterEach(cleanup);

// ── Collapsed rendering ───────────────────────────────────────────────────────

describe('MobileRepoCard – collapsed', () => {
  it('shows the repo name', () => {
    render(<MobileRepoCard {...baseProps()} />);
    expect(screen.getByText('my-repo')).toBeTruthy();
  });

  it('shows the health grade letter when details are absent', () => {
    render(<MobileRepoCard {...baseProps()} />);
    // getHealthGrade(75) → B (dashboard-utils thresholds differ from health-grade.ts)
    expect(screen.getByText('B')).toBeTruthy();
  });

  it('does not render the expanded row when isExpanded is false', () => {
    render(<MobileRepoCard {...baseProps()} />);
    expect(screen.queryByTestId('expandable-row')).toBeNull();
  });
});

// helper: the outer expansion div is the only element with aria-controls
function getCard(container: HTMLElement) {
  return container.querySelector<HTMLElement>('[aria-controls]')!;
}

// ── Expansion ─────────────────────────────────────────────────────────────────

describe('MobileRepoCard – expansion', () => {
  it('calls onToggleExpanded when the card is clicked', () => {
    const onToggleExpanded = vi.fn();
    const { container } = render(<MobileRepoCard {...baseProps({ onToggleExpanded })} />);
    fireEvent.click(getCard(container));
    expect(onToggleExpanded).toHaveBeenCalledOnce();
  });

  it('calls onToggleExpanded on Enter keydown', () => {
    const onToggleExpanded = vi.fn();
    const { container } = render(<MobileRepoCard {...baseProps({ onToggleExpanded })} />);
    fireEvent.keyDown(getCard(container), { key: 'Enter' });
    expect(onToggleExpanded).toHaveBeenCalledOnce();
  });

  it('calls onToggleExpanded on Space keydown', () => {
    const onToggleExpanded = vi.fn();
    const { container } = render(<MobileRepoCard {...baseProps({ onToggleExpanded })} />);
    fireEvent.keyDown(getCard(container), { key: ' ' });
    expect(onToggleExpanded).toHaveBeenCalledOnce();
  });

  it('renders ExpandableRow when isExpanded and details are provided', () => {
    render(<MobileRepoCard {...baseProps({ isExpanded: true, details: baseDetails })} />);
    expect(screen.getByTestId('expandable-row')).toBeTruthy();
  });

  it('does not render ExpandableRow when isExpanded but details absent', () => {
    render(<MobileRepoCard {...baseProps({ isExpanded: true, details: undefined })} />);
    expect(screen.queryByTestId('expandable-row')).toBeNull();
  });

  it('sets aria-expanded to true when expanded', () => {
    const { container } = render(<MobileRepoCard {...baseProps({ isExpanded: true, details: baseDetails })} />);
    expect(getCard(container).getAttribute('aria-expanded')).toBe('true');
  });

  it('sets aria-expanded to false when collapsed', () => {
    const { container } = render(<MobileRepoCard {...baseProps({ isExpanded: false })} />);
    expect(getCard(container).getAttribute('aria-expanded')).toBe('false');
  });
});

// ── Detail-loading skeletons ──────────────────────────────────────────────────

describe('MobileRepoCard – loading state', () => {
  it('shows loading skeleton when details are loading', () => {
    render(<MobileRepoCard {...baseProps({ isLoadingDetails: true })} />);
    expect(screen.getByLabelText('Loading docs')).toBeTruthy();
  });

  it('does not show loading skeleton when details have arrived', () => {
    render(<MobileRepoCard {...baseProps({ details: baseDetails, isLoadingDetails: false })} />);
    expect(screen.queryByLabelText('Loading docs')).toBeNull();
  });

  it('shows HealthBreakdown (not plain grade) when details are present', () => {
    render(<MobileRepoCard {...baseProps({ details: baseDetails })} />);
    expect(screen.getByTestId('health-breakdown')).toBeTruthy();
  });
});

// ── Authenticated actions ─────────────────────────────────────────────────────

describe('MobileRepoCard – authenticated actions', () => {
  it('shows sync button when authenticated', () => {
    render(<MobileRepoCard {...baseProps({ isAuthenticated: true })} />);
    expect(screen.getByTitle('Sync')).toBeTruthy();
  });

  it('hides sync button when not authenticated', () => {
    render(<MobileRepoCard {...baseProps({ isAuthenticated: false })} />);
    expect(screen.queryByTitle('Sync')).toBeNull();
  });

  it('calls onSyncSingleRepo when sync button is clicked', () => {
    const onSyncSingleRepo = vi.fn();
    render(<MobileRepoCard {...baseProps({ onSyncSingleRepo })} />);
    fireEvent.click(screen.getByTitle('Sync'));
    expect(onSyncSingleRepo).toHaveBeenCalledOnce();
  });

  it('shows hide button when authenticated', () => {
    render(<MobileRepoCard {...baseProps({ isAuthenticated: true })} />);
    expect(screen.getByTitle('Hide')).toBeTruthy();
  });

  it('hides hide button when not authenticated', () => {
    render(<MobileRepoCard {...baseProps({ isAuthenticated: false })} />);
    expect(screen.queryByTitle('Hide')).toBeNull();
  });

  it('calls onRemove when hide button is clicked', () => {
    const onRemove = vi.fn();
    render(<MobileRepoCard {...baseProps({ onRemove })} />);
    fireEvent.click(screen.getByTitle('Hide'));
    expect(onRemove).toHaveBeenCalledOnce();
  });
});

// ── Accessibility ─────────────────────────────────────────────────────────────

describe('MobileRepoCard – accessibility', () => {
  it('homepage link has an accessible name when homepage is set', () => {
    const repo = { ...baseRepo, homepage: 'https://my-repo.dev' };
    render(<MobileRepoCard {...baseProps({ repo })} />);
    const link = screen.getByRole('link', { name: /visit my-repo homepage/i });
    expect(link.getAttribute('href')).toBe('https://my-repo.dev');
  });

  it('shows restore button (not hide/sync) for hidden repos', () => {
    const repo = { ...baseRepo, is_hidden: true };
    render(<MobileRepoCard {...baseProps({ repo })} />);
    expect(screen.getByText('Restore')).toBeTruthy();
    expect(screen.queryByTitle('Hide')).toBeNull();
    expect(screen.queryByTitle('Sync')).toBeNull();
  });
});
