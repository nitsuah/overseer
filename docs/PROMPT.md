# Agent Instructions: Updating Repository Documentation for Overseer Compliance

**Purpose**: This document provides comprehensive instructions for AI agents tasked with updating repository documentation to meet Overseer's parsing and display requirements.

**Context**: Overseer is a meta-repository intelligence dashboard that parses standardized markdown files (ROADMAP.md, TASKS.md, METRICS.md, FEATURES.md, etc.) to provide health scoring, project tracking, and documentation compliance monitoring across multiple repositories.

---

## ⚠️ CRITICAL: Read Repository Context First

**Before making ANY changes:**

1. **Read the entire repository** - Understand what the project does, its tech stack, and its current state
2. **Read existing documentation** - Do NOT blindly overwrite existing content with templates
3. **Preserve custom content** - The goal is to conform to format expectations while keeping the repository's unique information
4. **Only update on non-main branches** - Never push directly to main/master unless explicitly authorized

**Golden Rule**: You are ENHANCING and CONFORMING existing docs, not replacing them wholesale.

---

## 📋 Required Documentation Files

Overseer expects these files at the repository root:

### Core Tracked Documents (Parsed & Displayed)

1. **README.md** - Project overview and setup instructions
2. **ROADMAP.md** - High-level objectives and quarterly plans
3. **TASKS.md** - Granular task tracking by status
4. **METRICS.md** - Custom repository metrics
5. **FEATURES.md** - Features organized by category

### Standard Documents (Presence Tracked)

- **LICENSE.md** - Project license
- **CHANGELOG.md** - Version history
- **CONTRIBUTING.md** - Contribution guidelines

### Community Standards (Tracked for Health Score)

- **CODE_OF_CONDUCT.md** - Community behavior guidelines
- **SECURITY.md** - Security policy and vulnerability reporting
- **Issue Templates** - `.github/ISSUE_TEMPLATE/` directory
- **PR Template** - `.github/pull_request_template.md`

---

## 📐 Format Requirements by Document Type

### 1. ROADMAP.md

**Purpose**: Track high-level objectives and quarterly milestones.

**Required Structure**:

```markdown
# 🗺️ [Project Name] Roadmap

## Q[Quarter] [Year]: [Phase Name] ([Status]) [Emoji]

- [x] Completed item description
- [ ] Planned item description

## Q[Quarter] [Year]: [Next Phase] ([Status]) [Emoji]

- [ ] Future item
```

**CRITICAL RULES**:

- Use `## Q[Quarter] [Year]:` for quarter headers (e.g., `## Q4 2025:`)
- Status indicators in title: `(Completed)`, `(IN PROGRESS)`, `(Planned)`
- Use checkboxes: `[x]` for done, `[ ]` for not done
- Include emojis for visual clarity: 🚀 ✅ 🏗️ 🤖
- Keep descriptions concise (1-2 lines max per item)

**Parser Expectations**:

- Overseer parses `## Q` headers to identify quarters
- Checkbox status determines progress tracking
- Items under each quarter are grouped together

**Example**:

```markdown
# 🗺️ MyProject Roadmap

## Q4 2025: Foundation (Completed) 🚀

- [x] Initial project setup and architecture
- [x] Core API implementation
- [x] Basic authentication system

## Q1 2026: Feature Expansion (IN PROGRESS) 🏗️

- [x] User dashboard
- [ ] Advanced search functionality
- [ ] Export/import features
```

---

### 2. TASKS.md

**Purpose**: Track granular, actionable tasks by status.

**Required Structure**:

```markdown
# Tasks

## Done

- [x] Completed task description
- [x] Another completed task

## In Progress

- [ ] Currently working on this
- [ ] Also in progress

## Todo

- [ ] Future task
- [ ] Another future task

### [Optional Subsection]

- [ ] Grouped related tasks
```

**CRITICAL RULES**:

- **EXACTLY** these section names: `## Done`, `## In Progress`, `## Todo` (case-sensitive)
- Use checkboxes: `[x]` for Done, `[ ]` for In Progress and Todo
- Done items should have `[x]`, not `[ ]`
- Keep tasks actionable and specific
- Subsections under Todo (e.g., `### Phase 7: Security`) are allowed

**Parser Expectations**:

- Overseer ONLY recognizes these exact section names
- Tasks are grouped by section for display
- Checkbox state is visual only; section determines status

**Common Mistakes to Avoid**:

- ❌ `### Todo` (wrong heading level)
- ❌ `## TODO` (wrong case)
- ❌ `## Completed` (wrong section name - use "Done")
- ❌ `[x]` in Todo section (inconsistent - should be `[ ]`)

**Example**:

