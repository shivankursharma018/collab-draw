
# Use Node.js 18 LTS
FROM node:18

WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./

RUN npm install

# Copy all source files
COPY . .

# Build Next.js (creates .next/ for production)
RUN npm run build

# Expose app port
EXPOSE 3000

# Run custom server (with Next.js + Socket.IO)
CMD ["npm", "start"]

