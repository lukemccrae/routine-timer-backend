var router = require('express').Router();
const User = require('../models/User');
const UserSession = require('../models/UserSession');
const Timer = require('../models/Timer');
const Group = require('../models/Group');

/* GET home page. */
//   app.get('/api/counters', (req, res, next) => {
//     Counter.find()
//       .exec()
//       .then((counter) => res.json(counter))
//       .catch((err) => next(err));
//   });
//
//   app.post('/api/counters', function (req, res, next) {
//     const counter = new Counter();
//
//     counter.save()
//       .then(() => res.json(counter))
//       .catch((err) => next(err));
//   });

router.post('/sanitycheck', (req, res, next) => {
  const sanityUser = new User();
  let sanityUserInfo = {
    email: "h@h.com",
    firstName: "h",
    lastName: "h",
    password: "eeee"
  }


  sanityUser.email = sanityUserInfo.email;
  sanityUser.firstName = sanityUserInfo.firstName;
  sanityUser.lastName = sanityUserInfo.lastName;
  sanityUser.password = sanityUser.generateHash(sanityUserInfo.password);

  sanityUser.save((err, user) => {
    console.log(user);
    if (err) {
      res.send({
        success: false,
        message: 'Error: server error'
      })
    }
    res.send({
      success: true,
      message: 'Signed up'
    })
  })

})

router.post('/api/account/signin', (req, res, next) => {
  const {
    body
  } = req;
  const {
    password
  } = body;

  let {
    email
  } = body;

  if (!email) {
    res.send({
      succes: false,
      message: ' Error: Email cannot be blank.'
    })
  };
  if (!password) {
    res.send({
      succes: false,
      message: 'Error: Password cannot be blank.'
    })
  };
  email = email.toLowerCase();

  User.find({
    email: email
  }, (err, users) => {
    if (err) {
      return res.send({
        success: false,
        message: 'Error: server error'
      });
    }
    if (users.length != 1) {
      return res.send({
        success: false,
        message: 'Error: invalid'
      })
    }

    const user = users[0];
    if (!user.validPassword(password)) {
      return res.send({
        success: false,
        message: 'Error: Invalid'
      })
    }

    const userSession = new UserSession();
    userSession.userId = user._id;
    userSession.save((err, doc) => {
      if (err) {
        return res.send({
          success: false,
          message: 'Error: server error'
        });
      }

      Timer.find({
        user: user._id
      }, (err, timers) => {
        Group.find({
          user: user._id
        }, (err, groups) => {
          res.send({
            success: true,
            message: 'valid signin',
            token: doc._id,
            timers: timers,
            user: email,
            groups: groups
          })
        })
      })
    })
  })
})

router.get('/api/account/verify', (req, res, next) => {
  //get the token
  //verify token that its unique
  // and that its not deleted
  const {
    query
  } = req;
  const {
    token
  } = query;

  UserSession.find({
    userId: token,
    isDeleted: false
  }, (err, sessions) => {
    if (err) {
      return res.send({
        success: false,
        message: 'error: server error'
      });
    }

    if (sessions.length < 1) {
      return res.send({
        success: false,
        message: 'error: Invalid'
      })
    } else {
      return res.send({
        success: true,
        message: 'good',
        sessions: sessions
      })
    }
  })
})

router.post('/group', (req, res, next) => {
  const {
    body
  } = req;

  const {
    name,
    timers,
    token,
    hash
  } = body;

  if (!name || timers.length == 0) {
    res.send({
      succes: false,
      message: 'Error: Timer name and timers are required.'
    })
  } else {
    UserSession.find({
      _id: token,
      isDeleted: false
    }, (err, sessions) => {

      const newGroup = new Group();

      newGroup.name = name;
      newGroup.timers = timers;
      newGroup.user = sessions[0].userId
      newGroup.hash = hash;
      newGroup.save((err, group) => {
        if (err) {
          console.log(err);
        } else {
          Group.find({
            user: sessions[0].userId
          }, (err, groups) => {
            res.send({
              success: true,
              message: 'Group added',
              groups: groups
            })
          })

        }
      })
    })
  }
})

router.post('/timer', (req, res, next) => {
  const {
    body
  } = req;

  const {
    name,
    length,
    token
  } = body;

  var user = 'Not A User';

  if (!name || !length) {
    res.send({
      succes: false,
      message: 'Error: Timer name and length are required.'
    })
  } else {
    UserSession.find({
      _id: token,
      isDeleted: false
    }, (err, sessions) => {

      const newTimer = new Timer();

      newTimer.name = name;
      newTimer.length = length;
      newTimer.user = sessions[0].userId
      newTimer.save((err, timer) => {
        if (err) {
          console.log(err);
        } else {
          Timer.find({
            user: sessions[0].userId
          }, (err, timers) => {
            res.send({
              success: true,
              message: 'Timer added',
              timers: timers
            })
          })

        }
      })
    })
  }
})