```markdown
# Tasks

## Done

- [x] Set up project repository
- [x] Configure CI/CD pipeline
- [x] Write initial documentation

## In Progress

- [ ] Implement user authentication
- [ ] Design database schema

## Todo

### Phase 1: Core Features

- [ ] Build REST API
- [ ] Add rate limiting
- [ ] Write API documentation

### Phase 2: Advanced Features

- [ ] WebSocket support
- [ ] GraphQL endpoint
```

---

### 3. METRICS.md

**Purpose**: Self-report project metrics for display in Overseer dashboard.

**Required Structure**:

```markdown
# Metrics

## Core Metrics

| Metric        | Value | Notes             |
| ------------- | ----- | ----------------- |
| Code Coverage | 85%   | Vitest unit tests |
| Build Time    | ~5s   | Local dev build   |
| Test Files    | 12    | Unit + E2E        |

## Health

| Metric       | Value      | Notes           |
| ------------ | ---------- | --------------- |
| Open Issues  | 3          | GitHub issues   |
| Health Score | 92/100     | Overseer score  |
| Last Updated | 2025-11-27 | Last audit date |
```

**CRITICAL RULES**:

- Use markdown tables with `| Metric | Value | Notes |` format
- `Code Coverage` is extracted and displayed prominently - include percentage
- Keep sections: `## Core Metrics` and `## Health`
- Update `Last Updated` date when changing metrics

**Parser Expectations**:

- Overseer extracts `Code Coverage` value and stores in database
- All metrics are displayed in detail panel
- Tables must have header row with separators

**Example**:

```markdown
# Metrics

## Core Metrics

| Metric          | Value | Notes                     |
| --------------- | ----- | ------------------------- |
| Code Coverage   | 92%   | Jest unit tests           |
| Build Time      | ~8s   | Production build          |
| Bundle Size     | 250KB | Gzipped                   |
| Test Files      | 18    | Unit, integration, E2E    |
| API Routes      | 24    | REST endpoints            |
| Database Tables | 6     | PostgreSQL                |
| Lines of Code   | 12.5K | Excluding tests/generated |

## Health

| Metric       | Value      | Notes                |
| ------------ | ---------- | -------------------- |
| Open Issues  | 2          | GitHub issues        |
| Open PRs     | 1          | Under review         |
| Health Score | 95/100     | Overseer self-rating |
| Last Updated | 2025-11-27 | Last metrics refresh |
| Uptime       | 99.9%      | Last 30 days         |
```

---

### 4. FEATURES.md

**Purpose**: Document features organized by category with implementation status.

**Required Structure**:

```markdown
# [Project Name] Features

## [Category Name]

### 🔵 [Sub-Category or Feature Group]

- **Feature Name**: Description of the feature and what it does
- **Another Feature**: More details about this feature
```

**CRITICAL RULES**:

- Use `## [Category Name]` for top-level categories
- Use `### 🔵 [Sub-Category]` for feature groups
- Use `- **Feature Name**: Description` format for each feature
- Include emojis in sub-category headers for visual clarity
- Keep descriptions clear and concise (1-3 sentences)

**Parser Expectations**:

- Overseer extracts features by category
- Displays up to 3 category cards in detail panel
- Features are shown as bullet points under their category

**Example**:

```markdown
# MyProject Features

## Core Capabilities

### 🔐 Authentication & Security

- **OAuth Integration**: Support for GitHub, Google, and email-based authentication
- **JWT Tokens**: Secure session management with automatic refresh
- **Role-Based Access Control**: Granular permissions system for different user types

### 📊 Data Management

- **Real-time Sync**: Automatic synchronization with external data sources
- **Export/Import**: Support for CSV, JSON, and Excel formats
- **Data Validation**: Schema-based validation with custom rules

## User Interface

### 🎨 Design System

- **Component Library**: Reusable UI components built with React
- **Dark Mode**: Full theme customization with system preference detection
- **Responsive Layout**: Mobile-first design that adapts to all screen sizes
```

---

### 5. README.md

**Purpose**: Primary project documentation - overview, setup, and usage.

**Required Sections** (flexible order):

1. **Project Name/Title** (H1)
2. **Description/Tagline** - Brief explanation of what the project does
3. **Features** - Key capabilities (can link to FEATURES.md)
4. **Installation** - How to set up the project
5. **Usage** - How to run/use the project
6. **Configuration** - Environment variables, settings
7. **Contributing** - Link to CONTRIBUTING.md or inline guidelines
8. **License** - Link to LICENSE or inline

**CRITICAL RULES**:

- Keep README concise - avoid duplicating content from other docs
- Link to other docs (CONTRIBUTING.md, ROADMAP.md, etc.) instead of duplicating
- Include setup/installation steps that actually work
- Document environment variables if any exist
- Add badges for build status, coverage, etc. if available

