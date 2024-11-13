# Stage 1: Build React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Build Node.js backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./

# Stage 3: Production image
FROM node:20-alpine
WORKDIR /app

# Copy built frontend assets
COPY --from=frontend-builder /app/client/dist ./public

# Copy backend files and dependencies
COPY --from=backend-builder /app/server/package*.json ./
COPY --from=backend-builder /app/server/node_modules ./node_modules
COPY --from=backend-builder /app/server .

# Create volume for SQLite database
VOLUME /app/data

# Environment variables with defaults
ENV PORT=3000 \
    HOST=0.0.0.0 \
    FRONTEND_BASEURL=http://localhost:3000 \
    CORS_ORIGIN=http://localhost:3000 \
    NODE_ENV=production

EXPOSE 3000

CMD ["node", "server.js"]