var express = require('express');
var router  = express.Router();
var pouchdb = pouchdb = require("pouchdb");
var url    = require("url");

// pouchdb.debug.enable("*");

/**
 * Generates an ID for a todo based on timestamp plus random 3 digit number.
 * The recommendation is to use put() over post() and provide an ID
 * to support sorting: http://pouchdb.com/api.html#using-dbpost
 */
function generateId() {
    return (Math.floor((1 + Math.random()) * 0x100) +
            (new Date()).getTime()).toString();
}

function connect(name) {
  var connection = url.resolve(process.env.CLOUDANT_URL, name);
  return new pouchdb(connection);
}

// Unused by the app for now
router.get('/:todo_id', function(req, res, next) {
    var list_id = req.query ? req.query.list_id : null;
    var db;
    var todo = {};

    if(list_id) {
        db = connect(list_id);
        todo = db.get(req.params.todo_id);
        // get todo item from list
        res.status(200).send('Get TODO', todo);
    } else {
        // no list provided, send a 404
        next();
    }
});

/**
 * Create a new todo that belongs to a particular list/DB.
 */
router.post('/', function(req, res, next) {
    var list_id = req.body.list_id;
    var todo = req.body.todo;
    var todo_id = generateId();

    db = connect(list_id);

    db.put({
      _id: todo_id,
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

router.put('/:todo_id', function(req, res, next) {
    res.status(200).send('Not yet implemented. Would update TODO.');
});

router.delete('/:todo_id', function(req, res, next) {
    var list_id = req.body.list_id;
    var todo_id = req.params.todo_id;

    db = connect(list_id);

    // Deleting a document requires either the full document or
    // at least _id AND _rev properties; rather than pass all that data around,
    // we'll deal with two API requests to fetch the DOC, then delete it.
    // http://pouchdb.com/api.html#delete_document
    db.get(todo_id).then(function(doc) {
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

module.exports = router;
