# WISHAM — Global Beat Store

White & red beat marketplace. Buy beats with **Exclusive ($60)**, **Inclusive ($30)**, and **Inclusive + Stems ($40)** licenses, with instant delivery by email.

## Stack

- **Frontend:** React 19 + Vite 7 + Tailwind 4 (`/`)
- **Backend:** Express + Prisma (`/server`)
- **Database:** Neon (Postgres) — schema managed by Prisma
- **Payments:** Paystack (redirect checkout + server-side verification + webhook)
- **Email:** Resend (license + download links)

## Local development

```bash
# 1) Database + API — port 4000
cd server
npm install
npx prisma generate
npx prisma db push      # creates tables in Neon
npm run db:seed         # 5 sample beats + admin user
npm run dev             # http://localhost:4000

# 2) Frontend — port 5173 (proxies /api -> localhost:4000)
cd ..
npm install
npm run dev             # http://localhost:5173
```

### Admin login

| | |
|---|---|
| URL | http://localhost:5173/admin/login |
| Email | `ifiokaniebiet@gmail.com` |
| Password | `wisham-admin-2026` |

> Change the password by editing `ADMIN_PASSWORD` in `server/.env`, then re-run `npm run db:seed`.

## Environment

All secrets live in **`server/.env`** (never in the frontend):

```env
DATABASE_URL=        # Neon Postgres (Prisma)
PORT=4000
APP_URL=http://localhost:5173        # frontend origin; used for Paystack callback + download links
PAYSTACK_SECRET_KEY=sk_test_...      # server-side verify + webhook only
PAYSTACK_PUBLIC_KEY=pk_test_...      # (reserved for future inline checkout)
PAYSTACK_CURRENCY=NGN                # NGN works out-of-the-box; switch to USD once
                                     # "International Payments" is enabled in Paystack
RESEND_API_KEY=re_...                # server-side only
EMAIL_FROM="WISHAM <onboarding@resend.dev>"
ADMIN_EMAIL=ifiokaniebiet@gmail.com
ADMIN_PASSWORD=wisham-admin-2026
JWT_SECRET=...
```

Frontend env (`/.env`): `VITE_API_BASE="/api"` — set it to the deployed API URL in production.

## How a purchase works

1. Buyer picks **Exclusive / Inclusive / Inclusive + Stems** in the checkout modal, enters an email.
2. `POST /api/checkout/initialize` converts the USD price into NGN (live FX) and creates a Paystack transaction.
3. Buyer pays on Paystack's secure hosted page, then lands on `/checkout?reference=…`.
4. `GET /api/checkout/verify` re-checks the transaction server-side with the secret key.
5. On success:
   - **Exclusive** → **PDF license document** generated and attached to the email, beat marked `sold` and removed from the store.
   - Sale + license hash + download token persisted.
   - Resend email delivers license (exclusive) / download links (both tiers). Links expire after 48h.

### Paystack webhook

For reliability, configure this URL in the Paystack dashboard (Test → Webhooks):
`https://<your-api-host>/api/webhooks/paystack`

> ⚠️ Resend test mode: `onboarding@resend.dev` can only send to the account owner's address (e.g. the email used to create the Resend account). Add a real verified domain + your buyer emails for live sending.

## Global payments

- Paystack merchants **must** be registered in **Nigeria, Ghana, Kenya or South Africa**.
- International buyers pay with their own Visa/Mastercard; you're settled in your local currency.
- Prices are stored/priced in **USD** and converted to NGN at checkout via a live FX rate (fallback: ~₦1,550/USD).
- Set `PAYSTACK_CURRENCY=USD` once your merchant enables **International Payments**.

## API summary

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/beats` | — | Unsold catalog |
| POST | `/api/checkout/initialize` | — | Create Paystack payment |
| GET | `/api/checkout/verify?reference=` | — | Confirm payment, deliver |
| GET | `/api/download/:saleId/:token?file=master\|stems` | token | Secure download (48h) |
| POST | `/api/webhooks/paystack` | HMAC | Charge success webhook |
| POST | `/api/admin/login` | — | Admin session cookie |
| GET | `/api/admin/stats` · `/beats` · `/sales` | cookie | Dashboard data |
| POST/PATCH/DELETE | `/api/admin/beats[/:id]` | cookie | Manage beats + uploads |

## Deployment

- **API:** Render / Railway / Fly.io — run `npm start` in `server/`. Set env vars above, enable the **600MB** upload limit host setting, mount persistent storage for `uploads/` (or move to R2/S3 and paste signed URLs in admin).
- **Frontend:** Vercel — build `npm run build` (already in `vercel.json`), set `VITE_API_BASE` to the API host, and add a `/api` rewrite if you want same-origin calls.
- Swap Paystack test → **live keys** after KYC, and verify your Resend domain (`mail@wisham.com`) before going live.