import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getNeonClient } from '@/lib/db';
import { generateAIContent } from '@/lib/ai';
import logger from '@/lib/log';

type RepoMetadata = {
  full_name: string;
  description: string | null;
  language: string | null;
  topics: string[];
  homepage: string | null;
  created_at: string;
};

// Anti-hallucination constraint for all AI prompts
const NO_HALLUCINATION_CONSTRAINT = `\nImportant constraints:\n- Do NOT invent facts, metrics, features, services, credentials, or URLs.\n- If information is unknown, omit the item or use a clearly marked placeholder (e.g., TODO: VALUE_NEEDED).\n- Keep output concise, scannable, and production-ready.`;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      console.log('[enrich-template] Unauthorized - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('[enrich-template] Request body:', { 
      repoName: body.repoName, 
      docType: body.docType, 
      templateContentLength: body.templateContent?.length 
    });

    const { repoName, docType, templateContent } = body;
    if (!repoName || !docType || !templateContent) {
      console.log('[enrich-template] Missing required fields:', { repoName: !!repoName, docType: !!docType, templateContent: !!templateContent });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get repo details for context
    const db = getNeonClient();
    const repoRows = await db`
      SELECT full_name, description, language, topics, homepage, created_at
      FROM repos
      WHERE name = ${repoName}
      LIMIT 1
    `;

    if (repoRows.length === 0) {
      console.log('[enrich-template] Repo not found:', repoName);
      return NextResponse.json({ error: 'Repo not found' }, { status: 404 });
    }

    const repo = repoRows[0] as RepoMetadata;
    console.log('[enrich-template] Repo found:', repo.full_name, 'docType:', docType);

    // Build enrichment prompt based on doc type
    const enrichedContent = await enrichTemplateWithAI(docType, templateContent, repo);
    console.log('[enrich-template] Success, enriched content length:', enrichedContent?.length);

    return NextResponse.json({ enrichedContent });
  } catch (error: unknown) {
    logger.warn('Error enriching template:', error);
    console.error('[enrich-template] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

function mapDocType(input: string): string {
  const t = (input || '').toLowerCase().trim();
  console.log('[mapDocType] Input:', input, '-> Normalized:', t);
  // Map filenames and aliases to canonical types
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
  const result = mapping[t] || t;
  console.log('[mapDocType] Mapped to:', result);
  return result;
}

async function enrichTemplateWithAI(
  docType: string,
  templateContent: string,
  repo: RepoMetadata
): Promise<string> {
  console.log('[enrichTemplateWithAI] Starting enrichment for docType:', docType);
  const type = mapDocType(docType);
  
  const repoInfo = `
Repository: ${repo.full_name}
Description: ${repo.description || 'No description'}
Primary Language: ${repo.language || 'Unknown'}
Topics: ${repo.topics?.join(', ') || 'None'}
Homepage: ${repo.homepage || 'None'}
`.trim();

  const owner = repo.full_name.split('/')[0];

  let prompt = '';

  switch (type) {
    case 'codeowners':
      console.log('[enrichTemplateWithAI] Building CODEOWNERS prompt');
      prompt = `You are enriching a GitHub CODEOWNERS file for a repository.

${repoInfo}

${templateContent.trim().length > 0 ? `Current template content:\n\`\`\`\n${templateContent}\n\`\`\`` : 'Starting with empty/minimal template.'}

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
      break;

    case 'roadmap':
  console.log('[enrichTemplateWithAI] Building ROADMAP prompt');
  prompt = `You are enriching a repository ROADMAP.md.

${repoInfo}

${templateContent.trim().length > 0 ? `Current template content:\n\`\`\`markdown\n${templateContent}\n\`\`\`` : 'Starting from an empty/minimal roadmap template.'}

Your task:
1. Produce a practical, actionable roadmap tailored to ${repo.full_name}.
2. Organize into Near Term (0-3 months), Mid Term (3-6 months), and Long Term (6-12 months).
3. For each item provide: goal, rationale, rough scope, success criteria, and risks.
4. Align with the repository’s tech stack and domain (language: ${repo.language || 'unknown'}, topics: ${repo.topics?.join(', ') || 'none'}).
5. Keep it concise and scannable; use headings and bullet lists.
6. Include a final section for "Completed Milestones" with placeholders if none.

Format:
- Markdown only (no code fences or extra commentary).
- Use top-level heading "Roadmap" and subsections for each time horizon.
- Use bullets with bold short titles followed by brief descriptions.

Return ONLY the Markdown content for ROADMAP.md.${NO_HALLUCINATION_CONSTRAINT}`;
  break;

    case 'tasks':
  console.log('[enrichTemplateWithAI] Building TASKS prompt');
  prompt = `You are enriching a repository TASKS.md (project tasks/backlog).

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
  break;

    case 'metrics':
  console.log('[enrichTemplateWithAI] Building METRICS prompt');
  prompt = `You are creating METRICS.md for ${repo.full_name}.

${repoInfo}

IMPORTANT: Generate REAL metric definitions specific to ${repo.language || 'this'} projects. Do NOT copy template placeholders.

Your task:
1. Define 8-12 key metrics for ${repo.full_name}:
   - Test coverage, test count, CI/CD status
   - Code quality (LOC, complexity, vulnerabilities)
   - Performance metrics relevant to ${repo.language}
   - Build/deployment metrics
2. Create a metrics table with columns: Metric | Current | Target | Status
3. Add "How to Update" section with specific commands for ${repo.language}
4. Use placeholder values like "TBD" or "0%" for current values

Return ONLY complete Markdown for METRICS.md with REAL metrics.${NO_HALLUCINATION_CONSTRAINT}`;
  break;

    case 'features':
  console.log('[enrichTemplateWithAI] Building FEATURES prompt');
  prompt = `You are creating FEATURES.md for ${repo.full_name}.

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
  break;

    case 'readme':
    case 'readme.md':
  console.log('[enrichTemplateWithAI] Building README prompt');
  prompt = `You are enriching README.md.

${repoInfo}

${templateContent.trim().length > 0 ? `Current content:\n\`\`\`markdown\n${templateContent}\n\`\`\`` : 'Starting from an empty/minimal template.'}

Your task:
1. Produce a clean README with sections: Overview, Features, Tech Stack, Getting Started, Scripts, Environment, Testing, Deployment, Contributing, License.
2. Keep commands copyable and minimal; avoid filler.
3. Align content with the project’s language and stack.

Return ONLY the Markdown for README.md.${NO_HALLUCINATION_CONSTRAINT}`;
  break;

    case 'contributing':
    case 'contributing.md':
  console.log('[enrichTemplateWithAI] Building CONTRIBUTING prompt');
  prompt = `You are enriching CONTRIBUTING.md.

${repoInfo}

${templateContent.trim().length > 0 ? `Current content:\n\`\`\`markdown\n${templateContent}\n\`\`\`` : 'Starting from an empty/minimal template.'}

Your task:
1. Include sections: Code of Conduct reference, Issues, PRs, Branching, Commit messages, Testing, Linting, Releases.
2. Provide concise steps and expectations.

Return ONLY the Markdown for CONTRIBUTING.md.${NO_HALLUCINATION_CONSTRAINT}`;
  break;

    case 'security':
    case 'security.md':
  console.log('[enrichTemplateWithAI] Building SECURITY prompt');
  prompt = `You are enriching SECURITY.md.

${repoInfo}

${templateContent.trim().length > 0 ? `Current content:\n\`\`\`markdown\n${templateContent}\n\`\`\`` : 'Starting from an empty/minimal template.'}

Your task:
1. Define vulnerability disclosure process, supported versions, reporting channels, response expectations.
2. Keep tone professional; concise actionable steps.

Return ONLY the Markdown for SECURITY.md.${NO_HALLUCINATION_CONSTRAINT}`;
  break;

    case 'changelog':
    case 'changelog.md':
  console.log('[enrichTemplateWithAI] Building CHANGELOG prompt');
  prompt = `You are enriching CHANGELOG.md following Keep a Changelog.

${repoInfo}

${templateContent.trim().length > 0 ? `Current content:\n\`\`\`markdown\n${templateContent}\n\`\`\`` : 'Starting from an empty/minimal template.'}

Your task:
1. Provide structure with Unreleased, Added/Changed/Fixed sections.
2. Populate initial entries consistent with project domain.

Return ONLY the Markdown for CHANGELOG.md.${NO_HALLUCINATION_CONSTRAINT}`;
  break;

    case 'bug_report':
  console.log('[enrichTemplateWithAI] Building BUG REPORT template prompt');
  prompt = `You are creating a GitHub bug report issue template for ${repo.full_name}.

${repoInfo}

${templateContent.trim().length > 0 ? `Current template:
\`\`\`markdown
${templateContent}
\`\`\`` : 'Starting from minimal template.'}

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
  break;

    case 'feature_request':
  console.log('[enrichTemplateWithAI] Building FEATURE REQUEST template prompt');
  prompt = `You are creating a GitHub feature request issue template for ${repo.full_name}.

${repoInfo}

${templateContent.trim().length > 0 ? `Current template:
\`\`\`markdown
${templateContent}
\`\`\`` : 'Starting from minimal template.'}

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
  break;

    case 'issue_templates':
  console.log('[enrichTemplateWithAI] Building ISSUE TEMPLATES prompt');
  prompt = `You are generating GitHub issue templates (Bug Report and Feature Request).

${repoInfo}

Your task:
1. Output two Markdown files separated by a clear divider line: BUG_REPORT.md and FEATURE_REQUEST.md.
2. Include fields: title, description, steps, expected/actual, environment for bugs; problem, proposal, alternatives for features.

Return ONLY the combined Markdown content for the two templates.${NO_HALLUCINATION_CONSTRAINT}`;
  break;

    case 'pr_template':
  console.log('[enrichTemplateWithAI] Building PR TEMPLATE prompt');
  prompt = `You are enriching a GitHub pull_request_template.md.

${repoInfo}

${templateContent.trim().length > 0 ? `Current content:\n\`\`\`markdown\n${templateContent}\n\`\`\`` : 'Starting from an empty/minimal template.'}

