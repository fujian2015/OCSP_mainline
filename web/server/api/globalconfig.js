var express = require('express');
var config = require('../config');
var router = express.Router();

router.get('/links', function(req, res){
  res.send(config.quickLinks);
});

module.exports = router;
