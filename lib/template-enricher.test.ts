import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mapDocType, buildEnrichmentPrompt, enrichTemplateWithAI } from './template-enricher';
import type { RepoContext } from './template-enricher';

vi.mock('@/lib/ai', () => ({
  generateAIContent: vi.fn(),
}));

vi.mock('@/lib/log', () => ({
  default: { warn: vi.fn(), debug: vi.fn(), info: vi.fn() },
}));

const { generateAIContent } = await import('@/lib/ai');

const repo: RepoContext = {
  full_name: 'acme/my-app',
  description: 'A test application',
  language: 'TypeScript',
  topics: ['nextjs', 'api'],
  homepage: 'https://myapp.example.com',
  created_at: '2023-06-15T12:00:00Z',
};

describe('mapDocType', () => {
  it.each([
    ['readme.md', 'readme'],
    ['README', 'readme'],
    ['roadmap.md', 'roadmap'],
    ['ROADMAP', 'roadmap'],
    ['tasks.md', 'tasks'],
    ['metrics.md', 'metrics'],
    ['features.md', 'features'],
    ['contributing.md', 'contributing'],
    ['security.md', 'security'],
    ['changelog.md', 'changelog'],
    ['.github/codeowners', 'codeowners'],
    ['bug_report.md', 'bug_report'],
    ['feature_request.md', 'feature_request'],
    ['pull_request_template.md', 'pr_template'],
    ['dependabot.yml', 'dependabot'],
    ['.env.example', 'env_example'],
    ['dockerfile', 'dockerfile'],
    ['.gitignore', 'gitignore'],
    ['license.md', 'license'],
    ['ci_cd', 'ci_cd'],
  ])('maps "%s" → "%s"', (input, expected) => {
    expect(mapDocType(input)).toBe(expected);
  });

  it('passes through unknown types unchanged', () => {
    expect(mapDocType('unknown_type')).toBe('unknown_type');
  });

  it('normalizes case', () => {
    expect(mapDocType('README.MD')).toBe('readme');
  });
});

describe('buildEnrichmentPrompt', () => {
  it('builds a prompt for readme type', () => {
    const prompt = buildEnrichmentPrompt('readme', '# Template', repo);
    expect(prompt).toContain('acme/my-app');
    expect(prompt).toContain('TypeScript');
  });

  it('builds a prompt for license with year from created_at', () => {
    const prompt = buildEnrichmentPrompt('license', 'MIT License [year] [fullname]', repo);
    expect(prompt).toContain('2023');
    expect(prompt).toContain('acme');
  });

  it('returns null for unsupported doc type', () => {
    const result = buildEnrichmentPrompt('unknown_xyz', '# Template', repo);
    expect(result).toBeNull();
  });

  it('includes repo topics in features prompt', () => {
    const prompt = buildEnrichmentPrompt('features', '', repo);
    expect(prompt).toContain('nextjs');
    expect(prompt).toContain('api');
  });

  it('includes owner in codeowners prompt', () => {
    const prompt = buildEnrichmentPrompt('codeowners', '', repo);
    expect(prompt).toContain('@acme');
  });

  it.each([
    'code_of_conduct', 'bug_report', 'feature_request', 'dockerfile',
    'env_example', 'gitignore', 'pre_commit_hooks', 'testing_framework', 'linting',
  ])('returns non-null prompt for type "%s"', (docType) => {
    const result = buildEnrichmentPrompt(docType, '# placeholder', repo);
    expect(result).not.toBeNull();
  });

  it('handles null language and empty topics without rendering "null"', () => {
    const nullLangRepo = { ...repo, language: null, topics: [] };
    const prompt = buildEnrichmentPrompt('metrics', '', nullLangRepo);
    expect(prompt).not.toContain('relevant to null');
    expect(prompt).not.toContain('patterns for null');
  });

  it('snapshot: roadmap prompt', () => {
    const prompt = buildEnrichmentPrompt('roadmap', '# Roadmap\n## TODO', repo);
    expect(prompt).toMatchSnapshot();
  });

  it('snapshot: tasks prompt', () => {
    const prompt = buildEnrichmentPrompt('tasks', '## Todo\n- [ ] Task 1', repo);
    expect(prompt).toMatchSnapshot();
  });

  it('snapshot: ci_cd prompt', () => {
    const prompt = buildEnrichmentPrompt('ci_cd', 'name: CI', repo);
    expect(prompt).toMatchSnapshot();
  });
});

describe('enrichTemplateWithAI', () => {
  beforeEach(() => {
    vi.mocked(generateAIContent).mockReset();
  });

  it('returns enriched content from AI', async () => {
    vi.mocked(generateAIContent).mockResolvedValue('# Enriched README');
    const result = await enrichTemplateWithAI('readme', '# Template', repo);
    expect(result).toBe('# Enriched README');
  });

  it('strips markdown code fences from AI response', async () => {
    vi.mocked(generateAIContent).mockResolvedValue('```markdown\n# README\n```');
    const result = await enrichTemplateWithAI('readme', '# Template', repo);
    expect(result).toBe('# README');
  });

  it('strips opening code fence with language label', async () => {
    vi.mocked(generateAIContent).mockResolvedValue('```yaml\nkey: value\n```');
    const result = await enrichTemplateWithAI('dependabot', 'key: placeholder', repo);
    expect(result).toBe('key: value');
  });

  it('falls back to original template when AI throws', async () => {
    vi.mocked(generateAIContent).mockRejectedValue(new Error('API error'));
    const result = await enrichTemplateWithAI('readme', '# Original', repo);
    expect(result).toBe('# Original');
  });

  it('returns original template for unsupported doc type', async () => {
    const result = await enrichTemplateWithAI('unknown_xyz', '# Original', repo);
    expect(result).toBe('# Original');
    expect(generateAIContent).not.toHaveBeenCalled();
  });

  it('normalizes CRLF line endings in AI response', async () => {
    vi.mocked(generateAIContent).mockResolvedValue('line1\r\nline2\r\nline3');
    const result = await enrichTemplateWithAI('readme', '', repo);
    expect(result).not.toContain('\r\n');
    expect(result).toContain('line1\nline2');
  });

  it('falls back to original when AI returns empty fenced block', async () => {
    vi.mocked(generateAIContent).mockResolvedValue('```markdown\n```');
    const result = await enrichTemplateWithAI('readme', '# Original', repo);
    expect(result).toBe('# Original');
  });

  it('falls back to original when AI returns empty string', async () => {
    vi.mocked(generateAIContent).mockResolvedValue('');
    const result = await enrichTemplateWithAI('readme', '# Original', repo);
    expect(result).toBe('# Original');
  });
});
