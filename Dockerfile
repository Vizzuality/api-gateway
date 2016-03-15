FROM node:latest
MAINTAINER raul.requero@vizzuality.com

WORKDIR /home/api-gateway
ADD . /home/api-gateway
#RUN npm update -g npm

# RUN npm install

# Tell Docker we are going to use this port
EXPOSE 8000
EXPOSE 35729

# The command to run our app when the container is run
# CMD ["npm", "run", "develop"]
