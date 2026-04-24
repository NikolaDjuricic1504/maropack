import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase.js";

function qrUrl(text, size = 72) {
  return "https://api.qrserver.com/v1/create-qr-code/?size=" + size + "x" + size + "&data=" + encodeURIComponent(text || "");
}

function fmt(n) {
  return Number(n || 0).toLocaleString("sr-RS");
}

function generateCombos(widths, parentWidth, maxTraka) {
  const clean = [...new Set(widths.map(Number).filter(Boolean))].sort((a,b)=>b-a);
  const out = [];

  function rec(start, combo, sum) {
    if (combo.length > 0 && sum <= parentWidth) {
      out.push({
        rezovi: [...combo],
        suma: sum,
        otpad: parentWidth - sum,
        iskoriscenost: parentWidth > 0 ? (sum / parentWidth) * 100 : 0
      });
    }
    if (combo.length >= maxTraka) return;

    for (let i = start; i < clean.length; i++) {
      const next = clean[i];
      if (sum + next <= parentWidth) {
        combo.push(next);
        rec(i, combo, sum + next);
        combo.pop();
      }
    }
  }

  rec(0, [], 0);
  return out.sort((a,b) => a.otpad - b.otpad || b.rezovi.length - a.rezovi.length);
}

function buildPlan(rolne, trake, maxTraka, filterMaterijal) {
  const potrebe = {};
  trake.forEach(t => {
    const sirina = Number(t.sirina);
    const ukupno = Number(t.metraza || 0) * Number(t.kolicina || 0);
    if (sirina && ukupno > 0) potrebe[sirina] = (potrebe[sirina] || 0) + ukupno;
  });

  const ukupnoPotrebno = Object.values(potrebe).reduce((a,b)=>a+b,0);
  const plan = [];
  let pokriveno = 0;
  let ukupniOtpad = 0;

  const dostupneRolne = rolne
    .filter(r => (r.status || "").toLowerCase() !== "iskorišćeno")
    .filter(r => (r.status || "").toLowerCase() !== "iskorisceno")
    .filter(r => (r.status || "").toLowerCase() !== "rezervisano")
    .filter(r => !filterMaterijal || filterMaterijal === "SVI" || r.tip === filterMaterijal)
    .map(r => ({
      ...r,
      sirina_num: Number(r.sirina || 0),
      metraza_num: Number(r.metraza_ost || r.metraza || 0)
    }))
    .filter(r => r.sirina_num > 0 && r.metraza_num > 0)
    .sort((a,b) => b.metraza_num - a.metraza_num);

  for (const rola of dostupneRolne) {
    const aktivneSirine = Object.keys(potrebe).map(Number).filter(s => potrebe[s] > 0);
    if (!aktivneSirine.length) break;

    const combos = generateCombos(aktivneSirine, rola.sirina_num, Number(maxTraka || 10));
    if (!combos.length) continue;

    const combo = combos[0];

    let mozeMetara = rola.metraza_num;
    combo.rezovi.forEach(s => {
      mozeMetara = Math.min(mozeMetara, potrebe[s] || 0);
    });

    if (mozeMetara <= 0) continue;

    combo.rezovi.forEach(s => {
      potrebe[s] = Math.max(0, (potrebe[s] || 0) - mozeMetara);
    });

    pokriveno += mozeMetara * combo.rezovi.length;
    ukupniOtpad += combo.otpad;

    plan.push({
      rola,
      plan: {
        rezovi: combo.rezovi,
        otpad: combo.otpad,
        ukupno_uzeto_m: mozeMetara
      },
      iskoriscenost: combo.iskoriscenost
    });
  }

  return { plan, potrebe, ukupnoPotrebno, pokriveno, ukupniOtpad };
}

