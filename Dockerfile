FROM node:23-alpine AS runtime

RUN apk add --no-cache curl

WORKDIR /app

RUN corepack enable pnpm

COPY . .
RUN pnpm install
RUN pnpm build

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE ${PORT}

CMD ["pnpm", "start"]
