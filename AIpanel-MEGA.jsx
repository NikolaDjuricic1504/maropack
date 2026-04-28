// AIAsistent-Kalkulacije-ENHANCED.jsx - SA PDF EXPORT I SAVED QUERIES
import { useState, useEffect } from "react";
import { pitajGemini } from "./aiClient.js";

export default function AIAsistentKalkulacijeEnhanced({ card, inp, lbl, msg }) {
  const [upit, setUpit] = useState("");
  const [modul, setModul] = useState("kalkulacije");
  const [loading, setLoading] = useState(false);
  const [rezultat, setRezultat] = useState(null);
  const [istorija, setIstorija] = useState([]);
  const [savedQueries, setSavedQueries] = useState([]);
  const [showSaved, setShowSaved] = useState(false);

  // Učitaj sačuvane upite iz localStorage
  useEffect(function() {
    try {
      var saved = localStorage.getItem("maropack_saved_queries");
      if(saved) {
        setSavedQueries(JSON.parse(saved));
      }
    } catch(e) {
      console.error("Greška pri učitavanju saved queries:", e);
    }
  }, []);

  // PRE-DEFINED ČESTA PITANJA PO MODULIMA
  var cestaPitanja = {
    kalkulacije: [
      "Kako da kalkulišem cenu T-shirt kese 30x40?",
      "Koja je razlika između LDPE i HDPE materijala?",
      "Kako se računa dužina od težine folije?",
      "Koja je optimalna debljina za kese sa ručkom?",
      "Kako da odredim broj boja za štampu?"
    ],
    ponude: [
      "Napravi ponudu za 10,000 T-shirt kesa 25x35",
      "Kako da formatujem profesionalnu ponudu?",
      "Koja je standardna valuta za export klijente?",
      "Kako da dodam pakovanje u ponudu?",
      "Koji su standardni uslovi plaćanja?"
    ],
    radni_nalozi: [
      "Kako da popunim nalog za foliju širine 50cm?",
      "Koje kontrolne tačke su obavezne?",
      "Kako da izračunam ukupnu težinu naloga?",
      "Šta znače parametri brzina i temperatura?",
      "Kako da optmizujem plan proizvodnje?"
    ],
    magacin: [
      "Koja je trenutna zaliha PE granulata?",
      "Kako da organizujem magacin po lokacijama?",
      "Kada treba naručiti novu sirovinu?",
      "Kako se prati iskorišćenost rolni?",
      "Šta je optimalna rotacija skladišta?"
    ],
    secenje: [
      "Optimizuj sečenje rolne 100cm na 3 komada 30cm",
      "Kako da smanjim otpad pri sečenju?",
      "Koja je najbolja kombinacija širina?",
      "Kako se računa procenat iskorišćenosti?",
      "Šta uraditi sa otpadom?"
    ]
  };

  async function analiziraj() {
    if (!upit.trim()) {
      msg("Unesite upit!", "err");
      return;
    }

    setLoading(true);

    try {
      var odgovor = await pitajGemini({
        modul,
        poruka: upit,
        podaci: {
          aplikacija: "Maropack",
          napomena: "Korisnik želi praktičan predlog za proizvodnju, kalkulaciju, ponudu, magacin ili radni nalog."
        }
      });

      var noviRezultat = {
        tip: "gemini",
        naslov: "🤖 Gemini AI odgovor",
        sadrzaj: odgovor.text || "Nema odgovora.",
        model: odgovor.model || "gemini",
        modul,
        timestamp: new Date().toISOString()
      };

      setRezultat(noviRezultat);
      setIstorija(function (prev) {
        return prev.concat([
          {
            upit,
            modul,
            odgovor: noviRezultat,
            vreme: new Date().toLocaleString("sr-RS")
          }
        ]);
      });
      setUpit("");
    } catch (e) {
      msg("Gemini greška: " + (e?.message || "nepoznata greška"), "err");
      setRezultat({
        tip: "greska",
        naslov: "⚠️ Gemini greška",
        sadrzaj:
          "Proveri da li si dodao GEMINI_API_KEY u Vercel Environment Variables i da li je deploy prošao.\n\nDetalj: " +
          (e?.message || "nepoznata greška"),
        model: "",
        modul
      });
    }

    setLoading(false);
  }

  function quick(pitanje, m) {
    setModul(m || modul);
    setUpit(pitanje);
  }

  // SAČUVAJ OMILJENI UPIT
  function saveQuery() {
    if(!upit.trim()) {
      msg("Nema upita za čuvanje!", "err");
      return;
    }

    var novi = {
      id: Date.now(),
      upit: upit,
      modul: modul,
      timestamp: new Date().toLocaleString("sr-RS")
    };

    var updated = savedQueries.concat([novi]);
    setSavedQueries(updated);
    localStorage.setItem("maropack_saved_queries", JSON.stringify(updated));
    msg("Upit sačuvan! ✓", "ok");
  }

  // OBRIŠI SAČUVANI UPIT
  function deleteQuery(id) {
    var updated = savedQueries.filter(function(x){return x.id !== id;});
    setSavedQueries(updated);
    localStorage.setItem("maropack_saved_queries", JSON.stringify(updated));
    msg("Upit obrisan!", "ok");
  }

  // UČITAJ SAČUVANI UPIT
  function loadQuery(q) {
    setUpit(q.upit);
    setModul(q.modul);
    setShowSaved(false);
  }

  // EXPORT U PDF
  function exportPDF() {
    if(!rezultat || !rezultat.sadrzaj) {
      msg("Nema odgovora za export!", "err");
      return;
    }

    try {
      // Jednostavan PDF export (preko browser print)
      var printWindow = window.open("", "_blank");
      var html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Maropack AI - ${rezultat.naslov}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              border-bottom: 3px solid #667eea;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            h1 {
              color: #667eea;
              margin: 0;
            }
            .meta {
              color: #666;
              font-size: 14px;
              margin-top: 10px;
            }
            .content {
              line-height: 1.8;
              white-space: pre-wrap;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
              color: #999;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🤖 Maropack AI Asistent</h1>
            <div class="meta">
              <strong>Modul:</strong> ${rezultat.modul} | 
              <strong>Datum:</strong> ${new Date().toLocaleString("sr-RS")}
            </div>
          </div>
          <div class="content">${rezultat.sadrzaj}</div>
          <div class="footer">
            Generisano od strane Maropack AI Asistent sistema<br>
            www.maropack.com
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(html);
      printWindow.document.close();
      
      // Auto-print dialog
      setTimeout(function() {
        printWindow.print();
      }, 500);
      
      msg("PDF export otvoren u novom prozoru!", "ok");
    } catch(e) {
      msg("Greška pri export-u: " + e.message, "err");
    }
  }

  return (
    <div>
      {/* HEADER */}
      <div
        style={Object.assign({}, card, {
          marginBottom: 16,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "#fff"
        })}
      >
        <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>
          🤖 Gemini AI Asistent za Maropack
        </div>
        <div style={{ fontSize: 14, opacity: 0.9 }}>
          Kalkulacije, ponude, magacin i radni nalozi - enhanced verzija sa PDF export i saved queries
        </div>
      </div>

      {/* GLAVNI INPUT */}
      <div style={Object.assign({}, card, { marginBottom: 16 })}>
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={lbl}>Modul</label>
            <select style={inp} value={modul} onChange={function (e) { setModul(e.target.value); }}>
              <option value="kalkulacije">🧮 Kalkulacije</option>
              <option value="ponude">📄 Ponude</option>
              <option value="radni_nalozi">📋 Radni nalozi</option>
              <option value="magacin">🏭 Magacin</option>
              <option value="secenje">🧠 Sečenje</option>
              <option value="opsti">🤖 Opšti AI</option>
            </select>
          </div>

          <div>
            <label style={lbl}>Vaš upit</label>
            <textarea
              style={Object.assign({}, inp, { height: 80, resize: "vertical" })}
              value={upit}
              onChange={function (e) { setUpit(e.target.value); }}
              placeholder="Unesite pitanje ili opis problema..."
              onKeyDown={function (e) {
                if (e.key === "Enter" && e.ctrlKey) {
                  analiziraj();
                }
              }}
            />
          </div>
        </div>

        {/* DUGMAD */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={analiziraj}
            disabled={loading}
            style={Object.assign({}, inp, {
              background: loading ? "#ccc" : "#667eea",
              color: "#fff",
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              border: "none",
              padding: "10px 20px"
            })}
          >
            {loading ? "⏳ Obrađujem..." : "🚀 Analiziraj (Ctrl+Enter)"}
          </button>

          <button
            onClick={saveQuery}
            style={Object.assign({}, inp, {
              background: "#10b981",
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer",
              border: "none",
              padding: "10px 20px"
            })}
          >
            💾 Sačuvaj upit
          </button>

          <button
            onClick={function(){setShowSaved(!showSaved);}}
            style={Object.assign({}, inp, {
              background: "#f59e0b",
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer",
              border: "none",
              padding: "10px 20px"
            })}
          >
            📂 Sačuvani upiti ({savedQueries.length})
          </button>

          {rezultat && (
            <button
              onClick={exportPDF}
              style={Object.assign({}, inp, {
                background: "#ef4444",
                color: "#fff",
                fontWeight: 800,
                cursor: "pointer",
                border: "none",
                padding: "10px 20px"
              })}
            >
              📄 Export PDF
            </button>
          )}
        </div>
      </div>

      {/* SAČUVANI UPITI */}
      {showSaved && savedQueries.length > 0 && (
        <div style={Object.assign({}, card, {marginBottom: 16, background: "#fffbeb", borderLeft: "4px solid #f59e0b"})}>
          <div style={{fontSize: 16, fontWeight: 800, marginBottom: 12}}>📂 Sačuvani upiti</div>
          {savedQueries.map(function(q) {
            return (
              <div 
                key={q.id} 
                style={{
                  padding: 12, 
                  marginBottom: 8, 
                  background: "#fff", 
                  borderRadius: 8, 
                  border: "1px solid #fbbf24",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div style={{flex: 1}}>
                  <div style={{fontWeight: 700, fontSize: 14, marginBottom: 4}}>
                    {q.modul.toUpperCase()}: {q.upit.substring(0, 60)}{q.upit.length > 60 ? "..." : ""}
                  </div>
                  <div style={{fontSize: 12, color: "#666"}}>Sačuvano: {q.timestamp}</div>
                </div>
                <div style={{display: "flex", gap: 8}}>
                  <button
                    onClick={function(){loadQuery(q);}}
                    style={{padding: "6px 12px", background: "#10b981", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700}}
                  >
                    ↩ Učitaj
                  </button>
                  <button
                    onClick={function(){deleteQuery(q.id);}}
                    style={{padding: "6px 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700}}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ČESTA PITANJA */}
      {cestaPitanja[modul] && (
        <div style={Object.assign({}, card, { marginBottom: 16, background: "#f0f9ff", borderLeft: "4px solid #0ea5e9" })}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>💡 Česta pitanja - {modul}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cestaPitanja[modul].map(function (pitanje, idx) {
              return (
                <button
                  key={idx}
                  onClick={function () { quick(pitanje, modul); }}
                  style={{
                    padding: "10px 14px",
                    background: "#fff",
                    border: "1px solid #bae6fd",
                    borderRadius: 8,
                    textAlign: "left",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 13,
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={function (e) {
                    e.currentTarget.style.background = "#e0f2fe";
                    e.currentTarget.style.borderColor = "#0ea5e9";
                  }}
                  onMouseLeave={function (e) {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.borderColor = "#bae6fd";
                  }}
                >
                  ❓ {pitanje}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* REZULTAT */}
      {rezultat && (
        <div
          style={Object.assign({}, card, {
            marginBottom: 16,
            background: rezultat.tip === "greska" ? "#fef2f2" : "#f0fdf4",
            borderLeft: "4px solid " + (rezultat.tip === "greska" ? "#ef4444" : "#10b981")
          })}
        >
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>
            {rezultat.naslov}
          </div>
          {rezultat.model && (
            <div style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
              Model: {rezultat.model} | Modul: {rezultat.modul}
            </div>
          )}
          <div style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {rezultat.sadrzaj}
          </div>
        </div>
      )}

      {/* ISTORIJA */}
      {istorija.length > 0 && (
        <div style={Object.assign({}, card, { background: "#f8fafc" })}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>
            📜 Istorija upita ({istorija.length})
          </div>
          {istorija.slice().reverse().map(function (item, idx) {
            return (
              <div
                key={idx}
                style={{
                  padding: 12,
                  marginBottom: 8,
                  background: "#fff",
                  borderRadius: 8,
                  borderLeft: "3px solid #94a3b8"
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                  {item.modul.toUpperCase()}: {item.upit}
                </div>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                  {item.vreme}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: "#334155" }}>
                  {item.odgovor.sadrzaj.substring(0, 200)}
                  {item.odgovor.sadrzaj.length > 200 && "..."}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
