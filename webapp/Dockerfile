FROM node:21-alpine

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4242

CMD [ "node", "webapp.js" ]
