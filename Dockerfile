FROM node:14-alpine

WORKDIR /app

COPY . .

RUN npm install

# install mariadb for healthcheck
RUN apk update && apk add mariadb-client

EXPOSE 5001

CMD ["sh", "-c", "npm run db:migrate && npm run start"]

# Keep the container running for debugging purposes
# CMD ["tail", "-f", "/dev/null"]
