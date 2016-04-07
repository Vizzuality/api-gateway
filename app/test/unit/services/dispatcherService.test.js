'use strict';
var logger = require('logger');
var should = require('should');
var assert = require('assert');
var mongoose = require('mongoose');
var sinon = require('sinon');
var config = require('config');

var ServiceNotFound = require('errors/serviceNotFound');
var NotAuthorized = require('errors/notAuthorized');
var mockery = require('mockery');

describe('Distpatcher service', function() {

    describe('Generate request correct from url', function() {
        let service = {
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

        before(function*() {
            mockery.enable({
                warnOnReplace: false,
                warnOnUnregistered: false,
                useCleanCache: true
            });
        });
        let dispatcherService = null;
        before(function*() {

            var serviceMock = function(data) {
                this.data = data;
            };

            serviceMock.prototype.find = function() {

                return function(callback) {
                    callback(null, [service]);
                }.bind(this);
            };
            serviceMock.findOne = function() {

                return function(callback) {
                    callback(null, service);
                }.bind(this);
            };

            var filterMock = function(data) {
                this.data = data;
            };
            filterMock.findOne = function(query) {
                logger.debug('TEST: query', query);
                return function(callback) {
                    callback(null, null);
                }.bind(this);
            };

            mockery.registerMock('models/service', serviceMock);
            mockery.registerMock('models/filter', filterMock);
            dispatcherService = require('services/dispatcherService');
        });

        it('Generate request correct from url', function*() {
            var requests = yield dispatcherService.getRequests('/url', 'GET');
            requests.should.be.a.Array();
            requests.should.length(1);
            let request = requests[0];
            request.should.have.property('uri');
            request.should.have.property('method');
            request.method.should.have.equal(service.endpoints[0].method);
            request.uri.should.have.equal(service.endpoints[0].baseUrl + service.endpoints[0].path);
        });

        afterEach(function*() {
            mockery.deregisterAll();
            dispatcherService = null;
        });

        after(function*() {
            mockery.disable();
        });

    });

    describe('Endpoint not found.', function() {


        before(function*() {
            mockery.enable({
                warnOnReplace: false,
                warnOnUnregistered: false,
                useCleanCache: true
            });
        });
        let dispatcherService = null;
        beforeEach(function*() {

            var serviceMock = function(data) {
                this.data = data;
            };

            serviceMock.prototype.find = function() {

                return function(callback) {
                    callback(null, null);
                }.bind(this);
            };
            serviceMock.findOne = function() {

                return function(callback) {
                    callback(null, null);
                }.bind(this);
            };

            var filterMock = function(data) {
                this.data = data;
            };
            filterMock.findOne = function(query) {
                return function(callback) {
                    callback(null, null);
                }.bind(this);
            };

            mockery.registerMock('models/service', serviceMock);
            mockery.registerMock('models/filter', filterMock);
            dispatcherService = require('services/dispatcherService');
        });

        it('Endpoint not found. Redirect to old API', function*() {
            try {
                let requests = yield dispatcherService.getRequests('/notExist', 'GET');
            } catch (e) {
                e.should.be.an.instanceOf(Error);
                e.name.should.be.equal('ServiceNotFound');
            }

        });

        afterEach(function*() {
            mockery.deregisterAll();
            dispatcherService = null;
        });

        after(function*() {
            mockery.disable();
        });

    });

    describe('Generate request correct from url', function() {
        let service = {
            id: 'test',
            name: 'Test service',
            url: '/usuarios',
            authenticated: true,
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

        let servicePOST = {
            id: 'test',
            name: 'Test service',
            url: '/usuarios',
            authenticated: true,
            urlRegex: /^\/users(?:\/(?=$))?$/i,
            keys: [],
            method: 'POST',
            endpoints: [{
                method: 'POST',
                baseUrl: 'http://localhost:3000',
                path: '/api/users',
                data: ['dataset']
            }]
        };
        var user = {
            fullName: 'Vizz',
            provider: 'google'
        };

        before(function*() {
            mockery.enable({
                warnOnReplace: false,
                warnOnUnregistered: false,
                useCleanCache: true
            });
        });
        let dispatcherService = null;
        before(function*() {

            var serviceMock = function(data) {
                this.data = data;
            };

            serviceMock.prototype.find = function(filter) {

                return function(callback) {
                    logger.debug('ESTE ES MI FILTRO ', filter);
                    if (filter && filter.query.method === 'POST') {
                        callback(null, [servicePOST]);
                    } else {
                        callback(null, [service]);
                    }
                }.bind(this);
            };
            serviceMock.findOne = function(filter) {

                return function(callback) {

                    if (filter && filter.method === 'POST') {
                        callback(null, servicePOST);
                    } else {
                        callback(null, service);
                    }
                }.bind(this);
            };

            var filterMock = function(data) {
                this.data = data;
            };
            filterMock.findOne = function(query) {

                return function(callback) {
                    callback(null, null);
                }.bind(this);
            };

            mockery.registerMock('models/service', serviceMock);
            mockery.registerMock('models/filter', filterMock);
            dispatcherService = require('services/dispatcherService');
        });

        it('Generate request: Not authorized', function*() {
            var requests = null;
            try {
                requests = yield dispatcherService.getRequests('/url', 'GET');
            } catch (e) {
                (requests === null).should.be.ok();
                e.should.be.an.instanceOf(Error);
                e.name.should.be.equal(new NotAuthorized().name);
            }

        });

        it('Generate request: Authorized (In body NOT loggedUser)', function*() {
            var requests = null;
            requests = yield dispatcherService.getRequests('/url', 'GET', {}, null, null, null, user);
            requests.should.be.a.Array();
            requests.should.length(1);
            let request = requests[0];
            request.should.have.property('uri');
            request.should.have.property('method');
            request.method.should.have.equal(service.endpoints[0].method);
            request.uri.should.have.equal(service.endpoints[0].baseUrl + service.endpoints[0].path);
            request.should.not.have.property('data');
        });

        it('Generate request: Authorized (In body loggedUser)', function*() {
            var requests = null;
            requests = yield dispatcherService.getRequests('/url', 'POST', {}, null, null, null, user);
            requests.should.be.a.Array();
            requests.should.length(1);
            let request = requests[0];
            request.should.have.property('uri');
            request.should.have.property('method');
            request.method.should.have.equal(servicePOST.endpoints[0].method);
            request.uri.should.have.equal(servicePOST.endpoints[0].baseUrl + servicePOST.endpoints[0].path);
            request.should.have.property('data');
            request.data.should.have.property('loggedUser');
            request.data.loggedUser.should.be.equal(user);
        });

        after(function*() {
            mockery.deregisterAll();
            dispatcherService = null;
        });

        after(function*() {
            mockery.disable();
        });

    });


});
