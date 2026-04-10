# linkcard

<div align="center">

[![GitHub Release](https://img.shields.io/github/v/release/tscibilia/linkcard?style=for-the-badge&sort=semver)](https://github.com/tscibilia/linkcard/releases)&nbsp;&nbsp;
[![Build](https://img.shields.io/github/actions/workflow/status/tscibilia/linkcard/build.yaml?style=for-the-badge)](https://github.com/tscibilia/linkcard/actions/workflows/build.yaml)&nbsp;&nbsp;
[![License](https://img.shields.io/github/license/tscibilia/linkcard?style=for-the-badge)](https://github.com/tscibilia/linkcard/blob/main/LICENSE)&nbsp;&nbsp;

</div>

> A minimal personal landing page — like a business card for the web. Configured entirely via a single `config.json`, served by a lightweight Node/Express container.

## Features

- **Single config file** — one `config.json` drives the entire page: profile, theme, sections, links
- **Sections** — `about`, `links` (checklist), `contact` (button grid)
- **Theming** — background color or image with optional gradient overlay, per-theme accent colors, Inter font
- **Auto-darkening sections** — successive sections shade via `color-mix()` from a single base color
- **All icons built-in** — Twitter, Facebook, Instagram, LinkedIn, GitHub, YouTube, TikTok, Phone, Email
- **Env var overrides** — any `config.json` key can be overridden at runtime via environment variables
- **Non-root container** — runs as `nobody`, compatible with Kubernetes `runAsNonRoot: true`
- **Health check** — `/healthz` endpoint for k8s liveness/readiness probes
- **Fade-in animation** — smooth page entrance on load

## Quick Start

```bash
cp example.config.json config.json
# Edit config.json with your details
docker compose up
```

Visit `http://localhost:3000`

## Configuration

Copy `example.config.json` to `config.json` and edit:

```json
{
  "site":    { "title": "Your Name" },
  "profile": { "name": "Your Name", "subtitle": "Your Role", "avatar": "https://..." },
  "theme":   { "backgroundColor": "#C7E3F2", "sectionBackgroundColor": "#4299FF", ... },
  "sections": [
    { "type": "about",   "heading": "About",   "text": "..." },
    { "type": "links",   "heading": "Projects", "items": [...] },
    { "type": "contact", "heading": "Contact",  "items": [...] }
  ]
}
```

See [`example.config.json`](example.config.json) for all available options.

### Background image

```json
"theme": {
  "backgroundImage": "https://example.com/photo.jpg",
  "backgroundGradient": true
}
```

### Env var overrides

| Variable | Overrides |
|---|---|
| `PROFILE_NAME` | `profile.name` |
| `PROFILE_SUBTITLE` | `profile.subtitle` |
| `PROFILE_AVATAR` | `profile.avatar` |
| `THEME_BG_COLOR` | `theme.backgroundColor` |
| `THEME_SECTION_BG_COLOR` | `theme.sectionBackgroundColor` |
| `THEME_ACCENT_COLOR` | `theme.accentColor` |
| `CONFIG_PATH` | Path to config file (default: `/app/config.json`) |
| `PORT` | Server port (default: `3000`) |

## Docker

### Docker Compose

```yaml
services:
  linkcard:
    image: ghcr.io/tscibilia/linkcard:latest
    ports:
      - "3000:3000"
    volumes:
      - ./config.json:/app/config.json:ro
```

### Kubernetes

```yaml
containers:
  - name: linkcard
    image: ghcr.io/tscibilia/linkcard:latest
    ports:
      - containerPort: 3000
    securityContext:
      runAsNonRoot: true
      runAsUser: 1000
      readOnlyRootFilesystem: true
    livenessProbe:
      httpGet:
        path: /healthz
        port: 3000
    volumeMounts:
      - name: config
        mountPath: /app/config.json
        subPath: config.json
```

## Development

```bash
npm install
cp example.config.json config.json
npm run dev   # uses --watch for auto-reload
```

## License

MIT
