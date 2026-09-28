const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { getDatabase } = require('../db/connect');

// Where GitHub sends the user back to after they approve the login.
// It has to match the callback url set on the GitHub OAuth app exactly.
function getCallbackUrl() {
  if (process.env.GITHUB_CALLBACK_URL) {
    return process.env.GITHUB_CALLBACK_URL;
  }
  return 'http://localhost:3000/github/callback';
}

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: getCallbackUrl()
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const db = getDatabase();

        // We never see or store a password. GitHub checks that, and only
        // tells us who the user is, so there is nothing to hash here.
        const user = {
          githubId: profile.id,
          username: profile.username,
          displayName: profile.displayName || profile.username,
          avatarUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
          lastLogin: new Date()
        };

        // Save them the first time, update lastLogin every time after that
        await db.collection('users').updateOne(
          { githubId: user.githubId },
          { $set: user },
          { upsert: true }
        );

        const saved = await db.collection('users').findOne({ githubId: user.githubId });
        return done(null, saved);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Only the id goes into the session cookie, to keep it small
passport.serializeUser((user, done) => {
  done(null, user.githubId);
});

// On every request, turn that id back into the full user
passport.deserializeUser(async (githubId, done) => {
  try {
    const user = await getDatabase().collection('users').findOne({ githubId: githubId });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
