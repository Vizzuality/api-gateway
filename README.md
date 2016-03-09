# API Gateway
This repository is the base the all microservices implemented in nodejs.

## Installation in local

```bash
npm install

npm install -g bunyan  // logger system
```
Is necessary install mongodb and you set the url in file config by your environment.

## Run
Execute the next command: (Environment available: dev, test, staging, prod)

```bash
    NODE_ENV=<env> npm start
```

if you want see the logs formatted execute:

```bash
    NODE_ENV=<env> npm start | bunyan
```

## Production and Staging installation environment
Is necessary define the next environment variables:

* NODE_ENV => Environment (prod, staging, dev)

if you want securized your API:
* BASIC_AUTH: if the value is on the authentication is active, in other case not.
* BASIC_AUTH_USERNAME: Username of authentication
* BASIC_AUTH_PASSWORD: Password of authentication


# Service Registry

The api is securized with auth basic. To set authentication config, set the next environment variables:
* BASIC_AUTH: if the value is on the authentication is active, in other case not.
* BASIC_AUTH_USERNAME: Username of authentication
* BASIC_AUTH_PASSWORD: Password of authentication

The public API for register/unregister service is:

## Register service
To register service do POST request to /gateway/service
body:
````
{{
    "id": "#(service.id)",
    "name": "#(service.name)",
    "urls": [{
        "url": "/usuarios",
        "method": "GET",
        "endpoints": [{
            "method": "GET",
            "baseUrl": "#(service.uri)",
            "path": "/api/users"
        }]
    }, {
        "url": "/usuarios",
        "method": "POST",
        "endpoints": [{
            "method": "POST",
            "baseUrl": "#(service.uri)",
            "path": "/api/users"
        }]
    }]
}

````

If the id exist, the all config with this id will be deleted and insert the new configuration.
The id must be unique by microservice and version

## Unregister service
To register service do DELETE request to /gateway/service/<idService>
If possible remove all service, if you do request to /gateway/service/all

## Get services
To obtain json with the services registered, you do GET request to: /gateway/service.


REMEMBER: if the authentication is active, you attack the api with the username and password.
Example:
http://<username>:<password>@apigateway.vizzuality.com/gateway/service

## TODO:
* Add support to several endpoints in same url
* Add Circuit Breaker pattern
