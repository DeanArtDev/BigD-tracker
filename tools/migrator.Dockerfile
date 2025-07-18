FROM node:22.15.0-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update && \
    corepack enable && \
    corepack prepare pnpm@10.10.0 --activate && \
    pnpm install turbo --global && \
    apt-get clean && rm -rf /var/lib/apt/lists/*


FROM base AS installer
RUN apt-get update && \
    apt-get install -y openssl && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app
COPY . .
RUN pnpm install --frozen-lockfile

USER root
RUN chmod +x ./tools/scripts/migrator.sh
ENTRYPOINT ["./tools/scripts/migrator.sh"]