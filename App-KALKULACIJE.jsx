// App.jsx - GLAVNA APLIKACIJA - Dashboard sa svim funkcijama
import { useState } from 'react';
import ListaKalkulacija from './ListaKalkulacija';
import NalogGlavni from './NalogGlavni';
import { generirajRadniNalogIzKalkulacije, prikaziPreviewNaloga } from './generirajRadniNalog';

export default function App() {
  const [prikazNalog, setPrikazNalog] = useState(false);
  const [nalogId, setNalogId] = useState(null);

  async function kreirajRadniNalog(kalkulacija) {
    // Prikaži preview
    const preview = prikaziPreviewNaloga(kalkulacija);
    
    const potvrda = confirm(
      `🚀 Kreiraj radni nalog?\n\n` +
      `Proizvod: ${preview.naziv}\n` +
      `Kupac: ${preview.kupac}\n` +
      `Materijali: ${preview.materijali}\n` +
      `Dimenzije: ${preview.dimenzije}\n` +
      `Štampa: ${preview.stampa}\n` +
      `Kaširanje: ${preview.kasiranje}\n` +
      `Cena: ${preview.cena}\n\n` +
      `Nalog će biti kreiran u bazi.`
    );
    
    if (!potvrda) return;
    
    // Generiši nalog
    const rezultat = await generirajRadniNalogIzKalkulacije(kalkulacija);
    
    if (rezultat.success) {
      alert(
        `✅ Radni nalog kreiran!\n\n` +
        `Broj naloga: ${rezultat.brojNaloga}\n\n` +
        `Nalog je sačuvan u bazi i spreman za proizvodnju.`
      );
      
      // Otvori nalog
      setNalogId(rezultat.nalog.id);
      setPrikazNalog(true);
    } else {
      alert(`❌ Greška pri kreiranju naloga:\n\n${rezultat.error}`);
    }
  }

  function zatvoriNalog() {
    setPrikazNalog(false);
    setNalogId(null);
  }

  if (prikazNalog && nalogId) {
    return (
      <NalogGlavni 
        nalogId={nalogId}
        onClose={zatvoriNalog}
      />
    );
  }

  return (
    <div style={styles.app}>
      <ListaKalkulacija 
        onKreirajRadniNalog={kreirajRadniNalog}
      />
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    background: '#f5f5f5'
  }
};
