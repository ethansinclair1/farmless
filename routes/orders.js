const express = require("express");
const Stripe = require("stripe");
const db = require("../db");
const { requireLogin, isAdmin } = require("../auth");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

const STATUS_STEPS = ["awaiting_payment", "paid", "preparing", "delivering", "delivered"];

function loadOrder(id) {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
  if (!order) return null;
  order.items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(id);
  order.messages = db
    .prepare("SELECT * FROM messages WHERE order_id = ? ORDER BY created_at ASC")
    .all(id);
  return order;
}

router.get("/", requireLogin, (req, res) => {
  const orders = db
    .prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.user.id);
  res.render("orders-list", { orders });
});

router.get("/:id", requireLogin, async (req, res) => {
  const order = loadOrder(req.params.id);
  if (!order) return res.status(404).render("error", { message: "Order not found." });

  const owner = order.user_id === req.user.id;
  const admin = isAdmin(req.user);
  if (!owner && !admin) return res.status(403).render("error", { message: "Not your order." });

  if (req.query.paid && order.status === "awaiting_payment" && req.query.session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
      if (session.payment_status === "paid") {
        db.prepare("UPDATE orders SET status = 'paid' WHERE id = ?").run(order.id);
        order.status = "paid";
      }
    } catch (err) {
      console.error("Could not verify Stripe session:", err.message);
    }
  }

  res.render("order-detail", { order, STATUS_STEPS, admin });
});

router.post("/:id/messages", requireLogin, (req, res) => {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  const owner = order.user_id === req.user.id;
  const admin = isAdmin(req.user);
  if (!owner && !admin) return res.status(403).json({ error: "Not your order" });

  const body = (req.body.body || "").trim();
  if (!body) return res.status(400).json({ error: "Empty message" });

  db.prepare(
    "INSERT INTO messages (order_id, sender, author_name, body) VALUES (?, ?, ?, ?)"
  ).run(order.id, admin ? "staff" : "customer", req.user.name, body);

  res.redirect(`/orders/${order.id}`);
});

router.get("/:id/messages.json", requireLogin, (req, res) => {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  const owner = order.user_id === req.user.id;
  const admin = isAdmin(req.user);
  if (!owner && !admin) return res.status(403).json({ error: "Not your order" });

  const messages = db
    .prepare("SELECT * FROM messages WHERE order_id = ? ORDER BY created_at ASC")
    .all(order.id);
  res.json({ messages });
});

module.exports = router;
