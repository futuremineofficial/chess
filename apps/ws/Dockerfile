FROM node:22-slim

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY . .

# Build with esbuild
RUN npx esbuild ./src/index.ts --bundle --platform=node --outfile=dist/index.js --external:@prisma/client --external:prisma

# Expose port (Railway sets PORT dynamically)
EXPOSE ${PORT:-8080}

CMD ["node", "dist/index.js"]
