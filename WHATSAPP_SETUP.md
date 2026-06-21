# WhatsApp Cloud API — Setup Checklist for Modaco

**Goal:** Wire Modaco's new ops SIM (`+972 53-347-8737`) into Meta WhatsApp
Cloud API so the storefront can:
- ping Yarin on every new order, abandoned cart, low stock
- receive customer messages and route them through the admin agent
- send recovery messages to abandoned carts automatically

**Server side is already wired** (commit ahead). All that's missing are the
three env vars that come out of Meta Business Manager — once they land in
Vercel, every notification fires for real with no code change.

---

## Pre-requisites (one-time, manual)

### 1. Meta Business Account
- [ ] Open https://business.facebook.com with `yarin@modaco.co.il`
- [ ] If no Business Account yet: **Create Account** → name "Modaco" → tax id `058886243`, country IL
- [ ] If the personal FB account doesn't exist either, sign up first at facebook.com (real person info — Yarin Moyal, can be private)

### 2. SIM hygiene
- [ ] Make sure `+972 53-347-8737` is **NOT** registered in WhatsApp Personal anywhere. Meta will reject the number otherwise.
- [ ] If it ever was: open WhatsApp on that SIM → Settings → Delete Account → wait 30 min before continuing.

### 3. Register the WhatsApp Business Account (WABA)
- [ ] In Business Manager → **Accounts → WhatsApp Accounts → Add → Create**
- [ ] Display name: `Modaco` (case-sensitive; this is what customers see in WhatsApp)
- [ ] Category: `Shopping & Retail`
- [ ] Add `+972 53-347-8737` as a phone number
- [ ] Verification: receive SMS or voice call to the SIM, type code

### 4. Create a Meta App for Modaco
- [ ] https://developers.facebook.com/apps → **Create App** → Type "Business" → name "Modaco WhatsApp"
- [ ] In the app dashboard → **Add Product → WhatsApp → Set Up**
- [ ] Link it to the WABA created in step 3

### 5. Generate a permanent token (so we don't have to re-auth every 24h)
- [ ] Business Manager → **Settings → Users → System Users → Add → Admin** → name "modaco-whatsapp-bot"
- [ ] On that System User → **Add Assets** → pick the Modaco WABA → grant **Manage**
- [ ] **Generate New Token** → pick the Modaco app, scopes:
  - `whatsapp_business_messaging` (REQUIRED — sending/receiving messages)
  - `whatsapp_business_management` (REQUIRED — phone-number admin)
- [ ] Token never expires. Copy it once — you can't see it again.

### 6. Find the Phone Number ID
- [ ] App dashboard → WhatsApp → **API Setup**
- [ ] Under "From" pick `+972 53-347-8737` → the **Phone number ID** (long numeric string) is shown next to it. Copy it.

### 7. Webhook subscription
- [ ] App dashboard → WhatsApp → **Configuration → Webhooks**
- [ ] **Callback URL:** `https://modaco.co.il/api/webhooks/whatsapp`
- [ ] **Verify token:** any random string you make up (must match the env var we'll set in step 9, item 2)
- [ ] **Verify and Save** — Meta sends a GET request, our handler echoes the challenge if the token matches
- [ ] Subscribe to fields: `messages` (mandatory) and `message_template_status_update` (optional)

### 8. Business Verification (slowest — start early!)
- [ ] Business Manager → **Security Center → Start Verification**
- [ ] Upload one of: business license, utility bill in business name, tax authority paper
  - For Modaco: tax-authority עוסק מורשה certificate for "מודקו - יעקב מויאל" (ID 058886243)
- [ ] Meta takes 1–14 days. Until verified you can only message users who messaged you first in the last 24h. After verification you can also send proactive templated messages.

---

## Vercel env vars (once tokens are in hand)

```bash
# Set on Vercel Production env (modaco-co-il project):
WHATSAPP_ADMIN_PHONE=972533478737     # already set
WHATSAPP_VERIFY_TOKEN=<the random string from step 7>
WHATSAPP_TOKEN=<permanent System User token from step 5>
WHATSAPP_PHONE_NUMBER_ID=<numeric id from step 6>
```

Then trigger a redeploy (or push any tiny commit) and the wiring goes live.

---

## How to test it's working

1. **Verification handshake** — When you click Verify & Save in step 7, Meta hits `GET /api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...`. If verify_token matches, our route returns 200 with the challenge. If not, Meta shows a red error.

2. **Outbound test** — From the Vercel `/admin/agent` chat (logged in as Yarin), say "שלח לעצמך הודעת בדיקה". The agent will call `notifyAdmin()` which sends to `WHATSAPP_ADMIN_PHONE`. Check the SIM.

3. **Inbound test** — From your personal WhatsApp, message `+972 53-347-8737`: "כמה הזמנות יש?" The webhook receives it, `handleAdminMessage()` parses it, the agent runs `aggregate_orders` tool, you get a reply within a second.

4. **End-to-end** — Place a real test order on modaco.co.il for ₪49 (the shipping minimum). On checkout, `orderCreatedNotify` fires; you should get an email + a WhatsApp message to the ops SIM within a minute.

---

## Files involved (FYI)

- `src/app/api/webhooks/whatsapp/route.ts` — GET + POST handler
- `src/lib/whatsapp/send.ts` — `sendWhatsAppMessage()`, `notifyAdmin()`
- `src/lib/whatsapp/agent.ts` — `handleAdminMessage()` Hebrew NLU + tool dispatch
- `src/lib/inngest/functions.ts` — 3 step.run() callsites that now call `sendWhatsAppMessage` / `notifyAdmin`

## Out of scope (for now)

- Message templates for the 24h+ window (will need to file template approvals with Meta after Business Verification)
- Multimedia messages (image of product on out-of-stock alert) — easy add later
- Click-to-chat ads / catalog integration
