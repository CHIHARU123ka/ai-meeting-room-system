-- AI開発会議室 — Supabase schema
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  design_context TEXT,
  phase TEXT DEFAULT 'discussion',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_meetings_created ON meetings(created_at DESC);

-- Row Level Security (optional, for authenticated use)
-- ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "public_read" ON meetings FOR SELECT USING (true);
-- CREATE POLICY "public_insert" ON meetings FOR INSERT WITH CHECK (true);
