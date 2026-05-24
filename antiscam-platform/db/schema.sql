-- Run in Supabase SQL Editor (same project as voice_profiles)

CREATE TABLE IF NOT EXISTS victims (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone         TEXT NOT NULL UNIQUE,      -- numărul victimei (spre care scammerul sună)
  subscription_active BOOLEAN DEFAULT false,
  whitelist_enabled   BOOLEAN DEFAULT true,  -- true = persoanele apropiate înregistrate nu se analizează
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trusted_contacts (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  victim_id            UUID REFERENCES victims(id) ON DELETE CASCADE,
  user_id              UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- contul propriu (opțional)
  name                 TEXT NOT NULL,
  phone                TEXT NOT NULL,          -- numărul lor (pentru whitelist)
  biometric_profile_id TEXT,                   -- cheie spre voice_profiles.name
  voice_enrolled       BOOLEAN DEFAULT false,
  can_view_scam_logs   BOOLEAN DEFAULT false,
  created_at           TIMESTAMPTZ DEFAULT now(),
  UNIQUE(victim_id, phone)
);

CREATE TABLE IF NOT EXISTS scam_calls (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  victim_id        UUID REFERENCES victims(id),
  from_number      TEXT NOT NULL,
  call_control_id  TEXT,
  combined_score   INTEGER,
  verdict          TEXT CHECK (verdict IN ('scam', 'suspect', 'clean')),
  transcript       TEXT,
  keywords_matched JSONB DEFAULT '[]',
  detected_at      TIMESTAMPTZ DEFAULT now()
);

-- Disable RLS pentru acces server-side cu service_role key
ALTER TABLE victims          DISABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE scam_calls       DISABLE ROW LEVEL SECURITY;

-- Index pe phone pentru lookup rapid la incoming call
CREATE INDEX IF NOT EXISTS idx_victims_phone ON victims(phone);
CREATE INDEX IF NOT EXISTS idx_trusted_contacts_phone ON trusted_contacts(victim_id, phone);
