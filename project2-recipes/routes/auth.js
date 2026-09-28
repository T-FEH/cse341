const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isAuthenticated } = require('../middleware/auth');

// Sends the user to GitHub to approve the login
router.get(
  '/login',
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'Log in with GitHub'
  // #swagger.description = 'Redirects to GitHub. Open this in a browser tab, not from Swagger, because Swagger cannot follow the redirect.'
  passport.authenticate('github', { scope: ['user:email'] })
);

// GitHub sends the user back here after they approve
router.get(
  '/github/callback',
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'GitHub sends the user back here after login'
  passport.authenticate('github', { failureRedirect: '/login-failed' }),
  (req, res) => {
    res.redirect('/profile');
  }
);

router.get('/login-failed', (req, res) => {
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'Shown when a GitHub login does not complete'
  res.status(401).json({ message: 'GitHub login failed. Please try again.' });
});

// Shows who is logged in. Returns 401 when nobody is.
router.get('/profile', isAuthenticated, (req, res) => {
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'Show the logged in user'
  // #swagger.description = 'Returns 401 when nobody is logged in, which is the easiest way to show the difference.'
  res.status(200).json({
    message: 'You are logged in.',
    user: {
      githubId: req.user.githubId,
      username: req.user.username,
      displayName: req.user.displayName,
      lastLogin: req.user.lastLogin
    }
  });
});

// Ends the session
router.get('/logout', (req, res, next) => {
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'Log out'
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy(() => {
      res.status(200).json({ message: 'You are logged out.' });
    });
  });
});

module.exports = router;
