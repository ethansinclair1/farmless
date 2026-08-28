# Farmless

Buy Rust resources and have them delivered straight to your base. Sign in with Google, pick your stacks (wood, stone, metal, scrap, HQM, and more), pay through Stripe, then track delivery and message the team from your order page.

**[Live demo](https://ethansinclair1.github.io/farmless/)** - click-through version with fake sign-in and fake payment (everything's stored in your browser, nothing real happens). Good for seeing the flow. The real app with actual Google login, Stripe, and a database lives in the root of this repo - see [Deploying](#deploying) below to run that one for real.

## Features

- Google sign-in (Passport + OAuth2)
- Item catalog with quantity sliders that price live
- Cart -> checkout (Steam username, base coordinates, target server) -> Stripe Checkout
- Per-order status tracking (awaiting payment -> paid -> preparing -> delivering -> delivered)
- Two-way messaging thread on each order between the customer and staff
- Admin dashboard to view every order and move it through delivery

## Running it locally

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` from a Google Cloud OAuth client (Web application, authorized redirect URI `http://localhost:3000/auth/google/callback`)
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` from your Stripe dashboard
- `ADMIN_EMAILS` - comma separated Google account emails that should see `/admin`

Then:

```bash
npm start
```

The app runs on `http://localhost:3000` and creates a local SQLite database (`farmless.db`) on first run.

## Editing the catalog

Items and prices live in [`data/items.js`](data/items.js). Servers customers can pick at checkout live in [`data/servers.js`](data/servers.js) - update that list with your actual server names.

## Deploying

This needs an actual Node host, not static hosting like GitHub Pages - there's no server behind Pages, so login/payments/orders can't work there.

Easiest path is Render, using the `render.yaml` already in this repo:

1. Push this repo to your own GitHub account (or fork it)
2. On [render.com](https://render.com), New -> Blueprint, point it at the repo - it reads `render.yaml` and creates the web service automatically
3. Fill in the env vars it asks for (Google OAuth, Stripe, `ADMIN_EMAILS`, `BASE_URL` = your Render URL)
4. Update the Google OAuth client's authorized redirect URI and the Stripe webhook URL to point at that same Render URL

Note: the free Render plan has an ephemeral disk, so the SQLite file resets on redeploys/restarts. Fine for testing; move to a paid plan with a persistent disk (or swap SQLite for a managed Postgres add-on) before you rely on it for real orders.

## Notes

- Order delivery itself (spawning items in-game) is manual: staff mark orders as delivered from `/admin` after dropping the stack in-game. Wiring this up to RCON is a natural next step.
- Sessions are stored in SQLite (`sessions.sqlite`) so logins survive a restart.
