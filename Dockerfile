FROM asia-southeast1-docker.pkg.dev/krystal-public-assets/cache/node:24-alpine AS base

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

CMD ["npm", "start"]
