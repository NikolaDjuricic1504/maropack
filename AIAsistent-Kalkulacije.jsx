// AIAsistent-Kalkulacije.jsx - PAMETNI ASISTENT ZA KALKULACIJE
import { useState } from "react";

export default function AIAsistentKalkulacije({card, inp, lbl, msg}) {
  const [upit, setUpit] = useState("");
  const [loading, setLoading] = useState(false);
  const [rezultat, setRezultat] = useState(null);
  const [istorija, setIstorija] = useState([]);

  async function analiziraj() {
    if (!upit.trim()) {
      msg("Unesite upit!", "err");
      return;
    }

    setLoading(true);
    
    // Simulacija AI analize (ovde bi išao poziv ka API-ju)
    setTimeout(function() {
      var odgovor = generirajOdgovor(upit);
      
      setRezultat(odgovor);
      setIstorija(function(prev) {
        return prev.concat([{
          upit: upit,
          odgovor: odgovor,
          vreme: new Date().toLocaleString("sr-RS")
        }]);
      });
      
      setUpit("");
      setLoading(false);
    }, 1500);
  }

  function generirajOdgovor(upit) {
    var upitLower = upit.toLowerCase();
    
    // Preporuke za materijale
    if (upitLower.includes("materijal") || upitLower.includes("folija")) {
      return {
        tip: "preporuka",
        naslov: "💡 Preporuka materijala",
        sadrzaj: "Za pakovanje hrane preporučujem **BOPP + CPP laminat**:\n\n" +
                 "• BOPP 20µ - vanjski sloj (prozirnost, sjaj)\n" +
                 "• CPP 30µ - unutrašnji sloj (termoseal)\n" +
                 "• Ukupna gramatura: ~45.5 g/m²\n" +
                 "• Procenjena cena: 3.2-3.8 EUR/kg",
        saveti: [
          "Kasiranje poboljšava barijeru za vlagu",
          "Za duži rok upotrebe dodaj ALU sloj",
          "BOPP SEDEF daje mat finish"
        ]
      };
    }
    
    // Optimizacija dimenzija
    if (upitLower.includes("dimenzij") || upitLower.includes("širina") || upitLower.includes("veličin")) {
      return {
        tip: "optimizacija",
        naslov: "📐 Optimizacija dimenzija",
        sadrzaj: "Analizirajući standard rolne **1000mm širine**:\n\n" +
                 "• Optimalne širine za kese: 150, 200, 250, 333mm\n" +
                 "• Bez otpada: 5x200mm ili 4x250mm\n" +
                 "• Sa minimalnim otpadom (<5%): 3x333mm",
        saveti: [
          "Podesi širinu na faktor širine rolne",
          "Razmotri dupli sekač za 2x produktivnost",
          "Za male količine može se tolerisati 10-15% otpada"
        ]
      };
    }
    
    // Kalkulacija cene
    if (upitLower.includes("cena") || upitLower.includes("cen") || upitLower.includes("košta")) {
      return {
        tip: "kalkulacija",
        naslov: "💰 Analiza cene",
        sadrzaj: "Struktura troškova za laminat:\n\n" +
                 "**Materijal (65-75%)** - najveći uticaj\n" +
                 "**Kasiranje (10-15%)** - ako je potrebno\n" +
                 "**Štampa (8-12%)** - zavisi od broja boja\n" +
                 "**Ostalo (5-10%)** - transport, pakovanje",
        saveti: [
          "Marža 30-40% za standardne proizvode",
          "Marža 50%+ za custom dizajn",
          "Veće količine = niža cena po jedinici"
        ]
      };
    }
    
    // Proizvodni proces
    if (upitLower.includes("proizvod") || upitLower.includes("proces") || upitLower.includes("kako")) {
      return {
        tip: "proces",
        naslov: "🏭 Proizvodni proces",
        sadrzaj: "**Standardni redosled za laminat:**\n\n" +
                 "1. **Štampa** - Flexo 4-6 boja\n" +
                 "2. **Kasiranje** - Lepljenje slojeva\n" +
                 "3. **Sazrevanje** - 48-72h\n" +
                 "4. **Rezanje** - Podešavanje širine\n" +
                 "5. **Izrada kesa** - Ako je potrebno",
        saveti: [
          "Sazrevanje je OBAVEZNO za barijerne folije",
          "Test otisak pre punog naloga",
          "QC kontrola posle svakog koraka"
        ]
      };
    }
    
    // Default odgovor
    return {
      tip: "info",
      naslov: "🤖 AI Asistent",
      sadrzaj: "Mogu ti pomoći sa:\n\n" +
               "• **Preporukama materijala** - koji materijal za koji proizvod\n" +
               "• **Optimizacijom dimenzija** - kako smanjiti otpad\n" +
               "• **Kalkulacijom cena** - analiza troškova\n" +
               "• **Proizvodnim procesom** - redosled operacija\n\n" +
               "Postavi mi konkretno pitanje!",
      saveti: [
        "Pokušaj: 'Koji materijal za pakovanje hrane?'",
        "Ili: 'Kako optimizovati širinu kese?'",
        "Ili: 'Koliko košta laminat?'"
      ]
    };
  }

  return (
    <div>
      <div style={Object.assign({}, card, {
        marginBottom: 16,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#fff"
      })}>
        <div style={{fontSize:24,fontWeight:900,marginBottom:4}}>🤖 AI Asistent za Kalkulacije</div>
        <div style={{fontSize:14,opacity:0.9}}>
          Postavi pitanje i dobij pametne preporuke!
        </div>
      </div>

      {/* Input */}
      <div style={Object.assign({}, card, {marginBottom:16})}>
        <div style={{marginBottom:12}}>
          <label style={lbl}>Tvoje pitanje</label>
          <textarea
            style={Object.assign({}, inp, {
              height: 80,
              resize: "vertical",
              fontSize: 14
            })}
            value={upit}
            onChange={function(e){ setUpit(e.target.value); }}
            placeholder="npr: Koji materijal preporučuješ za pakovanje hrane?"
            onKeyDown={function(e){
              if(e.key === "Enter" && e.ctrlKey) {
                analiziraj();
              }
            }}
          />
          <div style={{fontSize:11,color:"#94a3b8",marginTop:4}}>
            💡 Saveti: Ctrl+Enter za slanje
          </div>
        </div>

        <button
          onClick={analiziraj}
          disabled={loading || !upit.trim()}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "none",
            background: loading || !upit.trim() ? "#cbd5e1" : "#667eea",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            cursor: loading || !upit.trim() ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "🤔 Analiziram..." : "🚀 Analiziraj"}
        </button>
      </div>

      {/* Rezultat */}
      {rezultat && (
        <div style={Object.assign({}, card, {
          background: "#f0fdf4",
          border: "2px solid #bbf7d0",
          marginBottom: 16
        })}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
            paddingBottom: 12,
            borderBottom: "1px solid #bbf7d0"
          }}>
            <div style={{fontSize:24}}>
              {rezultat.tip === "preporuka" ? "💡" : 
               rezultat.tip === "optimizacija" ? "📐" :
               rezultat.tip === "kalkulacija" ? "💰" :
               rezultat.tip === "proces" ? "🏭" : "🤖"}
            </div>
            <div style={{fontSize:18,fontWeight:800,color:"#166534"}}>
              {rezultat.naslov}
            </div>
          </div>

          <div style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: "#1e293b",
            marginBottom: 16,
            whiteSpace: "pre-line"
          }}>
            {rezultat.sadrzaj}
          </div>

          {rezultat.saveti && rezultat.saveti.length > 0 && (
            <div style={{
              background: "#fff",
              borderRadius: 8,
              padding: 12
            }}>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#64748b",
                marginBottom: 8,
                textTransform: "uppercase"
              }}>
                ✨ Dodatni saveti:
              </div>
              {rezultat.saveti.map(function(savet, i) {
                return (
                  <div key={i} style={{
                    fontSize: 13,
                    color: "#475569",
                    marginBottom: 4,
                    paddingLeft: 16,
                    position: "relative"
                  }}>
                    <span style={{
                      position: "absolute",
                      left: 0,
                      color: "#059669",
                      fontWeight: 700
                    }}>•</span>
                    {savet}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Istorija */}
      {istorija.length > 0 && (
        <div style={card}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12
          }}>
            <div style={{fontSize:14,fontWeight:700,color:"#64748b"}}>
              📜 Istorija pitanja ({istorija.length})
            </div>
            <button
              onClick={function(){ setIstorija([]); setRezultat(null); }}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #e2e8f0",
                background: "#fff",
                color: "#64748b",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Obriši istoriju
            </button>
          </div>

          <div style={{display:"grid",gap:8}}>
            {istorija.slice().reverse().map(function(item, i) {
              return (
                <div key={i} style={{
                  background: "#f8fafc",
                  borderRadius: 8,
                  padding: 10,
                  border: "1px solid #e2e8f0"
                }}>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#1d4ed8",
                    marginBottom: 4
                  }}>
                    Q: {item.upit}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: "#64748b"
                  }}>
                    {item.vreme}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick actions */}
      {!rezultat && istorija.length === 0 && (
        <div style={card}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:12,color:"#64748b"}}>
            ⚡ Brza pitanja:
          </div>
          <div style={{display:"grid",gap:8}}>
            {[
              "Koji materijal za pakovanje hrane?",
              "Kako optimizovati širinu kese?",
              "Koliko košta BOPP laminat?",
              "Redosled proizvodnje za laminat?"
            ].map(function(pitanje) {
              return (
                <button
                  key={pitanje}
                  onClick={function(){ setUpit(pitanje); }}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    background: "#fff",
                    color: "#475569",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  💬 {pitanje}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
