ARG NODE_VERSION=24.19.0
ARG PNPM_VERSION=11.21.0
ARG TURBO_VERSION=2.10.9

FROM node:${NODE_VERSION}-slim AS base
ENV NODE_ENV=production
ARG PNPM_VERSION
ARG TURBO_VERSION
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME/bin:$PNPM_HOME:$PATH
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable && \
    corepack prepare pnpm@${PNPM_VERSION} --activate && \
    pnpm install --global turbo@${TURBO_VERSION}

# ------------- PRUNER -------------
FROM base AS pruner
WORKDIR /usr/src/app
COPY . .
RUN turbo prune @big-d/web-client --docker

# ------------- BUILDER -------------
FROM base AS builder
ARG PORT
ENV PORT=${PORT}
ARG NEXT_PUBLIC_HTTP_API_URL
ARG NEXT_PUBLIC_WS_API_URL
ARG BACK_TO_BACK_URL
ENV NEXT_PUBLIC_HTTP_API_URL=$NEXT_PUBLIC_HTTP_API_URL
ENV NEXT_PUBLIC_WS_API_URL=$NEXT_PUBLIC_WS_API_URL
ENV BACK_TO_BACK_URL=$BACK_TO_BACK_URL

WORKDIR /usr/src/app
COPY --from=pruner /usr/src/app/out/json/ .
COPY --from=pruner /usr/src/app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /usr/src/app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN --mount=type=cache,id=big-d-pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile
COPY --from=pruner /usr/src/app/out/full/ .
COPY turbo.json ./turbo.json
RUN --mount=type=cache,id=big-d-web-client-next,target=/usr/src/app/clients/web-client/.next/cache \
    pnpm turbo run build --filter=@big-d/web-client

# ------------- RUNNER -------------
FROM node:${NODE_VERSION}-slim AS runner
ARG PORT
ENV PORT=${PORT}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0

WORKDIR /usr/src/app
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/clients/web-client/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/clients/web-client/.next/static ./clients/web-client/.next/static
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/clients/web-client/public ./clients/web-client/public

USER nextjs
WORKDIR /usr/src/app/clients/web-client
CMD ["node", "server.js"]
