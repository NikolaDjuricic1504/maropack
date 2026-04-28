// generirajSveNaloge.js - GENERIŠE GLAVNI + SVE POJEDINAČNE NALOGE
import { supabase } from './supabase';

export async function generirajSveNaloge(kalkulacija) {
  try {
    console.log('🚀 Započinjem generisanje svih naloga...');
    
    const p = kalkulacija.parametri || {};
    const mat = p.materijali || {};
    const usl = p.usluge || {};
    const dim = p.dimenzije || {};
    const pro = p.proizvodnja || {};
    
    // 1. GENERIŠI BROJ NALOGA
    console.log('📝 Generišem broj naloga...');
    const { data: brojNaloga, error: brojError } = await supabase
      .rpc('generiraj_broj_glavnog_naloga');
    
    if (brojError) throw brojError;
    console.log('✅ Broj naloga:', brojNaloga);
    
    // 2. KREIRAJ GLAVNI NALOG
    console.log('📋 Kreiram glavni nalog...');
    const parametriGlavnog = {
      // Osnovni podaci
      kupac: kalkulacija.kupac,
      datum_porudzbine: new Date().toISOString().split('T')[0],
      datum_isporuke: '',
      broj_porudzbine: '',
      graficko_resenje: 'Novi posao',
      
      // Dimenzije
      sirina: dim.sirina_mm || kalkulacija.sirina,
      duzina: dim.duzina_mm || 110,
      sirina_materijala: pro.sirina_trake ? (pro.broj_traka * pro.sirina_trake + 20) : 840,
      
      // Količine
      porucena_kolicina: '',
      kolicina_za_rad: '',
      
      // Cene
      osnovna_cena: kalkulacija.osnovna_cena,
      konacna_cena: kalkulacija.konacna_cena,
      cena_po_kg: kalkulacija.cena_po_kg,
      
      // Kompletan pregled
      materijali: mat,
      usluge: usl,
      dimenzije: dim,
      proizvodnja: pro,
      
      // Napomena
      napomena: `Generisano iz kalkulacije: ${kalkulacija.naziv}`
    };
    
    const { data: glavniNalog, error: glavniError } = await supabase
      .from('radni_nalozi_glavni')
      .insert([{
        broj_naloga: brojNaloga,
        naziv: kalkulacija.naziv,
        kupac: kalkulacija.kupac,
        kalkulacija_id: kalkulacija.id,
        status: 'u_pripremi',
        parametri: parametriGlavnog
      }])
      .select()
      .single();
    
    if (glavniError) throw glavniError;
    console.log('✅ Glavni nalog kreiran:', glavniNalog.id);
    
    // 3. KREIRAJ NALOG ZA ŠTAMPU
    console.log('🖨️ Kreiram nalog za štampu...');
    const stampaniMaterijal = usl.stampa?.materijal === 'A' ? mat.materijal_a?.naziv :
                              usl.stampa?.materijal === 'B' ? mat.materijal_b?.naziv :
                              usl.stampa?.materijal === 'C' ? mat.materijal_c?.naziv : '';
    
    const { data: stampaNalog, error: stampaError } = await supabase
      .from('stampa_nalozi')
      .insert([{
        glavni_nalog_id: glavniNalog.id,
        kalkulacija_id: kalkulacija.id,
        status: 'ceka',
        parametri: {
          masina: pro.stampa_masina || 'UTECO ONYX',
          broj_boja: pro.broj_boja || '4+lak',
          klise: '',
          precnik_hilzne: 152,
          obim_valjka: 330,
          smer_odmotavanja: pro.smer_odmotavanja || 'Na glavu',
          strana_stampe: 'SPOLJNA',
          stampani_materijal: stampaniMaterijal,
          napomena: 'Generirano automatski iz kalkulacije'
        }
      }])
      .select()
      .single();
    
    if (stampaError) throw stampaError;
    console.log('✅ Štampa nalog kreiran:', stampaNalog.id);
    
    // 4. KREIRAJ NALOG ZA MATERIJALE
    console.log('📦 Kreiram nalog za materijale...');
    const { data: materijaliNalog, error: materijaliError } = await supabase
      .from('materijali_nalozi')
      .insert([{
        glavni_nalog_id: glavniNalog.id,
        kalkulacija_id: kalkulacija.id,
        status: 'ceka',
        parametri: {
          materijal_1: mat.materijal_a?.naziv || '',
          debljina_1: mat.materijal_a?.tezina_gm2 || 0,
          potreba_kg_1: mat.materijal_a?.tezina_kg || 0,
          potreba_m_1: kalkulacija.metraza || 0,
          
          materijal_2: mat.materijal_b?.naziv || '',
          debljina_2: mat.materijal_b?.tezina_gm2 || 0,
          potreba_kg_2: mat.materijal_b?.tezina_kg || 0,
          potreba_m_2: kalkulacija.metraza || 0,
          
          materijal_3: mat.materijal_c?.naziv || '',
          debljina_3: mat.materijal_c?.tezina_gm2 || 0,
          potreba_kg_3: mat.materijal_c?.tezina_kg || 0,
          potreba_m_3: kalkulacija.metraza || 0,
          
          sirina_materijala: pro.sirina_trake ? (pro.broj_traka * pro.sirina_trake + 20) : 840,
          napomena: 'Generirano automatski iz kalkulacije'
        }
      }])
      .select()
      .single();
    
    if (materijaliError) throw materijaliError;
    console.log('✅ Materijali nalog kreiran:', materijaliNalog.id);
    
    // 5. KREIRAJ NALOG ZA KAŠIRANJE
    console.log('🔄 Kreiram nalog za kaširanje...');
    const { data: kasiranjeNalog, error: kasiranjeError } = await supabase
      .from('kasiranje_nalozi')
      .insert([{
        glavni_nalog_id: glavniNalog.id,
        kalkulacija_id: kalkulacija.id,
        status: 'ceka',
        parametri: {
          tip_lepka: 'SF724A 324CA',
          odnos_lepka: '100:60',
          nanos_lepka: usl.lepak?.potrosnja_kgm2 || 0.002,
          broj_prolaza: usl.kasiranje?.broj_prolaza || 2,
          temperatura: '',
          brzina: '',
          doradne_masine: `Štampanje, ${usl.kasiranje?.broj_prolaza || 2}x Kaširanje, Rezanje`,
          napomena: 'Generirano automatski iz kalkulacije'
        }
      }])
      .select()
      .single();
    
    if (kasiranjeError) throw kasiranjeError;
    console.log('✅ Kaširanje nalog kreiran:', kasiranjeNalog.id);
    
    // 6. KREIRAJ NALOG ZA REZANJE
    console.log('✂️ Kreiram nalog za rezanje...');
    const { data: rezanjeNalog, error: rezanjeError } = await supabase
      .from('rezanje_nalozi')
      .insert([{
        glavni_nalog_id: glavniNalog.id,
        kalkulacija_id: kalkulacija.id,
        status: 'ceka',
        parametri: {
          sirina_trake: pro.sirina_trake || kalkulacija.sirina,
          broj_traka: pro.broj_traka || 1,
          smer_odmotavanja: 'Na noge',
          precnik_rolne: 400,
          broj_etiketa_u_metru: dim.duzina_mm ? (1000 / dim.duzina_mm).toFixed(2) : 9.09,
          napomena: 'Generirano automatski iz kalkulacije'
        }
      }])
      .select()
      .single();
    
    if (rezanjeError) throw rezanjeError;
    console.log('✅ Rezanje nalog kreiran:', rezanjeNalog.id);
    
    // 7. KREIRAJ NALOG ZA PERFORACIJU (opciono)
    console.log('⚙️ Kreiram nalog za perforaciju...');
    const { data: perforacijaNalog, error: perforacijaError } = await supabase
      .from('perforacija_nalozi')
      .insert([{
        glavni_nalog_id: glavniNalog.id,
        kalkulacija_id: kalkulacija.id,
        status: 'ceka',
        parametri: {
          tip_perforacije: '',
          razmak: 0,
          dubina: 0,
          broj_linija: 0,
          napomena: 'Perforacija nije potrebna - generirano automatski'
        }
      }])
      .select()
      .single();
    
    if (perforacijaError) throw perforacijaError;
    console.log('✅ Perforacija nalog kreiran:', perforacijaNalog.id);
    
    // 8. KREIRAJ NALOG ZA IZGLED
    console.log('🎨 Kreiram nalog za izgled...');
    const { data: izgledNalog, error: izgledError } = await supabase
      .from('izgled_nalozi')
      .insert([{
        glavni_nalog_id: glavniNalog.id,
        kalkulacija_id: kalkulacija.id,
        status: 'ceka',
        parametri: {
          opis_izgleda: kalkulacija.naziv,
          slika_url: '',
          dimenzije: `${dim.sirina_mm || kalkulacija.sirina} × ${dim.duzina_mm || 110} mm`,
          boje: pro.broj_boja || '4+lak',
          napomena: 'Generirano automatski iz kalkulacije'
        }
      }])
      .select()
      .single();
    
    if (izgledError) throw izgledError;
    console.log('✅ Izgled nalog kreiran:', izgledNalog.id);
    
    // 9. AŽURIRAJ STATUS KALKULACIJE
    console.log('🔄 Ažuriram status kalkulacije...');
    await supabase
      .from('kalkulacije')
      .update({ status: 'u_proizvodnji' })
      .eq('id', kalkulacija.id);
    
    console.log('✅ Status kalkulacije ažuriran!');
    
    // 10. VRATI SVE NALOGE
    return {
      success: true,
      brojNaloga: brojNaloga,
      glavniNalog: glavniNalog,
      pojedinacniNalozi: {
        stampa: stampaNalog,
        materijali: materijaliNalog,
        kasiranje: kasiranjeNalog,
        rezanje: rezanjeNalog,
        perforacija: perforacijaNalog,
        izgled: izgledNalog
      }
    };
    
  } catch (error) {
    console.error('❌ Greška pri generisanju naloga:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Helper funkcija - Učitaj sve naloge za kalkulaciju
export async function ucitajSveNalogZaKalkulaciju(kalkulacijaId) {
  try {
    const { data, error } = await supabase
      .from('kompletan_nalog_view')
      .select('*')
      .eq('kalkulacija_id', kalkulacijaId)
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Helper funkcija - Učitaj SVE pojedinačne naloge za glavni nalog
export async function ucitajPojedinacneNaloge(glavniNalogId) {
  try {
    const [stampa, materijali, kasiranje, rezanje, perforacija, izgled] = await Promise.all([
      supabase.from('stampa_nalozi').select('*').eq('glavni_nalog_id', glavniNalogId).single(),
      supabase.from('materijali_nalozi').select('*').eq('glavni_nalog_id', glavniNalogId).single(),
      supabase.from('kasiranje_nalozi').select('*').eq('glavni_nalog_id', glavniNalogId).single(),
      supabase.from('rezanje_nalozi').select('*').eq('glavni_nalog_id', glavniNalogId).single(),
      supabase.from('perforacija_nalozi').select('*').eq('glavni_nalog_id', glavniNalogId).single(),
      supabase.from('izgled_nalozi').select('*').eq('glavni_nalog_id', glavniNalogId).single()
    ]);
    
    return {
      success: true,
      nalozi: {
        stampa: stampa.data,
        materijali: materijali.data,
        kasiranje: kasiranje.data,
        rezanje: rezanje.data,
        perforacija: perforacija.data,
        izgled: izgled.data
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
