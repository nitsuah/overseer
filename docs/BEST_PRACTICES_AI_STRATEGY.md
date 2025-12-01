# Best Practices AI Fix Strategy

## Overview

Context-aware AI prompt chaining for generating repo-specific best practice fixes using multi-stage RAG (Retrieval-Augmented Generation).

## Architecture

### Core Components

1. **Template Retrieval**: Baseline structure from `/templates/`
2. **Repo Context Gathering**: Collect relevant repo metadata and files
3. **Context Augmentation**: Combine template + repo context into rich prompt
4. **Generation**: Create practice-specific fix with proper tone/style
5. **Human Review**: Modal-based review system for final adjustments

### Data Sources (Priority Order)

1. **Always Available**:
   - Language (from repo metadata, already in UI)
   - Template file (baseline structure)
   - Repo name, description

2. **README.md** (Primary context source):
   - Project tone/style
   - Existing conventions
   - Current badges (for netlify_badge)
   - Project structure/setup

3. **CONTRIBUTING.md** (When available):
   - Development setup
   - Contribution guidelines
   - Code style preferences

4. **Existing Files** (Practice-specific):
   - Current `.env` or `.env.example` (for env_template)
   - Existing `Dockerfile` or `docker-compose.yml` (for docker)
   - `.github/dependabot.yml` (for dependabot - if malformed)

## Implementation Plan

### Phase 1: Core Infrastructure

- [ ] Create prompt chain builder utility
- [ ] Implement context fetcher (README, CONTRIBUTING, language, etc.)
- [ ] Design prompt templates with variable injection

### Phase 2: Practice-Specific Implementations

#### 1. `netlify_badge`

**Context Sources**: README.md (required), repo metadata
**Process**:

1. Fetch current README.md content
2. Identify badge section or top of file
3. Generate netlify badge snippet with repo details
4. Show diff in modal for user review (user must fill in Netlify site URL)
5. User approves → Create PR with updated README

**Prompt Structure**:

```markdown
You are updating a README.md to add a Netlify deployment status badge.

REPO CONTEXT:

- Name: {repo_name}
- Language: {language}

CURRENT README:
{readme_content}

TEMPLATE SNIPPET:
{netlify_badge_template}

TASK: Insert the Netlify badge near other badges or at the top of the README.

- Preserve existing formatting and style
- Place it logically with other status badges
- Use placeholder: [![Netlify Status](https://api.netlify.com/api/v1/badges/{SITE_ID}/deploy-status)](https://app.netlify.com/sites/{SITE_NAME}/deploys)
- Return ONLY the modified README content
```

#### 2. `env_template`

**Context Sources**: README.md, existing `.env` files, language
**Process**:

1. Check for existing `.env`, `.env.local`, `.env.example`
2. Scan README for environment variable mentions
3. Generate `.env.example` with discovered vars + template structure
4. Modal review → PR

**Prompt Structure**:

```markdown
You are creating a .env.example file for environment variable documentation.

REPO CONTEXT:

- Language: {language}
- README mentions: {env_vars_from_readme}
- Existing .env vars: {existing_env_vars}

TEMPLATE:
{env_template}

TASK: Create a comprehensive .env.example that:

- Includes all discovered variables
- Adds helpful comments
- Groups related vars logically
- Follows {language} conventions
- Uses placeholder values (never real secrets)
```

#### 3. `docker`

**Context Sources**: Language, README.md, CONTRIBUTING.md, templates
**Process**:

1. Fetch language to determine base image
2. Check README/CONTRIBUTING for build/run instructions
3. Generate Dockerfile + docker-compose.yml if applicable
4. Modal review → PR

**Prompt Structure**:

```markdown
You are creating Docker configuration for a {language} project.

REPO CONTEXT:

- Language: {language}
- README build instructions: {build_steps}
- CONTRIBUTING setup: {contributing_setup}

TEMPLATES:
{dockerfile_template}
{docker_compose_template}

TASK: Generate Docker files that:

- Use appropriate base image for {language}
- Match project's build/run process
- Include necessary dependencies
- Follow best practices from CONTRIBUTING.md
- Add helpful comments
```

#### 4. `dependabot`

**Context Sources**: Language, README.md, CONTRIBUTING.md, package managers
**Process**:

1. Detect package manager from language/files (package.json, requirements.txt, go.mod, etc.)
2. Check README/CONTRIBUTING for update preferences
3. Generate `.github/dependabot.yml`
4. Modal review → PR

**Prompt Structure**:

```markdown
You are creating a Dependabot configuration for dependency updates.

REPO CONTEXT:

- Language: {language}
- Package managers detected: {package_managers}
- Update frequency preference: {from_contributing_or_default}

TEMPLATE:
{dependabot_template}

TASK: Generate .github/dependabot.yml that:

- Configures all detected package managers
- Sets appropriate update intervals
- Follows repo conventions from CONTRIBUTING.md
- Includes security updates
- Uses sensible defaults
```

### Phase 3: Prompt Chain Implementation

**Shared Chain Structure**:

```typescript
interface PromptChainContext {
  repoName: string;
  language: string;
  readme?: string;
  contributing?: string;
  template: string;
  practiceType: 'netlify_badge' | 'env_template' | 'docker' | 'dependabot';
  existingFiles?: Record<string, string>;
}

async function buildPromptChain(context: PromptChainContext): Promise<string> {
  // 1. Fetch all context sources
  const enrichedContext = await enrichContext(context);

  // 2. Build practice-specific prompt
  const prompt = buildPracticePrompt(enrichedContext);

  // 3. Add RAG components
  const augmentedPrompt = augmentWithContext(prompt, enrichedContext);

  return augmentedPrompt;
}
```

## Benefits

1. **Repo-Specific Output**: Generated files match project tone, style, conventions
2. **Context-Aware**: Understands existing setup, doesn't duplicate or conflict
3. **Human-in-Loop**: Modal review ensures AI doesn't make mistakes
4. **Incremental**: Can start with README-only, add more context sources later
5. **Template-Based**: Still uses templates as baseline, just enhanced with context

## Future Enhancements

- Add more context sources (CI configs, package.json, etc.)
- Learn from accepted PRs to improve prompts
- Support custom templates per organization
- Multi-file diff preview in modal
- Confidence scoring (how sure AI is about the changes)

## Notes

- Start simple: All 4 practices can use README as primary context
- Language is already available in UI (no extra fetch needed)
- Modal system already works well for review/edit workflow
- Some practices (netlify_badge) REQUIRE human input (site URL) - AI gets it "most of the way there"
