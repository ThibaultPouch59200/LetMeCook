FROM node:current-bookworm-slim AS client-build
WORKDIR /app/client

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

FROM node:current-bookworm-slim AS server-deps
WORKDIR /app/server

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

FROM node:current-bookworm-slim AS runtime
WORKDIR /app/server

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=server-deps /app/server/node_modules ./node_modules
COPY server/ ./
COPY --from=client-build /app/client/dist ./public

EXPOSE 3000

CMD ["node", "index.js"]