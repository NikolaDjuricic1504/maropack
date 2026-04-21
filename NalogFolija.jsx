import { useState, useRef } from "react";
import { LOGO_B64 } from "./constants.js";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const f2 = v => (!v || isNaN(v)) ? "—" : (+v).toFixed(2).replace(".", ",");
const dnow = () => new Date().toLocaleDateString("sr-RS");

export default function NalogFolija({ nalog, onClose }) {
  const printRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Ručna polja
  const [datumPor, setDatumPor] = useState(nalog.datum || dnow());
  const [datumIsp, setDatumIsp] = useState("");
  const [brPor, setBrPor] = useState("");
  const [grafik, setGrafik] = useState("Novi posao");
  const [smerGP, setSmerGP] = useState("Na noge");
  const [smerStampa, setSmerStampa] = useState("Na glavu");
  const [perf, setPerf] = useState("NE");
  const [oblikPerf, setOblikPerf] = useState("");
  const [orijPerf, setOrijPerf] = useState("");
  const [pakKom, setPakKom] = useState("");
  const [pakKutije, setPakKutije] = useState("");
  const [pakPaletno, setPakPaletno] = useState("");
  const [dimKutije, setDimKutije] = useState("");
  const [napomena, setNapomena] = useState(nalog.nap || "");
  const [napOperatera, setNapOperatera] = useState("");
  const [stampano, setStampano] = useState(false);

  const res = nalog.res || {};
  const mats = (nalog.mats || []).filter(m => m.tip);

  async function downloadPDF() {
    if (!printRef.current) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
      pdf.save("Nalog-" + nalog.ponBr + ".pdf");
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const inp = { width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, color: "#1e293b", background: "#f8fafc", outline: "none", boxSizing: "border-box" };
  const lbl = { fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3, display: "block" };
  const field = { background: "#f8fafc", borderRadius: 6, padding: "6px 9px", border: "1px solid #e8edf3" };
  const fieldLabel = { fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 };
  const fieldVal = { fontSize: 12, fontWeight: 600, color: "#0f172a" };
  const BOJE = ["#1d4ed8", "#7c3aed", "#0891b2", "#059669"];
  const SLOJ = ["A", "B", "C", "D"];

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 10000, overflow: "auto", padding: 20 }}>
      {/* Toolbar */}
      <div style={{ background: "#0f172a", borderRadius: 10, padding: "10px 16px", marginBottom: 12, display: "flex", gap: 10, alignItems: "center", position: "sticky", top: 0, zIndex: 1 }}>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, flex: 1 }}>🧮 Radni nalog — Folija · {nalog.ponBr}</div>
        <button onClick={() => window.print()} style={{ padding: "7px 16px", borderRadius: 7, border: "none", background: "#1d4ed8", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>🖨️ Štampaj</button>
        <button onClick={downloadPDF} style={{ padding: "7px 16px", borderRadius: 7, border: "none", background: "#059669", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "⏳..." : "⬇️ PDF"}
        </button>
        <button onClick={onClose} style={{ padding: "7px 14px", borderRadius: 7, border: "1px solid #334155", background: "transparent", color: "#94a3b8", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>✕ Zatvori</button>
      </div>

      {/* Ručna polja - editovanje */}
      {!stampano && (
        <div style={{ background: "#fff", borderRadius: 10, padding: 16, marginBottom: 12, border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#1d4ed8" }}>✏️ Unesi podatke pre štampe</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
            <div><label style={lbl}>Datum porudžbine</label><input style={inp} value={datumPor} onChange={e => setDatumPor(e.target.value)} /></div>
            <div><label style={lbl}>Datum isporuke</label><input style={inp} value={datumIsp} onChange={e => setDatumIsp(e.target.value)} /></div>
            <div><label style={lbl}>Br. porudžbine</label><input style={inp} value={brPor} onChange={e => setBrPor(e.target.value)} /></div>
            <div><label style={lbl}>Grafičko rešenje</label>
              <select style={inp} value={grafik} onChange={e => setGrafik(e.target.value)}>
                <option>Novi posao</option><option>Reprint bez izmena</option><option>Reprint sa izmenama</option>
              </select>
            </div>
            <div><label style={lbl}>Smer odmotavanja GP</label>
              <select style={inp} value={smerGP} onChange={e => setSmerGP(e.target.value)}>
                <option>Na noge</option><option>Na glavu</option><option>Levo</option><option>Desno</option>
              </select>
            </div>
            <div><label style={lbl}>Smer odmotavanja štampa</label>
              <select style={inp} value={smerStampa} onChange={e => setSmerStampa(e.target.value)}>
                <option>Na glavu</option><option>Na noge</option><option>Levo</option><option>Desno</option>
              </select>
            </div>
            <div><label style={lbl}>Perforacija</label>
              <select style={inp} value={perf} onChange={e => setPerf(e.target.value)}>
                <option>NE</option><option>DA</option>
              </select>
            </div>
            {perf === "DA" && <>
              <div><label style={lbl}>Oblik perforacije</label><input style={inp} value={oblikPerf} onChange={e => setOblikPerf(e.target.value)} /></div>
              <div><label style={lbl}>Orijentacija perf.</label><input style={inp} value={orijPerf} onChange={e => setOrijPerf(e.target.value)} /></div>
            </>}
            <div><label style={lbl}>Pakovanje kom</label><input style={inp} value={pakKom} onChange={e => setPakKom(e.target.value)} /></div>
            <div><label style={lbl}>Pakovanje u kutije</label><input style={inp} value={pakKutije} onChange={e => setPakKutije(e.target.value)} /></div>
            <div><label style={lbl}>Dim. kutije</label><input style={inp} value={dimKutije} onChange={e => setDimKutije(e.target.value)} /></div>
            <div><label style={lbl}>Paletno pakovanje</label><input style={inp} value={pakPaletno} onChange={e => setPakPaletno(e.target.value)} /></div>
          </div>
          <div style={{ marginTop: 10 }}><label style={lbl}>Napomena</label><textarea style={{ ...inp, height: 50, resize: "vertical" }} value={napomena} onChange={e => setNapomena(e.target.value)} /></div>
          <div style={{ marginTop: 8 }}><label style={lbl}>Napomene operatera</label><textarea style={{ ...inp, height: 50, resize: "vertical" }} value={napOperatera} onChange={e => setNapOperatera(e.target.value)} /></div>
        </div>
      )}

      {/* A4 NALOG */}
      <div ref={printRef} style={{ background: "#fff", width: "210mm", minHeight: "297mm", margin: "0 auto", padding: "12mm 10mm", fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: 11, color: "#0f172a", boxSizing: "border-box" }}>

        {/* ZAGLAVLJE */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 10, borderBottom: "3px solid #1d4ed8", marginBottom: 12 }}>
          <div>
            <img src={LOGO_B64} alt="Maropack" style={{ height: 40, objectFit: "contain" }} />
            <div style={{ fontSize: 9, color: "#64748b", marginTop: 3 }}>Fleksibilna ambalaža · Rakovac · Srbija</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#1d4ed8", letterSpacing: -0.5 }}>NALOG ZA PROIZVODNJU</div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>🧮 Folija / Laminat</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#64748b" }}>RB naloga:</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#1d4ed8" }}>{nalog.ponBr || "—"}</div>
            <div style={{ fontSize: 9, color: "#64748b", marginTop: 3 }}>Datum: <b>{datumPor}</b></div>
            <div style={{ fontSize: 9, color: "#64748b" }}>Isporuka: <b>{datumIsp || "—"}</b></div>
          </div>
        </div>

        {/* RED 1 - Kupac, Naziv, Porudžbina */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
          <div style={field}><div style={fieldLabel}>Kupac</div><div style={fieldVal}>{nalog.kupac || "—"}</div></div>
          <div style={field}><div style={fieldLabel}>Naziv proizvoda</div><div style={{ ...fieldVal, fontSize: 11 }}>{nalog.prod || nalog.naziv || "—"}</div></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <div style={field}><div style={fieldLabel}>Br. porudžbine</div><div style={fieldVal}>{brPor || "—"}</div></div>
            <div style={field}><div style={fieldLabel}>Grafika</div><div style={{ ...fieldVal, fontSize: 10 }}>{grafik}</div></div>
          </div>
        </div>

        {/* SASTAV I DIMENZIJE */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
          <div style={{ ...field, padding: "6px 9px" }}>
            <div style={{ ...fieldLabel, marginBottom: 6 }}>Sastav gotovog proizvoda</div>
            <div style={{ fontWeight: 700, fontSize: 11, color: "#1d4ed8", marginBottom: 4 }}>
              {mats.map(m => m.tip + " " + m.deb + "µ").join(" + ") || "—"}
            </div>
            {mats.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "3px 0", borderBottom: i < mats.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                <div style={{ width: 18, height: 18, borderRadius: 3, background: BOJE[i], color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{SLOJ[i]}</div>
                <div style={{ flex: 1, fontSize: 11, fontWeight: 600 }}>{m.tip}</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>{m.deb}µ</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>{m.tg ? f2(m.tg) + " g/m²" : ""}</div>
                {m.stamp && <div style={{ fontSize: 9, color: "#0891b2", fontWeight: 700 }}>🖨️ STAMP.</div>}
                {m.kas > 0 && <div style={{ fontSize: 9, color: "#1d4ed8", fontWeight: 700 }}>🔗 {m.kas}x KAS.</div>}
                {m.lak > 0 && <div style={{ fontSize: 9, color: "#7c3aed", fontWeight: 700 }}>✨ {m.lak}x LAK.</div>}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <div style={field}><div style={fieldLabel}>Širina proizvoda</div><div style={fieldVal}>{nalog.sir || (res.det && res.det[0] ? "—" : "—")} mm</div></div>
            <div style={field}><div style={fieldLabel}>Idealna širina mat.</div><div style={fieldVal}>{nalog.sir ? Math.round(+nalog.sir * 1.05) + " mm" : "—"}</div></div>
            <div style={field}><div style={fieldLabel}>Poručena kol. m</div><div style={fieldVal}>{nalog.kol ? (+nalog.kol).toLocaleString() + " m" : "—"}</div></div>
            <div style={field}><div style={fieldLabel}>Količina za rad m</div><div style={fieldVal}>{nalog.kol ? Math.round(+nalog.kol * 1.1).toLocaleString() + " m" : "—"}</div></div>
            <div style={field}><div style={fieldLabel}>Smer odm. GP</div><div style={fieldVal}>{smerGP}</div></div>
            <div style={field}><div style={fieldLabel}>Perforacija</div><div style={fieldVal}>{perf}{perf === "DA" ? " · " + oblikPerf : ""}</div></div>
          </div>
        </div>

        {/* ŠTAMPA I KASIRANJE */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
          {/* Štampa */}
          <div style={{ ...field, padding: "6px 9px" }}>
            <div style={{ ...fieldLabel, marginBottom: 6, color: "#0891b2" }}>🖨️ Podaci za štampanje</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
              {[
                ["Štamparska mašina", mats.find(m => m.stamp) ? "—" : "NE"],
                ["Strana štampe", "—"],
                ["Obim valjka mm", "—"],
                ["Broj boja", "—"],
                ["Smer odm. sa štampe", smerStampa],
                ["Unutr. prečnik hilzne", "—"],
                ["Kliše", "—"],
                ["Broj traka po širini", "—"],
                ["Broj etiketa u m", "—"],
                ["Štamparija", "—"],
              ].map(x => (
                <div key={x[0]} style={{ ...field, padding: "4px 7px" }}>
                  <div style={fieldLabel}>{x[0]}</div>
                  <div style={{ ...fieldVal, fontSize: 11 }}>{x[1]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Kasiranje */}
          <div style={{ ...field, padding: "6px 9px" }}>
            <div style={{ ...fieldLabel, marginBottom: 6, color: "#1d4ed8" }}>🔗 Podaci za kaširanje</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
              {[
                ["Tip lepka", res.tipLepka || "—"],
                ["Odnos komponenti", "—"],
                ["Nanos lepka g/m²", "—"],
                ["Širina nanosa mm", "—"],
                ["Širina format. lepka", "—"],
                ["Kasiranje prolazi", res.kas ? res.kas + "x" : "—"],
              ].map(x => (
                <div key={x[0]} style={{ ...field, padding: "4px 7px" }}>
                  <div style={fieldLabel}>{x[0]}</div>
                  <div style={{ ...fieldVal, fontSize: 11 }}>{x[1]}</div>
                </div>
              ))}
            </div>

            <div style={{ ...fieldLabel, marginBottom: 6, marginTop: 8, color: "#059669" }}>📦 Potrebe materijala</div>
            {mats.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid #f1f5f9", fontSize: 10 }}>
                <span style={{ color: BOJE[i], fontWeight: 700 }}>{SLOJ[i]}: {m.tip} {m.deb}µ</span>
                <span>{res.det && res.det[i] ? f2(res.det[i].tkg_nalog) + " kg" : "—"}</span>
                <span style={{ color: "#64748b" }}>{nalog.kol ? (+nalog.kol).toLocaleString() + " m" : "—"}</span>
              </div>
            ))}
            {res.ukLep > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 10 }}>
                <span style={{ color: "#854d0e", fontWeight: 700 }}>🔗 Lepak</span>
                <span>{f2(res.ukLep_nalog)} kg</span>
              </div>
            )}
          </div>
        </div>

        {/* PAKOVANJE */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
          <div style={{ ...field, gridColumn: "1 / 5" }}>
            <div style={{ ...fieldLabel, marginBottom: 6 }}>📦 Pakovanje proizvoda</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 5 }}>
              <div style={field}><div style={fieldLabel}>Pakovanje kom</div><div style={fieldVal}>{pakKom || "—"}</div></div>
              <div style={field}><div style={fieldLabel}>Pakovanje u kutije</div><div style={fieldVal}>{pakKutije || "—"}</div></div>
              <div style={field}><div style={fieldLabel}>Dim. kutije</div><div style={fieldVal}>{dimKutije || "—"}</div></div>
              <div style={field}><div style={fieldLabel}>Paletno pakovanje</div><div style={fieldVal}>{pakPaletno || "—"}</div></div>
            </div>
          </div>
        </div>

        {/* NAPOMENA */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ ...field, borderLeft: "3px solid #f59e0b" }}>
            <div style={{ ...fieldLabel, color: "#92400e" }}>Napomena</div>
            <div style={{ fontSize: 11, minHeight: 24 }}>{napomena || "—"}</div>
          </div>
        </div>

        {/* NAPOMENE OPERATERA */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ ...field, borderLeft: "3px solid #94a3b8" }}>
            <div style={{ ...fieldLabel }}>Napomene operatera</div>
            <div style={{ fontSize: 11, minHeight: 24, color: "#64748b" }}>{napOperatera || ""}</div>
          </div>
        </div>

        {/* ZASTOJI */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Zastoji na mašini</div>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 4, fontSize: 10, alignItems: "center" }}>
              <span style={{ color: "#94a3b8", width: 40 }}>Od/do:</span>
              <div style={{ flex: 1, borderBottom: "1px dashed #cbd5e1", height: 16 }} />
              <span style={{ color: "#94a3b8" }}>Razlog:</span>
              <div style={{ flex: 2, borderBottom: "1px dashed #cbd5e1", height: 16 }} />
            </div>
          ))}
        </div>

        {/* POTPISI */}
        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
          {["Nalog izradio", "Datum naloga", "Nalog odobrio"].map(s => (
            <div key={s} style={{ textAlign: "center" }}>
              <div style={{ width: 130, borderBottom: "1px solid #0f172a", margin: "0 auto 4px", height: 24 }} />
              <div style={{ fontSize: 9, color: "#64748b" }}>{s}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
