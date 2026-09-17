FROM node:26-alpine

WORKDIR /app

# Copiar as dependências de todos os workspaces para não dar invalidação de contrato (definido no package principal)
COPY package*.json ./
COPY watcherz-api/package*.json ./watcherz-api/
COPY watcherz-web/package*.json ./watcherz-web/

RUN npm ci

COPY shared/ ./shared/
COPY watcherz-api/ ./watcherz-api/

WORKDIR /app/watcherz-api
           
RUN npx prisma generate
RUN npx tsc --noEmit

CMD ["npm", "start"]