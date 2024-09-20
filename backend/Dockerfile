# Use a base image with Node.js for a Node.js application
FROM node:lts-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for dependency installation
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --production --silent

# Copy the rest of the application code
COPY . .

# Ensure the application runs as a non-root user
RUN chown -R node /usr/src/app
USER node

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "start"]
