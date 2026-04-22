import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase.js";

var QR_API = "https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=";

function QR({ text }) {
  return <img src={QR_API + encodeURIComponent(text)} alt="QR" style={{ width: 80, height: 80, display: "block" }} />;
}

function Hdr({ naziv, brNaloga, suffix, boja, kupac, datum }) {
  var url = window.location.origin + "?nalog_br=" + brNaloga + suffix;
  return (
    <div style={{ background: boja, color: "#fff", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Maropack d.o.o. — {naziv}</div>
        <div style={{ fontSize: 10, color: "#cbd5e1", marginTop: 2 }}>{brNaloga}<b style={{ color: "#fbbf24" }}>{suffix}</b> &nbsp;·&nbsp; {kupac} &nbsp;·&nbsp; {datum}</div>
      </div>
      <div style={{ background: "#fff", borderRadius: 6, padding: 4 }}>
        <QR text={url} />
        <div style={{ fontSize: 7, color: "#64748b", textAlign: "center", marginTop: 2 }}>Skeniraj</div>
      </div>
    </div>
  );
}

function Sec({ title, children }) {
  return (
    <div style={{ padding: "10px 14px", borderBottom: "0.5px solid #e2e8f0" }}>
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "#94a3b8", marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function Grid({ cols, children, gap = 8, mb = 0 }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap, marginBottom: mb }}>{children}</div>;
}

function Field({ label, value, color }) {
  var bg = color === "blue" ? "#eff6ff" : color === "green" ? "#f0fdf4" : color === "yellow" ? "#fefce8" : color === "red" ? "#fef2f2" : "#f8fafc";
  var cl = color === "blue" ? "#1e40af" : color === "green" ? "#166534" : color === "yellow" ? "#854d0e" : color === "red" ? "#991b1b" : "#1e293b";
  var bc = color === "blue" ? "#bfdbfe" : color === "green" ? "#bbf7d0" : color === "yellow" ? "#fde68a" : color === "red" ? "#fecaca" : "#e2e8f0";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ fontSize: 9, color: "#94a3b8" }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 600, padding: "4px 7px", background: bg, color: cl, borderRadius: 5, border: "0.5px solid " + bc }}>{value || "—"}</div>
    </div>
  );
}

function MatRow({ label, tip, sirina, rolna, lokacija, ima }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#f8fafc", borderRadius: 5, border: "0.5px solid #e2e8f0", marginBottom: 5 }}>
      <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: label === "Mat.1" ? "#eff6ff" : label === "Mat.2" ? "#f5f3ff" : label === "Mat.3" ? "#fefce8" : "#fef3c7", color: label === "Mat.1" ? "#1e40af" : label === "Mat.2" ? "#5b21b6" : label === "Mat.3" ? "#854d0e" : "#92400e", flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{tip} <span style={{ fontSize: 10, color: "#64748b", fontWeight: 400 }}>· {sirina}mm</span></div>
      {ima ? (
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "#166534", fontWeight: 600 }}>{rolna}</div>
          <div style={{ fontSize: 9, color: "#64748b" }}>{lokacija}</div>
        </div>
      ) : (
        <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "#fef2f2", color: "#991b1b", border: "0.5px solid #fecaca" }}>Nema u magacinu!</span>
      )}
    </div>
  );
}

