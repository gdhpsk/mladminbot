FROM node:22
WORKDIR /app
COPY package*.json ./
COPY . .
EXPOSE 3022
CMD yarn run start