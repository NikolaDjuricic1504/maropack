// PregledSvihNaloga-KOMPLET.jsx - KOMPLETNA KOMPONENTA SA SVIM BOJAMA I PODACIMA
import { useState, useEffect } from 'react';
import { ucitajSveNalogZaKalkulaciju, ucitajPojedinacneNaloge } from './generirajSveNaloge';

// 🎨 BOJE ZA SVAKI NALOG
const BOJE = {
  glavni: {
    primary: '#1e40af',
    light: '#dbeafe',
    dark: '#1e3a8a',
    text: '#1e40af'
  },
  stampa: {
    primary: '#7c3aed',
    light: '#ede9fe',
    dark: '#6b21a8',
    text: '#7c3aed'
  },
  materijali: {
    primary: '#92400e',
    light: '#fef3c7',
    dark: '#78350f',
    text: '#92400e'
  },
  kasiranje: {
    primary: '#059669',
    light: '#d1fae5',
    dark: '#047857',
    text: '#059669'
  },
  rezanje: {
    primary: '#dc2626',
    light: '#fee2e2',
    dark: '#991b1b',
    text: '#dc2626'
  },
  perforacija: {
    primary: '#ea580c',
    light: '#ffedd5',
    dark: '#c2410c',
    text: '#ea580c'
  },
  izgled: {
    primary: '#db2777',
    light: '#fce7f3',
    dark: '#9f1239',
    text: '#db2777'
  }
};

