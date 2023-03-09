FROM node:16 as base


COPY . .

RUN npm ci

WORKDIR /src/server

RUN npm ci

EXPOSE 6060
CMD npm run start