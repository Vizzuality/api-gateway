'use strict';
var logger = require('logger');
var should = require('should');
var assert = require('assert');
var mongoose = require('mongoose');
var sinon = require('sinon');
var config = require('config');
var dispatcherService = require('services/dispatcherService');
var ServiceNotFound = require('errors/serviceNotFound');

describe('Distpatcher service', function () {

    describe('Generate request correct from url', function () {
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

        after(function* () {

        });

    });

    describe('Endpoint not found.', function () {


        before(function* () {
            var mockFind = function (callback) {
                callback(null, null);
            };

            // stub the mongoose find() and return mock find
            mongoose.Model.findOne = sinon.stub().returns(mockFind);
        });

        it('Endpoint not found. Redirect to old API', function* () {

            let requests = yield dispatcherService.getRequests('/notExist', 'GET');
            logger.debug(requests);
            requests.should.be.a.Array();
            requests.should.length(1);
            let request = requests[0];
            request.should.have.property('uri');
            request.should.have.property('method');
            request.should.have.property('json');
            request.method.should.have.equal('GET');
            request.uri.should.have.equal(config.get('oldAPI.url') + '/notExist');
        });

        it('Endpoint not found. Redirect to old API with headers', function* () {
            var headers = {
                'content-type': 'application/json'
            };

            let requests = yield dispatcherService.getRequests('/notExist', 'GET', {}, headers);
            logger.debug(requests);
            requests.should.be.a.Array();
            requests.should.length(1);
            let request = requests[0];
            request.should.have.property('uri');
            request.should.have.property('method');
            request.should.have.property('json');
            request.should.have.property('headers');
            request.method.should.have.equal('GET');
            request.headers.should.have.property('content-type');
            request.headers['content-type'].should.be.equal(headers['content-type']);
            request.uri.should.have.equal(config.get('oldAPI.url') + '/notExist');
        });

        it('Endpoint not found. Redirect to old API (with Body)', function* () {
            var headers = {
                'content-type': 'application/json'
            };
            var body = {
                name: 'Pepe'
            };
            let requests = yield dispatcherService.getRequests('/notExist', 'POST', body, headers);
            logger.debug(requests);
            requests.should.be.a.Array();
            requests.should.length(1);
            let request = requests[0];
            request.should.have.property('uri');
            request.should.have.property('method');
            request.should.have.property('json');
            request.should.have.property('headers');
            request.method.should.have.equal('POST');
            request.headers.should.have.property('content-type');
            request.headers['content-type'].should.be.equal(headers['content-type']);
            request.uri.should.have.equal(config.get('oldAPI.url') + '/notExist');
            request.should.have.property('body');
            request.body.should.be.equal(body);
        });

        after(function* () {

        });

    });




});
