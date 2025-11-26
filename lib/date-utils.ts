
export function formatTimeAgo(dateString: string | null | undefined): string {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1d ago';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${diffMonths}M ago`;
    return `${diffYears}Y ago`;
}

export function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

export function getCommitFreshnessColor(dateString: string | null | undefined): string {
    if (!dateString) return 'text-slate-500';

    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 7) return 'text-green-400';
    if (diffDays < 30) return 'text-yellow-400';
    if (diffDays < 90) return 'text-orange-400';
    return 'text-red-400';
}

export function getReadmeFreshnessColor(dateString: string | null | undefined): string {
    if (!dateString) return 'text-slate-500';

    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return 'text-green-400'; // Fresh (< 1 month)
    if (diffDays < 90) return 'text-yellow-400'; // Aging (1-3 months)
    if (diffDays < 180) return 'text-orange-400'; // Stale (3-6 months)
    return 'text-red-400'; // Old (> 6 months)
}

export function getFreshnessLabel(dateString: string | null | undefined): string {
    if (!dateString) return 'Missing';

    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return 'Fresh';
    if (diffDays < 90) return 'Aging';
    if (diffDays < 180) return 'Stale';
    return 'Old';
}
