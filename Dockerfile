FROM node:23-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_HOME="/corepack"

WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml .

# install runtime dependencies (including pnpm)
RUN apk add --no-cache curl
RUN corepack enable && corepack install

# install production dependencies
FROM base AS install
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# build the app and install all dependencies
FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# copy the built app and dependencies
FROM base
COPY --from=install /usr/src/app/node_modules node_modules
COPY --from=build /usr/src/app/.next .next
COPY --from=build /usr/src/app/next.config.mjs .
COPY --from=build /usr/src/app/package.json .

# set the user and environment variables
USER node
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE ${PORT}

# start the app
CMD [ "pnpm", "start" ]
