FROM node:26-alpine

WORKDIR /app

# Copiar as dependências de todos os workspaces para não dar invalidação de contrato (definido no package principal)
COPY package*.json ./
COPY simplauth-api/package*.json ./simplauth-api/
COPY simplauth-web/package*.json ./simplauth-web/

RUN npm ci

COPY shared/ ./shared/
COPY simplauth-api/ ./simplauth-api/

WORKDIR /app/simplauth-api
           
RUN npx prisma generate
RUN npx tsc --noEmit

CMD ["npx", "tsx", "./src/server.ts"]