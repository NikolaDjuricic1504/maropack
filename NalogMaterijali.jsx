import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase.js";
import { LOGO_B64 } from "./constants.js";

const BLUE = "#2446b8";
const DARK = "#0f172a";
const LINE = "#dbe3ef";
const SOFT = "#f8fafc";
const WARN = "#fff7ed";

const safe = (v, fallback = "-") => {
  if (v === undefined || v === null || v === "") return fallback;
  return v;
};

const num = (v, dec = 2) => {
  if (v === undefined || v === null || v === "" || isNaN(Number(v))) return "-";
  return Number(v).toLocaleString("sr-RS", { minimumFractionDigits: dec, maximumFractionDigits: dec });
};

const int = (v) => {
  if (v === undefined || v === null || v === "" || isNaN(Number(v))) return "-";
  return Number(v).toLocaleString("sr-RS", { maximumFractionDigits: 0 });
};

function getParam(nalog, key, fallback = "") {
  const p = nalog?.parametri || nalog?.mats || {};
  if (p && Object.prototype.hasOwnProperty.call(p, key)) return p[key];
  if (nalog && Object.prototype.hasOwnProperty.call(nalog, key)) return nalog[key];
  return fallback;
}

function Section({ title, children }) {
  return (
    <div style={{ border: `1px solid ${LINE}`, borderTop: "none", background: "#fff" }}>
      <div style={{ background: BLUE, color: "#fff", padding: "12px 26px", fontWeight: 900, letterSpacing: 0.3, fontSize: 15 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function InfoGrid({ rows }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr 1.2fr", borderTop: `1px solid ${LINE}` }}>
      {rows.map((r, idx) => (
        <div key={idx} style={{ display: "contents" }}>
          <div style={cellLabel}>{r[0]}</div>
          <div style={cellValue}>{safe(r[1])}</div>
          <div style={cellLabel}>{r[2]}</div>
          <div style={cellValue}>{safe(r[3])}</div>
        </div>
      ))}
    </div>
  );
}

const cellLabel = {
  padding: "13px 26px",
  background: SOFT,
  borderRight: `1px solid ${LINE}`,
  borderBottom: `1px solid ${LINE}`,
  color: DARK,
  fontWeight: 800,
  fontSize: 13,
};

const cellValue = {
  padding: "13px 26px",
  borderRight: `1px solid ${LINE}`,
  borderBottom: `1px solid ${LINE}`,
  color: BLUE,
  fontWeight: 800,
  fontSize: 13,
};

function MaterialTable({ nalog }) {
  const layers = [];
  const p = nalog?.parametri || nalog?.mats || {};

  if (Array.isArray(p.mats)) {
    p.mats.forEach((m, i) => {
      if (m?.tip || m?.materijal || m?.naziv) {
        layers.push({
          sloj: `SLOJ ${i + 1}`,
          materijal: m.tip || m.materijal || m.naziv,
          debljina: m.deb || m.debljina || m.debljina_um,
          sirina: m.sirina || p.sirina_trake || p.sirina_materijala || p.sirina,
          kg: m.potreba_kg || m.tkg_nalog || m.kg,
          metri: m.potreba_m || m.metri || p.potreba_m_1,
        });
      }
    });
  }

  for (let i = 1; i <= 6; i += 1) {
    const mat = p[`materijal_${i}`] || p[`mat${i}`];
    if (mat) {
      layers.push({
        sloj: `SLOJ ${i}`,
        materijal: mat,
        debljina: p[`debljina_${i}`] || p[`deb_${i}`],
        sirina: p[`sirina_${i}`] || p.sirina_materijala || p.sirina_trake || p.sirina,
        kg: p[`potreba_kg_${i}`] || p[`kg_${i}`],
        metri: p[`potreba_m_${i}`] || p[`m_${i}`],
      });
    }
  }

  const unique = [];
  const seen = new Set();
  layers.forEach((x) => {
    const key = `${x.sloj}-${x.materijal}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(x);
    }
  });

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ background: "#f1f5f9", color: "#475569" }}>
          <th style={th}>SLOJ</th>
          <th style={th}>MATERIJAL</th>
          <th style={th}>DEBLJINA</th>
          <th style={th}>ŠIRINA</th>
          <th style={th}>POTREBNO (KG)</th>
          <th style={th}>POTREBNO (M)</th>
        </tr>
      </thead>
      <tbody>
        {unique.length === 0 ? (
          <tr><td colSpan={6} style={{ ...td, textAlign: "center", color: "#64748b" }}>Nema unetih slojeva materijala.</td></tr>
        ) : unique.map((m, i) => (
          <tr key={`${m.sloj}-${i}`} style={{ background: i % 2 ? "#fff" : WARN }}>
            <td style={{ ...td, fontWeight: 900 }}>{m.sloj}</td>
            <td style={td}>{safe(m.materijal)}</td>
            <td style={td}>{safe(m.debljina)} µm</td>
            <td style={td}>{safe(m.sirina)} mm</td>
            <td style={{ ...td, color: BLUE, fontWeight: 900 }}>{num(m.kg)}</td>
            <td style={{ ...td, color: BLUE, fontWeight: 900 }}>{int(m.metri)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const th = { padding: "12px 18px", textAlign: "left", borderBottom: `1px solid ${LINE}`, fontSize: 12, fontWeight: 900 };
const td = { padding: "13px 18px", borderBottom: `1px solid ${LINE}`, color: DARK };

function MiniDrawing({ nalog }) {
  const brojTraka = Number(getParam(nalog, "broj_traka", 0));
  const sirinaTrake = getParam(nalog, "sirina_trake", getParam(nalog, "sirina", ""));
  const sirinaMat = getParam(nalog, "sirina_materijala", "");
  const count = brojTraka > 0 ? Math.min(brojTraka, 12) : 6;

  return (
    <div style={{ padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, color: "#64748b", fontSize: 12, fontWeight: 700 }}>
        <span>Šema rezanja / trake</span>
        <span>Materijal: {safe(sirinaMat)} mm</span>
      </div>
      <div style={{ border: `2px solid ${BLUE}`, height: 72, display: "grid", gridTemplateColumns: `repeat(${count}, 1fr)`, background: "#eef4ff" }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ borderRight: i === count - 1 ? "none" : `1px solid ${BLUE}`, display: "flex", alignItems: "center", justifyContent: "center", color: BLUE, fontWeight: 900, fontSize: 12 }}>
            {safe(sirinaTrake)} mm
          </div>
        ))}
      </div>
      {brojTraka > 12 && <div style={{ marginTop: 8, fontSize: 11, color: "#64748b" }}>Prikazano 12 od ukupno {brojTraka} traka.</div>}
    </div>
  );
}

export default function NalogGlavni({ nalogId, onClose }) {
  const [nalog, setNalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setErr("");
      try {
        let q = supabase.from("radni_nalozi_folija").select("*");
        if (nalogId) q = q.eq("id", nalogId).single();
        else q = q.order("created_at", { ascending: false }).limit(1).single();
        const { data, error } = await q;
        if (error) throw error;
        if (active) setNalog(data);
      } catch (e) {
        if (active) setErr(e?.message || "Greška pri učitavanju naloga");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [nalogId]);

  const p = nalog?.parametri || nalog?.mats || {};

  const header = useMemo(() => ({
    broj: safe(nalog?.broj_naloga || nalog?.ponBr || p.broj_naloga, "-") ,
    naziv: safe(nalog?.naziv || nalog?.prod || p.naziv_proizvoda || p.naziv, "-"),
    kupac: safe(p.kupac || nalog?.kupac, "-"),
    datumPor: safe(p.datum_porudzbine || nalog?.datum, "-"),
    rok: safe(p.datum_isporuke || p.rok_isporuke || p.datumIsp, "-"),
    porudzbina: safe(p.broj_porudzbine || nalog?.ponBr, "-"),
    status: safe(nalog?.status || p.status, "u_pripremi"),
    sirina: safe(p.sirina || p.sirina_trake, "-"),
    duzina: safe(p.duzina || p.duzina_kese || p.duzina_etikete, "-"),
    grafika: safe(p.graficko_resenje || p.grafika, "-"),
  }), [nalog, p]);

  if (loading) return <div style={loader}>Učitavanje izgleda naloga...</div>;
  if (err) return <div style={{ ...loader, color: "#dc2626" }}>Greška: {err}</div>;
  if (!nalog) return <div style={loader}>Nema naloga za prikaz.</div>;

  return (
    <div style={{ background: "#eaf0f8", padding: 0 }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #nalog-print, #nalog-print * { visibility: visible; }
          #nalog-print { position: absolute; left: 0; top: 0; width: 100%; background: white; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 12 }}>
        <button onClick={() => window.print()} style={btnPrimary}>🖨️ Štampaj / PDF</button>
        {onClose && <button onClick={onClose} style={btnSecondary}>Zatvori</button>}
      </div>

      <div id="nalog-print" style={{ background: "#fff", border: `1px solid ${LINE}`, color: DARK, fontFamily: "Arial, Segoe UI, sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "34px 42px 26px" }}>
          <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
            {LOGO_B64 && <img src={LOGO_B64} alt="Maropack" style={{ width: 170, height: 54, objectFit: "contain" }} />}
            <div>
              <div style={{ fontSize: 34, fontWeight: 950, color: BLUE, letterSpacing: 0.5 }}>MAROPACK D.O.O.</div>
              <div style={{ marginTop: 6, fontSize: 15, color: "#475569", fontWeight: 600 }}>RADNI NALOG ZA PROIZVODNJU FOLIJA</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>Broj naloga</div>
            <div style={{ fontSize: 44, lineHeight: 1, color: BLUE, fontWeight: 950 }}>{header.broj}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", background: BLUE, color: "#fff" }}>
          {[
            ["DATUM PORUDŽBINE", header.datumPor],
            ["ROK ISPORUKE", header.rok],
            ["KUPAC", header.kupac],
            ["BR. PORUDŽBINE", header.porudzbina],
            ["STATUS", header.status],
          ].map((x) => (
            <div key={x[0]} style={{ padding: "18px 42px", borderRight: "1px solid rgba(255,255,255,0.15)" }}>
              <div style={{ fontSize: 10, opacity: 0.8, fontWeight: 800 }}>{x[0]}</div>
              <div style={{ fontSize: 15, fontWeight: 950, marginTop: 6 }}>{x[1]}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "30px 42px" }}>
          <div>
            <div style={{ color: BLUE, fontSize: 14, fontWeight: 900, marginBottom: 12 }}>NAZIV PROIZVODA</div>
            <div style={{ fontSize: 27, fontWeight: 950, marginBottom: 8 }}>{header.naziv}</div>
            <div style={{ fontSize: 13, color: "#475569" }}>Grafičko rešenje: {header.grafika}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>Dimenzije proizvoda</div>
            <div style={{ fontSize: 34, fontWeight: 950, color: BLUE }}>{header.sirina} × {header.duzina} <span style={{ fontSize: 15, color: "#64748b" }}>mm</span></div>
          </div>
        </div>

        <Section title="1. SASTAV GOTOVOG PROIZVODA (MULTI-LAYER)">
          <MaterialTable nalog={nalog} />
        </Section>

        <Section title="2. PARAMETRI ŠTAMPANJA">
          <InfoGrid rows={[
            ["Štampa mašina:", p.stampa_masina || p.stm, "Strana štampe:", p.strana_stampe || p.stranaRez],
            ["Obim valjka:", `${safe(p.obim_valjka)} mm`, "Broj boja:", p.broj_boja || p.brBoja],
            ["Kliše:", p.klise, "Prečnik hilzne:", `${safe(p.precnik_hilzne || p.hilzna)} mm`],
            ["Smer odmotavanja:", p.smer_odmotavanja || p.smer, "Štamparija:", p.stamparija],
          ]} />
        </Section>

        <Section title="3. PARAMETRI KAŠIRANJA (LAMINIRANJE)">
          <InfoGrid rows={[
            ["Tip lepka:", p.tip_lepka || p.tipLepka, "Odnos lepka:", p.odnos_lepka || p.lepakOdnos],
            ["Nanos lepka:", `${safe(p.nanos_lepka || p.lepakNanos)} g/m²`, "Broj kaširanja:", p.broj_kasiranja || p.kasiranja || "-"],
            ["Materijal A/B/C:", [p.materijal_1, p.materijal_2, p.materijal_3].filter(Boolean).join(" / ") || "-", "Napomena:", p.napomena_kasiranje || p.nap],
          ]} />
        </Section>

        <Section title="4. PARAMETRI REZANJA I ROLNE">
          <InfoGrid rows={[
            ["Širina materijala:", `${safe(p.sirina_materijala)} mm`, "Širina trake:", `${safe(p.sirina_trake || p.sirina)} mm`],
            ["Broj traka:", p.broj_traka || p.rezBrTraka, "Prečnik rolne:", `${safe(p.precnik_rolne)} mm`],
            ["Dužina rolne:", `${safe(p.duzina_rolne)} m`, "Smer odmotavanja GP:", p.smer_odmotavanja_gp],
            ["Broj etiketa u metru:", p.broj_etiketa_u_metru, "Doradne mašine:", p.doradne_masine],
          ]} />
          <MiniDrawing nalog={nalog} />
        </Section>

        <Section title="5. KOLIČINE I KONTROLA">
          <InfoGrid rows={[
            ["Poručena količina:", int(p.porucena_kolicina || nalog.kol), "Količina za rad:", int(p.kolicina_za_rad)],
            ["Potreba materijala:", `${num(p.potreba_kg_1 || p.ukupno_kg)} kg`, "Metraža:", `${int(p.potreba_m_1 || p.ukupno_m)} m`],
            ["Korona:", p.korona, "Obeležavanje:", p.obelezavanje],
            ["Pakovanje rolni:", p.pakovanjeRolni || p.pakovanje_rolni, "Paleta:", p.paleta],
          ]} />
        </Section>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, padding: "30px 42px" }}>
          {["Priprema", "Proizvodnja", "Kontrola kvaliteta"].map((x) => (
            <div key={x} style={{ borderTop: `1px solid ${DARK}`, paddingTop: 8, fontSize: 12, color: "#475569", textAlign: "center" }}>{x} / potpis</div>
          ))}
        </div>
      </div>
    </div>
  );
}

const loader = {
  background: "#fff",
  border: `1px solid ${LINE}`,
  borderRadius: 10,
  padding: 30,
  textAlign: "center",
  color: "#64748b",
  fontWeight: 700,
};

const btnPrimary = {
  border: "none",
  background: BLUE,
  color: "#fff",
  borderRadius: 8,
  padding: "10px 16px",
  fontWeight: 900,
  cursor: "pointer",
};

const btnSecondary = {
  border: `1px solid ${LINE}`,
  background: "#fff",
  color: DARK,
  borderRadius: 8,
  padding: "10px 16px",
  fontWeight: 900,
  cursor: "pointer",
};
