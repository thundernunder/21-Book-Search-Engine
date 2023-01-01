const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
const { authMiddleware } = require('./utils/auth');
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');

// no longer need RESTFUL routes since were implementing GraphQL interface
// const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// apply Apollo server to express as middleware
const server = new ApolloServer({
  typeDefs, 
  resolvers, 
  context: authMiddleware, 
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// this is a RESTful api component. Not necessary with Apollo/GraphQL
// app.use(routes);

const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  server.applyMiddleware({ app });

  db.once('open', () => {
    app.listen(PORT, () => console.log(`🌍 Now listening on port ${PORT}`));
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startApolloServer(typeDefs, resolvers);