export default function AIsecenjeOptimizer() {
  const [rolne, setRolne] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAccept, setLoadingAccept] = useState(null);
  const [filterMaterijal, setFilterMaterijal] = useState("SVI");
  const [maxTraka, setMaxTraka] = useState(10);
  const [trake, setTrake] = useState([
    { sirina: 500, metraza: 12000, kolicina: 1 },
    { sirina: 400, metraza: 12000, kolicina: 1 },
    { sirina: 300, metraza: 12000, kolicina: 2 }
  ]);
  const [rezultat, setRezultat] = useState(null);

  useEffect(() => {
    ucitajRolne();
  }, []);

  async function ucitajRolne() {
    setLoading(true);
    const { data, error } = await supabase
      .from("magacin")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("Greška pri učitavanju magacina");
    } else {
      setRolne(data || []);
    }
    setLoading(false);
  }

  const materijali = useMemo(() => {
    return ["SVI", ...new Set(rolne.map(r => r.tip).filter(Boolean))];
  }, [rolne]);

  function updTraka(i, key, val) {
    setTrake(prev => prev.map((t, idx) => idx === i ? { ...t, [key]: val } : t));
  }

  function dodajTraku() {
    setTrake(prev => [...prev, { sirina: "", metraza: "", kolicina: 1 }]);
  }

  function obrisiTraku(i) {
    setTrake(prev => prev.filter((_, idx) => idx !== i));
  }

  function optimizuj() {
    const res = buildPlan(rolne, trake, maxTraka, filterMaterijal);
    setRezultat(res);
  }

  async function prihvatiPlan(item) {
    try {
      setLoadingAccept(item.rola.id);

      const planText = item.plan.rezovi.join(" + ");
      const staraMetraza = Number(item.rola.metraza_ost || item.rola.metraza || 0);
      const novaMetraza = Math.max(0, staraMetraza - Number(item.plan.ukupno_uzeto_m || 0));

      const { error: planErr } = await supabase.from("planovi_secenja").insert([{
        rola_id: item.rola.id,
        broj_rolne: item.rola.br_rolne || item.rola.broj || item.rola.broj_rolne,
        lokacija: item.rola.lokacija || item.rola.palet || item.rola.sch || null,
        lot: item.rola.lot || item.rola.LOT || null,
        plan: planText,
        otpad_mm: item.plan.otpad
      }]);

      if (planErr) throw planErr;

      const { error: updErr } = await supabase
        .from("magacin")
        .update({
          metraza_ost: novaMetraza,
          status: "Rezervisano"
        })
        .eq("id", item.rola.id);

      if (updErr) throw updErr;

      alert("Plan prihvaćen i rola rezervisana!");
      await ucitajRolne();
      optimizuj();
    } catch (e) {
      console.error(e);
      alert("Greška: " + (e.message || "nije moguće prihvatiti plan"));
    } finally {
      setLoadingAccept(null);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginTop: 0, fontSize: 28, fontWeight: 900 }}>🧠 Optimizacija sečenja</h2>

      <div style={{ background: "#fff", borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,.08)" }}>
        <h3 style={{ marginTop: 0 }}>Potrebne trake</h3>

        {trake.map((t, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 48px", gap: 10, marginBottom: 10, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#64748b" }}>ŠIRINA MM</label>
              <input value={t.sirina} onChange={e=>updTraka(i,"sirina",e.target.value)} style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#64748b" }}>METRAŽA PO ROLI</label>
              <input value={t.metraza} onChange={e=>updTraka(i,"metraza",e.target.value)} style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#64748b" }}>KOLIČINA</label>
              <input value={t.kolicina} onChange={e=>updTraka(i,"kolicina",e.target.value)} style={inp} />
            </div>
            <button onClick={()=>obrisiTraku(i)} style={delBtn}>×</button>
          </div>
        ))}

        <div style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap" }}>
          <button onClick={dodajTraku} style={addBtn}>+ Dodaj traku</button>

          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: "#64748b" }}>FILTER MATERIJALA</label>
            <select value={filterMaterijal} onChange={e=>setFilterMaterijal(e.target.value)} style={{...inp, minWidth: 220}}>
              {materijali.map(m => <option key={m} value={m}>{m === "SVI" ? "Svi materijali" : m}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: "#64748b" }}>MAX TRAKA U KOMBINACIJI</label>
            <input value={maxTraka} onChange={e=>setMaxTraka(e.target.value)} style={{...inp, width: 120}} />
          </div>

          <button onClick={optimizuj} disabled={loading} style={optBtn}>🧠 Optimizuj</button>
        </div>
      </div>

      {rezultat && (
        <>
          <div style={{ background: "#e9fbf1", border: "1px solid #bbf7d0", borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#166534" }}>REZULTAT</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#064e3b", marginTop: 6 }}>
              Pokriveno {fmt(rezultat.pokriveno)} m
            </div>
            <div style={{ color: "#065f46", marginTop: 6 }}>
              Korišćeno rolni: <b>{rezultat.plan.length}</b> · Ukupan otpad po kombinacijama: <b>{rezultat.ukupniOtpad} mm</b>
            </div>
          </div>

          {rezultat.plan.map((item, idx) => {
            const rolaBroj = item.rola.br_rolne || item.rola.broj || item.rola.broj_rolne || "—";
            const lokacija = item.rola.lokacija || item.rola.palet || item.rola.sch || "—";
            const lot = item.rola.lot || item.rola.LOT || "—";
            const sirina = Number(item.rola.sirina || 0);

            return (
              <div key={idx} style={{ background: "#fff", borderRadius: 12, padding: 20, marginBottom: 18, boxShadow: "0 1px 4px rgba(0,0,0,.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <img src={qrUrl(window.location.origin + "?rolna=" + encodeURIComponent(rolaBroj), 72)} alt="QR" style={{ width: 72, height: 72, borderRadius: 6 }} />
                    <div>
                      <div style={{ color: "#64748b", fontWeight: 800 }}>Matična rola</div>
                      <div style={{ color: "#1d4ed8", fontSize: 20, fontWeight: 900 }}>
                        {rolaBroj} · {item.rola.tip || "—"} · {item.rola.sirina}mm
                      </div>
                      <div style={{ marginTop: 4, color: "#475569" }}>
                        LOT/Lokacija: <b>{lot} · {lokacija}</b>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#64748b", fontWeight: 800 }}>Iskorišćenost</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: item.iskoriscenost >= 95 ? "#059669" : "#f59e0b" }}>
                      {item.iskoriscenost.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", marginTop: 16, height: 74, overflow: "hidden", borderRadius: 10, border: "1px solid #93c5fd" }}>
                  {item.plan.rezovi.map((r, i) => (
                    <div key={i} style={{ flex: r, minWidth: 38, background: "#dbeafe", borderRight: "1px solid #93c5fd", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#1e40af" }}>
                      {r}mm
                    </div>
                  ))}
                  {item.plan.otpad > 0 && (
                    <div style={{ flex: item.plan.otpad, minWidth: 42, background: "#fecaca", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#991b1b" }}>
                      Otpad {item.plan.otpad}
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 12 }}>
                  <Info title="Plan" value={item.plan.rezovi.join(" + ")} />
                  <Info title="Metraža" value={fmt(item.plan.ukupno_uzeto_m) + " m"} />
                  <Info title="Otpad" value={item.plan.otpad + " mm"} />
                  <Info title="LOT/Lokacija" value={lot + " · " + lokacija} />
                </div>

                <button onClick={()=>prihvatiPlan(item)} disabled={loadingAccept === item.rola.id} style={acceptBtn}>
                  {loadingAccept === item.rola.id ? "..." : "✅ Prihvati plan"}
                </button>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

function Info({title, value}) {
  return (
    <div style={{ background: "#f8fafc", borderRadius: 10, padding: 12 }}>
      <div style={{ fontWeight: 900 }}>{title}:</div>
      <div>{value}</div>
    </div>
  );
}

const inp = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 14px",
  borderRadius: 8,
  border: "1px solid #dbe3ef",
  background: "#f8fafc",
  fontSize: 15
};

const addBtn = {
  padding: "12px 18px",
  borderRadius: 8,
  background: "#fff",
  border: "1px solid #dbe3ef",
  fontWeight: 900,
  cursor: "pointer"
};

const delBtn = {
  height: 44,
  borderRadius: 8,
  background: "#fff1f2",
  color: "#ef4444",
  border: "1px solid #fecdd3",
  fontWeight: 900,
  fontSize: 20,
  cursor: "pointer"
};

const optBtn = {
  padding: "13px 26px",
  borderRadius: 10,
  background: "#7c3aed",
  color: "#fff",
  border: "none",
  fontWeight: 900,
  cursor: "pointer"
};

const acceptBtn = {
  marginTop: 14,
  padding: "11px 18px",
  borderRadius: 8,
  background: "#16a34a",
  color: "#fff",
  border: "none",
  fontWeight: 900,
  cursor: "pointer"
};
