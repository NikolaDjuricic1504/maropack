// NalogGlavni.jsx - GLAVNI RADNI NALOG (Master)
import { useState, useEffect } from 'react';
import { supabase } from './supabase.js';

export default function NalogGlavni({ nalogId, onClose }) {
  const [nalog, setNalog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (nalogId) {
      ucitajNalog();
    }
  }, [nalogId]);

  async function ucitajNalog() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('radni_nalozi_folija')  // ← UPDATED: nova tabela
        .select('*')
        .eq('id', nalogId)
        .single();
      
      if (error) throw error;
      setNalog(data);
    } catch (e) {
      console.error('Greška:', e);
      alert('Greška pri učitavanju naloga: ' + e.message);
    }
    setLoading(false);
  }

  async function stampaj() {
    window.print();
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={{fontSize: 48, marginBottom: 16}}>⏳</div>
        <div>Učitavam nalog...</div>
      </div>
    );
  }

  if (!nalog) {
    return (
      <div style={styles.loading}>
        <div style={{fontSize: 48, marginBottom: 16}}>❌</div>
        <div>Nalog nije pronađen</div>
      </div>
    );
  }

  // Parse parametri iz JSONB
  const p = nalog.parametri || {};

  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.companyName}>MAROPACK D.O.O.</div>
          <div style={styles.subtitle}>RADNI NALOG ZA PROIZVODNJU FOLIJA</div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.label}>Broj naloga</div>
          <div style={styles.nalogBroj}>{nalog.broj_naloga || 'N/A'}</div>
        </div>
      </div>

      {/* INFO TRAKA */}
      <div style={styles.infoBar}>
        <div>
          <div style={styles.infoLabel}>Datum porudžbine</div>
          <div style={styles.infoValue}>{p.datum_porudzbine || 'N/A'}</div>
        </div>
        <div>
          <div style={styles.infoLabel}>Rok isporuke</div>
          <div style={styles.infoValue}>{p.datum_isporuke || 'N/A'}</div>
        </div>
        <div>
          <div style={styles.infoLabel}>Kupac</div>
          <div style={styles.infoValue}>{p.kupac || 'N/A'}</div>
        </div>
        <div>
          <div style={styles.infoLabel}>Br. porudžbine</div>
          <div style={styles.infoValue}>{p.broj_porudzbine || 'N/A'}</div>
        </div>
        <div>
          <div style={styles.infoLabel}>Status</div>
          <div style={styles.infoValue}>{nalog.status || 'U pripremi'}</div>
        </div>
      </div>

      {/* PROIZVOD INFO */}
      <div style={styles.proizvodInfo}>
        <div>
          <div style={styles.proizvodLabel}>NAZIV PROIZVODA</div>
          <div style={styles.proizvodNaziv}>{nalog.naziv || 'N/A'}</div>
          <div style={styles.proizvodMeta}>Grafičko rešenje: {p.graficko_resenje || 'Novi posao'}</div>
        </div>
        <div style={{textAlign: 'right'}}>
          <div style={styles.label}>Dimenzije proizvoda</div>
          <div style={styles.dimenzije}>
            {p.sirina || '?'} × {p.duzina || '?'} <span style={{fontSize: 16, fontWeight: 400, color: '#666'}}>mm</span>
          </div>
        </div>
      </div>

      {/* SASTAV MATERIJALA */}
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeaderRow}>
            <th colSpan="6" style={styles.tableHeader}>
              1. SASTAV GOTOVOG PROIZVODA (MULTI-LAYER)
            </th>
          </tr>
          <tr style={styles.tableSubheader}>
            <th style={{...styles.tableCell, ...styles.tableCellHeader}}>Sloj</th>
            <th style={{...styles.tableCell, ...styles.tableCellHeader}}>Materijal</th>
            <th style={{...styles.tableCell, ...styles.tableCellHeader}}>Debljina</th>
            <th style={{...styles.tableCell, ...styles.tableCellHeader}}>Širina</th>
            <th style={{...styles.tableCell, ...styles.tableCellHeader}}>Potrebno (kg)</th>
            <th style={{...styles.tableCell, ...styles.tableCellHeader}}>Potrebno (m)</th>
          </tr>
        </thead>
        <tbody>
          {p.materijal_1 && (
            <tr style={{...styles.tableRow, background: '#fffbeb'}}>
              <td style={{...styles.tableCell, fontWeight: 700}}>SLOJ 1</td>
              <td style={{...styles.tableCell, fontWeight: 600}}>{p.materijal_1}</td>
              <td style={styles.tableCell}>{p.debljina_1 || '-'} µm</td>
              <td style={styles.tableCell}>{p.sirina_materijala || '-'} mm</td>
              <td style={{...styles.tableCell, fontWeight: 700, color: '#1e40af'}}>{p.potreba_kg_1 || '-'}</td>
              <td style={{...styles.tableCell, fontWeight: 600}}>{p.potreba_m_1 || '-'}</td>
            </tr>
          )}
          {p.materijal_2 && (
            <tr style={{...styles.tableRow, background: '#fef3c7'}}>
              <td style={{...styles.tableCell, fontWeight: 700}}>SLOJ 2</td>
              <td style={{...styles.tableCell, fontWeight: 600}}>{p.materijal_2}</td>
              <td style={styles.tableCell}>{p.debljina_2 || '-'} µm</td>
              <td style={styles.tableCell}>{p.sirina_materijala || '-'} mm</td>
              <td style={{...styles.tableCell, fontWeight: 700, color: '#1e40af'}}>{p.potreba_kg_2 || '-'}</td>
              <td style={{...styles.tableCell, fontWeight: 600}}>{p.potreba_m_2 || '-'}</td>
            </tr>
          )}
          {p.materijal_3 && (
            <tr style={{...styles.tableRow, background: '#fef9c3'}}>
              <td style={{...styles.tableCell, fontWeight: 700}}>SLOJ 3</td>
              <td style={{...styles.tableCell, fontWeight: 600}}>{p.materijal_3}</td>
              <td style={styles.tableCell}>{p.debljina_3 || '-'} µm</td>
              <td style={styles.tableCell}>{p.sirina_materijala || '-'} mm</td>
              <td style={{...styles.tableCell, fontWeight: 700, color: '#1e40af'}}>{p.potreba_kg_3 || '-'}</td>
              <td style={{...styles.tableCell, fontWeight: 600}}>{p.potreba_m_3 || '-'}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ŠTAMPANJE */}
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeaderRow}>
            <th colSpan="4" style={styles.tableHeader}>2. PARAMETRI ŠTAMPANJA</th>
          </tr>
        </thead>
        <tbody>
          <tr style={styles.tableRow}>
            <td style={{...styles.tableCell, ...styles.tableCellLabel}}>Štampa mašina:</td>
            <td style={{...styles.tableCell, fontWeight: 600, color: '#1e40af'}}>{p.stampa_masina || 'N/A'}</td>
            <td style={{...styles.tableCell, ...styles.tableCellLabel}}>Strana štampe:</td>
            <td style={styles.tableCell}>{p.strana_stampe || 'N/A'}</td>
          </tr>
          <tr style={styles.tableRow}>
            <td style={{...styles.tableCell, ...styles.tableCellLabel}}>Obim valjka:</td>
            <td style={styles.tableCell}>{p.obim_valjka || '-'} mm</td>
            <td style={{...styles.tableCell, ...styles.tableCellLabel}}>Broj boja:</td>
            <td style={{...styles.tableCell, fontWeight: 700, color: '#dc2626'}}>{p.broj_boja || 'N/A'}</td>
          </tr>
          <tr style={styles.tableRow}>
            <td style={{...styles.tableCell, ...styles.tableCellLabel}}>Kliše:</td>
            <td style={styles.tableCell}>{p.klise || 'N/A'}</td>
            <td style={{...styles.tableCell, ...styles.tableCellLabel}}>Prečnik hilzne:</td>
            <td style={styles.tableCell}>{p.precnik_hilzne || '-'} mm</td>
          </tr>
        </tbody>
      </table>

      {/* KAŠIRANJE */}
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeaderRow}>
            <th colSpan="4" style={styles.tableHeader}>3. PARAMETRI KAŠIRANJA (LAMINIRANJE)</th>
          </tr>
        </thead>
        <tbody>
          <tr style={styles.tableRow}>
            <td style={{...styles.tableCell, ...styles.tableCellLabel}}>Tip lepka:</td>
            <td style={{...styles.tableCell, fontWeight: 600, color: '#1e40af'}}>{p.tip_lepka || 'N/A'}</td>
            <td style={{...styles.tableCell, ...styles.tableCellLabel}}>Odnos komponenti:</td>
            <td style={styles.tableCell}>{p.odnos_lepka || 'N/A'}</td>
          </tr>
          <tr style={styles.tableRow}>
            <td style={{...styles.tableCell, ...styles.tableCellLabel}}>Nanos lepka:</td>
            <td style={styles.tableCell}>{p.nanos_lepka || '-'} g/m²</td>
            <td style={{...styles.tableCell, ...styles.tableCellLabel}}>Doradne mašine:</td>
            <td style={styles.tableCell}>{p.doradne_masine || 'N/A'}</td>
          </tr>
        </tbody>
      </table>

      {/* REZANJE */}
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeaderRow}>
            <th colSpan="4" style={styles.tableHeader}>4. REZANJE I FINALNI FORMAT</th>
          </tr>
        </thead>
        <tbody>
          <tr style={styles.tableRow}>
            <td style={{...styles.tableCell, ...styles.tableCellLabel}}>Širina trake:</td>
            <td style={styles.tableCell}>{p.sirina_trake || '-'} mm</td>
            <td style={{...styles.tableCell, ...styles.tableCellLabel}}>Broj traka po širini:</td>
            <td style={{...styles.tableCell, fontWeight: 700, color: '#1e40af'}}>{p.broj_traka || '-'} traka</td>
          </tr>
          <tr style={styles.tableRow}>
            <td style={{...styles.tableCell, ...styles.tableCellLabel}}>Prečnik finalne rolne:</td>
            <td style={styles.tableCell}>{p.precnik_rolne || '-'} mm</td>
            <td style={{...styles.tableCell, ...styles.tableCellLabel}}>Broj etiketa u metru:</td>
            <td style={styles.tableCell}>{p.broj_etiketa_u_metru || '-'}</td>
          </tr>
        </tbody>
      </table>

      {/* KOLIČINE */}
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeaderRow}>
            <th colSpan="4" style={styles.tableHeader}>5. PORUČENE I PLANIRANE KOLIČINE</th>
          </tr>
        </thead>
        <tbody>
          <tr style={styles.tableRow}>
            <td style={{...styles.tableCell, ...styles.tableCellLabel}}>Poručena količina:</td>
            <td style={{...styles.tableCell, fontSize: 18, fontWeight: 700, color: '#1e40af'}}>
              {p.porucena_kolicina || '-'} kom
            </td>
            <td style={{...styles.tableCell, ...styles.tableCellLabel}}>Količina za rad:</td>
            <td style={{...styles.tableCell, fontSize: 18, fontWeight: 700, color: '#059669'}}>
              {p.kolicina_za_rad || '-'} kom
            </td>
          </tr>
        </tbody>
      </table>

      {/* NAPOMENE */}
      <div style={styles.napomena}>
        <div style={styles.napomenaLabel}>📝 NAPOMENE</div>
        <textarea 
          style={styles.napomenaTextarea}
          defaultValue={p.napomena || ''}
          placeholder="Dodatne napomene..."
        />
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        <div>
          <div style={styles.footerLabel}>Nalog izradio:</div>
          <div style={styles.footerLine}></div>
          <div style={styles.footerHint}>Potpis / Datum</div>
        </div>
        <div>
          <div style={styles.footerLabel}>Nalog odobrio:</div>
          <div style={styles.footerLine}></div>
          <div style={styles.footerHint}>Potpis / Datum</div>
        </div>
        <div>
          <div style={styles.footerLabel}>Radnik izvršio:</div>
          <div style={styles.footerLine}></div>
          <div style={styles.footerHint}>Potpis / Datum</div>
        </div>
      </div>

      {/* AKCIJE */}
      <div style={styles.actions}>
        <button onClick={stampaj} style={styles.btnPrint}>📄 Štampaj nalog</button>
        <button onClick={onClose} style={styles.btnClose}>✖ Zatvori</button>
      </div>

    </div>
  );
}

