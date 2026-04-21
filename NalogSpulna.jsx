import { useState, useRef } from "react";
import { LOGO_B64, SPULNA_B64 } from "./constants.js";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const dnow = () => new Date().toLocaleDateString("sr-RS");

export default function NalogSpulna({ nalog, onClose }) {
  const printRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const [datumPor, setDatumPor] = useState(nalog.datum || dnow());
  const [datumIsp, setDatumIsp] = useState("");
  const [brPor, setBrPor] = useState("");
  const [datumPak, setDatumPak] = useState("");
  const [uradjeno, setUradjeno] = useState("");
  const [napomena, setNapomena] = useState(nalog.nap || "");
  // Čeklista - 36 špulni x 8 kolona
  const [checklist, setChecklist] = useState(
    Array(36).fill(null).map(() => Array(8).fill(""))
  );

  const sp = nalog.spulnaData || {};

  async function downloadPDF() {
    if (!printRef.current) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      if (pdfH > 297) {
        // Višestranični PDF
        const pageH = 297;
        let y = 0;
        while (y < pdfH) {
          if (y > 0) pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, -y, pdfW, pdfH);
          y += pageH;
        }
      } else {
        pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
      }
      pdf.save("Nalog-Spulna-" + nalog.ponBr + ".pdf");
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const inp = { width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, color: "#1e293b", background: "#f8fafc", outline: "none", boxSizing: "border-box" };
  const lbl = { fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3, display: "block" };
  const field = { background: "#f8fafc", borderRadius: 6, padding: "6px 9px", border: "1px solid #e8edf3" };
  const fieldLabel = { fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 };
  const fieldVal = { fontSize: 12, fontWeight: 600, color: "#0f172a" };

  const checkHeaders = ["Poč. šp.", "1. nast.", "2. nast.", "3. nast.", "4. nast.", "5. nast.", "6. nast.", "Kraj šp."];

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 10000, overflow: "auto", padding: 20 }}>
      {/* Toolbar */}
      <div style={{ background: "#0f172a", borderRadius: 10, padding: "10px 16px", marginBottom: 12, display: "flex", gap: 10, alignItems: "center", position: "sticky", top: 0, zIndex: 1 }}>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, flex: 1 }}>🔄 Radni nalog — Špulna · {nalog.ponBr}</div>
        <button onClick={() => window.print()} style={{ padding: "7px 16px", borderRadius: 7, border: "none", background: "#7c3aed", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>🖨️ Štampaj</button>
        <button onClick={downloadPDF} style={{ padding: "7px 16px", borderRadius: 7, border: "none", background: "#1d4ed8", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "⏳..." : "⬇️ PDF"}
        </button>
        <button onClick={onClose} style={{ padding: "7px 14px", borderRadius: 7, border: "1px solid #334155", background: "transparent", color: "#94a3b8", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>✕ Zatvori</button>
      </div>

      {/* Ručna polja */}
      <div style={{ background: "#fff", borderRadius: 10, padding: 16, marginBottom: 12, border: "1px solid #e2e8f0" }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#7c3aed" }}>✏️ Unesi podatke pre štampe</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
          <div><label style={lbl}>Datum porudžbine</label><input style={inp} value={datumPor} onChange={e => setDatumPor(e.target.value)} /></div>
          <div><label style={lbl}>Datum isporuke</label><input style={inp} value={datumIsp} onChange={e => setDatumIsp(e.target.value)} /></div>
          <div><label style={lbl}>Br. porudžbine</label><input style={inp} value={brPor} onChange={e => setBrPor(e.target.value)} /></div>
          <div><label style={lbl}>Datum pakovanja</label><input style={inp} value={datumPak} onChange={e => setDatumPak(e.target.value)} /></div>
          <div><label style={lbl}>Urađeno</label><input style={inp} value={uradjeno} onChange={e => setUradjeno(e.target.value)} /></div>
        </div>
        <div style={{ marginTop: 10 }}><label style={lbl}>Napomena</label><textarea style={{ ...inp, height: 50, resize: "vertical" }} value={napomena} onChange={e => setNapomena(e.target.value)} /></div>
      </div>

      {/* A4 NALOG */}
      <div ref={printRef} style={{ background: "#fff", width: "210mm", margin: "0 auto", padding: "10mm 8mm", fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: 10, color: "#0f172a", boxSizing: "border-box" }}>

        {/* ZAGLAVLJE */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 8, borderBottom: "3px solid #7c3aed", marginBottom: 10 }}>
          <div>
            <img src={LOGO_B64} alt="Maropack" style={{ height: 38, objectFit: "contain" }} />
            <div style={{ fontSize: 8, color: "#64748b", marginTop: 2 }}>Fleksibilna ambalaža · Rakovac · Srbija</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#7c3aed" }}>NALOG ZA PROIZVODNJU ŠPULNI</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 8, color: "#64748b" }}>RB naloga:</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#7c3aed" }}>{nalog.ponBr || "—"}</div>
            <div style={{ fontSize: 8, color: "#64748b", marginTop: 2 }}>Datum: <b>{datumPor}</b></div>
            <div style={{ fontSize: 8, color: "#64748b" }}>Br. por.: <b>{brPor || "—"}</b></div>
            <div style={{ fontSize: 8, color: "#64748b" }}>Isporuka: <b>{datumIsp || "—"}</b></div>
          </div>
        </div>

        {/* KUPAC I MATERIJAL */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, marginBottom: 8 }}>
          <div style={field}><div style={fieldLabel}>Kupac</div><div style={fieldVal}>{nalog.kupac || "—"}</div></div>
          <div style={field}><div style={fieldLabel}>Naziv proizvoda</div><div style={{ ...fieldVal, fontSize: 10 }}>{nalog.prod || sp.naziv || "—"}</div></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
            <div style={field}><div style={fieldLabel}>Materijal</div><div style={{ ...fieldVal, fontSize: 10 }}>{sp.materijal || "—"}</div></div>
            <div style={field}><div style={fieldLabel}>Šir. mat. mm</div><div style={fieldVal}>{sp.sirina_mat || "—"}</div></div>
          </div>
        </div>

        {/* DIMENZIJE + SKICA */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          {/* Dimenzije */}
          <div>
            <div style={{ ...field, padding: "6px 9px", marginBottom: 6 }}>
              <div style={{ ...fieldLabel, color: "#7c3aed", marginBottom: 6 }}>📐 Dimenzije špulne</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                {[
                  ["Side A", sp.side_a || "—"],
                  ["Side B", sp.side_b || "—"],
                  ["W - širina trake mm", sp.W || "—"],
                  ["da - spoljašnji prečnik hilzne mm", sp.da || "—"],
                  ["di - unutrašnji prečnik mm", sp.di || "—"],
                  ["C mm", sp.C || "0"],
                  ["G - gap mm", sp.G || "0"],
                  ["T - širina hilzne mm", sp.T || "—"],
                  ["D - max prečnik mm", sp.D || "—"],
                  ["Max metara na špulni", sp.max_metara || "—"],
                ].map(x => (
                  <div key={x[0]} style={{ ...field, padding: "4px 7px" }}>
                    <div style={{ ...fieldLabel, fontSize: 8 }}>{x[0]}</div>
                    <div style={{ ...fieldVal, fontSize: 11, color: "#7c3aed" }}>{x[1]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skica + količine */}
          <div>
            <img src={SPULNA_B64} alt="Skica šulne" style={{ width: "100%", borderRadius: 6, border: "1px solid #e2e8f0", marginBottom: 6 }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {[
                ["Poručeno m²", sp.poruceno_m2 || nalog.kol || "—"],
                ["Za rad m²", sp.poruceno_m2 || nalog.kol || "—"],
                ["Potrebno špulni", sp.broj_spulni || "—"],
                ["Broj špulni za rad", sp.broj_spulni || "—"],
                ["Broj hilzni", sp.broj_spulni || "—"],
                ["Potrebno kutija", sp.broj_spulni || "—"],
                ["Potrebno kg mat.", sp.kg || "—"],
                ["Ukupno metara", sp.ukupno_m || "—"],
              ].map(x => (
                <div key={x[0]} style={{ ...field, padding: "4px 7px" }}>
                  <div style={{ ...fieldLabel, fontSize: 8 }}>{x[0]}</div>
                  <div style={{ ...fieldVal, fontSize: 11 }}>{x[1]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PAKOVANJE */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 5, marginBottom: 8 }}>
          <div style={field}><div style={fieldLabel}>Pakovanje u kutije</div><div style={fieldVal}>{sp.pakovanje_kutije || "—"}</div></div>
          <div style={field}><div style={fieldLabel}>Paletno pakovanje</div><div style={fieldVal}>{sp.paletno || "—"}</div></div>
          <div style={field}><div style={fieldLabel}>Broj paleta</div><div style={fieldVal}>{sp.broj_paleta || "—"}</div></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
            <div style={field}><div style={fieldLabel}>Datum pak.</div><div style={fieldVal}>{datumPak || "—"}</div></div>
            <div style={field}><div style={fieldLabel}>Urađeno</div><div style={fieldVal}>{uradjeno || "—"}</div></div>
          </div>
        </div>

        {/* NAPOMENA */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ ...field, borderLeft: "3px solid #7c3aed" }}>
            <div style={{ ...fieldLabel, color: "#6b21a8" }}>Napomena</div>
            <div style={{ fontSize: 10, minHeight: 18 }}>{napomena || "—"}</div>
          </div>
        </div>

        {/* ČEK LISTA */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Ček lista špulni — Provera materijala na svakom nastavku rolne</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 8 }}>
            <thead>
              <tr style={{ background: "#7c3aed20" }}>
                <th style={{ padding: "3px 4px", textAlign: "center", border: "0.5px solid #e2e8f0", width: 28, color: "#7c3aed", fontWeight: 700 }}>R.br</th>
                {checkHeaders.map(h => (
                  <th key={h} style={{ padding: "3px 4px", textAlign: "center", border: "0.5px solid #e2e8f0", color: "#7c3aed", fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array(36).fill(null).map((_, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                  <td style={{ padding: "2px 4px", textAlign: "center", border: "0.5px solid #e2e8f0", fontSize: 8, color: "#94a3b8", fontWeight: 600 }}>{i + 1}</td>
                  {Array(8).fill(null).map((_, j) => (
                    <td key={j} style={{ border: "0.5px solid #e2e8f0", height: 14, padding: 0 }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* POTPISI */}
        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
          {["Nalog izradio", "Datum naloga", "Nalog odobrio"].map(s => (
            <div key={s} style={{ textAlign: "center" }}>
              <div style={{ width: 120, borderBottom: "1px solid #0f172a", margin: "0 auto 3px", height: 20 }} />
              <div style={{ fontSize: 8, color: "#64748b" }}>{s}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