export default function PregledSvihNaloga({ kalkulacijaId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [podaci, setPodaci] = useState(null);
  const [pojedinacniNalozi, setPojedinacniNalozi] = useState(null);
  const [aktivniTab, setAktivniTab] = useState('glavni');

  useEffect(() => {
    ucitajPodatke();
  }, [kalkulacijaId]);

  async function ucitajPodatke() {
    setLoading(true);
    
    const rezultat = await ucitajSveNalogZaKalkulaciju(kalkulacijaId);
    if (rezultat.success) {
      setPodaci(rezultat.data);
      
      if (rezultat.data.glavni_nalog_id) {
        const nalozi = await ucitajPojedinacneNaloge(rezultat.data.glavni_nalog_id);
        if (nalozi.success) {
          setPojedinacniNalozi(nalozi.nalozi);
        }
      }
    }
    
    setLoading(false);
  }

  function getBoja(tip) {
    return BOJE[tip] || BOJE.glavni;
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={{fontSize: 48, marginBottom: 16}}>⏳</div>
        <div>Učitavam naloge...</div>
      </div>
    );
  }

  if (!podaci || !podaci.glavni_nalog_id) {
    return (
      <div style={styles.container}>
        <div style={{...styles.header, background: `linear-gradient(135deg, ${BOJE.glavni.primary}, ${BOJE.glavni.dark})`}}>
          <div style={styles.headerTitle}>📋 Pregled naloga</div>
          <button onClick={onClose} style={styles.btnClose}>✖ Zatvori</button>
        </div>
        <div style={styles.prazno}>
          <div style={{fontSize: 48, marginBottom: 16}}>📋</div>
          <div style={{fontSize: 18, fontWeight: 500, marginBottom: 8}}>Nema naloga</div>
          <div style={{color: '#666'}}>Za ovu kalkulaciju još nije kreiran radni nalog</div>
        </div>
      </div>
    );
  }

  const trenutnaBoja = getBoja(aktivniTab);

  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <div style={{...styles.header, background: `linear-gradient(135deg, ${trenutnaBoja.primary}, ${trenutnaBoja.dark})`}}>
        <div>
          <div style={styles.headerTitle}>📋 {podaci.broj_naloga}</div>
          <div style={styles.headerSubtitle}>{podaci.proizvod} • {podaci.kupac}</div>
        </div>
        <button onClick={onClose} style={styles.btnClose}>✖ Zatvori</button>
      </div>

      {/* INFO BAR */}
      <div style={{...styles.infoBar, background: trenutnaBoja.primary}}>
        <div>
          <div style={styles.infoLabel}>DATUM KREIRANJA</div>
          <div style={styles.infoValue}>
            {new Date(podaci.datum_kreiranja).toLocaleDateString('sr-RS')}
          </div>
        </div>
        <div>
          <div style={styles.infoLabel}>KONAČNA CENA</div>
          <div style={styles.infoValue}>{podaci.konacna_cena?.toFixed(2)} €</div>
        </div>
        <div>
          <div style={styles.infoLabel}>STATUS</div>
          <div style={styles.infoValue}>
            {podaci.status_glavnog === 'u_pripremi' && '⚙️ U pripremi'}
            {podaci.status_glavnog === 'u_proizvodnji' && '▶️ U proizvodnji'}
            {podaci.status_glavnog === 'zavrsen' && '✅ Završen'}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={styles.tabs}>
        <Tab 
          active={aktivniTab === 'glavni'} 
          onClick={() => setAktivniTab('glavni')}
          boja={BOJE.glavni}
          label="📋 Glavni nalog"
        />
        <Tab 
          active={aktivniTab === 'stampa'} 
          onClick={() => setAktivniTab('stampa')}
          boja={BOJE.stampa}
          label="🖨️ Štampa"
          status={podaci.status_stampe}
        />
        <Tab 
          active={aktivniTab === 'materijali'} 
          onClick={() => setAktivniTab('materijali')}
          boja={BOJE.materijali}
          label="📦 Materijali"
          status={podaci.status_materijala}
        />
        <Tab 
          active={aktivniTab === 'kasiranje'} 
          onClick={() => setAktivniTab('kasiranje')}
          boja={BOJE.kasiranje}
          label="🔄 Kaširanje"
          status={podaci.status_kasiranja}
        />
        <Tab 
          active={aktivniTab === 'rezanje'} 
          onClick={() => setAktivniTab('rezanje')}
          boja={BOJE.rezanje}
          label="✂️ Rezanje"
          status={podaci.status_rezanja}
        />
        <Tab 
          active={aktivniTab === 'perforacija'} 
          onClick={() => setAktivniTab('perforacija')}
          boja={BOJE.perforacija}
          label="⚙️ Perforacija"
          status={podaci.status_perforacije}
        />
        <Tab 
          active={aktivniTab === 'izgled'} 
          onClick={() => setAktivniTab('izgled')}
          boja={BOJE.izgled}
          label="🎨 Izgled"
          status={podaci.status_izgleda}
        />
      </div>

      {/* SADRŽAJ */}
      <div style={styles.content}>
        
        {/* GLAVNI NALOG */}
        {aktivniTab === 'glavni' && (
          <TabGlavni podaci={podaci} boja={BOJE.glavni} />
        )}

        {/* ŠTAMPA */}
        {aktivniTab === 'stampa' && pojedinacniNalozi?.stampa && (
          <TabStampa nalog={pojedinacniNalozi.stampa} boja={BOJE.stampa} />
        )}

        {/* MATERIJALI */}
        {aktivniTab === 'materijali' && pojedinacniNalozi?.materijali && (
          <TabMaterijali nalog={pojedinacniNalozi.materijali} boja={BOJE.materijali} />
        )}

        {/* KAŠIRANJE */}
        {aktivniTab === 'kasiranje' && pojedinacniNalozi?.kasiranje && (
          <TabKasiranje nalog={pojedinacniNalozi.kasiranje} boja={BOJE.kasiranje} />
        )}

        {/* REZANJE */}
        {aktivniTab === 'rezanje' && pojedinacniNalozi?.rezanje && (
          <TabRezanje nalog={pojedinacniNalozi.rezanje} boja={BOJE.rezanje} />
        )}

        {/* PERFORACIJA */}
        {aktivniTab === 'perforacija' && pojedinacniNalozi?.perforacija && (
          <TabPerforacija nalog={pojedinacniNalozi.perforacija} boja={BOJE.perforacija} />
        )}

        {/* IZGLED */}
        {aktivniTab === 'izgled' && pojedinacniNalozi?.izgled && (
          <TabIzgled nalog={pojedinacniNalozi.izgled} boja={BOJE.izgled} />
        )}

      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        <button style={{...styles.btnPrimary, background: trenutnaBoja.primary}} onClick={onClose}>
          ✓ Zatvori pregled
        </button>
      </div>

    </div>
  );
}

