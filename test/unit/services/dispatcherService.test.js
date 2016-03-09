'use strict';
var logger = require('logger');
var should = require('should');
var assert = require('assert');
var mongoose = require('mongoose');
var sinon = require('sinon');
var dispatcherService = require('services/dispatcherService');
var ServiceNotFound = require('errors/serviceNotFound');

describe('Distpatcher service', function () {

    var service = {
        id: 'test',
        name: 'Test service',
        url: '/usuarios',
        urlRegex: /^\/users(?:\/(?=$))?$/i,
        keys: [],
        method: 'GET',
        endpoints: [{
            method: 'GET',
            baseUrl: 'http://localhost:3000',
            path: '/api/users'
        }]
    };


    before(function* () {
        var mockFind = function (callback) {
                callback(null, service);
        };

        // stub the mongoose find() and return mock find
        mongoose.Model.findOne = sinon.stub().returns(mockFind);

    });

    it('Generate request correct from url', function* () {
        var requests = yield dispatcherService.getRequests('/url', 'GET');
        requests.should.be.a.Array();
        requests.should.length(1);
        let request = requests[0];
        request.should.have.property('uri');
        request.should.have.property('method');
        request.should.have.property('json');
        request.method.should.have.equal(service.endpoints[0].method);
        request.uri.should.have.equal(service.endpoints[0].baseUrl + service.endpoints[0].path);
    });

    it('Endpoint not found. Throw exception', function* () {
        try{
            var requests = yield dispatcherService.getRequests('/notExist', 'GET');
        } catch(e){
            e.should.be.an.instanceOf(ServiceNotFound).and.have.property('message');
        }
    });

    after(function* () {

    });
});
