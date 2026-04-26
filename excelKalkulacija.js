const CENE_PO_KG = {
  BOPP: 2.6,
  CPP: 2.7,
  PET: 3.1,
  PE: 2.4,
  ALU: 8.5,
  PAPIR: 1.9,
  DUPLEX: 3.2,
  TRIPLEX: 4.2,
  NEPOZNATO: 3.0
};

export function izracunajCenu(data) {
  const sirina = Number(data?.sirina || data?.dimenzijaSirina || 500);
  const visina = Number(data?.dimenzijaVisina || 1000);
  const kom = Number(data?.kolicinaKom || 0);
  const kgUneto = Number(data?.kolicinaKg || 0);
  const m2Uneto = Number(data?.kolicinaM2 || 0);

  const gramaza =
    data?.materijal === "TRIPLEX" ? 120 :
    data?.materijal === "DUPLEX" ? 90 :
    75;

  const cenaKg = CENE_PO_KG[data?.materijal] || CENE_PO_KG.NEPOZNATO;

  let m2 = m2Uneto;
  if (!m2 && kom > 0) {
    m2 = (sirina / 1000) * (visina / 1000) * kom;
  }

  let kg = kgUneto;
  if (!kg && m2 > 0) {
    kg = (m2 * gramaza) / 1000;
  }

  if (!m2 && kg > 0) {
    m2 = (kg * 1000) / gramaza;
  }

  const materijal = kg * cenaKg;
  const proizvodnja = kg * 0.45;
  const stampa = data?.stampa ? kg * 0.35 : 0;
  const perforacija = data?.perforacija ? kg * 0.12 : 0;
  const ukupno = materijal + proizvodnja + stampa + perforacija;

  return {
    sirina,
    visina,
    gramaza,
    cenaKgMaterijala: cenaKg,
    m2,
    kg,
    materijal,
    proizvodnja,
    stampa,
    perforacija,
    ukupno,
    cenaKom: kom > 0 ? ukupno / kom : 0,
    cenaKgUkupno: kg > 0 ? ukupno / kg : 0
  };
}
