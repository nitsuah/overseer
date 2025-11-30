import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { docTypes } = await request.json();
    if (!docTypes || !Array.isArray(docTypes)) {
      return NextResponse.json({ error: 'docTypes array required' }, { status: 400 });
    }

    const previews: Array<{ path: string; content: string; docType: string; type: 'doc' | 'practice'; practiceType?: string }> = [];

    const TEMPLATE_FILES: Record<string, string> = {
      readme: 'README.md',
      roadmap: 'ROADMAP.md',
      tasks: 'TASKS.md',
      metrics: 'METRICS.md',
      features: 'FEATURES.md',
      code_of_conduct: 'CODE_OF_CONDUCT.md',
      contributing: 'CONTRIBUTING.md',
      security: 'SECURITY.md',
      changelog: 'CHANGELOG.md',
      license: 'LICENSE',
      // Community standards under .github
      codeowners: path.join('.github', 'CODEOWNERS'),
      copilot: path.join('.github', 'copilot-instructions.md'),
      funding: path.join('.github', 'FUNDING.yml'),
      // Issue/PR templates
      issue_template: path.join('.github', 'ISSUE_TEMPLATE', 'bug_report.md'),
      pr_template: path.join('.github', 'pull_request_template.md'),
      // Best practices with files we can preview
      docker: 'Dockerfile',
      env_template: '.env.example',
      dependabot: '.github/dependabot.yml',
    };
    
    for (const docType of docTypes) {
      const normalized = String(docType).toLowerCase();
      const filename = TEMPLATE_FILES[normalized];
      // Special case: netlify_badge has no dedicated template file, show an informational preview
      if (!filename && normalized === 'netlify_badge') {
        const content = `# Netlify Badge Preview\n\nThis change adds a Netlify deployment status badge to README.md.\n\nExample snippet:\n\n[![Netlify Status](https://api.netlify.com/api/v1/badges/<SITE_ID>/deploy-status)](https://app.netlify.com/sites/<SITE_NAME>/deploys)`;
        previews.push({
          path: 'README.md (badge snippet)',
          content,
          docType: 'README badge',
          type: 'practice',
          practiceType: 'netlify_badge',
        });
        continue;
      }
      if (!filename) {
        // Skip unknown types silently
        continue;
      }
      const templatePath = path.join(process.cwd(), 'templates', filename);
      
      try {
        const content = await fs.readFile(templatePath, 'utf-8');
        previews.push({
          path: filename.replace(/\\/g, '/'),
          content,
          docType: normalized,
          type: ['docker','env_template','dependabot','netlify_badge'].includes(normalized) ? 'practice' : 'doc',
          practiceType: ['docker','env_template','dependabot','netlify_badge'].includes(normalized) ? normalized : undefined,
        });
      } catch (error) {
        console.warn(`Template not found for ${docType}:`, error);
      }
    }

    return NextResponse.json({ previews });
  } catch (error) {
    console.error('Error fetching template previews:', error);
    return NextResponse.json({ error: 'Failed to fetch previews' }, { status: 500 });
  }
}
