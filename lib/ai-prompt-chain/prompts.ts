import type { EnrichedContext } from './types';

export function buildPracticePrompt(context: EnrichedContext): string {
  switch (context.practiceType) {
    case 'deploy_badge':
      return buildDeployBadgePrompt(context);
    case 'env_template':
      return buildEnvTemplatePrompt(context);
    case 'docker':
      return buildDockerPrompt(context);
    case 'dependabot':
      return buildDependabotPrompt(context);
    case 'ci_cd':
      return buildCICDPrompt(context);
    case 'gitignore':
      return buildGitignorePrompt(context);
    case 'pre_commit_hooks':
      return buildPreCommitHooksPrompt(context);
    case 'testing_framework':
      return buildTestingFrameworkPrompt(context);
    case 'linting':
      return buildLintingPrompt(context);
    default: {
      const unreachable: never = context.practiceType;
      throw new Error(`Unknown practice type: ${unreachable}`);
    }
  }
}

function buildDeployBadgePrompt(context: EnrichedContext): string {
  const hasReadme = context.readme && context.readme.trim().length > 0;

  const hasNetlify = context.fileList?.some((f) => f.includes('netlify.toml'));
  const hasVercel = context.fileList?.some((f) => f.includes('vercel.json'));
  const hasRender = context.fileList?.some((f) => f.includes('render.yaml'));
  const hasFly = context.fileList?.some((f) => f.includes('fly.toml'));
  const hasRailway = context.fileList?.some((f) => f.includes('railway.json'));

  const workflows =
    context.fileList?.filter(
      (f) => f.includes('.github/workflows/') && (f.endsWith('.yml') || f.endsWith('.yaml'))
    ) || [];
  const hasDeployWorkflow = workflows.some((w) => /deploy|cd|release|publish/i.test(w));
  const hasCIWorkflow = workflows.some((w) => /ci|test|lint|build/i.test(w));
  const isDeployable =
    hasNetlify || hasVercel || hasRender || hasFly || hasRailway || hasDeployWorkflow;

  if (!hasReadme) {
    const suggestedBadge = hasCIWorkflow
      ? `[![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/REPO/actions)`
      : hasNetlify
        ? `[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-SITE-ID/deploy-status)](https://app.netlify.com/sites/YOUR-SITE-NAME/deploys)`
        : `[![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/REPO/actions)`;

    return `You are creating a README.md with status badges.

REPO CONTEXT:
- Name: ${context.repoName}
- Language: ${context.language || 'Unknown'}
- Deployable: ${isDeployable ? 'Yes' : 'No (tool/library)'}
- Has CI Workflow: ${hasCIWorkflow ? 'Yes' : 'No'}
- Deploy Platform: ${hasNetlify ? 'Netlify' : hasVercel ? 'Vercel' : hasRender ? 'Render' : 'None detected'}

TEMPLATE SNIPPET:
${context.template}

TASK: Create a basic README.md that includes:
- Project title (# ${context.repoName})
- Brief description placeholder
- Appropriate status badge: ${suggestedBadge}
- Installation section placeholder
- Usage section placeholder
${hasCIWorkflow ? '- Replace ci.yml with the actual workflow filename from .github/workflows/' : ''}
${hasNetlify ? '- Replace YOUR-SITE-ID and YOUR-SITE-NAME with actual Netlify site details' : ''}
- Return ONLY the README.md content, no explanations`;
  }

  return `You are updating a README.md to add or improve status badges.

REPO CONTEXT:
- Name: ${context.repoName}
- Language: ${context.language || 'Unknown'}
- Deployable: ${isDeployable ? 'Yes' : 'No (tool/library)'}
- Workflows detected: ${workflows.length > 0 ? workflows.map((w) => w.split('/').pop()).join(', ') : 'None'}
- Deploy Platform: ${hasNetlify ? 'Netlify' : hasVercel ? 'Vercel' : hasRender ? 'Render' : hasFly ? 'Fly.io' : hasRailway ? 'Railway' : 'None detected'}

${context.badges && context.badges.length > 0 ? `EXISTING BADGES:\n${context.badges.join('\n')}` : 'No existing badges found.'}

CURRENT README:
${context.readme?.slice(0, 500)}${(context.readme?.length ?? 0) > 500 ? '\n...(truncated)' : ''}

GUIDANCE:
${
  isDeployable
    ? `This repo appears deployable. Add a deployment status badge for ${hasNetlify ? 'Netlify' : hasVercel ? 'Vercel' : hasRender ? 'Render' : 'the detected platform'}.`
    : hasCIWorkflow
      ? `This appears to be a tool/library. The existing CI badge is appropriate - no deploy badge needed.`
      : `Add a CI/test badge using one of the detected workflows: ${workflows.map((w) => w.split('/').pop()).join(', ') || 'ci.yml'}`
}

EXAMPLES:
${hasCIWorkflow ? `- GitHub Actions: [![CI](https://github.com/${context.repoOwner || 'OWNER'}/${context.repoName}/actions/workflows/${workflows[0]?.split('/').pop() || 'ci.yml'}/badge.svg)](https://github.com/${context.repoOwner || 'OWNER'}/${context.repoName}/actions)` : ''}
${hasNetlify ? `- Netlify: [![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-SITE-ID/deploy-status)](https://app.netlify.com/sites/YOUR-SITE-NAME/deploys)` : ''}
${hasVercel ? `- Vercel: [![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/YOUR-PROJECT)` : ''}

TASK: ${isDeployable ? 'Add deployment badge' : 'Ensure CI/test badge is present'}
- Preserve existing formatting and style
- Place badge(s) near project title at the top
- Use actual workflow filenames from the repo
- Return ONLY the modified README content, no explanations`;
}

function buildEnvTemplatePrompt(context: EnrichedContext): string {
  return `You are creating a .env.example file for environment variable documentation.

REPO CONTEXT:
- Name: ${context.repoName}
- Language: ${context.language || 'Unknown'}

${context.envVars && context.envVars.length > 0 ? `ENV VARS MENTIONED IN README:\n${context.envVars.join(', ')}` : 'No env vars found in README.'}

${context.existingFiles?.['.env'] ? `EXISTING .env FILE:\n${context.existingFiles['.env']}` : 'No existing .env file.'}

TEMPLATE:
${context.template}

TASK: Create a comprehensive .env.example that:
- Includes all discovered variables with placeholder values
- Adds helpful comments explaining each variable
- Groups related vars logically
- Follows ${context.language || 'standard'} conventions
- Uses placeholder values (never real secrets)
- Return ONLY the .env.example file content`;
}

function buildDockerPrompt(context: EnrichedContext): string {
  const existingDockerfile = context.existingFiles?.['Dockerfile']?.slice(0, 500);
  const existingCompose = context.existingFiles?.['docker-compose.yml']?.slice(0, 500);
  const existingDockerignore = context.existingFiles?.['.dockerignore']?.slice(0, 500);
  const hasBuildSteps = context.buildSteps && context.buildSteps.trim().length > 0;

  return `You are creating or improving a Dockerfile for ${context.repoName}.

REPO CONTEXT:
- Name: ${context.repoName}
- Language: ${context.language || 'Unknown'}
- Package managers: ${context.packageManagers?.join(', ') || 'Unknown'}

${hasBuildSteps ? `BUILD INSTRUCTIONS FROM README:\n${context.buildSteps}` : 'No build instructions found in README.'}

${existingDockerfile ? `EXISTING DOCKERFILE:\n${existingDockerfile}` : 'No existing Dockerfile.'}
${existingCompose ? `\nEXISTING DOCKER-COMPOSE:\n${existingCompose}` : ''}
${existingDockerignore ? `\nEXISTING .DOCKERIGNORE:\n${existingDockerignore}` : ''}

TEMPLATE:
${context.template}

TASK: Generate a production-ready Dockerfile that:
- Uses the appropriate base image for ${context.language || 'the project'}
- Implements multi-stage builds to minimize image size
- Copies dependency files first for better layer caching
- Installs only production dependencies
- Runs as a non-root user
- Exposes the appropriate port
- Sets production environment variables
- Return ONLY the Dockerfile content, no markdown code fences`;
}

function buildDependabotPrompt(context: EnrichedContext): string {
  return `You are creating a Dependabot configuration for dependency updates.
REPO CONTEXT:
- Name: ${context.repoName}
- Language: ${context.language || 'Unknown'}
- Package managers detected: ${context.packageManagers?.join(', ') || 'None detected'}

${context.contributing ? `UPDATE PREFERENCES FROM CONTRIBUTING:\n${context.contributing.slice(0, 300)}...` : 'No CONTRIBUTING.md found.'}

TEMPLATE:
${context.template}

TASK: Generate .github/dependabot.yml that:
- Configures all detected package managers: ${context.packageManagers?.join(', ') || 'npm (default)'}
- Sets appropriate update intervals (weekly is good default)
- Each package-ecosystem + directory combination must be UNIQUE (no duplicates)
- Security updates are automatic - do NOT create separate entries for security
- Increase open-pull-requests-limit to handle both regular and security updates
- Uses sensible defaults
- Return ONLY the dependabot.yml file content`;
}

function buildCICDPrompt(context: EnrichedContext): string {
  const isPython = context.language === 'Python';
  const isJS = context.language === 'JavaScript' || context.language === 'TypeScript';

  return `You are creating a CI/CD workflow for a ${context.language || 'Unknown'} project.

REPO CONTEXT:
- Name: ${context.repoName}
- Language: ${context.language || 'Unknown'}
- Package managers: ${context.packageManagers?.join(', ') || 'Unknown'}

${context.buildSteps ? `BUILD INSTRUCTIONS FROM README:\n${context.buildSteps}` : 'No build instructions found in README.'}

${context.contributing ? `DEVELOPMENT GUIDELINES:\n${context.contributing.slice(0, 500)}...` : 'No CONTRIBUTING.md found.'}

TEMPLATE:
${context.template}

TASK: Generate .github/workflows/ci.yml that:
${
  isPython
    ? `- Uses actions/setup-python@v4 with Python 3.10+
- Optionally tests on multiple Python versions (matrix strategy)
- Installs dependencies from requirements.txt or pyproject.toml
- Runs linting (flake8, ruff, or pylint)
- Runs tests with pytest and coverage
- Optionally uploads coverage to Codecov
- Triggers on push/PR to main branch`
    : isJS
      ? `- Uses actions/setup-node@v4 with Node 18+
- Optionally tests on multiple Node versions
- Uses npm ci / yarn / pnpm for dependency install
- Runs type checking if TypeScript
- Runs linting (ESLint)
- Runs tests with coverage
- Triggers on push/PR to main branch`
      : `- Uses the appropriate setup action for ${context.language || 'the detected language'}
- Installs dependencies using ${context.packageManagers?.join(' or ') || 'the standard package manager'}
- Runs linting, testing, and build steps appropriate for ${context.language || 'the project'}
- Triggers on push/PR to main branch`
}
- Has clear job names and steps
- Follows modern GitHub Actions best practices (v4 actions)
- Includes appropriate caching for dependencies
- Return ONLY the workflow YAML file content`;
}

function buildGitignorePrompt(context: EnrichedContext): string {
  return `You are creating a .gitignore file for a ${context.language || 'Unknown'} project.

REPO CONTEXT:
- Name: ${context.repoName}
- Language: ${context.language || 'Unknown'}
- Package managers: ${context.packageManagers?.join(', ') || 'Unknown'}

${context.readme ? `README CONTEXT:\n${context.readme.slice(0, 500)}...` : 'No README available.'}

TEMPLATE:
${context.template}

TASK: Generate .gitignore that:
- Includes patterns for ${context.language || 'common development'}
- Covers IDE files (.vscode, .idea, etc.)
- Ignores dependency directories (node_modules, venv, etc.)
- Includes OS-specific files (.DS_Store, Thumbs.db)
- Ignores build artifacts
- Ignores environment files (.env, .env.local)
- Well-organized with comments
- Return ONLY the .gitignore file content`;
}

function buildPreCommitHooksPrompt(context: EnrichedContext): string {
  const isPython = context.language === 'Python';
  const isJS = context.language === 'JavaScript' || context.language === 'TypeScript';

  return `You are creating pre-commit hooks configuration for a ${context.language || 'Unknown'} project.

REPO CONTEXT:
- Name: ${context.repoName}
- Language: ${context.language || 'Unknown'}
- Package managers: ${context.packageManagers?.join(', ') || 'Unknown'}

${context.contributing ? `DEVELOPMENT GUIDELINES:\n${context.contributing.slice(0, 500)}...` : 'No CONTRIBUTING.md found.'}

TEMPLATE:
${context.template}

TASK: Generate .pre-commit-config.yaml that:
${
  isPython
    ? `- Uses Python-specific hooks:
  * black (code formatting)
  * isort (import sorting)
  * flake8 or ruff (linting)
  * mypy (type checking, optional)
- Includes pre-commit-hooks repo for general checks
- Uses stable versions (black 24.x, isort 5.x, flake8 7.x)
- Sets language_version: python3`
    : isJS
      ? `- Uses JavaScript/TypeScript hooks:
  * prettier (formatting)
  * eslint (linting)
  * type checking if TypeScript
- Can use husky + lint-staged as alternative
- Uses stable versions`
      : `- Includes hooks appropriate for ${context.language || 'the project language'} using standard ecosystem formatters and linters
- Uses stable versions`
}
- Includes trailing whitespace/line ending checks
- Includes YAML validation and large file checks
- Includes security checks (detect-private-key, check-merge-conflict)
- Follows pre-commit.com best practices
- Return ONLY the .pre-commit-config.yaml file content`;
}

function buildTestingFrameworkPrompt(context: EnrichedContext): string {
  const isPython = context.language === 'Python';
  const isJS = context.language === 'JavaScript' || context.language === 'TypeScript';

  return `You are setting up a testing framework for a ${context.language || 'Unknown'} project.

REPO CONTEXT:
- Name: ${context.repoName}
- Language: ${context.language || 'Unknown'}

${context.buildSteps ? `BUILD/DEVELOPMENT INFO:\n${context.buildSteps}` : 'No build information found.'}

${context.contributing ? `DEVELOPMENT GUIDELINES:\n${context.contributing.slice(0, 500)}...` : 'No CONTRIBUTING.md found.'}

TEMPLATE:
${context.template}

TASK: Generate testing configuration that:
${
  isPython
    ? `- Uses pytest (industry standard for Python)
- Creates pytest.ini with:
  * Test discovery patterns (test_*.py, *_test.py)
  * Coverage configuration (pytest-cov)
  * Test markers (slow, integration, unit)
  * Minimum coverage threshold (80%)
- Set testpaths = tests
- Configure coverage report with term-missing`
    : isJS
      ? `- Uses modern framework (Vitest for Vite projects, Jest for others)
- Includes TypeScript support if applicable
- Configures test environment (node, jsdom, happy-dom)
- Enables globals for cleaner test syntax
- Sets up coverage reporting`
      : `- Uses the standard testing framework for ${context.language || 'the project language'}
- Configures test discovery, coverage reporting, and appropriate thresholds`
}
- Includes basic configuration
- Sets up test directory structure expectations
- Configures coverage reporting
- Follows modern testing best practices
- Return ONLY the test configuration file content (pytest.ini for Python, vitest.config.ts/jest.config.js for JS/TS)`;
}

function buildLintingPrompt(context: EnrichedContext): string {
  const isPython = context.language === 'Python';
  const isJS = context.language === 'JavaScript' || context.language === 'TypeScript';

  return `You are setting up linting for a ${context.language || 'Unknown'} project.

REPO CONTEXT:
- Name: ${context.repoName}
- Language: ${context.language || 'Unknown'}

${context.contributing ? `CODE STYLE GUIDELINES:\n${context.contributing.slice(0, 500)}...` : 'No CONTRIBUTING.md found.'}

TEMPLATE:
${context.template}

TASK: Generate linting configuration that:
${
  isPython
    ? `- Uses modern Python linting tools in pyproject.toml:
  * [tool.ruff] - Fast linter and formatter (recommended)
    - line-length = 120
    - select = ["E", "F", "I", "B", "UP", "C4"]
  * [tool.black] - Code formatter
    - line-length = 120
  * [tool.isort] - Import sorting
    - profile = "black"
- Alternative: .flake8 config if project uses flake8
- Exclude: .venv, venv, __pycache__, dist, build`
    : isJS
      ? `- Uses ESLint with modern flat config (eslint.config.mjs)
- Includes TypeScript support if applicable
- Integrates Prettier for formatting
- Enables recommended rules
- Ignores: node_modules, dist, build, .next`
      : `- Uses the standard linter for ${context.language || 'the project language'} with sensible defaults
- Configures ignore patterns and recommended rules`
}
- Uses sensible defaults
- Enables recommended rules for the language
- Configures code style and formatting
- Ignores common directories appropriately
- Follows modern linting best practices
- Return ONLY the linting configuration file content (pyproject.toml/.flake8 for Python, eslint.config.mjs for JS/TS)`;
}
