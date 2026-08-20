# Katexs Demo Agent — Voice + Chat AI Receptionist

## What This Is

A demo agent that becomes ANY business's receptionist in seconds. Prospect enters their URL, we scrape their data, auto-build an FAQ, and the agent knows their business instantly.

**Key Innovation:** At the end of the demo, the agent is ALREADY BUILT — just needs voice tone tweaks and automations. If they buy, we send them chat widget code OR voice AI prompt to plug in themselves. Or we do full setup for extra fee.

## The Flow

1. **Prospect enters URL or business name**
2. **Google Places API + website scrape** pulls everything
3. **Auto-build FAQ** from real data (services, hours, area, phone, reviews)
4. **Inject into prompt** as {{placeholders}}
5. **Agent becomes their receptionist** — voice AND chat
6. **15-message demo** with built-in close
7. **Hire screen** → $50 checkout
8. **Payment flips live** → real agent deployed

## What's Built at Demo End

- ✅ Complete AI receptionist (knowledge + personality)
- ✅ Chat widget (ready to embed)
- ✅ Voice agent config (ready for Vapi)
- ✅ FAQ database
- ✅ Business profile
- ⚠️ Voice tone (needs 5 min tuning)
- ⚠️ Automations (booking, SMS, CRM — configurable)

## The Master Prompt

See `prompts/master-receptionist-prompt.md` — one prompt runs every niche. Just inject config JSON.

## Pricing Tiers

- **Quick Start:** $50/mo (chat, 500 msgs)
- **Professional:** $497/mo (voice + chat, CRM)
- **Enterprise:** $997/mo (unlimited, white-label)

## Stack

Vapi, Supabase, n8n, OpenClaw, Stripe

## Project Structure

```
katexs-demo-agent/
├── backend/
│   └── api/
│       ├── demo-start.js      # Scrape + config generation
│       ├── demo-message.js    # Chat/voice message handler
│       ├── checkout.js        # Stripe checkout
│       └── stripe-webhook.js  # Payment → live deploy
├── frontend/
│   ├── chat-widget.js         # Embeddable chat widget
│   ├── voice-chat-bridge.js   # Voice + chat unified
│   └── demo-page.html         # Landing page
├── prompts/
│   └── master-receptionist-prompt.md
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── docs/
│   ├── ARCHITECTURE.md
│   └── SETUP-GUIDE.md
├── server.js
├── package.json
└── .env.example
```

## Quick Start

```bash
npm install
cp .env.example .env
# Fill in your API keys
npm run dev
```

Visit `http://localhost:3000` — enter a business URL and watch the magic.

## Status

**Ready for testing.** Core pipeline complete. Next: voice tone tuning, automation templates, widget customization.
