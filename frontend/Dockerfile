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
FROM nginxinc/nginx-unprivileged:alpine

## Environment variables
ENV NODE_ENV production
ENV PORT=8080

COPY --from=builder /usr/src/frontend/dist/frontend /usr/share/nginx/html/

# Expose the port
EXPOSE "${PORT}"

# change to the non-root user
USER nginx

# Start NGINX server with non-root user
CMD ["nginx", "-g", "daemon off;"]
