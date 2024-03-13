FROM node:21-alpine

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4203

CMD [ "node", "authentication.js" ]