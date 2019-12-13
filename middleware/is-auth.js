const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.isAuth = false;
    console.log("Kein AuthHeader");
    return next();
  }
  const token = authHeader.split(" ")[1];
  if (!token || token == "") {
    req.isAuth = false;
    console.log("Kein Token oder token leer");
    return next();
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "einsehrsichererkey");
    console.log(decodedToken);
  } catch (err) {
    req.isAuth = false;
    console.log("konnte token nicht verifizieren");
    return next();
  }

  if (!decodedToken) {
    req.isAuth = false;
    console.log("decoded token nicht da");
    return next();
  }
  req.isAuth = true;
  req.userId = decodedToken.userId;
  next();
};
