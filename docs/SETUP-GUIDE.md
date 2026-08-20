# Katexs Demo Agent — Setup Guide

## Prerequisites

- Node.js 18+
- Supabase account
- Stripe account
- Vapi account
- Google Places API key
- OpenAI/Moonshot API key

## Environment Variables

```bash
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key

# APIs
GOOGLE_PLACES_API_KEY=your-key
OPENAI_API_KEY=your-key
MOONSHOT_API_KEY=your-key
VAPI_API_KEY=your-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
FRONTEND_URL=https://your-domain.com
PORT=3000
```

## Quick Start

1. **Clone and install**
```bash
git clone <repo>
cd katexs-demo-agent
npm install
```

2. **Set up Supabase**
```bash
# Run migrations
npx supabase migration up
```

3. **Configure Stripe**
- Create products: Quick Start ($50), Professional ($497), Enterprise ($997)
- Set webhook endpoint: `https://your-domain.com/api/webhook/stripe`
- Get webhook signing secret

4. **Configure Vapi**
- Create voice assistant template
- Get API key

5. **Start the server**
```bash
npm run dev
```

## Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```

### Docker
```bash
docker build -t katexs-demo .
docker run -p 3000:3000 --env-file .env katexs-demo
```

## Testing

1. Visit demo page: `https://your-domain.com`
2. Enter business URL
3. Chat with AI agent
4. Test close at 15 messages
5. Complete Stripe checkout
6. Verify agent deployment

## Monitoring

- Supabase Dashboard: View sessions, messages, conversions
- Stripe Dashboard: Monitor payments
- Vapi Dashboard: Monitor voice calls

## Support

For issues or questions, contact: support@katexs.com
