// NoviNalogIzBaze.jsx - UPGRADED SA DROPDOWN SELEKCIJOM
import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

export default function NoviNalogIzBaze({user, db, msg, setPage, inp, card, lbl}) {
  const [selectedProizvodId, setSelectedProizvodId] = useState("");
  const [selectedProizvod, setSelectedProizvod] = useState(null);
  const [kolicina, setKolicina] = useState("");
  const [napomena, setNapomena] = useState("");
  const [loading, setLoading] = useState(false);

  // Učitaj proizvod kad se selektuje iz dropdown-a
  useEffect(function(){
    if(!selectedProizvodId) {
      setSelectedProizvod(null);
      return;
    }
    
    var proizvod = db.proizvodi.find(function(p){ return p.id === +selectedProizvodId; });
    if(proizvod) {
      setSelectedProizvod(proizvod);
      // Auto-popuni količinu ako postoji
      if(proizvod.nal) {
        setKolicina((proizvod.nal * 1000).toString());
      }
    }
  }, [selectedProizvodId, db.proizvodi]);

  async function kreirajNalog() {
    if(!selectedProizvod) {
      msg("Izaberi proizvod!","err");
      return;
    }
    
    if(!kolicina || +kolicina <= 0) {
      msg("Unesi količinu!","err");
      return;
    }

    setLoading(true);
    
    try {
      var brN = "MP-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 9000) + 1000);
      
      var nalog = {
        ponBr: brN,
        kupac: selectedProizvod.kupac || "Nepoznat",
        prod: selectedProizvod.naziv,
        naziv: "Nalog za " + selectedProizvod.naziv,
        tip: selectedProizvod.tip,
        kol: +kolicina,
        datum: new Date().toLocaleDateString("sr-RS"),
        status: "Ceka",
        ko: user ? user.ime : "sistem",
        nap: napomena,
        mats: selectedProizvod.mats || [],
        res: selectedProizvod.res || {},
        ik: "box",
        boj: "#1d4ed8"
      };
      
      var r = await supabase.from("nalozi").insert([nalog]);
      if (r.error) throw r.error;
      
      msg("✅ Nalog " + brN + " kreiran!");
      
      // Reset forme
      setSelectedProizvodId("");
      setSelectedProizvod(null);
      setKolicina("");
      setNapomena("");
      
      // Vrati se na naloge
      setTimeout(function(){
        setPage("nalozi");
      }, 1500);
      
    } catch(e) {
      msg("Greška: " + e.message, "err");
    }
    
    setLoading(false);
  }

  // Grupiši proizvode po tipu
  var poTipu = {
    folija: db.proizvodi.filter(function(p){ return p.tip === "folija" && p.status === "Aktivan"; }),
    kesa: db.proizvodi.filter(function(p){ return p.tip === "kesa" && p.status === "Aktivan"; }),
    spulna: db.proizvodi.filter(function(p){ return p.tip === "spulna" && p.status === "Aktivan"; })
  };

  var TIP_IKONE = {
    folija: "📄",
    kesa: "🛍️",
    spulna: "🎞️"
  };

  var TIP_BOJA = {
    folija: "#1d4ed8",
    kesa: "#059669",
    spulna: "#7c3aed"
  };

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
        <h2 style={{margin:0,fontSize:20,fontWeight:800}}>⚡ Kreiraj nalog iz baze</h2>
        <button
          onClick={function(){ setPage("nalozi"); }}
          style={{
            padding:"8px 16px",
            borderRadius:8,
            border:"1px solid #e2e8f0",
            background:"#fff",
            color:"#64748b",
            fontWeight:700,
            fontSize:13,
            cursor:"pointer"
          }}
        >
          ← Nazad na naloge
        </button>
      </div>

      <div style={Object.assign({}, card, {marginBottom:16})}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:12,color:"#1d4ed8"}}>
          📦 Izaberi proizvod iz baze
        </div>
        
        <div style={{marginBottom:14}}>
          <label style={lbl}>Proizvod *</label>
          <select
            style={Object.assign({}, inp, {fontSize:14,fontWeight:600})}
            value={selectedProizvodId}
            onChange={function(e){ setSelectedProizvodId(e.target.value); }}
          >
            <option value="">-- Izaberi proizvod --</option>
            
            {poTipu.folija.length > 0 && (
              <optgroup label="📄 FOLIJE">
                {poTipu.folija.map(function(p){
                  return (
                    <option key={p.id} value={p.id}>
                      {p.naziv} {p.kupac ? "(" + p.kupac + ")" : ""}
                    </option>
                  );
                })}
              </optgroup>
            )}
            
            {poTipu.kesa.length > 0 && (
              <optgroup label="🛍️ KESE">
                {poTipu.kesa.map(function(p){
                  return (
                    <option key={p.id} value={p.id}>
                      {p.naziv} {p.kupac ? "(" + p.kupac + ")" : ""}
                    </option>
                  );
                })}
              </optgroup>
            )}
            
            {poTipu.spulna.length > 0 && (
              <optgroup label="🎞️ ŠPULNE">
                {poTipu.spulna.map(function(p){
                  return (
                    <option key={p.id} value={p.id}>
                      {p.naziv} {p.kupac ? "(" + p.kupac + ")" : ""}
                    </option>
                  );
                })}
              </optgroup>
            )}
          </select>
        </div>

        {selectedProizvod && (
          <div style={{
            background: (TIP_BOJA[selectedProizvod.tip] || "#64748b") + "10",
            border: "2px solid " + (TIP_BOJA[selectedProizvod.tip] || "#64748b") + "40",
            borderRadius:10,
            padding:16,
            marginBottom:16
          }}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <span style={{fontSize:28}}>{TIP_IKONE[selectedProizvod.tip]}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:18,fontWeight:800,color:TIP_BOJA[selectedProizvod.tip]}}>
                  {selectedProizvod.naziv}
                </div>
                <div style={{fontSize:12,color:"#64748b",marginTop:2}}>
                  {selectedProizvod.kupac && <span>Kupac: <b>{selectedProizvod.kupac}</b> · </span>}
                  Tip: <b>{selectedProizvod.tip}</b>
                </div>
              </div>
            </div>

            {/* Prikaz detalja proizvoda */}
            {selectedProizvod.mats && selectedProizvod.mats.length > 0 && (
              <div style={{
                background:"#fff",
                borderRadius:8,
                padding:12,
                marginBottom:12
              }}>
                <div style={{fontSize:11,fontWeight:700,color:"#64748b",marginBottom:8,textTransform:"uppercase"}}>
                  Materijali:
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {selectedProizvod.mats.filter(function(m){ return m.tip; }).map(function(m, i){
                    return (
                      <span key={i} style={{
                        background: (TIP_BOJA[selectedProizvod.tip] || "#64748b") + "20",
                        color: TIP_BOJA[selectedProizvod.tip] || "#64748b",
                        padding:"4px 10px",
                        borderRadius:6,
                        fontSize:11,
                        fontWeight:700
                      }}>
                        {m.tip} {m.deb}µ
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cena ako postoji */}
            {selectedProizvod.res && selectedProizvod.res.k1 && (
              <div style={{
                background:"#fff",
                borderRadius:8,
                padding:12
              }}>
                <div style={{fontSize:11,fontWeight:700,color:"#64748b",marginBottom:4,textTransform:"uppercase"}}>
                  Kalkulisana cena:
                </div>
                <div style={{fontSize:20,fontWeight:900,color:TIP_BOJA[selectedProizvod.tip]}}>
                  {(+selectedProizvod.res.k1).toFixed(2).replace(".",",")} € / 1000{selectedProizvod.tip === "kesa" ? " kom" : " m"}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
          <div>
            <label style={lbl}>Količina *</label>
            <input
              type="number"
              style={Object.assign({}, inp, {fontSize:16,fontWeight:700})}
              value={kolicina}
              onChange={function(e){ setKolicina(e.target.value); }}
              placeholder={selectedProizvod && selectedProizvod.tip === "kesa" ? "Broj komada" : "Broj metara"}
            />
            {selectedProizvod && (
              <div style={{fontSize:11,color:"#64748b",marginTop:4}}>
                {selectedProizvod.tip === "kesa" ? "Komada" : "Metara"}
              </div>
            )}
          </div>
          
          <div>
            <label style={lbl}>Napomena</label>
            <input
              style={inp}
              value={napomena}
              onChange={function(e){ setNapomena(e.target.value); }}
              placeholder="Opciona napomena..."
            />
          </div>
        </div>

        <button
          onClick={kreirajNalog}
          disabled={loading || !selectedProizvod || !kolicina}
          style={{
            width:"100%",
            padding:16,
            borderRadius:10,
            border:"none",
            background: loading || !selectedProizvod || !kolicina ? "#cbd5e1" : "#1d4ed8",
            color:"#fff",
            fontWeight:800,
            fontSize:16,
            cursor: loading || !selectedProizvod || !kolicina ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "⏳ Kreiram nalog..." : "⚡ Kreiraj radni nalog"}
        </button>
      </div>

      {/* Statistika baze */}
      <div style={Object.assign({}, card, {background:"#f8fafc"})}>
        <div style={{fontSize:13,fontWeight:700,marginBottom:12,color:"#64748b"}}>
          📊 Dostupni proizvodi u bazi
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[
            {tip:"folija", broj:poTipu.folija.length, boja:"#1d4ed8", ikona:"📄"},
            {tip:"kesa", broj:poTipu.kesa.length, boja:"#059669", ikona:"🛍️"},
            {tip:"spulna", broj:poTipu.spulna.length, boja:"#7c3aed", ikona:"🎞️"}
          ].map(function(t){
            return (
              <div key={t.tip} style={{
                background:t.boja+"10",
                border:"1px solid " + t.boja + "30",
                borderRadius:8,
                padding:"12px 14px",
                textAlign:"center"
              }}>
                <div style={{fontSize:24,marginBottom:4}}>{t.ikona}</div>
                <div style={{fontSize:20,fontWeight:900,color:t.boja,marginBottom:2}}>
                  {t.broj}
                </div>
                <div style={{fontSize:11,color:"#64748b",textTransform:"capitalize"}}>
                  {t.tip}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
