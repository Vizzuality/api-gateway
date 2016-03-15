'use strict';

class ServiceNotFound extends Error{

    constructor(message){
        super(message);
        this.name = 'ServiceNotFound';
        this.message = message;
    }
}
module.exports = ServiceNotFound;
