var express = require("express");
var router  = express.Router();
var pouchdb = require("pouchdb");
var url     = require("url");
var _       = require("lodash");

// pouchdb.debug.enable("*");

function connect(name) {
  var connection = url.resolve(process.env.CLOUDANT_URL, name);
  return new pouchdb(connection);
}

router.get("/:listID?", function(req, res, next) {
    var listID = req.params ? req.params.listID : null;
    var cookiesDisabled = _.isEmpty(req.query.s) ? false : true;
    var db;
    var todos = { rows: [], total_rows: 0 };

    if(!listID) {
        res.status(302)
           .redirect("/");
    }

    // Get the session ID, either from cookie or URL,
    // then see if a user exists in the session
    // if user exists, then connect to that DB with that user and fetch docs
    // else create API key and password, then connect to DB

    // db = connect(listID);

    // http://pouchdb.com/api.html#batch_fetch
    // db.allDocs({
    //   include_docs: true
    // }).then(function (result) {
    //     todos = result;

        res.status(200)
          .render("list", {
              todos: todos,
              list_id: listID,
              cookies_disabled: cookiesDisabled
          });
    // }).catch(function (err) {
    //   console.log(err);
    // });
});

module.exports = router;
