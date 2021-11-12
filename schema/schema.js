const { buildSchema } = require('graphql');
console.log(buildSchema)

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    hello: String,
    courseNamesIds(token: String!): [CourseList]
    mileTimes(token: String): MileTimes
  }

  type MileTimes {
    details {
      goalHours
      goalMinutes
    }
  }

  type CourseList {
    _id: ID
    details: Details
    hash: String!
  }

  type Stops {
    stops: [Stop]
  }

  type Stop {
    name: String!
    cals: Int!
    miles: Int!
    id: Int!
  }

  type User {
    user: String!
  }

  type Route {
    geoJSON: Properties
  }

  type Properties {
    name: String!
    distance: Int!
    vert: Int!
    vertInfo: VertInfo
  }

  type VertInfo {
    cumulativeGain: [Float]
    cumulativeLoss: [Float]

  }

  type Details {
      name: String!
      goalHours: Int!
      goalMinutes: Int!
      calories: Int!
      mileTimes: [Int]!
      distance: Int!
      vert: Int!
      vertMod: Int!
      terrainMod: Float!
      startTime: String!
  }

`);

module.exports = schema;