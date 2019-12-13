const Event = require("../../models/event");
const User = require("../../models/user");
const { dateToString } = require("../../helpers/date");
const { checkAuth } = require("../../helpers/helpers");

//Function that transforms event to more usable data
const unnötig = event => {
  let transformedEvent = {
    ...event._doc,
    _id: event.id,
    date: dateToString(event._doc.date)
  };
  return transformedEvent;
};

//alte merging functions
//Find all Events and change output of date to a readable date
const events = async eventIds => {
  try {
    let events = await Event.find({ _id: { $in: eventIds } });
    return events.map(event => {
      return {
        ...event._doc,
        date: new Date(event._doc.date).toISOString()
      };
    });
  } catch (err) {
    throw err;
  }
};
const user = async userId => {
  try {
    let user = await User.findById(userId);

    let events = await events(user.createdEvents);
    user.createdEvents = events;
    return user;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  //get all events
  events: async () => {
    try {
      let events = await Event.find();

      return events.map(event => {
        return {
          ...event._doc,
          date: dateToString(event._doc.date)
        };
      });
    } catch (err) {
      throw err;
    }
  },
  //function to get events of logged in user
  myEvents: async (args, req) => {
    checkAuth(req);
    try {
      const events = await Event.find({ creator: req.userId });
      return events;
    } catch (err) {
      throw err;
    }
  },
  //create a new Event
  createEvent: async (args, req) => {
    checkAuth(req);
    try {
      const event = await new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        // /
        date: args.eventInput.date,
        creator: req.userId
      });
      const eventResult = await event.save();

      const user = await User.findById("5dd5b61310d8323548968e32");
      console.log(eventResult);
      user.createdEvents.push(event);
      await user.save();

      return {
        ...eventResult._doc,
        date: new Date(eventResult.date).toISOString()
      };
    } catch (err) {
      throw err;
    }
  }
};
