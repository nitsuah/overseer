import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateAIContent } from '@/lib/ai';
import { enrichContext, buildPracticePrompt, BestPracticeType } from '@/lib/ai-prompt-chain';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const githubToken = (session as any).accessToken;
    if (!githubToken) {
      return NextResponse.json({ error: 'GitHub access token not found' }, { status: 401 });
    }

    const { repoName, practiceType } = await request.json();

    if (!repoName || !practiceType) {
      return NextResponse.json(
        { error: 'Missing repoName or practiceType' },
        { status: 400 }
      );
    }

    // Parse owner/repo
    const [owner, repo] = repoName.includes('/') 
      ? repoName.split('/')
      : [session.user.name || '', repoName];

    // Load template file
    const templatePath = path.join(process.cwd(), 'templates', getTemplateFileName(practiceType));
    let template = '';
    try {
      template = await fs.readFile(templatePath, 'utf-8');
    } catch (error) {
      console.error(`Template not found for ${practiceType}:`, error);
      template = getDefaultTemplate(practiceType);
    }

    // Fetch repo metadata to get language
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    
    let language = null;
    if (repoResponse.ok) {
      const repoData = await repoResponse.json();
      language = repoData.language;
    }

    // Build enriched context
    const enrichedContext = await enrichContext(
      {
        repoName: repo,
        repoOwner: owner,
        language,
        practiceType: practiceType as BestPracticeType,
        template,
      },
      githubToken
    );

    // Build prompt with context
    const prompt = buildPracticePrompt(enrichedContext);

    // Generate AI content
    const generatedContent = await generateAIContent(prompt);

    // Return generated content for modal review
    return NextResponse.json({
      success: true,
      content: generatedContent,
      context: {
        repoName,
        practiceType,
        language,
        hasReadme: !!enrichedContext.readme,
        hasContributing: !!enrichedContext.contributing,
      },
    });
  } catch (error: unknown) {
    console.error('Error generating best practice fix:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate fix';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

function getTemplateFileName(practiceType: string): string {
  switch (practiceType) {
    case 'deploy_badge':
      return 'README.md'; // Will extract badge snippet
    case 'env_template':
      return '.env.example';
    case 'docker':
      return 'Dockerfile';
    case 'dependabot':
      return '.github/dependabot.yml';
    case 'ci_cd':
      return '.github/workflows/ci.yml';
    case 'gitignore':
      return '.gitignore';
    case 'pre_commit_hooks':
      return '.pre-commit-config.yaml';
    case 'testing_framework':
      return 'vitest.config.ts';
    case 'linting':
      return 'eslint.config.mjs';
    default:
      return 'README.md';
  }
}

function getDefaultTemplate(practiceType: string): string {
  switch (practiceType) {
    case 'deploy_badge':
      return '[![Deploy Status](https://img.shields.io/badge/Deploy-Status-blue?style=for-the-badge)](DEPLOYMENT_URL_HERE)';
    
    case 'env_template':
      return `# Environment Variables

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# API Keys
API_KEY=your_api_key_here

# App Config
NODE_ENV=development
PORT=3000`;

    case 'docker':
      return `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]`;

    case 'dependabot':
      return `version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"`;

    case 'ci_cd':
      return `name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test`;

    case 'gitignore':
      return `node_modules/
dist/
build/
.env
.env.local
coverage/
.DS_Store`;

    case 'pre_commit_hooks':
      return `repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer`;

    case 'testing_framework':
      return `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});`;

    case 'linting':
      return `import eslint from '@eslint/js';

export default [
  eslint.configs.recommended,
];`;

    default:
      return '';
  }
}
