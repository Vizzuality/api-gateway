# Service Registry

The microservices are registered and unregistered using the following
API.

## Registering services

To register service:

**POST /gateway/service**

````
{{
    "id": "#(service.id)",
    "name": "#(service.name)",
    "swagger": {public-swagger} // Public doc of the public api of the service in swagger standard
    "urls": [{
        "url": "/usuarios",
        "method": "GET",
        "authenticated": true,  // This attribute specifies whether the user has to be logged in to call the endpoint. If it is true and the endpoint have PUT, PATCH or POST method, the user is added in the request body (loggedUser param) to microservice.
        "dataProvider": "dataset", // this attribute contain the name of provider which the api-gateway uses to filter the endpoint with the filter defined in 'filters'. The url to obtain the provider object is configured in config files. Only possible 'dataset'
        "paramProvider": "dataset", // name of the param of the url that the api-gateway uses to obtain the provider object.
        "filters":{ // object that contain the distinct filters that the api-gateway uses to filter the distinct endpoints. The key must be a key of the provider object.
            "provider": "CartoDb"
        },
        "endpoints": [{
            "method": "POST",
            "baseUrl": "#(service.uri)",
            "path": "/api/users",
            "data": ["dataset"] // if this key exists, the api-gateway sends to microservice the object provider with this name. it sends in the body on the request. Only POST, PATCH, PUT methods. Options: "dataset", "loggedUser"; Ex: body => {dataset: {object}}
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

If an ID is given, all config with this ID will be deleted and replaced
with the new configuration. The ID must be unique by microservice and
version.

## Unregistering services

To unregister a service:

**DELETE /gateway/service/<id>**

To unregister all services:

**DELETE /gateway/service/all**

## Listing services

To obtain a JSON list of all services registered:

**GET /gateway/service**

## Swagger API Documentation

To obtain a swagger specification of all endpoints registered:

**GET /doc/swagger**
