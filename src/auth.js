const jwt = require("jsonwebtoken");

const secret = "Shh, its a secret!"; //process.env.SECRET;

module.exports.checkSession = function (req, res, next) {
  if (req.cookies.user_sid && req.session.username) {
    res.redirect("/");
  } else {
    next();
  }
};

module.exports.createToken = function (payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, { expiresIn: "1h" }, (err, token) => {
      if (err) {
        return void reject(err);
      }
      resolve(token);
    });
  });
};

module.exports.verifyToken = function (token) {
  return new Promise((resolve, reject) => {
    let tokenParts = token.split(" ");
    let tokenString = undefined;

    //protection against 'Bearer' prefix in token
    if (tokenParts.length > 1) {
      tokenString = tokenParts[1];
    } else {
      tokenString = tokenParts[0];
    }

    jwt.verify(tokenString, secret, (err, decoded) => {
      if (err) {
        reject(err);
      }
      resolve(decoded);
    });
  });
};
