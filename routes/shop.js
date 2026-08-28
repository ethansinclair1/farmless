const express = require("express");
const items = require("../data/items");

const router = express.Router();

function getCart(req) {
  if (!req.session.cart) req.session.cart = {};
  return req.session.cart;
}

function cartToLines(cart) {
  return Object.entries(cart)
    .map(([itemId, quantity]) => {
      const item = items.find((i) => i.id === itemId);
      if (!item || !quantity) return null;
      const cents = Math.round((quantity / item.batch) * item.pricePer * 100);
      return { item, quantity, cents };
    })
    .filter(Boolean);
}

router.get("/", (req, res) => {
  res.render("home", { items });
});

router.get("/cart", (req, res) => {
  const lines = cartToLines(getCart(req));
  const totalCents = lines.reduce((sum, l) => sum + l.cents, 0);
  res.render("cart", { lines, totalCents });
});

router.post("/cart/add", (req, res) => {
  const { itemId, quantity } = req.body;
  const item = items.find((i) => i.id === itemId);
  if (!item) return res.status(404).json({ error: "Unknown item" });

  let qty = parseInt(quantity, 10) || 0;
  qty = Math.max(item.min, Math.min(item.max, Math.round(qty / item.batch) * item.batch));

  const cart = getCart(req);
  cart[itemId] = qty;
  req.session.cart = cart;

  if (req.headers.accept && req.headers.accept.includes("application/json")) {
    return res.json({ ok: true, cartCount: Object.keys(cart).length });
  }
  res.redirect("/cart");
});

router.post("/cart/remove", (req, res) => {
  const { itemId } = req.body;
  const cart = getCart(req);
  delete cart[itemId];
  req.session.cart = cart;
  res.redirect("/cart");
});

module.exports = router;
module.exports.cartToLines = cartToLines;
module.exports.getCart = getCart;
