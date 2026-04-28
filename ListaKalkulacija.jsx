// Kalkulator.jsx - KOMPLETAN KALKULATOR SA SVIM FORMULAMA
import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export default function Kalkulator({ kalkulacijaId, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Osnovna polja
  const [naziv, setNaziv] = useState('');
  const [kupac, setKupac] = useState('');
  const [sirina, setSirina] = useState(85);
  const [metraza, setMetraza] = useState(1000);
  const [ukupnaMetraza, setUkupnaMetraza] = useState(120);
  
  // Materijali
  const [matA, setMatA] = useState({ naziv: 'Papir sigmakraft 70µ', tezina: 70, cena: 2.70 });
  const [matB, setMatB] = useState({ naziv: 'ALU 7µ', tezina: 18.97, cena: 3.50 });
  const [matC, setMatC] = useState({ naziv: 'PA/PE koestruzija 30µ', tezina: 30, cena: 1.80 });
  
  // Lepak
  const [lepak, setLepak] = useState({ potrosnja: 0.002, prolaza: 2, cena: 6.00 });
  
  // Kaširanje
  const [kasiranje, setKasiranje] = useState({ prolaza: 2, cena: 0.03 });
  
  // Štampa
  const [stampa, setStampa] = useState({ materijal: 'A', cena: 1.35 });
  
  // Lakiranje
  const [lakiranje, setLakiranje] = useState({ aktivan: false, cena: 1.10 });
  
  // Dodatno
  const [transport, setTransport] = useState(0);
  const [pakovanje, setPakovanje] = useState(0);
  const [skart, setSkart] = useState(10);
  
  // Proizvodnja (za radni nalog)
  const [proizvodnja, setProizvodnja] = useState({
    stampa_masina: 'UTECO ONYX',
    broj_boja: '4+lak',
    smer_odmotavanja: 'Na glavu',
    broj_traka: 8,
    sirina_trake: 85,
    duzina_proizvoda: 110
  });

  // Učitaj kalkulaciju ako postoji ID
  useEffect(() => {
    if (kalkulacijaId) {
      ucitajKalkulaciju();
    }
  }, [kalkulacijaId]);

  async function ucitajKalkulaciju() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('kalkulacije')
        .select('*')
        .eq('id', kalkulacijaId)
        .single();
      
      if (error) throw error;
      
      // Popuni sva polja iz učitanih podataka
      setNaziv(data.naziv || '');
      setKupac(data.kupac || '');
      setSirina(data.sirina || 85);
      setMetraza(data.metraza || 1000);
      
      const p = data.parametri || {};
      
      // Materijali
      if (p.materijali) {
        if (p.materijali.materijal_a) {
          setMatA(prev => ({...prev, ...p.materijali.materijal_a}));
        }
        if (p.materijali.materijal_b) {
          setMatB(prev => ({...prev, ...p.materijali.materijal_b}));
        }
        if (p.materijali.materijal_c) {
          setMatC(prev => ({...prev, ...p.materijali.materijal_c}));
        }
      }
      
      // Usluge
      if (p.usluge) {
        if (p.usluge.lepak) setLepak(prev => ({...prev, ...p.usluge.lepak}));
        if (p.usluge.kasiranje) setKasiranje(prev => ({...prev, ...p.usluge.kasiranje}));
        if (p.usluge.stampa) setStampa(prev => ({...prev, ...p.usluge.stampa}));
        if (p.usluge.lakiranje) setLakiranje(prev => ({...prev, ...p.usluge.lakiranje}));
      }
      
      // Dodatno
      if (p.dodatno) {
        setTransport(p.dodatno.transport_cena_kg || 0);
        setPakovanje(p.dodatno.pakovanje_cena || 0);
        setSkart(p.dodatno.skart_procenat || 10);
      }
      
      // Proizvodnja
      if (p.proizvodnja) {
        setProizvodnja(prev => ({...prev, ...p.proizvodnja}));
      }
      
      if (p.dimenzije) {
        setUkupnaMetraza(p.dimenzije.ukupna_metraza || 120);
      }
      
    } catch (e) {
      console.error('Greška pri učitavanju:', e);
      alert('Greška: ' + e.message);
    }
    setLoading(false);
  }

  // KALKULACIJE (kao u Excelu)
  
  // Materijal A
  const tezinaKgA = (sirina * metraza * matA.tezina) / 1000000;
  const ukupnoA = tezinaKgA * matA.cena;
  
  // Materijal B
  const tezinaKgB = (sirina * metraza * matB.tezina) / 1000000;
  const ukupnoB = tezinaKgB * matB.cena;
  
  // Materijal C
  const tezinaKgC = (sirina * metraza * matC.tezina) / 1000000;
  const ukupnoC = tezinaKgC * matC.cena;
  
  // Lepak
  const utrosakLepka = (sirina * metraza * lepak.potrosnja) / 1000;
  const ukupnoLepak = utrosakLepka * lepak.prolaza * lepak.cena;
  
  // Kaširanje
  const ukupnoKasiranje = (kasiranje.cena * sirina * metraza * kasiranje.prolaza) / 1000;
  
  // Štampa (zavisi od odabranog materijala)
  let materijalStampaKg = tezinaKgA;
  if (stampa.materijal === 'B') materijalStampaKg = tezinaKgB;
  if (stampa.materijal === 'C') materijalStampaKg = tezinaKgC;
  const ukupnoStampa = materijalStampaKg * stampa.cena;
  
  // Lakiranje
  const ukupnoLakiranje = lakiranje.aktivan ? (materijalStampaKg * lakiranje.cena) : 0;
  
  // Ukupno
  const sumMaterijali = ukupnoA + ukupnoB + ukupnoC + ukupnoLepak;
  const sumUsluge = ukupnoKasiranje + ukupnoStampa + ukupnoLakiranje;
  const osnovnaCena = sumMaterijali + sumUsluge + transport + pakovanje;
  const konacnaCena = osnovnaCena + (osnovnaCena * (skart / 100));
  
  const ukupnoKg = tezinaKgA + tezinaKgB + tezinaKgC;
  const cenaPoKg = konacnaCena / ukupnoKg;
  const punNalog = konacnaCena * ukupnaMetraza;

  // SAČUVAJ KALKULACIJU
  async function sacuvaj() {
    if (!naziv.trim()) {
      alert('Unesi naziv proizvoda!');
      return;
    }
    
    setSaving(true);
    try {
      const podaci = {
        naziv,
        kupac,
        sirina,
        metraza,
        osnovna_cena: osnovnaCena,
        konacna_cena: konacnaCena,
        cena_po_kg: cenaPoKg,
        status: 'draft',
        parametri: {
          materijali: {
            materijal_a: {
              naziv: matA.naziv,
              tezina_gm2: matA.tezina,
              cena_kg: matA.cena,
              tezina_kg: tezinaKgA,
              ukupno: ukupnoA
            },
            materijal_b: {
              naziv: matB.naziv,
              tezina_gm2: matB.tezina,
              cena_kg: matB.cena,
              tezina_kg: tezinaKgB,
              ukupno: ukupnoB
            },
            materijal_c: {
              naziv: matC.naziv,
              tezina_gm2: matC.tezina,
              cena_kg: matC.cena,
              tezina_kg: tezinaKgC,
              ukupno: ukupnoC
            }
          },
          usluge: {
            lepak: {
              potrosnja_kgm2: lepak.potrosnja,
              broj_prolaza: lepak.prolaza,
              cena_kg: lepak.cena,
              utrosak_kg: utrosakLepka,
              ukupno: ukupnoLepak
            },
            kasiranje: {
              broj_prolaza: kasiranje.prolaza,
              cena_m2: kasiranje.cena,
              ukupno: ukupnoKasiranje
            },
            stampa: {
              materijal: stampa.materijal,
              materijal_kg: materijalStampaKg,
              cena_kg: stampa.cena,
              ukupno: ukupnoStampa
            },
            lakiranje: {
              aktivan: lakiranje.aktivan,
              materijal_kg: lakiranje.aktivan ? materijalStampaKg : 0,
              cena_kg: lakiranje.cena,
              ukupno: ukupnoLakiranje
            }
          },
          dodatno: {
            transport_cena_kg: transport,
            pakovanje_cena: pakovanje,
            skart_procenat: skart
          },
          dimenzije: {
            sirina_mm: proizvodnja.sirina_trake,
            duzina_mm: proizvodnja.duzina_proizvoda,
            metraza_osnova: metraza,
            ukupna_metraza: ukupnaMetraza
          },
          proizvodnja: proizvodnja
        }
      };
      
      let result;
      if (kalkulacijaId) {
        // UPDATE postojeće
        result = await supabase
          .from('kalkulacije')
          .update(podaci)
          .eq('id', kalkulacijaId)
          .select()
          .single();
      } else {
        // INSERT nove
        result = await supabase
          .from('kalkulacije')
          .insert([podaci])
          .select()
          .single();
      }
      
      if (result.error) throw result.error;
      
      alert('✅ Kalkulacija sačuvana!');
      if (onSaved) onSaved(result.data);
      
    } catch (e) {
      console.error('Greška:', e);
      alert('Greška pri čuvanju: ' + e.message);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={{fontSize: 48, marginBottom: 16}}>⏳</div>
        <div>Učitavam kalkulaciju...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitle}>💰 Kalkulator cene</div>
          <div style={styles.headerSubtitle}>
            {kalkulacijaId ? 'Izmena kalkulacije' : 'Nova kalkulacija'}
          </div>
        </div>
        <div style={{textAlign: 'right'}}>
          <div style={styles.ukupnaCenaLabel}>KONAČNA CENA</div>
          <div style={styles.ukupnaCenaValue}>{konacnaCena.toFixed(2)} €</div>
        </div>
      </div>

      {/* OSNOVNI PODACI */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>📋 Osnovni podaci</div>
        <div style={styles.grid3}>
          <div>
            <label style={styles.label}>Naziv proizvoda *</label>
            <input 
              type="text" 
              value={naziv}
              onChange={(e) => setNaziv(e.target.value)}
              style={styles.input}
              placeholder="MPML Crux Magnezijum 3g"
            />
          </div>
          <div>
            <label style={styles.label}>Kupac</label>
            <input 
              type="text" 
              value={kupac}
              onChange={(e) => setKupac(e.target.value)}
              style={styles.input}
              placeholder="MEDOMIX"
            />
          </div>
          <div>
            <label style={styles.label}>Ukupna metraža naloga (m)</label>
            <input 
              type="number" 
              value={ukupnaMetraza}
              onChange={(e) => setUkupnaMetraza(parseFloat(e.target.value) || 120)}
              style={styles.input}
            />
          </div>
        </div>
        
        <div style={{...styles.grid3, marginTop: '1rem'}}>
          <div>
            <label style={styles.label}>Širina proizvoda (mm)</label>
            <input 
              type="number" 
              value={sirina}
              onChange={(e) => setSirina(parseFloat(e.target.value) || 0)}
              style={styles.input}
            />
          </div>
          <div>
            <label style={styles.label}>Metraža osnova (m)</label>
            <input 
              type="number" 
              value={metraza}
              onChange={(e) => setMetraza(parseFloat(e.target.value) || 0)}
              style={styles.input}
            />
          </div>
          <div>
            <label style={styles.label}>Škart (%)</label>
            <input 
              type="number" 
              value={skart}
              onChange={(e) => setSkart(parseFloat(e.target.value) || 0)}
              style={styles.input}
            />
          </div>
        </div>
      </div>

      {/* MATERIJALI - SKRAĆENO ZA PROSTOR */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>📦 Materijali</div>
        
        {/* Mat A */}
        <div style={styles.card}>
          <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', alignItems: 'end'}}>
            <div>
              <label style={styles.label}>Materijal A</label>
              <input type="text" value={matA.naziv} onChange={(e) => setMatA({...matA, naziv: e.target.value})} style={styles.input} />
            </div>
            <div>
              <label style={styles.label}>Težina g/m²</label>
              <input type="number" value={matA.tezina} onChange={(e) => setMatA({...matA, tezina: parseFloat(e.target.value)})} style={styles.input} />
            </div>
            <div>
              <label style={styles.label}>Cena €/kg</label>
              <input type="number" value={matA.cena} onChange={(e) => setMatA({...matA, cena: parseFloat(e.target.value)})} style={styles.input} step="0.01" />
            </div>
            <div>
              <label style={styles.label}>Kg</label>
              <input type="text" value={tezinaKgA.toFixed(2)} disabled style={{...styles.input, background: '#fffbeb'}} />
            </div>
            <div>
              <label style={styles.label}>Ukupno €</label>
              <input type="text" value={ukupnoA.toFixed(2)} disabled style={{...styles.input, ...styles.inputTotal}} />
            </div>
          </div>
        </div>

        {/* Mat B, C - isti stil skraćeno */}
        <div style={styles.card}>
          <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', alignItems: 'end'}}>
            <input type="text" value={matB.naziv} onChange={(e) => setMatB({...matB, naziv: e.target.value})} style={styles.input} placeholder="Materijal B" />
            <input type="number" value={matB.tezina} onChange={(e) => setMatB({...matB, tezina: parseFloat(e.target.value)})} style={styles.input} />
            <input type="number" value={matB.cena} onChange={(e) => setMatB({...matB, cena: parseFloat(e.target.value)})} style={styles.input} step="0.01" />
            <input type="text" value={tezinaKgB.toFixed(2)} disabled style={{...styles.input, background: '#fffbeb'}} />
            <input type="text" value={ukupnoB.toFixed(2)} disabled style={{...styles.input, ...styles.inputTotal}} />
          </div>
        </div>

        <div style={styles.card}>
          <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', alignItems: 'end'}}>
            <input type="text" value={matC.naziv} onChange={(e) => setMatC({...matC, naziv: e.target.value})} style={styles.input} placeholder="Materijal C" />
            <input type="number" value={matC.tezina} onChange={(e) => setMatC({...matC, tezina: parseFloat(e.target.value)})} style={styles.input} />
            <input type="number" value={matC.cena} onChange={(e) => setMatC({...matC, cena: parseFloat(e.target.value)})} style={styles.input} step="0.01" />
            <input type="text" value={tezinaKgC.toFixed(2)} disabled style={{...styles.input, background: '#fffbeb'}} />
            <input type="text" value={ukupnoC.toFixed(2)} disabled style={{...styles.input, ...styles.inputTotal}} />
          </div>
        </div>
      </div>

      {/* FINALNA KALKULACIJA */}
      <div style={styles.section}>
        <div style={styles.summaryCard}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.3)'}}>
            <div>
              <div style={{fontSize: 11, opacity: 0.8, marginBottom: 4}}>Materijali</div>
              <div style={{fontSize: 22, fontWeight: 500}}>{sumMaterijali.toFixed(2)} €</div>
            </div>
            <div>
              <div style={{fontSize: 11, opacity: 0.8, marginBottom: 4}}>Usluge</div>
              <div style={{fontSize: 22, fontWeight: 500}}>{sumUsluge.toFixed(2)} €</div>
            </div>
            <div>
              <div style={{fontSize: 11, opacity: 0.8, marginBottom: 4}}>Osnovna</div>
              <div style={{fontSize: 22, fontWeight: 500}}>{osnovnaCena.toFixed(2)} €</div>
            </div>
          </div>
          
          <div style={{textAlign: 'center'}}>
            <div style={{fontSize: 13, opacity: 0.9, marginBottom: 8}}>KONAČNA CENA (sa {skart}% škarta)</div>
            <div style={{fontSize: 48, fontWeight: 500, marginBottom: '1rem'}}>{konacnaCena.toFixed(2)} €</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: 600, margin: '0 auto'}}>
              <div>
                <div style={{fontSize: 11, opacity: 0.8, marginBottom: 4}}>Po kg</div>
                <div style={{fontSize: 20, fontWeight: 500}}>{cenaPoKg.toFixed(2)} €/kg</div>
              </div>
              <div>
                <div style={{fontSize: 11, opacity: 0.8, marginBottom: 4}}>Pun nalog ({ukupnaMetraza}m)</div>
                <div style={{fontSize: 20, fontWeight: 500}}>{punNalog.toLocaleString('sr-RS', {minimumFractionDigits: 2})} €</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AKCIJE */}
      <div style={styles.footer}>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button onClick={onClose} style={styles.btnSecondary}>✖ Zatvori</button>
        </div>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button onClick={sacuvaj} disabled={saving} style={styles.btnPrimary}>
            {saving ? '⏳ Čuvanje...' : '💾 Sačuvaj kalkulaciju'}
          </button>
        </div>
      </div>

    </div>
  );
}

