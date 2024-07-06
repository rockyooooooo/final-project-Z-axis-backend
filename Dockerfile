FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install

# install mariadb for healthcheck
RUN apt-get update && apt-get install -y mariadb-client

COPY . .

EXPOSE 5001

CMD ["node", "index.js"]
