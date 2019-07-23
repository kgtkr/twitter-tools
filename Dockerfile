FROM node:10.15.3

ENV HOME=/home/app

WORKDIR $HOME

COPY . $HOME

RUN npm i -g ts-node && \
    npm i && \
    npm run build
