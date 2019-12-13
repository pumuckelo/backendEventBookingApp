//resolvers
const authResolver = require("./auth");
const eventResolver = require("./events");
const bookingResolver = require("./bookings");
//Functions------------------------

module.exports = {
  //Resolver functions
  ...authResolver,
  ...eventResolver,
  ...bookingResolver
};
