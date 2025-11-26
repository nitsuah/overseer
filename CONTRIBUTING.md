# Contributing to Overseer

Thank you for your interest in contributing to Overseer! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, constructive, and professional in all interactions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, Node version)

### Suggesting Features

1. Check if the feature has been suggested in Issues or ROADMAP.md
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Potential implementation approach

### Pull Requests

1. **Fork the repository** and create a new branch
2. **Follow the coding standards**:
   - Use TypeScript
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation as needed

3. **Test your changes**:
   - Ensure the build passes: `npm run build`
   - Test locally: `npm run dev`
   - Verify no TypeScript errors

4. **Update documentation**:
   - Update README.md if adding features
   - Update ROADMAP.md and TASKS.md
   - Add entries to CHANGELOG.md
   - Update FEATURES.md for new capabilities

5. **Commit messages**:
   - Use clear, descriptive commit messages
   - Format: `type: description`
   - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
   - Example: `feat: add dark mode toggle`

6. **Submit the PR**:
   - Reference related issues
   - Describe what changed and why
   - Include screenshots for UI changes

## Development Setup

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Quick Start

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/overseer.git
cd overseer

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

## Project Structure

```bash
overseer/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   └── page.tsx           # Main dashboard
├── components/            # React components
├── lib/                   # Utility functions and parsers
├── netlify/functions/     # Netlify serverless functions
├── database/              # Database schema
├── docs/                  # Technical documentation
└── templates/             # Documentation templates
```

## Coding Standards

### TypeScript

- Use strict type checking
- Avoid `any` types when possible
- Define interfaces for complex objects

### React Components

- Use functional components with hooks
- Keep components focused and reusable
- Use descriptive prop names

### Styling

- Use Tailwind CSS utility classes
- Follow existing color scheme
- Ensure responsive design

### Database

- Use parameterized queries
- Handle errors gracefully
- Add migrations for schema changes

## Documentation Standards

All root-level documentation files should follow these formats:

### ROADMAP.md

- Organized by quarters
- Use checkboxes for completion status
- Include brief descriptions

### TASKS.md

- Sections: Done, In Progress, Todo
- Use checkboxes
- Keep descriptions concise

### METRICS.md

- Table format for metrics
- Include units and timestamps
- Update regularly

### FEATURES.md

- Categorized by feature type
- Include implementation status
- Document tech stack

## Testing

- Run tests: `npm test`
- Check coverage: `npm run coverage`
- Parser tests achieve 87.5% branch coverage (vitest)

See [ROADMAP.md](./ROADMAP.md) for planned testing improvements.

## Questions?

- Check existing documentation
- Search closed issues
- Open a new issue for discussion

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Overseer! 🚀

<!--
AGENT INSTRUCTIONS:
This file provides contribution guidelines for the project.

When updating:
1. Keep instructions clear and actionable
2. Update development setup steps as dependencies change
3. Maintain coding standards section as patterns evolve
4. Add examples for common contribution scenarios
5. Ensure all referenced files (SETUP.md, README.md) exist and are current
6. Test setup instructions to verify accuracy
-->
