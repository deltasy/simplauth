FROM node:26-alpine

WORKDIR /api

COPY "package.json" .
RUN npm install

COPY . .
RUN npx prisma generate

CMD ["npm", "start"]
