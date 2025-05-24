FROM node:21-alpine3.18 AS base

FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the package manager
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Rebuild the source code only when needed
FROM base AS builder
RUN apk add --no-cache openssl1.1-compat

ARG version
ARG app_env

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# クライアント側で実行するjsファイルに埋め込む環境変数設定
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
RUN apk add --no-cache openssl1.1-compat

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# サーバ側で実行時に使う環境変数設定
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000

CMD ["node", "server.js"]
