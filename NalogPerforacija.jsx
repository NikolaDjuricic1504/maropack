import { useState, useRef } from "react";
import { LOGO_B64 } from "./constants.js";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const dnow = () => new Date().toLocaleDateString("sr-RS");

export default function NalogKesa({ nalog, onClose }) {
  const printRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const [datumPor, setDatumPor] = useState(nalog.datum || dnow());
  const [datumIsp, setDatumIsp] = useState("");
  const [brPor, setBrPor] = useState("");
  const [pakovanje, setPakovanje] = useState("");
  const [dimKutije, setDimKutije] = useState("");
  const [paletno, setPaletno] = useState("");
  const [napomena, setNapomena] = useState(nalog.nap || "Ne sme duža klapna, čvrsti, jaki i čisti savovi bez vlakana po ivicama");
  const [napOperatera, setNapOperatera] = useState("");
  const [skartStampa, setSkartStampa] = useState("");
  const [skartTehnol, setSkartTehnol] = useState("");

  const kesa = nalog.kesaData || {};
  const res = nalog.res || {};

  // Izračunaj vreme izrade
  const takta = kesa.takta || 100;
  const ban = kesa.ban || 1;
  const kolKom = nalog.kol || 0;
  const vremeIzrade = kolKom > 0 ? ((kolKom / takta / ban) / 60).toFixed(1) : "—";

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
      pdf.save("Nalog-Kesa-" + nalog.ponBr + ".pdf");
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const inp = { width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, color: "#1e293b", background: "#f8fafc", outline: "none", boxSizing: "border-box" };
  const lbl = { fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3, display: "block" };
  const field = { background: "#f8fafc", borderRadius: 6, padding: "6px 9px", border: "1px solid #e8edf3" };
  const fieldLabel = { fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 };
  const fieldVal = { fontSize: 12, fontWeight: 600, color: "#0f172a" };

  const DA_NE = v => v === "DA" || v === true || v === 1 ? "DA" : "NE";

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 10000, overflow: "auto", padding: 20 }}>
      {/* Toolbar */}
      <div style={{ background: "#0f172a", borderRadius: 10, padding: "10px 16px", marginBottom: 12, display: "flex", gap: 10, alignItems: "center", position: "sticky", top: 0, zIndex: 1 }}>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, flex: 1 }}>🛍️ Radni nalog — Kesa · {nalog.ponBr}</div>
        <button onClick={() => window.print()} style={{ padding: "7px 16px", borderRadius: 7, border: "none", background: "#059669", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>🖨️ Štampaj</button>
        <button onClick={downloadPDF} style={{ padding: "7px 16px", borderRadius: 7, border: "none", background: "#1d4ed8", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "⏳..." : "⬇️ PDF"}
        </button>
        <button onClick={onClose} style={{ padding: "7px 14px", borderRadius: 7, border: "1px solid #334155", background: "transparent", color: "#94a3b8", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>✕ Zatvori</button>
      </div>

      {/* Ručna polja */}
      <div style={{ background: "#fff", borderRadius: 10, padding: 16, marginBottom: 12, border: "1px solid #e2e8f0" }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#059669" }}>✏️ Unesi podatke pre štampe</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
          <div><label style={lbl}>Datum porudžbine</label><input style={inp} value={datumPor} onChange={e => setDatumPor(e.target.value)} /></div>
          <div><label style={lbl}>Datum isporuke</label><input style={inp} value={datumIsp} onChange={e => setDatumIsp(e.target.value)} /></div>
          <div><label style={lbl}>Br. porudžbine</label><input style={inp} value={brPor} onChange={e => setBrPor(e.target.value)} /></div>
          <div><label style={lbl}>Pakovanje</label><input style={inp} value={pakovanje} onChange={e => setPakovanje(e.target.value)} placeholder="npr. U bunt 200 kom" /></div>
          <div><label style={lbl}>Dim. kutije / prečnik rolne</label><input style={inp} value={dimKutije} onChange={e => setDimKutije(e.target.value)} /></div>
          <div><label style={lbl}>Paletno pakovanje</label><input style={inp} value={paletno} onChange={e => setPaletno(e.target.value)} /></div>
        </div>
        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={lbl}>Napomena</label><textarea style={{ ...inp, height: 50, resize: "vertical" }} value={napomena} onChange={e => setNapomena(e.target.value)} /></div>
          <div><label style={lbl}>Napomene operatera</label><textarea style={{ ...inp, height: 50, resize: "vertical" }} value={napOperatera} onChange={e => setNapOperatera(e.target.value)} /></div>
        </div>
      </div>

      {/* A4 NALOG */}
      <div ref={printRef} style={{ background: "#fff", width: "210mm", minHeight: "297mm", margin: "0 auto", padding: "12mm 10mm", fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: 11, color: "#0f172a", boxSizing: "border-box" }}>

        {/* ZAGLAVLJE */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 10, borderBottom: "3px solid #059669", marginBottom: 12 }}>
          <div>
            <img src={LOGO_B64} alt="Maropack" style={{ height: 40, objectFit: "contain" }} />
            <div style={{ fontSize: 9, color: "#64748b", marginTop: 3 }}>Fleksibilna ambalaža · Rakovac · Srbija</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#059669" }}>NALOG ZA PROIZVODNJU</div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>🛍️ Kesičarski nalog</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#64748b" }}>RB naloga:</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#059669" }}>{nalog.ponBr || "—"}</div>
            <div style={{ fontSize: 9, color: "#64748b", marginTop: 3 }}>Datum: <b>{datumPor}</b></div>
            <div style={{ fontSize: 9, color: "#64748b" }}>Isporuka: <b>{datumIsp || "—"}</b></div>
          </div>
        </div>

        {/* KUPAC, NAZIV, MATERIJAL */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
          <div style={field}><div style={fieldLabel}>Kupac</div><div style={fieldVal}>{nalog.kupac || "—"}</div></div>
          <div style={field}><div style={fieldLabel}>Naziv proizvoda</div><div style={{ ...fieldVal, fontSize: 11 }}>{nalog.prod || kesa.naziv || "—"}</div></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <div style={field}><div style={fieldLabel}>Materijal</div><div style={fieldVal}>{kesa.materijal || "—"}</div></div>
            <div style={field}><div style={fieldLabel}>Idealna šir. mat.</div><div style={fieldVal}>{kesa.sirina ? Math.round(+kesa.sirina * (kesa.ban || 1) + 20) + " mm" : "—"}</div></div>
          </div>
        </div>

        {/* TEHNIČKE DIMENZIJE KESE */}
        <div style={{ ...field, marginBottom: 8 }}>
          <div style={{ ...fieldLabel, color: "#059669", marginBottom: 8 }}>📐 Tehničke dimenzije kese</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 5 }}>
            {[
              ["Širina mm", kesa.sirina || "—"],
              ["Dužina mm", kesa.duzina || "—"],
              ["Klapna mm", kesa.klapna || "0"],
              ["Duplofan traka", kesa.duplofan || "—"],
              ["Eurozumba", DA_NE(kesa.eurozumba !== "NE" && kesa.eurozumba)],
              ["Okrugla zumba", DA_NE(kesa.okrugla_zumba !== "NE" && kesa.okrugla_zumba)],
              ["Var na dnu", DA_NE(kesa.var_dno)],
              ["Falta na dnu", DA_NE(kesa.falta)],
              ["Perforacija", DA_NE(kesa.perforacija)],
              ["Poprecni var", DA_NE(kesa.poprecni_var)],
              ["Pak. za hranu", DA_NE(kesa.pakovanje_za_hranu)],
              ["Anleger", kesa.anleger || "—"],
              ["Takta/min", kesa.takta || "—"],
              ["Ban", kesa.ban || "1"],
              ["Štampa", kesa.stampa || "Bez štampe"],
              ["Tolerancija", kesa.tolerancija || "—"],
            ].map(x => (
              <div key={x[0]} style={{ ...field, padding: "4px 6px" }}>
                <div style={{ ...fieldLabel, fontSize: 8 }}>{x[0]}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: x[1] === "DA" ? "#059669" : x[1] === "NE" ? "#94a3b8" : "#0f172a" }}>{x[1]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* KOLIČINE I VREME */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
          <div style={{ ...field }}>
            <div style={{ ...fieldLabel, color: "#1d4ed8", marginBottom: 6 }}>📊 Količine</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
              {[
                ["Poručena kol. kom", nalog.kol ? (+nalog.kol).toLocaleString() : "—"],
                ["Količina za rad kom", nalog.kol ? Math.round(+nalog.kol * 1.1).toLocaleString() : "—"],
                ["Poručena kol. m", res.kolM || "—"],
                ["Metara za rad", res.kolM ? Math.round(res.kolM * 1.1) : "—"],
                ["Potrebno kg mat.", res.ukKg ? (+res.ukKg).toFixed(1) : "—"],
                ["Br. porudžbine", brPor || "—"],
              ].map(x => (
                <div key={x[0]} style={{ ...field, padding: "4px 7px" }}>
                  <div style={fieldLabel}>{x[0]}</div>
                  <div style={{ ...fieldVal, fontSize: 11 }}>{x[1]}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ ...field }}>
            <div style={{ ...fieldLabel, color: "#f59e0b", marginBottom: 6 }}>⏱️ Vreme izrade</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
              {[
                ["Takta / min", kesa.takta || "—"],
                ["Ban", kesa.ban || "1"],
                ["Vreme podešavanja h", "1"],
                ["Ukupno vreme h", vremeIzrade],
                ["Datum podešavanja", "________________"],
                ["Od / Do h", "_____ / _____"],
              ].map(x => (
                <div key={x[0]} style={{ ...field, padding: "4px 7px" }}>
                  <div style={fieldLabel}>{x[0]}</div>
                  <div style={{ ...fieldVal, fontSize: 11 }}>{x[1]}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ ...fieldLabel, marginBottom: 4 }}>Početak izrade: ________________________</div>
              <div style={{ ...fieldLabel, marginBottom: 4 }}>Završetak izrade: _______________________</div>
              <div style={{ ...fieldLabel }}>Ukupno radnih sati: _________ Efektivni rad: _________</div>
            </div>
          </div>
        </div>

        {/* PAKOVANJE */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
          <div style={field}><div style={fieldLabel}>Pakovanje</div><div style={fieldVal}>{pakovanje || "—"}</div></div>
          <div style={field}><div style={fieldLabel}>Dim. kutije / prečnik rolne</div><div style={fieldVal}>{dimKutije || "—"}</div></div>
          <div style={field}><div style={fieldLabel}>Paletno pakovanje</div><div style={fieldVal}>{paletno || "—"}</div></div>
        </div>

        {/* ŠKART */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
          <div style={{ ...field, borderLeft: "3px solid #ef4444" }}>
            <div style={{ ...fieldLabel, color: "#991b1b" }}>Škart štampe/laminacije</div>
            <div style={{ height: 16, borderBottom: "1px dashed #cbd5e1" }} />
          </div>
          <div style={{ ...field, borderLeft: "3px solid #f59e0b" }}>
            <div style={{ ...fieldLabel, color: "#92400e" }}>Tehnološki škart</div>
            <div style={{ height: 16, borderBottom: "1px dashed #cbd5e1" }} />
          </div>
          <div style={{ ...field, borderLeft: "3px solid #64748b" }}>
            <div style={{ ...fieldLabel }}>Ukupan škart</div>
            <div style={{ height: 16, borderBottom: "1px dashed #cbd5e1" }} />
          </div>
        </div>

        {/* NAPOMENA */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ ...field, borderLeft: "3px solid #f59e0b" }}>
            <div style={{ ...fieldLabel, color: "#92400e" }}>Napomena</div>
            <div style={{ fontSize: 10, minHeight: 20 }}>{napomena}</div>
          </div>
        </div>

        {/* DUŽNOST RADNIKA */}
        <div style={{ marginBottom: 8, padding: "6px 9px", background: "#fffbeb", borderRadius: 6, border: "1px solid #fde68a" }}>
          <div style={{ fontSize: 8, color: "#92400e", lineHeight: 1.5 }}>
            Dužnost svih radnika koji učestvuju u izradi radnog naloga jeste da linija bude oslobođena nečistoća i stranih tela, da se redovno i bez izuzetka: proveravaju dimenzije, vrši proba na kidanje, kontroliše vizuelni izgled proizvoda, položaj štampe, kvalitet perforacije, kvalitet poprečnog vara.
          </div>
        </div>

        {/* ZASTOJI */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Zastoji na mašini</div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 3, fontSize: 9, alignItems: "center" }}>
              <span style={{ color: "#94a3b8", width: 35, flexShrink: 0 }}>Od/do:</span>
              <div style={{ width: 80, borderBottom: "1px dashed #cbd5e1", height: 14 }} />
              <span style={{ color: "#94a3b8" }}>Razlog:</span>
              <div style={{ flex: 1, borderBottom: "1px dashed #cbd5e1", height: 14 }} />
            </div>
          ))}
        </div>

        {/* NAPOMENE OPERATERA */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ ...field, borderLeft: "3px solid #94a3b8" }}>
            <div style={fieldLabel}>Napomene operatera</div>
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
