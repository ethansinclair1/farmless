const express = require("express");
const db = require("../db");
const { requireAdmin } = require("../auth");

const router = express.Router();
const STATUS_STEPS = ["awaiting_payment", "paid", "preparing", "delivering", "delivered"];

router.get("/", requireAdmin, (req, res) => {
  const orders = db
    .prepare(
      `SELECT orders.*, users.name AS customer_name, users.email AS customer_email
       FROM orders JOIN users ON users.id = orders.user_id
       ORDER BY orders.created_at DESC`
    )
    .all();
  res.render("admin-dashboard", { orders });
});

router.post("/:id/status", requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!STATUS_STEPS.includes(status)) return res.status(400).send("Bad status");
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
  res.redirect(`/orders/${req.params.id}`);
});

module.exports = router;
