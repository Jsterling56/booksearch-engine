const express = require('express');
const path = require('path');
// Import the ApolloServer class
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { authMiddleware } = require('./utils/auth');

// Import the two parts of a GraphQL schema
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const app = express();

// Create a new instance of an Apollo server with the GraphQL schema
const startApolloServer = async () => {
  await server.start();
  
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  
  app.use('/graphql', expressMiddleware(server, {
    context: authMiddleware
  }));

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};


startApolloServer();


// const express = require('express');
// const path = require('path');
// const { ApolloServer } = require('apollo-server-express');
// const db = require('./config/connection');
// const { typeDefs, resolvers } = require('./schemas');

// const app = express();
// const PORT = process.env.PORT || 3001;

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// // if we're in production, serve client/build as static assets
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../client/build')));
// }

// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
// });


// await server.start()

// server.applyMiddleware({ app });

// db.once('open', () => {
//   app.listen(PORT, () => 
//   console.log(`🌍 Now listening on localhost:${PORT}${server.graphqlPath}`));
// });


// const express = require('express');
// const path = require('path');
// const { ApolloServer } = require('apollo-server-express'); // Use 'apollo-server-express' here
// const { authMiddleware } = require('./utils/auth');
// const { typeDefs, resolvers } = require('./schemas');
// const db = require('./config/connection');

// const PORT = process.env.PORT || 3001;
// const app = express();

// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());

// // Create a new instance of an Apollo server with the GraphQL schema
// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
//   context: authMiddleware, // Include context here
// });

// // Apply Apollo Server middleware to the '/graphql' path
// server.applyMiddleware({ app, path: '/graphql' });

// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../client/dist')));

//   app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../client/dist/index.html'));
//   });
// }

// db.once('open', () => {
//   app.listen(PORT, () => {
//     console.log(`API server running on port ${PORT}!`);
//     console.log(`GraphQL at http://localhost:${PORT}/graphql`);
//   });
// });
