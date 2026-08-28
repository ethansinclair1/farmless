document.querySelectorAll(".card").forEach(function (card) {
  const batch = parseInt(card.dataset.batch, 10);
  const pricePer = parseFloat(card.dataset.price);
  const min = parseInt(card.dataset.min, 10);
  const max = parseInt(card.dataset.max, 10);

  const input = card.querySelector(".qty-input");
  const hidden = card.querySelector(".qty-hidden");
  const priceValue = card.querySelector(".price-value");
  const minus = card.querySelector(".minus");
  const plus = card.querySelector(".plus");

  function clamp(val) {
    val = Math.round(val / batch) * batch;
    return Math.max(min, Math.min(max, val));
  }

  function refresh() {
    const qty = clamp(parseInt(input.value, 10) || min);
    input.value = qty;
    hidden.value = qty;
    const total = (qty / batch) * pricePer;
    priceValue.textContent = total.toFixed(2);
  }

  minus.addEventListener("click", function () {
    input.value = clamp((parseInt(input.value, 10) || min) - batch);
    refresh();
  });
  plus.addEventListener("click", function () {
    input.value = clamp((parseInt(input.value, 10) || min) + batch);
    refresh();
  });
  input.addEventListener("change", refresh);

  refresh();
});

// Poll for new messages on order detail pages.
const thread = document.querySelector("[data-order-id]");
if (thread) {
  const orderId = thread.dataset.orderId;
  setInterval(function () {
    fetch("/orders/" + orderId + "/messages.json")
      .then((r) => r.json())
      .then((data) => {
        if (!data.messages) return;
        if (data.messages.length === thread.children.length) return;
        thread.innerHTML = "";
        data.messages.forEach((m) => {
          const div = document.createElement("div");
          div.className = "msg " + m.sender;
          const who = document.createElement("div");
          who.className = "who";
          who.textContent = (m.sender === "staff" ? "Staff" : m.author_name || "You") + " · " + new Date(m.created_at).toLocaleString();
          const body = document.createElement("div");
          body.textContent = m.body;
          div.appendChild(who);
          div.appendChild(body);
          thread.appendChild(div);
        });
        thread.scrollTop = thread.scrollHeight;
      })
      .catch(() => {});
  }, 5000);
}
