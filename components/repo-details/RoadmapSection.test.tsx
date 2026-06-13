import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
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
});