const styles = {
  container: { maxWidth: 1600, margin: '0 auto', background: 'white' },
  loading: { textAlign: 'center', padding: 40, fontSize: 18, color: '#666' },
  header: { background: 'linear-gradient(135deg, #059669, #047857)', color: 'white', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 500, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, opacity: 0.9 },
  ukupnaCenaLabel: { fontSize: 11, opacity: 0.8, marginBottom: 4 },
  ukupnaCenaValue: { fontSize: 36, fontWeight: 500, lineHeight: 1 },
  section: { padding: '2rem', borderBottom: '1px solid #e5e7eb' },
  sectionTitle: { fontSize: 15, fontWeight: 500, color: '#666', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: 0.5 },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' },
  label: { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#666' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, fontFamily: 'inherit' },
  inputTotal: { border: '2px solid #10b981', background: '#d1fae5', color: '#047857', fontWeight: 500 },
  card: { background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1.25rem', marginBottom: '1rem' },
  summaryCard: { background: 'linear-gradient(135deg, #059669, #047857)', color: 'white', borderRadius: 8, padding: '1.5rem' },
  footer: { background: '#f9fafb', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between' },
  btnPrimary: { padding: '12px 28px', background: '#1e40af', color: 'white', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  btnSecondary: { padding: '12px 24px', background: 'white', border: '1px solid #d1d5db', color: '#333', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer' },
};
