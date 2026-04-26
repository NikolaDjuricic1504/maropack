// AIpanel-MEGA-V2.jsx - SA EXPORT, NOTIFIKACIJAMA I TRENDOVIMA
import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

function n(v){ return Number(v||0); }
function fmt(v, suf){ return n(v).toLocaleString("sr-RS", {maximumFractionDigits: 1}) + (suf||""); }

export default function AIpanelMEGAv2({card}) {
  const [pitanje,setPitanje] = useState("");
  const [odgovor,setOdgovor] = useState("");
  const [loading,setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [notifikacijeEnabled, setNotifikacijeEnabled] = useState(false);

  // Proveri da li su notifikacije omogućene
  useEffect(function() {
    if("Notification" in window && Notification.permission === "granted") {
      setNotifikacijeEnabled(true);
    }
  }, []);

  // Funkcija za slanje notifikacije
  function posaljiNotifikaciju(naslov, poruka) {
    if("Notification" in window && Notification.permission === "granted") {
      new Notification(naslov, {
        body: poruka,
        icon: "/favicon.ico",
        badge: "/favicon.ico"
      });
    }
  }

  // Funkcija za traženje dozvole za notifikacije
  async function omoguciNotifikacije() {
    if("Notification" in window) {
      var permission = await Notification.requestPermission();
      if(permission === "granted") {
        setNotifikacijeEnabled(true);
        posaljiNotifikaciju("✅ Notifikacije omogućene!", "Sada ćete dobijati alerti o magacinu i nalozima.");
      }
    } else {
      alert("Vaš browser ne podržava notifikacije.");
    }
  }

  // EXPORT U EXCEL funkcija
  async function exportUjExcel(tip) {
    try {
      var data = [];
      var filename = "";

      if(tip === "magacin") {
        var r = await supabase.from("magacin").select("*").neq("status", "Iskorišćeno");
        if(r.error) throw r.error;
        data = r.data;
        filename = "magacin_" + new Date().toISOString().split("T")[0] + ".csv";
        
        // CSV header
        var csv = "Broj rolne,Tip,Širina,Metraža,Kg neto,LOT,Palet,Dobavljač,Status\n";
        
        data.forEach(function(x) {
          csv += [
            x.br_rolne || "",
            x.tip || "",
            x.sirina || "",
            x.metraza_ost || x.metraza || "",
            x.kg_neto || "",
            x.lot || "",
            x.palet || "",
            x.dobavljac || "",
            x.status || ""
          ].join(",") + "\n";
        });
        
        // Download
        var blob = new Blob([csv], {type: "text/csv;charset=utf-8;"});
        var link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        
        setOdgovor("✅ Export završen!\nPreuzeto: " + filename + "\nRolni: " + data.length);
        
      } else if(tip === "statistika") {
        var rm = await supabase.from("magacin").select("*").neq("status", "Iskorišćeno");
        if(rm.error) throw rm.error;
        
        // Statistika po širini
        var poSirini = {};
        rm.data.forEach(function(x) {
          var sir = x.sirina;
          if(!poSirini[sir]) poSirini[sir] = {sirina: sir, rolni: 0, metara: 0, kg: 0};
          poSirini[sir].rolni++;
          poSirini[sir].metara += n(x.metraza_ost||x.metraza||0);
          poSirini[sir].kg += n(x.kg_neto||0);
        });
        
        filename = "statistika_" + new Date().toISOString().split("T")[0] + ".csv";
        var csvStat = "Širina,Broj rolni,Metara,Kg\n";
        
        Object.values(poSirini).forEach(function(s) {
          csvStat += s.sirina + "mm," + s.rolni + "," + s.metara + "," + s.kg.toFixed(2) + "\n";
        });
        
        var blobStat = new Blob([csvStat], {type: "text/csv;charset=utf-8;"});
        var linkStat = document.createElement("a");
        linkStat.href = URL.createObjectURL(blobStat);
        linkStat.download = filename;
        linkStat.click();
        
        setOdgovor("✅ Export statistike završen!\nPreuzeto: " + filename);
      }
      
    } catch(e) {
      setOdgovor("❌ Greška pri exportu: " + e.message);
    }
  }

  async function pitajAI() {
    var q = pitanje.trim();
    if(!q) return;
    
    setLoading(true);
    setOdgovor("🤖 Analiziram pitanje...");
    
    try {
      var low = q.toLowerCase();
      var result = "";

      // ═══════════════════════════════════════════════════════════
      // 📊 EXPORT KOMANDE
      // ═══════════════════════════════════════════════════════════
      
      if(low.includes("export") || low.includes("preuzmi") || low.includes("download")) {
        if(low.includes("magacin")) {
          await exportUjExcel("magacin");
          return;
        } else if(low.includes("statistik")) {
          await exportUjExcel("statistika");
          return;
        } else {
          result = "📊 EXPORT OPCIJE:\n\n" +
            "• Export magacin → Preuzmi sve rolne u CSV\n" +
            "• Export statistika → Preuzmi statistiku po širinama\n\n" +
            "Primeri:\n" +
            "💬 'Export magacin'\n" +
            "💬 'Preuzmi statistiku'";
        }
      }
      
      // ═══════════════════════════════════════════════════════════
      // 🔔 PROVERA NISKIH ZALIHA (sa notifikacijom)
      // ═══════════════════════════════════════════════════════════
      
      else if(low.includes("niske") || low.includes("minimum") || low.includes("proveri zalihe")) {
        var rz = await supabase.from("magacin").select("*").neq("status", "Iskorišćeno");
        if(rz.error) throw rz.error;
        
        // Grupiši po tipu i širini
        var grupe = {};
        rz.data.forEach(function(x) {
          var kljuc = x.tip + "_" + x.sirina;
          if(!grupe[kljuc]) grupe[kljuc] = {tip: x.tip, sirina: x.sirina, rolni: 0, metara: 0};
          grupe[kljuc].rolni++;
          grupe[kljuc].metara += n(x.metraza_ost||x.metraza||0);
        });
        
        // Proveri koje grupe imaju manje od 3 rolne ili manje od 50.000m
        var niske = [];
        Object.values(grupe).forEach(function(g) {
          if(g.rolni < 3 || g.metara < 50000) {
            niske.push(g);
          }
        });
        
        if(niske.length > 0) {
          result = "⚠️ NISKE ZALIHE (< 3 rolne ili < 50.000m):\n\n";
          niske.slice(0, 10).forEach(function(n) {
            result += "• " + n.tip + " " + n.sirina + "mm: " + n.rolni + " rolni, " + fmt(n.metara, " m") + "\n";
          });
          
          // Pošalji notifikaciju
          if(notifikacijeEnabled) {
            posaljiNotifikaciju(
              "⚠️ Niske zalihe - " + niske.length + " grupa!",
              "Proveri magacin: " + niske[0].tip + " " + niske[0].sirina + "mm ima samo " + niske[0].rolni + " rolni!"
            );
          }
        } else {
          result = "✅ SVE ZALIHE SU OK!\n\nNema grupa sa manje od 3 rolne ili manje od 50.000m.";
        }
      }
      
      // ═══════════════════════════════════════════════════════════
      // 📅 TREND ANALIZA (potrošnja po mesecima)
      // ═══════════════════════════════════════════════════════════
      
      else if(low.includes("trend") || low.includes("mesečn") || low.includes("potrošnj")) {
        // Učitaj SVE rolne (uključujući iskorišćene)
        var rt = await supabase.from("magacin").select("*");
        if(rt.error) throw rt.error;
        
        var poMesecima = {};
        var danas = new Date();
        
        rt.data.forEach(function(x) {
          if(x.created_at) {
            var datum = new Date(x.created_at);
            var mesec = datum.getFullYear() + "-" + String(datum.getMonth() + 1).padStart(2, "0");
            
            if(!poMesecima[mesec]) poMesecima[mesec] = {
              mesec: mesec,
              primljeno: 0,
              kg: 0,
              iskorisceno: 0
            };
            
            poMesecima[mesec].primljeno++;
            poMesecima[mesec].kg += n(x.kg_neto||0);
            
            if(x.status === "Iskorišćeno") {
              poMesecima[mesec].iskorisceno++;
            }
          }
        });
        
        var sorted = Object.values(poMesecima).sort(function(a,b) {
          return b.mesec.localeCompare(a.mesec);
        }).slice(0, 6);
        
        result = "📅 TREND ANALIZA (poslednjih 6 meseci):\n\n";
        sorted.forEach(function(m) {
          result += m.mesec + ":\n" +
            "  Primljeno: " + m.primljeno + " rolni (" + fmt(m.kg, " kg") + ")\n" +
            "  Iskorišćeno: " + m.iskorisceno + " rolni\n\n";
        });
      }
      
      // ═══════════════════════════════════════════════════════════
      // 💰 VREDNOST MAGACINA
      // ═══════════════════════════════════════════════════════════
      
      else if(low.includes("vrednost") || low.includes("koliko vredi")) {
        var rm = await supabase.from("magacin").select("*").neq("status", "Iskorišćeno");
        if(rm.error) throw rm.error;
        
        var CENE = {
          "BOPP": 2.6, "OPP": 2.6, "CPP": 2.7, "PET": 3.1,
          "LDPE": 2.4, "ALU": 8.5, "PAPIR": 1.9, "PA": 4.2,
          "FXC": 2.8, "FXPU": 2.9, "NATIVIA": 3.0, "CC White": 2.2
        };
        
        var ukupnaVrednost = 0;
        var ukKg = 0;
        
        rm.data.forEach(function(x) {
          var kg = n(x.kg_neto||0);
          ukKg += kg;
          
          var cenaKg = 2.8;
          for(var tip in CENE) {
            if(String(x.tip||"").toUpperCase().includes(tip)) {
              cenaKg = CENE[tip];
              break;
            }
          }
          
          ukupnaVrednost += kg * cenaKg;
        });
        
        result = "💰 VREDNOST MAGACINA:\n\n" +
          "Ukupno kg: " + fmt(ukKg, " kg") + "\n" +
          "Ukupna vrednost: " + fmt(ukupnaVrednost, " €") + "\n" +
          "Prosečna cena: " + (ukKg > 0 ? (ukupnaVrednost/ukKg).toFixed(2) : 0) + " €/kg";
      }
      
      // ═══════════════════════════════════════════════════════════
      // 📦 MAGACIN OSNOVNO
      // ═══════════════════════════════════════════════════════════
      
      else if(low.includes("magacin") || low.includes("imam") || low.includes("roln")) {
        var r = await supabase.from("magacin").select("*").neq("status", "Iskorišćeno");
        if(r.error) throw r.error;
        
        result = "📦 MAGACIN:\n\nUkupno: " + r.data.length + " rolni\n" +
          "Metara: " + fmt(r.data.reduce(function(s,x){return s+n(x.metraza_ost||x.metraza||0);},0), " m") + "\n" +
          "Kg: " + fmt(r.data.reduce(function(s,x){return s+n(x.kg_neto||0);},0), " kg");
      }
      
      // ═══════════════════════════════════════════════════════════
      // ❓ DEFAULT - POMOĆ
      // ═══════════════════════════════════════════════════════════
      
      else {
        result = "🤖 NOVE KOMANDE:\n\n" +
          "📊 EXPORT:\n" +
          "• Export magacin\n" +
          "• Export statistika\n\n" +
          "🔔 ALERTI:\n" +
          "• Niske zalihe\n" +
          "• Proveri minimum\n\n" +
          "📅 TREND:\n" +
          "• Trend potrošnje\n" +
          "• Mesečna statistika\n\n" +
          "💰 VREDNOST:\n" +
          "• Kolika je vrednost magacina?\n\n" +
          "📦 MAGACIN:\n" +
          "• Koliko imam rolni?";
      }
      
      setOdgovor(result);
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
          <div style={{fontSize:18,fontWeight:900,color:"#0f172a"}}>🤖 AI Asistent MEGA V2</div>
          <div style={{fontSize:13,color:"#64748b",marginTop:2}}>Export, Notifikacije, Trend analiza + 20 komandi!</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {!notifikacijeEnabled && (
            <button
              onClick={omoguciNotifikacije}
              style={{
                padding:"6px 12px",
                borderRadius:8,
                border:"1px solid #fbbf24",
                background:"#fef3c7",
                color:"#92400e",
                fontSize:11,
                fontWeight:800,
                cursor:"pointer"
              }}
            >
              🔔 Omogući alerti
            </button>
          )}
          {notifikacijeEnabled && (
            <div style={{fontSize:11,fontWeight:800,color:"#059669",background:"#d1fae5",padding:"5px 10px",borderRadius:999}}>
              🔔 Alerti aktivni
            </div>
          )}
          <div style={{fontSize:11,fontWeight:800,color:"#1d4ed8",background:"#eff6ff",padding:"5px 10px",borderRadius:999}}>V2.0</div>
        </div>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <input
          placeholder="Npr: Export magacin ili Niske zalihe ili Trend potrošnje"
          value={pitanje}
          onChange={function(e){setPitanje(e.target.value);}}
          onKeyDown={function(e){if(e.key==="Enter")pitajAI();}}
          style={{flex:1,padding:"11px 12px",borderRadius:10,border:"1px solid #dbe3ef",fontSize:14,outline:"none"}}
        />
        <button onClick={pitajAI} disabled={loading} style={{padding:"11px 16px",borderRadius:10,border:"none",background:loading?"#94a3b8":"#1d4ed8",color:"#fff",fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>
          {loading ? "⏳" : "🤖 Pitaj"}
        </button>
      </div>

      {/* Quick buttons - NOVE KOMANDE */}
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
        {[
          "Export magacin",
          "Export statistika",
          "Niske zalihe",
          "Trend potrošnje",
          "Vrednost magacina"
        ].map(function(cmd) {
          return (
            <button
              key={cmd}
              onClick={function(){setPitanje(cmd); pitajAI();}}
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
