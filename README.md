# Global Forest Watch API Gateway

This repository is the entry point for the Global Forest Watch API. The
API consists of many microservices, which are managed and routed to by
this gateway. This application is also responsible for transparently
proxying requests to the [old API](https://github.com/wri/gfw-api),
which continues to service requests for endpoints that have not yet been
rebuilt.

1. [How does it work?](#how-does-it-work)
2. [Getting Started](#getting-started)
3. [Deployment](#deployment)
4. [Documentation](#documentation)

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

## Getting Started

### OS X

We're using Docker which, luckily for you, means that getting the
application running locally should be fairly painless. First, make sure
that you have [Docker Compose](https://docs.docker.com/compose/install/)
installed on your machine.

If you've not used Docker before, you may need to set up some defaults:

```
docker-machine create --driver virtualbox default
docker-machine start default
eval $(docker-machine env default)
```

Now we're ready to actually get the application running:

```
git clone https://github.com/Vizzuality/api-gateway.git
cd api-gateway
npm install
npm run develop
```

In case it's not obvious (it's not), grab your Docker machine's IP:

```
docker-machine ip
```

The application will be running on port 8000.

## Deployment

The application is deployed to Heroku, and thus is thankfull rather easy
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

## Documentation

The services are documented using [Swagger](http://swagger.io/) specifications.
