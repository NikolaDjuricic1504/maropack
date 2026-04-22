import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase.js";

const MAT_TIPOVI = [
  "BOPP","BOPP SEDEF","BOPP BELI","LDPE","CPP","PET","OPA","OPP","PLA","HDPE","ALU",
  "CELULOZA","CELOFAN","PA","PA/PE","CPP PLC","CPP PLCB","CPP PLCBZ","CPP PLCDF",
  "CPP PLCM","CPP PLCML","CPP PLCMLS","BOPP FXC","BOPP FXCB","BOPP FXCM","BOPP FXCMT",
  "BOPP FXPMT","BOPP FXCFM","BOPP FXCW","BOPP FXPF","BOPP FXS","BOPP FXA","BOPP FXAA",
  "BOPP FXPA","BOPP FXPM","BOPP FXPFM","BOPP FXPFB","BOPP FXPLA","BOPP FXPLF",
  "BOPP FXPU","BOPP FXCLS","BOPP FXCMLS","BOPP FXCHFM","BOPP FXPBR","BOPP FXCHM",
  "BOPP FXCMB","Papir","Papir silikonizani","OPP30","OPP35","CC White 55g","CC White 60g"
];

const dnow = () => new Date().toLocaleDateString("sr-RS");

function QRKod({ text, size = 80 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !text) return;
    ref.current.innerHTML = "";
    try {
      new window.QRCode(ref.current, {
        text, width: size, height: size,
        colorDark: "#0f172a", colorLight: "#ffffff",
        correctLevel: window.QRCode?.CorrectLevel?.M || 1
      });
    } catch (e) { ref.current.innerHTML = '<div style="font-size:9px;color:#94a3b8">QR</div>'; }
  }, [text, size]);
  return <div ref={ref} />;
}

