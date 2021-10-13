function checkSession(req, res, next) {
  if (req.cookies.user_sid && req.session.username) {
    res.redirect("/");
  }
  else{
      next();
  }
}

function auth(req,res,next){
  if(!req.cookies.user_sid || !req.session.username){
    return res.redirect('/login');
  }
  next();
}

module.exports = {
  auth,
  checkSession
};