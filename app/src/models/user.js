'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    fullName: {type: String, required:true, trim: true},
    provider: {type: String, required:true, trim: true},
    providerId: {type: String, required:true, trim: true},
    email: {type: String, required:true, trim: true},
    createdAt: {type: Date, required: true, default: Date.now}
    // sector: {type: String, required: true, trim: true},
    // primaryResponsibilities: {type: String, required: true, trim: true},
    // country: {type: String, required: true, trim: true},
    // state: {type: String, required: true, trim: true},
    // city: {type: String, required: true, trim: true},
    // howDoYouUse: {type: String, required: true, trim: true}
});

module.exports = mongoose.model('User', User);
