import { useState, useEffect } from 'react'
import { supabase } from '../../supabase.js'

export default function KalkulatorKesa({ user, card, btn, inp, lbl, msg }) {
  // Osnovni podaci
  const [naziv, setNaziv] = useState('')
  const [kupac, setKupac] = useState('')
  const [adresa, setAdresa] = useState('')
  
  // Dimenzije kese
  const [sirinaMM, setSirinaMM] = useState('')
  const [duzinaMM, setDuzinaMM] = useState('')
  const [preklop, setPreklop] = useState('50')
  const [falta, setFalta] = useState('50')
  
  // Materijal
  const [materijal, setMaterijal] = useState({ naziv: '', tezina: '', cena: '' })
  const [metraza, setMetraza] = useState('1000')
  
  // Štampa
  const [imaStampu, setImaStampu] = useState(false)
  const [kgMaterijalaStampa, setKgMaterijalaStampa] = useState('0.1')
  const [cenaStampeKg, setCenaStampeKg] = useState('1.2')
  
  // ADH traka
  const [imaADHTraku, setImaADHTraku] = useState(false)
  const [odsecakTrake, setOdsecakTrake] = useState('0.2')
  const [cenaTrake, setCenaTrake] = useState('1')
  
  // Bušenje rupa
  const [imaBusenje, setImaBusenje] = useState(false)
  const [cenaBusenja, setCenaBusenja] = useState('5')
  
  // Kosa klapna
  const [imaKosuKlapnu, setImaKosuKlapnu] = useState(false)
  const [cenaKlapne, setCenaKlapne] = useState('0')
  
  // Kontinentalni var
  const [imaVar, setImaVar] = useState(false)
  const [cenaVara, setCenaVara] = useState('1')
  
  // Ojačanje
  const [imaOjacanje, setImaOjacanje] = useState(false)
  const [dimenzija, setDimenzija] = useState('')
  const [sirinaOjacanja, setSirinaOjacanja] = useState('20')
  const [debljina, setDebljina] = useState('150')
  const [cenaOjacanja, setCenaOjacanja] = useState('4')
  
  // Transport i pakovanje
  const [cenaTransporta, setCenaTransporta] = useState('0.35')
  
  // Klišei
  const [brojKlisea, setBrojKlisea] = useState('5')
  const [cenaKlisea, setCenaKlisea] = useState('150')
  
  // Količina i cene
  const [kolicina, setKolicina] = useState('10000')
  const [skartProcenat, setSkartProcenat] = useState('0.1')
  const [marza, setMarza] = useState('0.3')
  
  // Rezultati
  const [tezinaZa1000, setTezinaZa1000] = useState(0)
  const [osnovnaCena, setOsnovnaCena] = useState(0)
  const [konacnaCena, setKonacnaCena] = useState(0)
  const [cenaPoKom, setCenaPoKom] = useState(0)
  const [vrednostNaloga, setVrednostNaloga] = useState(0)
  const [potrebnoMaterijalaKg, setPotrebnoMaterijalaKg] = useState(0)
  
  const [poruka, setPoruka] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Lista materijala
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
    const s = parseFloat(sirinaMM) || 0
    const d = parseFloat(duzinaMM) || 0
    const p = parseFloat(preklop) || 0
    const f = parseFloat(falta) || 0
    const tezina = parseFloat(materijal.tezina) || 0
    const cena = parseFloat(materijal.cena) || 0
    const m = parseFloat(metraza) || 1000
    
    if (!s || !d || !tezina || !cena) {
      return
    }
    
    // Težina za 1000 kom
    const tez = ((s + p) * 2 * (d + f)) * tezina * m / 1000000
    setTezinaZa1000(tez)
    
    // Sa škartom
    const skart = parseFloat(skartProcenat) || 0
    const kgSaSkartom = tez * (1 + skart)
    
    // Cena materijala
    let ukupno = kgSaSkartom * cena
    
    // Štampa
    if (imaStampu) {
      const kgStampa = parseFloat(kgMaterijalaStampa) || 0
      const cStampa = parseFloat(cenaStampeKg) || 0
      ukupno += kgStampa * cStampa
    }
    
    // ADH traka
    if (imaADHTraku) {
      const ods = parseFloat(odsecakTrake) || 0
      const cTraka = parseFloat(cenaTrake) || 0
      ukupno += ods * cTraka
    }
    
    // Bušenje
    if (imaBusenje) {
      ukupno += parseFloat(cenaBusenja) || 0
    }
    
    // Kosa klapna
    if (imaKosuKlapnu) {
      ukupno += parseFloat(cenaKlapne) || 0
    }
    
    // Var
    if (imaVar) {
      ukupno += parseFloat(cenaVara) || 0
    }
    
    // Ojačanje
    if (imaOjacanje) {
      const dim = parseFloat(dimenzija) || parseFloat(sirinaMM) || 0
      const sir = parseFloat(sirinaOjacanja) || 0
      const deb = parseFloat(debljina) || 0
      const cOjac = parseFloat(cenaOjacanja) || 0
      const ojacanje = (dim * sir * deb * cOjac) / 1000
      ukupno += ojacanje
    }
    
    // Transport
    const transport = tez * parseFloat(cenaTransporta) || 0
    ukupno += transport
    
    setOsnovnaCena(ukupno)
    
    // Marža
    const marzaVal = parseFloat(marza) || 0
    const konacna = ukupno * (1 + marzaVal)
    setKonacnaCena(konacna)
    
    // Cena po kom
    setCenaPoKom(konacna / 1000)
    
    // Vrednost naloga
    const kol = parseFloat(kolicina) || 0
    setVrednostNaloga((konacna / 1000) * kol)
    
    // Potrebno materijala
    setPotrebnoMaterijalaKg(kgSaSkartom * (kol / 1000))
  }
  
  useEffect(() => {
    izracunaj()
  }, [
    sirinaMM, duzinaMM, preklop, falta,
    materijal, metraza,
    imaStampu, kgMaterijalaStampa, cenaStampeKg,
    imaADHTraku, odsecakTrake, cenaTrake,
    imaBusenje, cenaBusenja,
    imaKosuKlapnu, cenaKlapne,
    imaVar, cenaVara,
    imaOjacanje, dimenzija, sirinaOjacanja, debljina, cenaOjacanja,
    cenaTransporta,
    kolicina, skartProcenat, marza
  ])
  
  // Sačuvaj
  const sacuvaj = async () => {
    if (!naziv || !kupac) {
      setPoruka('Unesite naziv i kupca!')
      return
    }
    
    setLoading(true)
    
    const parametri = {
      // Dimenzije
      sirina_mm: sirinaMM,
      duzina_mm: duzinaMM,
      preklop: preklop,
      falta: falta,
      
      // Materijal
      materijal: materijal,
      metraza: metraza,
      
      // Dodatne usluge
      stampa: { ima: imaStampu, kg: kgMaterijalaStampa, cena_kg: cenaStampeKg },
      adh_traka: { ima: imaADHTraku, odsecak: odsecakTrake, cena: cenaTrake },
      busenje: { ima: imaBusenje, cena: cenaBusenja },
      kosa_klapna: { ima: imaKosuKlapnu, cena: cenaKlapne },
      var: { ima: imaVar, cena: cenaVara },
      ojacanje: {
        ima: imaOjacanje,
        dimenzija: dimenzija,
        sirina: sirinaOjacanja,
        debljina: debljina,
        cena: cenaOjacanja
      },
      
      // Transport
      transport: cenaTransporta,
      
      // Klišei
      klisea: { broj: brojKlisea, cena: cenaKlisea },
      
      // Količina
      kolicina: kolicina,
      skart_procenat: skartProcenat,
      marza: marza
    }
    
    const rezultati = {
      tezina_za_1000: tezinaZa1000,
      osnovna_cena: osnovnaCena,
      konacna_cena: konacnaCena,
      cena_po_kom: cenaPoKom,
      vrednost_naloga: vrednostNaloga,
      potrebno_materijala_kg: potrebnoMaterijalaKg
    }
    
    const { data, error } = await supabase
      .from('kalkulacije')
      .insert([{
        tip: 'kesa',
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
      setPoruka('Greška: ' + error.message)
    } else {
      setPoruka('Kalkulacija sačuvana!')
      setTimeout(() => {
        setNaziv('')
        setKupac('')
        setPoruka('')
      }, 2000)
    }
  }
  
  // Kreiraj radni nalog iz kalkulacije - ne menja izgled, samo dodaje workflow
  const kreirajRadniNalog = async () => {
    if (!naziv || !kupac) {
      setPoruka('Unesite naziv i kupca!')
      return
    }

    setLoading(true)

    const parametri = {
      sirina_mm: sirinaMM,
      duzina_mm: duzinaMM,
      preklop: preklop,
      falta: falta,
      adresa: adresa,

      materijal: materijal,
      metraza: metraza,

      stampa: { ima: imaStampu, kg: kgMaterijalaStampa, cena_kg: cenaStampeKg },
      adh_traka: { ima: imaADHTraku, odsecak: odsecakTrake, cena: cenaTrake },
      busenje: { ima: imaBusenje, cena: cenaBusenja },
      kosa_klapna: { ima: imaKosuKlapnu, cena: cenaKlapne },
      var: { ima: imaVar, cena: cenaVara },
      ojacanje: {
        ima: imaOjacanje,
        dimenzija: dimenzija,
        sirina: sirinaOjacanja,
        debljina: debljina,
        cena: cenaOjacanja
      },

      transport: cenaTransporta,
      klisea: { broj: brojKlisea, cena: cenaKlisea },

      kolicina: kolicina,
      skart_procenat: skartProcenat,
      marza: marza
    }

    const rezultati = {
      tezina_za_1000: tezinaZa1000,
      osnovna_cena: osnovnaCena,
      konacna_cena: konacnaCena,
      cena_po_kom: cenaPoKom,
      vrednost_naloga: vrednostNaloga,
      potrebno_materijala_kg: potrebnoMaterijalaKg
    }

    try {
      const { generirajRadniNalogIzKalkulacije } = await import('../../generirajRadniNalog.js')

      const res = await generirajRadniNalogIzKalkulacije({
        tip: 'kesa',
        naziv,
        kupac,
        parametri,
        rezultati,
        created_by: user?.id || null
      })

      if (res.success) {
        setPoruka('Radni nalog kreiran: ' + res.brojNaloga)
      } else {
        setPoruka('Greška: ' + res.error)
      }
    } catch (e) {
      console.error(e)
      setPoruka('Greška pri kreiranju radnog naloga: ' + e.message)
    }

    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">🛍️ Kalkulator Kesa</h1>
      
      {poruka && msg(poruka, poruka.includes('Greška') ? 'error' : 'success')}
      
      {/* Osnovni podaci */}
      {card(
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            {lbl('Naziv proizvoda *')}
            {inp(naziv, setNaziv, 'AN2608521/5')}
          </div>
          <div>
            {lbl('Kupac *')}
            {inp(kupac, setKupac, 'Medomix doo')}
          </div>
          <div>
            {lbl('Adresa')}
            {inp(adresa, setAdresa, 'Kneza Milosa')}
          </div>
        </div>,
        'Osnovni podaci'
      )}
      
      {/* Dimenzije kese */}
      {card(
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            {lbl('Širina kese (mm)')}
            {inp(sirinaMM, setSirinaMM, '200', 'number')}
          </div>
          <div>
            {lbl('Dužina kese (mm)')}
            {inp(duzinaMM, setDuzinaMM, '400', 'number')}
          </div>
          <div>
            {lbl('Preklop (mm)')}
            {inp(preklop, setPreklop, '50', 'number')}
          </div>
          <div>
            {lbl('Falta (mm)')}
            {inp(falta, setFalta, '50', 'number')}
          </div>
        </div>,
        'Dimenzije Kese'
      )}
      
      {/* Materijal */}
      {card(
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            {lbl('Naziv materijala')}
            <select
              value={materijal.naziv}
              onChange={(e) => {
                const m = materijali.find(x => x.naziv === e.target.value)
                if (m) {
                  setMaterijal({
                    naziv: m.naziv,
                    tezina: m.specificna_tezina_g_m2,
                    cena: m.cena_po_kg
                  })
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
            {lbl('Težina (g/m²)')}
            {inp(materijal.tezina, (v) => setMaterijal({ ...materijal, tezina: v }), '27.3', 'number')}
          </div>
          <div>
            {lbl('Cena (€/kg)')}
            {inp(materijal.cena, (v) => setMaterijal({ ...materijal, cena: v }), '3', 'number')}
          </div>
          <div>
            {lbl('Metraža')}
            {inp(metraza, setMetraza, '1000', 'number')}
          </div>
        </div>,
        'Materijal'
      )}
      
      {/* Dodatne usluge */}
      {card(
        <div className="space-y-6">
          {/* Štampa */}
          <div className="bg-blue-50 p-4 rounded">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={imaStampu}
                onChange={(e) => setImaStampu(e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              <label className="font-medium text-blue-800">Štampa</label>
            </div>
            {imaStampu && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {lbl('Kg materijala za štampu')}
                  {inp(kgMaterijalaStampa, setKgMaterijalaStampa, '0.1', 'number')}
                </div>
                <div>
                  {lbl('Cena štampe (€/kg)')}
                  {inp(cenaStampeKg, setCenaStampeKg, '1.2', 'number')}
                </div>
              </div>
            )}
          </div>
          
          {/* ADH traka */}
          <div className="bg-green-50 p-4 rounded">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={imaADHTraku}
                onChange={(e) => setImaADHTraku(e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              <label className="font-medium text-green-800">ADH traka</label>
            </div>
            {imaADHTraku && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {lbl('Odsečak')}
                  {inp(odsecakTrake, setOdsecakTrake, '0.2', 'number')}
                </div>
                <div>
                  {lbl('Cena trake (€/1000 kom)')}
                  {inp(cenaTrake, setCenaTrake, '1', 'number')}
                </div>
              </div>
            )}
          </div>
          
          {/* Bušenje */}
          <div className="bg-purple-50 p-4 rounded">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={imaBusenje}
                onChange={(e) => setImaBusenje(e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              <label className="font-medium text-purple-800">Bušenje rupa</label>
            </div>
            {imaBusenje && (
              <div>
                {lbl('Cena (€/1000 kom)')}
                {inp(cenaBusenja, setCenaBusenja, '5', 'number')}
              </div>
            )}
          </div>
          
          {/* Kosa klapna */}
          <div className="bg-orange-50 p-4 rounded">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={imaKosuKlapnu}
                onChange={(e) => setImaKosuKlapnu(e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              <label className="font-medium text-orange-800">Kosa klapna</label>
            </div>
            {imaKosuKlapnu && (
              <div>
                {lbl('Cena (€/1000 kom)')}
                {inp(cenaKlapne, setCenaKlapne, '0', 'number')}
              </div>
            )}
          </div>
          
          {/* Var */}
          <div className="bg-red-50 p-4 rounded">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={imaVar}
                onChange={(e) => setImaVar(e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              <label className="font-medium text-red-800">Kontinentalni var</label>
            </div>
            {imaVar && (
              <div>
                {lbl('Cena (€/1000 kom)')}
                {inp(cenaVara, setCenaVara, '1', 'number')}
              </div>
            )}
          </div>
          
          {/* Ojačanje */}
          <div className="bg-indigo-50 p-4 rounded">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={imaOjacanje}
                onChange={(e) => setImaOjacanje(e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              <label className="font-medium text-indigo-800">Ojačanje za kesu</label>
            </div>
            {imaOjacanje && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  {lbl('Dimenzija kese (mm)')}
                  {inp(dimenzija, setDimenzija, sirinaMM, 'number')}
                </div>
                <div>
                  {lbl('Širina ojačanja (mm)')}
                  {inp(sirinaOjacanja, setSirinaOjacanja, '20', 'number')}
                </div>
                <div>
                  {lbl('Debljina ojačanja')}
                  {inp(debljina, setDebljina, '150', 'number')}
                </div>
                <div>
                  {lbl('Cena ojačanja (€/kg)')}
                  {inp(cenaOjacanja, setCenaOjacanja, '4', 'number')}
                </div>
              </div>
            )}
          </div>
        </div>,
        'Dodatne usluge'
      )}
      
      {/* Transport i pakovanje */}
      {card(
        <div>
          {lbl('Cena transporta i pakovanja')}
          {inp(cenaTransporta, setCenaTransporta, '0.35', 'number')}
        </div>,
        'Transport i pakovanje'
      )}
      
      {/* Klišei */}
      {card(
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            {lbl('Broj klišea')}
            {inp(brojKlisea, setBrojKlisea, '5', 'number')}
          </div>
          <div>
            {lbl('Cena jednog klišea (€)')}
            {inp(cenaKlisea, setCenaKlisea, '150', 'number')}
          </div>
          <div className="md:col-span-2 bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600">
              Ukupno klišea: <span className="font-bold">{(parseFloat(brojKlisea) * parseFloat(cenaKlisea)).toFixed(2)} €</span>
            </p>
          </div>
        </div>,
        'Klišei'
      )}
      
      {/* Količina i cena */}
      {card(
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              {lbl('Količina kesa (kom)')}
              {inp(kolicina, setKolicina, '10000', 'number')}
            </div>
            <div>
              {lbl('Škart (%)')}
              {inp(skartProcenat, setSkartProcenat, '0.1', 'number')}
            </div>
            <div>
              {lbl('Marža (%)')}
              {inp(marza, setMarza, '0.3', 'number')}
            </div>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-bold mb-4 text-green-800">Rezultati kalkulacije</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded">
                <p className="text-xs text-gray-600 mb-1">Težina za 1000 kom</p>
                <p className="text-lg font-bold text-gray-800">{tezinaZa1000.toFixed(2)} kg</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-xs text-gray-600 mb-1">Osnovna cena/1000</p>
                <p className="text-lg font-bold text-blue-600">{osnovnaCena.toFixed(2)} €</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-xs text-gray-600 mb-1">Konačna cena/1000</p>
                <p className="text-lg font-bold text-green-600">{konacnaCena.toFixed(2)} €</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-xs text-gray-600 mb-1">Cena po kom</p>
                <p className="text-lg font-bold text-purple-600">{cenaPoKom.toFixed(4)} €</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-xs text-gray-600 mb-1">Vrednost naloga</p>
                <p className="text-lg font-bold text-orange-600">{vrednostNaloga.toFixed(2)} €</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-xs text-gray-600 mb-1">Potrebno materijala</p>
                <p className="text-lg font-bold text-red-600">{potrebnoMaterijalaKg.toFixed(2)} kg</p>
              </div>
            </div>
          </div>
        </div>,
        'Količina i Cena'
      )}
      
      {/* Akcije */}
      <div className="flex gap-4">
        {btn('Sačuvaj kalkulaciju', sacuvaj, loading ? 'secondary' : 'success')}
        {btn('🚀 Kreiraj radni nalog', kreirajRadniNalog, loading ? 'secondary' : 'primary')}
        {btn('Resetuj', () => window.location.reload(), 'secondary')}
      </div>
    </div>
  )
}