**Example Structure**:

````markdown
# Project Name

> Brief tagline or description

## Features

- Key feature 1
- Key feature 2
- Key feature 3

[See full feature list in FEATURES.md](./FEATURES.md)

## Installation

\```bash
npm install
\```

## Usage

\```bash
npm run dev
\```

## Configuration

\```env
DATABASE_URL=your_database_url
API_KEY=your_api_key
\```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE.md](./LICENSE.md)
````

---

### 6. CHANGELOG.md

**Purpose**: Track version history and changes.

**Required Format**: Follow [Keep a Changelog](https://keepachangelog.com/) standard.

**Structure**:

```markdown
# Changelog

## [Unreleased]

### Added

- New features in development

### Changed

- Modifications to existing features

## [Version] - YYYY-MM-DD

### Added

- New features in this version

### Fixed

- Bug fixes
```

**CRITICAL RULES**:

- Use semantic versioning: `## [1.0.0] - 2025-11-27`
- Group changes: Added, Changed, Deprecated, Removed, Fixed, Security
- Keep `## [Unreleased]` section at top for upcoming changes
- Date format: `YYYY-MM-DD`

---

### 7. CONTRIBUTING.md

**Purpose**: Guide contributors on how to contribute to the project.

**Required Sections**:

1. **How to Contribute** - Overview of contribution process
2. **Code Standards** - Coding style, linting, formatting
3. **Pull Request Process** - How to submit PRs
4. **Commit Message Format** - Conventional commits or other standard
5. **Development Setup** - How to set up local environment

**Example**:

```markdown
# Contributing

## How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Code Standards

- Use TypeScript
- Follow ESLint configuration
- Write tests for new features
- Update documentation

## Commit Messages

Use conventional commits format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
```

---

### 8. LICENSE.md

**Purpose**: Define project license.

**CRITICAL RULES**:

- Use standard license text (MIT, Apache, GPL, etc.)
- Include copyright holder name and year
- Don't modify standard license text

---

### 9. CODE_OF_CONDUCT.md

**Purpose**: Define community standards and behavior expectations.

