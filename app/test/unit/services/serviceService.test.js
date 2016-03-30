// 'use strict';
// var logger = require('logger');
// var should = require('should');
// var assert = require('assert');
// var mongoose = require('mongoose');
// var sinon = require('sinon');
// var mockery = require('mockery');
//
//
// describe('Service service', function () {
//
//     let serviceResult = {
//         id: 'test',
//         name: 'Test service',
//         url: '/usuarios',
//         urlRegex: /^\/usuarios(?:\/(?=$))?$/i,
//         keys: [],
//         method: 'GET',
//         endpoints: [{
//             method: 'GET',
//             baseUrl: 'http://localhost:3000',
//             path: '/api/users'
//         }]
//     };
//     let serviceWithParamsResult = {
//         id: 'test',
//         name: 'Test service',
//         url: '/usuarios/:name',
//         urlRegex: /^\/usuarios\/([^\/]+?)(?:\/(?=$))?$/i,
//         keys: ['name'],
//         method: 'POST',
//         endpoints: [{
//             method: 'POST',
//             baseUrl: 'http://localhost:3000',
//             path: '/api/users/:name'
//         }]
//     };
//
//     let requestBody = {
//         id: 'test',
//         name: 'Test service',
//         urls: [{
//             url: '/usuarios',
//             method: 'GET',
//             endpoints: [{
//                 method: 'GET',
//                 baseUrl: 'http://localhost:3000',
//                 path: '/api/users'
//             }]
//         }]
//     };
//
//     let requestWithParamsServices = {
//         id: 'test',
//         name: 'Test service',
//         urls: [{
//             url: '/usuarios/:name',
//             method: 'POST',
//             endpoints: [{
//                 method: 'POST',
//                 baseUrl: 'http://localhost:3000',
//                 path: '/api/users/:name'
//             }]
//         }]
//     };
//
//
//     before(function* () {
//         mockery.enable({
//             warnOnReplace: false,
//             warnOnUnregistered: false,
//             useCleanCache: true
//         });
//     });
//     let ServiceService = null;
//     beforeEach(function* (){
//         var serviceMock = function (data) {
//             this.data = data;
//         };
//
//         serviceMock.prototype.save = function () {
//
//             return function (callback) {
//                 this.data._id = 'asds9a7asdf6asdf8';
//                 callback(null, this.data);
//             }.bind(this);
//         };
//
//         serviceMock.find = function () {
//
//             return function (callback) {
//
//                 callback(null, null);
//             }.bind(this);
//         };
//         var filterMock = function (data) {
//             this.data = data;
//         };
//         filterMock.prototype.save = function () {
//
//             return function (callback) {
//                 this.data._id = 'asds9a7asdf6asdf8';
//                 callback(null, this.data);
//             }.bind(this);
//         };
//         filterMock.find = function () {
//             var find = function(){
//
//             };
//             find.remove = function(callback){
//                 var remove = function(){
//
//                 };
//                 remove.exec = function(callback){
//                     return function (callback) {
//
//                         callback(null, null);
//                     };
//                 };
//                 return remove;
//             };
//
//             return find;
//
//         };
//         mockery.registerMock('models/service', serviceMock);
//         mockery.registerMock('models/filter', filterMock);
//         ServiceService = require('services/serviceService');
//     });
//
//     it('Test save correct without params in url', function* () {
//
//         let results = yield ServiceService.createServices(requestBody);
//         results.should.be.a.Array();
//         results.should.length(1);
//         let service = results[0];
//         service.should.have.property('urlRegex');
//         service.should.have.property('keys');
//         service.should.have.property('endpoints');
//         service.urlRegex.toString().should.be.equal(serviceResult.urlRegex.toString());
//         service.keys.should.be.a.Array();
//         service.keys.should.length(0);
//     });
//
//     it('Test save correct with params in url', function* () {
//
//         let results = yield ServiceService.createServices(requestWithParamsServices);
//         results.should.be.a.Array();
//         results.should.length(1);
//         let service = results[0];
//         service.should.have.property('urlRegex');
//         service.should.have.property('keys');
//         service.should.have.property('endpoints');
//         service.urlRegex.toString().should.be.equal(serviceWithParamsResult.urlRegex.toString());
//         service.keys.should.be.a.Array();
//         service.keys.should.length(1);
//         service.keys[0].should.be.equal(serviceWithParamsResult.keys[0]);
//     });
//
//     afterEach(function *(){
//         mockery.deregisterAll();
//         ServiceService = null;
//     });
//
//     after(function* () {
//         mockery.disable();
//     });
// });
