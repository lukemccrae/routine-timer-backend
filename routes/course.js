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

      res.send({
        success: true,
        message: 'valid signin',
        course: courses[0],
        token: doc._id,
        user: user.email,
        courseList: courseList,
        // courses: courses
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

    const courseList = [];
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
          courses.forEach(course => {
            courseList.push({
              id: course._id,
              name: course.details.name,
              hash: course.hash
            })
          });
          
          res.send({
            success: true,
            message: 'valid signin',
            token: user._id,
            email: user.email,
            courseList: courseList,
            // courses: courses
            
          })
        })
      })
    }
  })
})

router.get('/courseList', function(req, res, next) {
  const {
    query
  } = req;
  const {
    token, id
  } = query;

  if(id && token) {
    UserSession.find({
      _id: token,
      isDeleted: false
    }, (err, sessions) => {
      if(sessions.length === 0) {
        res.send({
          success: false,
          message: 'no user sessions found',
        })
      }
      CourseUser.find({
        _id: sessions[0].userId
      }, (err, user) => {
        if(user.length === 0) {
          res.send({
            success: false,
            message: 'no user found',
          })
        }
        Course.find({
          user: sessions[0].userId
        }, (err, courses) => {
          if(courses.length === 0) {
            res.send({
              success: false,
              message: 'no courses found',
            })
          } else {
            res.send({
              success: true,
              message: 'resources found',
              courses: courses
            })
          }
        })

      })
    })
  } else {
    res.send({
      success: false,
      message: 'session token and userId required',
    })
  }


});

router.post('/', (req, res, next) => {
  const {
    body
  } = req;
  const {
    token,
    hash
  } = body;

  if (!hash) {
    res.send({
      succes: false,
      message: 'Error: Course hash is required.'
    })
  } else {
    UserSession.find({
      _id: token,
      isDeleted: false
    }, (err, sessions) => {

      const newCourse = new Course();
      newCourse.user = sessions[0].userId
      newCourse.hash = hash;

      newCourse.save((err, course) => {
        console.log("saved course", course)
        if (err) {
          console.log(err);
        } else {
            Course.find({
              user: sessions[0].userId
          }, (err, courses) => {
            const courseList = [];
            courses.forEach(course => {
              courseList.push({
                id: course._id,
                name: course.details.name,
                hash: course.hash,
              })
            });
            res.send({
              success: true,
              message: 'Course added',
              course: courses[0],
              courseList: courseList,
              // courses: courses
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
    token, id
  } = query;

  UserSession.find({
    _id: token,
    isDeleted: false
  }, (err, sessions) => {
    CourseUser.find({
      _id: sessions[0].userId
    }, (err, user) => {
      
      Course.find({
        _id: id
      }, (err, course) => {
        console.log(course)
        
        res.send({
          success: true,
          message: 'resources found',
          course: course
        })
      })
    })
  })
})

//why are there two of these???
router.get('/', (req, res, next) => {
  const {
    query
  } = req;
  const {
    token, id
  } = query;

  UserSession.find({
    _id: token,
    isDeleted: false
  }, (err, sessions) => {
    Course.find({
      _id: id
    }, (err, course) => {
      console.log(course)
      res.send({
        success: true,
        message: 'Course found',
        course: course
      })
    })
  })
})

// router.get('/group/display', (req, res, next) => {
//   const {
//     query
//   } = req;
//   const {
//     hash
//   } = query;

//   Group.find({
//     hash: hash
//   }, (err, group) => {
//     res.send({
//       success: true,
//       message: 'Group found',
//       group: group
//     })
//   })
// })

router.patch('/', function(req, res) {
  const {query} = req;
  const {courseId, token} = query;

  console.log(req.body, "hi")

  Course.findOneAndUpdate({_id: courseId}, {$set:
    {
      details: req.body.details,
      stops: req.body.stops,
      paceAdjust: req.body.paceAdjust
    }}, (err, courses) => {

      UserSession.find({
        _id: token,
        isDeleted: false
      }, (err, sessions) => {
        Course.find({
          user: sessions[0].userId
        }, (err, courses) => {
          const courseList = []
          courses.forEach(course => {
            courseList.push({
              id: course._id,
              name: course.details.name,
              hash: course.hash,
            })
          });
          res.send({
            success: true,
            message: 'Course modified',
            courseList: courseList 
            // course: courses[0],
            // courses: courses
          })
        })
      })



      })
  })

  

router.patch('/new', function(req, res) {
  const {query} = req;
  const {courseId} = query;

  let newRoute = {
    geoJSON: req.body.geoJSON,
    type: "Feature"
  }

  console.log(newRoute.geoJSON.properties.vertInfo)

  console.log(newRoute)

  Course.findOneAndUpdate({_id: courseId}, {$set:
    {
      route: newRoute,
      paceAdjust: new Array(newRoute.geoJSON.properties.vertInfo.cumulativeGain.length).fill(0)

    }}, (err, course) => {
    res.send({
      success: true,
      message: 'GPX added to course',
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

  console.log(query)

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
            const courseList = []
            courses.forEach(course => {
              courseList.push({
                id: course._id,
                name: course.details.name,
                hash: course.hash,
              })
            });

            res.send({
              success: true,
              message: 'Course deleted',
              courseList: courseList
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
