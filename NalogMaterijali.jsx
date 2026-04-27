// NalogMaterijali.jsx - NALOG ZA POTREBU MATERIJALA
import { useState } from 'react';

export default function NalogMaterijali({ nalog }) {
  if (!nalog) return null;
  const p = nalog.parametri || {};

  const materijali = [];
  if (p.materijal_1) materijali.push({rb: 1, naziv: p.materijal_1, debljina: p.debljina_1, sirina: p.sirina_materijala, kg: p.potreba_kg_1, m: p.potreba_m_1});
  if (p.materijal_2) materijali.push({rb: 2, naziv: p.materijal_2, debljina: p.debljina_2, sirina: p.sirina_materijala, kg: p.potreba_kg_2, m: p.potreba_m_2});
  if (p.materijal_3) materijali.push({rb: 3, naziv: p.materijal_3, debljina: p.debljina_3, sirina: p.sirina_materijala, kg: p.potreba_kg_3, m: p.potreba_m_3});
  if (p.materijal_4) materijali.push({rb: 4, naziv: p.materijal_4, debljina: p.debljina_4, sirina: p.sirina_materijala, kg: p.potreba_kg_4, m: p.potreba_m_4});

  const ukupnoKg = materijali.reduce((sum, m) => sum + (parseFloat(m.kg) || 0), 0);
  const ukupnoM = materijali.reduce((sum, m) => sum + (parseFloat(m.m) || 0), 0);

  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <div style={styles.title}>NALOG ZA POTREBU MATERIJALA</div>
          <div style={styles.subtitle}>Rezervacija materijala za proizvodnju</div>
        </div>
        <div style={{textAlign: 'right'}}>
          <div style={styles.headerLabel}>Glavni nalog</div>
          <div style={styles.headerValue}>{nalog.broj_naloga || 'N/A'}</div>
        </div>
      </div>

      {/* INFO */}
      <div style={styles.infoBar}>
        <div>
          <div style={styles.infoLabel}>DATUM IZDAVANJA</div>
          <div style={styles.infoValue}>{p.datum_porudzbine || new Date().toLocaleDateString('sr-RS')}</div>
        </div>
        <div>
          <div style={styles.infoLabel}>KUPAC</div>
          <div style={styles.infoValue}>{p.kupac || 'N/A'}</div>
        </div>
        <div>
          <div style={styles.infoLabel}>PROIZVOD</div>
          <div style={styles.infoValue}>{nalog.naziv || 'N/A'}</div>
        </div>
      </div>

      <div style={styles.content}>
        
        {/* TABELA MATERIJALA */}
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.thRb}>RB</th>
              <th style={styles.th}>Naziv materijala</th>
              <th style={styles.thCenter}>Širina (mm)</th>
              <th style={styles.thCenter}>Količina (kg)</th>
              <th style={styles.thCenter}>Količina (m)</th>
              <th style={styles.thCenter}>Lokacija u magacinu</th>
            </tr>
          </thead>
          <tbody>
            {materijali.map((mat, idx) => (
              <tr key={idx} style={{
                ...styles.tableRow,
                background: idx === 0 ? '#fffbeb' : idx === 1 ? '#fef3c7' : '#fef9c3'
              }}>
                <td style={styles.tdRb}>{mat.rb}</td>
                <td style={styles.td}>
                  <div style={{fontWeight: 700, fontSize: 15, marginBottom: 4}}>{mat.naziv}</div>
                  <div style={{fontSize: 11, color: '#666'}}>Debljina: {mat.debljina || '-'} µm</div>
                </td>
                <td style={{...styles.tdCenter, fontWeight: 600, fontSize: 15}}>{mat.sirina || '-'}</td>
                <td style={{...styles.tdCenter, fontWeight: 700, fontSize: 18, color: '#059669'}}>{mat.kg || '-'}</td>
                <td style={{...styles.tdCenter, fontWeight: 600, fontSize: 15}}>{mat.m || '-'}</td>
                <td style={styles.tdCenter}>
                  <input type="text" placeholder="A-12-3" style={styles.inputLokacija} />
                </td>
              </tr>
            ))}
            
            {/* UKUPNO */}
            <tr style={{background: '#f0fdf4'}}>
              <td colSpan="3" style={{...styles.td, fontWeight: 700, textAlign: 'right', fontSize: 14, textTransform: 'uppercase', color: '#059669'}}>
                UKUPNO:
              </td>
              <td style={{...styles.tdCenter, fontWeight: 700, fontSize: 22, color: '#059669'}}>
                {ukupnoKg.toFixed(2)} kg
              </td>
              <td style={{...styles.tdCenter, fontWeight: 700, fontSize: 16, color: '#059669'}}>
                {ukupnoM.toFixed(2)} m
              </td>
              <td style={styles.td}></td>
            </tr>
          </tbody>
        </table>

        {/* POMOĆNI MATERIJALI */}
        <div style={styles.pomocniBox}>
          <div style={styles.pomocniTitle}>POMOĆNI MATERIJALI</div>
          <table style={{width: '100%', fontSize: 13}}>
            <tbody>
              <tr style={{borderBottom: '1px solid #d1fae5'}}>
                <td style={{padding: '10px 0', fontWeight: 600, width: '30%'}}>Lepak {p.tip_lepka || 'N/A'}:</td>
                <td style={{padding: '10px 0', fontWeight: 700, color: '#059669'}}>Potrebno izračunati prema nanonu {p.nanos_lepka || '-'} g/m²</td>
              </tr>
              <tr style={{borderBottom: '1px solid #d1fae5'}}>
                <td style={{padding: '10px 0', fontWeight: 600}}>Hilzne (fi {p.precnik_hilzne || '76'}mm):</td>
                <td style={{padding: '10px 0', fontWeight: 700}}>Približno potrebno prema broju rolni</td>
              </tr>
              <tr>
                <td style={{padding: '10px 0', fontWeight: 600}}>Pakovanje (folija, vezice):</td>
                <td style={{padding: '10px 0', fontWeight: 700}}>Prema specifikaciji</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* NAPOMENA */}
        <div style={styles.napomena}>
          <div style={styles.napomenaLabel}>📝 NAPOMENA</div>
          <textarea style={styles.napomenaTextarea} placeholder="Dodatne napomene..."></textarea>
        </div>

      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        <div>
          <div style={styles.footerLabel}>Materijal pripremio:</div>
          <div style={styles.footerLine}></div>
          <div style={styles.footerHint}>Potpis / Datum</div>
        </div>
        <div>
          <div style={styles.footerLabel}>Kontrolu izvršio:</div>
          <div style={styles.footerLine}></div>
          <div style={styles.footerHint}>Potpis / Datum</div>
        </div>
        <div>
          <div style={styles.footerLabel}>Preuzeo za proizvodnju:</div>
          <div style={styles.footerLine}></div>
          <div style={styles.footerHint}>Potpis / Datum</div>
        </div>
      </div>

    </div>
  );
}

