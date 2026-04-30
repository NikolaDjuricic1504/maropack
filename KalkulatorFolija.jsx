import { useState, useEffect } from 'react'
import { supabase } from '../../supabase.js'

export default function KalkulatorFolija({ user, card, btn, inp, lbl, msg }) {
  // Osnovni podaci
  const [naziv, setNaziv] = useState('')
  const [kupac, setKupac] = useState('')
  
  // Dimenzije
  const [sirinaMM, setSirinaMM] = useState('')
  const [duzinaMM, setDuzinaMM] = useState('')
  const [idealnaSerinaMaterijala, setIdealnaSerinaMaterijala] = useState('')
  
  // 4 sloja materijala
  const [mat1, setMat1] = useState({ naziv: '', debljina: '', tezina: '', cena: '' })
  const [mat2, setMat2] = useState({ naziv: '', debljina: '', tezina: '', cena: '' })
  const [mat3, setMat3] = useState({ naziv: '', debljina: '', tezina: '', cena: '' })
  const [mat4, setMat4] = useState({ naziv: '', debljina: '', tezina: '', cena: '' })
  
  // Kaširanje
  const [imaKasiranje, setImaKasiranje] = useState(false)
  const [brojProlazaKasiranja, setBrojProlazaKasiranja] = useState(2)
  const [cenaKasiranjaM2, setCenaKasiranjaM2] = useState('')
  
  // Štampa
  const [imaStampu, setImaStampu] = useState(false)
  const [brojBoja, setBrojBoja] = useState('4+lak')
  const [stranStampe, setStranStampe] = useState('SPOLJNA')
  const [obimValjka, setObimValjka] = useState('330')
  const [klise, setKlise] = useState('')
  const [stamparskaMasina, setStamparskaMasina] = useState('UTECO ONYX')
  const [stamparija, setStamparija] = useState('Milinković')
  
  // Lakiranje
  const [imaLakiranje, setImaLakiranje] = useState(false)
  const [brojProlazaLaka, setBrojProlazaLaka] = useState(1)
  
  // Lepak
  const [tipLepka, setTipLepka] = useState('SF724A 324CA')
  const [odnosKomponenti, setOdnosKomponenti] = useState('100:60')
  const [nanosLepka, setNanosLepka] = useState('1.8')
  const [utrosakLepka, setUtrosakLepka] = useState('0.36')
  
  // Rezanje
  const [brojTraka, setBrojTraka] = useState('8')
  const [sirinaTrake, setSirinaTrake] = useState('')
  const [smerOdmotavanja, setSmerOdmotavanja] = useState('Na noge')
  
  // Rolna
  const [duzinaRolne, setDuzinaRolne] = useState('')
  const [precnikRolne, setPrecnikRolne] = useState('400')
  const [precnikHilzne, setPrecnikHilzne] = useState('76')
  
  // Perforacija
  const [imaPerforaciju, setImaPerforaciju] = useState(false)
  const [oblikPerforacije, setOblikPerforacije] = useState('')
  const [orijentacijaPerforacije, setOrijentacijaPerforacije] = useState('')
  
  // Količina i cene
  const [metrazaPunog, setMetrazaPunog] = useState('')
  const [skartProcenat, setSkartProcenat] = useState('0.10')
  const [marza, setMarza] = useState('0.30')
  
  // Rezultati
  const [osnovnaCena, setOsnovnaCena] = useState(0)
  const [cenaSaSkartom, setCenaSaSkartom] = useState(0)
  const [konacnaCena, setKonacnaCena] = useState(0)
  
  const [poruka, setPoruka] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Lista dostupnih materijala
  const [materijali, setMaterijali] = useState([])
  
  useEffect(() => {
    ucitajMaterijale()
  }, [])
  
  const ucitajMaterijale = async () => {
    const { data, error } = await supabase
      .from('materijali')
      .select('*')
      .order('naziv')
    
    if (!error && data) {
      setMaterijali(data)
    }
  }
  
  // Kalkulacija
  const izracunaj = () => {
    let ukupno = 0
    
    // Materijali
    const sirina = parseFloat(idealnaSerinaMaterijala) || 0
    const metraza = parseFloat(metrazaPunog) || 0
    
    // Materijal 1
    if (mat1.tezina && mat1.cena) {
      const kg = (sirina * metraza * parseFloat(mat1.tezina)) / 1000000
      ukupno += kg * parseFloat(mat1.cena)
    }
    
    // Materijal 2
    if (mat2.tezina && mat2.cena) {
      const kg = (sirina * metraza * parseFloat(mat2.tezina)) / 1000000
      ukupno += kg * parseFloat(mat2.cena)
    }
    
    // Materijal 3
    if (mat3.tezina && mat3.cena) {
      const kg = (sirina * metraza * parseFloat(mat3.tezina)) / 1000000
      ukupno += kg * parseFloat(mat3.cena)
    }
    
    // Materijal 4
    if (mat4.tezina && mat4.cena) {
      const kg = (sirina * metraza * parseFloat(mat4.tezina)) / 1000000
      ukupno += kg * parseFloat(mat4.cena)
    }
    
    // Kaširanje
    if (imaKasiranje && cenaKasiranjaM2) {
      const vrednost = (brojProlazaKasiranja * parseFloat(cenaKasiranjaM2) * sirina * metraza) / 1000000
      ukupno += vrednost
    }
    
    // Lepak
    if (imaKasiranje) {
      const utrosa = parseFloat(utrosakLepka) || 0.36
      const cenaLepka = 5 // default cena
      ukupno += utrosa * brojProlazaKasiranja * cenaLepka
    }
    
    // Lak
    if (imaLakiranje) {
      const utrosakLaka = 0.216
      const cenaLaka = 8 // default
      ukupno += utrosakLaka * brojProlazaLaka * cenaLaka
    }
    
    // Transport i pakovanje
    ukupno += 0.2
    
    setOsnovnaCena(ukupno)
    
    // Sa škartom
    const skart = parseFloat(skartProcenat) || 0
    const saSkartom = ukupno * (1 + skart)
    setCenaSaSkartom(saSkartom)
    
    // Konačna cena sa maržom
    const marzaVal = parseFloat(marza) || 0
    const konacna = saSkartom * (1 + marzaVal)
    setKonacnaCena(konacna)
  }
  
  useEffect(() => {
    izracunaj()
  }, [
    mat1, mat2, mat3, mat4,
    idealnaSerinaMaterijala, metrazaPunog,
    imaKasiranje, brojProlazaKasiranja, cenaKasiranjaM2,
    imaLakiranje, brojProlazaLaka,
    skartProcenat, marza
  ])
  
  // Sačuvaj kalkulaciju
  const sacuvaj = async () => {
    if (!naziv || !kupac) {
      setPoruka('Unesite naziv i kupca!')
      return
    }
    
    setLoading(true)
    
    const parametri = {
      // Osnovno
      sirina_mm: sirinaMM,
      duzina_mm: duzinaMM,
      idealna_sirina_materijala: idealnaSerinaMaterijala,
      
      // Materijali
      materijali: [mat1, mat2, mat3, mat4].filter(m => m.naziv),
      
      // Kaširanje
      kasiranje: {
        ima: imaKasiranje,
        broj_prolaza: brojProlazaKasiranja,
        cena_m2: cenaKasiranjaM2
      },
      
      // Štampa
      stampa: {
        ima: imaStampu,
        broj_boja: brojBoja,
        stran_stampe: stranStampe,
        obim_valjka: obimValjka,
        klise: klise,
        masina: stamparskaMasina,
        stamparija: stamparija
      },
      
      // Lakiranje
      lakiranje: {
        ima: imaLakiranje,
        broj_prolaza: brojProlazaLaka
      },
      
      // Lepak
      lepak: {
        tip: tipLepka,
        odnos: odnosKomponenti,
        nanos: nanosLepka,
        utrosak: utrosakLepka
      },
      
      // Rezanje
      rezanje: {
        broj_traka: brojTraka,
        sirina_trake: sirinaTrake,
        smer_odmotavanja: smerOdmotavanja
      },
      
      // Rolna
      rolna: {
        duzina: duzinaRolne,
        precnik: precnikRolne,
        precnik_hilzne: precnikHilzne
      },
      
      // Perforacija
      perforacija: {
        ima: imaPerforaciju,
        oblik: oblikPerforacije,
        orijentacija: orijentacijaPerforacije
      },
      
      // Količina
      metraza_punog: metrazaPunog,
      skart_procenat: skartProcenat,
      marza: marza
    }
    
    const rezultati = {
      osnovna_cena: osnovnaCena,
      cena_sa_skartom: cenaSaSkartom,
      konacna_cena: konacnaCena
    }
    
    const { data, error } = await supabase
      .from('kalkulacije')
      .insert([{
        tip: 'folija',
        naziv: naziv,
        kupac: kupac,
        parametri: parametri,
        rezultati: rezultati,
        status: 'draft',
        created_by: user.id
      }])
      .select()
    
    setLoading(false)
    
    if (error) {
      setPoruka('Greška pri čuvanju: ' + error.message)
    } else {
      setPoruka('Kalkulacija sačuvana!')
      // Reset forme
      setTimeout(() => {
        setNaziv('')
        setKupac('')
        setPoruka('')
      }, 2000)
    }
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">🎞️ Kalkulator Folija</h1>
      
      {poruka && msg(poruka, poruka.includes('Greška') ? 'error' : 'success')}
      
      {/* Osnovni podaci */}
      {card(
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            {lbl('Naziv proizvoda *')}
            {inp(naziv, setNaziv, 'MPML Crux Magnezijum 3g')}
          </div>
          <div>
            {lbl('Kupac *')}
            {inp(kupac, setKupac, 'MEDOMIX')}
          </div>
        </div>,
        'Osnovni podaci'
      )}
      
      {/* Dimenzije */}
      {card(
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            {lbl('Širina proizvoda (mm)')}
            {inp(sirinaMM, setSirinaMM, '85', 'number')}
          </div>
          <div>
            {lbl('Dužina proizvoda (mm)')}
            {inp(duzinaMM, setDuzinaMM, '110', 'number')}
          </div>
          <div>
            {lbl('Idealna širina materijala (mm)')}
            {inp(idealnaSerinaMaterijala, setIdealnaSerinaMaterijala, '840', 'number')}
          </div>
        </div>,
        'Dimenzije'
      )}
      
      {/* Materijali - 4 sloja */}
      {card(
        <div className="space-y-6">
          {/* Sloj A */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold text-lg mb-3 text-blue-600">Sloj A (Materijal 1)</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                {lbl('Naziv materijala')}
                <select
                  value={mat1.naziv}
                  onChange={(e) => {
                    const m = materijali.find(x => x.naziv === e.target.value)
                    if (m) {
                      setMat1({
                        naziv: m.naziv,
                        debljina: m.debljina_mic,
                        tezina: m.specificna_tezina_g_m2,
                        cena: m.cena_po_kg
                      })
                    } else {
                      setMat1({ ...mat1, naziv: e.target.value })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Izaberi...</option>
                  {materijali.map(m => (
                    <option key={m.id} value={m.naziv}>{m.naziv}</option>
                  ))}
                </select>
              </div>
              <div>
                {lbl('Debljina (µ)')}
                {inp(mat1.debljina, (v) => setMat1({ ...mat1, debljina: v }), '70', 'number')}
              </div>
              <div>
                {lbl('Težina (g/m²)')}
                {inp(mat1.tezina, (v) => setMat1({ ...mat1, tezina: v }), '68.2', 'number')}
              </div>
              <div>
                {lbl('Cena (€/kg)')}
                {inp(mat1.cena, (v) => setMat1({ ...mat1, cena: v }), '2.5', 'number')}
              </div>
            </div>
          </div>
          
          {/* Sloj B */}
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-bold text-lg mb-3 text-green-600">Sloj B (Materijal 2)</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                {lbl('Naziv materijala')}
                <select
                  value={mat2.naziv}
                  onChange={(e) => {
                    const m = materijali.find(x => x.naziv === e.target.value)
                    if (m) {
                      setMat2({
                        naziv: m.naziv,
                        debljina: m.debljina_mic,
                        tezina: m.specificna_tezina_g_m2,
                        cena: m.cena_po_kg
                      })
                    } else {
                      setMat2({ ...mat2, naziv: e.target.value })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Izaberi...</option>
                  {materijali.map(m => (
                    <option key={m.id} value={m.naziv}>{m.naziv}</option>
                  ))}
                </select>
              </div>
              <div>
                {lbl('Debljina (µ)')}
                {inp(mat2.debljina, (v) => setMat2({ ...mat2, debljina: v }), '7', 'number')}
              </div>
              <div>
                {lbl('Težina (g/m²)')}
                {inp(mat2.tezina, (v) => setMat2({ ...mat2, tezina: v }), '18.97', 'number')}
              </div>
              <div>
                {lbl('Cena (€/kg)')}
                {inp(mat2.cena, (v) => setMat2({ ...mat2, cena: v }), '8.5', 'number')}
              </div>
            </div>
          </div>
          
          {/* Sloj C */}
          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-bold text-lg mb-3 text-purple-600">Sloj C (Materijal 3)</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                {lbl('Naziv materijala')}
                <select
                  value={mat3.naziv}
                  onChange={(e) => {
                    const m = materijali.find(x => x.naziv === e.target.value)
                    if (m) {
                      setMat3({
                        naziv: m.naziv,
                        debljina: m.debljina_mic,
                        tezina: m.specificna_tezina_g_m2,
                        cena: m.cena_po_kg
                      })
                    } else {
                      setMat3({ ...mat3, naziv: e.target.value })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Izaberi...</option>
                  {materijali.map(m => (
                    <option key={m.id} value={m.naziv}>{m.naziv}</option>
                  ))}
                </select>
              </div>
              <div>
                {lbl('Debljina (µ)')}
                {inp(mat3.debljina, (v) => setMat3({ ...mat3, debljina: v }), '30', 'number')}
              </div>
              <div>
                {lbl('Težina (g/m²)')}
                {inp(mat3.tezina, (v) => setMat3({ ...mat3, tezina: v }), '30', 'number')}
              </div>
              <div>
                {lbl('Cena (€/kg)')}
                {inp(mat3.cena, (v) => setMat3({ ...mat3, cena: v }), '2.6', 'number')}
              </div>
            </div>
          </div>
          
          {/* Sloj D */}
          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="font-bold text-lg mb-3 text-orange-600">Sloj D (Materijal 4) - Opciono</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                {lbl('Naziv materijala')}
                <select
                  value={mat4.naziv}
                  onChange={(e) => {
                    const m = materijali.find(x => x.naziv === e.target.value)
                    if (m) {
                      setMat4({
                        naziv: m.naziv,
                        debljina: m.debljina_mic,
                        tezina: m.specificna_tezina_g_m2,
                        cena: m.cena_po_kg
                      })
                    } else {
                      setMat4({ ...mat4, naziv: e.target.value })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Izaberi...</option>
                  {materijali.map(m => (
                    <option key={m.id} value={m.naziv}>{m.naziv}</option>
                  ))}
                </select>
              </div>
              <div>
                {lbl('Debljina (µ)')}
                {inp(mat4.debljina, (v) => setMat4({ ...mat4, debljina: v }), '', 'number')}
              </div>
              <div>
                {lbl('Težina (g/m²)')}
                {inp(mat4.tezina, (v) => setMat4({ ...mat4, tezina: v }), '', 'number')}
              </div>
              <div>
                {lbl('Cena (€/kg)')}
                {inp(mat4.cena, (v) => setMat4({ ...mat4, cena: v }), '', 'number')}
              </div>
            </div>
          </div>
        </div>,
        'Materijali - 4 Sloja'
      )}
      
      {/* Kaširanje */}
      {card(
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={imaKasiranje}
              onChange={(e) => setImaKasiranje(e.target.checked)}
              className="mr-2 h-4 w-4"
            />
            <label className="font-medium">Ima kaširanje</label>
          </div>
          
          {imaKasiranje && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
              <div>
                {lbl('Broj prolaza kaširanja')}
                {inp(brojProlazaKasiranja, setBrojProlazaKasiranja, '2', 'number')}
              </div>
              <div>
                {lbl('Cena kaširanja (€/m²)')}
                {inp(cenaKasiranjaM2, setCenaKasiranjaM2, '0.015', 'number')}
              </div>
              <div>
                {lbl('Tip lepka')}
                {inp(tipLepka, setTipLepka, 'SF724A 324CA')}
              </div>
              <div>
                {lbl('Odnos komponenti')}
                {inp(odnosKomponenti, setOdnosKomponenti, '100:60')}
              </div>
              <div>
                {lbl('Nanos lepka')}
                {inp(nanosLepka, setNanosLepka, '1.8', 'number')}
              </div>
              <div>
                {lbl('Utrošak lepka (kg)')}
                {inp(utrosakLepka, setUtrosakLepka, '0.36', 'number')}
              </div>
            </div>
          )}
        </div>,
        'Kaširanje'
      )}
      
      {/* Štampa */}
      {card(
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={imaStampu}
              onChange={(e) => setImaStampu(e.target.checked)}
              className="mr-2 h-4 w-4"
            />
            <label className="font-medium">Ima štampu</label>
          </div>
          
          {imaStampu && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded">
              <div>
                {lbl('Štamparija')}
                {inp(stamparija, setStamparija, 'Milinković')}
              </div>
              <div>
                {lbl('Štamparska mašina')}
                {inp(stamparskaMasina, setStamparskaMasina, 'UTECO ONYX')}
              </div>
              <div>
                {lbl('Broj boja')}
                {inp(brojBoja, setBrojBoja, '4+lak')}
              </div>
              <div>
                {lbl('Strana štampe')}
                <select
                  value={stranStampe}
                  onChange={(e) => setStranStampe(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SPOLJNA">Spoljna</option>
                  <option value="UNUTRASNJA">Unutrašnja</option>
                </select>
              </div>
              <div>
                {lbl('Obim valjka (mm)')}
                {inp(obimValjka, setObimValjka, '330', 'number')}
              </div>
              <div>
                {lbl('Klišei')}
                {inp(klise, setKlise, 'DPR 1,14 mm')}
              </div>
            </div>
          )}
        </div>,
        'Štampa'
      )}
      
      {/* Lakiranje */}
      {card(
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={imaLakiranje}
              onChange={(e) => setImaLakiranje(e.target.checked)}
              className="mr-2 h-4 w-4"
            />
            <label className="font-medium">Ima lakiranje</label>
          </div>
          
          {imaLakiranje && (
            <div className="bg-gray-50 p-4 rounded">
              {lbl('Broj prolaza laka')}
              {inp(brojProlazaLaka, setBrojProlazaLaka, '1', 'number')}
            </div>
          )}
        </div>,
        'Lakiranje'
      )}
      
      {/* Perforacija */}
      {card(
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={imaPerforaciju}
              onChange={(e) => setImaPerforaciju(e.target.checked)}
              className="mr-2 h-4 w-4"
            />
            <label className="font-medium">Ima perforaciju</label>
          </div>
          
          {imaPerforaciju && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
              <div>
                {lbl('Oblik perforacije')}
                {inp(oblikPerforacije, setOblikPerforacije, 'Kružna')}
              </div>
              <div>
                {lbl('Orijentacija')}
                {inp(orijentacijaPerforacije, setOrijentacijaPerforacije, 'Horizontalna')}
              </div>
            </div>
          )}
        </div>,
        'Perforacija'
      )}
      
      {/* Rezanje */}
      {card(
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            {lbl('Broj traka po širini')}
            {inp(brojTraka, setBrojTraka, '8', 'number')}
          </div>
          <div>
            {lbl('Širina trake (mm)')}
            {inp(sirinaTrake, setSirinaTrake, '85', 'number')}
          </div>
          <div>
            {lbl('Smer odmotavanja')}
            <select
              value={smerOdmotavanja}
              onChange={(e) => setSmerOdmotavanja(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Na noge">Na noge</option>
              <option value="Na glavu">Na glavu</option>
            </select>
          </div>
        </div>,
        'Rezanje'
      )}
      
      {/* Finalna rolna */}
      {card(
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            {lbl('Dužina rolne (m)')}
            {inp(duzinaRolne, setDuzinaRolne, '15000', 'number')}
          </div>
          <div>
            {lbl('Prečnik rolne (mm)')}
            {inp(precnikRolne, setPrecnikRolne, '400', 'number')}
          </div>
          <div>
            {lbl('Prečnik hilzne (mm)')}
            {inp(precnikHilzne, setPrecnikHilzne, '76', 'number')}
          </div>
        </div>,
        'Finalna Rolna'
      )}
      
      {/* Količina i cena */}
      {card(
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              {lbl('Metraža punog naloga (m)')}
              {inp(metrazaPunog, setMetrazaPunog, '15000', 'number')}
            </div>
            <div>
              {lbl('Škart (%)')}
              {inp(skartProcenat, setSkartProcenat, '0.10', 'number')}
            </div>
            <div>
              {lbl('Marža (%)')}
              {inp(marza, setMarza, '0.30', 'number')}
            </div>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
            <h3 className="text-xl font-bold mb-4 text-blue-800">Rezultati kalkulacije</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600 mb-1">Osnovna cena</p>
                <p className="text-2xl font-bold text-gray-800">{osnovnaCena.toFixed(2)} €</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Sa škartom</p>
                <p className="text-2xl font-bold text-orange-600">{cenaSaSkartom.toFixed(2)} €</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Konačna cena</p>
                <p className="text-3xl font-bold text-green-600">{konacnaCena.toFixed(2)} €</p>
              </div>
            </div>
          </div>
        </div>,
        'Količina i Cena'
      )}
      
      {/* Akcije */}
      <div className="flex gap-4">
        {btn('Sačuvaj kalkulaciju', sacuvaj, loading ? 'secondary' : 'success')}
        {btn('Resetuj', () => window.location.reload(), 'secondary')}
      </div>
    </div>
  )
}