// TAB KOMPONENTA
function Tab({ active, onClick, boja, label, status }) {
  return (
    <button 
      onClick={onClick}
      style={{
        ...styles.tab,
        ...(active && {
          ...styles.tabActive,
          borderBottomColor: boja.primary,
          color: boja.text,
          background: 'white'
        })
      }}
    >
      {label}
      {status && (
        <span style={{
          padding: '2px 8px',
          background: active ? boja.light : '#f3f4f6',
          color: active ? boja.text : '#666',
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 600,
          marginLeft: 8
        }}>
          {status}
        </span>
      )}
    </button>
  );
}

// TAB: GLAVNI NALOG
function TabGlavni({ podaci, boja }) {
  return (
    <div>
      <h2 style={{...styles.nalogTitle, color: boja.primary}}>📋 Glavni radni nalog</h2>
      
      <NalogBox title="🔗 Linkovanja" boja={boja}>
        <InfoGrid>
          <InfoItem label="ID Glavnog naloga" value={podaci.glavni_nalog_id} />
          <InfoItem label="Kalkulacija ID" value={podaci.kalkulacija_id} />
        </InfoGrid>
      </NalogBox>

      <NalogBox title="📊 Osnovni podaci" boja={boja}>
        <InfoGrid>
          <InfoItem label="Broj naloga" value={podaci.broj_naloga} />
          <InfoItem label="Kupac" value={podaci.kupac} />
          <InfoItem label="Proizvod" value={podaci.proizvod} />
          <InfoItem label="Status" value={podaci.status_glavnog} />
        </InfoGrid>
      </NalogBox>

      <NalogBox title="🔗 Povezani pojedinačni nalozi" boja={boja}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Tip naloga</th>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={styles.td}>🖨️ Štampa</td><td style={styles.td}><code>{podaci.stampa_nalog_id}</code></td><td style={styles.td}>{podaci.status_stampe}</td></tr>
            <tr><td style={styles.td}>📦 Materijali</td><td style={styles.td}><code>{podaci.materijali_nalog_id}</code></td><td style={styles.td}>{podaci.status_materijala}</td></tr>
            <tr><td style={styles.td}>🔄 Kaširanje</td><td style={styles.td}><code>{podaci.kasiranje_nalog_id}</code></td><td style={styles.td}>{podaci.status_kasiranja}</td></tr>
            <tr><td style={styles.td}>✂️ Rezanje</td><td style={styles.td}><code>{podaci.rezanje_nalog_id}</code></td><td style={styles.td}>{podaci.status_rezanja}</td></tr>
            <tr><td style={styles.td}>⚙️ Perforacija</td><td style={styles.td}><code>{podaci.perforacija_nalog_id}</code></td><td style={styles.td}>{podaci.status_perforacije}</td></tr>
            <tr><td style={styles.td}>🎨 Izgled</td><td style={styles.td}><code>{podaci.izgled_nalog_id}</code></td><td style={styles.td}>{podaci.status_izgleda}</td></tr>
          </tbody>
        </table>
      </NalogBox>
    </div>
  );
}

// TAB: ŠTAMPA
function TabStampa({ nalog, boja }) {
  const p = nalog.parametri || {};
  return (
    <div>
      <h2 style={{...styles.nalogTitle, color: boja.primary}}>🖨️ Nalog za štampu</h2>
      
      <NalogBox title="📋 Parametri štampe" boja={boja}>
        <InfoGrid>
          <InfoItem label="Mašina" value={p.masina} />
          <InfoItem label="Broj boja" value={p.broj_boja} />
          <InfoItem label="Štampani materijal" value={p.stampani_materijal} />
          <InfoItem label="Smer odmotavanja" value={p.smer_odmotavanja} />
          <InfoItem label="Strana štampe" value={p.strana_stampe} />
          <InfoItem label="Prečnik hilzne" value={p.precnik_hilzne + ' mm'} />
          <InfoItem label="Obim valjka" value={p.obim_valjka + ' mm'} />
          <InfoItem label="Klise" value={p.klise || 'N/A'} />
        </InfoGrid>
      </NalogBox>
    </div>
  );
}

