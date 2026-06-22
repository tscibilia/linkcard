FROM node:24-alpine@sha256:156b55f92e98ccd5ef49578a8cea0df4679826564bad1c9d4ef04462b9f0ded6 AS build

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

FROM node:24-alpine@sha256:156b55f92e98ccd5ef49578a8cea0df4679826564bad1c9d4ef04462b9f0ded6

# Configurable UID/GID — override at build or runtime
ARG APP_UID=1000
ARG APP_GID=1000

# Patch OS-level CVEs and strip npm/yarn (not needed at runtime — reduces attack surface)
RUN apk upgrade --no-cache && \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm \
           /usr/local/lib/node_modules/corepack /usr/local/bin/corepack \
           /opt/yarn* /usr/local/bin/yarn /usr/local/bin/yarnpkg

# Use existing group if GID taken (e.g. 1000 = node in alpine), else create
RUN (getent group ${APP_GID} >/dev/null 2>&1 || addgroup -g ${APP_GID} -S appgroup) && \
    APP_GROUP=$(getent group ${APP_GID} | cut -d: -f1) && \
    adduser -u ${APP_UID} -S appuser -G ${APP_GROUP} 2>/dev/null || \
    echo "[docker] UID ${APP_UID} already exists, reusing"

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY server.js ./
COPY public/ ./public/

# Default config — mount your own at /app/config.json
COPY example.config.json ./config.json

# Make app readable by any UID
RUN chmod -R a+rX /app

USER ${APP_UID}:${APP_GID}

ENV PORT=3000
ENV CONFIG_PATH=/app/config.json

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost:3000/healthz || exit 1

CMD ["node", "server.js"]
