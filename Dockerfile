FROM node:latest
MAINTAINER raul.requero@vizzuality.com

RUN groupadd -r apigateway && useradd -r -g apigateway apigateway

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/project/api-gateway && cp -a /tmp/node_modules /opt/project/

WORKDIR /opt/project/api-gateway

ADD . /opt/project/api-gateway

# Tell Docker we are going to use this ports
EXPOSE 8000 35729
USER apigateway

ENTRYPOINT ["./entrypoint.sh"]
# The command to run our app when the container is run
# CMD ["npm", "run", "develop"]
