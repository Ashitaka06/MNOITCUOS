FROM node:21-alpine

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4200

CMD [ "node", "game.js" ]