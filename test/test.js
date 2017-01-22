var assert = require('assert');
var app = require('../app');
var request = require('supertest');

describe('The server', function() {
    var server;

    before(function setup(done) {
        server = app.listen(0, done);
    });

    after(function teardown() {
        server.close();
    });    

    it('returns a 404 for unhandled routes', function(done) {
        request(server)
            .head('/404')
            .expect(404, done);
    });
});