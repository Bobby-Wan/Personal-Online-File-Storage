const jwt = require('jsonwebtoken');

const secret = process.env.SECRET;

module.exports.checkSession = function(req, res, next) {
  if (req.cookies.user_sid && req.session.username) {
    res.redirect("/");
  }
  else{
      next();
  }
}

module.exports.createToken = function(payload){
  return new Promise((resolve, reject)=>{
    const { password, ...payloadWithoutPassword } = payload;
    jwt.sign(payloadWithoutPassword, secret, {expiresIn:'1h'}, (err, token)=>{
      if(err) { return void reject(err); }
      resolve(token);
    });
  });
}

module.exports.verify = function(token){
  return new Promise((resolve, reject)=>{
    jwt.verify(token, secret, (err, decoded)=>{
      if(err) { return void reject(err); }
      resolve(decoded);
    });
  });
}