const styles = {
  container: {
    maxWidth: 1000,
    margin: '0 auto',
    background: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  header: {
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
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
  infoBar: {
    padding: '1.5rem 2rem',
    background: '#f0fdf4',
    borderBottom: '2px solid #059669',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '2rem',
  },
  infoLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    fontWeight: 600,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 700,
    color: '#059669',
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
    background: '#f0fdf4',
    borderBottom: '3px solid #059669',
  },
  thRb: {
    padding: '14px 1rem',
    textAlign: 'left',
    fontWeight: 700,
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 12,
  },
  th: {
    padding: '14px 1rem',
    textAlign: 'left',
    fontWeight: 700,
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 12,
  },
  thCenter: {
    padding: '14px 1rem',
    textAlign: 'center',
    fontWeight: 700,
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 12,
  },
  tableRow: {
    borderBottom: '1px solid #f0f0f0',
  },
  tdRb: {
    padding: '16px 1rem',
    fontWeight: 700,
    fontSize: 18,
    color: '#b45309',
  },
  td: {
    padding: '16px 1rem',
  },
  tdCenter: {
    padding: '16px 1rem',
    textAlign: 'center',
  },
  inputLokacija: {
    width: 80,
    padding: 6,
    border: '1px solid #d1d5db',
    borderRadius: 4,
    textAlign: 'center',
    fontSize: 13,
  },
  pomocniBox: {
    marginTop: '2rem',
    padding: '1.5rem',
    background: '#f0fdf4',
    borderRadius: 6,
    borderLeft: '4px solid #059669',
  },
  pomocniTitle: {
    fontWeight: 700,
    color: '#059669',
    marginBottom: '1rem',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  napomena: {
    marginTop: '1.5rem',
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
  napomenaTextarea: {
    width: '100%',
    border: '1px solid #fbbf24',
    padding: 10,
    borderRadius: 4,
    fontSize: 13,
    minHeight: 60,
    resize: 'vertical',
    background: 'white',
    fontFamily: 'inherit',
  },
  footer: {
    background: '#fafafa',
    padding: '1.5rem 2rem',
    borderTop: '2px solid #059669',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '2rem',
  },
  footerLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  footerLine: {
    borderBottom: '2px solid #d1d5db',
    paddingBottom: 10,
    minHeight: 30,
  },
  footerHint: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
};
