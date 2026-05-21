# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma
RUN npx prisma generate && npm run build

# Stage 2: Run
FROM node:20-alpine AS runner
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

EXPOSE 3000
CMD ["npx", "prisma", "migrate", "deploy", "&&", "node", "dist/index.js"]
