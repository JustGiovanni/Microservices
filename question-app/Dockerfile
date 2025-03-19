# Use Node.js as base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the application code
COPY . .

# Expose port 5000 for the Question service
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
