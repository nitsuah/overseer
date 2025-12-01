// Utility functions for repo table row component

import { RepoType } from '@/lib/repo-type';

/**
 * Get icon emoji based on repository type
 */
export function getTypeIcon(type: RepoType): string {
  const iconMap: Record<RepoType, string> = {
    'web-app': '🌐',
    'game': '🎮',
    'tool': '🔧',
    'library': '📦',
    'bot': '🤖',
    'research': '🔬',
    'unknown': '📄',
  };
  return iconMap[type];
}
