// generirajRadniNalog.js - GENERISANJE RADNOG NALOGA IZ KALKULACIJE
import { supabase } from './supabase';

export async function generirajRadniNalogIzKalkulacije(kalkulacija) {
  try {
    // 1. Generiši broj naloga
    const { data: brojData, error: brojError } = await supabase
      .rpc('generiraj_broj_naloga');
    
    if (brojError) throw brojError;
    const brojNaloga = brojData;
    
    // 2. Pripremi parametri za radni nalog iz kalkulacije
    const p = kalkulacija.parametri || {};
    const mat = p.materijali || {};
    const usl = p.usluge || {};
    const dim = p.dimenzije || {};
    const pro = p.proizvodnja || {};
    const dod = p.dodatno || {};
    
    const parametriNaloga = {
      // Osnovni podaci
      kupac: kalkulacija.kupac,
      datum_porudzbine: new Date().toISOString().split('T')[0],
      datum_isporuke: '', // Korisnik može da unese
      broj_porudzbine: '',
      graficko_resenje: 'Novi posao',
      
      // Dimenzije
      sirina: dim.sirina_mm || kalkulacija.sirina,
      duzina: dim.duzina_mm || 110,
      sirina_materijala: pro.sirina_trake ? (pro.broj_traka * pro.sirina_trake + 20) : 840,
      sirina_trake: pro.sirina_trake || kalkulacija.sirina,
      broj_traka: pro.broj_traka || 1,
      
      // Materijali - uzmi podatke iz kalkulacije
      materijal_1: mat.materijal_a?.naziv,
      debljina_1: mat.materijal_a?.tezina_gm2,
      potreba_kg_1: mat.materijal_a?.tezina_kg,
      potreba_m_1: kalkulacija.metraza,
      
      materijal_2: mat.materijal_b?.naziv,
      debljina_2: mat.materijal_b?.tezina_gm2,
      potreba_kg_2: mat.materijal_b?.tezina_kg,
      potreba_m_2: kalkulacija.metraza,
      
      materijal_3: mat.materijal_c?.naziv,
      debljina_3: mat.materijal_c?.tezina_gm2,
      potreba_kg_3: mat.materijal_c?.tezina_kg,
      potreba_m_3: kalkulacija.metraza,
      
      // Štampanje
      stampa_masina: pro.stampa_masina || 'UTECO ONYX',
      strana_stampe: 'SPOLJNA',
      obim_valjka: 330,
      broj_boja: pro.broj_boja || '4+lak',
      klise: '',
      precnik_hilzne: 152,
      smer_odmotavanja: pro.smer_odmotavanja || 'Na glavu',
      stamparija: '',
      
      // Kaširanje
      tip_lepka: 'SF724A 324CA', // Default, može se promeniti
      odnos_lepka: '100:60',
      nanos_lepka: usl.lepak?.potrosnja_kgm2 || 0.002,
      doradne_masine: `Štampanje, ${usl.kasiranje?.broj_prolaza || 0}x Kaširanje, Rezanje`,
      
      // Rezanje
      smer_odmotavanja_gp: 'Na noge',
      broj_etiketa_u_metru: dim.duzina_mm ? (1000 / dim.duzina_mm).toFixed(2) : 9.09,
      precnik_rolne: 400,
      
      // Količine
      porucena_kolicina: '', // Korisnik unosi
      kolicina_za_rad: '', // Korisnik unosi
      
      // Cene (iz kalkulacije)
      osnovna_cena: kalkulacija.osnovna_cena,
      konacna_cena: kalkulacija.konacna_cena,
      cena_po_kg: kalkulacija.cena_po_kg,
      
      // Napomena
      napomena: `Generisano iz kalkulacije: ${kalkulacija.naziv} (${new Date().toLocaleDateString('sr-RS')})`
    };
    
    // 3. Kreiraj radni nalog u bazi
    const { data: nalogData, error: nalogError } = await supabase
      .from('radni_nalozi_folija')
      .insert([
        {
          broj_naloga: brojNaloga,
          naziv: kalkulacija.naziv,
          status: 'u_pripremi',
          kalkulacija_id: kalkulacija.id,
          parametri: parametriNaloga
        }
      ])
      .select()
      .single();
    
    if (nalogError) throw nalogError;
    
    // 4. Ažuriraj status kalkulacije
    await supabase
      .from('kalkulacije')
      .update({ status: 'u_proizvodnji' })
      .eq('id', kalkulacija.id);
    
    return {
      success: true,
      nalog: nalogData,
      brojNaloga: brojNaloga
    };
    
  } catch (error) {
    console.error('Greška pri generisanju radnog naloga:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Helper funkcija za pregled kako će nalog izgledati
export function prikaziPreviewNaloga(kalkulacija) {
  const p = kalkulacija.parametri || {};
  const mat = p.materijali || {};
  const usl = p.usluge || {};
  
  return {
    naziv: kalkulacija.naziv,
    kupac: kalkulacija.kupac,
    materijali: [
      mat.materijal_a?.naziv,
      mat.materijal_b?.naziv,
      mat.materijal_c?.naziv
    ].filter(Boolean).join(' + '),
    dimenzije: `${kalkulacija.sirina} × ${p.dimenzije?.duzina_mm || 110} mm`,
    stampa: `${p.proizvodnja?.stampa_masina || 'UTECO ONYX'} - ${p.proizvodnja?.broj_boja || '4+lak'}`,
    kasiranje: `${usl.kasiranje?.broj_prolaza || 2} prolaza`,
    cena: `${kalkulacija.konacna_cena?.toFixed(2)} €`
  };
}