// TAB: MATERIJALI
function TabMaterijali({ nalog, boja }) {
  const p = nalog.parametri || {};
  return (
    <div>
      <h2 style={{...styles.nalogTitle, color: boja.primary}}>📦 Nalog za materijale</h2>
      
      <NalogBox title="📊 Sastav proizvoda (Multi-layer)" boja={boja}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Sloj</th>
              <th style={styles.th}>Materijal</th>
              <th style={styles.th}>Debljina</th>
              <th style={styles.th}>Potreba (kg)</th>
              <th style={styles.th}>Potreba (m)</th>
            </tr>
          </thead>
          <tbody>
            {p.materijal_1 && (
              <tr style={{background: boja.light}}>
                <td style={styles.td}><strong>SLOJ 1</strong></td>
                <td style={styles.td}>{p.materijal_1}</td>
                <td style={styles.td}>{p.debljina_1} µm</td>
                <td style={styles.td}><strong>{p.potreba_kg_1} kg</strong></td>
                <td style={styles.td}>{p.potreba_m_1} m</td>
              </tr>
            )}
            {p.materijal_2 && (
              <tr>
                <td style={styles.td}><strong>SLOJ 2</strong></td>
                <td style={styles.td}>{p.materijal_2}</td>
                <td style={styles.td}>{p.debljina_2} µm</td>
                <td style={styles.td}><strong>{p.potreba_kg_2} kg</strong></td>
                <td style={styles.td}>{p.potreba_m_2} m</td>
              </tr>
            )}
            {p.materijal_3 && (
              <tr style={{background: boja.light}}>
                <td style={styles.td}><strong>SLOJ 3</strong></td>
                <td style={styles.td}>{p.materijal_3}</td>
                <td style={styles.td}>{p.debljina_3} µm</td>
                <td style={styles.td}><strong>{p.potreba_kg_3} kg</strong></td>
                <td style={styles.td}>{p.potreba_m_3} m</td>
              </tr>
            )}
          </tbody>
        </table>
      </NalogBox>

      <NalogBox title="📏 Dodatne informacije" boja={boja}>
        <InfoGrid>
          <InfoItem label="Širina materijala" value={p.sirina_materijala + ' mm'} />
        </InfoGrid>
      </NalogBox>
    </div>
  );
}

// TAB: KAŠIRANJE
function TabKasiranje({ nalog, boja }) {
  const p = nalog.parametri || {};
  return (
    <div>
      <h2 style={{...styles.nalogTitle, color: boja.primary}}>🔄 Nalog za kaširanje</h2>
      
      <NalogBox title="📋 Parametri lepka" boja={boja}>
        <InfoGrid>
          <InfoItem label="Tip lepka" value={p.tip_lepka} />
          <InfoItem label="Odnos lepka" value={p.odnos_lepka} />
          <InfoItem label="Nanos lepka" value={p.nanos_lepka + ' kg/m²'} />
          <InfoItem label="Broj prolaza" value={p.broj_prolaza} />
        </InfoGrid>
      </NalogBox>

      <NalogBox title="⚙️ Parametri procesa" boja={boja}>
        <InfoGrid>
          <InfoItem label="Temperatura" value={p.temperatura || 'N/A'} />
          <InfoItem label="Brzina" value={p.brzina || 'N/A'} />
          <InfoItem label="Doradne mašine" value={p.doradne_masine} />
        </InfoGrid>
      </NalogBox>
    </div>
  );
}

// TAB: REZANJE
function TabRezanje({ nalog, boja }) {
  const p = nalog.parametri || {};
  return (
    <div>
      <h2 style={{...styles.nalogTitle, color: boja.primary}}>✂️ Nalog za rezanje</h2>
      
      <NalogBox title="📋 Parametri rezanja" boja={boja}>
        <InfoGrid>
          <InfoItem label="Širina trake" value={p.sirina_trake + ' mm'} />
          <InfoItem label="Broj traka" value={p.broj_traka} />
          <InfoItem label="Smer odmotavanja" value={p.smer_odmotavanja} />
          <InfoItem label="Prečnik rolne" value={p.precnik_rolne + ' mm'} />
          <InfoItem label="Broj etiketa u metru" value={p.broj_etiketa_u_metru} />
        </InfoGrid>
      </NalogBox>
    </div>
  );
}

