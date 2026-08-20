-- Katexs Demo Agent Database Schema

-- Demo sessions (prospects trying the agent)
CREATE TABLE IF NOT EXISTS demo_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  niche TEXT NOT NULL,
  config JSONB NOT NULL,
  message_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- active, cap_hit, converted, expired
  stripe_customer_id TEXT,
  live_agent_id UUID,
  widget_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE
);

-- Demo messages (conversation history)
CREATE TABLE IF NOT EXISTS demo_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES demo_sessions(session_id),
  role TEXT NOT NULL, -- user, assistant
  content TEXT NOT NULL,
  channel TEXT DEFAULT 'chat', -- chat, voice
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live agents (deployed after payment)
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  niche TEXT NOT NULL,
  config JSONB NOT NULL,
  vapi_assistant_id TEXT,
  phone_number TEXT,
  plan TEXT NOT NULL, -- starter, pro, enterprise
  status TEXT DEFAULT 'active', -- active, paused, cancelled
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment events
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES demo_sessions(session_id),
  stripe_checkout_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL,
  amount INTEGER NOT NULL, -- in cents
  status TEXT DEFAULT 'pending', -- pending, completed, failed, deployment_failed
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Scraped data cache
CREATE TABLE IF NOT EXISTS scraped_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT,
  business_name TEXT,
  niche TEXT,
  google_places_data JSONB,
  website_data JSONB,
  merged_config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_demo_sessions_session_id ON demo_sessions(session_id);
CREATE INDEX idx_demo_sessions_status ON demo_sessions(status);
CREATE INDEX idx_demo_messages_session_id ON demo_messages(session_id);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_payment_events_session_id ON payment_events(session_id);

-- Row Level Security (RLS) policies
ALTER TABLE demo_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for demo (restrict in production)
CREATE POLICY "Allow anonymous demo access" ON demo_sessions
  FOR ALL USING (true);

CREATE POLICY "Allow anonymous message access" ON demo_messages
  FOR ALL USING (true);
