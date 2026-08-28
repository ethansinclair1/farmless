# Farmless

Buy Rust resources and have them delivered straight to your base. Sign in with Google, pick your stacks (wood, stone, metal, scrap, HQM, and more), pay through Stripe, then track delivery and message the team from your order page.

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

## Notes

- Order delivery itself (spawning items in-game) is manual: staff mark orders as delivered from `/admin` after dropping the stack in-game. Wiring this up to RCON is a natural next step.
- Sessions are stored in SQLite (`sessions.sqlite`) so logins survive a restart.
