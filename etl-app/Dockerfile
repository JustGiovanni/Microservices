# Use a specific version of Node.js as a base image
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to take advantage of Docker cache
COPY package*.json ./

# Install the dependencies inside the container
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app will listen on . edit according to app
EXPOSE 5002  

# Command to start the application
CMD ["npm", "start"]
