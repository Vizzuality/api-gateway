FROM node:latest
MAINTAINER raul.requero@vizzuality.com

RUN groupadd -r apigateway && useradd -r -g apigateway apigateway
WORKDIR /home/api-gateway
COPY . /home/api-gateway

RUN npm install

COPY ./entrypoint.sh /
# Tell Docker we are going to use this ports
EXPOSE 8000 35729
USER apigateway

ENTRYPOINT ["/entrypoint.sh"]
# The command to run our app when the container is run
# CMD ["npm", "run", "develop"]
