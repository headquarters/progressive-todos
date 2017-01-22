var express = require('express');
var router  = express.Router();
var pouchdb = require("pouchdb");
var url     = require("url");
var utils   = require("../lib/utils");
var session     = require("express-session");
var SQLiteStore = require("connect-sqlite3")(session);

router.get('/:todoID', function(req, res, next) {
    res.status(501).send('Getting individual TODO is not yet implemented.');
});

/**
 * Create a new todo in a DB (list) for a user (API key/password).
 */
router.post('/', function(req, res, next) {
    var listID = req.body.listID;
    var todo = req.body.todo;
    var todoID = utils.generateID();
    var db;

    if(!req.session.apiKey) {
        // look up the session in the Store because
        // the data isn't saved on req.session
        store = new SQLiteStore;
        store.get(req.sessionID, function(err, session) {
            if(err) {
                throw err;
            }

            if(session === undefined) {
                // Invalid or expired session ID
                res.status(404).send("No session found.");
            }

            if(!session.apiKey || !session.apiPassword) {
                res.status(403).send("API key and password needed for creating a TODO.");
            }

            db = new pouchdb(url.resolve(process.env.CLOUDANT_URL, listID), {
                auth: {
                    username: session.apiKey,
                    password: session.apiPassword
                }
            });

            db.put({
              _id: todoID,
              text: todo,
              created: (new Date()).getTime(),
              completed: false
            }).then(function (response) {
              if(req.xhr) {
                  res.send(response);
              } else {
                  res.status(303)
                    .redirect(req.get("Referrer"));
              }
            }).catch(function (err) {
              console.log(err);
            });
        });

    } else {
        db = new pouchdb(url.resolve(process.env.CLOUDANT_URL, listID), {
            auth: {
                username: req.session.apiKey,
                password: req.session.apiPassword
            }
        });

        db.put({
          _id: todoID,
          text: todo,
          created: (new Date()).getTime(),
          completed: false
        }).then(function (response) {
          if(req.xhr) {
              res.send(response);
          } else {
              res.status(303)
                .redirect(req.get("Referrer"));
          }
        }).catch(function (err) {
          console.log(err);
        });
    }
});

router.put('/:todoID', function(req, res, next) {
    res.status(501).send('Updating TODO is not yet implemented.');
});

router.delete('/:todoID', function(req, res, next) {
    var todoID = req.params.todoID;
    var listID = req.body.listID;
    var db;

    if(!req.session.apiKey) {
        // look up the session in the Store because
        // the data isn't saved on req.session
        store = new SQLiteStore;
        store.get(req.sessionID, function(err, session) {
            if(err) {
                throw err;
            }

            if(session === undefined) {
                // session has expired and removed from Store
                res.status(404).send("No session found.");
            }

            if(!session.apiKey || !session.apiPassword) {
                res.status(403).send("API key and password needed for creating a TODO.");
            }

            db = new pouchdb(url.resolve(process.env.CLOUDANT_URL, listID), {
                auth: {
                    username: session.apiKey,
                    password: session.apiPassword
                }
            });

            // Deleting a document requires either the full document or
            // at least _id AND _rev properties; rather than pass all that data around,
            // we'll deal with two API requests to fetch the DOC, then delete it.
            // http://pouchdb.com/api.html#delete_document
            db.get(todoID).then(function(doc) {
              return db.remove(doc);
            }).then(function (response) {
                if(req.xhr) {
                    res.send(response);
                } else {
                    res.status(303)
                      .redirect(req.get("Referrer"));
                }
            }).catch(function (err) {
              console.log(err);
            });
        });
    } else {
        db = new pouchdb(url.resolve(process.env.CLOUDANT_URL, listID), {
            auth: {
                username: req.session.apiKey,
                password: req.session.apiPassword
            }
        });

        // Deleting a document requires either the full document or
        // at least _id AND _rev properties; rather than pass all that data around,
        // we'll deal with two API requests to fetch the DOC, then delete it.
        // http://pouchdb.com/api.html#delete_document
        db.get(todoID).then(function(doc) {
          return db.remove(doc);
        }).then(function (response) {
            if(req.xhr) {
                res.send(response);
            } else {
                res.status(303)
                  .redirect(req.get("Referrer"));
            }
        }).catch(function (err) {
          console.log(err);
        });
    }
});

module.exports = router;
