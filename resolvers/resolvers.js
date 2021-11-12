const CourseAPI = require("../course-api")



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
    }

  };
  
  module.exports = resolvers;
