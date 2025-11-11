# FROM node:20
# WORKDIR /APP

# COPY package*.json ./

# RUN npm install

# COPY . .

# RUN npm run build

# EXPOSE 5173

# CMD ["npm", "run","preview"] 

# Use Node 20 Alpine
FROM node:20-alpine

WORKDIR /APP

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Build the frontend
RUN npm run build

# Expose Vite/preview port
EXPOSE 5173

# Start frontend in preview mode
CMD ["npm", "run", "preview"]
