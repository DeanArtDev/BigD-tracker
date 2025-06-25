FROM node:22.15.0-slim AS base
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
RUN turbo prune --scope=@big-d/tracker-api --docker


FROM base AS installer
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/out/json/ .
COPY --from=builder /usr/src/app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /usr/src/app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /usr/src/app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@big-d/tracker-api


FROM node:22.15.0-slim AS runner
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
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/apps/tracker-api/package.json ./apps/tracker-api/package.json
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/apps/tracker-api/dist ./apps/tracker-api/dist
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/apps/tracker-api/node_modules ./apps/tracker-api/node_modules
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/libs/exceptions ./libs/exceptions
COPY scripts/bootstrap.sh /usr/src/app/bootstrap.sh
COPY ./apps/tracker-api/swagger /usr/src/app/apps/tracker-api/swagger


ARG API_PORT=4002
ENV API_PORT=${API_PORT}
EXPOSE ${API_PORT}

USER root
RUN chmod +x /usr/src/app/bootstrap.sh
ENTRYPOINT ["/usr/src/app/bootstrap.sh", "dist/tools/migrator.js"]
WORKDIR /usr/src/app/apps/tracker-api
CMD node dist/src/main.js
