/**
 * Tests for template file paths and availability.
 * Ensures that template reorganizations don't break functionality.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

describe('Template File Paths', () => {
  const templatesDir = path.join(process.cwd(), 'templates');
  
  describe('Community Standards Templates', () => {
    const communityStandardsDir = path.join(templatesDir, 'community-standards');
    
    it('should have README.md template in community-standards', async () => {
      const templatePath = path.join(communityStandardsDir, 'README.md');
      await expect(fs.access(templatePath)).resolves.not.toThrow();
    });
    
    it('should have ROADMAP.md template in community-standards', async () => {
      const templatePath = path.join(communityStandardsDir, 'ROADMAP.md');
      await expect(fs.access(templatePath)).resolves.not.toThrow();
    });
    
    it('should have TASKS.md template in community-standards', async () => {
      const templatePath = path.join(communityStandardsDir, 'TASKS.md');
      await expect(fs.access(templatePath)).resolves.not.toThrow();
    });
    
    it('should have METRICS.md template in community-standards', async () => {
      const templatePath = path.join(communityStandardsDir, 'METRICS.md');
      await expect(fs.access(templatePath)).resolves.not.toThrow();
    });
    
    it('should have FEATURES.md template in community-standards', async () => {
      const templatePath = path.join(communityStandardsDir, 'FEATURES.md');
      await expect(fs.access(templatePath)).resolves.not.toThrow();
    });
    
    it('should have CODE_OF_CONDUCT.md template in community-standards', async () => {
      const templatePath = path.join(communityStandardsDir, 'CODE_OF_CONDUCT.md');
      await expect(fs.access(templatePath)).resolves.not.toThrow();
    });
    
    it('should have CONTRIBUTING.md template in community-standards', async () => {
      const templatePath = path.join(communityStandardsDir, 'CONTRIBUTING.md');
      await expect(fs.access(templatePath)).resolves.not.toThrow();
    });
    
    it('should have SECURITY.md template in community-standards', async () => {
      const templatePath = path.join(communityStandardsDir, 'SECURITY.md');
      await expect(fs.access(templatePath)).resolves.not.toThrow();
    });
    
    it('should have CHANGELOG.md template in community-standards', async () => {
      const templatePath = path.join(communityStandardsDir, 'CHANGELOG.md');
      await expect(fs.access(templatePath)).resolves.not.toThrow();
    });
  });
  
  describe('GitHub Templates', () => {
    const githubDir = path.join(templatesDir, '.github');
    
    it('should have copilot-instructions.md template', async () => {
      const templatePath = path.join(githubDir, 'copilot-instructions.md');
      await expect(fs.access(templatePath)).resolves.not.toThrow();
    });
    
    it('should have pull_request_template.md template', async () => {
      const templatePath = path.join(githubDir, 'pull_request_template.md');
      await expect(fs.access(templatePath)).resolves.not.toThrow();
    });
    
    it('should have bug_report.md template', async () => {
      const templatePath = path.join(githubDir, 'ISSUE_TEMPLATE', 'bug_report.md');
      await expect(fs.access(templatePath)).resolves.not.toThrow();
    });
  });
  
  describe('Other Templates', () => {
    it('should have Docker template', async () => {
      const templatePath = path.join(templatesDir, 'docker', 'Dockerfile');
      await expect(fs.access(templatePath)).resolves.not.toThrow();
    });
    
    it('should have .gitignore template for JavaScript', async () => {
      const templatePath = path.join(templatesDir, 'gitignore', '.gitignore');
      await expect(fs.access(templatePath)).resolves.not.toThrow();
    });
    
    it('should have .gitignore template for Python', async () => {
      const templatePath = path.join(templatesDir, 'gitignore', '.gitignore-python');
      await expect(fs.access(templatePath)).resolves.not.toThrow();
    });
    
    it('should have linting templates', async () => {
      const pyprojectPath = path.join(templatesDir, 'linting', 'pyproject.toml');
      const eslintPath = path.join(templatesDir, 'linting', 'eslint.config.mjs');
      
      await expect(fs.access(pyprojectPath)).resolves.not.toThrow();
      await expect(fs.access(eslintPath)).resolves.not.toThrow();
    });
  });
  
  describe('Template Content Validation', () => {
    it('should have non-empty README.md template', async () => {
      const templatePath = path.join(templatesDir, 'community-standards', 'README.md');
      const content = await fs.readFile(templatePath, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain('#'); // Should have markdown heading
    });
    
    it('should have valid ROADMAP.md template with sections', async () => {
      const templatePath = path.join(templatesDir, 'community-standards', 'ROADMAP.md');
      const content = await fs.readFile(templatePath, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
      expect(content.toLowerCase()).toMatch(/roadmap|milestone|quarter|goal/);
    });
    
    it('should have valid METRICS.md template with metrics keywords', async () => {
      const templatePath = path.join(templatesDir, 'community-standards', 'METRICS.md');
      const content = await fs.readFile(templatePath, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
      expect(content.toLowerCase()).toMatch(/metric|coverage|test|line/);
    });
  });
});
