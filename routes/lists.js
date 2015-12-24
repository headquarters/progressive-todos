var express = require('express');
var router = express.Router();

router.get('/:list_id', function(req, res, next) {
  res.send('get lists list');
});

router.post('/', function(req, res, next) {
  res.send('create list');
  // redirect
});

router.put('/:list_id', function(req, res, next) {
  res.send('update list');
});

router.delete('/:list_id', function(req, res, next) {
  res.send('delete list');
});

module.exports = router;
