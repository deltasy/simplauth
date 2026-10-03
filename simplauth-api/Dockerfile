FROM node:26-alpine

WORKDIR /app

COPY package*.json ./
COPY ./simplauth-api/package.json ./simplauth-api/
COPY ./shared/package.json ./shared/

RUN npm ci

COPY ./simplauth-api/ ./simplauth-api/
COPY ./shared/ ./shared/

WORKDIR /app/simplauth-api


RUN npx prisma generate
RUN npx tsc --noEmit

RUN npm run build

RUN npm prune --omit=dev

CMD ["npm", "run", "start"]