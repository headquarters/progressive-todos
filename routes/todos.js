var express = require('express');
var router = express.Router();

router.get('/:todo_id', function(req, res, next) {
  res.send('get TODOs list');
});

router.post('/', function(req, res, next) {
  res.send('create TODO');
  // redirect
});

router.put('/:todo_id', function(req, res, next) {
  res.send('update TODO');
});

router.delete('/:todo_id', function(req, res, next) {
  res.send('delete TODO');
});

module.exports = router;
