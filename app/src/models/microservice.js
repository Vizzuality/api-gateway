'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Microservice = new Schema({
    id: {type: String, required: true, trim: true},
    swagger: Schema.Types.Mixed
});

module.exports = mongoose.model('Microservice', Microservice);
