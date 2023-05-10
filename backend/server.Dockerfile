# Load the node image from Docker Hub
# Node.js and NPM already installed
FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Copy app dependencies files
COPY package.json ./
COPY package-lock.json ./

# Install app dependencies
RUN npm install
# For production include: RUN npm ci --omit=dev

# Bundle app source
# Makes sure the `npm install` is run when it changes
COPY . .

# Expose the port
EXPOSE 8080
# Define the runtime
CMD ["node", "server.js"]