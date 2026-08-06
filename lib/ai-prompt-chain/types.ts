export type BestPracticeType =
  | 'deploy_badge'
  | 'env_template'
  | 'docker'
  | 'dependabot'
  | 'ci_cd'
  | 'gitignore'
  | 'pre_commit_hooks'
  | 'testing_framework'
  | 'linting';

export interface PromptChainContext {
  repoName: string;
  repoOwner: string;
  language: string | null;
  practiceType: BestPracticeType;
  template: string;
  readme?: string;
  contributing?: string;
  existingFiles?: Record<string, string>;
}

export interface EnrichedContext extends PromptChainContext {
  packageManagers?: string[];
  envVars?: string[];
  buildSteps?: string;
  badges?: string[];
  fileList?: string[];
}
