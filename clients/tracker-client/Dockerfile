FROM node:22.15.0-alpine AS base
ENV NODE_ENV="production"
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

ARG VITE_API_BASE_URL="/api"
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN corepack enable && \
    corepack prepare pnpm@10.10.0 --activate && \
    pnpm install turbo --global


FROM base AS builder

RUN apk update
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml* ./
COPY . .
RUN turbo prune --scope=@big-d/tracker-client --docker


FROM base AS installer
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/out/json/ .
COPY --from=builder /usr/src/app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /usr/src/app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /usr/src/app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@big-d/tracker-client


FROM nginx:1.27.5-alpine AS runner
WORKDIR /usr/src/app
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=installer /usr/src/app/clients/tracker-client/dist /var/www/static/
COPY --from=installer /usr/src/app/clients/tracker-client/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