Your task:
1. Create a concise PR template with sections: Summary, Changes, Testing, Screenshots (optional), Checklist.

Return ONLY the Markdown for pull_request_template.md.${NO_HALLUCINATION_CONSTRAINT}`;
  break;

    case 'copilot_instructions':
  console.log('[enrichTemplateWithAI] Building COPILOT INSTRUCTIONS prompt');
  prompt = `You are enriching .github/copilot-instructions.md for AI assistance.

${repoInfo}

${templateContent.trim().length > 0 ? `Current content:\n\`\`\`markdown\n${templateContent}\n\`\`\`` : 'Starting from an empty/minimal template.'}

Your task:
1. Provide clear guardrails: coding style, file paths, tests, commit conventions, and what to avoid.
2. Include examples of good vs bad changes.

Return ONLY the Markdown for copilot-instructions.md.${NO_HALLUCINATION_CONSTRAINT}`;
  break;

    case 'funding':
    case 'funding.yml':
  console.log('[enrichTemplateWithAI] Building FUNDING prompt');
  prompt = `You are enriching .github/FUNDING.yml.

${repoInfo}

${templateContent.trim().length > 0 ? `Current content:\n\`\`\`yaml\n${templateContent}\n\`\`\`` : 'Starting from an empty/minimal template.'}

