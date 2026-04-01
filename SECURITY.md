# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please open a [GitHub Security Advisory](../../security/advisories/new) rather than a public issue.

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (optional)

All reports will be acknowledged and addressed promptly.

## Security Best Practices

### Container Security

This container runs as `nobody` (non-root) by default.

Recommended Kubernetes deployment:

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  runAsGroup: 1000
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities:
    drop:
      - ALL
```

### Configuration

- Mount `config.json` as a read-only volume (`:ro`)
- Do not store secrets in `config.json` — use env vars for sensitive values
- Restrict network exposure — this is a static page server; no inbound connections are needed beyond the single HTTP port

### Image

- Based on `node:22-alpine` (minimal attack surface)
- No shell utilities or package managers in the final image layer
- Images are signed and built via GitHub Actions — verify with `cosign` if needed

## Supported Versions

| Version | Supported |
|---|---|
| latest | ✅ |
| < latest | ❌ |
