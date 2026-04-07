# Stage 1: Install dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Copy package.json and lock file
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --frozen-lockfile

# Stage 2: Build the application
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the application code
COPY . .

# Generate Prisma Client
# This is necessary for the build step if it needs database types
RUN npx prisma generate

# Build the Next.js application
# The build process will use the production environment variables passed at build time
RUN npm run build

# Stage 3: Production image
FROM node:18-alpine AS runner
WORKDIR /app

# Set environment variable to production
ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy only necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
# Socket.IO server — required for the socket container
COPY --from=builder /app/server.js ./server.js
# Prisma schema — required for `prisma migrate deploy` on container start
COPY --from=builder /app/prisma ./prisma

# Change ownership of the app directory
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# The command to start the Next.js application
CMD ["npm", "start"]