export default function Magacin({ msg, inp, card, lbl, user }) {
  const [rolne, setRolne] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("stanje");
  const [filterTip, setFilterTip] = useState("");
  const [filterSirina, setFilterSirina] = useState("");
  const [filterStatus, setFilterStatus] = useState("aktivne");
  const [pregledRolne, setPregledRolne] = useState(null);
  const [form, setForm] = useState({
    tip: "", sirina: "", metraza: "", kg_bruto: "", kg_neto: "",
    lot: "", dobavljac: "", datum: dnow(), sch: "", palet: "", napomena: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadRolne(); }, []);

  // Load QRCode library
  useEffect(() => {
    if (window.QRCode) return;
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    document.head.appendChild(s);
  }, []);

  async function loadRolne() {
    setLoading(true);
    try {
      const { data } = await supabase.from('magacin').select('*').order('created_at', { ascending: false });
      setRolne(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function dodajRolnu() {
    if (!form.tip || !form.sirina || !form.metraza) { msg("Tip, širina i metraža su obavezni!", "err"); return; }
    setSaving(true);
    try {
      const brRolne = "R-" + new Date().getFullYear() + "-" + form.sch.replace("/", "-") || String(Date.now()).slice(-6);
      const { error } = await supabase.from('magacin').insert([{
        br_rolne: brRolne, tip: form.tip, sirina: +form.sirina,
        metraza: +form.metraza, metraza_ost: +form.metraza,
        kg_bruto: +form.kg_bruto || 0, kg_neto: +form.kg_neto || 0,
        lot: form.lot, dobavljac: form.dobavljac, datum: form.datum,
        sch: form.sch, palet: form.palet, napomena: form.napomena,
        status: "Na stanju"
      }]);
      if (error) throw error;
      msg("Rolna dodata!");
      setForm({ tip: "", sirina: "", metraza: "", kg_bruto: "", kg_neto: "", lot: "", dobavljac: "", datum: dnow(), sch: "", palet: "", napomena: "" });
      loadRolne();
      setTab("stanje");
    } catch (e) { msg("Greška: " + e.message, "err"); }
    setSaving(false);
  }

  async function promeniStatus(id, status) {
    try {
      await supabase.from('magacin').update({ status }).eq('id', id);
      setRolne(r => r.map(x => x.id === id ? { ...x, status } : x));
      if (pregledRolne?.id === id) setPregledRolne(r => ({ ...r, status }));
    } catch (e) { msg("Greška!", "err"); }
  }

  async function obrisi(id) {
    if (!confirm("Obrisati rolnu?")) return;
    try {
      await supabase.from('magacin').delete().eq('id', id);
      setRolne(r => r.filter(x => x.id !== id));
      setPregledRolne(null);
      msg("Rolna obrisana!");
    } catch (e) { msg("Greška!", "err"); }
  }

  const filtrirane = rolne.filter(r =>
    (!filterTip || r.tip === filterTip) &&
    (!filterSirina || String(r.sirina) === filterSirina) &&
    (filterStatus === "sve" || (filterStatus === "aktivne" ? r.status !== "Iskorišćeno" : r.status === "Iskorišćeno"))
  );

  const naStanju = rolne.filter(r => r.status === "Na stanju");
  const ukupnoM = naStanju.reduce((s, r) => s + (r.metraza_ost || 0), 0);
  const ukupnoKg = naStanju.reduce((s, r) => s + (r.kg_neto || 0), 0);
  const tipovi = [...new Set(rolne.map(r => r.tip))].sort();
  const sirine = [...new Set(rolne.filter(r => !filterTip || r.tip === filterTip).map(r => r.sirina))].sort((a, b) => a - b);

  const stBg = { "Na stanju": "#dcfce7", "Rezervisano": "#fef3c7", "Delimično": "#dbeafe", "Iskorišćeno": "#f1f5f9" };
  const stCl = { "Na stanju": "#166534", "Rezervisano": "#92400e", "Delimično": "#1e40af", "Iskorišćeno": "#94a3b8" };

  // PREGLED ROLNE SA QR
  if (pregledRolne) {
    const qrData = JSON.stringify({
      br: pregledRolne.br_rolne, tip: pregledRolne.tip,
      sir: pregledRolne.sirina, met: pregledRolne.metraza_ost,
      kg: pregledRolne.kg_neto, lot: pregledRolne.lot
    });
    return (
      <div>
        <button onClick={() => setPregledRolne(null)} style={{ padding: "8px 16px", borderRadius: 8, border: "1.5px solid #1d4ed8", background: "transparent", color: "#1d4ed8", cursor: "pointer", fontWeight: 700, fontSize: 13, marginBottom: 14 }}>← Nazad</button>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {/* Info */}
          <div style={card}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: "#1d4ed8" }}>{pregledRolne.br_rolne}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {[["Tip materijala", pregledRolne.tip], ["Širina", pregledRolne.sirina + " mm"], ["Ukupno metraža", (pregledRolne.metraza || 0).toLocaleString() + " m"], ["Ostalo metraže", (pregledRolne.metraza_ost || 0).toLocaleString() + " m"], ["Bruto kg", pregledRolne.kg_bruto + " kg"], ["Neto kg", pregledRolne.kg_neto + " kg"], ["LOT", pregledRolne.lot || "—"], ["Sch.", pregledRolne.sch || "—"], ["Palet", pregledRolne.palet || "—"], ["Dobavljač", pregledRolne.dobavljac || "—"], ["Datum prijema", pregledRolne.datum], ["Status", pregledRolne.status]].map(x => (
                <div key={x[0]} style={{ background: "#f8fafc", borderRadius: 6, padding: "7px 10px", border: "1px solid #e8edf3" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 2 }}>{x[0]}</div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{x[1]}</div>
                </div>
              ))}
            </div>
            {/* Progres bar */}
            {pregledRolne.metraza > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                  <span>Iskorišćeno</span>
                  <span>{Math.round((1 - pregledRolne.metraza_ost / pregledRolne.metraza) * 100)}%</span>
                </div>
                <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "#1d4ed8", borderRadius: 4, width: Math.round((1 - pregledRolne.metraza_ost / pregledRolne.metraza) * 100) + "%" }} />
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <select style={Object.assign({}, inp, { width: "auto" })} value={pregledRolne.status} onChange={e => promeniStatus(pregledRolne.id, e.target.value)}>
                <option>Na stanju</option><option>Rezervisano</option><option>Delimično</option><option>Iskorišćeno</option>
              </select>
              <button onClick={() => window.print()} style={{ padding: "8px 14px", borderRadius: 7, border: "none", background: "#1d4ed8", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>🖨️ Štampaj nalepnicu</button>
              <button onClick={() => obrisi(pregledRolne.id)} style={{ padding: "8px 14px", borderRadius: 7, border: "1px solid #fca5a5", background: "#fef2f2", color: "#ef4444", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>🗑️ Obriši</button>
            </div>
          </div>

          {/* QR NALEPNICA */}
          <div style={card}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>🏷️ QR Nalepnica</div>
            <div style={{ border: "2px solid #1d4ed8", borderRadius: 10, padding: 14, background: "#fff", maxWidth: 280 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, borderBottom: "1px solid #e2e8f0", marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>🏭 Maropack</div>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{pregledRolne.br_rolne}</div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <QRKod text={qrData} size={80} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 5 }}>{pregledRolne.tip}</div>
                  {[["Širina", pregledRolne.sirina + " mm"], ["Metraža", (pregledRolne.metraza_ost || 0).toLocaleString() + " m"], ["Neto kg", pregledRolne.kg_neto + " kg"], ["LOT", pregledRolne.lot || "—"]].map(x => (
                    <div key={x[0]} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
                      <span style={{ color: "#64748b" }}>{x[0]}</span>
                      <span style={{ fontWeight: 700 }}>{x[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8" }}>
                <span>{pregledRolne.datum}</span>
                <span>{pregledRolne.dobavljac || ""}</span>
                <span style={{ background: stBg[pregledRolne.status], color: stCl[pregledRolne.status], borderRadius: 4, padding: "1px 6px", fontWeight: 700 }}>{pregledRolne.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>🏭 Magacin</h2>
        <div style={{ display: "flex", gap: 6 }}>
          {[["stanje", "📋 Stanje"], ["prijem", "➕ Prijem rolne"], ["analiza", "📊 Analiza"], ["istorija", "📜 Istorija"]].map(t => (
            <button key={t[0]} onClick={() => setTab(t[0])} style={{ padding: "7px 14px", borderRadius: 7, border: tab === t[0] ? "none" : "1px solid #e2e8f0", cursor: "pointer", fontSize: 12, fontWeight: 700, background: tab === t[0] ? "#1d4ed8" : "#fff", color: tab === t[0] ? "#fff" : "#64748b" }}>{t[1]}</button>
          ))}
        </div>
      </div>

      {/* STAT KARTICE */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 16 }}>
        {[["📦", naStanju.length, "Rolni na stanju", "#1d4ed8"], ["📏", Math.round(ukupnoM).toLocaleString() + " m", "Ukupno metara", "#059669"], ["⚖️", Math.round(ukupnoKg).toLocaleString() + " kg", "Ukupno kg", "#7c3aed"], ["🧪", tipovi.length, "Tipova mat.", "#f59e0b"]].map(x => (
          <div key={x[2]} style={Object.assign({}, card, { borderLeft: "4px solid " + x[3], padding: "14px 16px" })}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{x[0]}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: x[3] }}>{x[1]}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{x[2]}</div>
          </div>
        ))}
      </div>

      {/* STANJE */}
      {tab === "stanje" && (
        <div style={card}>
          <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, flex: 1 }}>Stanje magacina</div>
            <input style={Object.assign({}, inp, { width: 160 })} placeholder="🔍 Pretraži..." onChange={e => { }} />
            <select style={Object.assign({}, inp, { width: 170 })} value={filterTip} onChange={e => setFilterTip(e.target.value)}>
              <option value="">Svi materijali</option>
              {tipovi.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select style={Object.assign({}, inp, { width: 120 })} value={filterSirina} onChange={e => setFilterSirina(e.target.value)}>
              <option value="">Sve širine</option>
              {sirine.map(s => <option key={s} value={s}>{s} mm</option>)}
            </select>
            <select style={Object.assign({}, inp, { width: 130 })} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="aktivne">Aktivne</option>
              <option value="sve">Sve rolne</option>
              <option value="iskorisc">Iskorišćene</option>
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>⏳ Učitavam...</div>
          ) : filtrirane.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📦</div>
              <div style={{ marginBottom: 12 }}>Nema rolni. Dodajte prvu rolnu.</div>
              <button style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#1d4ed8", color: "#fff", fontWeight: 700, cursor: "pointer" }} onClick={() => setTab("prijem")}>+ Prijem rolne</button>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                    {["Br. rolne", "Tip", "Širina", "Metraža ost.", "Kg neto", "LOT", "Sch.", "Dobavljač", "Status", ""].map(h => (
                      <th key={h} style={{ padding: "9px 8px", textAlign: "left", color: "#64748b", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrirane.map(r => (
                    <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9", opacity: r.status === "Iskorišćeno" ? 0.5 : 1, cursor: "pointer" }} onClick={() => setPregledRolne(r)}>
                      <td style={{ padding: "8px", fontWeight: 700, color: "#1d4ed8" }}>{r.br_rolne}</td>
                      <td style={{ padding: "8px", fontWeight: 600 }}>{r.tip}</td>
                      <td style={{ padding: "8px" }}>{r.sirina} mm</td>
                      <td style={{ padding: "8px", fontWeight: 700, color: (r.metraza_ost || 0) < (r.metraza || 1) * 0.2 ? "#ef4444" : "#059669" }}>
                        {(r.metraza_ost || r.metraza || 0).toLocaleString()} m
                        {r.metraza && r.metraza_ost < r.metraza && <div style={{ fontSize: 9, color: "#94a3b8" }}>od {r.metraza.toLocaleString()}m</div>}
                      </td>
                      <td style={{ padding: "8px" }}>{r.kg_neto || "—"} kg</td>
                      <td style={{ padding: "8px", color: "#64748b" }}>{r.lot || "—"}</td>
                      <td style={{ padding: "8px", color: "#64748b" }}>{r.sch || "—"}</td>
                      <td style={{ padding: "8px", color: "#64748b" }}>{r.dobavljac || "—"}</td>
                      <td style={{ padding: "8px" }}>
                        <span style={{ background: stBg[r.status] || "#f1f5f9", color: stCl[r.status] || "#64748b", borderRadius: 6, padding: "2px 8px", fontWeight: 700, fontSize: 10 }}>{r.status}</span>
                      </td>
                      <td style={{ padding: "8px" }} onClick={e => e.stopPropagation()}>
                        <select style={{ padding: "3px 6px", borderRadius: 5, border: "1px solid #e2e8f0", fontSize: 10, cursor: "pointer", background: "#f8fafc" }}
                          value={r.status} onChange={e => promeniStatus(r.id, e.target.value)}>
                          <option>Na stanju</option><option>Rezervisano</option><option>Delimično</option><option>Iskorišćeno</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PRIJEM */}
      {tab === "prijem" && (
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "#1d4ed8" }}>➕ Prijem nove rolne</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
            <div><label style={lbl}>Tip materijala *</label>
              <select style={inp} value={form.tip} onChange={e => setForm(f => ({ ...f, tip: e.target.value }))}>
                <option value="">-- Izaberi --</option>
                {MAT_TIPOVI.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Širina (mm) *</label><input type="number" style={inp} value={form.sirina} onChange={e => setForm(f => ({ ...f, sirina: e.target.value }))} placeholder="npr. 840" /></div>
            <div><label style={lbl}>Metraža (m) *</label><input type="number" style={inp} value={form.metraza} onChange={e => setForm(f => ({ ...f, metraza: e.target.value }))} /></div>
            <div><label style={lbl}>Bruto kg</label><input type="number" style={inp} value={form.kg_bruto} onChange={e => setForm(f => ({ ...f, kg_bruto: e.target.value }))} /></div>
            <div><label style={lbl}>Neto kg</label><input type="number" style={inp} value={form.kg_neto} onChange={e => setForm(f => ({ ...f, kg_neto: e.target.value }))} /></div>
            <div><label style={lbl}>LOT broj</label><input style={inp} value={form.lot} onChange={e => setForm(f => ({ ...f, lot: e.target.value }))} placeholder="npr. U26/00064" /></div>
            <div><label style={lbl}>Dobavljač</label><input style={inp} value={form.dobavljac} onChange={e => setForm(f => ({ ...f, dobavljac: e.target.value }))} placeholder="npr. Rossella S.p.A." /></div>
            <div><label style={lbl}>Datum prijema</label><input style={inp} value={form.datum} onChange={e => setForm(f => ({ ...f, datum: e.target.value }))} /></div>
            <div><label style={lbl}>Sch. broj</label><input style={inp} value={form.sch} onChange={e => setForm(f => ({ ...f, sch: e.target.value }))} placeholder="npr. 61905/7" /></div>
            <div><label style={lbl}>Broj palete</label><input style={inp} value={form.palet} onChange={e => setForm(f => ({ ...f, palet: e.target.value }))} /></div>
          </div>
          <div style={{ marginTop: 12 }}><label style={lbl}>Napomena</label><textarea style={Object.assign({}, inp, { height: 60, resize: "vertical" })} value={form.napomena} onChange={e => setForm(f => ({ ...f, napomena: e.target.value }))} /></div>
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#059669", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: saving ? 0.7 : 1 }} onClick={dodajRolnu}>
              {saving ? "⏳ Čuvam..." : "💾 Dodaj u magacin"}
            </button>
            <button style={{ padding: "10px 18px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer" }} onClick={() => setTab("stanje")}>Otkaži</button>
          </div>
        </div>
      )}

      {/* ANALIZA */}
      {tab === "analiza" && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>📊 Analiza stanja po materijalu i širini</div>
          {tipovi.length === 0 ? (
            <div style={Object.assign({}, card, { textAlign: "center", padding: 40, color: "#94a3b8" })}>Nema podataka za analizu.</div>
          ) : tipovi.map(tip => {
            const rTip = rolne.filter(r => r.tip === tip && r.status !== "Iskorišćeno");
            const sirineT = [...new Set(rTip.map(r => r.sirina))].sort((a, b) => a - b);
            const ukM = rTip.reduce((s, r) => s + (r.metraza_ost || 0), 0);
            const ukKg = rTip.reduce((s, r) => s + (r.kg_neto || 0), 0);
            return (
              <div key={tip} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "#0f172a", borderRadius: "10px 10px 0 0", color: "#fff" }}>
                  <span style={{ fontWeight: 800, fontSize: 14 }}>🧪 {tip}</span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>{rTip.length} rolni</span>
                  <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 700, color: "#93c5fd" }}>{Math.round(ukM).toLocaleString()} m · {Math.round(ukKg).toLocaleString()} kg</span>
                </div>
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderTop: "none", borderRadius: "0 0 10px 10px", overflow: "hidden" }}>
                  {sirineT.map(sir => {
                    const rSir = rTip.filter(r => r.sirina === sir);
                    const mSir = rSir.reduce((s, r) => s + (r.metraza_ost || 0), 0);
                    const kgSir = rSir.reduce((s, r) => s + (r.kg_neto || 0), 0);
                    return (
                      <div key={sir} style={{ padding: "10px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 14, alignItems: "center" }}>
                        <div style={{ background: "#1d4ed810", color: "#1d4ed8", borderRadius: 6, padding: "4px 10px", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{sir} mm</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {rSir.map(r => (
                              <span key={r.id} onClick={() => setPregledRolne(r)} style={{ fontSize: 11, background: stBg[r.status] || "#f1f5f9", color: stCl[r.status] || "#64748b", borderRadius: 6, padding: "2px 8px", fontWeight: 600, cursor: "pointer" }}>
                                {r.br_rolne} · {(r.metraza_ost || 0).toLocaleString()}m
                              </span>
                            ))}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#059669" }}>{Math.round(mSir).toLocaleString()} m</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{Math.round(kgSir).toLocaleString()} kg · {rSir.length} rolni</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ISTORIJA */}
      {tab === "istorija" && (
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>📜 Istorija svih rolni</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                  {["Br. rolne", "Tip", "Širina", "Ukupno m", "Ostalo m", "Kg", "LOT", "Datum", "Status"].map(h => (
                    <th key={h} style={{ padding: "9px 8px", textAlign: "left", color: "#64748b", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rolne.map(r => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9", opacity: r.status === "Iskorišćeno" ? 0.5 : 1, cursor: "pointer" }} onClick={() => setPregledRolne(r)}>
                    <td style={{ padding: "8px", fontWeight: 700, color: "#1d4ed8" }}>{r.br_rolne}</td>
                    <td style={{ padding: "8px" }}>{r.tip}</td>
                    <td style={{ padding: "8px" }}>{r.sirina} mm</td>
                    <td style={{ padding: "8px" }}>{(r.metraza || 0).toLocaleString()} m</td>
                    <td style={{ padding: "8px", fontWeight: 700, color: r.status === "Iskorišćeno" ? "#94a3b8" : "#059669" }}>{(r.metraza_ost || r.metraza || 0).toLocaleString()} m</td>
                    <td style={{ padding: "8px" }}>{r.kg_neto || "—"} kg</td>
                    <td style={{ padding: "8px", color: "#64748b" }}>{r.lot || "—"}</td>
                    <td style={{ padding: "8px", color: "#64748b" }}>{r.datum}</td>
                    <td style={{ padding: "8px" }}><span style={{ background: stBg[r.status] || "#f1f5f9", color: stCl[r.status] || "#64748b", borderRadius: 6, padding: "2px 8px", fontWeight: 700, fontSize: 10 }}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
