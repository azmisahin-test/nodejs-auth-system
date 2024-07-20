FROM node:18

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install && npm cache clean --force

# Bundle app source
COPY . .

# Make the app directory owned by node user
RUN chown -R node:node /app

# Use the node user from here onwards
USER node

EXPOSE 3000
CMD ["node", "server.js"]
