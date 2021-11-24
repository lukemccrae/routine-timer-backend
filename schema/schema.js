const { buildSchema } = require('graphql');
console.log(buildSchema);

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    hello: String,
    courseNamesIds(token: String!): [CourseList]
    mileTimesInfo(token: String, courseId: String): [MileTimes]
    getCourseInfo(token: String, courseId: String): Course
    routeInfo(token: String, courseId: String): Route
    stopsInfo(token: String, courseId: String): Stops
    courseInfo(token: String, courseId: String): CourseInfo
  }

  type Mutation {
    deleteCourse(courseId: String!, token: String!): [CourseList]
  }

  type Course {
    stops: Stops
    route: Route
    details: Details
  }

  type CourseInfo {
    name: String!
    goalHours: Int!
    goalMinutes: Int!
    calories: Int!
    terrainMod: Float!
    startTime: String!
  }

  type MileTimes {
    _id: ID
    details: Details
    route: Route
    paceAdjust: [Float]
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
    id: String!
    comments: String!
  }

  type User {
    user: String!
  }

  type Route {
    geoJSON: GeoJSON
  }

  type GeoJSON {
    properties: Properties
    geometry: Geometry
  }

  type Geometry {
    coordinates: [Coord]
    milePoints: [[Coord]]
  }

  type Coord {
    lat: Float
    lng: Float
    elev: Float
  }

  type Properties {
    name: String
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
      mileTimes: [Float]!
      distance: Int!
      vert: Int
      vertMod: Int!
      terrainMod: Float!
      startTime: String!
  }

`);

module.exports = schema;