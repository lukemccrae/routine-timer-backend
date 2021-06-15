var router = require('express').Router();
const CourseUser = require('../models/CourseUser');
const UserSession = require('../models/UserSession');
const Course = require('../models/Course');

router.post('/api/account/signup', (req, res, next) => {
    
    const {
      body
    } = req;
    const {
      firstName,
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
  
    CourseUser.find({
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
  
        const newCourseUser = new CourseUser();
        
        newCourseUser.email = email;
        newCourseUser.firstName = firstName;
        newCourseUser.password = newCourseUser.generateHash(password)
        
        newCourseUser.save((err, CourseUser) => {
          if (err) {
            console.log("err")
            res.send({
              success: false,
              message: 'Error: server error'
            })
          }
          res.send({
            success: true,
            message: 'Signed up',
            CourseUser: CourseUser
          })
        })
      }
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

  console.log(body)

  if (!email) {
    res.send({
      succes: false,
      message: ' Error: Email cannot be blank.'
    })
  } else if (!password) {
    res.send({
      succes: false,
      message: 'Error: Password cannot be blank.'
    })
  } else {

  email = email.toLowerCase();


  CourseUser.find({
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

      CourseUser.find({
        user: user._id
      }, (err, timers) => {
        Course.find({
          user: user._id
        }, (err, courses) => {
          
          res.send({
            success: true,
            message: 'valid signin',
            courses: courses,
            token: doc._id,
            
          })
        })
      })
    })
  })
  }
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
    _id: token,
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
      CourseUser.findById({
        _id: sessions[0].userId
      }, (err, user) => {
        
        Course.find({
          user: sessions[0].userId
        }, (err, courses) => {
          
          res.send({
            success: true,
            message: 'valid signin',
            token: user._id,
            email: user.email,
            courses: courses
            
          })
        })
      })
    }
  })
})

router.post('/', (req, res, next) => {
  const {
    body
  } = req;
  const {
    name,
    details,
    token,
    hash,
    stops
  } = body;

  if (!name) {
    res.send({
      succes: false,
      message: 'Error: Course name is required.'
    })
  } else {
    UserSession.find({
      _id: token,
      isDeleted: false
    }, (err, sessions) => {

      const newCourse = new Course();

      newCourse.name = name;
      newCourse.user = sessions[0].userId
      newCourse.hash = hash;
      newCourse.stops = stops;
      console.log(newCourse)
      newCourse.save((err, course) => {
        if (err) {
          console.log(err);
        } else {
            Course.find({
            user: sessions[0].userId
          }, (err, courses) => {
            console.log(courses)
            res.send({
              success: true,
              message: 'Course added',
              courses: courses
            })
          })

        }
      })
    })
  }
})


router.get('/hash/:hash', function(req, res, next) {
  const hash = req.params.hash;

  Course.find({
    user: sessions[0].userId
  }, (err, courses) => {
    res.send({
      success: true
    })
  })

  Group.find({
    hash: hash
  }, (err, group) => {
    res.render('index', {
      title: group[0].name,
      hash: group[0].hash

    });
  })
});

router.get('/course', (req, res, next) => {


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
    User.find({
      _id: sessions[0].userId
    }, (err, user) => {
      Course.find({
        user: sessions[0].userId
      }, (err, courses) => {
        
        res.send({
          success: true,
          message: 'resources found',
          courses: courses
        })
      })
    })
  })
})

router.get('/g/:group', (req, res, next) => {
  const groupHash = req.params.group;
  console.log(groupHash)

  Group.find({
    hash: groupHash
  }, (err, group) => {
    res.send({
      group: group,
      success: true,
      message: "Group served"
    })
  })
})


router.get('/email', (req, res, next) => {

  const {
    query
  } = req;
  const {
    username
  } = query;


  User.find({
    email: username
  }, (err, user) => {
      
    res.json({
      success: true,
      message: 'resources found',
      log: user[0].log
    })

  })
})

//why are there two of these???
router.get('/', (req, res, next) => {
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
    Course.find({
      user: sessions[0].userId
    }, (err, courses) => {
      res.send({
        success: true,
        message: 'Courses found',
        courses: courses
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

router.patch('/', function(req, res) {
  const {query} = req;
  const {courseId} = query;

  Course.findOneAndUpdate({_id: courseId}, {$set:
    {
      name: req.body.name,
      stops: req.body.stops
    }}, (err, course) => {
    res.send({
      success: true,
      message: 'Course updated',
      course: course
    })
  })
})

router.delete('/', function(req, res) {
  const {
    query
  } = req;
  const {
    courseId,
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
      Course.deleteOne({
        _id: courseId
      }, function(err) {
        if (err) {
          console.log(err);
        } else {
          Course.find({
            user: sessions[0].userId
          }, (err, courses) => {
            res.send({
              success: true,
              message: 'Course deleted',
              courses: courses.length
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
