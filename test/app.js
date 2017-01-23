var assert = require('assert');
var app = require('../app');
var request = require('super-request');

// TODO: mock network requests to Cloudant or rewire PouchDB
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

    // even though the app uses 307 to refer to temporary redirects,
    // Google Chrome and supertest both see only 302 temporary redirects
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/307#Browser_compatibility
    describe('temporarily redirects (302) from the home page', function() {
        it('to /cookie to test for cookie support, then redirects to /list with `s` query param with no cookie support', function(done) {
            request(server)
                .get('/')
                .jar(false)
                .expect(200)
                .end(function (err, res, body) {
                    assert(body.indexOf('Looks like cookies are disabled.') !== -1, true);
                    assert(/list\/[a-z0-9-]+\?s/.test(res.request.href), true);
                    done();    
                });   
        });

        it('to /cookie to test for cookie support, then redirects to /list without `s` query param with cookie support', function(done) {   
            request(server)
                .get('/')
                .expect(200)
                .end(function (err, res, body) {
                    assert(/sid/.test(res.headers['set-cookie'][0]), true);
                    assert(/list\/[a-z0-9]+$/.test(res.request.href), true);
                    done();    
                });
        });
    });
});