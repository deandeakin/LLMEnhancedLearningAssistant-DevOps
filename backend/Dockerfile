FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev --ignore-scripts

COPY server.js ./

EXPOSE 3000

USER node

CMD ["npm", "start"]