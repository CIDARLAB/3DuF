FROM node:14 as base
WORKDIR /src/app/

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "run", "serve"]
