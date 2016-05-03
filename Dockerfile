FROM node:latest
MAINTAINER raul.requero@vizzuality.com

# RUN npm install -g grunt-cli bunyan pm2 && pm2 install pm2-mongodb && pm2 install pm2-redis
RUN npm install -g grunt-cli bunyan pm2
ENV NAME api-gateway
ENV USER microservice

RUN groupadd -r $USER && useradd -r -g $USER $USER

RUN mkdir -p /opt/$NAME
COPY package.json /opt/$NAME/package.json
RUN cd /opt/$NAME && npm install

COPY entrypoint.sh /opt/$NAME/entrypoint.sh
COPY config /opt/$NAME/config

WORKDIR /opt/$NAME

COPY ./app /opt/$NAME/app

# Tell Docker we are going to use this ports
EXPOSE 8000 35729
# USER $USER

ENTRYPOINT ["./entrypoint.sh"]
