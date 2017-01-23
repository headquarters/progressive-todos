var express = require("express");
var _       = require("lodash");
var router  = express.Router();
var utils   = require("../lib/utils");

/**
 * Home page requests check for existing cookie and redirect to DB from there.
 * If there is no cookie, generate one and redirect to the /cookie route
 * that verifies whether or not cookies exist
 */
router.get("/", function(req, res, next) {
  var listID;

  // Sessions are stored server-side and work without cookies present,
  // but we check if cookies are present so we can include the session ID
  // in the URL to provide bookmarking ability for the user's session and list
  if(_.isEmpty(req.session.listID)) {
      req.session.listID = utils.randomListName();

      // 307 redirect implies the method and body will not change
      // whereas 302 implies they could change
      res.status(307)
        .redirect("/cookie");
  } else {
      res.status(307)
        .redirect("/list/" + req.session.listID);
  }
});

router.get("/cookie", function(req, res, next) {
    var listID;
    if(_.isEmpty(req.session.listID)) {
        listID = utils.randomListName();

        // initialize a new session
        req.session.save();
        res.status(307)
            .redirect("/list/" + listID + "?s=" + req.sessionID);
     } else {
         res.status(307)
            .redirect("/list/" + req.session.listID);
     }
});

module.exports = router;