// TAB: PERFORACIJA
function TabPerforacija({ nalog, boja }) {
  const p = nalog.parametri || {};
  return (
    <div>
      <h2 style={{...styles.nalogTitle, color: boja.primary}}>⚙️ Nalog za perforaciju</h2>
      
      <NalogBox title="📋 Parametri perforacije" boja={boja}>
        {p.tip_perforacije ? (
          <InfoGrid>
            <InfoItem label="Tip perforacije" value={p.tip_perforacije} />
            <InfoItem label="Razmak" value={p.razmak + ' mm'} />
            <InfoItem label="Dubina" value={p.dubina + ' mm'} />
            <InfoItem label="Broj linija" value={p.broj_linija} />
          </InfoGrid>
        ) : (
          <div style={{textAlign: 'center', padding: '2rem', color: '#666'}}>
            <div style={{fontSize: 48, marginBottom: '1rem'}}>ℹ️</div>
            <div style={{fontSize: 16, marginBottom: '0.5rem'}}>Perforacija nije potrebna</div>
            <div style={{fontSize: 14}}>{p.napomena}</div>
          </div>
        )}
      </NalogBox>
    </div>
  );
}

// TAB: IZGLED
function TabIzgled({ nalog, boja }) {
  const p = nalog.parametri || {};
  return (
    <div>
      <h2 style={{...styles.nalogTitle, color: boja.primary}}>🎨 Nalog za izgled</h2>
      
      <NalogBox title="📋 Parametri izgleda" boja={boja}>
        <InfoGrid>
          <InfoItem label="Opis" value={p.opis_izgleda} />
          <InfoItem label="Dimenzije" value={p.dimenzije} />
          <InfoItem label="Boje" value={p.boje} />
          <InfoItem label="Slika" value={p.slika_url || 'Nije upload-ovana'} />
        </InfoGrid>
      </NalogBox>
    </div>
  );
}

// HELPER KOMPONENTE
function NalogBox({ title, children, boja }) {
  return (
    <div style={{...styles.nalogBox, borderColor: boja.light}}>
      <div style={{...styles.nalogBoxTitle, color: boja.primary}}>{title}</div>
      {children}
    </div>
  );
}

function InfoGrid({ children }) {
  return <div style={styles.nalogGrid}>{children}</div>;
}

function InfoItem({ label, value }) {
  return (
    <div>
      <div style={styles.nalogItemLabel}>{label}</div>
      <div style={styles.nalogItemValue}>{value || 'N/A'}</div>
    </div>
  );
}

// STYLES
const styles = {
  container: { maxWidth: 1600, margin: '0 auto', background: 'white', minHeight: '100vh' },
  loading: { textAlign: 'center', padding: 60, fontSize: 18, color: '#666' },
  prazno: { textAlign: 'center', padding: 60, color: '#999' },
  header: { color: 'white', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 500, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, opacity: 0.9 },
  btnClose: { padding: '10px 20px', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  infoBar: { color: 'white', padding: '1rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' },
  infoLabel: { fontSize: 10, opacity: 0.8, marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: 600 },
  tabs: { display: 'flex', background: '#f9fafb', borderBottom: '2px solid #e5e7eb', overflowX: 'auto' },
  tab: { padding: '1rem 1.5rem', background: 'transparent', border: 'none', borderBottom: '3px solid transparent', fontSize: 14, fontWeight: 500, cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' },
  tabActive: { fontWeight: 600 },
  content: { padding: '2rem', minHeight: 400 },
  nalogTitle: { fontSize: 24, fontWeight: 600, marginBottom: '1.5rem' },
  nalogBox: { background: '#f9fafb', border: '2px solid #e5e7eb', borderRadius: 8, padding: '1.5rem', marginBottom: '1rem' },
  nalogBoxTitle: { fontSize: 16, fontWeight: 600, marginBottom: '1rem' },
  nalogGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' },
  nalogItemLabel: { fontSize: 11, color: '#999', marginBottom: 4, textTransform: 'uppercase' },
  nalogItemValue: { fontSize: 15, fontWeight: 500, color: '#333' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' },
  th: { padding: '12px', textAlign: 'left', background: '#f9fafb', borderBottom: '2px solid #e5e7eb', fontSize: 13, fontWeight: 600, color: '#666' },
  td: { padding: '12px', borderBottom: '1px solid #f0f0f0', fontSize: 14 },
  footer: { background: '#f9fafb', padding: '1.5rem 2rem', borderTop: '1px solid #e5e7eb', textAlign: 'center' },
  btnPrimary: { padding: '12px 28px', color: 'white', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer' },
};
