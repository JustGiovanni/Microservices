# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose the port the service runs on
EXPOSE 5000

# Start the service
CMD ["npm", "start"]
