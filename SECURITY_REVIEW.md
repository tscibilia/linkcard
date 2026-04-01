# Security Review

Last reviewed: 2026-04-01

## Scope

Server-side rendering of a static personal landing page. No database, no auth, no user input processed.

## Findings

### ✅ Passed

| Area | Detail |
|---|---|
| **XSS** | All user-controlled config values passed through `esc()` HTML entity encoder before rendering. Raw HTML is only allowed in `section.text` (about body) which is operator-controlled, not user input. |
| **Injection** | No shell execution, no database queries, no dynamic `eval`. Config is JSON-parsed only. |
| **Path traversal** | `CONFIG_PATH` env var controls config file path. Static assets served from `/app/public` via Express `static()` — no dynamic file reads from user input. |
| **Dependencies** | Single runtime dependency: `express`. No auth libraries, no database drivers, no templating engines. |
| **Container** | Runs as `nobody`. Final image is multi-stage; build tools not present at runtime. |
| **Network** | Binds to `0.0.0.0` on a single port. No outbound connections initiated by the server. |
| **Secrets** | No secrets in image or config. Env vars used for overrides only. |

### ⚠️ Notes

| Area | Detail |
|---|---|
| **`section.text` raw HTML** | The `about` section renders its `text` field as raw HTML to support `<strong>`, `<a>` etc. This is intentional and operator-controlled (not user input), but should not be exposed to untrusted config sources. |
| **Google Fonts** | The Inter font is loaded from `fonts.googleapis.com`. This is a third-party request from the client browser. Omit the font link in `server.js` and use a system font stack if this is a concern. |
| **No CSP header** | No `Content-Security-Policy` header is set. Low risk for a static page with no JS beyond the entrance animation, but can be added to Express if desired. |

## Recommendations

- [ ] Add `helmet` middleware if CSP/security headers become a requirement
- [ ] Self-host Inter font to eliminate the Google Fonts dependency
- [ ] Pin base image to a specific digest in `Dockerfile` for supply-chain integrity
