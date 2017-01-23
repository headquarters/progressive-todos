var express     = require("express");
var router      = express.Router();
var pouchdb     = require("pouchdb");
var url         = require("url");
var _           = require("lodash");
var session     = require("express-session");
var SQLiteStore = require("connect-sqlite3")(session);
var getAPIKey   = require("../lib/getAPIKey.js");

router.get("/:listID?", function(req, res, next) {
    var listID = req.params ? req.params.listID : null;
    var cookiesDisabled = _.isEmpty(req.query.s) ? false : true;
    var db;
    var todos = { rows: [], total_rows: 0 };
    var store;

    if(!listID) {
        res.status(302)
           .redirect("/");
    }

    if(!req.session.apiKey) {
        // no API key in the session, see if the Store has one
        // grab the session ID from the URL and look up the session in the Store
        store = new SQLiteStore;
        store.get(req.sessionID, function(err, session) {
            if(err) {
                throw err;
            }

            if(session === undefined) {
                // Invalid or expired session ID
                res.status(404).send("No session found.");
            }

            // check for an existing API key
            if(session.apiKey) {
                db = new pouchdb(url.resolve(process.env.CLOUDANT_URL, listID), {
                    auth: {
                        username: session.apiKey,
                        password: session.apiPassword
                    }
                });

                // http://pouchdb.com/api.html#batch_fetch
                db.allDocs({
                  include_docs: true
                }).then(function (result) {
                    todos = result;

                    req.session.save();
                    res.status(200)
                      .render("list", {
                          todos: todos,
                          listID: listID,
                          cookiesDisabled: cookiesDisabled,
                          sessionID: req.sessionID,
                          dbURL: url.resolve(process.env.CLOUDANT_URL, listID),
                          apiKey: session.apiKey,
                          apiPassword: session.apiPassword
                      });

                }).catch(function (err) {
                  console.log(err);
                });

            } else {
                getAPIKey(listID, function(credentials) {
                    req.session.apiKey = credentials.key;
                    req.session.apiPassword = credentials.password;
                    req.session.save();

                    res.status(200)
                      .render("list", {
                          todos: todos,
                          listID: listID,
                          cookiesDisabled: cookiesDisabled,
                          sessionID: req.sessionID,
                          dbURL: url.resolve(process.env.CLOUDANT_URL, listID),
                          apiKey: req.session.apiKey,
                          apiPassword: req.session.apiPassword
                      });
                });
            }
        });
    } else {
        db = new pouchdb(url.resolve(process.env.CLOUDANT_URL, listID), {
            auth: {
                username: req.session.apiKey,
                password: req.session.apiPassword
            }
        });

        // http://pouchdb.com/api.html#batch_fetch
        db.allDocs({
          include_docs: true
        }).then(function (result) {
            todos = result;

            res.status(200)
              .render("list", {
                  todos: todos,
                  listID: listID,
                  cookiesDisabled: cookiesDisabled,
                  sessionID: req.sessionID,
                  dbURL: url.resolve(process.env.CLOUDANT_URL, listID),
                  apiKey: req.session.apiKey,
                  apiPassword: req.session.apiPassword
              });

        }).catch(function (err) {
          console.log(err);
        });
    }
});

module.exports = router;
