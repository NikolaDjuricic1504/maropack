// PregledNalogaColorCoded.jsx - 7 COLOR-CODED TABOVA ZA NALOGE
import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export default function PregledNalogaColorCoded({ brojNaloga, kalkulacijaId, onClose, msg, card, inp }) {
  const [nalozi, setNalozi] = useState([]);
  const [aktivniTab, setAktivniTab] = useState(0);
  
  // Učitaj naloge
  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('nalozi')
          .select('*')
          .eq('ponBr', brojNaloga)
          .order('id', { ascending: true });
        if (error) throw error;
        setNalozi(data || []);
      } catch (e) {
        console.error(e);
      }
    }
    if (brojNaloga) load();
  }, [brojNaloga]);

  // Color-coded tipovi
  const TIPOVI = [
    { naziv: 'Materijal', ik: '📦', boja: '#f59e0b', filter: n => n.naziv?.includes('materijal') },
    { naziv: 'Štampa', ik: '🖨️', boja: '#3b82f6', filter: n => n.naziv?.includes('stamp') },
    { naziv: 'Kaširanje', ik: '🔗', boja: '#1d4ed8', filter: n => n.naziv?.includes('kasiranje') },
    { naziv: 'Rezanje', ik: '✂️', boja: '#6366f1', filter: n => n.naziv?.includes('rezanje') },
    { naziv: 'Perforacija', ik: '🔵', boja: '#8b5cf6', filter: n => n.naziv?.includes('perforaciju') },
    { naziv: 'Lakiranje', ik: '✨', boja: '#7c3aed', filter: n => n.naziv?.includes('lakiranje') },
    { naziv: 'Svi', ik: '📋', boja: '#64748b', filter: () => true }
  ];

  const filtriraniNalozi = TIPOVI[aktivniTab].filter(n => n);
  const prikazNalozi = nalozi.filter(filtriraniNalozi);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
            Pregled naloga: {brojNaloga}
          </h2>
          <div style={{ fontSize: 14, color: '#64748b' }}>
            Ukupno naloga: {nalozi.length}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '10px 18px',
            borderRadius: 8,
            border: '1.5px solid #1e40af',
            background: 'transparent',
            color: '#1e40af',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer'
          }}
        >
          ✕ Zatvori
        </button>
      </div>

      {/* Tabovi */}
      <div style={{ 
        display: 'flex', 
        gap: 8, 
        marginBottom: 20,
        overflowX: 'auto',
        padding: '4px 0'
      }}>
        {TIPOVI.map((tip, idx) => {
          const br = idx === TIPOVI.length - 1 ? nalozi.length : nalozi.filter(tip.filter).length;
          const aktivan = aktivniTab === idx;
          return (
            <button
              key={idx}
              onClick={() => setAktivniTab(idx)}
              style={{
                padding: '12px 20px',
                borderRadius: 10,
                border: aktivan ? `2px solid ${tip.boja}` : '2px solid transparent',
                background: aktivan ? tip.boja + '15' : '#f8fafc',
                color: aktivan ? tip.boja : '#64748b',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span style={{ fontSize: 18 }}>{tip.ik}</span>
              <span>{tip.naziv}</span>
              <span style={{
                background: aktivan ? tip.boja : '#cbd5e1',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 700
              }}>
                {br}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lista naloga */}
      {prikazNalozi.length === 0 ? (
        <div style={Object.assign({}, card, { textAlign: 'center', padding: 50, color: '#94a3b8' })}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{TIPOVI[aktivniTab].ik}</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Nema naloga u ovoj kategoriji</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {prikazNalozi.map(nalog => {
            const tipInfo = TIPOVI.find(t => t.filter(nalog)) || TIPOVI[TIPOVI.length - 1];
            return (
              <div
                key={nalog.id}
                style={Object.assign({}, card, {
                  borderLeft: `4px solid ${tipInfo.boja}`,
                  background: `linear-gradient(to right, ${tipInfo.boja}05, transparent)`
                })}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 24 }}>{tipInfo.ik}</span>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{nalog.naziv}</div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>
                          ID: {nalog.id} • Datum: {nalog.datum || '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 6,
                    background: nalog.status === 'Gotovo' ? '#dcfce7' : '#fef3c7',
                    color: nalog.status === 'Gotovo' ? '#166534' : '#92400e',
                    fontSize: 12,
                    fontWeight: 700
                  }}>
                    {nalog.status || 'Čeka'}
                  </span>
                </div>

                {/* Info grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 14,
                  marginBottom: 12
                }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>KUPAC</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{nalog.kupac || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>PROIZVOD</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{nalog.prod || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>KOLIČINA</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{nalog.kol || 0} m</div>
                  </div>
                  {nalog.radnik && (
                    <div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>RADNIK</div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{nalog.radnik}</div>
                    </div>
                  )}
                </div>

                {/* Materijali */}
                {nalog.mats && nalog.mats.length > 0 && (
                  <div style={{
                    padding: 12,
                    background: '#f8fafc',
                    borderRadius: 8,
                    marginBottom: 12
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>
                      MATERIJALI:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {nalog.mats.map((m, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '6px 12px',
                            background: '#fff',
                            borderRadius: 6,
                            border: '1px solid #e2e8f0',
                            fontSize: 13,
                            fontWeight: 600
                          }}
                        >
                          {m.tip} {m.deb}μ
                          {m.stamp && ' 🖨️'}
                          {m.kas > 0 && ` 🔗×${m.kas}`}
                          {m.lak > 0 && ' ✨'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Napomena */}
                {nalog.nap && (
                  <div style={{
                    padding: 10,
                    background: '#fffbeb',
                    borderLeft: '3px solid #f59e0b',
                    borderRadius: 6,
                    fontSize: 13,
                    color: '#78350f'
                  }}>
                    <strong>Napomena:</strong> {nalog.nap}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
