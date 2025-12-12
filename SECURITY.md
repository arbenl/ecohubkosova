# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously at EcoHub Kosova. If you discover a security vulnerability, please follow these steps:

### 1. Do NOT Create a Public Issue

Security vulnerabilities should never be reported via public GitHub issues, as this could put users at risk.

### 2. Contact Us Privately

Send an email to **<security@ecohubkosova.com>** (or the project maintainers directly) with:

- A detailed description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Any suggestions for fixing it (if applicable)

### 3. What to Expect

- **Acknowledgment**: We will acknowledge your report within 48 hours
- **Updates**: We will keep you informed about our progress
- **Resolution**: We aim to resolve critical vulnerabilities within 7 days
- **Credit**: With your permission, we will credit you in our security advisories

## Security Best Practices

### For Contributors

1. **Never commit secrets** - Use environment variables for all sensitive data
2. **Validate all input** - Use Zod schemas for runtime validation
3. **Escape output** - React handles this by default, but be careful with `dangerouslySetInnerHTML`
4. **Use HTTPS** - All production traffic must be encrypted
5. **Keep dependencies updated** - Dependabot is configured for automated updates

### Environment Variables

Sensitive configuration should be stored securely:

| Variable               | Security Level | Description               |
| ---------------------- | -------------- | ------------------------- |
| `NEXT_PUBLIC_*`        | Public         | Safe to expose to browser |
| `SUPABASE_SERVICE_KEY` | Secret         | Server-only, admin access |
| `SENTRY_AUTH_TOKEN`    | Secret         | Only for build process    |

### Authentication Security

- Passwords are hashed by Supabase Auth (bcrypt)
- Sessions are managed via secure, HTTP-only cookies
- Rate limiting is implemented on auth endpoints
- Password reset tokens expire after use

### Content Security Policy

We implement a strict CSP header:

- `default-src 'self'` - Only load resources from same origin
- `script-src 'self'` - No inline scripts in production
- `frame-ancestors 'none'` - Prevent clickjacking

## Security Headers

The following headers are set on all responses:

| Header                      | Value                             | Purpose               |
| --------------------------- | --------------------------------- | --------------------- |
| `X-Frame-Options`           | `DENY`                            | Prevent clickjacking  |
| `X-Content-Type-Options`    | `nosniff`                         | Prevent MIME sniffing |
| `Referrer-Policy`           | `strict-origin-when-cross-origin` | Control referrer info |
| `Permissions-Policy`        | `camera=(), microphone=()...`     | Disable unused APIs   |
| `Strict-Transport-Security` | `max-age=31536000`                | Enforce HTTPS         |

## Dependency Security

- Dependabot is configured for weekly security scans
- All PRs run security checks before merge
- We follow semantic versioning for stability

## Acknowledgments

We thank the following individuals for responsibly disclosing security issues:

_No disclosures yet - be the first!_

---

Thank you for helping keep EcoHub Kosova secure! 🔒
