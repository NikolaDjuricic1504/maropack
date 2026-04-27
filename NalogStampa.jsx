// NalogStampa.jsx - NALOG ZA ŠTAMPU + KPF CRTEŽ
import { useState, useEffect } from 'react';

export default function NalogStampa({ nalog }) {
  if (!nalog) return null;
  const p = nalog.parametri || {};

  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <div style={styles.title}>NALOG ZA ŠTAMPU</div>
          <div style={styles.subtitle}>Štamparija: {p.stamparija || 'N/A'} • Mašina: {p.stampa_masina || 'N/A'}</div>
        </div>
        <div style={{textAlign: 'right'}}>
          <div style={styles.headerLabel}>Glavni nalog</div>
          <div style={styles.headerValue}>{nalog.broj_naloga || 'N/A'}</div>
        </div>
      </div>

      <div style={styles.content}>
        
        {/* OSNOVNI PODACI */}
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th colSpan="4" style={styles.tableHeaderCell}>OSNOVNI PODACI</th>
            </tr>
          </thead>
          <tbody>
            <tr style={styles.tableRow}>
              <td style={styles.labelCell}>Kupac:</td>
              <td style={styles.valueCell}>{p.kupac || 'N/A'}</td>
              <td style={styles.labelCell}>Proizvod:</td>
              <td style={styles.valueCell}>{nalog.naziv || 'N/A'}</td>
            </tr>
            <tr style={styles.tableRow}>
              <td style={styles.labelCell}>Materijal za štampu:</td>
              <td style={{...styles.valueCell, fontWeight: 700, color: '#dc2626'}}>{p.materijal_1 || 'N/A'}</td>
              <td style={styles.labelCell}>Širina materijala:</td>
              <td style={styles.valueCell}>{p.sirina_materijala || '-'} mm</td>
            </tr>
            <tr style={styles.tableRow}>
              <td style={styles.labelCell}>Količina:</td>
              <td style={{...styles.valueCell, fontWeight: 600}}>{p.potreba_kg_1 || '-'} kg / {p.potreba_m_1 || '-'} m</td>
              <td style={styles.labelCell}>Datum isporuke:</td>
              <td style={styles.valueCell}>{p.datum_isporuke || 'N/A'}</td>
            </tr>
          </tbody>
        </table>

        {/* PARAMETRI ŠTAMPE */}
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th colSpan="4" style={styles.tableHeaderCell}>PARAMETRI ŠTAMPANJA</th>
            </tr>
          </thead>
          <tbody>
            <tr style={styles.tableRow}>
              <td style={styles.labelCell}>Mašina:</td>
              <td style={{...styles.valueCell, fontWeight: 700, color: '#dc2626'}}>{p.stampa_masina || 'N/A'}</td>
              <td style={styles.labelCell}>Strana štampe:</td>
              <td style={styles.valueCell}>{p.strana_stampe || 'N/A'}</td>
            </tr>
            <tr style={styles.tableRow}>
              <td style={styles.labelCell}>Obim valjka:</td>
              <td style={styles.valueCell}>{p.obim_valjka || '-'} mm</td>
              <td style={styles.labelCell}>Broj boja:</td>
              <td style={{...styles.valueCell, fontWeight: 700, color: '#dc2626'}}>{p.broj_boja || 'N/A'}</td>
            </tr>
            <tr style={styles.tableRow}>
              <td style={styles.labelCell}>Kliše:</td>
              <td style={{...styles.valueCell, fontWeight: 600}}>{p.klise || 'N/A'}</td>
              <td style={styles.labelCell}>Smer odmotavanja:</td>
              <td style={styles.valueCell}>{p.smer_odmotavanja || 'N/A'}</td>
            </tr>
          </tbody>
        </table>

        {/* KPF CRTEŽ */}
        <div style={styles.kpfBox}>
          <div style={styles.kpfTitle}>📐 KPF CRTEŽ - LAYOUT ZA ŠTAMPU</div>
          
          <div style={styles.kpfContent}>
            <div style={{textAlign: 'center', marginBottom: '2rem'}}>
              <div style={{fontSize: 12, fontWeight: 600, color: '#666', marginBottom: '1rem'}}>
                ŠIRINA MATERIJALA: {p.sirina_materijala || '?'} mm
              </div>
              
              {/* Vizualizacija traka */}
              <div style={{display: 'flex', justifyContent: 'center', gap: 2, marginBottom: '1rem'}}>
                <div style={{width: 10, background: '#e5e7eb', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9}}>
                  <span style={{writingMode: 'vertical-rl', color: '#999'}}>otpad</span>
                </div>
                {Array.from({length: parseInt(p.broj_traka) || 8}).map((_, i) => (
                  <div key={i} style={{
                    width: parseInt(p.sirina_trake) || 85,
                    background: 'linear-gradient(135deg, #fecaca, #dc2626)',
                    height: 120,
                    border: '1px solid #dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 11,
                    fontWeight: 600
                  }}>
                    <span style={{writingMode: 'vertical-rl'}}>{p.sirina_trake || 85}mm</span>
                  </div>
                ))}
                <div style={{width: 10, background: '#e5e7eb', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9}}>
                  <span style={{writingMode: 'vertical-rl', color: '#999'}}>otpad</span>
                </div>
              </div>

              <div style={{fontSize: 11, color: '#666', marginBottom: '0.5rem'}}>
                ↕ DUŽINA: {p.duzina || '?'}mm po jedinici
              </div>
              <div style={{fontSize: 13, fontWeight: 700, color: '#dc2626'}}>
                {p.broj_traka || 8} TRAKA × {p.sirina_trake || 85}mm + otpad
              </div>
            </div>

            {/* Boje */}
            <div style={styles.bojeBox}>
              <div style={{fontSize: 12, fontWeight: 600, color: '#666', marginBottom: '1rem'}}>SEPARACIJA BOJA:</div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem'}}>
                <div style={{textAlign: 'center'}}>
                  <div style={{width: '100%', height: 50, background: '#0ea5e9', borderRadius: 6, marginBottom: 6}}></div>
                  <div style={{fontSize: 11, fontWeight: 600}}>CYAN</div>
                </div>
                <div style={{textAlign: 'center'}}>
                  <div style={{width: '100%', height: 50, background: '#ec4899', borderRadius: 6, marginBottom: 6}}></div>
                  <div style={{fontSize: 11, fontWeight: 600}}>MAGENTA</div>
                </div>
                <div style={{textAlign: 'center'}}>
                  <div style={{width: '100%', height: 50, background: '#fbbf24', borderRadius: 6, marginBottom: 6}}></div>
                  <div style={{fontSize: 11, fontWeight: 600}}>YELLOW</div>
                </div>
                <div style={{textAlign: 'center'}}>
                  <div style={{width: '100%', height: 50, background: '#1e293b', borderRadius: 6, marginBottom: 6}}></div>
                  <div style={{fontSize: 11, fontWeight: 600}}>BLACK</div>
                </div>
                <div style={{textAlign: 'center'}}>
                  <div style={{width: '100%', height: 50, background: 'linear-gradient(135deg, transparent, rgba(255,255,255,0.5))', border: '2px solid #e5e7eb', borderRadius: 6, marginBottom: 6}}></div>
                  <div style={{fontSize: 11, fontWeight: 600, color: '#dc2626'}}>LAK</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NAPOMENA */}
        <div style={styles.napomena}>
          <div style={styles.napomenaLabel}>📝 NAPOMENA ZA ŠTAMPARIJU</div>
          <div style={styles.napomenaText}>
            Kontrolisati registar svakih 500m. Obavezna provera kvaliteta štampe na početku rolne.
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        <div style={{fontSize: 11, color: '#666'}}>
          <strong>Štamparija:</strong> {p.stamparija || 'N/A'} | <strong>Datum:</strong> __________
        </div>
        <div style={{fontSize: 11, color: '#666'}}>
          Potpis operatera: _________________
        </div>
      </div>

    </div>
  );
}

