const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("./db");

const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "missing-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "missing-client-secret",
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

      let user = db.prepare("SELECT * FROM users WHERE google_id = ?").get(profile.id);

      if (!user) {
        const info = db
          .prepare(
            "INSERT INTO users (google_id, email, name, avatar_url) VALUES (?, ?, ?, ?)"
          )
          .run(profile.id, email, profile.displayName, avatar);
        user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
      } else {
        db.prepare("UPDATE users SET email = ?, name = ?, avatar_url = ? WHERE id = ?").run(
          email,
          profile.displayName,
          avatar,
          user.id
        );
        user = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
      }

      done(null, user);
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  done(null, user || false);
});

function requireLogin(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.session.returnTo = req.originalUrl;
  res.redirect("/auth/google");
}

function isAdmin(user) {
  return !!user && adminEmails.includes((user.email || "").toLowerCase());
}

function requireAdmin(req, res, next) {
  if (req.isAuthenticated() && isAdmin(req.user)) return next();
  res.status(403).render("error", { message: "Admins only." });
}

module.exports = { passport, requireLogin, requireAdmin, isAdmin };
