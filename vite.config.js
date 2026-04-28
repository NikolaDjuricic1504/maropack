-- SUPABASE - TABELA PROIZVODI
-- Kopiraj i nalepi u Supabase SQL Editor

CREATE TABLE IF NOT EXISTS proizvodi (
  -- OSNOVNO
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  tip VARCHAR(20) NOT NULL CHECK (tip IN ('folija', 'kesa', 'spulna')),
  naziv VARCHAR(200) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  kupac VARCHAR(200),
  
  -- FOLIJA PODACI
  folija_materijal VARCHAR(50),
  folija_debljina INTEGER,
  folija_sirina INTEGER,
  folija_duzina INTEGER,
  folija_boja VARCHAR(50),
  folija_print VARCHAR(200),
  folija_lakirano BOOLEAN DEFAULT false,
  folija_metallized BOOLEAN DEFAULT false,
  
  -- KESA PODACI
  kesa_materijal VARCHAR(50),
  kesa_sirina INTEGER,
  kesa_duzina INTEGER,
  kesa_klapna INTEGER,
  kesa_takt INTEGER,
  kesa_ban INTEGER,
  kesa_perforacija BOOLEAN DEFAULT false,
  kesa_etiket VARCHAR(200),
  kesa_ziplock BOOLEAN DEFAULT false,
  kesa_brtva VARCHAR(20),
  kesa_evroslot BOOLEAN DEFAULT false,
  
  -- ŠPULNA PODACI
  spulna_materijal VARCHAR(50),
  spulna_sirina INTEGER,
  spulna_od_sirina INTEGER,
  spulna_duzina INTEGER,
  spulna_debljina INTEGER,
  spulna_promer_navoja INTEGER,
  
  -- ZAJEDNIČKO
  cena_prodajna DECIMAL(10,2),
  cena_nabavna DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'Aktivan' CHECK (status IN ('Aktivan', 'Arhiviran')),
  napomena TEXT,
  
  -- METADATA
  poslednja_izmena TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  izmenio_korisnik VARCHAR(100)
);

-- INDEKSI za brzo pretraživanje
CREATE INDEX idx_proizvodi_tip ON proizvodi(tip);
CREATE INDEX idx_proizvodi_status ON proizvodi(status);
CREATE INDEX idx_proizvodi_kupac ON proizvodi(kupac);
CREATE INDEX idx_proizvodi_sku ON proizvodi(sku);

-- ROW LEVEL SECURITY (opciono - zakomentariši ako ne koristiš RLS)
-- ALTER TABLE proizvodi ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Enable read access for all users" ON proizvodi FOR SELECT USING (true);
-- CREATE POLICY "Enable insert for all users" ON proizvodi FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Enable update for all users" ON proizvodi FOR UPDATE USING (true);

-- TRIGGER za automatsko ažuriranje poslednja_izmena
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.poslednja_izmena = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_proizvodi_modtime
BEFORE UPDATE ON proizvodi
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- GOTOVO!
-- Sada idi u Supabase > SQL Editor, nalepi ovo i klikni "Run"
