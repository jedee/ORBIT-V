# ── Stage 1: Build ────────────────────────────────────────────────
# Use Node 20 Alpine — lightweight, no unnecessary system packages
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first (layer caching — only reinstalls if these change)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source and build
COPY . .
RUN npm run build
# Output is in /app/dist


# ── Stage 2: Serve ────────────────────────────────────────────────
# Nginx Alpine — ~25MB image total vs ~200MB Node image
FROM nginx:stable-alpine AS production

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config for SPA routing (all routes → index.html)
# Also sets cache headers for static assets
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check — container orchestrators (ECS, Cloud Run) use this
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