const styles = {
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    background: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  header: {
    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    color: 'white',
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.9,
  },
  headerLabel: {
    fontSize: 11,
    opacity: 0.8,
    marginBottom: 4,
  },
  headerValue: {
    fontSize: 28,
    fontWeight: 700,
  },
  content: {
    padding: '2rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
    marginBottom: '2rem',
  },
  tableHeader: {
    background: '#fef2f2',
    borderBottom: '2px solid #dc2626',
  },
  tableHeaderCell: {
    padding: '12px 1rem',
    fontWeight: 700,
    color: '#dc2626',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'left',
  },
  tableRow: {
    borderBottom: '1px solid #f0f0f0',
  },
  labelCell: {
    padding: '12px 1rem',
    fontWeight: 600,
    background: '#fafafa',
    width: '25%',
  },
  valueCell: {
    padding: '12px 1rem',
    width: '25%',
  },
  kpfBox: {
    background: '#fafafa',
    border: '2px solid #dc2626',
    borderRadius: 8,
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  kpfTitle: {
    fontWeight: 700,
    color: '#dc2626',
    marginBottom: '1rem',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  kpfContent: {
    background: 'white',
    border: '1px solid #e5e7eb',
    padding: '2rem',
    borderRadius: 6,
  },
  bojeBox: {
    marginTop: '1.5rem',
    background: 'white',
    border: '1px solid #e5e7eb',
    padding: '1.25rem',
    borderRadius: 6,
  },
  napomena: {
    background: '#fef3c7',
    borderLeft: '4px solid #f59e0b',
    padding: '1rem',
    borderRadius: 4,
  },
  napomenaLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#92400e',
    marginBottom: 6,
  },
  napomenaText: {
    fontSize: 13,
    color: '#666',
  },
  footer: {
    background: '#fafafa',
    padding: '1.5rem 2rem',
    borderTop: '2px solid #dc2626',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};