**Standard**: Use [Contributor Covenant](https://www.contributor-covenant.org/) or similar.

---

### 10. SECURITY.md

**Purpose**: Define security policy and vulnerability reporting process.

**Required Sections**:

1. **Supported Versions** - Which versions receive security updates
2. **Reporting a Vulnerability** - How to report security issues
3. **Security Updates** - How security issues are handled

---

## 🎯 Workflow for Updating Documentation

### Step 1: Analyze Existing State

```text
1. Read all existing documentation files
2. Identify which files exist and which are missing
3. Note custom content that must be preserved
4. Identify format violations that need fixing
```

### Step 2: Plan Changes

```text
For each file:
- If missing: Create from template with repository-specific content
- If exists: Preserve all unique content, fix format issues only
- If malformed: Restructure while keeping all information
```

### Step 3: Execute Updates

```text
1. Create feature branch (not main!)
2. Update files one at a time
3. Validate format after each change
4. Commit with descriptive messages
```

### Step 4: Validate

```text
1. Check all required sections are present
2. Verify heading levels are correct
3. Confirm checkbox syntax is correct
4. Test that content makes sense for this repo
```

---

## 🚫 Common Mistakes to Avoid

### Don't Hallucinate Content

- ❌ Don't invent features that don't exist
- ❌ Don't fabricate metrics or statistics
- ❌ Don't create fake roadmap items
- ✅ Use actual repository information
- ✅ Mark placeholders clearly: "TBD" or "Coming soon"

### Don't Blindly Apply Templates

- ❌ Don't replace existing ROADMAP with empty template
- ❌ Don't delete custom TASKS sections
- ❌ Don't overwrite specific metrics with generic ones
- ✅ Merge template structure with existing content
- ✅ Preserve all unique/custom information

### Don't Break Parser Expectations

- ❌ Don't use `## TODO` instead of `## Todo`
- ❌ Don't skip required section names
- ❌ Don't use wrong heading levels
- ✅ Follow exact section name requirements
- ✅ Use correct markdown syntax

### Don't Remove Custom Attributes

- ❌ Don't delete custom sections in TASKS.md (e.g., `### Phase 7`)
- ❌ Don't remove extra columns in METRICS.md tables
- ❌ Don't strip emoji or formatting that adds clarity
- ✅ Keep all custom content that doesn't break parsing
- ✅ Add to format, don't subtract from content

---

## 🔍 Repository-Specific Considerations

### For Web Applications

- Document API endpoints in FEATURES.md
- Include deployment instructions in README
- Track frontend/backend metrics separately in METRICS.md

### For Libraries/Packages

- Document API/exports in README
- Include usage examples
- Track adoption metrics if available

### For CLI Tools

- Document commands and flags in README
- Include installation methods (npm, brew, etc.)
- Track binary sizes in METRICS.md

### For Research/Experiments

- Focus on ROADMAP for experiment phases
- Document methodology in README
- Track experiment results in METRICS.md

---

## ✅ Validation Checklist

Before submitting changes, verify:

- [ ] All required files exist
- [ ] Section names match exactly (case-sensitive)
- [ ] Heading levels are correct (## for major sections)
- [ ] Checkbox syntax is correct (`[x]` or `[ ]`)
- [ ] Tables have proper headers and separators
- [ ] No content was hallucinated
- [ ] All existing unique content was preserved
- [ ] Commit messages are descriptive
- [ ] Changes are on a feature branch, not main

---

## 📚 Reference: Overseer's Health Score Components

Understanding what Overseer measures helps you prioritize documentation:

| Component             | Weight | What It Measures                                        |
| --------------------- | ------ | ------------------------------------------------------- |
| Documentation Health  | 30%    | Presence and health of 8 tracked docs                   |
| Testing & Quality     | 20%    | Test coverage, framework detection, CI/CD status        |
| Best Practices        | 20%    | 10 checks: CI/CD, linting, hooks, Docker, etc.          |
| Community Standards   | 15%    | 8 checks: CODE_OF_CONDUCT, SECURITY, templates, etc.    |
| Activity & Engagement | 15%    | Commit frequency, PR/Issue counts, contributor activity |

**Implication**: Focus first on the 8 tracked docs (README, ROADMAP, TASKS, METRICS, FEATURES, LICENSE, CHANGELOG, CONTRIBUTING) as they have the highest impact on health scores.

---

## 🎓 Examples of Good vs. Bad Updates

### Example 1: TASKS.md Update

**❌ BAD** (Breaks parser):

```markdown
# Tasks

### Todo Items

- Implement feature X
- Fix bug Y

### Completed

- [x] Setup project
```

**✅ GOOD** (Follows format):

```markdown
# Tasks

## Done

- [x] Setup project
- [x] Configure development environment

## In Progress

- [ ] Implement feature X

## Todo

- [ ] Fix bug Y
- [ ] Add integration tests
```

### Example 2: ROADMAP.md Update

**❌ BAD** (Hallucinated content):

```markdown
# Roadmap

## Q4 2025

- [x] Launch to 1 million users
- [x] Achieve $10M ARR
- [ ] IPO preparation
```

**✅ GOOD** (Actual repository plans):

```markdown
# MyProject Roadmap

## Q4 2025: Initial Release (IN PROGRESS) 🚀

- [x] Core feature implementation
- [x] Basic test coverage
- [ ] Documentation completion
- [ ] Beta release

## Q1 2026: Feature Expansion (Planned) 🏗️

- [ ] User authentication system
- [ ] API versioning
- [ ] Mobile responsiveness
```

### Example 3: METRICS.md Update

**❌ BAD** (Fake metrics):

```markdown
| Metric        | Value | Notes            |
| ------------- | ----- | ---------------- |
| Code Coverage | 100%  | Perfect coverage |
| Performance   | 10x   | Super fast       |
```

**✅ GOOD** (Real or honest metrics):

```markdown
| Metric        | Value | Notes                    |
| ------------- | ----- | ------------------------ |
| Code Coverage | TBD   | Tests not yet written    |
| Build Time    | ~30s  | Needs optimization       |
| Test Files    | 2     | Basic smoke tests only   |
| Last Updated  | TBD   | Awaiting initial release |
```

---

## 🤖 Agent Self-Check Questions

Before finalizing documentation updates, ask yourself:

1. **Did I read the entire codebase?** → Understanding prevents hallucination
2. **Is this content specific to THIS repository?** → Generic = bad
3. **Did I preserve all existing unique content?** → Don't delete custom info
4. **Are section names EXACTLY correct?** → Parser depends on exact matches
5. **Would a human maintainer approve this?** → Quality check
6. **Can Overseer parse this successfully?** → Format validation
7. **Did I commit to a feature branch?** → Never push to main directly

---

## 📞 When in Doubt

If you're unsure about:

- **Format requirements** → Reference this document and existing Overseer docs
- **Repository-specific content** → Read the codebase thoroughly
- **What to include** → Include more context rather than less
- **Custom sections** → Keep them if they don't break parsing
- **Metric values** → Use "TBD" rather than inventing numbers

**Remember**: It's better to mark something as "TBD" or "Coming soon" than to hallucinate content that doesn't exist.

---

## 📄 Document Version

- **Version**: 1.0
- **Last Updated**: 2025-11-27
- **Maintained By**: Overseer Project
- **Source**: Based on actual Overseer parsing requirements and health score calculations
