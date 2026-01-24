# Use Node.js 18 (LTS)
FROM node:18-slim

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the backend source code
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Start the application
CMD ["node", "app.js"]
