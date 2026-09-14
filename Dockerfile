FROM node:20-alpine

WORKDIR /app

COPY Backend/package.json Backend/package-lock.json ./

RUN npm ci --omit=dev

COPY Backend/server.js ./
COPY Backend/config ./config
COPY Backend/middleware ./middleware
COPY Backend/models ./models
COPY Backend/routes ./routes

EXPOSE 5000

CMD ["node", "server.js"]
