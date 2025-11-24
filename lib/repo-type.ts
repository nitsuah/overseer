export type RepoType = 'web-app' | 'game' | 'tool' | 'library' | 'bot' | 'research' | 'unknown';

export interface RepoTypeInfo {
    type: RepoType;
    icon: string;
    color: string;
}

export function detectRepoType(
    name: string,
    description: string | null,
    language: string | null,
    topics: string[]
): RepoTypeInfo {
    const lowerName = name.toLowerCase();
    const lowerDesc = (description || '').toLowerCase();
    const lowerTopics = topics.map((t) => t.toLowerCase());

    // Game detection
    if (
        lowerName.includes('game') ||
        lowerDesc.includes('game') ||
        lowerTopics.includes('game') ||
        lowerTopics.includes('phaser') ||
        lowerName === 'games' ||
        lowerName === 'darkmoon'
    ) {
        return { type: 'game', icon: '🎮', color: 'purple' };
    }

    // Bot detection
    if (
        lowerName.includes('bot') ||
        lowerDesc.includes('bot') ||
        lowerTopics.includes('bot') ||
        lowerName === 'osrs'
    ) {
        return { type: 'bot', icon: '🤖', color: 'cyan' };
    }

    // Web app detection
    if (
        lowerTopics.includes('nextjs') ||
        lowerTopics.includes('react') ||
        lowerTopics.includes('vue') ||
        lowerTopics.includes('website') ||
        lowerTopics.includes('portfolio') ||
        lowerName.includes('io') ||
        lowerName.includes('web')
    ) {
        return { type: 'web-app', icon: '🌐', color: 'blue' };
    }

    // Tool detection
    if (
        lowerDesc.includes('tool') ||
        lowerDesc.includes('cli') ||
        lowerDesc.includes('utility') ||
        lowerTopics.includes('cli') ||
        lowerTopics.includes('tool') ||
        lowerName === 'kryptos' ||
        lowerName === 'gcp'
    ) {
        return { type: 'tool', icon: '🔧', color: 'orange' };
    }

    // Library detection
    if (
        lowerDesc.includes('library') ||
        lowerDesc.includes('package') ||
        lowerTopics.includes('library') ||
        lowerTopics.includes('npm-package')
    ) {
        return { type: 'library', icon: '📦', color: 'green' };
    }

    // Research detection
    if (
        lowerDesc.includes('research') ||
        lowerDesc.includes('experiment') ||
        lowerTopics.includes('research')
    ) {
        return { type: 'research', icon: '🔬', color: 'pink' };
    }

    // Default
    return { type: 'unknown', icon: '📄', color: 'gray' };
}

export function getTypeColor(type: RepoType): string {
    const colors: Record<RepoType, string> = {
        'web-app': 'bg-blue-900/30 text-blue-300 border-blue-800',
        game: 'bg-purple-900/30 text-purple-300 border-purple-800',
        tool: 'bg-orange-900/30 text-orange-300 border-orange-800',
        library: 'bg-green-900/30 text-green-300 border-green-800',
        bot: 'bg-cyan-900/30 text-cyan-300 border-cyan-800',
        research: 'bg-pink-900/30 text-pink-300 border-pink-800',
        unknown: 'bg-slate-900/30 text-slate-300 border-slate-800',
    };
    return colors[type];
}
