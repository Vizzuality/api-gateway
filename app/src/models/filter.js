'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Filter = new Schema({
    url: {type: String, required: true, trim: true},
    method: {type: String, required: true, trim: true},
    urlRegex: {type: RegExp, required: true},
    keys: [{type: String, trim: true}],
    dataProvider: {type: String, trim: true},
    paramProvider: {type: String, required: false, trim: true},
    filters: [{type: String, trim: true}]
});

module.exports = mongoose.model('Filter', Filter);
