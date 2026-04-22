-- Photo Wall: Supabase schema setup
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- 1. Create the members table
CREATE TABLE IF NOT EXISTS members (
  slug        TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  role        TEXT DEFAULT '',
  photo       TEXT DEFAULT '',
  joined_at   TEXT DEFAULT '',
  focus_areas JSONB DEFAULT '[]'::jsonb,
  personal_facts JSONB DEFAULT '[]'::jsonb,
  email       TEXT DEFAULT '',
  linkedin    TEXT DEFAULT ''
);

-- 2. Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- 3. Allow public read access
CREATE POLICY "public read" ON members
  FOR SELECT USING (true);

-- 4. Allow anon inserts/updates/deletes (the admin panel uses the anon key)
CREATE POLICY "anon write" ON members
  FOR ALL USING (true);

-- 5. Create a public storage bucket for member photos
-- NOTE: You must also create the bucket in the Supabase dashboard:
--   Storage → New bucket → Name: "member-photos" → Public: ON
-- The SQL below sets the policy so anyone can read, and anon can upload.

INSERT INTO storage.buckets (id, name, public)
VALUES ('member-photos', 'member-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public read photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'member-photos');

CREATE POLICY "anon upload photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'member-photos');

CREATE POLICY "anon update photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'member-photos');

CREATE POLICY "anon delete photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'member-photos');
