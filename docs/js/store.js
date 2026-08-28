// Everything here lives in this browser only (localStorage). Nothing is sent
// anywhere - it's a click-through demo, not a real backend.

const Store = {
  getUser() {
    try { return JSON.parse(localStorage.getItem("farmless_user")); } catch (e) { return null; }
  },
  setUser(user) {
    localStorage.setItem("farmless_user", JSON.stringify(user));
  },
  clearUser() {
    localStorage.removeItem("farmless_user");
  },

  getCart() {
    try { return JSON.parse(localStorage.getItem("farmless_cart")) || {}; } catch (e) { return {}; }
  },
  setCart(cart) {
    localStorage.setItem("farmless_cart", JSON.stringify(cart));
  },

  getOrders() {
    try { return JSON.parse(localStorage.getItem("farmless_orders")) || []; } catch (e) { return []; }
  },
  saveOrders(orders) {
    localStorage.setItem("farmless_orders", JSON.stringify(orders));
  },
  addOrder(order) {
    const orders = Store.getOrders();
    orders.unshift(order);
    Store.saveOrders(orders);
    return order;
  },
  getOrder(id) {
    return Store.getOrders().find((o) => o.id === id);
  },
  updateOrder(id, patch) {
    const orders = Store.getOrders();
    const order = orders.find((o) => o.id === id);
    if (!order) return null;
    Object.assign(order, patch);
    Store.saveOrders(orders);
    return order;
  },
  addMessage(orderId, message) {
    const orders = Store.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.messages = order.messages || [];
    order.messages.push(message);
    Store.saveOrders(orders);
    return order;
  }
};

function money(cents) {
  return "$" + (cents / 100).toFixed(2);
}

function fmtQty(n) {
  return n.toLocaleString();
}
