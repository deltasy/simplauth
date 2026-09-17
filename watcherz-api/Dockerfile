FROM node:26-alpine

WORKDIR /app

COPY "package.json" .
RUN npm install

COPY ./shared ./shared

WORKDIR /app/backend

COPY . .
RUN npx prisma generate

RUN npx tsc --noEmit

CMD ["npm", "start"]
