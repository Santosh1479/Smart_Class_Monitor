# FROM node:20

# WORKDIR /APP

# COPY package*.json ./
# RUN npm install bcrypt --build-from-source

# RUN npm install

# COPY . .

# EXPOSE 3000

# CMD ["node", "server.js"] 
# Use Node 20 Alpine
FROM node:20-alpine

# Install build tools for bcrypt
RUN apk add --no-cache python3 make g++ git

WORKDIR /APP

# Copy package files first for caching
COPY package*.json ./

# Install dependencies (bcrypt will build correctly)
RUN npm install

# Copy source code
COPY . .

# Expose backend port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
