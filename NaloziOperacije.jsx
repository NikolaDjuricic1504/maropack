import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase.js";

const C = {
  materijal: "#059669",
  stampa: "#2563eb",
  kasiranje: "#f59e0b",
  rezanje: "#8b5cf6",
  perforacija: "#0ea5e9",
  rolna: "#ec4899",
  dark: "#0f172a",
  muted: "#64748b",
  line: "#e5e7eb",
  bg: "#f5f5f5",
};

const fmt = (v, suf = "") => {
  if (v === undefined || v === null || v === "") return "—";
  if (typeof v === "number") return v.toLocaleString("sr-RS") + suf;
  return String(v) + suf;
};

const num = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

function normalizujNalog(nalog) {
  const p = nalog?.parametri || {};
  const osnovno = p.osnovno || {};
  const materijali =
    Array.isArray(p.materijali) && p.materijali.length
      ? p.materijali
      : [1, 2, 3, 4]
          .map((i) => ({
            sloj: `Sloj ${i}`,
            materijal: p[`materijal_${i}`],
            debljina: p[`debljina_${i}`],
            sirina: p[`sirina_materijala_${i}`] || p.sirina_materijala,
            kg: p[`potreba_kg_${i}`],
            m: p[`potreba_m_${i}`],
          }))
          .filter((m) => m.materijal || m.debljina || m.kg || m.m);

  return {
    id: nalog?.id,
    broj: nalog?.broj_naloga || nalog?.ponBr || osnovno.broj_naloga || "—",
    naziv: nalog?.naziv || nalog?.prod || osnovno.naziv || p.naziv || "—",
    kupac: nalog?.kupac || osnovno.kupac || p.kupac || "—",
    datum: osnovno.datum_porudzbine || p.datum_porudzbine || nalog?.created_at?.slice?.(0, 10) || "—",
    rok: osnovno.datum_isporuke || p.datum_isporuke || p.rok_zavrsetka || "—",
    porudzbina: osnovno.broj_porudzbine || p.broj_porudzbine || "—",
    sirina: osnovno.sirina || p.sirina || p.sirina_trake || p.sirina_trake_rez || "—",
    duzina: osnovno.duzina || p.duzina || p.visina || "—",
    materijali,
    stampa: {
      masina: p.stampa?.masina || p.stampa_masina || p.stm || "—",
      strana: p.stampa?.strana || p.strana_stampe || p.stranaRez || "—",
      obim: p.stampa?.obim || p.obim_valjka || p.obimValjka || "—",
      boje: p.stampa?.boje || p.broj_boja || p.brBoja || "—",
      klise: p.stampa?.klise || p.klise || "—",
      hilzna: p.stampa?.hilzna || p.precnik_hilzne || p.hilzna || "—",
      smer: p.stampa?.smer || p.smer_odmotavanja || p.smer || "—",
      napomena: p.stampa?.napomena || p.napomena_stampa || "",
    },
    kasiranje: {
      tip_lepka: p.kasiranje?.tip_lepka || p.tip_lepka || p.tipLepka || "—",
      odnos: p.kasiranje?.odnos || p.odnos_lepka || p.lepakOdnos || "—",
      nanos: p.kasiranje?.nanos || p.nanos_lepka || p.lepakNanos || "—",
      temperatura: p.kasiranje?.temperatura || p.temperatura_susnice || 60,
      brzina: p.kasiranje?.brzina || p.brzina_kasiranja || 80,
      pritisak: p.kasiranje?.pritisak || p.pritisak_valjaka || 4,
      maturacija: p.kasiranje?.maturacija || p.vreme_maturacije || "48 sati",
    },
    rezanje: {
      sirina_maticne: p.rezanje?.sirina_maticne || p.sirina_materijala || 0,
      broj_traka: p.rezanje?.broj_traka || p.broj_traka || p.rezBrTraka || 0,
      sirina_trake: p.rezanje?.sirina_trake || p.sirina_trake_rez || p.sirina_trake || p.sirina || 0,
      precnik_rolne: p.rezanje?.precnik_rolne || p.precnik_rolne || p.precnikRolne || "—",
      tolerancija: p.rezanje?.tolerancija || "±2 mm",
      korona: p.rezanje?.korona || p.korona || "NE",
      lokacija: p.rezanje?.lokacija || p.lokacija_rolni || "Rakovac",
      metraza: p.rezanje?.metraza || p.potreba_m_1 || p.kolicina_za_rezanje || "—",
      hilzna: p.rezanje?.hilzna || p.precnik_hilzne || p.hilzna || 76,
    },
    perforacija: {
      tip: p.perforacija?.tip || p.tip_perforacije || p.tipPerf || "Poprečna",
      oblik: p.perforacija?.oblik || p.oblik_perforacije || p.oblikPerf || "Standardna linija",
      orijentacija: p.perforacija?.orijentacija || p.orijentacija_perforacije || "Poprečna",
      pozicija: p.perforacija?.pozicija || "Između jedinica",
      rez: p.perforacija?.rez || p.duzina_reza || 3,
      razmak_reza: p.perforacija?.razmak_reza || p.razmak_izmedju_rezova || 1,
      razmak: p.perforacija?.razmak || p.razmak_perforacije || p.razmakPerf || p.duzina || 110,
    },
    rolna: {
      etiketa_m: p.rolna?.etiketa_m || p.broj_etiketa_u_metru || 9.09,
      smer_gp: p.rolna?.smer_gp || p.smer_odmotavanja_gp || "Na noge",
      hilzna: p.rolna?.hilzna || p.precnik_hilzne || p.hilzna || 76,
      precnik: p.rolna?.precnik || p.precnik_rolne || p.precnikRolne || 400,
      pakovanje: p.rolna?.pakovanje || p.pakovanje_rolni || p.pakovanjeRolni || "Svaka pojedinačno",
    },
    kolicine: {
      poruceno: p.kolicine?.poruceno || p.porucena_kolicina || nalog?.kol || "—",
      za_rad: p.kolicine?.za_rad || p.kolicina_za_rad || "—",
    },
  };
}

