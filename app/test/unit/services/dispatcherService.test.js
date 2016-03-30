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
            try{
                let requests = yield dispatcherService.getRequests('/notExist', 'GET');
            } catch(e){
                e.should.be.an.instanceOf(Error);
                e.name.should.be.equal('ServiceNotFound');
            }

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
