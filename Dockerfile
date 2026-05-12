FROM node:20-bookworm-slim AS builder
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY client/package.json client/package-lock.json client/
RUN cd client && npm ci

COPY client/ client/
RUN cd client && npm run build

COPY server/package.json server/package-lock.json server/
RUN cd server && npm install

COPY server/ server/

FROM node:20-bookworm-slim AS runtime
WORKDIR /app/server

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/server/ ./

EXPOSE 3000

CMD ["node", "index.js"]