Your task:
1. Provide a valid FUNDING.yml with keys (github, patreon, open_collective) as applicable.
2. Use placeholder handles where unknown.

Return ONLY the YAML for FUNDING.yml.${NO_HALLUCINATION_CONSTRAINT}`;
  break;

    // Best Practices (templates)
    case 'dependabot':
    case 'dependabot.yml':
  console.log('[enrichTemplateWithAI] Building DEPENDABOT prompt');
  prompt = `You are enriching .github/dependabot.yml for ${repo.full_name}.

${repoInfo}

${templateContent.trim().length > 0 ? `Current content:\n\`\`\`yaml\n${templateContent}\n\`\`\`` : 'Starting from an empty/minimal template.'}

Your task:
1. Produce a valid Dependabot config with updates for npm (or relevant ecosystem), schedule (weekly), and security updates.
2. Tailor ecosystem to the repo’s language (${repo.language || 'unknown'}).
3. Keep YAML concise and valid.

Return ONLY the YAML for .github/dependabot.yml.${NO_HALLUCINATION_CONSTRAINT}`;
  break;

    case 'env_example':
    case '.env.example':
  console.log('[enrichTemplateWithAI] Building ENV EXAMPLE prompt');
  prompt = `You are creating .env.example for ${repo.full_name}.

${repoInfo}

${templateContent.trim().length > 0 ? `Current content:\n\`\`\`\n${templateContent}\n\`\`\`` : 'Starting from an empty/minimal template.'}

