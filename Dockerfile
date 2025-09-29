# ---------- Builder ----------
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source
COPY nest-cli.json tsconfig*.json ./
COPY src ./src
COPY data-source.ts ./data-source.ts
COPY scripts ./scripts

# Build Nest to dist/
RUN npm run build

# ---------- Runner ----------
FROM node:20-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Only prod deps + CLI needed by migrations
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# Bring built app + scripts
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/scripts ./scripts

# Entrypoint script will wait for DB, run migrations, launch app
COPY docker/entrypoint.sh ./docker/entrypoint.sh
RUN chmod +x ./docker/entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["./docker/entrypoint.sh"]