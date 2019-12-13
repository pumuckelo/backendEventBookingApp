//INTERNAL CORE MODULES

//EXTERNAL MODULES
const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const schema = require("./graphql/schemas/index");
const resolver = require("./graphql/resolvers/index");

//Middleware
const isAuthMiddleware = require("./middleware/is-auth");
const corsMiddleware = require("./middleware/cors");
//
const app = express();

//Settings
app.use(corsMiddleware);
app.use(bodyParser.json());
app.use(isAuthMiddleware);
//DEV THINGS

//Functions

//"Routes"
app.use(
  "/graphql",
  graphqlHttp({
    schema: schema,
    rootValue: resolver,

    graphiql: true
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-sxln5.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log(`Connected to database`);
    //Start the server
    app.listen(8000, () => {
      console.log("Server started");
    });
  })
  .catch(err => {
    if (err) {
      console.log(`Error on connecting to database: ${err}`);
    }
  });
