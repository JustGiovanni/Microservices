# Use Node.js as base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the application code
COPY . .

# Expose port 5001 for the Submit service
EXPOSE 5001

# Start the application
CMD ["node", "server.js"]
