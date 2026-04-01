FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

FROM node:22-alpine

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY server.js ./
COPY public/ ./public/

# Default config — mount your own at /app/config.json
COPY example.config.json ./config.json

# Make app readable by any UID
RUN chmod -R a+rX /app

USER nobody

ENV PORT=3000
ENV CONFIG_PATH=/app/config.json

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost:3000/healthz || exit 1

CMD ["node", "server.js"]
