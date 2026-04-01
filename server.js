const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const CONFIG_PATH = process.env.CONFIG_PATH || path.join(__dirname, 'config.json');

// Load config with env var overrides
function loadConfig() {
  let config;
  try {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  } catch (err) {
    console.error(`Failed to read config from ${CONFIG_PATH}:`, err.message);
    process.exit(1);
  }

  // Env var overrides (flat keys override nested config)
  const overrides = {
    SITE_TITLE:              (v) => { config.site.title = v; },
    PROFILE_NAME:            (v) => { config.profile.name = v; },
    PROFILE_SUBTITLE:        (v) => { config.profile.subtitle = v; },
    PROFILE_AVATAR:          (v) => { config.profile.avatar = v; },
    THEME_BG_COLOR:          (v) => { config.theme.backgroundColor = v; },
    THEME_CARD_BG_COLOR:     (v) => { config.theme.cardBackgroundColor = v; },
    THEME_SECTION_BG_COLOR:  (v) => { config.theme.sectionBackgroundColor = v; },
    THEME_ACCENT_COLOR:      (v) => { config.theme.accentColor = v; },
    THEME_TEXT_COLOR:         (v) => { config.theme.textColor = v; },
    THEME_SECTION_TEXT_COLOR: (v) => { config.theme.sectionTextColor = v; },
    THEME_FONT_FAMILY:       (v) => { config.theme.fontFamily = v; },
  };

  for (const [key, apply] of Object.entries(overrides)) {
    if (process.env[key]) apply(process.env[key]);
  }

  return config;
}

const config = loadConfig();

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'public')));

// Health check
app.get('/healthz', (_req, res) => res.send('ok'));

// Render page
app.get('/', (_req, res) => {
  const html = buildPage(config);
  res.type('html').send(html);
});

function buildBackground(t) {
  if (!t.backgroundImage) return t.backgroundColor || '#C7E3F2';
  const img = `url("${t.backgroundImage}") center / cover no-repeat fixed`;
  const gradient = t.backgroundGradient !== false
    ? `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)), `
    : '';
  return `${gradient}${img}`;
}

function buildPage(cfg) {
  const t = cfg.theme;
  const p = cfg.profile;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(cfg.site.title)}</title>
  ${cfg.site.favicon ? `<link rel="icon" href="${esc(cfg.site.favicon)}">` : ''}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/static/style.css">
  <style>
    :root {
      --bg: ${buildBackground(t)};
      --card-bg: ${t.cardBackgroundColor};
      --section-bg: ${t.sectionBackgroundColor};
      --accent: ${t.accentColor};
      --text: ${t.textColor};
      --section-text: ${t.sectionTextColor};
      --font: ${t.fontFamily};
      --avatar-size: ${t.avatarSize};
      --radius: ${t.borderRadius};
    }
  </style>
</head>
<body class="is-loading">
  <script>window.addEventListener('load',function(){setTimeout(function(){document.body.classList.remove('is-loading');},100);});</script>
  <main class="page">
    <section class="hero card">
      <img class="avatar" src="${esc(p.avatar)}" alt="${esc(p.name)}">
      <h1 class="name">${esc(p.name)}</h1>
      <p class="subtitle">${esc(p.subtitle)}</p>
    </section>

    ${cfg.sections.map(renderSection).join('\n')}
  </main>
</body>
</html>`;
}

function renderSection(section) {
  switch (section.type) {
    case 'about':
      return `
    <section class="content-section">
      <div class="two-col">
        <div class="col-heading">
          <h2 class="section-heading">${esc(section.heading)}</h2>
        </div>
        <div class="col-content">
          <div class="section-body"><p>${section.text}</p></div>
        </div>
      </div>
    </section>`;

    case 'links':
      return `
    <section class="content-section">
      <div class="two-col">
        <div class="col-heading">
          <h2 class="section-heading">${esc(section.heading)}</h2>
        </div>
        <div class="col-content">
          <ul class="link-list">
            ${section.items.map(item => `
            <li>
              <span class="check-icon">
                <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                  <path d="M39.4,11.2c0,.4-.2.7-.5,1l-22.8,22.8c-.2.2-.6.6-1.1.6h0c-.5,0-.8-.2-.9-.4h-.1c0-.1-12.8-12.9-12.8-12.9-.6-.6-.5-1.6.1-2.4h0c0-.1,2.4-2.5,2.4-2.5.5-.5,1.1-.7,1.6-.7.4,0,.7.2,1,.5l8.8,8.7L33.8,7c.6-.6,1.6-.5,2.4,0h.1c0,0,2.4,2.5,2.4,2.5.5.5.7,1.1.7,1.6Z" fill="#FFFFFF"/>
                </svg>
              </span>
              <span class="link-text">${renderLinkText(item)}</span>
            </li>`).join('')}
          </ul>
        </div>
      </div>
    </section>`;

    case 'contact':
      return `
    <section class="content-section">
      <div class="two-col">
        <div class="col-heading">
          <h2 class="section-heading">${esc(section.heading)}</h2>
        </div>
        <div class="col-content">
          <div class="contact-grid">
            ${section.items.map(item => `
            <a class="btn" href="${esc(item.url)}">
              ${getIcon(item.icon)}
              <span class="label">${esc(item.label)}</span>
            </a>`).join('')}
          </div>
        </div>
      </div>
    </section>`;

    default:
      return '';
  }
}

function renderLinkText(item) {
  // prefix + linked text + optional suffix
  if (item.linkText) {
    const prefix = item.text ? esc(item.text) + ' ' : '';
    const suffix = item.suffix ? ' ' + esc(item.suffix) : '';
    return `${prefix}<a href="${esc(item.url)}">${esc(item.linkText)}</a>${suffix}`;
  }
  // No linkText: link the whole text
  return `<a href="${esc(item.url)}">${esc(item.text)}</a>`;
}

function getIcon(name) {
  const icons = {
    twitter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.19 8.19 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.16z"/></svg>',
  };
  return `<span class="icon">${icons[name] || ''}</span>`;
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Linktree running on http://0.0.0.0:${PORT}`);
});
