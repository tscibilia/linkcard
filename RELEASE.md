# Release Process

## Versioning

This project uses [Semantic Versioning](https://semver.org/).

| Bump | When |
|---|---|
| **Patch** `0.0.x` | Bug fixes, dependency updates, doc changes |
| **Minor** `0.x.0` | New features, new section types, new icons |
| **Major** `x.0.0` | Breaking changes to `config.json` schema |

## Release Flow

### 1. Bump the version

```bash
npm version patch   # or minor / major
```

This updates `package.json`, commits, and creates a git tag (`v0.x.x`).

### 2. Push with tags

```bash
git push && git push --tags
```

### 3. Automated from here

Pushing a `v*` tag triggers the GitHub Actions release workflow which:
- Builds a multi-platform Docker image (`linux/amd64`, `linux/arm64`)
- Pushes to `ghcr.io/tscibilia/linkcard` with tags:
  - `v0.1.2` (exact)
  - `v0.1` (minor)
  - `v0` (major)
  - `latest`
- Creates a GitHub Release with auto-generated changelog

## Current Version

See [`package.json`](package.json) for the current version.

## Image Tags

| Tag | Description |
|---|---|
| `latest` | Most recent release |
| `v0.1.2` | Exact version |
| `v0.1` | Latest patch for this minor |
| `sha-abc1234` | Specific commit (from build workflow) |
