var express = require("express");
var _       = require("lodash");
var router  = express.Router();

/**
 * Modified from http://stackoverflow.com/a/105074
 * Generates a unique-enough-for-this-app ID with 16 alphanumeric characters
 */
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + s4() + s4();
}

/**
 * Make sure to start the DB name with a letter,
 * per Cloudant's requirements: https://docs.cloudant.com/database.html#create
 */
function randomListName() {
  return "l" + guid();
}

/**
 * Home page requests check for existing cookie and redirect to DB from there.
 * If there is no cookie, generate one and redirect to the /cookie route
 * that verifies whether or not cookies exist
 */
router.get("/", function(req, res, next) {
  var list_id;

  if(_.isEmpty(req.cookies.list_id)) {
    res.cookie("list_id", randomListName());

    res.status(307)
      .redirect("/cookie");
  } else {
    list_id = req.cookies.list_id;

    res.status(307)
      .redirect("/list/" + list_id);
  }
});

router.get("/cookie", function(req, res, next) {
  var list_id;

  if(_.isEmpty(req.cookies.list_id)) {
      res.status(307)
        .redirect("/list/" + randomListName() + "?c=f");
  } else {
    list_id = req.cookies.list_id;

    res.status(307)
      .redirect("/list/" + list_id);
  }

});

module.exports = router;
