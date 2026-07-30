# ─── Stage 1: Build the Vite SPA ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .

# Vite bakes env vars at BUILD time → must be passed as build args
ARG VITE_ENGINE_HOST
ARG VITE_SUPABASE_PROJECT_ID
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_URL
ENV VITE_ENGINE_HOST=$VITE_ENGINE_HOST \
    VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY \
    VITE_SUPABASE_URL=$VITE_SUPABASE_URL

RUN npm run build

# ─── Stage 2: Serve as a NON-ROOT container ───────────────────────────────────
# nginx-unprivileged runs as UID 101 (no root), listens on 8080
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
