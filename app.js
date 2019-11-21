//INTERNAL CORE MODULES

//EXTERNAL MODULES
const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//models
const Event = require("./models/event");
const User = require("./models/user");

//
const app = express();

//Settings
app.use(bodyParser.json());

//DEV THINGS
const events = [];

//"Routes"
app.use(
  "/graphql",
  graphqlHttp({
    schema: buildSchema(`

        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: User!
        }

        type User {
             _id: ID!
             email: String!
             username: String!
             password: String
             createdEvents : [Event!]
        }

        input UserInput {
            email: String!
            username: String!
            password: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String! 
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      //Resolver functions
      events: () => {
        return Event.find()
          .populate("creator")
          .then(foundEvents => {
            console.log(foundEvents);
            return foundEvents;
          })
          .catch(err => {
            console.log(err);
          });
      },
      createEvent: args => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
          creator: "5dd5b61310d8323548968e32"
        });
        let createdEvent;
        return event
          .save()
          .then(result => {
            createdEvent = result;
            console.log(createdEvent);
            return User.findById("5dd5b61310d8323548968e32");
            console.log(`Created Event: ${result}`);
            return result;
          })
          .then(user => {
            if (!user) {
              throw new Error("User not found");
            }
            user.createdEvents.push(event);
            return user.save();
          })
          .then(() => {
            return createdEvent;
          })
          .catch(err => {
            console.log(`Error on creating Event: ${err}`);
            throw err;
          });
        return event;
      },

      createUser: args => {
        return User.findOne({ email: args.userInput.email })
          .then(email => {
            if (email) {
              throw new Error(`Email is already being used`);
            }
          })
          .then(() => {
            return User.findOne({ username: args.userInput.username })
              .then(username => {
                if (username) {
                  throw new Error(`Username is already being used`);
                }
                return bcrypt.hash(args.userInput.password, 12);
              })
              .then(hashedPassword => {
                const user = new User({
                  email: args.userInput.email,
                  username: args.userInput.username,
                  password: hashedPassword
                });

                return user.save();
              })
              .then(createdUser => {
                console.log(createdUser);
                return createdUser;
              })
              .catch(err => {
                throw err;
              });
          })
          .catch(err => {
            throw err;
          });
        // User.findOne({ username: args.userInput.username })
        //   .then(username => {
        //     if (username) {
        //       throw new Error(`Username is already being used`);
        //     }
        //     return bcrypt.hash(args.userInput.password, 12);
        //   })
        //   .then(hashedPassword => {
        //     const user = new User({
        //       email: args.userInput.email,
        //       username: args.userInput.username,
        //       password: hashedPassword
        //     });

        //     return user.save();
        //   })
        //   .then(createdUser => {
        //     console.log(createdUser);
        //     return createdUser;
        //   })
        //   .catch(err => {
        //     throw err;
        //   });
      }
    },

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
