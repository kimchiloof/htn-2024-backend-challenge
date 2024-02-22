import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { typeDefs, resolvers } from './data/schema.js';
import db from "./data/database.js";



// Start app
const app = express();
const httpServer = http.createServer(app);

// Configure expressMiddleware server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
    '/',
    cors(),
    express.json(),
    expressMiddleware(server, {
        context: async ({ req }) => ({ token: req.headers.token }),
    }),
);

// Set up the server to listen on 4000
await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));

console.log(`🚀 Server ready at http://localhost:4000/`);
