# Worker

This script is watching the file configured to consul-template modify it when there are
changes in consul server.

## Development environment
When api-gateway run, it read the app/consul.json file with the configuration of the microservices. The file must be:
Example:

````
[
    {
        "name": "gfw-geostore-api",
        "host": "192.168.99.100",
        "port": 3100
    },
    {
        "name": "gfw-viirs-fires-api",
        "host": "192.168.99.100",
        "port": 3600
    }
]

````

## Execute
````
NODE_PATH=app/src NODE_ENV=<env> node app/worker.js <dirFile>
````
