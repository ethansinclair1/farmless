const express = require("express");
const Stripe = require("stripe");
const db = require("../db");
const servers = require("../data/servers");
const { requireLogin } = require("../auth");
const { cartToLines, getCart } = require("./shop");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

router.get("/", requireLogin, (req, res) => {
  const lines = cartToLines(getCart(req));
  if (lines.length === 0) return res.redirect("/cart");
  const totalCents = lines.reduce((sum, l) => sum + l.cents, 0);
  res.render("checkout", { lines, totalCents, servers, error: null });
});

router.post("/", requireLogin, async (req, res) => {
  const lines = cartToLines(getCart(req));
  if (lines.length === 0) return res.redirect("/cart");
  const totalCents = lines.reduce((sum, l) => sum + l.cents, 0);

  const { steamUsername, baseCoords, serverId, customServer } = req.body;
  const serverMeta = servers.find((s) => s.id === serverId);

  if (!steamUsername || !baseCoords || !serverMeta) {
    return res.status(400).render("checkout", {
      lines,
      totalCents,
      servers,
      error: "Fill in your Steam username, base coordinates, and server."
    });
  }

  const serverLabel = serverId === "other" ? (customServer || "Other").trim() : serverMeta.name;

  const orderInfo = db
    .prepare(
      `INSERT INTO orders (user_id, steam_username, base_coords, server_id, server_label, total_cents, status)
       VALUES (?, ?, ?, ?, ?, ?, 'awaiting_payment')`
    )
    .run(req.user.id, steamUsername.trim(), baseCoords.trim(), serverId, serverLabel, totalCents);

  const orderId = orderInfo.lastInsertRowid;

  const insertItem = db.prepare(
    "INSERT INTO order_items (order_id, item_id, item_name, quantity, price_cents) VALUES (?, ?, ?, ?, ?)"
  );
  for (const line of lines) {
    insertItem.run(orderId, line.item.id, line.item.name, line.quantity, line.cents);
  }

  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lines.map((l) => ({
        price_data: {
          currency: "usd",
          product_data: { name: `${l.item.name} x${l.quantity}` },
          unit_amount: l.cents
        },
        quantity: 1
      })),
      success_url: `${baseUrl}/orders/${orderId}?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
      metadata: { orderId: String(orderId) }
    });

    db.prepare("UPDATE orders SET stripe_session_id = ? WHERE id = ?").run(session.id, orderId);
    req.session.cart = {};
    res.redirect(303, session.url);
  } catch (err) {
    db.prepare("UPDATE orders SET status = 'failed' WHERE id = ?").run(orderId);
    console.error("Stripe checkout session failed:", err.message);
    res.status(500).render("checkout", {
      lines,
      totalCents,
      servers,
      error:
        "Payments aren't configured yet (missing/invalid Stripe key). Set STRIPE_SECRET_KEY in .env."
    });
  }
});

module.exports = router;
