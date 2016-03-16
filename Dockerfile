FROM node:latest
MAINTAINER raul.requero@vizzuality.com

RUN groupadd -r apigateway && useradd -r -g apigateway apigateway

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/api-gateway/src && cp /tmp/package.json /opt/api-gateway/package.json && cp -a /tmp/node_modules /opt/api-gateway/node_modules

COPY .jshintrc /opt/api-gateway/.jshintrc
COPY Gruntfile.js /opt/api-gateway/Gruntfile.js
COPY index.js /opt/api-gateway/index.js
COPY entrypoint.sh /opt/api-gateway/entrypoint.sh

WORKDIR /opt/api-gateway

ADD ./src /opt/api-gateway/src
ADD ./test /opt/api-gateway/test
ADD ./config /opt/api-gateway/config

# Tell Docker we are going to use this ports
EXPOSE 8000 35729
# USER apigateway

ENTRYPOINT ["./entrypoint.sh"]
# The command to run our app when the container is run
# CMD ["npm", "run", "develop"]
