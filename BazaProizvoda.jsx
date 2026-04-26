// BazaProizvoda.jsx - Pregled i upravljanje bazom proizvoda
import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

function fmt(n) { return (n||0).toLocaleString("sr-RS"); }

export default function BazaProizvoda({ card, inp, lbl, msg }) {
  const [proizvodi, setProizvodi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("svi"); // 'svi', 'folija', 'kesa', 'spulna'
  const [search, setSearch] = useState("");

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
        <div style={{fontSize:24,fontWeight:900,marginBottom:4}}>📦 Baza Proizvoda</div>
        <div style={{fontSize:14,opacity:0.9}}>
          Ukupno: {proizvodi.length} proizvoda | 
          Folija: {poTipu.folija.length} | 
          Kese: {poTipu.kesa.length} | 
          Špulne: {poTipu.spulna.length}
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
                {p.tip === "folija" && (
                  <div style={{fontSize:13,color:"#334155"}}>
                    <b>Materijal:</b> {p.folija_materijal} {p.folija_debljina}µ · 
                    <b> Širina:</b> {p.folija_sirina}mm · 
                    <b> Dužina:</b> {fmt(p.folija_duzina)}m
                    {p.folija_boja && <> · <b>Boja:</b> {p.folija_boja}</>}
                  </div>
                )}

                {p.tip === "kesa" && (
                  <div style={{fontSize:13,color:"#334155"}}>
                    <b>Materijal:</b> {p.kesa_materijal} · 
                    <b> Dim:</b> {p.kesa_sirina}x{p.kesa_duzina}mm · 
                    {p.kesa_klapna > 0 && <><b> Klapna:</b> {p.kesa_klapna}mm · </>}
                    <b> Takt:</b> {p.kesa_takt}/min
                  </div>
                )}

                {p.tip === "spulna" && (
                  <div style={{fontSize:13,color:"#334155"}}>
                    <b>Materijal:</b> {p.spulna_materijal} · 
                    <b> Širina:</b> {p.spulna_sirina}mm · 
                    <b> Dužina:</b> {fmt(p.spulna_duzina)}m
                  </div>
                )}

                {p.napomena && (
                  <div style={{
                    marginTop:8,
                    padding:"8px 10px",
                    background:"#fff",
                    borderRadius:6,
                    fontSize:12,
                    color:"#64748b"
                  }}>
                    💭 {p.napomena}
                  </div>
                )}

                {/* Akcije */}
                <div style={{display:"flex",gap:8,marginTop:12}}>
                  <button
                    onClick={function(){ window.alert("TODO: Kreiranje naloga iz proizvoda - dodaj u sledećoj fazi!"); }}
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
                    onClick={function(){ window.alert("TODO: Izmena proizvoda - dodaj u sledećoj fazi!"); }}
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
    </div>
  );
}
