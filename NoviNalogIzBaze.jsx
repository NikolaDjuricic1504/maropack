import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./supabase.js";

const COLORS = {
  blue: "#1d4ed8",
  green: "#059669",
  purple: "#7c3aed",
  orange: "#f59e0b",
  red: "#dc2626",
  slate: "#475569",
  light: "#f8fafc",
  border: "#e2e8f0",
};

const empty = "—";

function val(...items) {
  for (const item of items) {
    if (item !== undefined && item !== null && item !== "") return item;
  }
  return empty;
}

function num(v, suffix = "") {
  if (v === undefined || v === null || v === "") return empty;
  const n = Number(v);
  if (Number.isNaN(n)) return String(v) + suffix;
  return n.toLocaleString("sr-RS", { maximumFractionDigits: 2 }) + suffix;
}

function normalizeNalog(nalog) {
  const p = nalog?.parametri || {};
  const osnovno = p.osnovno || {};
  const stampa = p.stampa || {};
  const kasiranje = p.kasiranje || {};
  const rezanje = p.rezanje || {};
  const perforacija = p.perforacija || {};
  const kolicine = p.kolicine || {};

  const materijali = Array.isArray(p.materijali)
    ? p.materijali
    : [1, 2, 3, 4]
        .map((i) => ({
          sloj: `Sloj ${i}`,
          materijal: p[`materijal_${i}`],
          debljina: p[`debljina_${i}`],
          sirina: p[`sirina_${i}`] || p.sirina_materijala,
          kg: p[`potreba_kg_${i}`],
          m: p[`potreba_m_${i}`],
        }))
        .filter((m) => m.materijal || m.debljina || m.kg || m.m);

  return {
    broj: val(nalog?.broj_naloga, nalog?.ponBr, osnovno.broj_naloga, osnovno.broj, p.broj_naloga),
    naziv: val(nalog?.naziv, nalog?.prod, osnovno.naziv, p.naziv),
    status: val(nalog?.status, p.status, "u_pripremi"),
    kupac: val(nalog?.kupac, osnovno.kupac, p.kupac),
    datumPorudzbine: val(osnovno.datum_porudzbine, p.datum_porudzbine, nalog?.datum),
    datumIsporuke: val(osnovno.datum_isporuke, p.datum_isporuke),
    brojPorudzbine: val(osnovno.broj_porudzbine, p.broj_porudzbine, nalog?.ponId),
    dimenzija: {
      sirina: val(osnovno.sirina, p.sirina, p.sirina_trake),
      duzina: val(osnovno.duzina, p.duzina),
      sirinaMaterijala: val(osnovno.sirina_materijala, p.sirina_materijala),
    },
    materijali,
    stampa: {
      masina: val(stampa.masina, p.stampa_masina, p.stm),
      strana: val(stampa.strana, p.strana_stampe, p.stranaRez),
      obim: val(stampa.obim, p.obim_valjka),
      boje: val(stampa.boje, p.broj_boja, p.brBoja),
      klise: val(stampa.klise, p.klise),
      hilzna: val(stampa.hilzna, p.precnik_hilzne, p.hilzna),
      smer: val(stampa.smer, p.smer_odmotavanja, p.smer),
      grafika: val(stampa.grafika, p.graficko_resenje, p.grafika),
    },
    kasiranje: {
      tipLepka: val(kasiranje.tip_lepka, p.tip_lepka, p.tipLepka),
      odnos: val(kasiranje.odnos, p.odnos_lepka, p.lepakOdnos),
      nanos: val(kasiranje.nanos, p.nanos_lepka, p.lepakNanos),
    },
    rezanje: {
      brojTraka: val(rezanje.broj_traka, p.broj_traka, p.rezBrTraka),
      sirinaTrake: val(rezanje.sirina_trake, p.sirina_trake_rez, p.sirina_trake),
      precnikRolne: val(rezanje.precnik_rolne, p.precnik_rolne),
      duzinaRolne: val(rezanje.duzina_rolne, p.duzinaRolne),
      smerGP: val(rezanje.smer_odmotavanja_gp, p.smer_odmotavanja_gp),
      secivo: val(rezanje.secivo, p.secivo),
    },
    perforacija: {
      tip: val(perforacija.tip, p.tip_perforacije, p.tipPerf),
      oblik: val(perforacija.oblik, p.oblik_perforacije, p.oblikPerf),
      razmak: val(perforacija.razmak, p.razmak_perforacije, p.razmakPerf),
      brzina: val(perforacija.brzina, p.brzina_perforacije, p.brzinaPerf),
    },
    kolicine: {
      poruceno: val(kolicine.poruceno, p.porucena_kolicina, nalog?.kol),
      zaRad: val(kolicine.za_rad, p.kolicina_za_rad),
      skart: val(kolicine.skart, p.sk),
    },
  };
}

