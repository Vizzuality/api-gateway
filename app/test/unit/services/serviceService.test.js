'use strict';
var logger = require('logger');
var should = require('should');
var assert = require('assert');
var mongoose = require('mongoose');
var sinon = require('sinon');
var mockery = require('mockery');


describe('Service service', function () {

    let serviceResult = {
        id: 'test',
        name: 'Test service',
        url: '/usuarios',
        urlRegex: /^\/usuarios(?:\/(?=$))?$/i,
        keys: [],
        method: 'GET',
        endpoints: [{
            method: 'GET',
            baseUrl: 'http://localhost:3000',
            path: '/api/users'
        }]
    };

    let serviceWithAuthenticated = {
        id: 'test',
        name: 'Test service authenticated',
        url: '/usuarios/:name',
        authenticated: true,
        urlRegex: /^\/usuarios\/([^\/]+?)(?:\/(?=$))?$/i,
        keys: ['name'],
        method: 'POST',
        endpoints: [{
            method: 'POST',
            baseUrl: 'http://localhost:3000',
            path: '/api/users/:name'
        }]
    };

    let requestBody = {
        id: 'test',
        name: 'Test service',
        urls: [{
            url: '/usuarios',
            method: 'GET',
            endpoints: [{
                method: 'GET',
                baseUrl: 'http://localhost:3000',
                path: '/api/users'
            }]
        }]
    };

    let requestWithParamsServices = {
        id: 'test',
        name: 'Test service',
        urls: [{
            url: '/usuarios/:name',
            method: 'POST',
            endpoints: [{
                method: 'POST',
                baseUrl: 'http://localhost:3000',
                path: '/api/users/:name'
            }]
        }]
    };

    let requestAuthenticated = {
        id: 'test',
        name: 'Test service',
        urls: [{
            url: '/usuarios/:name',
            method: 'POST',
            authenticated: true,
            endpoints: [{
                method: 'POST',
                baseUrl: 'http://localhost:3000',
                path: '/api/users/:name'
            }]
        }]
    };


    before(function* () {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });
    });
    let ServiceService = null;
    beforeEach(function* (){
        var serviceMock = function (data) {
            this.data = data;
        };

        serviceMock.prototype.save = function () {

            return function (callback) {
                this.data._id = 'asds9a7asdf6asdf8';
                callback(null, this.data);
            }.bind(this);
        };

        serviceMock.find = function () {

            return function (callback) {

                callback(null, null);
            }.bind(this);
        };
        var filterMock = function (data) {
            this.data = data;
        };
        filterMock.prototype.save = function () {

            return function (callback) {
                this.data._id = 'asds9a7asdf6asdf8';
                callback(null, this.data);
            }.bind(this);
        };
        filterMock.remove = function(){
            return function (callback) {

                callback(null, null);
            };
        };

        var microserviceMock = function (data) {
            this.data = data;
        };
        microserviceMock.remove = function(){
            return function(callback){
                callback(null, null);
            };
        };
        microserviceMock.prototype.save = function(){
            var _this = this;
            return function(callback){
                callback(null, _this);
            };
        };
        mockery.registerMock('models/service', serviceMock);
        mockery.registerMock('models/filter', filterMock);
        mockery.registerMock('models/microservice', microserviceMock);
        ServiceService = require('services/serviceService');
    });

    it('Test save correct without params in url', function* () {

        let results = yield ServiceService.registerMicroservices(requestBody);
        results.should.be.a.Object();

        results.data.should.have.property('token');
    });

    it('Test save correct with params in url', function* () {

        let results = yield ServiceService.registerMicroservices(requestWithParamsServices);
        results.should.be.a.Object();

        results.data.should.have.property('token');
    });

    it('Test save correct with authenticated', function* () {

        let results = yield ServiceService.registerMicroservices(requestAuthenticated);
        results.should.be.a.Object();

        results.data.should.have.property('token');

    });

    afterEach(function *(){
        mockery.deregisterAll();
        ServiceService = null;
    });

    after(function* () {
        mockery.disable();
    });
});
