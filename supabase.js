// supabase.js - Konfiguracija za Supabase bazu
import { createClient } from '@supabase/supabase-js';

// ⚠️ ZAMENI SA SVOJIM SUPABASE CREDENTIALS
// Gde ih naći:
// 1. Otvori https://database.supabase.com
// 2. Uloguj se
// 3. Otvori svoj projekat
// 4. Klikni Settings (zupčanik) → API
// 5. Kopiraj Project URL i anon/public key

const supabaseUrl = 'https://your-project.supabase.co';  // ← Tvoj Project URL
const supabaseAnonKey = 'your-anon-key-here';  // ← Tvoj anon/public key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ========================================
// SQL KOD ZA KREIRANJE TABELE
// ========================================
// Kopiraj ovaj kod i izvršite ga u Supabase SQL Editor:

/*

-- 1. Kreiranje tabele radni_nalozi_folija
CREATE TABLE radni_nalozi_folija (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  broj_naloga TEXT NOT NULL UNIQUE,
  naziv TEXT NOT NULL,
  status TEXT DEFAULT 'u_pripremi',
  parametri JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Indeksi za brzo pretraživanje
CREATE INDEX idx_radni_nalozi_broj ON radni_nalozi_folija(broj_naloga);
CREATE INDEX idx_radni_nalozi_status ON radni_nalozi_folija(status);

-- 3. Row Level Security
ALTER TABLE radni_nalozi_folija ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Svi mogu da čitaju
CREATE POLICY "Anyone can read radni_nalozi_folija"
  ON radni_nalozi_folija FOR SELECT
  USING (true);

-- 5. Policy: Autentifikovani mogu da menjaju
CREATE POLICY "Authenticated can modify radni_nalozi_folija"
  ON radni_nalozi_folija FOR ALL
  USING (auth.role() = 'authenticated');

-- 6. Dodaj test podatke
INSERT INTO radni_nalozi_folija (broj_naloga, naziv, status, parametri) VALUES (
  '0202020/2026',
  'MPML Crux Magnezijum 3g',
  'u_pripremi',
  '{
    "kupac": "MEDOMIX",
    "datum_porudzbine": "03.03.2026",
    "datum_isporuke": "15.03.2026",
    "broj_porudzbine": "48662",
    "graficko_resenje": "Novi posao",
    "sirina": 85,
    "duzina": 110,
    "sirina_materijala": 840,
    "materijal_1": "Sigmakraft 70µ (50+20)",
    "debljina_1": 70,
    "potreba_kg_1": 859.32,
    "potreba_m_1": 15000,
    "materijal_2": "ALU 7µ",
    "debljina_2": 7,
    "potreba_kg_2": 239.02,
    "potreba_m_2": 15000,
    "materijal_3": "PE 30µ",
    "debljina_3": 30,
    "potreba_kg_3": 378.00,
    "potreba_m_3": 15000,
    "stampa_masina": "UTECO ONYX",
    "strana_stampe": "SPOLJNA",
    "obim_valjka": 330,
    "broj_boja": "4+lak",
    "klise": "DPR 1,14 mm",
    "precnik_hilzne": 152,
    "smer_odmotavanja": "Na glavu",
    "stamparija": "Milinković",
    "tip_lepka": "SF724A 324CA",
    "odnos_lepka": "100:60",
    "nanos_lepka": 1.8,
    "doradne_masine": "Štampanje, 2x Kaširanje, Rezanje",
    "broj_traka": 8,
    "sirina_trake": 85,
    "smer_odmotavanja_gp": "Na noge",
    "broj_etiketa_u_metru": 9.09,
    "precnik_rolne": 400,
    "porucena_kolicina": 1000000,
    "kolicina_za_rad": 1090910
  }'::jsonb
);

-- 7. Proveri da li je uspelo
SELECT * FROM radni_nalozi_folija;

*/
