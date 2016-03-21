FROM node:latest
MAINTAINER raul.requero@vizzuality.com


RUN npm install -g grunt-cli
ENV NAME api-gateway
ENV USER microservice

RUN groupadd -r $USER && useradd -r -g $USER $USER

RUN mkdir -p /opt/$NAME
ADD package.json /opt/$NAME/package.json
RUN cd /opt/$NAME && npm install

COPY entrypoint.sh /opt/$NAME/entrypoint.sh
COPY config /opt/$NAME/config

WORKDIR /opt/$NAME

ADD ./app /opt/$NAME/app

# Tell Docker we are going to use this ports
EXPOSE 3100 35729
USER $USER

ENTRYPOINT ["./entrypoint.sh"]
