-- Katexs Demo Agent - Supabase Schema

-- Deploy configs table (stores generated prompts)
CREATE TABLE IF NOT EXISTS deploy_configs (
  id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  niche TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  chat_prompt TEXT NOT NULL DEFAULT '',
  voice_prompt TEXT NOT NULL DEFAULT '',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE deploy_configs ENABLE ROW LEVEL SECURITY;

-- Allow public read (for demo pages)
CREATE POLICY IF NOT EXISTS "Allow public read" 
  ON deploy_configs FOR SELECT USING (true);

-- Allow service role insert/update
CREATE POLICY IF NOT EXISTS "Allow service insert" 
  ON deploy_configs FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow service update" 
  ON deploy_configs FOR UPDATE USING (true);

-- Demo sessions table
CREATE TABLE IF NOT EXISTS demo_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  deploy_id TEXT REFERENCES deploy_configs(id),
  business_name TEXT NOT NULL,
  niche TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  message_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE
);

-- Messages table
CREATE TABLE IF NOT EXISTS demo_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES demo_sessions(session_id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on sessions
ALTER TABLE demo_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow public demo access" 
  ON demo_sessions FOR ALL USING (true);

ALTER TABLE demo_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow public message access" 
  ON demo_messages FOR ALL USING (true);

-- Payment events table
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  stripe_checkout_id TEXT,
  plan TEXT,
  amount INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_deploy_configs_updated_at
  BEFORE UPDATE ON deploy_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
