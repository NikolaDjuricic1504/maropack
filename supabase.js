// supabase.js - Konfiguracija za Supabase bazu
import { createClient } from '@supabase/supabase-js';

// ЗАМЕНИ СА СВОЈИМ SUPABASE CREDENTIALS
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key-here';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// SQL za kreiranje tabele (pokreni u Supabase SQL Editor):
/*
CREATE TABLE nalozi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  broj_naloga TEXT NOT NULL UNIQUE,
  naziv TEXT NOT NULL,
  status TEXT DEFAULT 'u_pripremi',
  parametri JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_nalozi_broj ON nalozi(broj_naloga);
CREATE INDEX idx_nalozi_status ON nalozi(status);

-- Row Level Security (omogući u Supabase Dashboard)
ALTER TABLE nalozi ENABLE ROW LEVEL SECURITY;

-- Policy: Svi mogu da čitaju
CREATE POLICY "Anyone can read nalozi"
  ON nalozi FOR SELECT
  USING (true);

-- Policy: Autentifikovani korisnici mogu da menjaju
CREATE POLICY "Authenticated users can insert nalozi"
  ON nalozi FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update nalozi"
  ON nalozi FOR UPDATE
  USING (auth.role() = 'authenticated');
*/
