# Load the node image from Docker Hub
# Node.js and NPM already installed
FROM node:16 as builder

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
COPY tsoa.json ./

COPY . .

RUN npm ci

RUN npm run build

# Smaller node image
FROM node:slim

## Environment variables
ENV NODE_ENV production
ENV PORT=8080

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

COPY --from=builder /usr/src/app/dist ./dist

# Install app dependencies
RUN npm ci --omit=dev --ignore-scripts
USER node

# Expose the port
EXPOSE "${PORT}"
# Define the runtime
CMD [ "node", "dist/src/index.js" ]
