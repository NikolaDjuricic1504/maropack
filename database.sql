-- =============================================
-- MAROPACK ERP - SQL ŠEMA BAZE PODATAKA
-- =============================================

-- TABELA: proizvodi (Baza proizvoda)
CREATE TABLE IF NOT EXISTS proizvodi (
  id BIGSERIAL PRIMARY KEY,
  naziv TEXT NOT NULL,
  kupac TEXT,
  tip TEXT, -- 'folija', 'kesa', 'spulna'
  sir INTEGER, -- širina u mm
  ik INTEGER, -- idealna širina
  met INTEGER, -- metraža
  nal INTEGER, -- nalog x1000m
  sk NUMERIC, -- škart %
  mar NUMERIC, -- marža %
  mats JSONB, -- materijali [{ tip, deb, cena, stamp, kas, lak }]
  res JSONB, -- rezultati kalkulacije
  datum TEXT,
  ko TEXT, -- ko je kreirao
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: ponude (Komercijalne ponude)
CREATE TABLE IF NOT EXISTS ponude (
  id BIGSERIAL PRIMARY KEY,
  broj TEXT NOT NULL, -- MP-2026-XXXX
  datum TEXT,
  vaz TEXT, -- važi do
  kupac TEXT NOT NULL,
  adr TEXT, -- adresa
  kon TEXT, -- kontakt
  naziv TEXT NOT NULL,
  tip TEXT, -- 'folija', 'kesa', 'spulna'
  kol INTEGER, -- količina
  c1 NUMERIC, -- cena / 1000m
  uk NUMERIC, -- ukupno EUR
  mats JSONB, -- materijali
  nap TEXT, -- napomena
  jez TEXT DEFAULT 'sr', -- jezik (sr/en/de)
  status TEXT DEFAULT 'Aktivna', -- Aktivna, Odobrena, Odbijena
  ko TEXT,
  res JSONB, -- rezultati kalkulacije
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: nalozi (Radni nalozi)
CREATE TABLE IF NOT EXISTS nalozi (
  id BIGSERIAL PRIMARY KEY,
  ponBr TEXT NOT NULL, -- broj ponude MP-2026-XXXX
  ponId BIGINT, -- ID ponude (foreign key)
  kupac TEXT,
  prod TEXT, -- proizvod
  naziv TEXT, -- naziv naloga (npr. "Nalog za materijal")
  tip TEXT, -- 'folija', 'kesa', 'spulna'
  ik TEXT, -- ikona (box, print, link, cut, circle, star)
  boj TEXT, -- boja (#hex)
  status TEXT DEFAULT 'Ceka', -- Ceka, U toku, Završeno
  datum TEXT,
  radnik TEXT, -- zadužena osoba
  nap TEXT, -- napomena
  kol INTEGER, -- količina
  mats JSONB, -- materijali
  res JSONB, -- rezultati
  -- Upload fajlova
  link_pdf TEXT,
  link_perforacija TEXT,
  link_kesa TEXT,
  -- Praćenje rada
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  vreme_rada INTEGER, -- u sekundama
  uradjeno INTEGER, -- urađena količina
  skart INTEGER, -- škart
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: magacin (Rolne materijala)
CREATE TABLE IF NOT EXISTS magacin (
  id BIGSERIAL PRIMARY KEY,
  br_rolne TEXT UNIQUE, -- broj rolne (QR)
  tip TEXT, -- tip materijala (BOPP, CPP, itd)
  sirina INTEGER, -- mm
  debljina NUMERIC, -- µ
  gramatura NUMERIC, -- g/m²
  metraza NUMERIC, -- ukupno metara
  metraza_ost NUMERIC, -- preostalo metara
  kg NUMERIC, -- ukupno kg
  kg_neto NUMERIC, -- preostalo kg
  status TEXT DEFAULT 'Dostupno', -- Dostupno, U upotrebi, Iskorišćeno
  dobavljac TEXT,
  datum_prijema TEXT,
  lokacija TEXT, -- pozicija u magacinu
  napomena TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: nalog_zastoji (Zastoji u proizvodnji)
CREATE TABLE IF NOT EXISTS nalog_zastoji (
  id BIGSERIAL PRIMARY KEY,
  nalog_id BIGINT REFERENCES nalozi(id),
  razlog TEXT, -- razlog zastoja
  kategorija TEXT, -- Planirani, Tehnički, Materijal, Priprema, Kvalitet, Ostalo
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  trajanje INTEGER, -- u sekundama
  radnik TEXT,
  napomena TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: spulne (Špulne proizvodi)
CREATE TABLE IF NOT EXISTS spulne (
  id BIGSERIAL PRIMARY KEY,
  naziv TEXT NOT NULL,
  kupac TEXT,
  materijal TEXT,
  sirina_mat INTEGER, -- mm
  W INTEGER, -- širina trake mm
  da INTEGER, -- spoljašnji prečnik hilzne mm
  di INTEGER, -- unutrašnji prečnik mm
  C INTEGER, -- mm
  G INTEGER, -- gap mm
  T INTEGER, -- širina hilzne mm
  D INTEGER, -- max prečnik mm
  side_a TEXT,
  side_b TEXT,
  max_metara INTEGER,
  napomena TEXT,
  datum TEXT,
  ko TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: planovi_secenja (Planovi rezanja za naloge)
CREATE TABLE IF NOT EXISTS planovi_secenja (
  id BIGSERIAL PRIMARY KEY,
  nalog_id BIGINT REFERENCES nalozi(id),
  formati JSONB, -- [{ sirina, kom, metara, total_kom }]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXI za brže pretraživanje
CREATE INDEX IF NOT EXISTS idx_nalozi_ponBr ON nalozi(ponBr);
CREATE INDEX IF NOT EXISTS idx_nalozi_status ON nalozi(status);
CREATE INDEX IF NOT EXISTS idx_ponude_broj ON ponude(broj);
CREATE INDEX IF NOT EXISTS idx_ponude_status ON ponude(status);
CREATE INDEX IF NOT EXISTS idx_magacin_tip ON magacin(tip);
CREATE INDEX IF NOT EXISTS idx_magacin_status ON magacin(status);
CREATE INDEX IF NOT EXISTS idx_proizvodi_tip ON proizvodi(tip);

-- Row Level Security (RLS) - opciono
-- ALTER TABLE proizvodi ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ponude ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE nalozi ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE magacin ENABLE ROW LEVEL SECURITY;

-- NAPOMENE:
-- 1. Ove tabele se kreiraju u Supabase Dashboard > SQL Editor
-- 2. JSONB kolone (mats, res, formati) omogućavaju fleksibilno skladištenje složenih struktura
-- 3. Svi datumi su TEXT jer se koristi Serbian format (dd.mm.yyyy)
-- 4. created_at je TIMESTAMP za precizno praćenje kreiranja zapisa
