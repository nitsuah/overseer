# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest| :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability, please report it by emailing the maintainers at [security@ghoverseer.netlify.app](mailto:security@ghoverseer.netlify.app). You can expect:

1. **Acknowledgment**: We'll acknowledge receipt of your vulnerability report within 48 hours.
2. **Updates**: We'll send you regular updates about our progress.
3. **Disclosure**: We'll notify you when the vulnerability is fixed.
4. **Credit**: We'll credit you in the release notes (unless you prefer to remain anonymous).

### What to Include

When reporting a vulnerability, please include:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the issue
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity (critical issues prioritized). We aim to provide a fix or mitigation within 30 days for critical vulnerabilities.

## Security Best Practices

When contributing to this project:

- Keep dependencies up to date using `npm update`.
- Follow secure coding practices, including input validation and output encoding.
- Use environment variables for sensitive data.
- Never commit API keys, passwords, or tokens.
- Review code changes for security implications.

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions.
2. Audit code to find any similar problems.
3. Prepare fixes for all supported versions.
4. Release new versions as soon as possible. We will publicly disclose the vulnerability details after a patch is available, allowing reasonable time for users to update.