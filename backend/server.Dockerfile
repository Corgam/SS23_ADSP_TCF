# Load the node image from Docker Hub
# Node.js and NPM already installed
FROM node:16

## Environment variables
ENV PORT=8080

# Create app directory
WORKDIR /usr/src/app

# Copy app dependencies files
COPY package.json ./
COPY package-lock.json ./

# Install app dependencies
RUN npm ci

# Bundle app source
# Makes sure the `npm install` is run when it changes
COPY . .

# Expose the port
EXPOSE ${PORT
# Define the runtime
CMD ["npm", "run", "start"]
