FROM node:26-alpine

WORKDIR /app

COPY package*.json ./
COPY simplauth-api/package*.json ./simplauth-api/
COPY simplauth-web/package*.json ./simplauth-web/

RUN npm ci

COPY shared/ ./shared/
COPY /simplauth-web ./simplauth-web

WORKDIR /app/simplauth-web

CMD ["npm", "run", "dev"]