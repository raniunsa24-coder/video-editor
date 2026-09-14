FROM node:20-alpine

WORKDIR /app

COPY Backend/package*.json ./

RUN npm install --omit=dev

COPY Backend/ .

EXPOSE 5000

CMD ["npm", "start"]
