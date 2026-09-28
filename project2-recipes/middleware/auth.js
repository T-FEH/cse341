// Put this in front of any route that should need a login.
// Passport adds req.isAuthenticated() once the session middleware has run.
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({
    message: 'You must be logged in to do that.',
    loginUrl: '/login'
  });
}

module.exports = { isAuthenticated };
