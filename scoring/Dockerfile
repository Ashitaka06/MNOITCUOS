FROM node:21-alpine

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4202

CMD [ "node", "scoring.js" ]
