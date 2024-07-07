FROM node:14

WORKDIR /app

COPY . .

RUN npm install

# install mariadb for healthcheck
RUN apt-get update && apt-get install -y mariadb-client

EXPOSE 5001

CMD ["node", "index.js"]

# Keep the container running for debugging purposes
# CMD ["tail", "-f", "/dev/null"]
