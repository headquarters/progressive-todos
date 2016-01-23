var express = require("express");
var _       = require("lodash");
var router  = express.Router();
var utils   = require("../modules/utils");

/**
 * Home page requests check for existing cookie and redirect to DB from there.
 * If there is no cookie, generate one and redirect to the /cookie route
 * that verifies whether or not cookies exist
 */
router.get("/", function(req, res, next) {
  var listID;

  // Sessions are stored server-side and work without cookies present,
  // but we check if cookies are present so we can include the session ID
  // in the URL to provide bookmarking ability for the user's list
  if(_.isEmpty(req.session.listID)) {
    // res.send("No list ID found in the session | Session ID: " + req.sessionID);

      res.cookie("listID", utils.randomListName());

      res.status(307)
        .redirect("/cookie");
  } else {
    res.send("Found list ID | Session ID: " + req.sessionID);
  }
  // res.send("Session: ", req.sessionID);

  // if(_.isEmpty(req.cookies.list_id)) {
  //   res.cookie("list_id", randomListName());
  //
  //   res.status(307)
  //     .redirect("/cookie");
  // } else {
  //   list_id = req.cookies.list_id;
  //
  //   res.status(307)
  //     .redirect("/list/" + list_id);
  // }
});

router.get("/cookie", function(req, res, next) {
  var listID;

  if(_.isEmpty(req.cookies.listID)) {
      res.status(307)
        .redirect("/list/" + utils.randomListName() + "?s=" + req.sessionID);
    // Initializes the session with an ID
    // so we don't generate a new ID on the next request
    req.session.save();
} else {
    listID = req.cookies.listID;

      res.status(307)
        .redirect("/list/" + list_id);
}

      // if(_.isEmpty(req.cookies.list_id)) {
      //     res.status(307)
      //       .redirect("/list/" + randomListName() + "?c=f");
      // } else {
      //   list_id = req.cookies.list_id;
      //
      //   res.status(307)
      //     .redirect("/list/" + list_id);
      // }
});

module.exports = router;
