FROM node:24-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update \
  && apt-get install --no-install-recommends -y openssl \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable

WORKDIR /app

FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
COPY packages/shared/package.json packages/shared/package.json
# The root postinstall builds the shared package. Keep the files required by
# that build in this layer; the rest of the source is copied in the build stage.
COPY packages/shared/tsconfig.json packages/shared/tsconfig.json
COPY packages/shared/src packages/shared/src
COPY patches patches

RUN pnpm install --frozen-lockfile

FROM dependencies AS build

COPY backend backend
COPY packages/shared packages/shared

# Prisma only parses this URL while generating the client; it does not connect.
ENV DIRECT_URL="postgresql://build:build@localhost:5432/build"

RUN pnpm --filter @almacen/shared build \
  && pnpm --filter backend build

FROM base AS production

ENV NODE_ENV="production"
ENV PORT="3000"

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/backend/node_modules ./backend/node_modules
COPY --from=dependencies /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/generated ./backend/generated
COPY --from=build /app/backend/prisma ./backend/prisma
COPY --from=build /app/backend/prisma.config.ts ./backend/prisma.config.ts
COPY --from=build /app/backend/package.json ./backend/package.json
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

USER node

EXPOSE 3000

CMD ["node", "backend/dist/index.js"]
