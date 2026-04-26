// BazaProizvoda.jsx - NOVO - sa kreiranje naloga, izmenom i dodavanjem proizvoda
import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

function fmt(n) { return (n||0).toLocaleString("sr-RS"); }

export default function BazaProizvoda({ card, inp, lbl, msg, user }) {
  const [proizvodi, setProizvodi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("svi"); // 'svi', 'folija', 'kesa', 'spulna'
  const [search, setSearch] = useState("");
  
  // Modali
  const [kreirajNalogModal, setKreirajNalogModal] = useState(null);
  const [izmeniModal, setIzmeniModal] = useState(null);
  const [noviProizvodModal, setNoviProizvodModal] = useState(false);

  useEffect(function() {
    ucitajProizvode();
  }, []);

  async function ucitajProizvode() {
    setLoading(true);
    try {
      var res = await supabase
        .from("proizvodi")
        .select("*")
        .eq("status", "Aktivan")
        .order("created_at", { ascending: false });
      
      if (res.error) throw res.error;
      setProizvodi(res.data || []);
    } catch(e) {
      if (msg) msg("Greška: " + e.message, "err");
    }
    setLoading(false);
  }

  async function arhivirajProizvod(id) {
    if (!confirm("Da li si siguran da želiš da arhiviraš ovaj proizvod?")) return;
    
    try {
      var res = await supabase
        .from("proizvodi")
        .update({ status: "Arhiviran" })
        .eq("id", id);
      
      if (res.error) throw res.error;
      if (msg) msg("✅ Proizvod arhiviran!");
      ucitajProizvode();
    } catch(e) {
      if (msg) msg("Greška: " + e.message, "err");
    }
  }

  async function kreirajNalog(proizvod) {
    try {
      var brN = "MP-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 9000) + 1000);
      
      var nalog = {
        ponBr: brN,
        kupac: proizvod.kupac || "Nepoznat",
        prod: proizvod.naziv,
        naziv: "Nalog za " + proizvod.naziv,
        tip: proizvod.tip,
        kol: proizvod.nal ? proizvod.nal * 1000 : 1000,
        datum: new Date().toLocaleDateString("sr-RS"),
        status: "Ceka",
        ko: user ? user.ime : "sistem",
        mats: proizvod.mats || [],
        res: proizvod.res || {},
        ik: "box",
        boj: "#1d4ed8"
      };
      
      var r = await supabase.from("nalozi").insert([nalog]);
      if (r.error) throw r.error;
      
      if (msg) msg("✅ Nalog " + brN + " kreiran!");
      setKreirajNalogModal(null);
    } catch(e) {
      if (msg) msg("Greška: " + e.message, "err");
    }
  }

  async function sacuvajIzmene(id, izmenjeniProizvod) {
    try {
      var res = await supabase
        .from("proizvodi")
        .update(izmenjeniProizvod)
        .eq("id", id);
      
      if (res.error) throw res.error;
      if (msg) msg("✅ Proizvod ažuriran!");
      setIzmeniModal(null);
      ucitajProizvode();
    } catch(e) {
      if (msg) msg("Greška: " + e.message, "err");
    }
  }

  async function dodajNoviProizvod(noviProizvod) {
    try {
      var p = Object.assign({}, noviProizvod, {
        status: "Aktivan",
        datum: new Date().toLocaleDateString("sr-RS"),
        ko: user ? user.ime : "sistem"
      });
      
      var res = await supabase.from("proizvodi").insert([p]);
      if (res.error) throw res.error;
      
      if (msg) msg("✅ Proizvod dodat!");
      setNoviProizvodModal(false);
      ucitajProizvode();
    } catch(e) {
      if (msg) msg("Greška: " + e.message, "err");
    }
  }

  // Filtriraj proizvode
  var filtrirano = proizvodi.filter(function(p) {
    var matchFilter = filter === "svi" || p.tip === filter;
    var matchSearch = !search || 
      (p.naziv && p.naziv.toLowerCase().includes(search.toLowerCase())) ||
      (p.kupac && p.kupac.toLowerCase().includes(search.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  // Grupiši po tipu
  var poTipu = {
    folija: filtrirano.filter(function(p) { return p.tip === "folija"; }),
    kesa: filtrirano.filter(function(p) { return p.tip === "kesa"; }),
    spulna: filtrirano.filter(function(p) { return p.tip === "spulna"; })
  };

  return (
    <div>
      {/* Header */}
      <div style={Object.assign({}, card, {
        marginBottom: 16,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#fff"
      })}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:24,fontWeight:900,marginBottom:4}}>📦 Baza Proizvoda</div>
            <div style={{fontSize:14,opacity:0.9}}>
              Ukupno: {proizvodi.length} | 
              Folija: {poTipu.folija.length} | 
              Kese: {poTipu.kesa.length} | 
              Špulne: {poTipu.spulna.length}
            </div>
          </div>
          <button
            onClick={function(){ setNoviProizvodModal(true); }}
            style={{
              padding:"10px 20px",
              borderRadius:8,
              border:"none",
              background:"#fff",
              color:"#667eea",
              fontWeight:800,
              cursor:"pointer",
              fontSize:14
            }}
          >
            + Novi proizvod
          </button>
        </div>
      </div>

      {/* Filter i Search */}
      <div style={Object.assign({}, card, {marginBottom:16})}>
        <div style={{display:"flex",gap:12,marginBottom:12,flexWrap:"wrap"}}>
          {["svi", "folija", "kesa", "spulna"].map(function(tip) {
            var aktivna = filter === tip;
            return (
              <button
                key={tip}
                onClick={function(){ setFilter(tip); }}
                style={{
                  padding:"8px 16px",
                  borderRadius:8,
                  border: aktivna ? "2px solid #1d4ed8" : "1px solid #e2e8f0",
                  background: aktivna ? "#eff6ff" : "#fff",
                  color: aktivna ? "#1d4ed8" : "#64748b",
                  fontWeight: aktivna ? 800 : 600,
                  cursor:"pointer",
                  fontSize:13
                }}
              >
                {tip === "svi" ? "Svi" : tip.charAt(0).toUpperCase() + tip.slice(1)}
              </button>
            );
          })}
        </div>

        <div style={{display:"flex",gap:8}}>
          <input
            type="text"
            placeholder="Pretraži po nazivu, kupcu ili SKU..."
            value={search}
            onChange={function(e){ setSearch(e.target.value); }}
            style={Object.assign({}, inp, {flex:1})}
          />
          <button
            onClick={ucitajProizvode}
            style={{
              padding:"10px 16px",
              borderRadius:8,
              border:"none",
              background:"#1d4ed8",
              color:"#fff",
              fontWeight:800,
              cursor:"pointer"
            }}
          >
            🔄 Osveži
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={Object.assign({}, card, {textAlign:"center",padding:40})}>
          <div style={{fontSize:48,marginBottom:16}}>⏳</div>
          <div style={{fontSize:16,fontWeight:700,color:"#1d4ed8"}}>Učitavam proizvode...</div>
        </div>
      )}

      {/* Lista proizvoda */}
      {!loading && filtrirano.length === 0 && (
        <div style={Object.assign({}, card, {textAlign:"center",padding:40})}>
          <div style={{fontSize:48,marginBottom:16}}>📦</div>
          <div style={{fontSize:16,fontWeight:700,color:"#64748b"}}>
            {search ? "Nema rezultata za pretragu" : "Nema proizvoda"}
          </div>
        </div>
      )}

      {!loading && filtrirano.length > 0 && (
        <div style={{display:"grid",gap:16}}>
          {filtrirano.map(function(p) {
            var ikonice = {
              folija: "📄",
              kesa: "🛍️",
              spulna: "🎞️"
            };

            var boje = {
              folija: {bg:"#eff6ff",border:"#bfdbfe",text:"#1e40af"},
              kesa: {bg:"#f0fdf4",border:"#bbf7d0",text:"#166534"},
              spulna: {bg:"#fef3c7",border:"#fde68a",text:"#854d0e"}
            };

            var bojaSema = boje[p.tip] || boje.folija;

            return (
              <div
                key={p.id}
                style={Object.assign({}, card, {
                  borderLeft:"4px solid " + bojaSema.border,
                  background:bojaSema.bg
                })}
              >
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:12}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:20,fontWeight:900,color:bojaSema.text,marginBottom:4}}>
                      {ikonice[p.tip]} {p.naziv}
                    </div>
                    <div style={{fontSize:13,color:"#64748b"}}>
                      {p.kupac && <span>Kupac: <b>{p.kupac}</b> · </span>}
                      {p.sku && <span>SKU: <b>{p.sku}</b> · </span>}
                      <span>Kreiran: {new Date(p.created_at).toLocaleDateString("sr-RS")}</span>
                    </div>
                  </div>
                  <div style={{
                    padding:"4px 12px",
                    borderRadius:999,
                    background:bojaSema.border,
                    color:bojaSema.text,
                    fontSize:11,
                    fontWeight:800
                  }}>
                    {p.tip.toUpperCase()}
                  </div>
                </div>

                {/* Detalji prema tipu */}
                {p.tip === "folija" && p.sir && (
                  <div style={{fontSize:13,color:"#334155",marginBottom:8}}>
                    <b>Širina:</b> {p.sir}mm
                    {p.met && <> · <b>Metara:</b> {fmt(p.met)}</>}
                  </div>
                )}

                {p.tip === "kesa" && (
                  <div style={{fontSize:13,color:"#334155",marginBottom:8}}>
                    {p.kesa_materijal && <><b>Materijal:</b> {p.kesa_materijal} · </>}
                    {p.kesa_sirina && p.kesa_duzina && <><b>Dim:</b> {p.kesa_sirina}x{p.kesa_duzina}mm · </>}
                    {p.kesa_klapna > 0 && <><b>Klapna:</b> {p.kesa_klapna}mm · </>}
                    {p.kesa_takt && <><b>Takt:</b> {p.kesa_takt}/min</>}
                  </div>
                )}

                {p.tip === "spulna" && (
                  <div style={{fontSize:13,color:"#334155",marginBottom:8}}>
                    {p.spulna_materijal && <><b>Materijal:</b> {p.spulna_materijal} · </>}
                    {p.spulna_sirina && <><b>Širina:</b> {p.spulna_sirina}mm</>}
                  </div>
                )}

                {/* Akcije */}
                <div style={{display:"flex",gap:8,marginTop:12}}>
                  <button
                    onClick={function(){ setKreirajNalogModal(p); }}
                    style={{
                      flex:1,
                      padding:"8px 12px",
                      borderRadius:6,
                      border:"none",
                      background:"#1d4ed8",
                      color:"#fff",
                      fontWeight:700,
                      fontSize:12,
                      cursor:"pointer"
                    }}
                  >
                    ⚡ Kreiraj Nalog
                  </button>
                  <button
                    onClick={function(){ setIzmeniModal(p); }}
                    style={{
                      padding:"8px 12px",
                      borderRadius:6,
                      border:"1px solid #e2e8f0",
                      background:"#fff",
                      color:"#64748b",
                      fontWeight:700,
                      fontSize:12,
                      cursor:"pointer"
                    }}
                  >
                    ✏️ Izmeni
                  </button>
                  <button
                    onClick={function(){ arhivirajProizvod(p.id); }}
                    style={{
                      padding:"8px 12px",
                      borderRadius:6,
                      border:"1px solid #fecaca",
                      background:"#fef2f2",
                      color:"#991b1b",
                      fontWeight:700,
                      fontSize:12,
                      cursor:"pointer"
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Kreiraj nalog */}
      {kreirajNalogModal && (
        <ModalKreirajNalog
          proizvod={kreirajNalogModal}
          onClose={function(){ setKreirajNalogModal(null); }}
          onCreate={kreirajNalog}
          inp={inp}
          lbl={lbl}
          card={card}
        />
      )}

      {/* MODAL: Izmeni proizvod */}
      {izmeniModal && (
        <ModalIzmeniProizvod
          proizvod={izmeniModal}
          onClose={function(){ setIzmeniModal(null); }}
          onSave={sacuvajIzmene}
          inp={inp}
          lbl={lbl}
          card={card}
        />
      )}

      {/* MODAL: Novi proizvod */}
      {noviProizvodModal && (
        <ModalNoviProizvod
          onClose={function(){ setNoviProizvodModal(false); }}
          onCreate={dodajNoviProizvod}
          inp={inp}
          lbl={lbl}
          card={card}
        />
      )}
    </div>
  );
}

// ========== MODAL KOMPONENTE ==========

function ModalKreirajNalog({ proizvod, onClose, onCreate, inp, lbl, card }) {
  return (
    <div style={{
      position:"fixed",
      top:0,left:0,right:0,bottom:0,
      background:"rgba(0,0,0,0.6)",
      zIndex:9999,
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      padding:20
    }}>
      <div style={Object.assign({}, card, {
        maxWidth:500,
        width:"100%"
      })}>
        <div style={{fontSize:20,fontWeight:800,marginBottom:16,color:"#1d4ed8"}}>
          ⚡ Kreiraj nalog iz proizvoda
        </div>
        
        <div style={{marginBottom:14}}>
          <div style={{fontSize:13,color:"#64748b",marginBottom:8}}>
            Proizvod: <b>{proizvod.naziv}</b>
          </div>
          <div style={{fontSize:13,color:"#64748b"}}>
            Tip: <b>{proizvod.tip}</b>
          </div>
        </div>

        <div style={{
          background:"#f8fafc",
          borderRadius:8,
          padding:12,
          marginBottom:16
        }}>
          <div style={{fontSize:12,color:"#64748b",marginBottom:4}}>
            ℹ️ Nalog će biti kreiran sa podacima iz ovog proizvoda
          </div>
        </div>

        <div style={{display:"flex",gap:10}}>
          <button
            onClick={onClose}
            style={{
              flex:1,
              padding:"10px",
              borderRadius:8,
              border:"1px solid #e2e8f0",
              background:"#fff",
              color:"#64748b",
              fontWeight:700,
              cursor:"pointer"
            }}
          >
            Otkaži
          </button>
          <button
            onClick={function(){ onCreate(proizvod); }}
            style={{
              flex:1,
              padding:"10px",
              borderRadius:8,
              border:"none",
              background:"#1d4ed8",
              color:"#fff",
              fontWeight:700,
              cursor:"pointer"
            }}
          >
            ✅ Kreiraj
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalIzmeniProizvod({ proizvod, onClose, onSave, inp, lbl, card }) {
  const [naziv, setNaziv] = useState(proizvod.naziv || "");
  const [kupac, setKupac] = useState(proizvod.kupac || "");
  const [sku, setSku] = useState(proizvod.sku || "");

  function sacuvaj() {
    var izmenjeni = Object.assign({}, proizvod, {
      naziv: naziv,
      kupac: kupac,
      sku: sku
    });
    onSave(proizvod.id, izmenjeni);
  }

  return (
    <div style={{
      position:"fixed",
      top:0,left:0,right:0,bottom:0,
      background:"rgba(0,0,0,0.6)",
      zIndex:9999,
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      padding:20
    }}>
      <div style={Object.assign({}, card, {
        maxWidth:500,
        width:"100%"
      })}>
        <div style={{fontSize:20,fontWeight:800,marginBottom:16,color:"#7c3aed"}}>
          ✏️ Izmeni proizvod
        </div>

        <div style={{marginBottom:12}}>
          <label style={lbl}>Naziv proizvoda *</label>
          <input
            style={inp}
            value={naziv}
            onChange={function(e){ setNaziv(e.target.value); }}
            placeholder="Naziv"
          />
        </div>

        <div style={{marginBottom:12}}>
          <label style={lbl}>Kupac</label>
          <input
            style={inp}
            value={kupac}
            onChange={function(e){ setKupac(e.target.value); }}
            placeholder="Naziv kupca"
          />
        </div>

        <div style={{marginBottom:16}}>
          <label style={lbl}>SKU</label>
          <input
            style={inp}
            value={sku}
            onChange={function(e){ setSku(e.target.value); }}
            placeholder="SKU kod"
          />
        </div>

        <div style={{display:"flex",gap:10}}>
          <button
            onClick={onClose}
            style={{
              flex:1,
              padding:"10px",
              borderRadius:8,
              border:"1px solid #e2e8f0",
              background:"#fff",
              color:"#64748b",
              fontWeight:700,
              cursor:"pointer"
            }}
          >
            Otkaži
          </button>
          <button
            onClick={sacuvaj}
            style={{
              flex:1,
              padding:"10px",
              borderRadius:8,
              border:"none",
              background:"#7c3aed",
              color:"#fff",
              fontWeight:700,
              cursor:"pointer"
            }}
          >
            💾 Sačuvaj
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalNoviProizvod({ onClose, onCreate, inp, lbl, card }) {
  const [tip, setTip] = useState("folija");
  const [naziv, setNaziv] = useState("");
  const [kupac, setKupac] = useState("");
  const [sku, setSku] = useState("");

  function kreiraj() {
    if (!naziv.trim()) {
      alert("Unesite naziv proizvoda!");
      return;
    }

    var noviProizvod = {
      tip: tip,
      naziv: naziv,
      kupac: kupac,
      sku: sku,
      mats: []
    };

    onCreate(noviProizvod);
  }

  return (
    <div style={{
      position:"fixed",
      top:0,left:0,right:0,bottom:0,
      background:"rgba(0,0,0,0.6)",
      zIndex:9999,
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      padding:20
    }}>
      <div style={Object.assign({}, card, {
        maxWidth:500,
        width:"100%"
      })}>
        <div style={{fontSize:20,fontWeight:800,marginBottom:16,color:"#059669"}}>
          + Novi proizvod
        </div>

        <div style={{marginBottom:12}}>
          <label style={lbl}>Tip proizvoda *</label>
          <select
            style={inp}
            value={tip}
            onChange={function(e){ setTip(e.target.value); }}
          >
            <option value="folija">📄 Folija</option>
            <option value="kesa">🛍️ Kesa</option>
            <option value="spulna">🎞️ Špulna</option>
          </select>
        </div>

        <div style={{marginBottom:12}}>
          <label style={lbl}>Naziv proizvoda *</label>
          <input
            style={inp}
            value={naziv}
            onChange={function(e){ setNaziv(e.target.value); }}
            placeholder="npr. BOPP folija 85mm"
          />
        </div>

        <div style={{marginBottom:12}}>
          <label style={lbl}>Kupac</label>
          <input
            style={inp}
            value={kupac}
            onChange={function(e){ setKupac(e.target.value); }}
            placeholder="Naziv kupca"
          />
        </div>

        <div style={{marginBottom:16}}>
          <label style={lbl}>SKU</label>
          <input
            style={inp}
            value={sku}
            onChange={function(e){ setSku(e.target.value); }}
            placeholder="SKU kod"
          />
        </div>

        <div style={{display:"flex",gap:10}}>
          <button
            onClick={onClose}
            style={{
              flex:1,
              padding:"10px",
              borderRadius:8,
              border:"1px solid #e2e8f0",
              background:"#fff",
              color:"#64748b",
              fontWeight:700,
              cursor:"pointer"
            }}
          >
            Otkaži
          </button>
          <button
            onClick={kreiraj}
            style={{
              flex:1,
              padding:"10px",
              borderRadius:8,
              border:"none",
              background:"#059669",
              color:"#fff",
              fontWeight:700,
              cursor:"pointer"
            }}
          >
            ✅ Dodaj proizvod
          </button>
        </div>
      </div>
    </div>
  );
}
