# Security Policy

## Supported Versions

As this is an early-stage project, we currently support only the latest version.

| Version  | Supported          |
| -------- | ------------------ |
| latest   | :white_check_mark: |
| < latest | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please email security concerns to: domhryshaiev@gmail.com

Include the following information:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if you have one)

### What to Expect

- **Acknowledgment**: We'll acknowledge receipt of your report within 48 hours
- **Updates**: We'll keep you informed of progress as we investigate
- **Resolution**: We'll work to release a fix as quickly as possible
- **Credit**: We'll acknowledge your contribution (unless you prefer to remain anonymous)

## Security Considerations

### API Keys

- Never commit API keys to the repository
- Use environment variables (`.env.development`) for sensitive credentials
- The `.env.example` file should contain placeholder values only

### Dependencies

- We regularly update dependencies to patch security vulnerabilities
- Dependabot alerts are enabled for this repository
- Critical security updates are prioritized

### Data Handling

- User data is stored securely in Supabase

## Security Updates

Security updates will be released as soon as possible after vulnerabilities are identified and fixed. Users should keep their installations up to date.

Thank you for helping keep Habitrack secure!
