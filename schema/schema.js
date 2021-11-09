const { buildSchema } = require('graphql');

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    hello: String,
    courseNamesIds: [Course]
  }

  type Course {
    id: ID!
    name: String!
}
`);



module.exports = schema;