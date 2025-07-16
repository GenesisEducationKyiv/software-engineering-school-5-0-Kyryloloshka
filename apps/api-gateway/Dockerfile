# ---- Build stage ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY apps/api-gateway ./apps/api-gateway
COPY libs ./libs
COPY proto ./proto
COPY nest-cli.json ./
COPY tsconfig*.json ./
COPY .env .
RUN pnpm build:gateway

# ---- Production stage ----
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/proto ./proto
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/apps/api-gateway/main.js"] 