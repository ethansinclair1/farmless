require("dotenv").config();

const express = require("express");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const path = require("path");
const Stripe = require("stripe");

const db = require("./db");
const { passport, isAdmin } = require("./auth");

const authRoutes = require("./routes/auth");
const shopRoutes = require("./routes/shop");
const checkoutRoutes = require("./routes/checkout");
const orderRoutes = require("./routes/orders");
const adminRoutes = require("./routes/admin");

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Stripe webhook needs the raw body, so it's wired up before the JSON/urlencoded parsers.
app.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook signature check failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata && session.metadata.orderId;
      if (orderId) {
        db.prepare("UPDATE orders SET status = 'paid' WHERE id = ?").run(orderId);
      }
    }

    res.json({ received: true });
  }
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    store: new SQLiteStore({ db: "sessions.sqlite", dir: __dirname }),
    secret: process.env.SESSION_SECRET || "dev-only-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.isAdmin = isAdmin(req.user);
  res.locals.cartCount = req.session.cart ? Object.keys(req.session.cart).length : 0;
  next();
});

app.use("/auth", authRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/orders", orderRoutes);
app.use("/admin", adminRoutes);
app.use("/", shopRoutes);

app.use((req, res) => {
  res.status(404).render("error", { message: "Page not found." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Farmless running at http://localhost:${PORT}`);
});