const styles = {
  container: {
    maxWidth: 1400,
    margin: '0 auto',
    background: 'white',
    padding: 0,
  },
  loading: {
    textAlign: 'center',
    padding: 40,
    fontSize: 18,
    color: '#666',
  },
  header: {
    background: 'white',
    borderBottom: '4px solid #1e40af',
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {},
  companyName: {
    fontSize: 32,
    fontWeight: 700,
    color: '#1e40af',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  headerRight: {
    textAlign: 'right',
  },
  label: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  nalogBroj: {
    fontSize: 42,
    fontWeight: 700,
    color: '#1e40af',
    lineHeight: 1,
  },
  infoBar: {
    background: '#1e40af',
    color: 'white',
    padding: '1rem 2rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '1.5rem',
  },
  infoLabel: {
    fontSize: 10,
    opacity: 0.8,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: 600,
  },
  proizvodInfo: {
    padding: '1.5rem 2rem',
    background: '#eff6ff',
    borderBottom: '2px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proizvodLabel: {
    fontSize: 13,
    color: '#1e40af',
    fontWeight: 600,
    marginBottom: 6,
  },
  proizvodNaziv: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1a1a1a',
  },
  proizvodMeta: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  dimenzije: {
    fontSize: 32,
    fontWeight: 700,
    color: '#1e40af',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  tableHeaderRow: {
    background: '#1e40af',
    color: 'white',
  },
  tableHeader: {
    padding: '12px 2rem',
    fontWeight: 700,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'left',
  },
  tableSubheader: {
    background: '#f9fafb',
    borderBottom: '2px solid #e5e7eb',
  },
  tableCellHeader: {
    padding: '10px 2rem',
    fontWeight: 700,
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase',
  },
  tableRow: {
    borderBottom: '1px solid #f0f0f0',
  },
  tableCell: {
    padding: '14px 2rem',
  },
  tableCellLabel: {
    fontWeight: 600,
    background: '#f9fafb',
    width: '25%',
  },
  napomena: {
    background: '#fef3c7',
    borderLeft: '4px solid #f59e0b',
    padding: '1.25rem 2rem',
    margin: '0',
  },
  napomenaLabel: {
    fontSize: 13,
    color: '#92400e',
    fontWeight: 700,
    marginBottom: 8,
  },
  napomenaTextarea: {
    width: '100%',
    border: '1px solid #fbbf24',
    padding: 10,
    borderRadius: 6,
    fontSize: 13,
    minHeight: 70,
    resize: 'vertical',
    background: 'white',
    fontFamily: 'inherit',
  },
  footer: {
    background: '#f9fafb',
    padding: '2rem',
    borderTop: '2px solid #1e40af',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '3rem',
  },
  footerLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: '1rem',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  footerLine: {
    borderBottom: '2px solid #d1d5db',
    paddingBottom: 10,
    minHeight: 35,
  },
  footerHint: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  actions: {
    background: 'white',
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    borderTop: '1px solid #e5e7eb',
  },
  btnPrint: {
    padding: '12px 28px',
    background: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnClose: {
    padding: '12px 28px',
    background: 'white',
    color: '#dc2626',
    border: '2px solid #dc2626',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
