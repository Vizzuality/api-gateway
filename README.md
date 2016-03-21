# API Gateway
This repository is the base the all microservices implemented in nodejs.


## First time user
Follow these steps to start the project.

* Clone this repository: ```git clone https://github.com/Vizzuality/api-gateway.git```
* Enter in the directory (cd api-gateway)
* Execute ```npm install```
* To run in develop mode, execute: ```npm run develop```
This command, it run the server with grunt in ```http://localhost:3000``` url. If you change anything in the code, the server run the test and restart the server.
If you don't need up the server in develop mode, you can run the server with ```npm run startDev``` that run the server with the dev config. In Dev config, the server listen in ```http://localhost:3000```

### Structure

#### Routes Folder
This folder contain the distinct files that define the routes of the microservice. All files must be end with suffix Router. Ex:

```bash
/routes
------ /api
---------- userRouter.js // in this file define /user

The complete path is: /api/user
```

The name of subfolders of the routes folder define the subpath of the endpoints

#### Services Folder
This folder contain the services of the application. The logic services.

#### Models Folder
This folder contains the models of database or POJOs. For example, if we use mongoose, this folder contains the mongoose models.

#### Errors Folder
This folder contains the custom errors that the application throws.

#### Serializers Folder
This folder contains files that modify the output to return json standard [jsonapi](http://jsonapi.org/) Serializer library: [jsonapi-serializer](https://github.com/SeyZ/jsonapi-serializer)

#### Validators Folder
This folder contains the distinct validator classes that validate the input body or input query params. Use [koa-validate](https://github.com/RocksonZeta/koa-validate)

#### Config
This folder contains the distinct files by environment. Always it must exist:
- dev.json (develop)
- staging.json (staging environment)
- prod.json (production environment)

We use [config](https://github.com/lorenwest/node-config) module.

#### app.js
This file load the application and dependencies.

#### loader.js
This file is responsible for loading all routes and declare it. it search all files that ends with Router.js suffix in the routes folder and subfolders

#### logger.js
This file config logger of the application


#### test
This folder contains the tests of the microservice. 2 folders

##### unit
  This folder contains the unit tests. It contains a subfolder by each module of the microservice (serializer, services, models, etc)   All files contains .test.js suffix

##### e2e
 This folder contains the e2e tests.  All files contains .spec.js suffix

#### lib/restCo.js
Wrapper of restler library to use with generators (ES6)


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
