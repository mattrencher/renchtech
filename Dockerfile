FROM node:20-bullseye-slim

# Install Python and native build tools required by sqlite3/node-gyp
RUN apt-get update && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
# Force sqlite3 to compile from source so it links against this container's glibc
# instead of downloading a prebuilt binary built against a newer glibc
RUN npm_config_build_from_source=true npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
