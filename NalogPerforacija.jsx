import { useState, useRef } from "react";
import { LOGO_B64 } from "./constants.js";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { supabase } from "./supabase.js";

const dnow = () => new Date().toLocaleDateString("sr-RS");

export default function NalogPerforacija({ nalog, onClose, msg }) {
  const printRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [datumPor, setDatumPor] = useState(nalog.datum || dnow());
  const [datumIsp, setDatumIsp] = useState("");
  const [brPor, setBrPor] = useState("");
  const [oblikPerf, setOblikPerf] = useState("");
  const [orijPerf, setOrijPerf] = useState("Poprečna");
  const [dimPerf, setDimPerf] = useState("");
  const [razmakPerf, setRazmakPerf] = useState("");
  const [brTraka, setBrTraka] = useState("");
  const [smerOdm, setSmerOdm] = useState("Na noge");
  const [hilzna, setHilzna] = useState("76 mm");
  const [precnikRolne, setPrecnikRolne] = useState("");
  const [napomena, setNapomena] = useState(nalog.nap || "");
  const [napOperatera, setNapOperatera] = useState("");
  const [crtezLink, setCrtezLink] = useState(nalog.link_perforacija || null);

  const mats = (nalog.mats || []).filter(m => m.tip);
  const res = nalog.res || {};
  const BOJE = ["#1d4ed8", "#7c3aed", "#0891b2", "#059669"];
  const SLOJ = ["A", "B", "C", "D"];

  async function uploadCrtez(file) {
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = "nalog_" + nalog.id + "/perf_crtez_" + Date.now() + "." + ext;
      const { error: upErr } = await supabase.storage.from('maropack-files').upload(path, file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('maropack-files').getPublicUrl(path);
      setCrtezLink(urlData.publicUrl);
      if (msg) msg("Crtež uploadovan!");
    } catch (e) { if (msg) msg("Greška upload: " + e.message, "err"); }
    setUploading(false);
  }

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
      pdf.save("Nalog-Perforacija-" + nalog.ponBr + ".pdf");
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const inp = { width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, color: "#1e293b", background: "#f8fafc", outline: "none", boxSizing: "border-box" };
  const lbl = { fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3, display: "block" };
  const field = { background: "#f8fafc", borderRadius: 6, padding: "6px 9px", border: "1px solid #e8edf3" };
  const fieldLabel = { fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 };
  const fieldVal = { fontSize: 12, fontWeight: 600, color: "#0f172a" };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 10000, overflow: "auto", padding: 20 }}>
      {/* Toolbar */}
      <div style={{ background: "#0f172a", borderRadius: 10, padding: "10px 16px", marginBottom: 12, display: "flex", gap: 10, alignItems: "center", position: "sticky", top: 0, zIndex: 1 }}>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, flex: 1 }}>🔵 Nalog za perforaciju · {nalog.ponBr}</div>
        <button onClick={() => window.print()} style={{ padding: "7px 16px", borderRadius: 7, border: "none", background: "#8b5cf6", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>🖨️ Štampaj</button>
        <button onClick={downloadPDF} style={{ padding: "7px 16px", borderRadius: 7, border: "none", background: "#1d4ed8", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "⏳..." : "⬇️ PDF"}
        </button>
        <button onClick={onClose} style={{ padding: "7px 14px", borderRadius: 7, border: "1px solid #334155", background: "transparent", color: "#94a3b8", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>✕ Zatvori</button>
      </div>

      {/* Ručna polja */}
      <div style={{ background: "#fff", borderRadius: 10, padding: 16, marginBottom: 12, border: "1px solid #e2e8f0" }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#8b5cf6" }}>✏️ Unesi podatke pre štampe</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
          <div><label style={lbl}>Datum porudžbine</label><input style={inp} value={datumPor} onChange={e => setDatumPor(e.target.value)} /></div>
          <div><label style={lbl}>Datum isporuke</label><input style={inp} value={datumIsp} onChange={e => setDatumIsp(e.target.value)} /></div>
          <div><label style={lbl}>Br. porudžbine</label><input style={inp} value={brPor} onChange={e => setBrPor(e.target.value)} /></div>
          <div><label style={lbl}>Oblik perforacije</label><input style={inp} value={oblikPerf} onChange={e => setOblikPerf(e.target.value)} placeholder="npr. Okrugla, Ovalna..." /></div>
          <div><label style={lbl}>Orijentacija</label>
            <select style={inp} value={orijPerf} onChange={e => setOrijPerf(e.target.value)}>
              <option>Poprečna</option><option>Uzdužna</option><option>Dijagonalna</option>
            </select>
          </div>
          <div><label style={lbl}>Dimenzije perforacije</label><input style={inp} value={dimPerf} onChange={e => setDimPerf(e.target.value)} placeholder="npr. ø6mm" /></div>
          <div><label style={lbl}>Razmak između perf. mm</label><input style={inp} value={razmakPerf} onChange={e => setRazmakPerf(e.target.value)} /></div>
          <div><label style={lbl}>Br. traka po širini</label><input style={inp} value={brTraka} onChange={e => setBrTraka(e.target.value)} /></div>
          <div><label style={lbl}>Smer odmotavanja</label>
            <select style={inp} value={smerOdm} onChange={e => setSmerOdm(e.target.value)}>
              <option>Na noge</option><option>Na glavu</option><option>Levo</option><option>Desno</option>
            </select>
          </div>
          <div><label style={lbl}>Hilzna</label><input style={inp} value={hilzna} onChange={e => setHilzna(e.target.value)} /></div>
          <div><label style={lbl}>Prečnik finalne rolne</label><input style={inp} value={precnikRolne} onChange={e => setPrecnikRolne(e.target.value)} /></div>
        </div>

        {/* Upload crteža */}
        <div style={{ marginTop: 12, padding: 12, background: "#f8f5ff", borderRadius: 8, border: "1px solid #ddd6fe" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed", marginBottom: 8 }}>📐 Tehnički crtež perforacije</div>
          {crtezLink ? (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <a href={crtezLink} target="_blank" rel="noopener" style={{ color: "#7c3aed", fontSize: 12 }}>Otvori crtež ↗</a>
              <button onClick={() => setCrtezLink(null)} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #fecaca", background: "#fef2f2", color: "#ef4444", fontSize: 11, cursor: "pointer" }}>✕ Ukloni</button>
            </div>
          ) : (
            <label style={{ cursor: "pointer" }}>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) uploadCrtez(e.target.files[0]); }} />
              <div style={{ padding: "10px 14px", borderRadius: 6, border: "2px dashed #c4b5fd", textAlign: "center", fontSize: 12, color: "#7c3aed" }}>
                {uploading ? "⏳ Upload..." : "+ Dodaj tehnički crtež (PDF/JPG/PNG)"}
              </div>
            </label>
          )}
        </div>

        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={lbl}>Napomena</label><textarea style={{ ...inp, height: 50, resize: "vertical" }} value={napomena} onChange={e => setNapomena(e.target.value)} /></div>
          <div><label style={lbl}>Napomene operatera</label><textarea style={{ ...inp, height: 50, resize: "vertical" }} value={napOperatera} onChange={e => setNapOperatera(e.target.value)} /></div>
        </div>
      </div>

      {/* A4 NALOG */}
      <div ref={printRef} style={{ background: "#fff", width: "210mm", minHeight: "297mm", margin: "0 auto", padding: "12mm 10mm", fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: 11, color: "#0f172a", boxSizing: "border-box" }}>

        {/* ZAGLAVLJE */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 10, borderBottom: "3px solid #8b5cf6", marginBottom: 12 }}>
          <div>
            <img src={LOGO_B64} alt="Maropack" style={{ height: 40, objectFit: "contain" }} />
            <div style={{ fontSize: 9, color: "#64748b", marginTop: 3 }}>Fleksibilna ambalaža · Rakovac · Srbija</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#8b5cf6" }}>NALOG ZA PERFORACIJU</div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>🔵 Nalog za operaciju perforacije</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#64748b" }}>RB naloga:</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#8b5cf6" }}>{nalog.ponBr || "—"}</div>
            <div style={{ fontSize: 9, color: "#64748b", marginTop: 3 }}>Datum: <b>{datumPor}</b></div>
            <div style={{ fontSize: 9, color: "#64748b" }}>Isporuka: <b>{datumIsp || "—"}</b></div>
          </div>
        </div>

        {/* KUPAC, NAZIV */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
          <div style={field}><div style={fieldLabel}>Kupac</div><div style={fieldVal}>{nalog.kupac || "—"}</div></div>
          <div style={field}><div style={fieldLabel}>Naziv proizvoda</div><div style={{ ...fieldVal, fontSize: 11 }}>{nalog.prod || nalog.naziv || "—"}</div></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <div style={field}><div style={fieldLabel}>Br. porudžbine</div><div style={fieldVal}>{brPor || "—"}</div></div>
            <div style={field}><div style={fieldLabel}>Datum isporuke</div><div style={fieldVal}>{datumIsp || "—"}</div></div>
          </div>
        </div>

        {/* MATERIJALI */}
        <div style={{ ...field, marginBottom: 8 }}>
          <div style={{ ...fieldLabel, color: "#8b5cf6", marginBottom: 6 }}>🧪 Materijali koji se perforiraju</div>
          {mats.length > 0 ? mats.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "4px 0", borderBottom: i < mats.length - 1 ? "1px solid #f1f5f9" : "none" }}>
              <div style={{ width: 20, height: 20, borderRadius: 4, background: BOJE[i], color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{SLOJ[i]}</div>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{m.tip}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{m.deb}µ</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{m.tg ? (+m.tg).toFixed(2) + " g/m²" : ""}</div>
            </div>
          )) : <div style={{ color: "#94a3b8", fontSize: 11 }}>—</div>}
        </div>

        {/* SPECIFIKACIJA PERFORACIJE */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
          <div style={{ ...field }}>
            <div style={{ ...fieldLabel, color: "#8b5cf6", marginBottom: 6 }}>🔵 Specifikacija perforacije</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
              {[
                ["Oblik perforacije", oblikPerf || "—"],
                ["Orijentacija", orijPerf],
                ["Dimenzije", dimPerf || "—"],
                ["Razmak mm", razmakPerf || "—"],
                ["Širina trake mm", nalog.sir || "—"],
                ["Br. traka po širini", brTraka || "—"],
                ["Smer odmotavanja", smerOdm],
                ["Unutr. prečnik hilzne", hilzna],
                ["Prečnik fin. rolne", precnikRolne || "—"],
              ].map(x => (
                <div key={x[0]} style={{ ...field, padding: "4px 7px" }}>
                  <div style={fieldLabel}>{x[0]}</div>
                  <div style={{ ...fieldVal, fontSize: 11 }}>{x[1]}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            {/* Količine */}
            <div style={{ ...field, marginBottom: 6 }}>
              <div style={{ ...fieldLabel, color: "#1d4ed8", marginBottom: 6 }}>📊 Količine</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                {[
                  ["Poručena kol. m", nalog.kol ? (+nalog.kol).toLocaleString() + " m" : "—"],
                  ["Količina za rad m", nalog.kol ? Math.round(+nalog.kol * 1.1).toLocaleString() + " m" : "—"],
                  ["Potrebno kg", res.ukK ? (+res.ukK * (nalog.nal || 1)).toFixed(1) + " kg" : "—"],
                ].map(x => (
                  <div key={x[0]} style={{ ...field, padding: "4px 7px" }}>
                    <div style={fieldLabel}>{x[0]}</div>
                    <div style={{ ...fieldVal, fontSize: 11 }}>{x[1]}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tehnički crtež */}
            <div style={{ ...field, border: "1.5px dashed #c4b5fd", minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
              {crtezLink ? (
                <img src={crtezLink} alt="Crtez" style={{ maxWidth: "100%", maxHeight: 150, objectFit: "contain" }} />
              ) : (
                <>
                  <div style={{ fontSize: 24, color: "#c4b5fd" }}>📐</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", textAlign: "center" }}>Tehnički crtež perforacije</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* NAPOMENA */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ ...field, borderLeft: "3px solid #8b5cf6" }}>
            <div style={{ ...fieldLabel, color: "#6d28d9" }}>Napomena</div>
            <div style={{ fontSize: 11, minHeight: 20 }}>{napomena || "—"}</div>
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

        {/* NAPOMENE OPERATERA */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ ...field, borderLeft: "3px solid #94a3b8" }}>
            <div style={fieldLabel}>Napomene operatera · Proizvedena količina: ______________________</div>
            <div style={{ fontSize: 10, minHeight: 20, color: "#64748b" }}>{napOperatera || ""}</div>
          </div>
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
