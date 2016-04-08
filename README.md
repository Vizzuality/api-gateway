# Global Forest Watch API Gateway

Master: [![Build Status](https://travis-ci.org/Vizzuality/api-gateway.svg?branch=master)](https://travis-ci.org/Vizzuality/api-gateway) Develop: [![Build Status](https://travis-ci.org/Vizzuality/api-gateway.svg?branch=develop)](https://travis-ci.org/Vizzuality/api-gateway)



This repository is the entry point for the Global Forest Watch API. The
API consists of many microservices, which are managed and routed to by
this gateway. This application is also responsible for transparently
proxying requests to the [old API](https://github.com/wri/gfw-api),
which continues to service requests for endpoints that have not yet been
rebuilt.

1. [How does it work?](#how-does-it-work)
2. [Requirements](#requirements)
3. [Executing](#executing)
4. [Deployment](#deployment)
5. [Documentation](#documentation)

## How does it work?

The API is made up of many microservices that communicate with one
another using HTTP. This repository contains the gateway that maintains
a list of available services (in a MongoDB database) and routes requests
to the services based on the given path, and also routes requests to the
old Python API.

* If a given path matches existing microservices, it is directed there.
* If a given path does not match any microservices, it is proxied to the old API.

The [Dispatcher](app/src/routes/dispatcherRouter.js) middleware and
[DispatcherService](app/src/services/dispatcherService.js) are
responsible for determining where to route requests.

### How are microservices discovered?

The services are responsible for registering themselves with the gateway
and making it aware that they are available to receive requests. There
exists a [services REST API](docs/service_registry.md) that is used for
this purpose.

## Requirements

The requirements for the API Gateway greatly depend on how you plan on running it. There are two ways to run the API:
- Natively
- Using [Docker](https://www.docker.com/) containers

In both cases, you will need `git` to checkout the project.

### Requirements for native execution

If you want to run the API Gateway natively, you will need to install and configure:

- [Node.js and npm](https://nodejs.org/)
- [MongoDB](https://www.mongodb.org/)

### Requirements for docker

If you are going to use containers, you will need:

- [Docker](https://www.docker.com/)
- [docker-compose](https://docs.docker.com/compose/)

## Executing

Start by checking out the project from github

```
git clone https://github.com/Vizzuality/api-gateway.git
cd api-gateway
```

Once this is done, you can either run the application natively, or inside a docker container.
If you decide to run it natively, you will need to first install the required npm libraries, and the start the application:

```
npm install
./gateway.sh start
```

If, on the other hand, you plan on using docker instead, you only need to fire up the containers

```
./gateway.sh develop
```

The application will be running on port 8000 of the corresponding host (typically localhost)

## Deployment

The application is deployed to Heroku, and thus is thankfully rather easy
to deploy.

Setup Heroku for the repository:

```
heroku git:remote -a api-gateway-staging -r staging
```

And deploy as normal:

```
git push staging master
```

### Configuration

It is necessary to define these environment variables:

* NODE_ENV => Environment (prod, staging, dev)

### Authentication

The following environment variables can be used to setup HTTP Basic
Authentication:

* `BASIC_AUTH`: 'on'/'off' depending on if the authentication is active
* `BASIC_AUTH_USERNAME`: username
* `BASIC_AUTH_PASSWORD`: password


To activate the auth login in api-gateway, you set the AUTH_ENABLED environment variable to true:
````
AUTH_ENABLED = true
````

To config oauth providers (twitter, facebook and google), you can create a file 'auth.json' in the config folder or declare environment variables.
The auth.json file has the next structure:
````
{
    "google": {
        "clientID": "<clientIdGoogle>",
        "clientSecret": "<clientSecretGoogle>",
        "scope": "https://www.googleapis.com/auth/plus.me"
    },
    "facebook": {
        "clientID": "<clientIdFacebook>",
        "clientSecret": "<clientSecretFacebook>",
        "scope": "email"
    },
    "twitter": {
        "consumerKey": "<consumerKeyTwitter>",
        "consumerSecret": "<consumerSecretTwitter>"
    }

}
```

In environment variables:
````
FB_CLIENTID = <Facebook client id>
FB_CLIENTSECRET = <Facebook Client secret>
FB_SCOPE = <Facebook scope. ex: email>
GOOGLE_CLIENTID = <Google client id>
GOOGLE_CLIENTSECRET = <Google client secret>
GOOGLE_SCOPE = <Google scope. Ex: https://www.googleapis.com/auth/plus.me>
TW_CONSUMERKEY = <Twitter consumer key>
TW_CONSUMERSECRET = <Twitter consumer secret>

```

If you don't want enable any oauth provider, you don't set the environment variables or properties in json of this provider

## Documentation

The services are documented using [Swagger](http://swagger.io/) specifications.


# TODO:
* [ ]  Add support to several endpoint in each service url
