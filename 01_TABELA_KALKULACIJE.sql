// OperativniNalozi.jsx - KOMPLETAN SISTEM
import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export default function OperativniNalozi({ user, msg, card, inp, lbl, db, setDb }) {
  const [view, setView] = useState('lista'); // lista | kalkulacija | pregled
  const [kalkulacije, setKalkulacije] = useState([]);
  const [aktivnaKalk, setAktivnaKalk] = useState(null);
  const [pregledNaloga, setPregledNaloga] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [pretraga, setPretraga] = useState('');

  // Učitaj kalkulacije
  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('kalkulacije_folija')
          .select('*')
          .order('datum_kreiranja', { ascending: false });
        if (error) throw error;
        setKalkulacije(data || []);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  // Filtrirane kalkulacije
  const filtrirane = kalkulacije.filter(k => {
    return (!filterStatus || k.status === filterStatus) &&
           (!pretraga || (k.naziv || '').toLowerCase().includes(pretraga.toLowerCase()) ||
                        (k.kupac || '').toLowerCase().includes(pretraga.toLowerCase()));
  });

  // ========== GENERISANJE NALOGA ==========
  async function generirajNaloge(kalk) {
    try {
      // Generiši broj naloga
      const brNaloga = 'MP-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000);
      
      // Pripremi materijale
      const mats = (kalk.materijali || []).filter(m => m && m.tip);
      const brKas = mats.reduce((s, m) => s + (+(m.kas || 0)), 0);
      const brLak = mats.reduce((s, m) => s + (+(m.lak || 0)), 0);
      const hasSt = mats.some(m => m.stamp);

      // Tipovi naloga koji će se kreirati
      const tipovi = [];
      tipovi.push({ tip: 'mag', naziv: 'Nalog za materijal', ik: 'box', boj: '#f59e0b' });
      if (hasSt) tipovi.push({ tip: 'st', naziv: 'Nalog za stampu', ik: 'print', boj: '#3b82f6' });
      for (let i = 1; i <= brKas; i++) {
        tipovi.push({ tip: 'kas' + i, naziv: 'Nalog za kasiranje ' + i, ik: 'link', boj: '#1d4ed8' });
      }
      tipovi.push({ tip: 'rez', naziv: 'Nalog za rezanje', ik: 'cut', boj: '#6366f1' });
      tipovi.push({ tip: 'perf', naziv: 'Nalog za perforaciju', ik: 'circle', boj: '#8b5cf6' });
      if (brLak > 0) tipovi.push({ tip: 'lak', naziv: 'Nalog za lakiranje', ik: 'star', boj: '#7c3aed' });

      // Kreiraj naloge
      const nalozi = tipovi.map(t => ({
        ponBr: brNaloga,
        kupac: kalk.kupac,
        prod: kalk.naziv,
        naziv: t.naziv,
        ik: t.ik,
        boj: t.boj,
        status: 'Ceka',
        datum: new Date().toLocaleDateString('sr-RS'),
        radnik: '',
        nap: '',
        kol: +(kalk.nalog || 0) * 1000,
        mats: mats,
        tip: 'folija',
        kalkulacija_id: kalk.id
      }));

      // Insert u bazu
      const { error: insErr } = await supabase.from('nalozi').insert(nalozi);
      if (insErr) throw insErr;

      // Update status kalkulacije
      const { error: updErr } = await supabase
        .from('kalkulacije_folija')
        .update({ status: 'u_proizvodnji' })
        .eq('id', kalk.id);
      if (updErr) throw updErr;

      msg('✅ Kreirano ' + nalozi.length + ' naloga! Broj: ' + brNaloga);
      
      // Reload kalkulacije
      const { data } = await supabase
        .from('kalkulacije_folija')
        .select('*')
        .order('datum_kreiranja', { ascending: false });
      setKalkulacije(data || []);

      // Prikaži pregled
      setPregledNaloga({ broj: brNaloga, kalkulacijaId: kalk.id });
      setView('pregled');

    } catch (e) {
      msg('Greška: ' + e.message, 'err');
    }
  }

  // ========== PRIKAZ STATUS BADGE ==========
  const StatusBadge = ({ status }) => {
    const boje = {
      draft: { bg: '#f8fafc', text: '#64748b', label: 'Draft' },
      odobrena: { bg: '#dbeafe', text: '#1e40af', label: 'Odobrena' },
      u_proizvodnji: { bg: '#fef3c7', text: '#92400e', label: 'U proizvodnji' },
      zavrsena: { bg: '#dcfce7', text: '#166534', label: 'Završena' }
    };
    const s = boje[status] || boje.draft;
    return (
      <span style={{
        background: s.bg,
        color: s.text,
        padding: '3px 10px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700
      }}>
        {s.label}
      </span>
    );
  };

  // ========== VIEW: LISTA KALKULACIJA ==========
  if (view === 'lista') {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>📋 Operativni nalozi - Kalkulacije</h2>
          <button
            onClick={() => setView('kalkulacija')}
            style={{
              padding: '9px 18px',
              borderRadius: 8,
              border: 'none',
              background: '#059669',
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            ➕ Nova kalkulacija
          </button>
        </div>

        {/* Filteri */}
        <div style={Object.assign({}, card, { marginBottom: 14, padding: '14px 16px' })}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              style={Object.assign({}, inp, { flex: 1, minWidth: 200 })}
              placeholder="🔍 Pretraži naziv ili kupca..."
              value={pretraga}
              onChange={e => setPretraga(e.target.value)}
            />
            <select
              style={Object.assign({}, inp, { width: 160 })}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">📊 Svi statusi</option>
              <option value="draft">Draft</option>
              <option value="odobrena">Odobrena</option>
              <option value="u_proizvodnji">U proizvodnji</option>
              <option value="zavrsena">Završena</option>
            </select>
            {(filterStatus || pretraga) && (
              <button
                style={{
                  padding: '8px 12px',
                  borderRadius: 7,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#64748b',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setFilterStatus('');
                  setPretraga('');
                }}
              >
                ✕ Reset
              </button>
            )}
          </div>
        </div>

        {/* Lista */}
        {filtrirane.length === 0 ? (
          <div style={Object.assign({}, card, { textAlign: 'center', padding: 50, color: '#94a3b8' })}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
              {kalkulacije.length === 0 ? 'Nema kalkulacija' : 'Nema rezultata'}
            </div>
            <div style={{ fontSize: 13 }}>
              {kalkulacije.length === 0 ? 'Kliknite "Nova kalkulacija" da počnete' : 'Promenite filter ili pretragu'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {filtrirane.map(k => (
              <div
                key={k.id}
                style={Object.assign({}, card, {
                  borderLeft: '4px solid #1e40af',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                })}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(30,64,175,0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{k.naziv}</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>
                      👤 {k.kupac || '—'} • 📅 {new Date(k.datum_kreiranja).toLocaleDateString('sr-RS')}
                    </div>
                  </div>
                  <StatusBadge status={k.status} />
                </div>

                {/* Info */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 10,
                  marginBottom: 12
                }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>DIMENZIJE</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{k.sirina} × {k.metraza} mm</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>NALOG</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{k.nalog}×1000m</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>OSNOVNA CENA</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{(k.osnovna_cena || 0).toFixed(2)} €</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>KONAČNA CENA</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#059669' }}>{(k.konacna_cena || 0).toFixed(2)} €</div>
                  </div>
                </div>

                {/* Akcije */}
                <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                  <button
                    onClick={() => {
                      setAktivnaKalk(k);
                      setView('kalkulacija');
                    }}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 6,
                      border: '1px solid #e2e8f0',
                      background: '#fff',
                      color: '#64748b',
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: 'pointer'
                    }}
                  >
                    👁️ Otvori
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Dupliraj
                      msg('Funkcija u izradi');
                    }}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 6,
                      border: '1px solid #e2e8f0',
                      background: '#fff',
                      color: '#64748b',
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: 'pointer'
                    }}
                  >
                    📋 Dupliraj
                  </button>
                  {k.status === 'draft' && (
                    <button
                      onClick={() => generirajNaloge(k)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 6,
                        border: 'none',
                        background: '#1e40af',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer'
                      }}
                    >
                      🚀 Kreiraj naloge
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      if (!confirm('Obrisati kalkulaciju?')) return;
                      try {
                        await supabase.from('kalkulacije_folija').delete().eq('id', k.id);
                        setKalkulacije(kalkulacije.filter(x => x.id !== k.id));
                        msg('Obrisano!');
                      } catch (e) {
                        msg('Greška: ' + e.message, 'err');
                      }
                    }}
                    style={{
                      padding: '7px 12px',
                      borderRadius: 6,
                      border: 'none',
                      background: '#fef2f2',
                      color: '#ef4444',
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: 'pointer',
                      marginLeft: 'auto'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ========== VIEW: KALKULACIJA (PLACEHOLDER) ==========
  if (view === 'kalkulacija') {
    return (
      <div>
        <button
          onClick={() => {
            setView('lista');
            setAktivnaKalk(null);
          }}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1.5px solid #1e40af',
            background: 'transparent',
            color: '#1e40af',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 13,
            marginBottom: 14
          }}
        >
          ← Nazad na listu
        </button>
        <div style={Object.assign({}, card, { textAlign: 'center', padding: 50 })}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🧮</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Kalkulator folije</div>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
            Koristi postojeći KalkulatorFolije iz glavnog App.jsx-a<br />
            ili ovde dodaj novu komponentu
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>
            Tvoj postojeći KalkulatorFolije komponenta već radi odlično!<br />
            Možemo je spojiti ovde ili koristiti postojeću.
          </div>
        </div>
      </div>
    );
  }

  // ========== VIEW: PREGLED NALOGA (PLACEHOLDER) ==========
  if (view === 'pregled') {
    return (
      <div>
        <button
          onClick={() => {
            setView('lista');
            setPregledNaloga(null);
          }}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1.5px solid #1e40af',
            background: 'transparent',
            color: '#1e40af',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 13,
            marginBottom: 14
          }}
        >
          ← Nazad na listu
        </button>
        <div style={Object.assign({}, card, { textAlign: 'center', padding: 50 })}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Pregled naloga: {pregledNaloga?.broj}</div>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
            Ovde će biti 7 color-coded tabova sa svim nalozima
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>
            Komponenta PregledSvihNaloga sa bojama dolazi u sledećem fajlu!
          </div>
        </div>
      </div>
    );
  }

  return null;
}
