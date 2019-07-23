FROM node:10.15.3

ENV HOME=/home/app

WORKDIR $HOME

COPY package.json $HOME/
COPY package-lock.json $HOME/
RUN npm i

COPY . $HOME

RUN npm run build
CMD ["npm", "start"]