Your task:
1. Create environment variables appropriate for a ${repo.language || 'unknown language'} project
2. Based on common patterns for ${repo.language}:
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
  break;

    case 'dockerfile':
  console.log('[enrichTemplateWithAI] Building DOCKERFILE prompt');
  prompt = `You are creating a production-ready Dockerfile for ${repo.full_name}.

${repoInfo}

${templateContent.trim().length > 0 ? `Current content:\n\`\`\`Dockerfile\n${templateContent}\n\`\`\`` : 'Starting from an empty/minimal template.'}

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
  break;

    case 'docker_compose':
    case 'docker-compose.yml':
  console.log('[enrichTemplateWithAI] Building DOCKER COMPOSE prompt');
  prompt = `You are enriching docker-compose.yml.

${repoInfo}

${templateContent.trim().length > 0 ? `Current content:\n\`\`\`yaml\n${templateContent}\n\`\`\`` : 'Starting from an empty/minimal template.'}

Your task:
1. Provide services appropriate for ${repo.full_name} (app, db if needed), volumes, ports, and env.
2. Keep YAML valid and minimal.

Return ONLY the YAML for docker-compose.yml.${NO_HALLUCINATION_CONSTRAINT}`;
  break;

    case 'netlify_badge':
  console.log('[enrichTemplateWithAI] Building NETLIFY BADGE prompt');
  prompt = `You are enriching a README snippet to include a Netlify badge and deployment info.

${repoInfo}

${templateContent.trim().length > 0 ? `Current README section:\n\`\`\`markdown\n${templateContent}\n\`\`\`` : 'Starting from an empty/minimal snippet.'}

Your task:
1. Produce a small Markdown section including Netlify deploy badge, live URL (use homepage if available), and brief deployment notes.
2. Keep it concise and copy-pasteable.

Return ONLY the Markdown snippet.${NO_HALLUCINATION_CONSTRAINT}`;
  break;

    case 'code_of_conduct':
  console.log('[enrichTemplateWithAI] Building CODE_OF_CONDUCT prompt');
  prompt = `You are enriching CODE_OF_CONDUCT.md for ${repo.full_name}.

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
  break;

    case 'license':
      console.log('[enrichTemplateWithAI] Building LICENSE prompt');
      // Extract year from repo creation date
      const createdYear = new Date(repo.created_at).getFullYear();
      prompt = `You are filling in placeholders in an MIT LICENSE template.

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

Return ONLY the complete LICENSE file with placeholders filled in.`;
      break;

    case 'ci_cd':
      console.log('[enrichTemplateWithAI] Building CI/CD workflow prompt');
      prompt = `You are creating a GitHub Actions CI/CD workflow for ${repo.full_name}.

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
      break;

    case 'gitignore':
      console.log('[enrichTemplateWithAI] Building .gitignore prompt');
      prompt = `You are creating a .gitignore file for ${repo.full_name}.

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
      break;

    case 'pre_commit_hooks':
      console.log('[enrichTemplateWithAI] Building pre-commit hooks prompt');
      prompt = `You are creating a .pre-commit-config.yaml for ${repo.full_name}.

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
      break;

    case 'testing_framework':
      console.log('[enrichTemplateWithAI] Building testing framework config prompt');
      prompt = `You are creating a testing framework configuration for ${repo.full_name}.

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
      break;

    case 'linting':
      console.log('[enrichTemplateWithAI] Building linting config prompt');
      prompt = `You are creating a linting configuration for ${repo.full_name}.

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
      break;

    default:
      console.log('[enrichTemplateWithAI] Unsupported docType, returning template as-is');
      // For unsupported types, return template as-is
      return templateContent;
  }

  try {
    console.log('[enrichTemplateWithAI] Calling generateAIContent...');
    console.log('[enrichTemplateWithAI] Prompt preview:', prompt.substring(0, 500));
    const enriched = await generateAIContent(prompt);
    console.log('[enrichTemplateWithAI] AI response received, length:', enriched?.length);
    console.log('[enrichTemplateWithAI] AI response preview:', enriched?.substring(0, 300));
    // Strip markdown code fences if present
    // Normalize line endings to avoid CRLF/LF diff issues
    const cleaned = enriched
      .replace(/^```[\w]*\n?/, '')
      .replace(/\n?```$/, '')
      .replace(/\r\n/g, '\n')
      .trim();
    console.log('[enrichTemplateWithAI] After cleaning, length:', cleaned?.length);
    console.log('[enrichTemplateWithAI] Template length:', templateContent?.length);
    console.log('[enrichTemplateWithAI] Are they identical?', cleaned === templateContent);
    return cleaned;
  } catch (error) {
    logger.warn(`AI enrichment failed for ${docType}:`, error);
    console.error('[enrichTemplateWithAI] Error:', error);
    return templateContent; // Fallback to original
  }
}
