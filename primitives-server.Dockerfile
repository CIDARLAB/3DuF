FROM node:14 as base

COPY ./src/server/package*.json ./

RUN npm i

COPY . .

WORKDIR /src/server

# CMD ["npm", "run", "start"]