function Field({ label, value, accent }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: accent || "#0f172a" }}>{value || empty}</div>
    </div>
  );
}

function Section({ title, icon, color, children }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
      <div style={{ padding: "12px 16px", background: `${color}10`, borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <h3 style={{ margin: 0, color, fontSize: 15, fontWeight: 900 }}>{title}</h3>
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

function MaterialSchema({ materijali, ukupnaSirina }) {
  const total = materijali.reduce((s, m) => s + (Number(m.sirina) || 0), 0) || Number(ukupnaSirina) || 0;
  if (!materijali.length) return <div style={{ color: "#94a3b8" }}>Nema unetih materijala.</div>;
  return (
    <div style={{ display: "flex", width: "100%", minHeight: 58, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden", background: "#f8fafc" }}>
      {materijali.map((m, i) => {
        const w = Number(m.sirina) || (total ? total / materijali.length : 1);
        const pct = total ? Math.max((w / total) * 100, 12) : 100 / materijali.length;
        const color = [COLORS.blue, COLORS.green, COLORS.purple, COLORS.orange][i % 4];
        return (
          <div key={i} style={{ width: `${pct}%`, background: `${color}18`, borderRight: i < materijali.length - 1 ? `1px solid ${COLORS.border}` : "none", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 8, textAlign: "center" }}>
            <b style={{ color, fontSize: 12 }}>{val(m.sloj, `Sloj ${i + 1}`)}</b>
            <span style={{ fontSize: 11, color: "#334155" }}>{val(m.materijal)} {m.debljina ? `${m.debljina}µ` : ""}</span>
            <span style={{ fontSize: 10, color: "#64748b" }}>{m.sirina ? `${m.sirina} mm` : ""}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function NalogUniversal({ nalogId, nalog: nalogProp, onClose, msg }) {
  const [nalog, setNalog] = useState(nalogProp || null);
  const [loading, setLoading] = useState(!nalogProp && !!nalogId);
  const printRef = useRef(null);

  useEffect(() => {
    if (nalogProp) {
      setNalog(nalogProp);
      return;
    }
    if (!nalogId) return;

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("radni_nalozi_folija")
        .select("*")
        .eq("id", nalogId)
        .single();

      if (error) {
        console.error(error);
        if (msg) msg("Greška učitavanja naloga: " + error.message, "err");
      } else {
        setNalog(data);
      }
      setLoading(false);
    }
    load();
  }, [nalogId, nalogProp, msg]);

  const n = useMemo(() => normalizeNalog(nalog || {}), [nalog]);

  function print() {
    window.print();
  }

  if (loading) return <div style={{ padding: 30, color: COLORS.slate }}>Učitavanje naloga...</div>;
  if (!nalog) return <div style={{ padding: 30, color: COLORS.red }}>Nalog nije pronađen.</div>;

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .universal-print, .universal-print * { visibility: visible; }
          .universal-print { position: absolute; left: 0; top: 0; width: 100%; background: white; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div ref={printRef} className="universal-print" style={{ background: COLORS.light, padding: 18, borderRadius: 14 }}>
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>📋 Universal radni nalog</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={print} style={{ border: "none", background: COLORS.blue, color: "#fff", borderRadius: 8, padding: "9px 14px", fontWeight: 800, cursor: "pointer" }}>🖨️ Štampaj / PDF</button>
            {onClose && <button onClick={onClose} style={{ border: `1px solid ${COLORS.border}`, background: "#fff", color: COLORS.slate, borderRadius: 8, padding: "9px 14px", fontWeight: 800, cursor: "pointer" }}>Zatvori</button>}
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: 18, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, borderBottom: `3px solid ${COLORS.blue}`, paddingBottom: 14, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 950, color: COLORS.blue }}>MAROPACK</div>
              <div style={{ fontSize: 12, color: COLORS.slate }}>Fleksibilna ambalaža · Radni nalog</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 22, fontWeight: 950, color: "#0f172a" }}>{n.broj}</div>
              <div style={{ fontSize: 13, color: COLORS.slate }}>{n.status}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
            <Field label="Kupac" value={n.kupac} accent={COLORS.blue} />
            <Field label="Proizvod" value={n.naziv} />
            <Field label="Broj porudžbine" value={n.brojPorudzbine} />
            <Field label="Datum porudžbine" value={n.datumPorudzbine} />
            <Field label="Datum isporuke" value={n.datumIsporuke} />
            <Field label="Dimenzija" value={`${n.dimenzija.sirina} x ${n.dimenzija.duzina} mm`} />
          </div>
        </div>

        <Section title="Potreba materijala / sastav" icon="📦" color={COLORS.orange}>
          <MaterialSchema materijali={n.materijali} ukupnaSirina={n.dimenzija.sirinaMaterijala} />
          <div style={{ marginTop: 12, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#f1f5f9" }}>
                  {['Sloj','Materijal','Debljina','Širina','Potreba kg','Potreba m'].map(h => <th key={h} style={{ padding: 9, textAlign: "left", borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {n.materijali.map((m, i) => (
                  <tr key={i}>
                    <td style={{ padding: 9, borderBottom: `1px solid ${COLORS.border}`, fontWeight: 800 }}>{val(m.sloj, `Sloj ${i + 1}`)}</td>
                    <td style={{ padding: 9, borderBottom: `1px solid ${COLORS.border}` }}>{val(m.materijal)}</td>
                    <td style={{ padding: 9, borderBottom: `1px solid ${COLORS.border}` }}>{num(m.debljina, " µm")}</td>
                    <td style={{ padding: 9, borderBottom: `1px solid ${COLORS.border}` }}>{num(m.sirina, " mm")}</td>
                    <td style={{ padding: 9, borderBottom: `1px solid ${COLORS.border}` }}>{num(m.kg, " kg")}</td>
                    <td style={{ padding: 9, borderBottom: `1px solid ${COLORS.border}` }}>{num(m.m, " m")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 14 }}>
          <Section title="Nalog za štampu" icon="🖨️" color={COLORS.blue}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Mašina" value={n.stampa.masina} />
              <Field label="Strana štampe" value={n.stampa.strana} />
              <Field label="Obim valjka" value={num(n.stampa.obim, " mm")} />
              <Field label="Broj boja" value={n.stampa.boje} />
              <Field label="Kliše" value={n.stampa.klise} />
              <Field label="Hilzna" value={num(n.stampa.hilzna, " mm")} />
              <Field label="Smer odmotavanja" value={n.stampa.smer} />
              <Field label="Grafika" value={n.stampa.grafika} />
            </div>
          </Section>

          <Section title="Nalog za kaširanje" icon="🔗" color={COLORS.green}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Tip lepka" value={n.kasiranje.tipLepka} />
              <Field label="Odnos lepka" value={n.kasiranje.odnos} />
              <Field label="Nanos lepka" value={num(n.kasiranje.nanos, " g/m²")} />
            </div>
          </Section>

          <Section title="Nalog za rezanje" icon="✂️" color={COLORS.purple}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Broj traka" value={n.rezanje.brojTraka} />
              <Field label="Širina trake" value={num(n.rezanje.sirinaTrake, " mm")} />
              <Field label="Prečnik rolne" value={num(n.rezanje.precnikRolne, " mm")} />
              <Field label="Dužina rolne" value={num(n.rezanje.duzinaRolne, " m")} />
              <Field label="Smer GP" value={n.rezanje.smerGP} />
              <Field label="Sečivo" value={n.rezanje.secivo} />
            </div>
          </Section>

          <Section title="Nalog za perforaciju" icon="⭕" color={COLORS.red}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Tip" value={n.perforacija.tip} />
              <Field label="Oblik" value={n.perforacija.oblik} />
              <Field label="Razmak" value={n.perforacija.razmak} />
              <Field label="Brzina" value={num(n.perforacija.brzina, " m/min")} />
            </div>
          </Section>
        </div>

        <Section title="Količine i kontrola" icon="✅" color={COLORS.slate}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
            <Field label="Poručeno" value={num(n.kolicine.poruceno)} />
            <Field label="Količina za rad" value={num(n.kolicine.zaRad)} accent={COLORS.green} />
            <Field label="Škart" value={n.kolicine.skart !== empty ? num(n.kolicine.skart, " %") : empty} />
            <Field label="Širina materijala" value={num(n.dimenzija.sirinaMaterijala, " mm")} />
          </div>
        </Section>
      </div>
    </>
  );
}
