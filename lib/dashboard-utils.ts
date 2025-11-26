// Utility functions for dashboard display

export function getHealthGrade(score: number): { grade: string; color: string } {
  if (score >= 90) return { grade: 'A+', color: 'text-green-400' };
  if (score >= 80) return { grade: 'A', color: 'text-green-400' };
  if (score >= 70) return { grade: 'B', color: 'text-blue-400' };
  if (score >= 60) return { grade: 'C', color: 'text-yellow-400' };
  if (score >= 50) return { grade: 'D', color: 'text-orange-400' };
  return { grade: 'F', color: 'text-red-400' };
}

export function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return 'Never';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

export function getCommitFreshnessColor(dateString: string | null): string {
  if (!dateString) return 'text-slate-500';
  const now = new Date();
  const date = new Date(dateString);
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

  if (diffDays <= 7) return 'text-green-400';
  if (diffDays <= 30) return 'text-yellow-400';
  if (diffDays <= 90) return 'text-orange-400';
  return 'text-red-400';
}

export function getDocHealthColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

export function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    'web-app': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    game: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    tool: 'bg-green-500/20 text-green-400 border-green-500/30',
    library: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    bot: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    research: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    unknown: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  return colors[type] || colors.unknown;
}

export function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    TypeScript: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    JavaScript: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Python: 'bg-blue-600/20 text-blue-300 border-blue-600/30',
    Rust: 'bg-orange-600/20 text-orange-400 border-orange-600/30',
    Go: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    Java: 'bg-red-500/20 text-red-400 border-red-500/30',
    'C#': 'bg-purple-600/20 text-purple-400 border-purple-600/30',
    'C++': 'bg-pink-600/20 text-pink-400 border-pink-600/30',
    Ruby: 'bg-red-600/20 text-red-400 border-red-600/30',
    PHP: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    Swift: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    Kotlin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Dart: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    Scala: 'bg-red-700/20 text-red-400 border-red-700/30',
    Shell: 'bg-green-600/20 text-green-400 border-green-600/30',
  };
  return colors[language] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
}
