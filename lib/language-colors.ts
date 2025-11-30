/**
 * Get color styling for programming languages
 * Based on GitHub's language colors
 */

export function getLanguageIcon(language: string | null): string {
    if (!language) return '📄';

    const icons: Record<string, string> = {
        // Popular languages
        'TypeScript': 'TS',
        'JavaScript': 'JS',
        'Python': 'PY',
        'Java': '☕',
        'Go': 'GO',
        'Rust': '🦀',
        'C++': 'C++',
        'C': 'C',
        'C#': 'C#',
        'PHP': 'PHP',
        'Ruby': '💎',
        'Swift': '🐦',
        'Kotlin': 'KT',
        'Dart': '🎯',

        // Web technologies
        'HTML': 'HTML',
        'CSS': 'CSS',
        'SCSS': 'SCSS',
        'Sass': 'SASS',
        'Less': 'LESS',

        // Data & Config
        'SQL': 'SQL',
        'Shell': 'SH',
        'PowerShell': 'PS',
        'YAML': 'YML',
        'JSON': 'JSON',
        'TOML': 'TOML',

        // Other
        'Vue': '🖖',
        'Dockerfile': '🐳',
        'Makefile': '🔨',
        'Markdown': 'MD',
        'Jupyter Notebook': '📓',
    };

    return icons[language] || language.substring(0, 2).toUpperCase();
}

export function getLanguageColor(language: string | null): string {
    if (!language) return 'bg-slate-900/30 text-slate-300 border-slate-800';

    const colors: Record<string, string> = {
        // Popular languages
        'TypeScript': 'bg-blue-900/30 text-blue-300 border-blue-800',
        'JavaScript': 'bg-yellow-900/30 text-yellow-300 border-yellow-800',
        'Python': 'bg-cyan-900/30 text-cyan-300 border-cyan-800',
        'Java': 'bg-orange-900/30 text-orange-300 border-orange-800',
        'Go': 'bg-teal-900/30 text-teal-300 border-teal-800',
        'Rust': 'bg-amber-900/30 text-amber-300 border-amber-800',
        'C++': 'bg-blue-900/30 text-blue-300 border-blue-800',
        'C': 'bg-slate-900/30 text-slate-300 border-slate-800',
        'C#': 'bg-purple-900/30 text-purple-300 border-purple-800',
        'PHP': 'bg-indigo-900/30 text-indigo-300 border-indigo-800',
        'Ruby': 'bg-red-900/30 text-red-300 border-red-800',
        'Swift': 'bg-orange-900/30 text-orange-300 border-orange-800',
        'Kotlin': 'bg-purple-900/30 text-purple-300 border-purple-800',
        'Dart': 'bg-blue-900/30 text-blue-300 border-blue-800',

        // Web technologies
        'HTML': 'bg-orange-900/30 text-orange-300 border-orange-800',
        'CSS': 'bg-blue-900/30 text-blue-300 border-blue-800',
        'SCSS': 'bg-pink-900/30 text-pink-300 border-pink-800',
        'Sass': 'bg-pink-900/30 text-pink-300 border-pink-800',
        'Less': 'bg-blue-900/30 text-blue-300 border-blue-800',

        // Data & Config
        'SQL': 'bg-sky-900/30 text-sky-300 border-sky-800',
        'Shell': 'bg-green-900/30 text-green-300 border-green-800',
        'PowerShell': 'bg-blue-900/30 text-blue-300 border-blue-800',
        'YAML': 'bg-red-900/30 text-red-300 border-red-800',
        'JSON': 'bg-gray-900/30 text-gray-300 border-gray-800',
        'TOML': 'bg-slate-900/30 text-slate-300 border-slate-800',

        // Other
        'Vue': 'bg-green-900/30 text-green-300 border-green-800',
        'Dockerfile': 'bg-blue-900/30 text-blue-300 border-blue-800',
        'Makefile': 'bg-amber-900/30 text-amber-300 border-amber-800',
        'Markdown': 'bg-slate-900/30 text-slate-300 border-slate-800',
        'Jupyter Notebook': 'bg-orange-900/30 text-orange-300 border-orange-800',
    };

    return colors[language] || 'bg-slate-900/30 text-slate-300 border-slate-800';
}
