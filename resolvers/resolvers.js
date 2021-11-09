const resolvers = {
    Query: {
        courseNamesIds: (_, {userId, token}, { dataSources }) => {
            console.log("hihihi")
            return "hii"
            return dataSources.CourseAPI.getCourseNamesIds(userId, token)
        }
    },
    

    Mutation: {

    },

    Course: {
    },
    hello: () => {
        console.log("hi")
      return 'Hello worlddddd!';
    },
  };
  
  module.exports = resolvers;
