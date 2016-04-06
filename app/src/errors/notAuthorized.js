'use strict';

class NotAuthorized extends Error{

    constructor(message){
        super(message);
        this.name = 'NotAuthorized';
        this.message = message;
    }
}
module.exports = NotAuthorized;
