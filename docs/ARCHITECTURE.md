# Katexs Demo Agent — Architecture

## Overview

A unified voice + chat AI receptionist that becomes ANY business's front desk in seconds.

## The Pipeline

```
Prospect URL/Name
    ↓
Google Places API + Scraper
    ↓
Auto-FAQ Builder
    ↓
Config JSON
    ↓
Master Prompt Injection
    ↓
Live Demo (Voice + Chat)
    ↓
15 Message Cap → Hire Screen
    ↓
$50 Checkout → Live Deploy
```

## Components

### 1. Scraper Service
- Google Places API (primary)
- Website scraper (fallback/enrichment)
- Outputs: business data, services, hours, reviews

### 2. FAQ Builder
- Extracts common questions from reviews
- Builds Q&A pairs from website content
- Outputs: structured FAQ array

### 3. Config Generator
- Merges scraped data into config JSON
- Injects into master prompt
- Outputs: complete agent configuration

### 4. Demo Engine
- Vapi for voice
- Custom chat widget
- Unified context (same agent, both channels)
- 15-message cap with close sequence

### 5. Payment & Deploy
- Stripe checkout
- Webhook handler
- Config flip: demo → live
- Vapi live deployment
- Chat widget code delivery

## Database Schema

See `supabase/migrations/` for full schema.

Key tables:
- `prospects` — demo sessions
- `scraped_data` — raw scrape results
- `faqs` — generated Q&A
- `agents` — live agent configs
- `payments` — subscription tracking

## API Endpoints

- `POST /api/scrape` — trigger scrape
- `POST /api/demo/start` — start demo session
- `POST /api/demo/message` — send message (chat)
- `POST /api/demo/voice` — voice interaction
- `POST /api/checkout` — create Stripe session
- `POST /api/webhook/stripe` — payment webhook
- `POST /api/deploy` — deploy live agent

## Environment Variables

```
SUPABASE_URL=
SUPABASE_KEY=
GOOGLE_PLACES_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
VAPI_API_KEY=
```
