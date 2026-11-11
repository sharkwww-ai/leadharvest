# Stripe Checkout Integration — Setup & Next Steps

This document is the single source of truth for completing your Hosted Stripe Checkout integration on `https://leadharvestmy.com`.

---

## Values to Replace

The following values are placeholders and must be updated before going live.

**Files containing placeholders:**
- [api/create-checkout-session.js](api/create-checkout-session.js)

| Field | Current Value | What to Set |
|-------|--------------|-------------|
| `mode` | `payment` | Set to `"payment"` for one-time charges (RM49 / RM119 credit packs) or `"subscription"` for recurring billing. |
| `success_url` | `${domain}/?success=true&session_id={CHECKOUT_SESSION_ID}` | Your actual post-payment success page URL. Keep the `{CHECKOUT_SESSION_ID}` template. |
| `cancel_url` | `${domain}/?canceled=true` | Your actual cancel/return page URL. |
| `line_items[].price` | `price_...` | Your actual Stripe Price ID from the Dashboard (https://dashboard.stripe.com/prices) or API. |

> **Note on `ui_mode` versioning:** `ui_mode: "hosted_page"` is configured for Stripe Node SDK `^21.0.0` (specified in `package.json`). If using an older Stripe SDK version below `21.0.0`, change `ui_mode` to `"hosted"`.

---

## Configured Parameters

These parameters were configured in Checkout Studio and are already set in your checkout endpoint.

**Files containing these parameters:**
- [api/create-checkout-session.js](api/create-checkout-session.js)

| Parameter | Value |
|-----------|-------|
| `ui_mode` | `hosted_page` |
| `billing_address_collection` | `auto` |
| `phone_number_collection.enabled` | `false` |
| `automatic_tax.enabled` | `false` |
| `allow_promotion_codes` | `false` |
| `submit_type` | `auto` |
| `integration_identifier` | `hosted_web_0001` |
| `origin_context` | `web` |
| `payment_method_collection` | `always` *(included automatically when `mode === "subscription"`)* |

---

## Setup and Next Steps

### 1. Environment Variables & API Keys
In your **Vercel Dashboard** (`Project Settings -> Environment Variables`), add the following variables:
- `STRIPE_PUBLISHABLE_KEY`: Your live or test publishable key (`pk_live_...` or `pk_test_...`) from https://dashboard.stripe.com/apikeys
- `STRIPE_SECRET_KEY`: Your live or test secret key (`sk_live_...` or `sk_test_...`)
- `STRIPE_WEBHOOK_SECRET`: Your webhook signing secret (`whsec_...`) from https://dashboard.stripe.com/workbench/webhooks
- `DOMAIN`: `https://leadharvestmy.com`

### 2. Project Structure Created
```text
├── api/
│   └── create-checkout-session.js   # Vercel Serverless endpoint creating the Stripe Checkout Session
├── index.html                       # Main LeadHarvest application front-end
├── opt_out.html                     # PDPA 2010 business opt-out form
├── package.json                     # Dependencies (stripe ^21.0.0)
├── .env.example                     # Environment variable reference template
└── STRIPE_INTEGRATION_TODO.md       # Single source of truth for integration completion
```

### 3. How the Integration Works (Flow Overview)
1. A buyer clicks **"Buy Starter Pack (RM49)"** or **"Buy Pro Pack (RM119)"** on `index.html`.
2. The form submits a `POST` request to `/api/create-checkout-session` with the selected `priceId`.
3. The serverless function invokes `stripe.checkout.sessions.create(...)` with your Checkout Studio parameters and responds with a `303` redirect to `session.url`.
4. The buyer completes payment via Credit Card or FPX Online Banking on the Stripe-hosted page and is redirected back to `success_url` to download their verified CSV dataset.

### 4. Next Steps to Go Live
1. **Create Products & Copy Price IDs:** Go to https://dashboard.stripe.com/prices, create your **RM49 Starter Pack** and **RM119 Pro Pack**, and copy their `price_...` IDs into `api/create-checkout-session.js` and `index.html`.
2. **Push to GitHub:** Upload `package.json`, `api/create-checkout-session.js`, `index.html`, and `STRIPE_INTEGRATION_TODO.md` to your `sharkwww-ai/leadharvest` repository. Vercel will install `stripe` and deploy the serverless endpoint automatically.

### 5. Resources
- Stripe Support: https://support.stripe.com
- Stripe MCP & Agent Docs: https://docs.stripe.com/mcp
