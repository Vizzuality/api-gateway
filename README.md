# API Gateway
This repository is the base the all microservices implemented in nodejs.

## Installation

```bash
npm install

npm install -g bunyan  // logger system
```

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
//TODO: add information of basic auth configuration


## Register service
To register service do POST request to /gateway/service
body:
````
{
    "id": "skelegon-service_1.0.0",
    "name": "Skeleton Service",
    "urls":[
        "url": "/usuarios",
        "method": "GET",
        "endpoints": [
          {
            "url": "<completURLMicroservice>/api/users",
            "method": "GET"
          }
        ],
        "url": "/usuarios",
        "method": "POST",
        "endpoints": [
          {
            "url": "<completURLMicroservice>/api/users",
            "method": "GET"
          }
        ]
    ]

  }
````

## Unregister service
To register service do DELETE request to /gateway/service/<idService>


## TODO:
* Add support to several endpoints in same url
* Add Circuit Breaker pattern
