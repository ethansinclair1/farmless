const express = require("express");
const { passport } = require("../auth");

const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const dest = req.session.returnTo || "/";
    delete req.session.returnTo;
    res.redirect(dest);
  }
);

router.post("/logout", (req, res) => {
  req.logout(() => res.redirect("/"));
});

module.exports = router;
