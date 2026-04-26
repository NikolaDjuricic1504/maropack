// AIAsistent-Kalkulacije.jsx - Gemini AI asistent za Maropack kalkulacije
import { useState } from "react";
import { pitajGemini } from "./aiClient.js";

export default function AIAsistentKalkulacije({ card, inp, lbl, msg }) {
  const [upit, setUpit] = useState("");
  const [modul, setModul] = useState("kalkulacije");
  const [loading, setLoading] = useState(false);
  const [rezultat, setRezultat] = useState(null);
  const [istorija, setIstorija] = useState([]);

  async function analiziraj() {
    if (!upit.trim()) {
      msg("Unesite upit!", "err");
      return;
    }

    setLoading(true);

    try {
      const odgovor = await pitajGemini({
        modul,
        poruka: upit,
        podaci: {
          aplikacija: "Maropack",
          napomena: "Korisnik želi praktičan predlog za proizvodnju, kalkulaciju, ponudu, magacin ili radni nalog."
        }
      });

      const noviRezultat = {
        tip: "gemini",
        naslov: "🤖 Gemini AI odgovor",
        sadrzaj: odgovor || "Nema odgovora.",
        model: "gemini",
        modul
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
    setModul(m || "kalkulacije");
    setUpit(pitanje);
  }

  return (
    <div>
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
          Kalkulacije, ponude, magacin i radni nalozi iz jednog AI modula.
        </div>
      </div>

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
            <label style={lbl}>Tvoje pitanje / zahtev</label>
            <textarea
              style={Object.assign({}, inp, { height: 86, resize: "vertical", fontSize: 14 })}
              value={upit}
              onChange={function (e) { setUpit(e.target.value); }}
              placeholder="npr: Napravi ponudu za BOPP/CPP 85mm, 25.000m za kupca Mayer"
              onKeyDown={function (e) {
                if (e.key === "Enter" && e.ctrlKey) analiziraj();
              }}
            />
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
              Ctrl+Enter za slanje
            </div>
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
          {loading ? "🤔 Gemini analizira..." : "🚀 Pošalji Gemini AI"}
        </button>
      </div>

      {rezultat && (
        <div
          style={Object.assign({}, card, {
            background: rezultat.tip === "greska" ? "#fef2f2" : "#f0fdf4",
            border: "2px solid " + (rezultat.tip === "greska" ? "#fecaca" : "#bbf7d0"),
            marginBottom: 16
          })}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 24 }}>{rezultat.tip === "greska" ? "⚠️" : "🤖"}</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: rezultat.tip === "greska" ? "#991b1b" : "#166534" }}>
                {rezultat.naslov}
              </div>
              {rezultat.model && (
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                  Modul: {rezultat.modul} · Model: {rezultat.model}
                </div>
              )}
            </div>
          </div>

          <div style={{ fontSize: 14, lineHeight: 1.65, color: "#1e293b", whiteSpace: "pre-line" }}>
            {rezultat.sadrzaj}
          </div>
        </div>
      )}

      {istorija.length > 0 && (
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#64748b" }}>
              📜 Istorija pitanja ({istorija.length})
            </div>
            <button
              onClick={function () { setIstorija([]); setRezultat(null); }}
              style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
            >
              Obriši istoriju
            </button>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {istorija.slice().reverse().map(function (item, i) {
              return (
                <button
                  key={i}
                  onClick={function () { setRezultat(item.odgovor); }}
                  style={{ background: "#f8fafc", borderRadius: 8, padding: 10, border: "1px solid #e2e8f0", cursor: "pointer", textAlign: "left" }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8", marginBottom: 4 }}>
                    {item.modul}: {item.upit}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{item.vreme}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {istorija.length === 0 && !rezultat && (
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#64748b" }}>
            ⚡ Brzi primeri:
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {[
              ["Napravi ponudu za BOPP/CPP 85mm, 25.000m za kupca Mayer", "ponude"],
              ["Koji materijal preporučuješ za pakovanje hrane?", "kalkulacije"],
              ["Iz packing liste izvuci materijal, širinu, kg i lot", "magacin"],
              ["Napravi predlog radnog naloga za triplex za kafu", "radni_nalozi"],
              ["Optimizuj sečenje za rolne širine 1000mm", "secenje"]
            ].map(function (x) {
              return (
                <button
                  key={x[0]}
                  onClick={function () { quick(x[0], x[1]); }}
                  style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left" }}
                >
                  💬 {x[0]}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
