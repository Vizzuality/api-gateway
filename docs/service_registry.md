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
