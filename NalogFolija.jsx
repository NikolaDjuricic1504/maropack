import { useState, useRef } from "react";
import { LOGO_B64 } from "./constants.js";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const dnow = () => new Date().toLocaleDateString("sr-RS");
const f2 = v => (!v || isNaN(v)) ? "—" : (+v).toFixed(2).replace(".", ",");
const BOJE = ["#1d4ed8", "#7c3aed", "#0891b2", "#059669"];
const SLOJ = ["A", "B", "C", "D"];

function Header({ boja, naslov, podnaslov, nalog, datumPor, datumIsp, brPor }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 8, borderBottom: "3px solid " + boja, marginBottom: 10 }}>
      <div>
        <img src={LOGO_B64} alt="Maropack" style={{ height: 36, objectFit: "contain" }} />
        <div style={{ fontSize: 8, color: "#64748b", marginTop: 2 }}>Fleksibilna ambalaža · Rakovac · Srbija</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: boja }}>{naslov}</div>
        {podnaslov && <div style={{ fontSize: 9, color: "#64748b", marginTop: 2 }}>{podnaslov}</div>}
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 8, color: "#64748b" }}>RB naloga:</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: boja }}>{nalog.ponBr || "—"}</div>
        <div style={{ fontSize: 8, color: "#64748b", marginTop: 2 }}>Datum: <b>{datumPor}</b></div>
        {datumIsp && <div style={{ fontSize: 8, color: "#64748b" }}>Isporuka: <b>{datumIsp}</b></div>}
        {brPor && <div style={{ fontSize: 8, color: "#64748b" }}>Br. por.: <b>{brPor}</b></div>}
      </div>
    </div>
  );
}

function Potpisi() {
  return (
    <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 8, display: "flex", justifyContent: "space-between", marginTop: 8 }}>
      {["Nalog izradio", "Datum naloga", "Nalog odobrio"].map(s => (
        <div key={s} style={{ textAlign: "center" }}>
          <div style={{ width: 110, borderBottom: "1px solid #0f172a", margin: "0 auto 3px", height: 20 }} />
          <div style={{ fontSize: 8, color: "#64748b" }}>{s}</div>
        </div>
      ))}
    </div>
  );
}

