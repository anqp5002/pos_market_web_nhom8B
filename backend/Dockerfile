# Multi-stage Dockerfile for Express POS Backend

# ==========================================
# Stage 1: Build & Compiling
# ==========================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies including devDependencies to compile TS
RUN npm ci

# Copy tsconfig and source files
COPY tsconfig.json ./
COPY src ./src/

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Remove development packages and re-install only production packages
RUN npm prune --production

# ==========================================
# Stage 2: Clean Runtime Environment
# ==========================================
FROM node:18-alpine AS runner

WORKDIR /app

# Set environments
ENV NODE_ENV=production
ENV PORT=4000

# Copy necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000

CMD ["npm", "run", "start"]
