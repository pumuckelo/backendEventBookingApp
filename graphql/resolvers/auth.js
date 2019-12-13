const bcrypt = require("bcryptjs");

const User = require("../../models/user");

const jwt = require("jsonwebtoken");

module.exports = {
  createUser: async args => {
    try {
      const userEmail = await User.findOne({ email: args.userInput.email });
      const userUsername = await User.findOne({
        username: args.userInput.username
      });
      if (userUsername) {
        throw new Error("Dieser Benutzername ist bereits vergeben.");
      } else if (userEmail) {
        throw new Error("Diese E-Mail Adresse wird bereits verwendet.");
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
      const user = await new User({
        email: args.userInput.email,
        username: args.userInput.username,
        password: hashedPassword
      });
      const createdUser = await user.save();
      console.log(createdUser);
      return { ...createdUser._doc, password: null };
    } catch (err) {
      throw err;
    }
  },
  login: async args => {
    const user = await User.findOne({ email: args.email });
    if (!user) {
      throw new Error(
        "Das angegebene Passwort stimmt nicht mit der E-Mail-Adresse überein."
      );
    }
    const passwordCorrect = await bcrypt.compare(args.password, user.password);
    if (!passwordCorrect) {
      throw new Error(
        "Das angegebene Passwort stimmt nicht mit der E-Mail-Adresse überein."
      );
    }
    const token = await jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      "einsehrsichererkey",
      { expiresIn: "1h" }
    );

    return {
      //eig unnötig die user.id zuruckzugeben, da wir die user id bei der is-auth.js middleware aus dem token extrahieren und dann
      //in req.userId speichern
      userId: user.id,
      token: token,
      tokenExpiration: 1
    };
  }
};