function PotpisLinja() {
  return (
    <div style={{ padding: "8px 14px", background: "#f8fafc", display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8" }}>
      <span>Nalog izradio: _________________ &nbsp; Datum: _________</span>
      <span>Nalog odobrio: _________________</span>
    </div>
  );
}

function NalogCard({ children, style }) {
  return (
    <div style={{ background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: 8, overflow: "hidden", marginBottom: 20, ...style }}>
      {children}
    </div>
  );
}

export default function NalogFolija({ nalog, onClose, card, inp, lbl, msg }) {
  var [aktivniTab, setAktivniTab] = useState("mat");
  var [rolne, setRolne] = useState([]);
  var [loading, setLoading] = useState(true);
  var printRef = useRef(null);

  var n = nalog;
  var brN = n.ponBr || n.br || "MP-2026-XXX";
  var datum = n.datum || new Date().toLocaleDateString("sr-RS");
  var datumIsp = n.datumIsp || "—";
  var kupac = n.kupac || "—";
  var naziv = n.prod || n.naziv || "—";
  var mats = n.mats || [];
  var kolM = n.kol || 0;
  var sk = n.sk || 10;
  var zaRadM = Math.round(kolM * (1 + sk / 100));
  var sirina = n.sir || 0;
  var idealSir = n.ik || sirina;

  useEffect(function () {
    loadRolne();
  }, [idealSir]);

  async function loadRolne() {
    setLoading(true);
    try {
      var res = await supabase.from("magacin").select("*")
        .gte("sirina", idealSir)
        .lte("sirina", +idealSir + 25)
        .neq("status", "Iskorišćeno")
        .order("sirina", { ascending: true });
      setRolne(res.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  function nadjiRolnu(tip) {
    if (!tip) return null;
    var tipBase = tip.split(" ")[0].toLowerCase();
    return rolne.find(function (r) {
      return r.tip && r.tip.toLowerCase().includes(tipBase);
    });
  }

  function printNalog() {
    window.print();
  }

  var TABS = [
    { k: "mat", l: "1. Materijal", boja: "#1e3a5f", suffix: "-7" },
    { k: "stm", l: "2. Štampa", boja: "#1a3a1a", suffix: "-2" },
    { k: "kas", l: "3. Kaširanje", boja: "#3a1a1a", suffix: "-3" },
    { k: "prf", l: "4. Perforacija", boja: "#1a1a3a", suffix: "-5" },
    { k: "rez", l: "5. Rezanje", boja: "#1a2e1a", suffix: "-4" },
  ];

  var aktTab = TABS.find(function (t) { return t.k === aktivniTab; });

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 9000, display: "flex", flexDirection: "column" }}>
      {/* TOP BAR */}
      <div style={{ background: "#0f172a", padding: "10px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={onClose} style={{ padding: "6px 14px", borderRadius: 7, border: "none", background: "#334155", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>← Nazad</button>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Radni nalozi — {brN} &nbsp;·&nbsp; {kupac}</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={printNalog} style={{ padding: "6px 14px", borderRadius: 7, border: "none", background: "#1d4ed8", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>🖨️ Štampaj ovaj nalog</button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ background: "#1e293b", padding: "8px 16px 0", display: "flex", gap: 4, flexShrink: 0 }}>
        {TABS.map(function (t) {
          return (
            <button key={t.k} onClick={function () { setAktivniTab(t.k); }}
              style={{ padding: "7px 14px", borderRadius: "7px 7px 0 0", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: aktivniTab === t.k ? "#f1f5f9" : "transparent", color: aktivniTab === t.k ? "#0f172a" : "#94a3b8" }}>
              {t.l}
            </button>
          );
        })}
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflow: "auto", background: "#f1f5f9", padding: 20 }} ref={printRef}>

        {/* ===== 1. MATERIJAL ===== */}
        {aktivniTab === "mat" && (
          <NalogCard>
            <Hdr naziv="Nalog za materijal" brNaloga={brN} suffix="-7" boja="#1e3a5f" kupac={kupac} datum={datum} />
            <Sec title="Identifikacija naloga">
              <Grid cols={4} mb={8}>
                <Field label="Radni nalog br." value={brN} color="blue" />
                <Field label="Datum izdavanja" value={datum} />
                <Field label="Datum isporuke" value={datumIsp} color="yellow" />
                <Field label="Kupac" value={kupac} />
              </Grid>
              <Field label="Naziv proizvoda" value={naziv} />
            </Sec>

            <Sec title={"Materijali potrebni — idealna širina: " + idealSir + "mm, traži: " + idealSir + "–" + (+idealSir + 25) + "mm"}>
              {mats.length === 0 ? (
                <div style={{ color: "#94a3b8", fontSize: 12, padding: 8 }}>Nema materijala u bazi za ovaj proizvod.</div>
              ) : mats.map(function (m, i) {
                var r = nadjiRolnu(m.tip);
                return (
                  <MatRow key={i}
                    label={"Mat." + (i + 1)}
                    tip={m.tip + (m.deb ? " " + m.deb + "mic" : "")}
                    sirina={idealSir}
                    rolna={r ? r.br_rolne + " · " + (r.metraza_ost || r.metraza || 0).toLocaleString() + "m" : ""}
                    lokacija={r ? r.palet || r.sch || "—" : ""}
                    ima={!!r}
                  />
                );
              })}
              {loading && <div style={{ fontSize: 11, color: "#94a3b8" }}>⏳ Pretražujem magacin...</div>}
            </Sec>

            <Sec title="Količine">
              <Grid cols={4}>
                <Field label="Poručeno (m)" value={kolM.toLocaleString()} />
                <Field label="Za rad (m)" value={zaRadM.toLocaleString()} color="yellow" />
                <Field label="Škart %" value={sk + "%"} />
                <Field label="Širina materijala" value={idealSir + " mm"} color="blue" />
              </Grid>
            </Sec>

            <Sec title="Napomena">
              <div style={{ minHeight: 36, padding: 8, background: "#f8fafc", borderRadius: 5, border: "0.5px solid #e2e8f0", fontSize: 12, color: "#64748b" }}>
                {n.nap || "Proveriti stanje i kvalitet materijala pre puštanja u produkciju."}
              </div>
            </Sec>
            <PotpisLinja />
          </NalogCard>
        )}

        {/* ===== 2. STAMPA ===== */}
        {aktivniTab === "stm" && (
          <NalogCard>
            <Hdr naziv="Nalog za štampu" brNaloga={brN} suffix="-2" boja="#1a3a1a" kupac={kupac} datum={datum} />
            <Sec title="Identifikacija">
              <Grid cols={4} mb={8}>
                <Field label="Porudžbenica br." value={brN} color="blue" />
                <Field label="Datum izdavanja" value={datum} />
                <Field label="Rok isporuke" value="5 dana od mat." color="yellow" />
                <Field label="Status posla" value={n.grafika || "Nov posao"} />
              </Grid>
              <Grid cols={2}>
                <Field label="Kupac" value={kupac} />
                <Field label="Naziv proizvoda" value={naziv} />
              </Grid>
            </Sec>

            <Sec title="Specifikacija štampe">
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "0.5px solid #e2e8f0" }}>
                      {["RB", "Naziv proizvoda", "Dim. rasklopa", "Br. traka", "Materijal", "Kol. štampu (m)", "Kol. (kg)", "Vrsta štampe", "Br. boja", "Smer"].map(function (h) {
                        return <th key={h} style={{ padding: "5px 7px", textAlign: "left", color: "#64748b", fontWeight: 600 }}>{h}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "5px 7px", fontWeight: 700 }}>1</td>
                      <td style={{ padding: "5px 7px" }}>{naziv}</td>
                      <td style={{ padding: "5px 7px" }}>{idealSir}×{zaRadM}mm</td>
                      <td style={{ padding: "5px 7px" }}>1</td>
                      <td style={{ padding: "5px 7px" }}>{mats[0] ? mats[0].tip + " " + (mats[0].deb || "") + "mic, " + idealSir + "mm" : "—"}</td>
                      <td style={{ padding: "5px 7px", color: "#059669", fontWeight: 600 }}>{zaRadM.toLocaleString()}</td>
                      <td style={{ padding: "5px 7px" }}>{mats[0] && mats[0].deb ? Math.round(zaRadM * idealSir / 1000 * mats[0].deb * 0.91 / 1000) + " kg" : "—"}</td>
                      <td style={{ padding: "5px 7px", color: "#7c3aed", fontWeight: 600 }}>{n.stm || "Flexo"}</td>
                      <td style={{ padding: "5px 7px" }}>{n.brBoja || "4"}</td>
                      <td style={{ padding: "5px 7px" }}>{n.smer || "Desno"}</td>
                    </tr>
                    {[2, 3, 4].map(function (i) {
                      return <tr key={i} style={{ borderBottom: "0.5px solid #f1f5f9" }}>
                        <td style={{ padding: "5px 7px", color: "#94a3b8" }}>{i}</td>
                        {Array(9).fill(null).map(function (_, j) { return <td key={j} style={{ padding: "5px 7px", color: "#94a3b8" }}>—</td>; })}
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 6 }}>Cena usluge: 0,50 €/kg</div>
            </Sec>

            <Sec title="Tehnički parametri">
              <Grid cols={4} mb={8}>
                <Field label="Štamparska mašina" value={n.stmMasina || "Flexo 8-boja"} />
                <Field label="Obim valjka (mm)" value={n.obimValjka || "—"} />
                <Field label="Strana štampe" value={n.stranaStm || "Spolja"} />
                <Field label="Unutr. prečnik hilzne" value={n.hilzna || "76 mm"} />
              </Grid>
              <Grid cols={4}>
                <Field label="Br. traka po širini" value={n.brTraka || "1"} />
                <Field label="Kliše" value={n.klise || "—"} />
                <Field label="Print proof" value={n.proof || "—"} />
                <Field label="Linijatura" value={n.linijatura || "—"} />
              </Grid>
            </Sec>

            <Sec title="Prateći materijal">
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                {["Fajlovi za pripremu", "Kontrolni fajl od kupca", "Digitalni otisak", "Tehnički crtež rasklopa", "Štampani uzorak"].map(function (x) {
                  return <span key={x} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "#f8fafc", border: "0.5px solid #e2e8f0", color: "#64748b" }}>{x}</span>;
                })}
              </div>
            </Sec>

            <Sec title="Opšte napomene">
              <div style={{ fontSize: 11, color: "#64748b", padding: 8, background: "#f8fafc", borderRadius: 5, border: "0.5px solid #e2e8f0" }}>
                Obratiti pažnju na kvalitet štampe. Bez ogrebotina, raspasivanja, prskanja boje. Adhezija adekvatna. Rolne ravno namotane, bez nastavaka. Škart vratiti sa štampanim materijalom. Dokument punovažan bez pečata i potpisa.
              </div>
            </Sec>
            <div style={{ padding: "6px 14px", background: "#f8fafc", fontSize: 10, color: "#94a3b8", borderTop: "0.5px solid #e2e8f0" }}>
              Kontakt za overu: Marko Savić · m.savic@maropack.rs · 060/381-0123
            </div>
            <PotpisLinja />
          </NalogCard>
        )}

        {/* ===== 3. KASIRANJE ===== */}
        {aktivniTab === "kas" && (
          <NalogCard>
            <Hdr naziv="Nalog za kaširanje" brNaloga={brN} suffix="-3" boja="#3a1a1a" kupac={kupac} datum={datum} />
            <Sec title="Identifikacija">
              <Grid cols={4} mb={8}>
                <Field label="Radni nalog br." value={brN} color="blue" />
                <Field label="Datum izdavanja" value={datum} />
                <Field label="Kupac" value={kupac} />
                <Field label="Tiraz (m)" value={zaRadM.toLocaleString()} />
              </Grid>
              <Grid cols={2}>
                <Field label="Naziv proizvoda" value={naziv} />
                <Field label="Sastav GP" value={mats.map(function (m) { return m.tip + " " + (m.deb || "") + "mic"; }).join(" + ") || "—"} />
              </Grid>
            </Sec>

            {[1, 2, 3].map(function (kasIdx) {
              var matA = mats[kasIdx * 2 - 2];
              var matB = mats[kasIdx * 2 - 1];
              var rolnaA = matA ? nadjiRolnu(matA.tip) : null;
              var rolnaB = matB ? nadjiRolnu(matB.tip) : null;
              var active = kasIdx === 1 || (matA && matB);
              return (
                <Sec key={kasIdx} title={(kasIdx === 1 ? "1." : kasIdx === 2 ? "2." : "3.") + " kaširanje" + (!active ? " (nije potrebno)" : "")}>
                  <div style={{ opacity: active ? 1 : 0.4 }}>
                    <Grid cols={4} mb={8}>
                      <Field label="Širina nanosa lepka (mm)" value={active ? idealSir : "—"} />
                      <Field label="Širina form. valjka (mm)" value={active ? (+idealSir + 10) : "—"} />
                      <Field label="Odnos lepka" value={active ? (n.lepakOdnos || "3:1") : "—"} />
                      <Field label="Nanos lepka (g/m²)" value={active ? (n.lepakNanos || "3,5") : "—"} color={active ? "yellow" : ""} />
                    </Grid>
                    <MatRow label="Odmotač A"
                      tip={matA ? matA.tip + " " + (matA.deb || "") + "mic" : "—"}
                      sirina={idealSir}
                      rolna={rolnaA ? rolnaA.br_rolne + " · " + (rolnaA.metraza_ost || 0).toLocaleString() + "m" : ""}
                      lokacija={rolnaA ? rolnaA.palet || "—" : ""}
                      ima={active && !!rolnaA}
                    />
                    <MatRow label="Odmotač B"
                      tip={matB ? matB.tip + " " + (matB.deb || "") + "mic" : "—"}
                      sirina={idealSir}
                      rolna={rolnaB ? rolnaB.br_rolne + " · " + (rolnaB.metraza_ost || 0).toLocaleString() + "m" : ""}
                      lokacija={rolnaB ? rolnaB.palet || "—" : ""}
                      ima={active && !!rolnaB}
                    />
                  </div>
                </Sec>
              );
            })}

            <Sec title="Parametri kaširanja">
              <Grid cols={4}>
                <Field label="Tip lepka" value={n.tipLepka || "PU solventni"} />
                <Field label="Prečnik fin. rolne" value="do 800mm" />
                <Field label="Ulaz materijala" value="Magacin" />
                <Field label="Izlaz materijala" value="Rezanje" />
              </Grid>
            </Sec>

            <Sec title="Napomene">
              <div style={{ minHeight: 36, padding: 8, background: "#f8fafc", borderRadius: 5, border: "0.5px solid #e2e8f0", fontSize: 12, color: "#64748b" }}>
                {n.nap || "Proveriti adheziju na nastavku svake rolne. Meriti nanos lepka svakih 2.000m. Prečnik finalne rolne max 800mm."}
              </div>
            </Sec>
            <PotpisLinja />
          </NalogCard>
        )}

        {/* ===== 4. PERFORACIJA ===== */}
        {aktivniTab === "prf" && (
          <NalogCard>
            <Hdr naziv="Nalog za perforaciju" brNaloga={brN} suffix="-5" boja="#1a1a3a" kupac={kupac} datum={datum} />
            <Sec title="Identifikacija">
              <Grid cols={4} mb={8}>
                <Field label="Radni nalog br." value={brN} color="blue" />
                <Field label="Datum" value={datum} />
                <Field label="Kupac" value={kupac} />
                <Field label="Naziv proizvoda" value={naziv} />
              </Grid>
            </Sec>

            <Sec title="Parametri perforacije">
              <Grid cols={4} mb={8}>
                <Field label="Tip perforacije" value={n.tipPerf || "—"} color={n.tipPerf ? "blue" : ""} />
                <Field label="Oblik perforacije" value={n.oblikPerf || "—"} />
                <Field label="Orijentacija" value={n.orjentPerf || "—"} />
                <Field label="Razmak (mm)" value={n.razmakPerf || "—"} />
              </Grid>
              <Grid cols={4}>
                <Field label="Širina materijala" value={idealSir + " mm"} />
                <Field label="Količina za perf. (m)" value={zaRadM.toLocaleString()} />
                <Field label="Brzina mašine (m/min)" value={n.brzinaPerf || "120"} />
                <Field label="Vreme izrade" value={n.brzinaPerf ? Math.round(zaRadM / +n.brzinaPerf / 60 * 10) / 10 + "h" : "—"} color="green" />
              </Grid>
            </Sec>

            <Sec title="Kontrola kvaliteta">
              <Grid cols={3}>
                <Field label="Sila kidanja (N)" value="Izmeriti i upisati" />
                <Field label="Tačnost razmaka" value={n.razmakPerf ? n.razmakPerf + " ± 0,5mm" : "—"} />
                <Field label="Vizuelna kontrola" value="Svakih 5.000m" />
              </Grid>
            </Sec>

            <Sec title="Napomena">
              <div style={{ minHeight: 36, padding: 8, background: "#f8fafc", borderRadius: 5, border: "0.5px solid #e2e8f0", fontSize: 12, color: "#64748b" }}>
                {n.napPerf || n.nap || "Proveriti silu kidanja na početku i svakih 2.000m. Škart odvojiti i izmeriti."}
              </div>
            </Sec>

            <Sec title="Napomena operatera (uneti na kraju)">
              <div style={{ minHeight: 48, padding: 8, background: "#fffbeb", borderRadius: 5, border: "0.5px dashed #fde68a", fontSize: 12, color: "#92400e" }}>
                &nbsp;
              </div>
            </Sec>
            <PotpisLinja />
          </NalogCard>
        )}

        {/* ===== 5. REZANJE ===== */}
        {aktivniTab === "rez" && (
          <NalogCard>
            <Hdr naziv="Nalog za rezanje" brNaloga={brN} suffix="-4" boja="#1a2e1a" kupac={kupac} datum={datum} />
            <Sec title="Identifikacija">
              <Grid cols={4} mb={8}>
                <Field label="Radni nalog br." value={brN} color="blue" />
                <Field label="Datum" value={datum} />
                <Field label="Kupac" value={kupac} />
                <Field label="Kol. za rasecanje" value={(n.kolKg || "—") + " kg / " + zaRadM.toLocaleString() + " m"} />
              </Grid>
              <Grid cols={2}>
                <Field label="Naziv proizvoda" value={naziv} />
                <Field label="Sastav materijala" value={mats.map(function (m) { return m.tip + " " + (m.deb || "") + "mic"; }).join(" + ") || "—"} />
              </Grid>
            </Sec>

            <Sec title="Parametri rezanja">
              <Grid cols={4} mb={8}>
                <Field label="Vrsta sečiva" value={n.secivo || "Žilet"} />
                <Field label="Šir. matične rolne" value={idealSir + "mm iskoristivo"} color="blue" />
                <Field label="Br. traka" value={n.rezBrTraka || "—"} />
                <Field label="Strana namotavanja" value={n.stranaRez || "Štampa spolja"} />
              </Grid>
              <Grid cols={4}>
                <Field label="Prečnik fin. rolne" value={n.precnikRolne || "do 600mm"} />
                <Field label="Dužina fin. rolne" value={n.duzinaRolne || "do 5.000m"} />
                <Field label="Korona tretman" value={n.korona || "Ne"} />
                <Field label="Planiran br. rolni" value={n.rezBrTraka && n.duzinaRolne ? Math.ceil(zaRadM / +n.duzinaRolne) + " rolni" : "—"} color="green" />
              </Grid>
            </Sec>

            {/* Šema rezanja */}
            {n.rezFormati && n.rezFormati.length > 0 && (
              <Sec title="Šema rezanja">
                <div style={{ display: "flex", gap: 3, alignItems: "stretch", marginBottom: 8 }}>
                  <div style={{ background: "#fef2f2", border: "0.5px solid #fecaca", borderRadius: 3, padding: "3px 5px", color: "#991b1b", fontSize: 9, display: "flex", alignItems: "center" }}>otpad</div>
                  {n.rezFormati.map(function (f, i) {
                    return (
                      <div key={i} style={{ background: i % 2 === 0 ? "#dbeafe" : "#dcfce7", border: "0.5px solid " + (i % 2 === 0 ? "#93c5fd" : "#86efac"), borderRadius: 3, padding: "5px 10px", color: i % 2 === 0 ? "#1e40af" : "#166534", fontWeight: 600, fontSize: 11, textAlign: "center", flex: f.sirina }}>
                        Format {["I", "II", "III", "IV", "V", "VI"][i]} — {f.sirina}mm
                        <div style={{ fontSize: 9, fontWeight: 400 }}>{f.metraza ? f.metraza.toLocaleString() + "m" : ""} {f.napomena || ""}</div>
                      </div>
                    );
                  })}
                  <div style={{ background: "#fef2f2", border: "0.5px solid #fecaca", borderRadius: 3, padding: "3px 5px", color: "#991b1b", fontSize: 9, display: "flex", alignItems: "center" }}>otpad</div>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead><tr style={{ background: "#f8fafc", borderBottom: "0.5px solid #e2e8f0" }}>
                    {["Format", "Širina (mm)", "Br. naloga", "Kupac / Naziv", "Metraža (m)", "Br. rolni", "Hilzna", "Izlaz"].map(function (h) {
                      return <th key={h} style={{ padding: "5px 7px", textAlign: "left", color: "#64748b", fontWeight: 600 }}>{h}</th>;
                    })}
                  </tr></thead>
                  <tbody>
                    {n.rezFormati.map(function (f, i) {
                      return (
                        <tr key={i} style={{ borderBottom: "0.5px solid #f1f5f9" }}>
                          <td style={{ padding: "5px 7px", fontWeight: 700 }}>{["I", "II", "III", "IV", "V", "VI"][i]}</td>
                          <td style={{ padding: "5px 7px" }}>{f.sirina}</td>
                          <td style={{ padding: "5px 7px", color: "#1d4ed8", fontWeight: 600 }}>{brN}-{["A", "B", "C", "D", "E"][i]}</td>
                          <td style={{ padding: "5px 7px" }}>{kupac} · {f.naziv || naziv}</td>
                          <td style={{ padding: "5px 7px", color: "#059669", fontWeight: 600 }}>{f.metraza ? f.metraza.toLocaleString() : "—"}</td>
                          <td style={{ padding: "5px 7px", color: "#059669", fontWeight: 600 }}>{f.brRolni || "—"}</td>
                          <td style={{ padding: "5px 7px" }}>{n.hilzna || "76mm"}</td>
                          <td style={{ padding: "5px 7px" }}>{f.izlaz || "Magacin GP"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Sec>
            )}

            <Sec title="Pakovanje i označavanje">
              <Grid cols={4} mb={8}>
                <Field label="Rolne za isporuku" value={n.rolneIsporuka || "Sa nastavkom"} />
                <Field label="Obeležavanje nastavaka" value={n.obelezavanje || "Crvena traka"} color="yellow" />
                <Field label="Pakovanje rolni" value={n.pakovanjeRolni || "Svaka pojedinačno"} />
                <Field label="Paleta" value={n.paleta || "Euro paleta"} />
              </Grid>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {["1. Etiketa u hilznu", "2. Etiketa na rolnu", "3. Etiketa na omot"].map(function (x) {
                  return <span key={x} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "#eff6ff", color: "#1e40af", border: "0.5px solid #bfdbfe" }}>{x}</span>;
                })}
                {n.kilazaRolne && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "#f0fdf4", color: "#166534", border: "0.5px solid #bbf7d0" }}>Na etiketu upisati kilažu rolne</span>}
              </div>
            </Sec>

            <Sec title="Napomena &nbsp;/&nbsp; Napomena operatera">
              <Grid cols={2}>
                <div style={{ padding: 8, background: "#f8fafc", borderRadius: 5, border: "0.5px solid #e2e8f0", fontSize: 12, color: "#64748b", minHeight: 44 }}>
                  {n.napRez || n.nap || "&nbsp;"}
                </div>
                <div style={{ padding: 8, background: "#fffbeb", borderRadius: 5, border: "0.5px dashed #fde68a", fontSize: 12, color: "#92400e", minHeight: 44 }}>
                  Operater upisuje zapažanja...
                </div>
              </Grid>
            </Sec>
            <PotpisLinja />
          </NalogCard>
        )}
      </div>
    </div>
  );
}
