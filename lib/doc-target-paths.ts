import path from 'path';

/**
 * Single source of truth mapping a logical doc type (as used by the AI chat
 * proposal flow and the "generate docs" flow) to the repo-relative path it
 * belongs at. `app/api/repos/[name]/fix-doc/route.ts` validates any
 * caller-supplied path against this map (CWE-22: path traversal / arbitrary
 * write); `app/page.tsx`'s chat-proposal adapter uses it to build a correct
 * preview path instead of guessing `${docType.toUpperCase()}.md`, which is
 * wrong for outliers like `license` (no extension) and `codeowners`/`funding`
 * (live under `.github/`). Keep both call sites importing this map rather
 * than re-deriving it, so they can't drift out of sync again.
 */
export const DOC_TARGET_PATHS: Record<string, string> = {
  // Core docs go in root
  readme: 'README.md',
  roadmap: 'ROADMAP.md',
  tasks: 'TASKS.md',
  metrics: 'METRICS.md',
  features: 'FEATURES.md',
  // Community standards go in root
  code_of_conduct: 'CODE_OF_CONDUCT.md',
  contributing: 'CONTRIBUTING.md',
  security: 'SECURITY.md',
  changelog: 'CHANGELOG.md',
  license: 'LICENSE',
  codeowners: path.join('.github', 'CODEOWNERS'),
  copilot: path.join('.github', 'copilot-instructions.md'),
  copilot_instructions: path.join('.github', 'copilot-instructions.md'),
  funding: path.join('.github', 'FUNDING.yml'),
  issue_template: path.join('.github', 'ISSUE_TEMPLATE', 'bug_report.md'),
  issue_templates: path.join('.github', 'ISSUE_TEMPLATE', 'config.yml'),
  pr_template: path.join('.github', 'pull_request_template.md'),
  pull_request_template: path.join('.github', 'pull_request_template.md'),
  flow_tasks_prompt: path.join('.github', 'prompts', 'FLOW-TASKS.md'),
  handoff_prompt: path.join('.github', 'prompts', 'HANDOFF.md'),
};

/** Returns the approved target path for `docType`, or undefined if unknown. */
export function resolveDocTargetPath(docType: string): string | undefined {
  const normalized = docType.toLowerCase();
  return Object.prototype.hasOwnProperty.call(DOC_TARGET_PATHS, normalized)
    ? DOC_TARGET_PATHS[normalized]
    : undefined;
}
