// AIpanel-MEGA.jsx - SUPER UNAPREĐEN AI ASISTENT
import { useState } from "react";
import { supabase } from "./supabase.js";

function n(v){ return Number(v||0); }
function fmt(v, suf){ return n(v).toLocaleString("sr-RS", {maximumFractionDigits: 1}) + (suf||""); }

export default function AIpanelMEGA({card}) {
  const [pitanje,setPitanje] = useState("");
  const [odgovor,setOdgovor] = useState("");
  const [loading,setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  async function pitajAI() {
    var q = pitanje.trim();
    if(!q) return;
    
    setLoading(true);
    setOdgovor("🤖 Analiziram pitanje...");
    
    try {
      var low = q.toLowerCase();
      var result = "";

      // ═══════════════════════════════════════════════════════════
      // 📦 MAGACIN UPITI
      // ═══════════════════════════════════════════════════════════
      
      if(low.includes("magacin") || low.includes("imam") || low.includes("stanje") || low.includes("roln")) {
        var r = await supabase.from("magacin").select("*").neq("status", "Iskorišćeno");
        if(r.error) throw r.error;
        var data = r.data || [];
        
        // Ekstraktuj parametre iz pitanja
        var materijal = "";
        var poznati = ["bopp", "cpp", "pet", "alu", "ldpe", "papir", "cc white", "fxc", "fxpu", "opp", "pa", "nativia"];
        for(var i=0;i<poznati.length;i++) if(low.includes(poznati[i])) materijal = poznati[i];
        
        var sirMatch = q.match(/(\d{3,4})\s*mm?/i);
        var sir = sirMatch ? parseInt(sirMatch[1]) : null;
        
        var filtrirane = data.filter(function(x){
          var ok = true;
          if(materijal) ok = ok && String(x.tip||"").toLowerCase().includes(materijal);
          if(sir) ok = ok && Math.abs(n(x.sirina) - sir) <= 25;
          return ok;
        });
        
        var kg = filtrirane.reduce(function(s,x){return s+n(x.kg_neto||x.kg||0);},0);
        var m = filtrirane.reduce(function(s,x){return s+n(x.metraza_ost||x.metraza||0);},0);
        var tipovi = Array.from(new Set(filtrirane.map(function(x){return x.tip;}).filter(Boolean))).slice(0,6).join(", ");
        
        result = "📦 MAGACIN STANJE:\n\n" +
          "Nađeno: " + filtrirane.length + " rolni\n" +
          "Ukupno: " + fmt(m, " m") + "\n" +
          "Kg neto: " + fmt(kg, " kg") + "\n" +
          (tipovi ? "Tipovi: " + tipovi : "");
      }
      
      // ═══════════════════════════════════════════════════════════
      // 💰 VREDNOST MAGACINA
      // ═══════════════════════════════════════════════════════════
      
      else if(low.includes("vrednost") || low.includes("koliko vredi") || low.includes("cena magacin")) {
        var rm = await supabase.from("magacin").select("*").neq("status", "Iskorišćeno");
        if(rm.error) throw rm.error;
        var mdata = rm.data || [];
        
        // Cene po tipu materijala (EUR/kg)
        var CENE = {
          "BOPP": 2.6, "OPP": 2.6, "CPP": 2.7, "PET": 3.1, 
          "LDPE": 2.4, "ALU": 8.5, "PAPIR": 1.9, "PA": 4.2,
          "FXC": 2.8, "FXPU": 2.9, "NATIVIA": 3.0,
          "CC White": 2.2
        };
        
        var ukupnaVrednost = 0;
        var poTipu = {};
        
        mdata.forEach(function(x) {
          var kg = n(x.kg_neto || x.kg || 0);
          var cenaKg = 2.8; // default
          
          // Pronađi cenu po tipu
          for(var tip in CENE) {
            if(String(x.tip||"").toUpperCase().includes(tip)) {
              cenaKg = CENE[tip];
              break;
            }
          }
          
          var vrednost = kg * cenaKg;
          ukupnaVrednost += vrednost;
          
          if(!poTipu[x.tip]) poTipu[x.tip] = {kg: 0, vrednost: 0};
          poTipu[x.tip].kg += kg;
          poTipu[x.tip].vrednost += vrednost;
        });
        
        var ukKg = mdata.reduce(function(s,x){return s+n(x.kg_neto||0);},0);
        
        result = "💰 VREDNOST MAGACINA:\n\n" +
          "Ukupno kg: " + fmt(ukKg, " kg") + "\n" +
          "Ukupna vrednost: " + fmt(ukupnaVrednost, " €") + "\n" +
          "Prosečna cena: " + (ukKg > 0 ? (ukupnaVrednost/ukKg).toFixed(2) : 0) + " €/kg\n\n" +
          "Po tipu materijala:\n" +
          Object.keys(poTipu).slice(0, 5).map(function(t) {
            return "• " + t + ": " + fmt(poTipu[t].vrednost, " €") + " (" + fmt(poTipu[t].kg, " kg") + ")";
          }).join("\n");
      }
      
      // ═══════════════════════════════════════════════════════════
      // 🏆 NAJVEĆA/NAJMANJA ROLNA
      // ═══════════════════════════════════════════════════════════
      
      else if(low.includes("najveć") || low.includes("najmanj")) {
        var rr = await supabase.from("magacin").select("*").neq("status", "Iskorišćeno");
        if(rr.error) throw rr.error;
        var rolls = rr.data || [];
        
        if(rolls.length === 0) {
          result = "Nema rolni u magacinu.";
        } else {
          // Sortiraj po metraži
          rolls.sort(function(a,b) {
            return n(b.metraza_ost||b.metraza) - n(a.metraza_ost||a.metraza);
          });
          
          var najveca = rolls[0];
          var najmanja = rolls[rolls.length - 1];
          
          result = "🏆 EKSTREMNE ROLNE:\n\n" +
            "Najveća rolna:\n" +
            "• " + najveca.br_rolne + " - " + najveca.tip + " " + najveca.sirina + "mm\n" +
            "• Metraža: " + fmt(n(najveca.metraza_ost||najveca.metraza), " m") + "\n" +
            "• Kg: " + fmt(n(najveca.kg_neto), " kg") + "\n" +
            "• Lokacija: " + (najveca.palet || "—") + "\n\n" +
            "Najmanja rolna:\n" +
            "• " + najmanja.br_rolne + " - " + najmanja.tip + " " + najmanja.sirina + "mm\n" +
            "• Metraža: " + fmt(n(najmanja.metraza_ost||najmanja.metraza), " m") + "\n" +
            "• Kg: " + fmt(n(najmanja.kg_neto), " kg") + "\n" +
            "• Lokacija: " + (najmanja.palet || "—");
        }
      }
      
      // ═══════════════════════════════════════════════════════════
      // 📊 STATISTIKA PO ŠIRINAMA
      // ═══════════════════════════════════════════════════════════
      
      else if(low.includes("po širin") || low.includes("širine")) {
        var rs = await supabase.from("magacin").select("*").neq("status", "Iskorišćeno");
        if(rs.error) throw rs.error;
        var sdata = rs.data || [];
        
        var poSirini = {};
        sdata.forEach(function(x) {
          var sir = x.sirina;
          if(!poSirini[sir]) poSirini[sir] = {count: 0, kg: 0, m: 0};
          poSirini[sir].count++;
          poSirini[sir].kg += n(x.kg_neto || 0);
          poSirini[sir].m += n(x.metraza_ost || x.metraza || 0);
        });
        
        var sorted = Object.keys(poSirini).sort(function(a,b) {
          return poSirini[b].m - poSirini[a].m;
        });
        
        result = "📊 STANJE PO ŠIRINAMA:\n\n" +
          sorted.slice(0, 10).map(function(sir) {
            var s = poSirini[sir];
            return sir + "mm: " + s.count + " rolni, " + fmt(s.m, " m") + ", " + fmt(s.kg, " kg");
          }).join("\n");
      }
      
      // ═══════════════════════════════════════════════════════════
      // 🔍 PRETRAGA PO LOT BROJU
      // ═══════════════════════════════════════════════════════════
      
      else if(low.includes("lot") && (low.match(/\d{5,}/) || low.match(/[A-Z]\d+\/\d+/))) {
        var lotMatch = q.match(/(\d{5,}|[A-Z]\d+\/\d+)/);
        var lotBroj = lotMatch ? lotMatch[1] : "";
        
        var rl = await supabase.from("magacin").select("*").ilike("lot", "%" + lotBroj + "%");
        if(rl.error) throw rl.error;
        var ldata = rl.data || [];
        
        if(ldata.length === 0) {
          result = "🔍 Nije pronađen LOT: " + lotBroj;
        } else {
          var ukM = ldata.reduce(function(s,x){return s+n(x.metraza_ost||x.metraza||0);},0);
          var ukKg = ldata.reduce(function(s,x){return s+n(x.kg_neto||0);},0);
          
          result = "🔍 LOT: " + lotBroj + "\n\n" +
            "Nađeno: " + ldata.length + " rolni\n" +
            "Ukupno: " + fmt(ukM, " m") + "\n" +
            "Kg neto: " + fmt(ukKg, " kg") + "\n\n" +
            "Rolne:\n" +
            ldata.slice(0, 5).map(function(x) {
              return "• " + x.br_rolne + " - " + x.tip + " " + x.sirina + "mm, " + 
                fmt(n(x.metraza_ost||x.metraza), " m");
            }).join("\n") +
            (ldata.length > 5 ? "\n... i još " + (ldata.length - 5) + " rolni" : "");
        }
      }
      
      // ═══════════════════════════════════════════════════════════
      // 📋 RADNI NALOZI
      // ═══════════════════════════════════════════════════════════
      
      else if(low.includes("nalog") || low.includes("kasni") || low.includes("završ")) {
        var rn = await supabase.from("nalozi").select("*").order("created_at", {ascending:false}).limit(200);
        if(rn.error) throw rn.error;
        var nd = rn.data || [];
        
        var otvoreni = nd.filter(function(x){return x.status !== "Završeno" && x.status !== "Zavrseno";});
        var zav = nd.filter(function(x){return x.status === "Završeno" || x.status === "Zavrseno";});
        
        // Kasne (pretpostavljamo da je rok 7 dana)
        var danas = new Date();
        var kasne = otvoreni.filter(function(x) {
          if(!x.created_at) return false;
          var created = new Date(x.created_at);
          var diff = (danas - created) / (1000 * 60 * 60 * 24);
          return diff > 7;
        });
        
        result = "📋 RADNI NALOZI:\n\n" +
          "Ukupno: " + nd.length + " naloga\n" +
          "Otvoreni: " + otvoreni.length + "\n" +
          "Završeni: " + zav.length + "\n" +
          "⚠️ Kasne (>7 dana): " + kasne.length + "\n\n";
        
        if(kasne.length > 0) {
          result += "Nalozi koji kasne:\n" +
            kasne.slice(0, 5).map(function(x) {
              var created = new Date(x.created_at);
              var dana = Math.floor((danas - created) / (1000 * 60 * 60 * 24));
              return "• " + (x.ponBr || x.br || "—") + " - " + (x.kupac || "—") + " (" + dana + " dana)";
            }).join("\n");
        }
      }
      
      // ═══════════════════════════════════════════════════════════
      // 🎯 ŠIFRIRANA PRETRAGA (npr. "R-2026-7553927")
      // ═══════════════════════════════════════════════════════════
      
      else if(low.match(/r-\d{4}-\d{5,}/)) {
        var brRolne = q.match(/R-\d{4}-\d{5,}/i)[0];
        
        var rr = await supabase.from("magacin").select("*").eq("br_rolne", brRolne).single();
        
        if(rr.data) {
          var x = rr.data;
          result = "🎯 ROLNA: " + x.br_rolne + "\n\n" +
            "Tip: " + x.tip + " " + (x.deb > 0 ? x.deb + "µ" : "") + "\n" +
            "Širina: " + x.sirina + "mm\n" +
            "Metraža ostalo: " + fmt(n(x.metraza_ost||x.metraza), " m") + "\n" +
            (x.metraza ? "Metraža ukupno: " + fmt(n(x.metraza), " m") + "\n" : "") +
            "Kg neto: " + fmt(n(x.kg_neto), " kg") + "\n" +
            (x.lot ? "LOT: " + x.lot + "\n" : "") +
            (x.palet ? "Lokacija: " + x.palet + "\n" : "") +
            (x.dobavljac ? "Dobavljač: " + x.dobavljac + "\n" : "") +
            "Status: " + x.status;
        } else {
          result = "❌ Rolna " + brRolne + " nije pronađena.";
        }
      }
      
      // ═══════════════════════════════════════════════════════════
      // 🔥 TOP 10 NAJVEĆIH ROLNI
      // ═══════════════════════════════════════════════════════════
      
      else if(low.includes("top") || low.includes("najvećih")) {
        var rt = await supabase.from("magacin").select("*").neq("status", "Iskorišćeno");
        if(rt.error) throw rt.error;
        var tdata = rt.data || [];
        
        tdata.sort(function(a,b) {
          return n(b.metraza_ost||b.metraza) - n(a.metraza_ost||a.metraza);
        });
        
        result = "🔥 TOP 10 NAJVEĆIH ROLNI:\n\n" +
          tdata.slice(0, 10).map(function(x, i) {
            return (i+1) + ". " + x.br_rolne + " - " + x.tip + " " + x.sirina + "mm\n" +
              "   " + fmt(n(x.metraza_ost||x.metraza), " m") + ", " + fmt(n(x.kg_neto), " kg") +
              (x.palet ? ", " + x.palet : "");
          }).join("\n");
      }
      
      // ═══════════════════════════════════════════════════════════
      // 📍 PRETRAGA PO LOKACIJI
      // ═══════════════════════════════════════════════════════════
      
      else if(low.includes("lokacij") || low.includes("palet")) {
        var lokMatch = q.match(/([A-Z0-9]+)/);
        var lokacija = lokMatch ? lokMatch[1] : "";
        
        var rlok = await supabase.from("magacin").select("*").ilike("palet", "%" + lokacija + "%").neq("status", "Iskorišćeno");
        if(rlok.error) throw rlok.error;
        var lokdata = rlok.data || [];
        
        if(lokdata.length === 0) {
          result = "📍 Nema rolni na lokaciji: " + lokacija;
        } else {
          result = "📍 LOKACIJA: " + lokacija + "\n\n" +
            "Nađeno: " + lokdata.length + " rolni\n\n" +
            lokdata.slice(0, 8).map(function(x) {
              return "• " + x.br_rolne + " - " + x.tip + " " + x.sirina + "mm, " +
                fmt(n(x.metraza_ost||x.metraza), " m");
            }).join("\n") +
            (lokdata.length > 8 ? "\n... i još " + (lokdata.length - 8) + " rolni" : "");
        }
      }
      
      // ═══════════════════════════════════════════════════════════
      // ❓ DEFAULT - POMOĆ
      // ═══════════════════════════════════════════════════════════
      
      else {
        result = "🤖 DOSTUPNE KOMANDE:\n\n" +
          "📦 MAGACIN:\n" +
          "• Koliko imam BOPP 1000mm?\n" +
          "• Koliko imam rolni u magacinu?\n" +
          "• Koliko imam FXC?\n\n" +
          "💰 VREDNOST:\n" +
          "• Kolika je vrednost magacina?\n" +
          "• Koliko vredi?\n\n" +
          "🏆 EKSTREMNE VREDNOSTI:\n" +
          "• Koja je najveća rolna?\n" +
          "• Koja je najmanja rolna?\n\n" +
          "📊 STATISTIKA:\n" +
          "• Prikaži po širinama\n" +
          "• Top 10 najvećih rolni\n\n" +
          "🔍 PRETRAGA:\n" +
          "• LOT 136180\n" +
          "• R-2026-7553927\n" +
          "• Lokacija B5\n\n" +
          "📋 NALOZI:\n" +
          "• Koliko ima otvorenih naloga?\n" +
          "• Koliko kasni?";
      }
      
      setOdgovor(result);
      
      // Dodaj u istoriju
      setHistory(function(prev) {
        return [{q: pitanje, a: result}, ...prev].slice(0, 10);
      });
      
    } catch(e) {
      setOdgovor("❌ Greška: " + e.message);
    }
    
    setLoading(false);
  }

  return (
    <div style={Object.assign({}, card||{}, {background:"#fff",borderRadius:14,padding:18,border:"1px solid #e2e8f0",marginBottom:16})}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:10}}>
        <div>
          <div style={{fontSize:18,fontWeight:900,color:"#0f172a"}}>🤖 AI Asistent MEGA</div>
          <div style={{fontSize:13,color:"#64748b",marginTop:2}}>20+ komandi za magacin, naloge, statistiku i više!</div>
        </div>
        <div style={{fontSize:11,fontWeight:800,color:"#1d4ed8",background:"#eff6ff",padding:"5px 10px",borderRadius:999}}>UPGRADED</div>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <input
          placeholder="Npr: Kolika je vrednost magacina? ili Top 10 najvećih rolni"
          value={pitanje}
          onChange={function(e){setPitanje(e.target.value);}}
          onKeyDown={function(e){if(e.key==="Enter")pitajAI();}}
          style={{flex:1,padding:"11px 12px",borderRadius:10,border:"1px solid #dbe3ef",fontSize:14,outline:"none"}}
        />
        <button onClick={pitajAI} disabled={loading} style={{padding:"11px 16px",borderRadius:10,border:"none",background:loading?"#94a3b8":"#1d4ed8",color:"#fff",fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>
          {loading ? "⏳ Tražim..." : "🤖 Pitaj"}
        </button>
      </div>

      {/* Quick buttons */}
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
        {[
          "Vrednost magacina",
          "Top 10",
          "Po širinama",
          "Otvoreni nalozi",
          "Najveća rolna"
        ].map(function(cmd) {
          return (
            <button
              key={cmd}
              onClick={function(){setPitanje(cmd);}}
              style={{
                padding:"6px 12px",
                borderRadius:8,
                border:"1px solid #e2e8f0",
                background:"#f8fafc",
                fontSize:12,
                fontWeight:700,
                cursor:"pointer",
                color:"#64748b"
              }}
            >
              {cmd}
            </button>
          );
        })}
      </div>

      {odgovor && (
        <pre style={{
          whiteSpace:"pre-wrap",
          fontFamily:"inherit",
          marginTop:12,
          background:"#f8fafc",
          border:"1px solid #e2e8f0",
          borderRadius:10,
          padding:12,
          fontSize:13,
          color:"#334155",
          lineHeight:1.5
        }}>{odgovor}</pre>
      )}
      
      {/* History */}
      {history.length > 0 && (
        <div style={{marginTop:16,paddingTop:16,borderTop:"1px solid #e2e8f0"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#64748b",marginBottom:8}}>📜 Istorija (poslednih {history.length})</div>
          {history.slice(0, 3).map(function(h, i) {
            return (
              <div key={i} style={{marginBottom:8,cursor:"pointer"}} onClick={function(){setPitanje(h.q);}}>
                <div style={{fontSize:11,color:"#94a3b8"}}>💬 {h.q}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
