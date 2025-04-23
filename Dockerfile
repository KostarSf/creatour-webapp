# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=22.15.0
FROM node:${NODE_VERSION}-slim as base

# Remix/Prisma app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV=production


# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y python-is-python3 pkg-config build-essential openssl curl

# Install node modules
COPY package.json package-lock.json .npmrc ./
RUN npm install --include=dev

# Generate Prisma Client
COPY prisma .
RUN npx prisma generate

# Copy application code
COPY . .

# Build application
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Start the server by default, this can be overwritten at runtime
CMD [ "npm", "run", "start" ]
