const CourseAPI = require("../course-api")
const { mileTimesToArrayOfObjects } = require('./resolver-helpers');

const resolvers = {
    Query: {
    },

    Course: {
    },
    hello: () => {
        console.log("hi")
      return 'Hello worlddddd!';
    },
    courseNamesIds: ({token}, __, dataSources) => {
        return CourseAPI.getCourseNamesIds(token).then((data)=> {
            return data.courses;
        })
    },
    deleteCourse: async ({token, courseId}) => {
      const data = await CourseAPI.deleteCourse(token, courseId);
      return data.courseList;
    },

    addNewCourse: async({token}) => {
      const data = await CourseAPI.addNewCourse(token);
      return data.course;
    },
    saveCourse: async({token, courseId, tempCourse}) => {
      console.log(token, courseId, tempCourse, "saveCourse(")
      const data = await CourseAPI.saveCourse(token, courseId, tempCourse)
      return data.message;
    },

    mileTimesInfo: ({token, courseId}, __, dataSources) => {
      return CourseAPI.getMileTimesInfo(token, courseId).then((data) => {
        data.course[0].route.geoJSON.geometry.coordinates.map((c, i) => {
          data.course[0].route.geoJSON.geometry.coordinates[i] = {lat: c[0], lng: c[1], elev: c[2]}
        })
        data.course[0].route.geoJSON.geometry.milePoints = mileTimesToArrayOfObjects(data.course[0].route.geoJSON.geometry.milePoints)
        
        return data.course;
      })
    },

    routeInfo: ({token, courseId}, __, dataSources) => {
      return CourseAPI.getRouteInfo(token, courseId).then((data) => {
        let coords = data.geoJSON.geometry.coordinates
        coords.map((c, i) => {
          coords[i] = {lat: c[0], lng: c[1], elev: c[2]}
        })
        return data;
      })
    },

    courseInfo: ({token, courseId}, __, dataSources) => {
      return CourseAPI.getCourseInfo(token, courseId).then((data) => {
        return data;
      })
    },

    stopsInfo: ({token, courseId}, __, dataSources) => {
      return CourseAPI.getStopsInfo(token, courseId).then((data) => {
        console.log(data, 'data')
        return data;
      })
    }
  };
  
  module.exports = resolvers;
