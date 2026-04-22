import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase.js";

// QR kod generator
function QRKod({ text, size = 80 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !text) return;
    ref.current.innerHTML = "";
    if (!window.QRCode) return;
    try {
      new window.QRCode(ref.current, {
        text, width: size, height: size,
        colorDark: "#0f172a", colorLight: "#ffffff",
        correctLevel: window.QRCode?.CorrectLevel?.M || 1
      });
    } catch (e) {}
  }, [text, size]);
  return <div ref={ref} style={{ display: "inline-block" }} />;
}

// Load QRCode library
function useQRLib() {
  useEffect(() => {
    if (window.QRCode) return;
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    document.head.appendChild(s);
  }, []);
}

// Format vreme
function formatVreme(sekunde) {
  if (!sekunde) return "0min";
  const h = Math.floor(sekunde / 3600);
  const m = Math.floor((sekunde % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

// Timer hook
function useTimer(startTime, running) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!running || !startTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(startTime).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [running, startTime]);
  return elapsed;
}

const OPERACIJE_IKONE = {
  "Nalog za materijal": "📦",
  "Nalog za stampu": "🖨️",
  "Nalog za kasiranje": "🔗",
  "Nalog za rezanje": "✂️",
  "Nalog za perforaciju": "🔵",
  "Nalog za lakiranje": "✨",
  "Nalog za špulne": "🔄",
};

const ZASTOJ_RAZLOZI = [
  "Kvar mašine",
  "Nema materijala",
  "Čeka prethodni nalog",
  "Promena podešavanja",
  "Pauza radnika",
  "Tehnički problem",
  "Ostalo",
];

// ===================== MOBILNA STRANICA ZA RADNIKE =====================
export function MobilniRadnik({ nalogId, radnik, onClose }) {
  const [nalog, setNalog] = useState(null);
  const [status, setStatus] = useState("ceka"); // ceka, u_toku, pauza, zavrseno
  const [startTime, setStartTime] = useState(null);
  const [pauzeVreme, setPauzeVreme] = useState(0);
  const [pauzeStart, setPauzeStart] = useState(null);
  const [uradjeno, setUradjeno] = useState("");
  const [skart, setSkart] = useState("");
  const [zastojRazlog, setZastojRazlog] = useState("");
  const [loading, setLoading] = useState(true);

  useQRLib();
  const elapsed = useTimer(startTime, status === "u_toku");

  useEffect(() => {
    if (!nalogId) return;
    supabase.from('nalozi').select('*').eq('id', nalogId).single()
      .then(({ data }) => { setNalog(data); setLoading(false); });
  }, [nalogId]);

  async function pocni() {
    const now = new Date().toISOString();
    setStartTime(now);
    setStatus("u_toku");
    await supabase.from('nalozi').update({
      status: "U toku",
      radnik: radnik,
      start_time: now,
    }).eq('id', nalogId);
  }

  async function pauza() {
    if (status === "u_toku") {
      setPauzeStart(Date.now());
      setStatus("pauza");
    } else if (status === "pauza") {
      const dodatno = Math.floor((Date.now() - pauzeStart) / 1000);
      setPauzeVreme(p => p + dodatno);
      setPauzeStart(null);
      setStatus("u_toku");
    }
  }

  async function zavrsi() {
    if (!uradjeno) { alert("Unesite količinu!"); return; }
    const now = new Date().toISOString();
    const ukVreme = elapsed - pauzeVreme;
    await supabase.from('nalozi').update({
      status: "Završeno",
      end_time: now,
      vreme_rada: ukVreme,
      uradjeno: +uradjeno,
      skart: +skart || 0,
    }).eq('id', nalogId);
    setStatus("zavrseno");
  }

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>⏳ Učitavam...</div>;
  if (!nalog) return <div style={{ padding: 40, textAlign: "center", color: "#ef4444" }}>Nalog nije pronađen!</div>;

  const ik = OPERACIJE_IKONE[nalog.naziv] || "🔧";
  const efVreme = elapsed - pauzeVreme;

  return (
    <div style={{ minHeight: "100vh", background: status === "u_toku" ? "#f0fdf4" : status === "pauza" ? "#fffbeb" : status === "zavrseno" ? "#f0fdf4" : "#f8fafc", padding: 20, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#0f172a", borderRadius: 12, padding: "14px 16px", marginBottom: 16, color: "#fff" }}>
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Radni nalog</div>
        <div style={{ fontSize: 18, fontWeight: 800 }}>{nalog.ponBr}</div>
        <div style={{ fontSize: 14, color: "#93c5fd", marginTop: 2 }}>{nalog.kupac} · {nalog.prod}</div>
      </div>

      {/* Operacija */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0", marginBottom: 14, textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>{ik}</div>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{nalog.naziv}</div>
        <div style={{ fontSize: 14, color: "#64748b" }}>Količina: <b>{(nalog.kol || 0).toLocaleString()} m</b></div>
      </div>

      {/* STATUS */}
      {status === "ceka" && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "#64748b", marginBottom: 16 }}>Pritisni da počneš rad</div>
          <button onClick={pocni} style={{ width: "100%", padding: 20, borderRadius: 16, border: "none", background: "#059669", color: "#fff", fontSize: 22, fontWeight: 800, cursor: "pointer" }}>
            ▶️ POČNI RAD
          </button>
        </div>
      )}

      {(status === "u_toku" || status === "pauza") && (
        <div>
          {/* Timer */}
          <div style={{ background: status === "pauza" ? "#fef3c7" : "#dcfce7", borderRadius: 12, padding: 20, textAlign: "center", marginBottom: 14, border: "1.5px solid " + (status === "pauza" ? "#fde68a" : "#bbf7d0") }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 8 }}>{status === "pauza" ? "⏸️ PAUSA" : "⏱️ U TOKU"}</div>
            <div style={{ fontSize: 44, fontWeight: 900, color: status === "pauza" ? "#f59e0b" : "#059669", fontVariantNumeric: "tabular-nums" }}>
              {String(Math.floor(efVreme / 3600)).padStart(2, "0")}:{String(Math.floor((efVreme % 3600) / 60)).padStart(2, "0")}:{String(efVreme % 60).padStart(2, "0")}
            </div>
            {pauzeVreme > 0 && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Pauze: {formatVreme(pauzeVreme)}</div>}
          </div>

          {/* Zastoj razlog tokom pauze */}
          {status === "pauza" && (
            <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: "1px solid #fde68a", marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "#92400e" }}>Razlog pauze/zastoja:</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {ZASTOJ_RAZLOZI.map(r => (
                  <button key={r} onClick={() => setZastojRazlog(r)} style={{ padding: "8px 10px", borderRadius: 8, border: "1.5px solid " + (zastojRazlog === r ? "#f59e0b" : "#e2e8f0"), background: zastojRazlog === r ? "#fef3c7" : "#f8fafc", color: zastojRazlog === r ? "#92400e" : "#64748b", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dugmad */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <button onClick={pauza} style={{ padding: 16, borderRadius: 12, border: "none", background: status === "pauza" ? "#059669" : "#f59e0b", color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
              {status === "pauza" ? "▶️ NASTAVI" : "⏸️ PAUZA"}
            </button>
            <button onClick={() => setStatus("unos")} style={{ padding: 16, borderRadius: 12, border: "none", background: "#1d4ed8", color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
              ⏹️ ZAVRŠI
            </button>
          </div>
        </div>
      )}

      {status === "unos" && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0", marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>📊 Unesi rezultate</div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Urađena količina (m) *</label>
            <input type="number" value={uradjeno} onChange={e => setUradjeno(e.target.value)} style={{ width: "100%", padding: "14px 16px", borderRadius: 10, border: "2px solid #1d4ed8", fontSize: 20, fontWeight: 700, outline: "none" }} placeholder="0" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Škart (m)</label>
            <input type="number" value={skart} onChange={e => setSkart(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 16, outline: "none" }} placeholder="0" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button onClick={() => setStatus("u_toku")} style={{ padding: 14, borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>← Nazad</button>
            <button onClick={zavrsi} style={{ padding: 14, borderRadius: 10, border: "none", background: "#059669", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>✅ Potvrdi</button>
          </div>
        </div>
      )}

      {status === "zavrseno" && (
        <div style={{ background: "#f0fdf4", borderRadius: 12, padding: 24, border: "1.5px solid #bbf7d0", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#166534", marginBottom: 8 }}>Završeno!</div>
          <div style={{ fontSize: 14, color: "#064e3b", marginBottom: 4 }}>Vreme rada: <b>{formatVreme(efVreme)}</b></div>
          <div style={{ fontSize: 14, color: "#064e3b", marginBottom: 4 }}>Urađeno: <b>{(+uradjeno).toLocaleString()} m</b></div>
          {+skart > 0 && <div style={{ fontSize: 14, color: "#ef4444" }}>Škart: <b>{(+skart).toLocaleString()} m ({((+skart / +uradjeno) * 100).toFixed(1)}%)</b></div>}
        </div>
      )}
    </div>
  );
}

// ===================== LIVE DASHBOARD ZA PRAĆENJE =====================
export default function PraćenjeNaloga({ db, setDb, card, inp, lbl, msg, user, setAktivniNalog, TIP_BOJA, TIP_LAB }) {
  const [nalozi, setNalozi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("live");
  const [pregledNalog, setPregledNalog] = useState(null);
  const [qrNalog, setQrNalog] = useState(null);
  const [filterStatus, setFilterStatus] = useState("aktivni");
  const [filterKupac, setFilterKupac] = useState("");
  const [now, setNow] = useState(Date.now());

  useQRLib();

  // Refresh svake sekunde za live timer
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { loadNalozi(); }, []);

  async function loadNalozi() {
    setLoading(true);
    try {
      const { data } = await supabase.from('nalozi').select('*').order('created_at', { ascending: false });
      setNalozi(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function promeniStatus(id, status) {
    try {
      await supabase.from('nalozi').update({ status }).eq('id', id);
      setNalozi(n => n.map(x => x.id === id ? { ...x, status } : x));
    } catch (e) { msg("Greška!", "err"); }
  }

  const filtrirani = nalozi.filter(n =>
    (filterStatus === "aktivni" ? n.status !== "Završeno" : filterStatus === "zavrseni" ? n.status === "Završeno" : true) &&
    (!filterKupac || n.kupac === filterKupac)
  );

  const uToku = nalozi.filter(n => n.status === "U toku");
  const cekaju = nalozi.filter(n => n.status === "Ceka");
  const zavrseni = nalozi.filter(n => n.status === "Završeno");
  const kupci = [...new Set(nalozi.map(n => n.kupac).filter(Boolean))].sort();

  // Grupisanje po ponudi
  const poPonudi = {};
  filtrirani.forEach(n => {
    const k = n.ponBr || "—";
    if (!poPonudi[k]) poPonudi[k] = { ponBr: k, kupac: n.kupac, prod: n.prod, tip: n.tip, nalozi: [] };
    poPonudi[k].nalozi.push(n);
  });

  const stBg = { "Ceka": "#fffbeb", "U toku": "#eff6ff", "Završeno": "#f0fdf4", "Odloženo": "#fef2f2" };
  const stCl = { "Ceka": "#f59e0b", "U toku": "#3b82f6", "Završeno": "#059669", "Odloženo": "#ef4444" };

  function getElapsed(n) {
    if (!n.start_time) return 0;
    if (n.status === "Završeno" && n.vreme_rada) return n.vreme_rada;
    return Math.floor((now - new Date(n.start_time).getTime()) / 1000);
  }

  // MODAL QR
  if (qrNalog) {
    const qrUrl = `${window.location.origin}?nalog=${qrNalog.id}`;
    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 28, maxWidth: 400, width: "90%", textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{qrNalog.naziv}</div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>{qrNalog.ponBr} · {qrNalog.kupac}</div>

          <div style={{ display: "inline-block", border: "3px solid #1d4ed8", borderRadius: 12, padding: 12, marginBottom: 16 }}>
            <QRKod text={qrUrl} size={160} />
          </div>

          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 20, wordBreak: "break-all" }}>{qrUrl}</div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={() => window.print()} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#1d4ed8", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>🖨️ Štampaj</button>
            <button onClick={() => setQrNalog(null)} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Zatvori</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>🔧 Praćenje naloga</h2>
        <div style={{ display: "flex", gap: 6 }}>
          {[["live", "🔴 Live"], ["lista", "📋 Lista"], ["izvestaj", "📊 Izveštaj"]].map(t => (
            <button key={t[0]} onClick={() => setTab(t[0])} style={{ padding: "7px 14px", borderRadius: 7, border: tab === t[0] ? "none" : "1px solid #e2e8f0", cursor: "pointer", fontSize: 12, fontWeight: 700, background: tab === t[0] ? "#1d4ed8" : "#fff", color: tab === t[0] ? "#fff" : "#64748b" }}>{t[1]}</button>
          ))}
          <button onClick={loadNalozi} style={{ padding: "7px 12px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer", fontSize: 12 }}>🔄</button>
        </div>
      </div>

      {/* STAT KARTICE */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 16 }}>
        {[["🔴", uToku.length, "U toku", "#ef4444"], ["⏳", cekaju.length, "Čekaju", "#f59e0b"], ["✅", zavrseni.length, "Završenih", "#059669"], ["📋", nalozi.length, "Ukupno", "#1d4ed8"]].map(x => (
          <div key={x[2]} style={Object.assign({}, card, { borderLeft: "4px solid " + x[3], padding: "14px 16px" })}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{x[0]}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: x[3] }}>{x[1]}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{x[2]}</div>
          </div>
        ))}
      </div>

      {/* LIVE TAB */}
      {tab === "live" && (
        <div>
          {uToku.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: "#ef4444" }}>🔴 Aktivni nalozi</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 10 }}>
                {uToku.map(n => {
                  const elapsed = getElapsed(n);
                  return (
                    <div key={n.id} style={{ background: "#fff", borderRadius: 12, padding: 16, border: "2px solid #bfdbfe", boxShadow: "0 2px 8px rgba(59,130,246,0.1)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 16 }}>{OPERACIJE_IKONE[n.naziv] || "🔧"} <span style={{ fontWeight: 700 }}>{n.naziv}</span></div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>{n.ponBr} · {n.kupac}</div>
                        </div>
                        <span style={{ background: "#eff6ff", color: "#3b82f6", borderRadius: 6, padding: "2px 8px", fontWeight: 700, fontSize: 10 }}>U toku</span>
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: "#1d4ed8", textAlign: "center", padding: "8px 0", background: "#f0f9ff", borderRadius: 8, marginBottom: 10 }}>
                        ⏱️ {formatVreme(elapsed)}
                      </div>
                      {n.radnik && <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>👤 {n.radnik}</div>}
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setQrNalog(n)} style={{ flex: 1, padding: "6px", borderRadius: 7, border: "none", background: "#1d4ed8", color: "#fff", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>📱 QR</button>
                        <button onClick={() => { const tip = n.tip === "kesa" ? "kesa" : n.tip === "spulna" ? "spulna" : "folija"; setAktivniNalog({ nalog: n, tip }); }} style={{ flex: 1, padding: "6px", borderRadius: 7, border: "none", background: "#8b5cf6", color: "#fff", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>📄 Nalog</button>
                        <button onClick={() => promeniStatus(n.id, "Završeno")} style={{ flex: 1, padding: "6px", borderRadius: 7, border: "none", background: "#059669", color: "#fff", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>✅ Završi</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {cekaju.length > 0 && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: "#f59e0b" }}>⏳ Na čekanju</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 8 }}>
                {cekaju.slice(0, 6).map(n => (
                  <div key={n.id} style={{ background: "#fff", borderRadius: 10, padding: 14, border: "1px solid #fde68a", display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ fontSize: 20 }}>{OPERACIJE_IKONE[n.naziv] || "🔧"}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{n.naziv}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{n.ponBr} · {n.kupac}</div>
                    </div>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button onClick={() => setQrNalog(n)} style={{ padding: "5px 8px", borderRadius: 6, border: "none", background: "#1d4ed8", color: "#fff", fontWeight: 700, fontSize: 10, cursor: "pointer" }}>📱 QR</button>
                      <button onClick={() => promeniStatus(n.id, "U toku")} style={{ padding: "5px 8px", borderRadius: 6, border: "none", background: "#f59e0b", color: "#fff", fontWeight: 700, fontSize: 10, cursor: "pointer" }}>▶️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uToku.length === 0 && cekaju.length === 0 && (
            <div style={Object.assign({}, card, { textAlign: "center", padding: 50, color: "#94a3b8" })}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
              <div>Nema aktivnih naloga.</div>
            </div>
          )}
        </div>
      )}

      {/* LISTA TAB */}
      {tab === "lista" && (
        <div>
          <div style={Object.assign({}, card, { marginBottom: 14, padding: "14px 16px" })}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <select style={Object.assign({}, inp, { width: 170 })} value={filterKupac} onChange={e => setFilterKupac(e.target.value)}>
                <option value="">👤 Svi kupci</option>
                {kupci.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <select style={Object.assign({}, inp, { width: 140 })} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="aktivni">Aktivni</option>
                <option value="zavrseni">Završeni</option>
                <option value="svi">Svi</option>
              </select>
              <div style={{ marginLeft: "auto", fontSize: 12, color: "#64748b", fontWeight: 600 }}>{filtrirani.length} naloga</div>
            </div>
          </div>

          {Object.values(poPonudi).map(grp => {
            const zavr = grp.nalozi.filter(n => n.status === "Završeno").length;
            const pct = grp.nalozi.length > 0 ? Math.round(zavr / grp.nalozi.length * 100) : 0;
            return (
              <div key={grp.ponBr} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "#0f172a", borderRadius: "10px 10px 0 0", color: "#fff" }}>
                  <span style={{ fontWeight: 800 }}>{grp.ponBr}</span>
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>{grp.kupac}</span>
                  <span style={{ background: (TIP_BOJA[grp.tip] || "#64748b") + "30", color: TIP_BOJA[grp.tip] || "#94a3b8", borderRadius: 4, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{TIP_LAB[grp.tip] || "—"}</span>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{zavr}/{grp.nalozi.length}</div>
                    <div style={{ width: 60, height: 5, background: "#334155", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "#22c55e", width: pct + "%" }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#22c55e" }}>{pct}%</div>
                  </div>
                </div>
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderTop: "none", borderRadius: "0 0 10px 10px", overflow: "hidden" }}>
                  {grp.nalozi.map((n, i) => {
                    const elapsed = getElapsed(n);
                    return (
                      <div key={n.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 14px", borderBottom: i < grp.nalozi.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                        <div style={{ fontSize: 18, flexShrink: 0 }}>{OPERACIJE_IKONE[n.naziv] || "🔧"}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{n.naziv}</div>
                          {n.radnik && <div style={{ fontSize: 11, color: "#64748b" }}>👤 {n.radnik}</div>}
                          {n.uradjeno && <div style={{ fontSize: 11, color: "#059669" }}>✓ {n.uradjeno.toLocaleString()} m urađeno</div>}
                          {n.skart > 0 && <div style={{ fontSize: 11, color: "#ef4444" }}>⚠️ Škart: {n.skart}m ({((n.skart / n.uradjeno) * 100).toFixed(1)}%)</div>}
                        </div>
                        {elapsed > 0 && <div style={{ fontSize: 12, color: "#1d4ed8", fontWeight: 700 }}>⏱️ {formatVreme(elapsed)}</div>}
                        <select style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 11, background: stBg[n.status] || "#f8fafc", color: stCl[n.status] || "#64748b", fontWeight: 700, cursor: "pointer" }}
                          value={n.status} onChange={e => promeniStatus(n.id, e.target.value)}>
                          <option>Ceka</option><option>U toku</option><option>Završeno</option>
                        </select>
                        <button onClick={() => setQrNalog(n)} style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: "#1d4ed8", color: "#fff", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>📱 QR</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* IZVESTAJ TAB */}
      {tab === "izvestaj" && (
        <div>
          <div style={Object.assign({}, card, { marginBottom: 14 })}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>📊 Izveštaj produktivnosti</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                {["Radnik", "Završenih naloga", "Ukupno vreme", "Ukupno urađeno", "Škart %"].map(h => (
                  <th key={h} style={{ padding: "9px 8px", textAlign: "left", color: "#64748b", fontWeight: 600 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {[...new Set(nalozi.filter(n => n.radnik && n.status === "Završeno").map(n => n.radnik))].map(radnik => {
                  const rNalozi = nalozi.filter(n => n.radnik === radnik && n.status === "Završeno");
                  const ukVreme = rNalozi.reduce((s, n) => s + (n.vreme_rada || 0), 0);
                  const ukUradjeno = rNalozi.reduce((s, n) => s + (n.uradjeno || 0), 0);
                  const ukSkart = rNalozi.reduce((s, n) => s + (n.skart || 0), 0);
                  return (
                    <tr key={radnik} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "9px 8px", fontWeight: 700 }}>👤 {radnik}</td>
                      <td style={{ padding: "9px 8px" }}>{rNalozi.length}</td>
                      <td style={{ padding: "9px 8px", color: "#1d4ed8", fontWeight: 600 }}>{formatVreme(ukVreme)}</td>
                      <td style={{ padding: "9px 8px", color: "#059669", fontWeight: 600 }}>{ukUradjeno.toLocaleString()} m</td>
                      <td style={{ padding: "9px 8px", color: ukSkart / ukUradjeno > 0.05 ? "#ef4444" : "#059669", fontWeight: 600 }}>
                        {ukUradjeno > 0 ? ((ukSkart / ukUradjeno) * 100).toFixed(1) + "%" : "—"}
                      </td>
                    </tr>
                  );
                })}
                {nalozi.filter(n => n.radnik && n.status === "Završeno").length === 0 && (
                  <tr><td colSpan={5} style={{ padding: 20, textAlign: "center", color: "#94a3b8" }}>Nema završenih naloga sa pratećim podacima.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Otpad po nalogu */}
          <div style={card}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>♻️ Otpad po nalogu</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                {["Ponuda", "Kupac", "Nalog", "Urađeno", "Škart", "% otpada"].map(h => (
                  <th key={h} style={{ padding: "9px 8px", textAlign: "left", color: "#64748b", fontWeight: 600 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {nalozi.filter(n => n.status === "Završeno" && n.skart > 0).map(n => (
                  <tr key={n.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "9px 8px", fontWeight: 700, color: "#1d4ed8" }}>{n.ponBr}</td>
                    <td style={{ padding: "9px 8px" }}>{n.kupac}</td>
                    <td style={{ padding: "9px 8px", fontSize: 12 }}>{n.naziv}</td>
                    <td style={{ padding: "9px 8px" }}>{(n.uradjeno || 0).toLocaleString()} m</td>
                    <td style={{ padding: "9px 8px", color: "#ef4444", fontWeight: 600 }}>{(n.skart || 0).toLocaleString()} m</td>
                    <td style={{ padding: "9px 8px" }}>
                      <span style={{ background: n.skart / n.uradjeno > 0.05 ? "#fee2e2" : "#dcfce7", color: n.skart / n.uradjeno > 0.05 ? "#991b1b" : "#166534", borderRadius: 6, padding: "2px 8px", fontWeight: 700, fontSize: 11 }}>
                        {n.uradjeno > 0 ? ((n.skart / n.uradjeno) * 100).toFixed(1) + "%" : "—"}
                      </span>
                    </td>
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
