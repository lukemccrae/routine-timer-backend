var express = require('express');
var router = express.Router();
const User = require('../models/User');
const UserSession = require('../models/UserSession');
const Timer = require('../models/Timer');
const Group = require('../models/Group');

/* GET home page. */
router.get('/', function(req, res, next) {
  Timer.find({
    name: 'read book'
  }, (err, timers) => {
    if(err) {
      console.log(err);
    } else {
      return res.send({
        timers: timers
      })
    }
  })
});

module.exports = router;
