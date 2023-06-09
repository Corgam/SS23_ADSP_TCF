# Load the node image from Docker Hub
# Node.js and NPM already installed
FROM node:16 as builder

# Create app directory
WORKDIR /usr/src/frontend

# Copy package.json and package-lock.json to the working directory
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

ADD ./frontend .
ADD ./common/types/ ../common/types

RUN npm run build

# Use nginx as lightweight prod image
FROM nginx:alpine

## Environment variables
ENV NODE_ENV production
ENV PORT=80

COPY --from=builder /usr/src/frontend/dist/frontend /usr/share/nginx/html/

# Expose the port
EXPOSE "${PORT}"

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]
