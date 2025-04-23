# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=22.15.0
FROM node:${NODE_VERSION}-slim as base

# Remix/Prisma app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y curl wget

# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -y && apt-get install -y openssl

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


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Remove development dependencies
RUN npm prune --production

COPY --from=build ./node_modules/@prisma-app ./node_modules/@prisma-app

# Start the server by default, this can be overwritten at runtime
CMD [ "npm", "run", "start" ]