router.get('/hash/:hash', function(req, res, next) {
  const hash = req.params.hash;

  Group.find({
    hash: hash
  }, (err, group) => {
    res.render('index', {
      title: group[0].name,
      hash: group[0].hash

    });
  })
});

router.get('/timer', (req, res, next) => {

  const {
    query
  } = req;
  const {
    token
  } = query;

  UserSession.find({
    _id: token,
    isDeleted: false
  }, (err, sessions) => {
    Timer.find({
      user: sessions[0].userId
    }, (err, timers) => {
      Group.find({
        user: sessions[0].userId
      }, (err, groups) => {
        res.send({
          success: true,
          message: 'resources found',
          timers: timers,
          groups: groups
        })
      })
    })
  })
})

router.get('/group', (req, res, next) => {
  const {
    query
  } = req;
  const {
    token
  } = query;

  UserSession.find({
    _id: token,
    isDeleted: false
  }, (err, sessions) => {
    Group.find({
      user: sessions[0].userId
    }, (err, groups) => {
      res.send({
        success: true,
        message: 'Groups found',
        groups: groups
      })
    })
  })
})

router.get('/group/display', (req, res, next) => {
  const {
    query
  } = req;
  const {
    hash
  } = query;

  Group.find({
    hash: hash
  }, (err, group) => {
    res.send({
      success: true,
      message: 'Group found',
      group: group
    })
  })
})

router.post('/api/account/signup', (req, res, next) => {
  const {
    body
  } = req;
  const {
    firstName,
    lastName,
    password
  } = body;

  let {
    email
  } = body;


  if (!firstName) {
    res.send({
      succes: false,
      message: 'Error: First name cannot be blank.'
    })
  };

  if (!lastName) {
    res.send({
      succes: false,
      message: 'Error: Last name cannot be blank.'
    })
  };

  if (!password) {
    res.send({
      succes: false,
      message: 'Error: Password cannot be blank.'
    })
  };

  if (!email) {
    res.send({
      succes: false,
      message: ' Error: Email cannot be blank.'
    })
  };

  email = email.toLowerCase();

  //steps:
  //verify email doesnt exist
  //save

  User.find({
    email: email
  }, (err, previousUsers) => {
    if (err) {
      res.send({
        success: false,
        message: 'Error: Server Error'
      })
    }
    if (previousUsers.length > 0) {
      res.send({
        success: false,
        message: 'Error: Account already exists'
      })
    } else {
      //save new user

      const newUser = new User();

      newUser.email = email;
      newUser.firstName = firstName;
      newUser.lastName = lastName;
      newUser.password = newUser.generateHash(password)
      newUser.save((err, user) => {
        console.log(user);
        if (err) {
          res.send({
            success: false,
            message: 'Error: server error'
          })
        }
        res.send({
          success: true,
          message: 'Signed up'
        })
      })
    }
  })
})

router.delete('/group', function(req, res) {
  const {
    query
  } = req;
  const {
    groupId,
    token
  } = query;

  UserSession.find({
    _id: token,
    isDeleted: false
  }, (err, sessions) => {
    if (err) {
      console.log(err);
      return res.send({
        success: false,
        message: 'error: server error'
      });
    }

    if (sessions.length < 1) {
      return res.send({
        success: false,
        message: 'error: Invalid'
      })
    } else {
      Group.deleteOne({
        _id: groupId
      }, function(err) {
        if (err) {
          console.log(err);
        } else {
          Group.find({
            user: sessions[0].userId
          }, (err, groups) => {
            res.send({
              success: true,
              message: 'Group deleted'
            })
          })
        }
      })
    }
  })
})

router.delete('/timer', function(req, res) {
  const {
    query
  } = req;
  const {
    timerId,
    token
  } = query;

  UserSession.find({
    _id: token,
    isDeleted: false
  }, (err, sessions) => {

    if (err) {
      console.log(err);
      return res.send({
        success: false,
        message: 'error: server error'
      });
    }

    if (sessions.length < 1) {
      return res.send({
        success: false,
        message: 'error: Invalid'
      })
    } else {
      Timer.deleteOne({
        _id: timerId
      }, function(err) {
        if (err) {
          console.log(err);
        } else {
          Timer.find({
            user: sessions[0].userId
          }, (err, timers) => {
            res.send({
              success: true,
              message: 'Timer deleted',
              timers: timers
            })
          })
        }
      })
    }
  })
})

router.get('/api/account/logout', (req, res, next) => {

  //get the token
  //verify token that its unique
  // and that its not deleted
  const {
    query
  } = req;
  const {
    token
  } = query;

  UserSession.findOneAndUpdate({
    _id: token,
    isDeleted: false
  }, {
    $set: {
      isDeleted: true
    }
  }, null, (err, sessions) => {

    if (err) {
      console.log(err);
      return res.send({
        success: false,
        message: 'error: server error'
      });
    }

    return res.send({
      success: true,
      message: 'good'
    })
  })
})

module.exports = router;
