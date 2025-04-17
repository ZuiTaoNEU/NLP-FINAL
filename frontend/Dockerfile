FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Set environment variables
ENV NODE_ENV=development
ENV REACT_APP_API_URL=http://localhost:5000/api

# Expose the port
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]