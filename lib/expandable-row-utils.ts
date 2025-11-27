// Utility functions for ExpandableRow component

import { Task, RoadmapItem } from '@/types/repo';

export function groupByQuarter(items: RoadmapItem[]): Record<string, RoadmapItem[]> {
  const grouped: Record<string, RoadmapItem[]> = {};
  items.forEach((item) => {
    const quarter = item.quarter || 'Other';
    if (!grouped[quarter]) grouped[quarter] = [];
    grouped[quarter].push(item);
  });
  return grouped;
}

export function groupBySubsection(items: Task[]): Record<string, Task[]> {
  const grouped: Record<string, Task[]> = {};
  items.forEach((item) => {
    const subsection = item.subsection || 'Other';
    if (!grouped[subsection]) grouped[subsection] = [];
    grouped[subsection].push(item);
  });
  return grouped;
}

export function getDisplayedItems<T>(
  items: T[],
  section: string,
  expandedSections: Set<string>,
  limit: number = 5
): T[] {
  return expandedSections.has(section) ? items : items.slice(0, limit);
}

export function getStatusIcon(status: string) {
  switch (status) {
    case 'present':
    case 'healthy':
      return { icon: 'CheckCircle2', color: 'text-green-400' };
    case 'missing':
      return { icon: 'XCircle', color: 'text-red-400' };
    case 'dormant':
      return { icon: 'Clock', color: 'text-yellow-400' };
    case 'malformed':
      return { icon: 'AlertCircle', color: 'text-orange-400' };
    default:
      return { icon: 'Circle', color: 'text-slate-500' };
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'present':
    case 'healthy':
      return 'text-green-400';
    case 'missing':
      return 'text-red-400';
    case 'dormant':
      return 'text-yellow-400';
    case 'malformed':
      return 'text-orange-400';
    default:
      return 'text-slate-400';
  }
}

export function getStandardLabel(type: string): string {
  switch (type) {
    case 'code_of_conduct':
      return 'Code of Conduct';
    case 'contributing':
      return 'Contributing Guide';
    case 'security':
      return 'Security Policy';
    case 'license':
      return 'License';
    case 'changelog':
      return 'Changelog';
    case 'issue_template':
      return 'Issue Template';
    case 'pr_template':
      return 'PR Template';
    default:
      return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }
}

export function formatLocNumber(loc?: number): string {
  if (!loc) return 'N/A';
  if (loc >= 1000) {
    return `${(loc / 1000).toFixed(1)}K`;
  }
  return loc.toLocaleString();
}

export function getReadmeFreshness(readmeLastUpdated?: string | null): {
  daysSince: number;
  color: string;
  label: string;
} {
  if (!readmeLastUpdated) {
    return { daysSince: 0, color: 'text-slate-400', label: 'Unknown' };
  }

  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(readmeLastUpdated).getTime()) / (1000 * 60 * 60 * 24)
  );

  const freshnessColor =
    daysSinceUpdate < 30
      ? 'text-green-400'
      : daysSinceUpdate < 90
      ? 'text-blue-400'
      : daysSinceUpdate < 180
      ? 'text-yellow-400'
      : 'text-red-400';

  const freshnessLabel =
    daysSinceUpdate < 30
      ? 'Fresh'
      : daysSinceUpdate < 90
      ? 'Recent'
      : daysSinceUpdate < 180
      ? 'Aging'
      : 'Stale';

  return { daysSince: daysSinceUpdate, color: freshnessColor, label: freshnessLabel };
}
