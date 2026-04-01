# linkcard — Summary

## Current State

- **Location**: `/home/tscibilia/linkcard/`
- **Main file**: `server.js`
- **Container**: `ghcr.io/tscibilia/linkcard`
- **Base image**: `node:22-alpine`
- **Runtime deps**: `express`

## Architecture

```
config.json         ← single source of truth (mount as volume)
server.js           ← Express server; reads config, renders HTML
public/style.css    ← all styles via CSS custom properties
Dockerfile          ← multi-stage, runs as nobody
docker-compose.yml  ← local dev / simple deployment
```

## What Works

- Profile hero (avatar, name, subtitle)
- `about` section — heading + rich text body
- `links` section — checklist items with partial-text linking
- `contact` section — button grid with built-in SVG icons
- Theme — single `sectionBackgroundColor` with `color-mix()` auto-darkening
- Background — solid color or image URL with optional gradient overlay
- Env var overrides for all top-level config keys
- Page fade-in / slide-up entrance animation
- Non-root container (`nobody`), k8s-compatible
- `/healthz` health check endpoint
- Responsive layout (stacks on mobile)

## Built-in Icons

`twitter` `facebook` `instagram` `linkedin` `github` `youtube` `tiktok` `phone` `email`

## Known Limitations / TODO

- No self-hosted font option (Inter loaded from Google Fonts)
- No CSP headers
- `section.text` (about body) renders raw HTML — fine for operator-controlled config, but document clearly
- No image optimisation for `avatar` — relies on external URL
- Single `config.json` only — no multi-profile support

## Version History

See [RELEASE.md](RELEASE.md) and [GitHub Releases](../../releases).
