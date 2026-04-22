import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

const dnow = () => new Date().toLocaleDateString("sr-RS");

const MAT_TIPOVI = [
  "BOPP","BOPP SEDEF","BOPP BELI","LDPE","CPP","PET","OPA","OPP","PLA","HDPE","ALU",
  "CELULOZA","CELOFAN","PA","PA/PE","FXC","FXCB","FXCU","FXCM","FXCMT","FXCMTS",
  "FXCFM","FXCAF","FXCLS","FXCMB","FXCWP","FXCW","FXCHFM","FXPU","FXPF","FXPA",
  "FXPMT","FXPBR","FXPLA","FXPLF","FXPFM","FXPFB","FXA","FXS","FXAA",
  "OPP30","OPP35","HSD31","BTHL BOPP"
];

export default function Magacin({ msg, inp, card, lbl, user }) {
  var [rolne, setRolne] = useState([]);
  var [loading, setLoading] = useState(true);
  var [tab, setTab] = useState("stanje");
  var [filterTip, setFilterTip] = useState("");
  var [filterSirina, setFilterSirina] = useState("");
  var [filterStatus, setFilterStatus] = useState("aktivne");
  var [saving, setSaving] = useState(false);
  var [form, setForm] = useState({
    tip: "", sirina: "", metraza: "", kg_bruto: "", kg_neto: "",
    lot: "", dobavljac: "", datum: dnow(), sch: "", palet: "", napomena: ""
  });

  useEffect(function() { loadRolne(); }, []);

  async function loadRolne() {
    setLoading(true);
    try {
      var res = await supabase.from('magacin').select('*').order('created_at', { ascending: false });
      if (res.error) throw res.error;
      setRolne(res.data || []);
    } catch (e) { msg("Greška: " + e.message, "err"); }
    setLoading(false);
  }

  async function dodajRolnu() {
    if (!form.tip || !form.sirina || !form.metraza) {
      msg("Tip, širina i metraža su obavezni!", "err"); return;
    }
    setSaving(true);
    try {
      var sch = form.sch || "";
      var suffix = sch ? sch.replace("/", "-") : String(Date.now()).slice(-5);
      var brRolne = "R-" + new Date().getFullYear() + "-" + suffix;
      var res = await supabase.from('magacin').insert([{
        br_rolne: brRolne,
        tip: form.tip,
        sirina: +form.sirina,
        metraza: +form.metraza,
        metraza_ost: +form.metraza,
        kg_bruto: +form.kg_bruto || 0,
        kg_neto: +form.kg_neto || 0,
        lot: form.lot,
        dobavljac: form.dobavljac,
        datum: form.datum,
        sch: form.sch,
        palet: form.palet,
        napomena: form.napomena,
        status: "Na stanju"
      }]);
      if (res.error) throw res.error;
      msg("Rolna " + brRolne + " dodata!");
      setForm({ tip: "", sirina: "", metraza: "", kg_bruto: "", kg_neto: "", lot: "", dobavljac: "", datum: dnow(), sch: "", palet: "", napomena: "" });
      loadRolne();
      setTab("stanje");
    } catch (e) { msg("Greška: " + e.message, "err"); }
    setSaving(false);
  }

  async function promeniStatus(id, val) {
    try {
      await supabase.from('magacin').update({ status: val }).eq('id', id);
      setRolne(function(prev) {
        return prev.map(function(r) { return r.id === id ? Object.assign({}, r, { status: val }) : r; });
      });
    } catch (e) { msg("Greška!", "err"); }
  }

  var filtrirane = rolne.filter(function(r) {
    var stOk = filterStatus === "sve" || (filterStatus === "aktivne" ? r.status !== "Iskorišćeno" : r.status === "Iskorišćeno");
    return stOk && (!filterTip || r.tip === filterTip) && (!filterSirina || String(r.sirina) === filterSirina);
  });

  var naStanju = rolne.filter(function(r) { return r.status === "Na stanju"; });
  var ukM = naStanju.reduce(function(s, r) { return s + (r.metraza_ost || 0); }, 0);
  var ukKg = naStanju.reduce(function(s, r) { return s + (r.kg_neto || 0); }, 0);
  var tipovi = [...new Set(rolne.map(function(r) { return r.tip; }))].sort();
  var sirine = [...new Set(
    rolne.filter(function(r) { return !filterTip || r.tip === filterTip; }).map(function(r) { return r.sirina; })
  )].sort(function(a, b) { return a - b; });

  var stBg = { "Na stanju": "#dcfce7", "Rezervisano": "#fef3c7", "Delimično": "#dbeafe", "Iskorišćeno": "#f1f5f9" };
  var stCl = { "Na stanju": "#166534", "Rezervisano": "#92400e", "Delimično": "#1e40af", "Iskorišćeno": "#94a3b8" };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:800 }}>🏭 Magacin</h2>
        <div style={{ display:"flex", gap:6 }}>
          {[["stanje","📋 Stanje"],["prijem","➕ Prijem rolne"],["analiza","📊 Analiza"]].map(function(t) {
            return (
              <button key={t[0]} onClick={function() { setTab(t[0]); }}
                style={{ padding:"7px 14px", borderRadius:7, border:tab===t[0]?"none":"1px solid #e2e8f0", cursor:"pointer", fontSize:12, fontWeight:700, background:tab===t[0]?"#1d4ed8":"#fff", color:tab===t[0]?"#fff":"#64748b" }}>
                {t[1]}
              </button>
            );
          })}
        </div>
      </div>

      {/* STATISTIKE */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, marginBottom:16 }}>
        {[
          ["📦", naStanju.length, "Rolni na stanju", "#1d4ed8"],
          ["📏", Math.round(ukM).toLocaleString()+" m", "Ukupno metara", "#059669"],
          ["⚖️", Math.round(ukKg).toLocaleString()+" kg", "Ukupno kg", "#7c3aed"],
          ["🧪", tipovi.length, "Tipova materijala", "#f59e0b"],
        ].map(function(x) {
          return (
            <div key={x[2]} style={Object.assign({}, card, { borderLeft:"4px solid "+x[3], padding:"14px 16px" })}>
              <div style={{ fontSize:22, marginBottom:4 }}>{x[0]}</div>
              <div style={{ fontSize:20, fontWeight:800, color:x[3] }}>{x[1]}</div>
              <div style={{ fontSize:11, color:"#64748b" }}>{x[2]}</div>
            </div>
          );
        })}
      </div>

      {/* STANJE */}
      {tab==="stanje" && (
        <div style={card}>
          <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
            <div style={{ fontSize:14, fontWeight:700, flex:1 }}>Stanje magacina ({filtrirane.length} rolni)</div>
            <select style={Object.assign({},inp,{width:180})} value={filterTip} onChange={function(e) { setFilterTip(e.target.value); setFilterSirina(""); }}>
              <option value="">Svi materijali</option>
              {tipovi.map(function(t) { return <option key={t} value={t}>{t}</option>; })}
            </select>
            <select style={Object.assign({},inp,{width:120})} value={filterSirina} onChange={function(e) { setFilterSirina(e.target.value); }}>
              <option value="">Sve širine</option>
              {sirine.map(function(s) { return <option key={s} value={s}>{s} mm</option>; })}
            </select>
            <select style={Object.assign({},inp,{width:140})} value={filterStatus} onChange={function(e) { setFilterStatus(e.target.value); }}>
              <option value="aktivne">Aktivne</option>
              <option value="sve">Sve</option>
              <option value="iskorisc">Iskorišćene</option>
            </select>
            {(filterTip||filterSirina) && (
              <button onClick={function() { setFilterTip(""); setFilterSirina(""); }}
                style={{ padding:"7px 12px", borderRadius:7, border:"1px solid #e2e8f0", background:"#f8fafc", color:"#64748b", fontWeight:700, fontSize:12, cursor:"pointer" }}>
                ✕ Reset
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign:"center", padding:40, color:"#94a3b8" }}>⏳ Učitavam...</div>
          ) : filtrirane.length===0 ? (
            <div style={{ textAlign:"center", padding:40, color:"#94a3b8" }}>
              <div style={{ fontSize:36, marginBottom:10 }}>📦</div>
              <div style={{ marginBottom:12 }}>Nema rolni.</div>
              <button onClick={function() { setTab("prijem"); }}
                style={{ padding:"10px 20px", borderRadius:8, border:"none", background:"#1d4ed8", color:"#fff", fontWeight:700, cursor:"pointer" }}>
                + Prijem rolne
              </button>
            </div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead>
                  <tr style={{ borderBottom:"2px solid #e2e8f0" }}>
                    {["Br. rolne","Tip","Širina","Ostalo (m)","Kg neto","LOT","Sch.","Lokacija","Datum","Status",""].map(function(h) {
                      return <th key={h} style={{ padding:"9px 8px", textAlign:"left", color:"#64748b", fontWeight:600, whiteSpace:"nowrap" }}>{h}</th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filtrirane.map(function(r) {
                    return (
                      <tr key={r.id} style={{ borderBottom:"1px solid #f1f5f9", opacity:r.status==="Iskorišćeno"?0.5:1 }}>
                        <td style={{ padding:"8px", fontWeight:700, color:"#1d4ed8", whiteSpace:"nowrap" }}>{r.br_rolne}</td>
                        <td style={{ padding:"8px", fontWeight:600 }}>{r.tip}</td>
                        <td style={{ padding:"8px" }}>{r.sirina} mm</td>
                        <td style={{ padding:"8px", fontWeight:700, color:(r.metraza_ost||0)<(r.metraza||1)*0.2?"#ef4444":"#059669" }}>
                          {(r.metraza_ost||r.metraza||0).toLocaleString()} m
                          {r.metraza && r.metraza_ost<r.metraza && <div style={{ fontSize:9, color:"#94a3b8" }}>od {r.metraza.toLocaleString()}m</div>}
                        </td>
                        <td style={{ padding:"8px" }}>{r.kg_neto?r.kg_neto+" kg":"—"}</td>
                        <td style={{ padding:"8px", color:"#64748b" }}>{r.lot||"—"}</td>
                        <td style={{ padding:"8px", color:"#64748b" }}>{r.sch||"—"}</td>
                        <td style={{ padding:"8px", color:"#64748b" }}>{r.palet||"—"}</td>
                        <td style={{ padding:"8px", color:"#64748b", whiteSpace:"nowrap" }}>{r.datum}</td>
                        <td style={{ padding:"8px" }}>
                          <span style={{ background:stBg[r.status]||"#f1f5f9", color:stCl[r.status]||"#64748b", borderRadius:6, padding:"2px 8px", fontWeight:700, fontSize:10 }}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ padding:"8px" }}>
                          <select style={{ padding:"3px 6px", borderRadius:5, border:"1px solid #e2e8f0", fontSize:10, cursor:"pointer", background:"#f8fafc" }}
                            value={r.status}
                            onChange={function(e) { var v=e.target.value; promeniStatus(r.id, v); }}>
                            <option>Na stanju</option>
                            <option>Rezervisano</option>
                            <option>Delimično</option>
                            <option>Iskorišćeno</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PRIJEM */}
      {tab==="prijem" && (
        <div style={card}>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:16, color:"#1d4ed8" }}>➕ Prijem nove rolne</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
            <div>
              <label style={lbl}>Tip materijala *</label>
              <select style={inp} value={form.tip} onChange={function(e) { var v=e.target.value; setForm(function(f) { return Object.assign({},f,{tip:v}); }); }}>
                <option value="">-- Izaberi --</option>
                {MAT_TIPOVI.map(function(t) { return <option key={t} value={t}>{t}</option>; })}
              </select>
            </div>
            {[
              ["Širina (mm) *","sirina","number","npr. 840"],
              ["Metraža (m) *","metraza","number","npr. 12000"],
              ["Bruto kg","kg_bruto","number",""],
              ["Neto kg","kg_neto","number",""],
              ["LOT broj","lot","text","npr. U26/00064"],
              ["Dobavljač","dobavljac","text","npr. Rossella S.p.A."],
              ["Datum prijema","datum","text",""],
              ["Sch. broj","sch","text","npr. 61905/7"],
              ["Lokacija / Palet","palet","text","npr. B5, MM, MGP..."],
            ].map(function(x) {
              return (
                <div key={x[0]}>
                  <label style={lbl}>{x[0]}</label>
                  <input type={x[2]} style={inp} value={form[x[1]]} placeholder={x[3]}
                    onChange={function(e) { var v=e.target.value; var k=x[1]; setForm(function(f) { return Object.assign({},f,{[k]:v}); }); }} />
                </div>
              );
            })}
          </div>
          <div style={{ marginTop:12 }}>
            <label style={lbl}>Napomena</label>
            <textarea style={Object.assign({},inp,{height:60,resize:"vertical"})} value={form.napomena}
              onChange={function(e) { var v=e.target.value; setForm(function(f) { return Object.assign({},f,{napomena:v}); }); }} />
          </div>
          <div style={{ marginTop:16, display:"flex", gap:10 }}>
            <button onClick={dodajRolnu} disabled={saving}
              style={{ padding:"10px 24px", borderRadius:8, border:"none", background:"#059669", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", opacity:saving?0.7:1 }}>
              {saving?"⏳ Čuvam...":"💾 Dodaj u magacin"}
            </button>
            <button onClick={function() { setTab("stanje"); }}
              style={{ padding:"10px 18px", borderRadius:8, border:"1px solid #e2e8f0", background:"#fff", color:"#64748b", fontWeight:700, fontSize:13, cursor:"pointer" }}>
              Otkaži
            </button>
          </div>
        </div>
      )}

      {/* ANALIZA */}
      {tab==="analiza" && (
        <div>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>📊 Stanje po materijalu i širini</div>
          {tipovi.length===0 ? (
            <div style={Object.assign({},card,{textAlign:"center",padding:40,color:"#94a3b8"})}>Nema podataka.</div>
          ) : tipovi.map(function(tip) {
            var rTip = rolne.filter(function(r) { return r.tip===tip && r.status!=="Iskorišćeno"; });
            if (rTip.length===0) return null;
            var sirineT = [...new Set(rTip.map(function(r) { return r.sirina; }))].sort(function(a,b){return a-b;});
            var totM = rTip.reduce(function(s,r){return s+(r.metraza_ost||0);},0);
            var totKg = rTip.reduce(function(s,r){return s+(r.kg_neto||0);},0);
            return (
              <div key={tip} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", background:"#0f172a", borderRadius:"10px 10px 0 0", color:"#fff" }}>
                  <span style={{ fontWeight:800, fontSize:14 }}>🧪 {tip}</span>
                  <span style={{ fontSize:12, color:"#94a3b8" }}>{rTip.length} rolni</span>
                  <span style={{ marginLeft:"auto", fontWeight:700, fontSize:13, color:"#93c5fd" }}>
                    {Math.round(totM).toLocaleString()} m · {Math.round(totKg).toLocaleString()} kg
                  </span>
                </div>
                <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderTop:"none", borderRadius:"0 0 10px 10px" }}>
                  {sirineT.map(function(sir) {
                    var rSir = rTip.filter(function(r){return r.sirina===sir;});
                    var mSir = rSir.reduce(function(s,r){return s+(r.metraza_ost||0);},0);
                    var kgSir = rSir.reduce(function(s,r){return s+(r.kg_neto||0);},0);
                    return (
                      <div key={sir} style={{ padding:"10px 16px", borderBottom:"1px solid #f1f5f9", display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
                        <div style={{ background:"#1d4ed810", color:"#1d4ed8", borderRadius:6, padding:"4px 10px", fontWeight:800, fontSize:13, flexShrink:0 }}>
                          {sir} mm
                        </div>
                        <div style={{ flex:1, display:"flex", gap:6, flexWrap:"wrap" }}>
                          {rSir.map(function(r) {
                            return (
                              <span key={r.id} style={{ fontSize:11, background:stBg[r.status]||"#f1f5f9", color:stCl[r.status]||"#64748b", borderRadius:6, padding:"2px 8px", fontWeight:600 }}>
                                {r.br_rolne} · {(r.metraza_ost||0).toLocaleString()}m
                                {r.lot && <span style={{color:"#94a3b8"}}> · {r.lot}</span>}
                              </span>
                            );
                          })}
                        </div>
                        <div style={{ textAlign:"right", flexShrink:0 }}>
                          <div style={{ fontSize:14, fontWeight:800, color:"#059669" }}>{Math.round(mSir).toLocaleString()} m</div>
                          <div style={{ fontSize:11, color:"#64748b" }}>{Math.round(kgSir).toLocaleString()} kg · {rSir.length} rolni</div>
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
    </div>
  );
}
