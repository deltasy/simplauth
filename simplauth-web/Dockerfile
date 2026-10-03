FROM node:26-alpine

WORKDIR /app

COPY package*.json ./
COPY ./simplauth-web/package.json ./simplauth-web/
COPY ./shared/package.json ./shared/

RUN npm ci 

COPY ./simplauth-web/ ./simplauth-web/
COPY ./shared/ ./shared/


WORKDIR /app/simplauth-web

CMD ["npm", "run", "dev"]