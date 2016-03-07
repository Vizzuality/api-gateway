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

## TODO:
* Add support to several endpoints
* Add Circuit Breaker pattern
