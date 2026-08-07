import { generateAIContent } from '@/lib/ai';
import logger from '@/lib/log';

export type RepoContext = {
  full_name: string;
  description: string | null;
  language: string | null;
  topics: string[];
  homepage: string | null;
  created_at: string;
};

const NO_HALLUCINATION_CONSTRAINT = `\nImportant constraints:\n- Do NOT invent facts, metrics, features, services, credentials, or URLs.\n- If information is unknown, omit the item or use a clearly marked placeholder (e.g., TODO: VALUE_NEEDED).\n- Keep output concise, scannable, and production-ready.`;

export function mapDocType(input: string): string {
  const t = (input || '').toLowerCase().trim();
  const mapping: Record<string, string> = {
    'roadmap.md': 'roadmap',
    'roadmap': 'roadmap',
    'tasks.md': 'tasks',
    'tasks': 'tasks',
    'metrics.md': 'metrics',
    'metrics': 'metrics',
    'features.md': 'features',
    'features': 'features',
    'readme': 'readme',
    'readme.md': 'readme',
    'contributing': 'contributing',
    'contributing.md': 'contributing',
    'security': 'security',
    'security.md': 'security',
    'changelog': 'changelog',
    'changelog.md': 'changelog',
    'codeowners': 'codeowners',
    '.github/codeowners': 'codeowners',
    'code_of_conduct': 'code_of_conduct',
    'code_of_conduct.md': 'code_of_conduct',
    'issue_template': 'bug_report',
    'issue_templates': 'issue_templates',
    '.github/issue_template/': 'issue_templates',
    'bug_report': 'bug_report',
    'bug_report.md': 'bug_report',
    '.github/issue_template/bug_report.md': 'bug_report',
    'feature_request': 'feature_request',
    'feature_request.md': 'feature_request',
    '.github/issue_template/feature_request.md': 'feature_request',
    'pull_request_template.md': 'pr_template',
    'pr_template': 'pr_template',
    'copilot_instructions': 'copilot_instructions',
    '.github/copilot-instructions.md': 'copilot_instructions',
    'funding': 'funding',
    'funding.yml': 'funding',
    'dependabot': 'dependabot',
    'dependabot.yml': 'dependabot',
    'env_example': 'env_example',
    '.env.example': 'env_example',
    'env_template': 'env_example',
    'dockerfile': 'dockerfile',
    'docker': 'dockerfile',
    'docker-compose.yml': 'docker_compose',
    'netlify_badge': 'netlify_badge',
    'license': 'license',
    'license.md': 'license',
    'ci_cd': 'ci_cd',
    '.github/workflows/ci.yml': 'ci_cd',
    'gitignore': 'gitignore',
    '.gitignore': 'gitignore',
    'pre_commit_hooks': 'pre_commit_hooks',
    '.pre-commit-config.yaml': 'pre_commit_hooks',
    'testing_framework': 'testing_framework',
    'vitest.config.ts': 'testing_framework',
    'linting': 'linting',
    'eslint.config.mjs': 'linting',
  };
  return Object.hasOwn(mapping, t) ? mapping[t] : t;
}

function buildRepoInfo(repo: RepoContext): string {
  return `Repository: ${repo.full_name}
Description: ${repo.description || 'No description'}
Primary Language: ${repo.language || 'Unknown'}
Topics: ${repo.topics?.join(', ') || 'None'}
Homepage: ${repo.homepage || 'None'}`.trim();
}

function currentContent(templateContent: string, fence = 'markdown'): string {
  return templateContent.trim().length > 0
    ? `Current template content:\n\`\`\`${fence}\n${templateContent}\n\`\`\``
    : 'Starting with empty/minimal template.';
}

