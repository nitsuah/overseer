# Templates Directory

This directory contains all the template files used by Overseer to generate best practice files for repositories.

## 📁 Directory Structure

```text
templates/
├── .github/                    # GitHub-specific templates
│   ├── dependabot.yml         # Dependabot configuration
│   └── workflows/
│       ├── ci.yml             # JavaScript/TypeScript CI workflow
│       └── ci-python.yml      # Python CI workflow
│
├── pre-commit/                 # Pre-commit hooks configurations
│   ├── .pre-commit-config.yaml        # Generic/JS/TS pre-commit hooks
│   └── .pre-commit-config-python.yaml # Python-specific hooks (black, isort, flake8, mypy)
│
├── testing/                    # Testing framework configurations
│   ├── vitest.config.ts       # Vitest config for JavaScript/TypeScript
│   └── pytest.ini             # Pytest config for Python
│
├── linting/                    # Linting and code style configurations
│   ├── eslint.config.mjs      # ESLint config for JavaScript/TypeScript
│   ├── pyproject.toml         # Ruff/Black/isort config for Python
│   └── .flake8                # Flake8 config for Python
│
├── docker/                     # Docker configurations
│   ├── Dockerfile             # Multi-stage Node.js Dockerfile
│   └── docker-compose.yml     # Docker Compose with app, db, redis
│
├── gitignore/                  # .gitignore templates
│   ├── .gitignore             # Generic gitignore (JS/TS focused)
│   └── .gitignore-python      # Python-specific gitignore
│
├── env/                        # Environment variable templates
│   └── .env.example           # Comprehensive env template
│
└── community-standards/        # Community health files
    ├── README.md              # Basic README template
    ├── CONTRIBUTING.md        # Contributing guidelines
    ├── CODE_OF_CONDUCT.md     # Code of Conduct
    ├── LICENSE                # MIT License template
    ├── SECURITY.md            # Security policy
    ├── CHANGELOG.md           # Changelog template
    ├── FEATURES.md            # Features documentation
    ├── METRICS.md             # Project metrics
    ├── ROADMAP.md             # Project roadmap
    └── TASKS.md               # Task tracking
```

## 🔧 Language-Aware Templates

Overseer automatically selects the appropriate template based on the repository's detected language:

### JavaScript/TypeScript Projects

- **Pre-commit**: `.pre-commit-config.yaml` (basic hooks)
- **Testing**: `vitest.config.ts`
- **Linting**: `eslint.config.mjs`
- **CI/CD**: `.github/workflows/ci.yml`
- **Gitignore**: `.gitignore`

### Python Projects

- **Pre-commit**: `.pre-commit-config-python.yaml` (black, isort, flake8, mypy)
- **Testing**: `pytest.ini` (with coverage configuration)
- **Linting**: `pyproject.toml` (ruff, black, isort)
- **CI/CD**: `.github/workflows/ci-python.yml`
- **Gitignore**: `.gitignore-python`

## 📝 Template Usage

Templates are used in two ways:

1. **AI-Generated Content** (`/api/repos/generate-best-practice`)
   - Templates serve as examples for AI to generate customized content
   - AI analyzes README, CONTRIBUTING, and repo context
   - Produces context-aware, project-specific configurations

2. **Direct Template Usage** (`/api/repos/[name]/fix-all-practices`)
   - Templates are used as-is when AI generation is not available
   - Fallback for bulk operations
   - Quick fixes for missing best practices

## 🎯 Adding New Templates

When adding a new template:

1. Place it in the appropriate category folder
2. Use descriptive filenames (include language suffix if language-specific)
3. Update `getTemplateFileName()` in `app/api/repos/generate-best-practice/route.ts`
4. Update `getDefaultTemplate()` for fallback content
5. Add corresponding AI prompt in `lib/ai-prompt-chain.ts` if needed
6. Update this README with the new template location

## 🔍 Template Guidelines

- **Comments**: Include helpful comments explaining configuration options
- **Placeholders**: Use clear placeholders (e.g., `YOUR_API_KEY_HERE`)
- **Best Practices**: Follow current industry standards for each technology
- **Versions**: Use stable, well-tested versions of tools
- **Flexibility**: Templates should work for most projects but be easily customizable