export default function NalogFolija({ nalog, onClose }) {
  const [sheet, setSheet] = useState("glavni");
  const [loading, setLoading] = useState(false);
  const refGlavni = useRef(null);
  const refRezanje = useRef(null);
  const refMaterijal = useRef(null);

  const [datumPor, setDatumPor] = useState(nalog.datum || dnow());
  const [datumIsp, setDatumIsp] = useState("");
  const [brPor, setBrPor] = useState("");
  const [grafik, setGrafik] = useState("Novi posao");
  const [smerGP, setSmerGP] = useState("Na noge");
  const [smerStampa, setSmerStampa] = useState("Na glavu");
  const [stampMasina, setStampMasina] = useState("");
  const [stranaStampe, setStranaStampe] = useState("Spoljašnja");
  const [obimValjka, setObimValjka] = useState("");
  const [brBoja, setBrBoja] = useState("");
  const [klise, setKlise] = useState("");
  const [hilzna, setHilzna] = useState("76 mm");
  const [precnikRolne, setPrecnikRolne] = useState("");
  const [tipLepka, setTipLepka] = useState("");
  const [odnosKomp, setOdnosKomp] = useState("");
  const [nanosLepka, setNanosLepka] = useState("");
  const [sirinaLepka, setSirinaLepka] = useState("");
  const [perf, setPerf] = useState("NE");
  const [oblikPerf, setOblikPerf] = useState("");
  const [orijPerf, setOrijPerf] = useState("");
  const [brTraka, setBrTraka] = useState("1");
  const [pakKom, setPakKom] = useState("");
  const [pakKutije, setPakKutije] = useState("");
  const [pakPaletno, setPakPaletno] = useState("");
  const [dimKutije, setDimKutije] = useState("");
  const [napomena, setNapomena] = useState(nalog.nap || "");
  const [napOperatera, setNapOperatera] = useState("");
  const [lokacija, setLokacija] = useState("Rakovac");
  const [dimPalete, setDimPalete] = useState("120x80");
  const [nacinPak, setNacinPak] = useState("");
  const [tolerancija, setTolercancija] = useState("±2");

  const res = nalog.res || {};
  const mats = (nalog.mats || []).filter(m => m.tip);
  const kolNalog = nalog.kol || 0;
  const kolZaRad = Math.round(kolNalog * 1.1);
  const sirProiz = nalog.sir || "";
  const idealSir = sirProiz ? Math.round(+sirProiz * (+brTraka || 1) + 20) : "";

  async function downloadAll() {
    setLoading(true);
    const refs = [refGlavni, refRezanje, refMaterijal];
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    try {
      for (let i = 0; i < refs.length; i++) {
        if (!refs[i].current) continue;
        const canvas = await html2canvas(refs[i].current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL("image/png");
        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = (canvas.height * pdfW) / canvas.width;
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, pdfW, Math.min(pdfH, 297));
      }
      pdf.save("Nalozi-" + (nalog.ponBr || "nalog") + ".pdf");
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const inp = { width: "100%", padding: "5px 8px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 11, color: "#1e293b", background: "#f8fafc", outline: "none", boxSizing: "border-box" };
  const lbl = { fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3, display: "block" };
  const F = { background: "#f8fafc", borderRadius: 5, padding: "4px 7px", border: "1px solid #e8edf3" };
  const FL = { fontSize: 8, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 1 };
  const FV = { fontSize: 10, fontWeight: 600, color: "#0f172a" };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 10000, overflow: "auto", padding: 20 }}>
      <div style={{ background: "#0f172a", borderRadius: 10, padding: "10px 16px", marginBottom: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", position: "sticky", top: 0, zIndex: 1 }}>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, flex: 1 }}>🧮 Radni nalozi — Folija · {nalog.ponBr}</div>
        {[["glavni", "📋 Glavni"], ["rezanje", "✂️ Rezanje"], ["materijal", "📦 Materijal"]].map(s => (
          <button key={s[0]} onClick={() => setSheet(s[0])} style={{ padding: "5px 12px", borderRadius: 6, border: sheet === s[0] ? "none" : "1px solid #334155", cursor: "pointer", fontSize: 11, fontWeight: 700, background: sheet === s[0] ? "#1d4ed8" : "transparent", color: sheet === s[0] ? "#fff" : "#94a3b8" }}>{s[1]}</button>
        ))}
        <button onClick={() => window.print()} style={{ padding: "5px 14px", borderRadius: 6, border: "none", background: "#1d4ed8", color: "#fff", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>🖨️ Štampaj</button>
        <button onClick={downloadAll} style={{ padding: "5px 14px", borderRadius: 6, border: "none", background: "#059669", color: "#fff", fontWeight: 700, fontSize: 11, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>{loading ? "⏳..." : "⬇️ Svi PDF"}</button>
        <button onClick={onClose} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #334155", background: "transparent", color: "#94a3b8", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>✕</button>
      </div>

      {/* Unos */}
      <div style={{ background: "#fff", borderRadius: 10, padding: 14, marginBottom: 12, border: "1px solid #e2e8f0" }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: "#1d4ed8" }}>✏️ Unesi podatke pre štampe</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
          {[["Datum porudžbine", datumPor, setDatumPor], ["Datum isporuke", datumIsp, setDatumIsp], ["Br. porudžbine", brPor, setBrPor], ["Hilzna", hilzna, setHilzna], ["Prečnik rolne max", precnikRolne, setPrecnikRolne], ["Tip lepka", tipLepka, setTipLepka], ["Odnos komponenti", odnosKomp, setOdnosKomp], ["Nanos lepka g/m²", nanosLepka, setNanosLepka], ["Širina nanosa mm", sirinaLepka, setSirinaLepka], ["Štamparska mašina", stampMasina, setStampMasina], ["Obim valjka mm", obimValjka, setObimValjka], ["Broj boja", brBoja, setBrBoja], ["Kliše", klise, setKlise], ["Br. traka po širini", brTraka, setBrTraka], ["Pakovanje kom", pakKom, setPakKom], ["Pakovanje u kutije", pakKutije, setPakKutije], ["Dim. kutije", dimKutije, setDimKutije], ["Paletno pakovanje", pakPaletno, setPakPaletno]].map(x => (
            <div key={x[0]}><label style={lbl}>{x[0]}</label><input style={inp} value={x[1]} onChange={e => x[2](e.target.value)} /></div>
          ))}
          <div><label style={lbl}>Grafička rešenje</label><select style={inp} value={grafik} onChange={e => setGrafik(e.target.value)}><option>Novi posao</option><option>Reprint bez izmena</option><option>Reprint sa izmenama</option></select></div>
          <div><label style={lbl}>Strana štampe</label><select style={inp} value={stranaStampe} onChange={e => setStranaStampe(e.target.value)}><option>Spoljašnja</option><option>Unutrašnja</option></select></div>
          <div><label style={lbl}>Smer odm. GP</label><select style={inp} value={smerGP} onChange={e => setSmerGP(e.target.value)}><option>Na noge</option><option>Na glavu</option><option>Levo</option><option>Desno</option></select></div>
          <div><label style={lbl}>Smer odm. štampa</label><select style={inp} value={smerStampa} onChange={e => setSmerStampa(e.target.value)}><option>Na glavu</option><option>Na noge</option><option>Levo</option><option>Desno</option></select></div>
          <div><label style={lbl}>Perforacija</label><select style={inp} value={perf} onChange={e => setPerf(e.target.value)}><option>NE</option><option>DA</option></select></div>
          {perf === "DA" && <>
            <div><label style={lbl}>Oblik perf.</label><input style={inp} value={oblikPerf} onChange={e => setOblikPerf(e.target.value)} /></div>
            <div><label style={lbl}>Orijentacija perf.</label><input style={inp} value={orijPerf} onChange={e => setOrijPerf(e.target.value)} /></div>
          </>}
        </div>
        <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div><label style={lbl}>Napomena</label><textarea style={{ ...inp, height: 40, resize: "vertical" }} value={napomena} onChange={e => setNapomena(e.target.value)} /></div>
          <div><label style={lbl}>Napomene operatera</label><textarea style={{ ...inp, height: 40, resize: "vertical" }} value={napOperatera} onChange={e => setNapOperatera(e.target.value)} /></div>
        </div>
      </div>

      {/* GLAVNI NALOG */}
      <div ref={refGlavni} style={{ display: sheet === "glavni" ? "block" : "none", background: "#fff", width: "210mm", minHeight: "297mm", margin: "0 auto", padding: "10mm 8mm", fontFamily: "'Segoe UI',system-ui,sans-serif", fontSize: 10, color: "#0f172a", boxSizing: "border-box" }}>
        <Header boja="#1d4ed8" naslov="NALOG ZA PROIZVODNJU" podnaslov="🧮 Folija / Laminat" nalog={nalog} datumPor={datumPor} datumIsp={datumIsp} brPor={brPor} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4, marginBottom: 6 }}>
          <div style={F}><div style={FL}>Kupac</div><div style={FV}>{nalog.kupac || "—"}</div></div>
          <div style={{ ...F, gridColumn: "2/4" }}><div style={FL}>Naziv proizvoda</div><div style={FV}>{nalog.prod || nalog.naziv || "—"}</div></div>
          <div style={F}><div style={FL}>Grafičko rešenje</div><div style={FV}>{grafik}</div></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 5, marginBottom: 6 }}>
          <div style={F}>
            <div style={{ ...FL, color: "#1d4ed8", marginBottom: 4 }}>Sastav gotovog proizvoda</div>
            <div style={{ fontWeight: 700, fontSize: 10, color: "#1d4ed8", marginBottom: 4 }}>{mats.map(m => m.tip + " " + m.deb + "µ").join(" + ") || "—"}</div>
            {mats.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 5, alignItems: "center", padding: "2px 0", borderBottom: i < mats.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                <div style={{ width: 15, height: 15, borderRadius: 3, background: BOJE[i], color: "#fff", fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{SLOJ[i]}</div>
                <div style={{ flex: 1, fontWeight: 600, fontSize: 10 }}>{m.tip}</div>
                <div style={{ fontSize: 9, color: "#64748b" }}>{m.deb}µ</div>
                <div style={{ fontSize: 9, color: "#64748b" }}>{m.tg ? (+m.tg).toFixed(2) + "g/m²" : ""}</div>
                {m.stamp && <span style={{ fontSize: 8, color: "#0891b2", fontWeight: 700 }}>STAMP.</span>}
                {m.kas > 0 && <span style={{ fontSize: 8, color: "#1d4ed8", fontWeight: 700 }}>{m.kas}×KAS.</span>}
                {m.lak > 0 && <span style={{ fontSize: 8, color: "#7c3aed", fontWeight: 700 }}>{m.lak}×LAK.</span>}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            {[["Širina proizvoda mm", sirProiz ? sirProiz + " mm" : "—"], ["Idealna širina mat.", idealSir ? idealSir + " mm" : "—"], ["Poručena kol. m", kolNalog ? kolNalog.toLocaleString() + " m" : "—"], ["Količina za rad m", kolZaRad ? kolZaRad.toLocaleString() + " m" : "—"], ["Smer odm. GP", smerGP], ["Perforacija", perf + (perf === "DA" ? " · " + oblikPerf : "")], ["Br. traka po širini", brTraka || "—"], ["Hilzna", hilzna]].map(x => <div key={x[0]} style={F}><div style={FL}>{x[0]}</div><div style={FV}>{x[1]}</div></div>)}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: 6 }}>
          <div style={F}>
            <div style={{ ...FL, color: "#0891b2", marginBottom: 4 }}>🖨️ Podaci za štampanje</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
              {[["Štamparska mašina", stampMasina || "—"], ["Strana štampe", stranaStampe], ["Obim valjka mm", obimValjka || "—"], ["Broj boja", brBoja || "—"], ["Smer odm. sa štampe", smerStampa], ["Unutr. prečnik hilzne", hilzna], ["Kliše", klise || "—"], ["Štamparija", "—"]].map(x => <div key={x[0]} style={{ ...F, padding: "3px 5px" }}><div style={{ ...FL, fontSize: 7 }}>{x[0]}</div><div style={{ ...FV, fontSize: 9 }}>{x[1]}</div></div>)}
            </div>
          </div>
          <div style={F}>
            <div style={{ ...FL, color: "#1d4ed8", marginBottom: 4 }}>🔗 Podaci za kaširanje</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
              {[["Tip lepka", tipLepka || "—"], ["Odnos komponenti", odnosKomp || "—"], ["Nanos lepka g/m²", nanosLepka || "—"], ["Širina nanosa mm", sirinaLepka || "—"], ["Kasiranje prolazi", res.kas ? res.kas + "×" : "—"], ["Lakiranje prolazi", res.lak ? res.lak + "×" : "—"]].map(x => <div key={x[0]} style={{ ...F, padding: "3px 5px" }}><div style={{ ...FL, fontSize: 7 }}>{x[0]}</div><div style={{ ...FV, fontSize: 9 }}>{x[1]}</div></div>)}
            </div>
            <div style={{ ...FL, color: "#059669", marginBottom: 3, marginTop: 5 }}>📦 Potrebe materijala</div>
            {mats.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: "1px solid #f1f5f9", fontSize: 8 }}>
                <span style={{ color: BOJE[i], fontWeight: 700 }}>{SLOJ[i]}: {m.tip} {m.deb}µ</span>
                <span style={{ fontWeight: 700 }}>{res.det && res.det[i] ? (+res.det[i].tkg_nalog || 0).toFixed(1) + " kg" : "—"}</span>
                <span style={{ color: "#64748b" }}>{kolNalog ? kolNalog.toLocaleString() + "m" : "—"}</span>
              </div>
            ))}
            {res.ukLep > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: 8 }}><span style={{ color: "#854d0e", fontWeight: 700 }}>🔗 Lepak</span><span>{(res.ukLep_nalog || 0).toFixed(2)} kg</span></div>}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4, marginBottom: 5 }}>
          {[["Pakovanje kom", pakKom || "—"], ["Pakovanje u kutije", pakKutije || "—"], ["Dim. kutije", dimKutije || "—"], ["Paletno pakovanje", pakPaletno || "—"]].map(x => <div key={x[0]} style={F}><div style={FL}>{x[0]}</div><div style={FV}>{x[1]}</div></div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: 5 }}>
          <div style={{ ...F, borderLeft: "3px solid #f59e0b" }}><div style={{ ...FL, color: "#92400e" }}>Napomena</div><div style={{ fontSize: 9, minHeight: 18 }}>{napomena || "—"}</div></div>
          <div style={{ ...F, borderLeft: "3px solid #94a3b8" }}><div style={FL}>Napomene operatera</div><div style={{ fontSize: 9, minHeight: 18, color: "#64748b" }}>{napOperatera || ""}</div></div>
        </div>
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 3 }}>Zastoji</div>
          {[1, 2, 3].map(i => <div key={i} style={{ display: "flex", gap: 6, marginBottom: 2, fontSize: 8, alignItems: "center" }}><span style={{ color: "#94a3b8", width: 32, flexShrink: 0 }}>Od/do:</span><div style={{ flex: 1, borderBottom: "1px dashed #cbd5e1", height: 12 }} /><span style={{ color: "#94a3b8" }}>Razlog:</span><div style={{ flex: 2, borderBottom: "1px dashed #cbd5e1", height: 12 }} /></div>)}
        </div>
        <Potpisi />
      </div>

      {/* NALOG ZA REZANJE */}
      <div ref={refRezanje} style={{ display: sheet === "rezanje" ? "block" : "none", background: "#fff", width: "210mm", minHeight: "297mm", margin: "0 auto", padding: "10mm 8mm", fontFamily: "'Segoe UI',system-ui,sans-serif", fontSize: 10, color: "#0f172a", boxSizing: "border-box" }}>
        <Header boja="#6366f1" naslov="SPECIFIKACIJA REZANJA" podnaslov="✂️ Nalog za interno rezanje" nalog={nalog} datumPor={datumPor} datumIsp={datumIsp} brPor={brPor} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 6 }}>
          <div style={F}><div style={FL}>Kupac</div><div style={FV}>{nalog.kupac || "—"}</div></div>
          <div style={F}><div style={FL}>Interno rezanje za</div><div style={FV}>{nalog.kupac || "—"}</div></div>
          <div style={{ ...F, gridColumn: "1/3" }}><div style={FL}>Vrsta materijala — Sastav</div><div style={FV}>{mats.map(m => m.tip + " " + m.deb + "µ").join(" + ") || "—"}</div></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 6 }}>
          {[["Debljina materijala", mats.reduce((s, m) => s + (+m.deb || 0), 0) + "µ"], ["Količina za rasecanje m", kolZaRad ? kolZaRad.toLocaleString() + " m" : "—"], ["Širina matične rolne mm", idealSir ? idealSir + " mm" : "—"], ["Broj traka u mat. rolni", brTraka || "—"], ["Širina traka mm", sirProiz ? Array(+brTraka || 1).fill(sirProiz + "mm").join("+") : "—"], ["Corona tretman", "—"], ["Lokacija rolne", lokacija], ["Dimenzija palete", dimPalete], ["Način pakovanja", nacinPak || "—"], ["Tolerancija u širini", tolerancija], ["Hilzna", hilzna], ["Prečnik rolne max", precnikRolne || "—"]].map(x => <div key={x[0]} style={F}><div style={FL}>{x[0]}</div><div style={FV}>{x[1]}</div></div>)}
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", marginBottom: 5 }}>Dimenzije rezanja</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9 }}>
            <thead>
              <tr style={{ background: "#6366f120" }}>
                {["Format", "Dim. mm", "Br. naloga", "Kupac - naziv proizvoda", "Hilzna", "Prečnik rolne", "Metraža", "Br. rolni", "Izlaz"].map(h => <th key={h} style={{ padding: "4px 5px", textAlign: "left", border: "0.5px solid #e2e8f0", color: "#6366f1", fontWeight: 700, fontSize: 8 }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {["I", "II", "III", "IV"].map((fmt, i) => (
                <tr key={fmt}>
                  <td style={{ padding: "5px", border: "0.5px solid #e2e8f0", fontWeight: 700 }}>FORMAT {fmt}</td>
                  <td style={{ padding: "5px", border: "0.5px solid #e2e8f0", color: i === 0 ? "#0f172a" : "#e2e8f0" }}>{i === 0 ? (sirProiz || "—") : ""}</td>
                  <td style={{ padding: "5px", border: "0.5px solid #e2e8f0", color: i === 0 ? "#1d4ed8" : "#e2e8f0" }}>{i === 0 ? (nalog.ponBr || "—") : ""}</td>
                  <td style={{ padding: "5px", border: "0.5px solid #e2e8f0", fontSize: 8, color: i === 0 ? "#0f172a" : "#e2e8f0" }}>{i === 0 ? (nalog.prod || nalog.naziv || "—") : ""}</td>
                  <td style={{ padding: "5px", border: "0.5px solid #e2e8f0", color: i === 0 ? "#0f172a" : "#e2e8f0" }}>{i === 0 ? hilzna : ""}</td>
                  <td style={{ padding: "5px", border: "0.5px solid #e2e8f0", color: i === 0 ? "#0f172a" : "#e2e8f0" }}>{i === 0 ? (precnikRolne || "—") : ""}</td>
                  <td style={{ padding: "5px", border: "0.5px solid #e2e8f0", color: i === 0 ? "#059669" : "#e2e8f0", fontWeight: i === 0 ? 700 : 400 }}>{i === 0 ? (kolZaRad ? kolZaRad.toLocaleString() + " m" : "—") : ""}</td>
                  <td style={{ padding: "5px", border: "0.5px solid #e2e8f0", height: 24 }}></td>
                  <td style={{ padding: "5px", border: "0.5px solid #e2e8f0" }}></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ ...F, borderLeft: "3px solid #6366f1", marginBottom: 6 }}><div style={{ ...FL, color: "#4338ca" }}>Napomena</div><div style={{ fontSize: 9, minHeight: 18 }}>{napomena || "—"}</div></div>
        <div style={{ ...F, borderLeft: "3px solid #94a3b8", marginBottom: 6 }}><div style={FL}>Napomene operatera</div><div style={{ minHeight: 20 }}></div></div>
        <Potpisi />
      </div>

      {/* NALOG ZA MATERIJAL */}
      <div ref={refMaterijal} style={{ display: sheet === "materijal" ? "block" : "none", background: "#fff", width: "210mm", minHeight: "297mm", margin: "0 auto", padding: "10mm 8mm", fontFamily: "'Segoe UI',system-ui,sans-serif", fontSize: 10, color: "#0f172a", boxSizing: "border-box" }}>
        <Header boja="#f59e0b" naslov="NALOG ZA POTREBU MATERIJALA" podnaslov="📦 Izdavanje iz magacina" nalog={nalog} datumPor={datumPor} datumIsp={datumIsp} brPor={brPor} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 8 }}>
          <div style={F}><div style={FL}>Kupac</div><div style={FV}>{nalog.kupac || "—"}</div></div>
          <div style={F}><div style={FL}>Naziv proizvoda</div><div style={FV}>{nalog.prod || nalog.naziv || "—"}</div></div>
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Potreba materijala za nalog</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, marginBottom: 10 }}>
          <thead>
            <tr style={{ background: "#fef3c7" }}>
              {["Sloj", "Materijal", "Širina mat. mm", "Metraža m", "Količina kg"].map(h => <th key={h} style={{ padding: "6px 8px", textAlign: "left", border: "0.5px solid #e2e8f0", color: "#92400e", fontWeight: 700 }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {mats.map((m, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "8px", border: "0.5px solid #e2e8f0" }}>
                  <div style={{ width: 18, height: 18, borderRadius: 3, background: BOJE[i], color: "#fff", fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{SLOJ[i]}</div>
                </td>
                <td style={{ padding: "8px", fontWeight: 600, border: "0.5px solid #e2e8f0" }}>{m.tip} {m.deb}µ</td>
                <td style={{ padding: "8px", border: "0.5px solid #e2e8f0" }}>{idealSir ? idealSir + " mm" : "—"}</td>
                <td style={{ padding: "8px", fontWeight: 700, color: "#1d4ed8", border: "0.5px solid #e2e8f0" }}>{kolZaRad ? kolZaRad.toLocaleString() + " m" : "—"}</td>
                <td style={{ padding: "8px", fontWeight: 700, color: "#059669", border: "0.5px solid #e2e8f0" }}>{res.det && res.det[i] ? (+res.det[i].tkg_nalog || 0).toFixed(2) + " kg" : "—"}</td>
              </tr>
            ))}
            {res.ukLep > 0 && (
              <tr style={{ background: "#fffbeb" }}>
                <td style={{ padding: "8px", border: "0.5px solid #e2e8f0" }}>🔗</td>
                <td style={{ padding: "8px", fontWeight: 600, border: "0.5px solid #e2e8f0" }}>Lepak</td>
                <td style={{ padding: "8px", border: "0.5px solid #e2e8f0" }}>—</td>
                <td style={{ padding: "8px", border: "0.5px solid #e2e8f0" }}>—</td>
                <td style={{ padding: "8px", fontWeight: 700, color: "#854d0e", border: "0.5px solid #e2e8f0" }}>{(res.ukLep_nalog || 0).toFixed(2)} kg</td>
              </tr>
            )}
            {[...Array(Math.max(2, 4 - mats.length))].map((_, i) => (
              <tr key={"e" + i}>{[...Array(5)].map((_, j) => <td key={j} style={{ padding: "8px", border: "0.5px solid #e2e8f0", height: 28 }}></td>)}</tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "#f8fafc", fontWeight: 700 }}>
              <td colSpan={3} style={{ padding: "8px", border: "0.5px solid #e2e8f0", textAlign: "right", color: "#64748b" }}>UKUPNO:</td>
              <td style={{ padding: "8px", border: "0.5px solid #e2e8f0", color: "#1d4ed8", fontWeight: 800 }}>{kolZaRad ? kolZaRad.toLocaleString() + " m" : "—"}</td>
              <td style={{ padding: "8px", border: "0.5px solid #e2e8f0", color: "#059669", fontWeight: 800 }}>{res.det ? (res.det.reduce((s, m) => s + (m.tkg_nalog || 0), 0) + (res.ukLep_nalog || 0)).toFixed(2) + " kg" : "—"}</td>
            </tr>
          </tfoot>
        </table>
        <div style={{ ...F, borderLeft: "3px solid #f59e0b", marginBottom: 6 }}><div style={{ ...FL, color: "#92400e" }}>Napomena</div><div style={{ fontSize: 9, minHeight: 18 }}>{napomena || "—"}</div></div>
        <Potpisi />
      </div>
    </div>
  );
}