function Layout({ color, title, subtitle, nalog, children }) {
  return (
    <div style={{ background: C.bg, padding: "1.5rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", background: "white", borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <div style={{ background: `linear-gradient(135deg, ${color} 0%, ${shade(color)} 100%)`, color: "white", padding: "1.5rem 2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>{subtitle}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>Glavni nalog</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{nalog.broj}</div>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function shade(hex) {
  const map = {
    "#059669": "#047857",
    "#2563eb": "#1d4ed8",
    "#f59e0b": "#d97706",
    "#8b5cf6": "#7c3aed",
    "#0ea5e9": "#0284c7",
    "#ec4899": "#db2777",
  };
  return map[hex] || hex;
}

function Info({ color, children, cols = 4 }) {
  return (
    <div style={{ padding: "1.5rem 2rem", background: color + "12", borderBottom: `2px solid ${color}` }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "1.5rem" }}>{children}</div>
    </div>
  );
}

function InfoItem({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "#666", marginBottom: 4, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: color || C.dark }}>{value || "—"}</div>
    </div>
  );
}

function SectionTitle({ color, children }) {
  return (
    <div style={{ fontWeight: 800, color, marginBottom: "1.2rem", fontSize: 14, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "center" }}>
      {children}
    </div>
  );
}

function Tabela({ color, title, rows }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: "2rem" }}>
      <tbody>
        <tr style={{ background: color + "12", borderBottom: `2px solid ${color}` }}>
          <td colSpan="4" style={{ padding: "12px 1rem", fontWeight: 800, color, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {title}
          </td>
        </tr>
        {rows.map((r, i) => (
          <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
            <td style={tdLabel}>{r[0]}</td>
            <td style={tdValue}>{r[1]}</td>
            <td style={tdLabel}>{r[2]}</td>
            <td style={tdValue}>{r[3]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const tdLabel = { padding: "14px 1rem", fontWeight: 700, background: "#fafafa", width: "25%" };
const tdValue = { padding: "14px 1rem", width: "25%", fontWeight: 700 };

function PotrebaMaterijala({ nalog }) {
  const totalKg = nalog.materijali.reduce((s, m) => s + num(m.kg), 0);
  const totalM = nalog.materijali.reduce((s, m) => s + num(m.m), 0);
  return (
    <Layout color={C.materijal} title="NALOG ZA POTREBU MATERIJALA" subtitle="Rezervacija materijala za proizvodnju" nalog={nalog}>
      <Info color={C.materijal} cols={3}>
        <InfoItem label="DATUM IZDAVANJA" value={nalog.datum} color={C.materijal} />
        <InfoItem label="KUPAC" value={nalog.kupac} />
        <InfoItem label="PROIZVOD" value={nalog.naziv} />
      </Info>
      <div style={{ padding: "2rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f0fdf4", borderBottom: `3px solid ${C.materijal}` }}>
              {["RB", "Naziv materijala", "Širina (mm)", "Količina (kg)", "Količina (m)", "Lokacija"].map((h) => (
                <th key={h} style={{ padding: "14px 1rem", textAlign: h === "Naziv materijala" ? "left" : "center", fontWeight: 800, color: C.materijal, textTransform: "uppercase", fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nalog.materijali.map((m, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f0f0f0", background: ["#fffbeb", "#fef3c7", "#fef9c3", "#f8fafc"][i % 4] }}>
                <td style={{ padding: "16px 1rem", textAlign: "center", fontWeight: 900, fontSize: 18, color: "#92400e" }}>{i + 1}</td>
                <td style={{ padding: "16px 1rem" }}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{fmt(m.materijal)} {m.debljina ? `${m.debljina}µ` : ""}</div>
                  <div style={{ fontSize: 11, color: "#666" }}>{i === 0 ? "Materijal za štampanje" : i === 1 ? "Barijerni sloj" : "Unutrašnji sloj"}</div>
                </td>
                <td style={tdCenter}>{fmt(m.sirina)}</td>
                <td style={{ ...tdCenter, fontSize: 18, color: C.materijal }}>{fmt(m.kg)}</td>
                <td style={tdCenter}>{fmt(m.m)}</td>
                <td style={{ padding: "16px 1rem", textAlign: "center" }}><input placeholder="A-12-3" style={inputSmall} /></td>
              </tr>
            ))}
            <tr style={{ background: "#f0fdf4" }}>
              <td colSpan="3" style={{ padding: "16px 1rem", fontWeight: 900, textAlign: "right", color: C.materijal }}>UKUPNO:</td>
              <td style={{ ...tdCenter, fontSize: 22, color: C.materijal }}>{fmt(totalKg, " kg")}</td>
              <td style={{ ...tdCenter, fontSize: 16, color: C.materijal }}>{fmt(totalM, " m")}</td>
              <td />
            </tr>
          </tbody>
        </table>
        <div style={{ marginTop: "2rem", padding: "1.5rem", background: "#f0fdf4", borderRadius: 6, borderLeft: `4px solid ${C.materijal}` }}>
          <div style={{ fontWeight: 800, color: C.materijal, marginBottom: "1rem" }}>POMOĆNI MATERIJALI</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <InfoItem label="Lepak" value={`${nalog.kasiranje.tip_lepka} / nanos ${nalog.kasiranje.nanos} g/m²`} color={C.materijal} />
            <InfoItem label="Hilzne" value={`fi ${nalog.rezanje.hilzna || nalog.rolna.hilzna} mm`} color={C.materijal} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

const tdCenter = { padding: "16px 1rem", textAlign: "center", fontWeight: 800 };
const inputSmall = { width: 90, padding: 7, border: "1px solid #d1d5db", borderRadius: 4, textAlign: "center", fontSize: 13 };

function NalogStampa({ nalog }) {
  return (
    <Layout color={C.stampa} title="NALOG ZA ŠTAMPU" subtitle="Parametri štampe, klišei i kontrola kvaliteta" nalog={nalog}>
      <Info color={C.stampa} cols={4}>
        <InfoItem label="KUPAC" value={nalog.kupac} />
        <InfoItem label="PROIZVOD" value={nalog.naziv} />
        <InfoItem label="MAŠINA" value={nalog.stampa.masina} color={C.stampa} />
        <InfoItem label="BROJ BOJA" value={nalog.stampa.boje} color={C.stampa} />
      </Info>
      <div style={{ padding: "2rem" }}>
        <Tabela color={C.stampa} title="PARAMETRI ŠTAMPE" rows={[
          ["Mašina:", nalog.stampa.masina, "Strana štampe:", nalog.stampa.strana],
          ["Obim valjka:", fmt(nalog.stampa.obim, " mm"), "Kliše:", nalog.stampa.klise],
          ["Prečnik hilzne:", fmt(nalog.stampa.hilzna, " mm"), "Smer odmotavanja:", nalog.stampa.smer],
        ]} />

        <div style={{ background: "#fafafa", border: `2px solid ${C.stampa}`, borderRadius: 8, padding: "2rem", marginBottom: "2rem" }}>
          <SectionTitle color={C.stampa}>🎨 KONTROLA ŠTAMPE I KPF</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={blueBox}>
              <div style={boxTitle}>BOJE / LAK</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: C.stampa }}>{nalog.stampa.boje}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>Proveriti nijansu, pokrivenost i registar.</div>
            </div>
            <div style={blueBox}>
              <div style={boxTitle}>NAPOMENA ZA KONTROLU</div>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8, fontSize: 13 }}>
                <li>Proveriti smer štampe i odmotavanja.</li>
                <li>Proveriti ogrebotine, prijanjanje i zaprljanja.</li>
                <li>Uzorak odobriti pre serijske proizvodnje.</li>
              </ul>
            </div>
          </div>
        </div>

        <Tabela color={C.stampa} title="PODACI ZA RADNIKA" rows={[
          ["Početak rada:", <input style={inputSmall} />, "Završetak rada:", <input style={inputSmall} />],
          ["Radnik:", <input style={inputSmall} />, "Kontrola:", <input style={inputSmall} />],
        ]} />
      </div>
    </Layout>
  );
}

const blueBox = { background: "white", border: "1px solid #dbeafe", borderRadius: 8, padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" };
const boxTitle = { fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", marginBottom: 10 };

function NalogKasiranje({ nalog }) {
  const ukupnoDeb = nalog.materijali.reduce((s, m) => s + num(m.debljina), 0);
  return (
    <Layout color={C.kasiranje} title="NALOG ZA KAŠIRANJE (LAMINACIJU)" subtitle={`Multi-layer struktura: ${nalog.materijali.length} sloja`} nalog={nalog}>
      <Info color={C.kasiranje} cols={4}>
        <InfoItem label="KUPAC" value={nalog.kupac} />
        <InfoItem label="PROIZVOD" value={nalog.naziv} />
        <InfoItem label="BROJ KAŠIRANJA" value={`${Math.max(0, nalog.materijali.length - 1)}x`} color={C.kasiranje} />
        <InfoItem label="ROK ZAVRŠETKA" value={nalog.rok} />
      </Info>
      <div style={{ padding: "2rem" }}>
        <div style={{ background: "#fafafa", border: `2px solid ${C.kasiranje}`, borderRadius: 8, padding: "2rem", marginBottom: "2rem" }}>
          <SectionTitle color={C.kasiranje}>📐 STRUKTURA MULTI-LAYER FOLIJE</SectionTitle>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "stretch", gap: "1rem", flexWrap: "wrap" }}>
            {nalog.materijali.map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ background: "linear-gradient(135deg,#fffbeb,#fef3c7)", border: "2px solid #b45309", padding: "2rem 1.5rem", borderRadius: 8, minWidth: 180 }}>
                    <div style={{ fontSize: 11, color: "#92400e", fontWeight: 800, marginBottom: 8 }}>{m.sloj || `SLOJ ${i + 1}`}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 6, color: "#b45309" }}>{fmt(m.materijal)} {m.debljina ? `${m.debljina}µ` : ""}</div>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>{fmt(m.kg, " kg")}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#999", marginTop: 8 }}>{i === 0 ? "SPOLJNA / ŠTAMPANA" : i === nalog.materijali.length - 1 ? "UNUTRAŠNJA" : "SREDNJI SLOJ"}</div>
                </div>
                {i < nalog.materijali.length - 1 && <div style={{ textAlign: "center", color: C.kasiranje, fontWeight: 900 }}><div style={{ fontSize: 32 }}>→</div><div style={{ fontSize: 11 }}>LEPAK</div></div>}
              </div>
            ))}
          </div>
          <div style={{ marginTop: "2rem", textAlign: "center", background: "white", padding: "1rem", borderRadius: 6, fontWeight: 900, color: C.kasiranje }}>
            UKUPNA DEBLJINA: {fmt(ukupnoDeb, " µm")}
          </div>
        </div>
        <Tabela color={C.kasiranje} title="PARAMETRI LEPKA I NANOSA" rows={[
          ["Tip lepka:", nalog.kasiranje.tip_lepka, "Odnos komponenti:", nalog.kasiranje.odnos],
          ["Nanos lepka:", fmt(nalog.kasiranje.nanos, " g/m²"), "Širina nanosa:", fmt(nalog.rezanje.sirina_maticne, " mm")],
        ]} />
        <Tabela color={C.kasiranje} title="PARAMETRI PROCESA KAŠIRANJA" rows={[
          ["Temperatura sušnice:", `${nalog.kasiranje.temperatura} °C`, "Brzina:", `${nalog.kasiranje.brzina} m/min`],
          ["Pritisak valjaka:", `${nalog.kasiranje.pritisak} bar`, "Vreme maturacije:", nalog.kasiranje.maturacija],
        ]} />
      </div>
    </Layout>
  );
}

function NalogRezanje({ nalog }) {
  const bw = num(nalog.rezanje.broj_traka, 8) || 8;
  const sw = num(nalog.rezanje.sirina_trake, nalog.sirina) || 85;
  const mw = num(nalog.rezanje.sirina_maticne, bw * sw + 30) || bw * sw + 30;
  const used = bw * sw;
  const waste = Math.max(0, mw - used);
  const wasteEach = waste / 2;
  return (
    <Layout color={C.rezanje} title="NALOG ZA REZANJE (SEČENJE)" subtitle="Interno rezanje za finalne formate" nalog={nalog}>
      <Info color={C.rezanje} cols={4}>
        <InfoItem label="KUPAC" value={nalog.kupac} />
        <InfoItem label="VRSTA MATERIJALA" value={nalog.materijali.map(m => m.materijal).filter(Boolean).join(" + ")} />
        <InfoItem label="DEBLJINA" value={fmt(nalog.materijali.reduce((s,m)=>s+num(m.debljina),0), " µm")} />
        <InfoItem label="LOKACIJA ROLNI" value={nalog.rezanje.lokacija} color={C.rezanje} />
      </Info>
      <div style={{ padding: "2rem" }}>
        <Tabela color={C.rezanje} title="SPECIFIKACIJA REZANJA" rows={[
          ["Širina matične rolne:", fmt(mw, " mm"), "Broj traka:", fmt(bw, " traka")],
          ["Širina jedne trake:", fmt(sw, " mm"), "Tolerancija:", nalog.rezanje.tolerancija],
          ["Količina za rezanje:", fmt(nalog.rezanje.metraza, " m"), "Korona tretman:", nalog.rezanje.korona],
        ]} />

        <div style={{ background: "#fafafa", border: `2px solid ${C.rezanje}`, borderRadius: 8, padding: "2rem", marginBottom: "2rem" }}>
          <SectionTitle color={C.rezanje}>📐 ŠEMA SLAGANJA TRAKA NA ROLNI</SectionTitle>
          <div style={{ background: "white", border: "1px solid #e5e7eb", padding: "2rem", borderRadius: 6, overflowX: "auto" }}>
            <div style={{ textAlign: "center", marginBottom: "1rem", fontWeight: 800, color: "#666" }}>MATIČNA ROLNA: {mw}mm</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 2, minWidth: 760 }}>
              <WasteBox width={Math.max(16, wasteEach * 0.7)} label={`${wasteEach.toFixed(1)}mm`} />
              {Array.from({ length: bw }).map((_, i) => (
                <div key={i} style={{ width: Math.max(55, sw * 0.7), background: "linear-gradient(135deg,#ddd6fe,#8b5cf6)", height: 140, border: `2px solid ${C.rezanje}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "white", fontWeight: 900 }}>
                  <div style={{ writingMode: "vertical-rl", fontSize: 11 }}>TRAKA {i + 1}</div>
                  <div style={{ fontSize: 14, marginTop: 10 }}>{sw}mm</div>
                </div>
              ))}
              <WasteBox width={Math.max(16, wasteEach * 0.7)} label={`${wasteEach.toFixed(1)}mm`} />
            </div>
            <div style={{ marginTop: "1.5rem", fontSize: 13, color: "#666", textAlign: "center" }}>
              Raspored: <b style={{ color: C.rezanje }}>otpad + {Array.from({ length: bw }).map(() => sw).join(" + ")} + otpad</b>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function WasteBox({ width, label }) {
  return <div style={{ width, background: "#fee2e2", height: 140, border: "1px solid #dc2626", display: "flex", alignItems: "center", justifyContent: "center", writingMode: "vertical-rl", fontSize: 9, color: "#dc2626", fontWeight: 800 }}>OTPAD {label}</div>;
}

function NalogPerforacija({ nalog }) {
  return (
    <Layout color={C.perforacija} title="NALOG ZA PERFORACIJU" subtitle="Linija presecanja i odvajanja" nalog={nalog}>
      <Info color={C.perforacija} cols={3}>
        <InfoItem label="PROIZVOD" value={nalog.naziv} />
        <InfoItem label="DIMENZIJE" value={`${nalog.sirina} × ${nalog.duzina} mm`} />
        <InfoItem label="TIP PERFORACIJE" value={nalog.perforacija.tip} color={C.perforacija} />
      </Info>
      <div style={{ padding: "2rem" }}>
        <Tabela color={C.perforacija} title="PARAMETRI PERFORACIJE" rows={[
          ["Oblik perforacije:", nalog.perforacija.oblik, "Orijentacija:", nalog.perforacija.orijentacija],
          ["Pozicija:", nalog.perforacija.pozicija, "Razmak između linija:", fmt(nalog.perforacija.razmak, " mm")],
          ["Dužina reza:", fmt(nalog.perforacija.rez, " mm"), "Razmak između rezova:", fmt(nalog.perforacija.razmak_reza, " mm")],
        ]} />
        <div style={{ background: "#fafafa", border: `2px solid ${C.perforacija}`, borderRadius: 8, padding: "2rem", marginBottom: "2rem" }}>
          <SectionTitle color={C.perforacija}>📐 TEHNIČKI CRTEŽ PERFORACIJE</SectionTitle>
          <div style={{ background: "white", border: "1px solid #e5e7eb", padding: "2rem", borderRadius: 6 }}>
            <div style={{ textAlign: "center", fontSize: 12, color: "#666", marginBottom: "1.5rem", fontWeight: 800 }}>POPREČNA PERFORACIJA - POGLED SA STRANE</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ display: "contents" }}>
                  <div style={{ width: 500, height: 100, background: "linear-gradient(135deg,#dbeafe,#e0f2fe)", border: `2px solid ${C.perforacija}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "#0284c7" }}>JEDINICA #{i}</div>
                    {i === 1 && <div style={{ position: "absolute", right: 10, top: 10, fontSize: 11, color: "#666", background: "white", padding: "4px 8px", borderRadius: 4 }}>{nalog.sirina} × {nalog.duzina}mm</div>}
                  </div>
                  {i < 3 && <div style={{ width: 500, height: 10, background: "white", display: "flex", alignItems: "center" }}><div style={{ width: "100%", height: 2, background: "repeating-linear-gradient(to right,#dc2626 0px,#dc2626 3px,transparent 3px,transparent 4px)" }} /></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function IzgledNaRolni({ nalog }) {
  return (
    <Layout color={C.rolna} title="IZGLED NA ROLNI - FINALNI PROIZVOD" subtitle="Specifikacija namotavanja i izgleda" nalog={nalog}>
      <Info color={C.rolna} cols={4}>
        <InfoItem label="PROIZVOD" value={nalog.naziv} />
        <InfoItem label="DIMENZIJE" value={`${nalog.sirina} × ${nalog.duzina} mm`} />
        <InfoItem label="BROJ ETIKETA U METRU" value={nalog.rolna.etiketa_m} color={C.rolna} />
        <InfoItem label="SMER ODMOTAVANJA" value={`${nalog.rolna.smer_gp} ↓`} />
      </Info>
      <div style={{ padding: "2rem" }}>
        <div style={{ background: "#fafafa", border: `2px solid ${C.rolna}`, borderRadius: 8, padding: "2rem", marginBottom: "2rem" }}>
          <SectionTitle color={C.rolna}>📐 VIZUELNI PRIKAZ ROLNE</SectionTitle>
          <div style={{ background: "white", border: "1px solid #e5e7eb", padding: "2rem", borderRadius: 6 }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: "1rem", fontWeight: 800 }}>POGLED SA STRANE (PRESEK ROLNE)</div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
                <div style={{ position: "relative", width: 220, height: 420, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ position: "absolute", width: 200, height: 400, background: "linear-gradient(to right,#fce7f3,#ec4899)", borderRadius: 100, opacity: 0.75, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ writingMode: "vertical-rl", fontSize: 14, fontWeight: 900, color: "#831843" }}>FOLIJA ({nalog.rolna.precnik}mm)</div>
                  </div>
                  <div style={{ width: 100, height: 300, background: "linear-gradient(to right,#d1d5db,#9ca3af)", borderRadius: 50, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                    <div style={{ writingMode: "vertical-rl", fontSize: 12, fontWeight: 900, color: "white" }}>HILZNA fi {nalog.rolna.hilzna}mm</div>
                  </div>
                </div>
                <div style={{ background: "#fdf2f8", padding: "1rem", borderRadius: 6, borderLeft: `4px solid ${C.rolna}`, minWidth: 260 }}>
                  <InfoItem label="Unutrašnji prečnik" value={`${nalog.rolna.hilzna} mm`} color={C.rolna} />
                  <div style={{ height: 14 }} />
                  <InfoItem label="Spoljašnji prečnik" value={`${nalog.rolna.precnik} mm`} color={C.rolna} />
                  <div style={{ height: 14 }} />
                  <InfoItem label="Pakovanje" value={nalog.rolna.pakovanje} color={C.rolna} />
                </div>
              </div>
            </div>

            <div style={{ borderTop: "2px dashed #e5e7eb", paddingTop: "2rem" }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: C.rolna, marginBottom: "1.5rem", textAlign: "center" }}>SMER ODMOTAVANJA: {nalog.rolna.smer_gp} ↓</div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "3rem", flexWrap: "wrap" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 80, height: 80, background: "radial-gradient(circle,#fce7f3,#ec4899)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "white", marginBottom: "0.5rem" }}>ROLNA</div>
                </div>
                <div style={{ fontSize: 48, color: C.rolna, fontWeight: 900 }}>→</div>
                <div style={{ width: 220, background: "linear-gradient(135deg,#fce7f3,#fdf2f8)", border: `2px dashed ${C.rolna}`, borderRadius: 8, padding: "1.5rem", textAlign: "center" }}>
                  {[1, 2].map(i => <div key={i}><div style={{ background: "white", border: `2px solid ${C.rolna}`, padding: "1rem", borderRadius: 6, marginBottom: 8 }}><div style={{ fontSize: 11, fontWeight: 900, color: "#831843" }}>ETIKETA #{i}</div><div style={{ fontSize: 9, color: "#666" }}>{nalog.sirina} × {nalog.duzina}mm</div></div>{i < 2 && <div style={{ height: 2, background: "repeating-linear-gradient(to right,#dc2626 0px,#dc2626 3px,transparent 3px,transparent 4px)", marginBottom: 8 }} />}</div>)}
                  <div style={{ fontSize: 11, color: "#666", fontWeight: 800 }}>{nalog.rolna.etiketa_m} etiketa / metar</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabela color={C.rolna} title="SPECIFIKACIJE ROLNE" rows={[
          ["Širina trake:", fmt(nalog.sirina, " mm"), "Dužina jedinice:", fmt(nalog.duzina, " mm")],
          ["Broj etiketa u metru:", `${nalog.rolna.etiketa_m} kom/m`, "Smer odmotavanja GP:", nalog.rolna.smer_gp],
          ["Prečnik hilzne:", `${nalog.rolna.hilzna} mm`, "Prečnik finalne rolne:", `${nalog.rolna.precnik} mm`],
          ["Metraža po rolni:", "Prema potrebi", "Broj traka po širini:", fmt(nalog.rezanje.broj_traka, " traka")],
        ]} />
      </div>
    </Layout>
  );
}

export default function NaloziOperacije({ nalogId, nalog: nalogProp }) {
  const [raw, setRaw] = useState(nalogProp || null);
  const [loading, setLoading] = useState(!nalogProp);
  const [active, setActive] = useState("materijal");

  useEffect(() => {
    if (nalogProp) {
      setRaw(nalogProp);
      setLoading(false);
      return;
    }
    if (!nalogId) {
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("radni_nalozi_folija")
        .select("*")
        .eq("id", nalogId)
        .single();

      if (error) console.error("Greška učitavanja operativnih naloga:", error.message);
      setRaw(data || null);
      setLoading(false);
    }

    load();
  }, [nalogId, nalogProp]);

  const nalog = useMemo(() => normalizujNalog(raw), [raw]);

  if (loading) return <div style={{ padding: 30 }}>Učitavanje operativnih naloga...</div>;
  if (!raw) return <div style={{ padding: 30 }}>Nema naloga za prikaz.</div>;

  const tabs = [
    ["materijal", "📦 Potreba materijala", C.materijal],
    ["stampa", "🖨️ Štampa", C.stampa],
    ["kasiranje", "🔗 Kaširanje", C.kasiranje],
    ["rezanje", "✂️ Rezanje", C.rezanje],
    ["perforacija", "⭕ Perforacija", C.perforacija],
    ["rolna", "📐 Izgled na rolni", C.rolna],
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {tabs.map(([k, label, color]) => (
          <button
            key={k}
            onClick={() => setActive(k)}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: active === k ? "none" : "1px solid #e2e8f0",
              background: active === k ? color : "#fff",
              color: active === k ? "#fff" : "#334155",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
        <button onClick={() => window.print()} style={{ marginLeft: "auto", padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 800, cursor: "pointer" }}>
          🖨️ Štampaj
        </button>
      </div>

      {active === "materijal" && <PotrebaMaterijala nalog={nalog} />}
      {active === "stampa" && <NalogStampa nalog={nalog} />}
      {active === "kasiranje" && <NalogKasiranje nalog={nalog} />}
      {active === "rezanje" && <NalogRezanje nalog={nalog} />}
      {active === "perforacija" && <NalogPerforacija nalog={nalog} />}
      {active === "rolna" && <IzgledNaRolni nalog={nalog} />}
    </div>
  );
}
