# Load the node image from Docker Hub
# Node.js and NPM already installed
FROM node:16 as builder

# Create app directory
WORKDIR /usr/src/backend

COPY backend/public-api/package*.json ./

RUN npm ci

# Copy source code and build dependencies
COPY backend/public-api/src ./src
COPY backend/public-api/tsoa.json ./
COPY backend/public-api/tsconfig.json ./
COPY common/types/ ../../common/types

# Copy firebase config
COPY frontend/src/environments/environment.ts ../../frontend/src/environments/environment.ts

RUN npm run build

# Smaller node image
FROM node:slim

## Environment variables
ENV NODE_ENV production
ENV PORT=8080

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY backend/public-api/package*.json ./

COPY --from=builder /usr/src/backend/dist ./dist

# Install app dependencies
RUN npm ci --omit=dev --ignore-scripts

# change to the non-root user
USER node

# Expose the port
EXPOSE "${PORT}"
# Define the runtime
CMD [ "node", "dist/src/backend/src/index.js" ]