export function buildEnrichmentPrompt(
  type: string,
  templateContent: string,
  repo: RepoContext
): string | null {
  const repoInfo = buildRepoInfo(repo);
  const owner = repo.full_name.split('/')[0];

  switch (type) {
    case 'codeowners':
      return `You are enriching a GitHub CODEOWNERS file for a repository.

${repoInfo}

${currentContent(templateContent, '')}

Your task:
1. Create a complete, production-ready CODEOWNERS file for ${repo.full_name}
2. Replace any @OWNER_USERNAME placeholders with @${owner}
3. Define ownership rules based on the repository type and language:
   - For ${repo.language || 'this'} projects, include appropriate directory patterns
   - Add rules for common directories: /docs/, /tests/, /.github/, /src/, /lib/, /app/, /components/
   - Add rules for configuration files: *.json, *.yml, *.yaml, *.toml
   - Add rules for documentation: *.md files
4. Include helpful comments explaining each section
5. Set @${owner} as the default owner for everything not specifically assigned

Format:
- Use # for comments
- Use patterns like /path/ for directories
- Use *.extension for file types
- Use /* @username for directory ownership
- Add blank lines between sections for readability

Return ONLY the complete CODEOWNERS file content, with no markdown code fences or explanations.${NO_HALLUCINATION_CONSTRAINT}`;

    case 'roadmap':
      return `You are enriching a repository ROADMAP.md.

${repoInfo}

${currentContent(templateContent)}

Your task:
1. Produce a practical, actionable roadmap tailored to ${repo.full_name}.
2. Organize into Near Term (0-3 months), Mid Term (3-6 months), and Long Term (6-12 months).
3. For each item provide: goal, rationale, rough scope, success criteria, and risks.
4. Align with the repository's tech stack and domain (language: ${repo.language || 'unknown'}, topics: ${repo.topics?.join(', ') || 'none'}).
5. Keep it concise and scannable; use headings and bullet lists.
6. Include a final section for "Completed Milestones" with placeholders if none.

Format:
- Markdown only (no code fences or extra commentary).
- Use top-level heading "Roadmap" and subsections for each time horizon.
- Use bullets with bold short titles followed by brief descriptions.

Return ONLY the Markdown content for ROADMAP.md.${NO_HALLUCINATION_CONSTRAINT}`;

    case 'tasks':
      return `You are enriching a repository TASKS.md (project tasks/backlog).

${repoInfo}

Current template structure:
\`\`\`markdown
${templateContent}
\`\`\`

CRITICAL: PRESERVE section headers (## Todo, ## In Progress, ## Done) and format (- [ ]). ONLY change task descriptions.

Your task:
1. Replace placeholders with 8-15 real tasks for ${repo.full_name}
2. Keep same sections, format: - [ ] Description (P1/P2/P3, S/M/L)
3. Language: ${repo.language || 'unknown'}, Topics: ${repo.topics?.join(', ') || 'none'}

Return template with ONLY task text changed.${NO_HALLUCINATION_CONSTRAINT}`;

    case 'metrics':
      return `You are creating METRICS.md for ${repo.full_name}.

${repoInfo}

IMPORTANT: Generate REAL metric definitions specific to ${repo.language || 'this'} projects. Do NOT copy template placeholders.

Your task:
1. Define 8-12 key metrics for ${repo.full_name}:
   - Test coverage, test count, CI/CD status
   - Code quality (LOC, complexity, vulnerabilities)
   - Performance metrics relevant to ${repo.language || 'this'}
   - Build/deployment metrics
2. Create a metrics table with columns: Metric | Current | Target | Status
3. Add "How to Update" section with specific commands for ${repo.language || 'this'}
4. Use placeholder values like "TBD" or "0%" for current values

Return ONLY complete Markdown for METRICS.md with REAL metrics.${NO_HALLUCINATION_CONSTRAINT}`;

    case 'features':
      return `You are creating FEATURES.md for ${repo.full_name}.

${repoInfo}

IMPORTANT: Generate SPECIFIC features for this repository. Do NOT copy generic template text.

Your task:
1. Generate 15-25 CONCRETE features for ${repo.full_name} based on:
   - Language: ${repo.language || 'unknown'}
   - Topics: ${repo.topics?.join(', ') || 'none'}
   - Description: ${repo.description || 'No description'}
2. Group by: Core Functionality, Integrations, UI/UX, DevOps/Infrastructure, Security, Developer Experience
3. Format: - **Feature Name** - One-line description

Example (generate YOUR OWN):
## Core Functionality
- **Real-time Sync** - WebSocket-based live updates across clients
- **Batch Processing** - Queue system for handling large file uploads

Return ONLY complete Markdown for FEATURES.md with REAL features.${NO_HALLUCINATION_CONSTRAINT}`;

    case 'readme':
    case 'readme.md':
      return `You are enriching README.md.

${repoInfo}

${currentContent(templateContent)}

Your task:
1. Produce a clean README with sections: Overview, Features, Tech Stack, Getting Started, Scripts, Environment, Testing, Deployment, Contributing, License.
2. Keep commands copyable and minimal; avoid filler.
3. Align content with the project's language and stack.

Return ONLY the Markdown for README.md.${NO_HALLUCINATION_CONSTRAINT}`;

    case 'contributing':
    case 'contributing.md':
      return `You are enriching CONTRIBUTING.md.

${repoInfo}

${currentContent(templateContent)}

Your task:
1. Include sections: Code of Conduct reference, Issues, PRs, Branching, Commit messages, Testing, Linting, Releases.
2. Provide concise steps and expectations.

Return ONLY the Markdown for CONTRIBUTING.md.${NO_HALLUCINATION_CONSTRAINT}`;

    case 'security':
    case 'security.md':
      return `You are enriching SECURITY.md.

${repoInfo}

${currentContent(templateContent)}

Your task:
1. Define vulnerability disclosure process, supported versions, reporting channels, response expectations.
2. Keep tone professional; concise actionable steps.

Return ONLY the Markdown for SECURITY.md.${NO_HALLUCINATION_CONSTRAINT}`;

    case 'changelog':
    case 'changelog.md':
      return `You are enriching CHANGELOG.md following Keep a Changelog.

${repoInfo}

${currentContent(templateContent)}

Your task:
1. Provide structure with Unreleased, Added/Changed/Fixed sections.
2. Populate initial entries consistent with project domain.

Return ONLY the Markdown for CHANGELOG.md.${NO_HALLUCINATION_CONSTRAINT}`;

    case 'bug_report':
      return `You are creating a GitHub bug report issue template for ${repo.full_name}.

${repoInfo}

${
  templateContent.trim().length > 0
    ? `Current template:\n\`\`\`markdown\n${templateContent}\n\`\`\``
    : 'Starting from minimal template.'
}

Your task:
1. Create a structured bug report template with YAML frontmatter:
   - name: "Bug Report"
   - about: "Report a bug in ${repo.full_name}"
   - title: "[BUG] "
   - labels: bug
2. Include sections:
   - **Description**: What happened?
   - **Steps to Reproduce**: Numbered list
   - **Expected Behavior**: What should happen
   - **Actual Behavior**: What actually happens
   - **Environment**: OS, ${repo.language || 'language'} version, browser (if web app)
   - **Screenshots**: Optional
   - **Additional Context**: Any other info
3. Use GitHub markdown formatting with checkboxes where helpful
4. Tailor environment fields to ${repo.language || 'the tech stack'}

Return ONLY the complete Markdown template with YAML frontmatter.${NO_HALLUCINATION_CONSTRAINT}`;

    case 'feature_request':
      return `You are creating a GitHub feature request issue template for ${repo.full_name}.

${repoInfo}

${
  templateContent.trim().length > 0
    ? `Current template:\n\`\`\`markdown\n${templateContent}\n\`\`\``
    : 'Starting from minimal template.'
}

Your task:
1. Create a structured feature request template with YAML frontmatter:
   - name: "Feature Request"
   - about: "Suggest a feature for ${repo.full_name}"
   - title: "[FEATURE] "
   - labels: enhancement
2. Include sections:
   - **Problem**: What problem does this solve?
   - **Proposed Solution**: Describe the feature
   - **Alternatives Considered**: Other approaches
   - **Use Cases**: Who benefits and how
   - **Implementation Notes**: Technical considerations (optional)
3. Keep it concise and actionable

Return ONLY the complete Markdown template with YAML frontmatter.${NO_HALLUCINATION_CONSTRAINT}`;

    case 'issue_templates':
      return `You are generating GitHub issue templates (Bug Report and Feature Request).

${repoInfo}

Your task:
1. Output two Markdown files separated by a clear divider line: BUG_REPORT.md and FEATURE_REQUEST.md.
2. Include fields: title, description, steps, expected/actual, environment for bugs; problem, proposal, alternatives for features.

Return ONLY the combined Markdown content for the two templates.${NO_HALLUCINATION_CONSTRAINT}`;

    case 'pr_template':
      return `You are enriching a GitHub pull_request_template.md.

${repoInfo}

${currentContent(templateContent)}

Your task:
1. Create a concise PR template with sections: Summary, Changes, Testing, Screenshots (optional), Checklist.

Return ONLY the Markdown for pull_request_template.md.${NO_HALLUCINATION_CONSTRAINT}`;

    case 'copilot_instructions':
      return `You are enriching .github/copilot-instructions.md for AI assistance.

${repoInfo}

${currentContent(templateContent)}

Your task:
1. Provide clear guardrails: coding style, file paths, tests, commit conventions, and what to avoid.
2. Include examples of good vs bad changes.

Return ONLY the Markdown for copilot-instructions.md.${NO_HALLUCINATION_CONSTRAINT}`;

    case 'funding':
    case 'funding.yml':
      return `You are enriching .github/FUNDING.yml.

${repoInfo}

${currentContent(templateContent, 'yaml')}

Your task:
1. Provide a valid FUNDING.yml with keys (github, patreon, open_collective) as applicable.
2. Use placeholder handles where unknown.

Return ONLY the YAML for FUNDING.yml.${NO_HALLUCINATION_CONSTRAINT}`;

    case 'dependabot':
    case 'dependabot.yml':
      return `You are enriching .github/dependabot.yml for ${repo.full_name}.

${repoInfo}

${currentContent(templateContent, 'yaml')}

Your task:
1. Produce a valid Dependabot config with updates for npm (or relevant ecosystem), schedule (weekly), and security updates.
2. Tailor ecosystem to the repo's language (${repo.language || 'unknown'}).
3. Keep YAML concise and valid.

Return ONLY the YAML for .github/dependabot.yml.${NO_HALLUCINATION_CONSTRAINT}`;

    case 'env_example':
    case '.env.example':
      return `You are creating .env.example for ${repo.full_name}.

${repoInfo}

${currentContent(templateContent, '')}

Your task:
1. Create environment variables appropriate for a ${repo.language || 'unknown language'} project
2. Based on common patterns for ${repo.language || 'unknown language'}:
   - Node.js/TypeScript: PORT, NODE_ENV, DATABASE_URL, API keys
   - Python: FLASK_ENV/DJANGO_SETTINGS, DATABASE_URL, SECRET_KEY
   - Go: PORT, DATABASE_URL, environment flags
   - Ruby: RAILS_ENV, DATABASE_URL, SECRET_KEY_BASE
3. Include sections with comments:
   # Application
   # Database
   # Authentication & Security
   # External APIs
   # Runtime Configuration
4. Use descriptive placeholder values (e.g., DATABASE_URL=postgresql://user:pass@localhost:5432/dbname)
5. Add helpful inline comments for complex variables

Return ONLY the plain text for .env.example (no markdown code fences).${NO_HALLUCINATION_CONSTRAINT}`;

    case 'dockerfile':
      return `You are creating a production-ready Dockerfile for ${repo.full_name}.

${repoInfo}

${currentContent(templateContent, 'Dockerfile')}

Your task:
1. Create a Dockerfile optimized for ${repo.language || 'the primary language'}:
   - **Node.js/TypeScript**: Multi-stage with node:alpine, npm ci, production build, non-root user
   - **Python**: python:slim base, pip install with --no-cache-dir, requirements.txt, non-root user
   - **Go**: Multi-stage with golang:alpine for build, scratch/alpine for runtime
   - **Ruby**: ruby:alpine, bundle install with --without development test
   - **Java**: openjdk/maven multi-stage, JAR execution
2. Best practices:
   - Use multi-stage builds to minimize image size
   - Copy dependency files first for better caching
   - Set appropriate environment variables (NODE_ENV=production, etc.)
   - Run as non-root user
   - EXPOSE appropriate port
   - Use HEALTHCHECK if applicable
3. Add helpful comments explaining each stage
4. Keep it production-ready but not over-engineered

Return ONLY the Dockerfile content (no markdown code fences).${NO_HALLUCINATION_CONSTRAINT}`;

    case 'docker_compose':
    case 'docker-compose.yml':
      return `You are enriching docker-compose.yml.

${repoInfo}

${currentContent(templateContent, 'yaml')}

Your task:
1. Provide services appropriate for ${repo.full_name} (app, db if needed), volumes, ports, and env.
2. Keep YAML valid and minimal.

Return ONLY the YAML for docker-compose.yml.${NO_HALLUCINATION_CONSTRAINT}`;

    case 'netlify_badge':
      return `You are enriching a README snippet to include a Netlify badge and deployment info.

${repoInfo}

${currentContent(templateContent)}

Your task:
1. Produce a small Markdown section including Netlify deploy badge, live URL (use homepage if available), and brief deployment notes.
2. Keep it concise and copy-pasteable.

Return ONLY the Markdown snippet.${NO_HALLUCINATION_CONSTRAINT}`;

    case 'code_of_conduct': {
      return `You are enriching CODE_OF_CONDUCT.md for ${repo.full_name}.

${repoInfo}

Current template:
\`\`\`markdown
${templateContent}
\`\`\`

CRITICAL: This is a standard Contributor Covenant template. PRESERVE ALL structure and text.

ONLY make these minimal changes:
1. Replace "TODO: EMAIL_ADDRESS" with a real email if available, or keep the GitHub contact
2. Replace any [Project Name] placeholders with "${repo.full_name}"
3. Ensure @${owner} is mentioned as contact
4. Keep ALL sections, headings, and bullet formatting EXACTLY as-is

Return the template with MINIMAL changes (placeholders only).${NO_HALLUCINATION_CONSTRAINT}`;
    }

    case 'license': {
      const parsedDate = new Date(repo.created_at);
      const createdYear = isNaN(parsedDate.getTime())
        ? new Date().getUTCFullYear()
        : parsedDate.getUTCFullYear();
      return `You are filling in placeholders in an MIT LICENSE template.

${repoInfo}

Current template:
\`\`\`
${templateContent}
\`\`\`

Your task:
1. Replace [year] with the repository creation year: ${createdYear}
2. Replace [fullname] with the repository owner: ${owner}
3. Keep ALL other license text exactly as-is - do not modify the MIT License terms
4. Do NOT add any extra text, explanations, or markdown formatting

Return ONLY the complete LICENSE file with placeholders filled in.${NO_HALLUCINATION_CONSTRAINT}`;
    }

    case 'ci_cd':
      return `You are creating a GitHub Actions CI/CD workflow for ${repo.full_name}.

${repoInfo}

Current template:
\`\`\`yaml
${templateContent}
\`\`\`

Your task:
1. Customize the workflow for a ${repo.language || 'generic'} project
2. Include appropriate setup actions (e.g., setup-node, setup-python, setup-go)
3. Add steps for installing dependencies based on the language
4. Include linting, testing, and build steps
5. Configure to run on push to main and pull requests
6. Use appropriate version numbers (Node 18+, Python 3.9+, etc.)
7. Add caching for faster builds if applicable

Return ONLY the complete workflow YAML file content, no markdown fences.${NO_HALLUCINATION_CONSTRAINT}`;

    case 'gitignore':
      return `You are creating a .gitignore file for ${repo.full_name}.

${repoInfo}

Current template:
\`\`\`
${templateContent}
\`\`\`

Your task:
1. Customize for a ${repo.language || 'generic'} project
2. Include language-specific patterns (node_modules, __pycache__, target/, etc.)
3. Add IDE patterns (.vscode, .idea, *.swp)
4. Add OS patterns (.DS_Store, Thumbs.db)
5. Include environment files (.env, .env.local)
6. Add build output patterns (dist/, build/, out/)
7. Organize with comments for each section

Return ONLY the complete .gitignore file content.${NO_HALLUCINATION_CONSTRAINT}`;

    case 'pre_commit_hooks':
      return `You are creating a .pre-commit-config.yaml for ${repo.full_name}.

${repoInfo}

Current template:
\`\`\`yaml
${templateContent}
\`\`\`

Your task:
1. Customize hooks for a ${repo.language || 'generic'} project
2. Include language-specific hooks (eslint/prettier for JS, black for Python, etc.)
3. Add general hooks (trailing-whitespace, end-of-file-fixer, check-yaml)
4. Include security checks (detect-private-key, check-added-large-files)
5. Use recent stable versions of hooks
6. Organize by hook type with comments

Return ONLY the complete .pre-commit-config.yaml file content, no markdown fences.${NO_HALLUCINATION_CONSTRAINT}`;

    case 'testing_framework':
      return `You are creating a testing framework configuration for ${repo.full_name}.

${repoInfo}

Current template:
\`\`\`typescript
${templateContent}
\`\`\`

Your task:
1. Customize for a ${repo.language || 'TypeScript'} project
2. Use appropriate framework (Vitest for TS/JS, pytest for Python, etc.)
3. Configure test globals, environment, and coverage
4. Set up coverage thresholds and reporters
5. Exclude common directories from coverage
6. Add helpful comments

Return ONLY the complete config file content, no markdown fences.${NO_HALLUCINATION_CONSTRAINT}`;

    case 'linting':
      return `You are creating a linting configuration for ${repo.full_name}.

${repoInfo}

Current template:
\`\`\`javascript
${templateContent}
\`\`\`

Your task:
1. Customize for a ${repo.language || 'TypeScript'} project
2. Use appropriate linter (ESLint for JS/TS, Pylint for Python, etc.)
3. Include recommended rules and best practices
4. Add Prettier integration if applicable for JS/TS
5. Configure ignore patterns (node_modules, dist, build)
6. Use modern flat config format if applicable

Return ONLY the complete config file content, no markdown fences.${NO_HALLUCINATION_CONSTRAINT}`;

    default:
      return null;
  }
}

function cleanAIResponse(raw: string, original: string): string {
  let cleaned = raw.replace(/\r\n/g, '\n').trim();
  cleaned = cleaned.replace(/^```[\w]*\s*\n/, '');
  cleaned = cleaned.replace(/\n```\s*$/, '');
  cleaned = cleaned.replace(/^```[\w]*\s*$/, ''); // strip orphaned fence marker
  return cleaned.trim() || original;
}

export async function enrichTemplateWithAI(
  docType: string,
  templateContent: string,
  repo: RepoContext
): Promise<string> {
  const type = mapDocType(docType);
  const prompt = buildEnrichmentPrompt(type, templateContent, repo);

  if (prompt === null) {
    return templateContent;
  }

  try {
    const enriched = await generateAIContent(prompt);
    return cleanAIResponse(enriched, templateContent);
  } catch (error) {
    logger.warn(`AI enrichment failed for ${docType}:`, error);
    return templateContent;
  }
}
