//models
const Event = require("../../models/event");
const User = require("../../models/user");
const Booking = require("../../models/booking");
const { dateToString } = require("../../helpers/date");
const { checkAuth } = require("../../helpers/helpers");

module.exports = {
  bookings: async (args, req) => {
    checkAuth(req);
    try {
      return (bookings = await Booking.find());
    } catch (err) {
      throw err;
    }
  },
  myBookings: async (args, req) => {
    const bookings = await Booking.find({ user: req.userId });
    return bookings;
  },
  bookEvent: async (args, req) => {
    checkAuth(req);

    try {
      const event = await Event.findOne({ _id: args.eventId });
      const user = await User.findOne({ _id: req.userId });
      // const user = await User.findOne({ _id: "5ddd9575c95d1e21e4934610" });
      const booking = new Booking({
        user: user,
        event: event
      });
      const result = await booking.save();
      return result;
    } catch (err) {
      throw err;
    }
  },
  cancelBooking: async (args, req) => {
    checkAuth(req);
    try {
      const booking = await Booking.findOne({ _id: args.bookingId });
      const event = booking.event;

      await Booking.findByIdAndDelete(args.bookingId).catch(err => {
        throw err;
      });
      return event;
    } catch (err) {
      throw err;
    }
  }
};
