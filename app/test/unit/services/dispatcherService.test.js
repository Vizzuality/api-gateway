'use strict';
var logger = require('logger');
var should = require('should');
var assert = require('assert');
var mongoose = require('mongoose');
var sinon = require('sinon');
var config = require('config');

var ServiceNotFound = require('errors/serviceNotFound');
var mockery = require('mockery');

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
                path: '/api/users',
                data: ['dataset']
            }]
        };

        before(function* () {
            mockery.enable({
                warnOnReplace: false,
                warnOnUnregistered: false,
                useCleanCache: true
            });
        });
        let dispatcherService = null;
        before(function* () {

            var serviceMock = function (data) {
                this.data = data;
            };

            serviceMock.prototype.find = function () {

                return function (callback) {
                    callback(null, [service]);
                }.bind(this);
            };
            serviceMock.findOne = function () {

                return function (callback) {
                    callback(null, service);
                }.bind(this);
            };

            var filterMock = function (data) {
                this.data = data;
            };
            filterMock.findOne = function(query){
                logger.debug('TEST: query', query);
                return function (callback) {
                    callback(null, null);
                }.bind(this);
            };

            mockery.registerMock('models/service', serviceMock);
            mockery.registerMock('models/filter', filterMock);
            dispatcherService = require('services/dispatcherService');
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

        afterEach(function *(){
            mockery.deregisterAll();
            dispatcherService = null;
        });

        after(function* () {
            mockery.disable();
        });

    });

    describe('Endpoint not found.', function () {


        before(function* () {
            mockery.enable({
                warnOnReplace: false,
                warnOnUnregistered: false,
                useCleanCache: true
            });
        });
        let dispatcherService = null;
        beforeEach(function* () {

            var serviceMock = function (data) {
                this.data = data;
            };

            serviceMock.prototype.find = function () {

                return function (callback) {
                    callback(null, null);
                }.bind(this);
            };
            serviceMock.findOne = function () {

                return function (callback) {
                    callback(null, null);
                }.bind(this);
            };

            var filterMock = function (data) {
                this.data = data;
            };
            filterMock.findOne = function(query){
                return function (callback) {
                    callback(null, null);
                }.bind(this);
            };

            mockery.registerMock('models/service', serviceMock);
            mockery.registerMock('models/filter', filterMock);
            dispatcherService = require('services/dispatcherService');
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

        afterEach(function *(){
            mockery.deregisterAll();
            dispatcherService = null;
        });

        after(function* () {
            mockery.disable();
        });

    });




});
