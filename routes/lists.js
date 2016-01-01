var express = require("express");
var router  = express.Router();
var pouchdb = pouchdb = require("pouchdb");
var url    = require("url");

// pouchdb.debug.enable("*");

function connect(name) {
  var connection = url.resolve(process.env.CLOUDANT_URL, name);
  return new pouchdb(connection);
}

router.get("/:list_id?", function(req, res, next) {
    var list_id = req.params ? req.params.list_id : null;
    var cookies_disabled = (req.query.c === "f") ? true : false;
    var db;
    var todos = [];

    if(!list_id) {
        // Need some real error handling here, but for now just redirect.
        res.status(302)
          .redirect("/");
    }

    db = connect(list_id);

    // http://pouchdb.com/api.html#batch_fetch
    db.allDocs({
      include_docs: true
    }).then(function (result) {
        todos = result;

        res.status(200)
          .render("list", {
              todos: todos,
              list_id: list_id,
              cookies_disabled: cookies_disabled
          });
    }).catch(function (err) {
      console.log(err);
    });
});

module.exports = router;
