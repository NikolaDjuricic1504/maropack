// ListaKalkulacija.jsx - LISTA SVIH KALKULACIJA SA FILTERIMA
import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Kalkulator from './Kalkulator';

export default function ListaKalkulacija({ onKreirajRadniNalog }) {
  const [kalkulacije, setKalkulacije] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pretraga, setPretraga] = useState('');
  const [filterStatus, setFilterStatus] = useState('sve');
  const [prikazKalkulator, setPrikazKalkulator] = useState(false);
  const [odabranaKalkulacija, setOdabranaKalkulacija] = useState(null);

  useEffect(() => {
    ucitajKalkulacije();
  }, []);

  async function ucitajKalkulacije() {
    setLoading(true);
    try {
      let query = supabase
        .from('kalkulacije')
        .select('*')
        .order('datum_kreiranja', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      setKalkulacije(data || []);
    } catch (e) {
      console.error('Greška:', e);
      alert('Greška pri učitavanju: ' + e.message);
    }
    setLoading(false);
  }

  function otvoriKalkulaciju(kalkulacija) {
    setOdabranaKalkulacija(kalkulacija.id);
    setPrikazKalkulator(true);
  }

  function novaKalkulacija() {
    setOdabranaKalkulacija(null);
    setPrikazKalkulator(true);
  }

  function zatvoriKalkulator() {
    setPrikazKalkulator(false);
    setOdabranaKalkulacija(null);
    ucitajKalkulacije(); // Refresh liste
  }

  async function obrisiKalkulaciju(id) {
    if (!confirm('Da li si siguran da želiš da obrišeš ovu kalkulaciju?')) return;
    
    try {
      const { error } = await supabase
        .from('kalkulacije')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      alert('✅ Kalkulacija obrisana!');
      ucitajKalkulacije();
    } catch (e) {
      console.error('Greška:', e);
      alert('Greška pri brisanju: ' + e.message);
    }
  }

  async function duplirajKalkulaciju(kalkulacija) {
    try {
      const novaKalk = {
        ...kalkulacija,
        id: undefined,
        naziv: kalkulacija.naziv + ' (kopija)',
        datum_kreiranja: undefined,
        created_at: undefined,
        updated_at: undefined,
        status: 'draft'
      };
      
      const { data, error } = await supabase
        .from('kalkulacije')
        .insert([novaKalk])
        .select()
        .single();
      
      if (error) throw error;
      
      alert('✅ Kalkulacija duplirana!');
      ucitajKalkulacije();
    } catch (e) {
      console.error('Greška:', e);
      alert('Greška pri dupliranju: ' + e.message);
    }
  }

  // Filtriranje
  const filtrirane = kalkulacije.filter(k => {
    const naziv = (k.naziv || '').toLowerCase();
    const kupac = (k.kupac || '').toLowerCase();
    const search = pretraga.toLowerCase();
    
    const matchPretraga = naziv.includes(search) || kupac.includes(search);
    const matchStatus = filterStatus === 'sve' || k.status === filterStatus;
    
    return matchPretraga && matchStatus;
  });

  if (prikazKalkulator) {
    return (
      <Kalkulator 
        kalkulacijaId={odabranaKalkulacija}
        onClose={zatvoriKalkulator}
        onSaved={zatvoriKalkulator}
      />
    );
  }

  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitle}>📊 Kalkulacije</div>
          <div style={styles.headerSubtitle}>Upravljanje svim kalkulacijama</div>
        </div>
        <button onClick={novaKalkulacija} style={styles.btnNova}>
          ➕ Nova kalkulacija
        </button>
      </div>

      {/* FILTERI */}
      <div style={styles.filteri}>
        <div style={{flex: 1}}>
          <input 
            type="text"
            placeholder="🔍 Pretraži po nazivu ili kupcu..."
            value={pretraga}
            onChange={(e) => setPretraga(e.target.value)}
            style={styles.inputPretraga}
          />
        </div>
        <div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.select}
          >
            <option value="sve">Svi statusi</option>
            <option value="draft">Draft</option>
            <option value="odobrena">Odobrena</option>
            <option value="u_proizvodnji">U proizvodnji</option>
            <option value="zavrsena">Završena</option>
          </select>
        </div>
        <button onClick={ucitajKalkulacije} style={styles.btnRefresh}>
          🔄 Refresh
        </button>
      </div>

      {/* LISTA */}
      <div style={styles.lista}>
        {loading ? (
          <div style={styles.loading}>
            <div style={{fontSize: 48, marginBottom: 16}}>⏳</div>
            <div>Učitavanje kalkulacija...</div>
          </div>
        ) : filtrirane.length === 0 ? (
          <div style={styles.prazno}>
            <div style={{fontSize: 48, marginBottom: 16}}>📋</div>
            <div style={{fontSize: 18, fontWeight: 500, marginBottom: 8}}>Nema kalkulacija</div>
            <div style={{color: '#666'}}>Klikni "Nova kalkulacija" da kreiraš prvu</div>
          </div>
        ) : (
          filtrirane.map(k => (
            <div key={k.id} style={styles.kartica}>
              
              {/* HEADER */}
              <div style={styles.karticaHeader}>
                <div style={{flex: 1}}>
                  <div style={styles.karticaNaziv}>{k.naziv}</div>
                  <div style={styles.karticaMeta}>
                    {k.kupac && <span>👤 {k.kupac}</span>}
                    {k.kupac && <span style={{margin: '0 8px', color: '#d1d5db'}}>•</span>}
                    <span>📅 {new Date(k.datum_kreiranja).toLocaleDateString('sr-RS')}</span>
                  </div>
                </div>
                <div style={{
                  ...styles.statusBadge,
                  background: k.status === 'odobrena' ? '#d1fae5' : 
                             k.status === 'u_proizvodnji' ? '#dbeafe' :
                             k.status === 'zavrsena' ? '#e0e7ff' : '#f3f4f6',
                  color: k.status === 'odobrena' ? '#047857' :
                        k.status === 'u_proizvodnji' ? '#1e40af' :
                        k.status === 'zavrsena' ? '#5b21b6' : '#666'
                }}>
                  {k.status === 'draft' && '📝 Draft'}
                  {k.status === 'odobrena' && '✅ Odobrena'}
                  {k.status === 'u_proizvodnji' && '⚙️ U proizvodnji'}
                  {k.status === 'zavrsena' && '🏁 Završena'}
                </div>
              </div>

              {/* PODACI */}
              <div style={styles.karticaPodaci}>
                <div style={styles.podatak}>
                  <div style={styles.podatakLabel}>Dimenzije</div>
                  <div style={styles.podatakValue}>{k.sirina} × {k.metraza} mm</div>
                </div>
                <div style={styles.podatak}>
                  <div style={styles.podatakLabel}>Osnovna cena</div>
                  <div style={styles.podatakValue}>{k.osnovna_cena?.toFixed(2)} €</div>
                </div>
                <div style={styles.podatak}>
                  <div style={styles.podatakLabel}>Konačna cena</div>
                  <div style={{...styles.podatakValue, fontSize: 20, fontWeight: 600, color: '#059669'}}>
                    {k.konacna_cena?.toFixed(2)} €
                  </div>
                </div>
                <div style={styles.podatak}>
                  <div style={styles.podatakLabel}>Po kg</div>
                  <div style={styles.podatakValue}>{k.cena_po_kg?.toFixed(2)} €/kg</div>
                </div>
              </div>

              {/* AKCIJE */}
              <div style={styles.karticaAkcije}>
                <button 
                  onClick={() => otvoriKalkulaciju(k)}
                  style={styles.btnAkcija}
                >
                  👁️ Otvori
                </button>
                <button 
                  onClick={() => duplirajKalkulaciju(k)}
                  style={styles.btnAkcija}
                >
                  📋 Dupliraj
                </button>
                <button 
                  onClick={() => onKreirajRadniNalog(k)}
                  style={{...styles.btnAkcija, background: '#1e40af', color: 'white'}}
                >
                  🚀 Kreiraj RN
                </button>
                <button 
                  onClick={() => obrisiKalkulaciju(k.id)}
                  style={{...styles.btnAkcija, background: '#dc2626', color: 'white'}}
                >
                  🗑️
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}

const styles = {
  container: { maxWidth: 1600, margin: '0 auto', background: 'white', minHeight: '100vh' },
  header: { background: 'linear-gradient(135deg, #1e40af, #1e3a8a)', color: 'white', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 500, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, opacity: 0.9 },
  btnNova: { padding: '12px 28px', background: '#059669', color: 'white', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  filteri: { padding: '1.5rem 2rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '1rem', alignItems: 'center' },
  inputPretraga: { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 },
  select: { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, minWidth: 180 },
  btnRefresh: { padding: '10px 20px', background: 'white', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  lista: { padding: '2rem' },
  loading: { textAlign: 'center', padding: 60, color: '#666' },
  prazno: { textAlign: 'center', padding: 60, color: '#999' },
  kartica: { background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  karticaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f0f0f0' },
  karticaNaziv: { fontSize: 20, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 },
  karticaMeta: { fontSize: 13, color: '#666' },
  statusBadge: { padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600 },
  karticaPodaci: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1rem' },
  podatak: {},
  podatakLabel: { fontSize: 11, color: '#999', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  podatakValue: { fontSize: 16, fontWeight: 500, color: '#333' },
  karticaAkcije: { display: 'flex', gap: '0.5rem' },
  btnAkcija: { padding: '8px 16px', background: 'white', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer' },
};
