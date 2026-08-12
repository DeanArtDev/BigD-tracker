FROM node:24.13-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update && \
    corepack enable && \
    corepack prepare pnpm@10.10.0 --activate && \
    pnpm install turbo --global && \
    apt-get clean && rm -rf /var/lib/apt/lists/*


FROM base AS builder
RUN apt-get update && \
    apt-get install -y openssl && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml* ./
COPY . .
RUN turbo prune --scope=@big-d/goal-service --docker


FROM base AS installer
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/out/json/ .
COPY --from=builder /usr/src/app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /usr/src/app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /usr/src/app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@big-d/goal-service


FROM node:24.13-slim AS runner
WORKDIR /usr/src/app
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      openssl \
      postgresql-client \
      procps \
      bash \
      coreutils \
      gosu \
      curl && \
    rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=installer --chown=nodejs:nodejs /usr/src/app/package.json ./package.json
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/apps/goal-service/package.json ./apps/goal-service/package.json
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/apps/goal-service/dist ./apps/goal-service/dist
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/apps/goal-service/node_modules ./apps/goal-service/node_modules

COPY --from=installer --chown=nodejs:nodejs /usr/src/app/libs/exceptions/dist ./libs/exceptions/dist
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/libs/exceptions/package.json ./libs/exceptions/package.json
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/libs/exceptions/node_modules ./libs/exceptions/node_modules

COPY --from=installer --chown=nodejs:nodejs /usr/src/app/libs/api-contracts/dist ./libs/api-contracts/dist
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/libs/api-contracts/package.json ./libs/api-contracts/package.json
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/libs/api-contracts/node_modules ./libs/api-contracts/node_modules

COPY --from=installer --chown=nodejs:nodejs /usr/src/app/libs/database/dist ./libs/database/dist
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/libs/database/package.json ./libs/database/package.json
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/libs/database/node_modules ./libs/database/node_modules

COPY --from=installer --chown=nodejs:nodejs /usr/src/app/libs/api-utils/dist ./libs/api-utils/dist
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/libs/api-utils/package.json ./libs/api-utils/package.json
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/libs/api-utils/node_modules ./libs/api-utils/node_modules

COPY --from=installer --chown=nodejs:nodejs /usr/src/app/libs/observability/dist ./libs/observability/dist
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/libs/observability/package.json ./libs/observability/package.json
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/libs/observability/node_modules ./libs/observability/node_modules

ARG API_PORT=4055
ENV API_PORT=${API_PORT}
EXPOSE ${API_PORT}

USER nodejs
WORKDIR /usr/src/app/apps/goal-service
CMD node dist/src/main.js
