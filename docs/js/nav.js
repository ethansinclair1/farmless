function renderNav() {
  const user = Store.getUser();
  const cart = Store.getCart();
  const cartCount = Object.keys(cart).length;

  const cartLink = document.getElementById("nav-cart-link");
  if (cartLink) {
    cartLink.innerHTML = "Cart" + (cartCount > 0 ? ' <span class="pill">' + cartCount + "</span>" : "");
  }

  const slot = document.getElementById("nav-account-slot");
  if (!slot) return;

  if (user) {
    slot.innerHTML =
      '<a href="orders.html">My Orders</a>' +
      '<span class="user-chip">' +
      '<img src="' + user.avatar + '" alt="" />' +
      '<button type="button" class="btn secondary small" id="logout-btn">Log out</button>' +
      "</span>";
    document.getElementById("logout-btn").addEventListener("click", function () {
      Store.clearUser();
      window.location.href = "index.html";
    });
  } else {
    slot.innerHTML = '<button type="button" class="btn small" id="login-btn">Sign in with Google</button>';
    document.getElementById("login-btn").addEventListener("click", function () {
      fakeGoogleSignIn(function () {
        window.location.reload();
      });
    });
  }
}

// Simulates the Google account chooser popup so the flow feels real, then
// signs in a demo user. No network request, no real Google involved.
function fakeGoogleSignIn(done) {
  const names = ["Alex Carter", "Jordan Lee", "Sam Rivera", "Casey Morgan"];
  const name = names[Math.floor(Math.random() * names.length)];
  const user = {
    id: "demo-" + Math.random().toString(36).slice(2, 8),
    name: name,
    email: name.toLowerCase().replace(" ", ".") + "@gmail.com",
    avatar: "https://api.dicebear.com/9.x/initials/svg?seed=" + encodeURIComponent(name) + "&backgroundType=gradientLinear"
  };
  setTimeout(function () {
    Store.setUser(user);
    if (done) done(user);
  }, 400);
}

function requireDemoLogin(redirectBack) {
  const user = Store.getUser();
  if (user) return user;
  fakeGoogleSignIn(function () {
    window.location.href = redirectBack;
  });
  return null;
}

document.addEventListener("DOMContentLoaded", renderNav);
