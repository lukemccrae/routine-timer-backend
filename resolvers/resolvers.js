const CourseAPI = require("../course-api")



const resolvers = {
    Query: {
        // courseNamesIds: (_, {id, token}, {dataSources}) => {
        //     console.log(id, token)
        //     return ["hi"]
        //     dataSources.CourseAPI.getCourseNamesIds("userId", "token")
        //     return dataSources.CourseAPI.getCourseNamesIds("userId", "token")
        //     return dataSources.CourseAPI.getCourseNamesIds(userId, token)
        // }
    },
    

    Mutation: {

    },

    Course: {
    },
    hello: () => {
        console.log("hi")
      return 'Hello worlddddd!';
    },
    courseNamesIds: ({id, token}, __, dataSources) => {
        return CourseAPI.getCourseNamesIds(id, token).then((data)=> {
            return data.courses;
        })
    }

  };
  
  module.exports = resolvers;
