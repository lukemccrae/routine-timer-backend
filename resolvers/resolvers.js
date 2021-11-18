const CourseAPI = require("../course-api")

function mileTimesToArrayOfObjects(arr) {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    result.push([])
    arr[i].map((m, j) => {
      m = {lat: m[0], lng: m[1], elev: m[2]}
      result[i].push(m)
    })
  }
  return result;
}

const resolvers = {
    Query: {
    },
    

    Mutation: {

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

    mileTimesInfo: ({token, courseId}, __, dataSources) => {
      return CourseAPI.getMileTimesInfo(token, courseId).then((data) => {
        data.course[0].route.geoJSON.geometry.coordinates.map((c, i) => {
          data.course[0].route.geoJSON.geometry.coordinates[i] = {lat: c[0], lng: c[1], elev: c[2]}
        })
        data.course[0].route.geoJSON.geometry.milePoints = mileTimesToArrayOfObjects(data.course[0].route.geoJSON.geometry.milePoints)
        console.log(data.course[0].route.geoJSON.geometry.milePoints, "mileTimesInfo( )")
        
        return data.course;
      })
    },

    getCourseInfo: ({token, courseId}, __, dataSources) => {
      return CourseAPI.getCourseInfo(token, courseId).then((data) => {
        return data;
      })
    }

  };
  
  module.exports = resolvers;
