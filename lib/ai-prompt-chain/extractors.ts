export function extractBadges(readme: string): string[] {
  const badgeRegex = /\[!\[.*?\]\(.*?\)\]\(.*?\)/g;
  return readme.match(badgeRegex) || [];
}

export function extractBuildSteps(readme: string): string {
  const sections = ['installation', 'getting started', 'setup', 'building', 'development'];
  const lines = readme.toLowerCase().split('\n');
  let capturing = false;
  const steps: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (sections.some((s) => line.includes(`## ${s}`) || line.includes(`### ${s}`))) {
      capturing = true;
      continue;
    }
    if (capturing && (line.startsWith('## ') || line.startsWith('### '))) break;
    if (capturing) steps.push(readme.split('\n')[i]);
  }

  return steps.join('\n');
}

export function extractEnvVarMentions(readme: string): string[] {
  const envVarRegex = /\b[A-Z][A-Z0-9_]+\b|process\.env\.([A-Z_]+)|\$([A-Z_]+)/g;
  const matches = readme.match(envVarRegex) || [];

  const vars = new Set<string>();
  matches.forEach((match) => {
    const cleaned = match.replaceAll('process.env.', '').replaceAll('$', '');
    if (cleaned.length > 1 && /^[A-Z]/.test(cleaned)) vars.add(cleaned);
  });

  return Array.from(vars);
}
