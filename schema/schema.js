const { buildSchema } = require('graphql');
console.log(buildSchema)

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    hello: String,
    courseNamesIds(id: ID!, token: String!): [Course]
  }

  type Course {
    _id: ID
    details: Details
    hash: String!
    
  }

  type Details {
      name: String!
  }

`);

module.exports = schema;