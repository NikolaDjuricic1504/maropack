import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";
import NalogFolija from "./NalogFolija.jsx";

var dnow = function () { return new Date().toLocaleDateString("sr-RS"); };

export default function NoviNalogIzBaze({ user, db, msg, setPage, inp, card, lbl }) {
  var [pretraga, setPretraga] = useState("");
  var [filterKupac, setFilterKupac] = useState("");
  var [filterTip, setFilterTip] = useState("");
  var [izabran, setIzabran] = useState(null);
  var [forma, setForma] = useState(null);
  var [otvoreniNalog, setOtvoreniNalog] = useState(null);
  var [saving, setSaving] = useState(false);

  var TIPOVI = { folija: "🧮 Folija", kesa: "🛍️ Kesa", spulna: "🔄 Špulna" };
  var TIP_BOJA = { folija: "#1d4ed8", kesa: "#059669", spulna: "#7c3aed" };

  var kupci = [...new Set((db.proizvodi || []).map(function (p) { return p.kupac; }).filter(Boolean))].sort();

  var filtrirani = (db.proizvodi || []).filter(function (p) {
    return (!filterKupac || p.kupac === filterKupac) &&
      (!filterTip || p.tip === filterTip) &&
      (!pretraga || (p.naziv || "").toLowerCase().includes(pretraga.toLowerCase()) || (p.kupac || "").toLowerCase().includes(pretraga.toLowerCase()));
  });

  var poKupcu = {};
  filtrirani.forEach(function (p) {
    var k = p.kupac || "Bez kupca";
    if (!poKupcu[k]) poKupcu[k] = [];
    poKupcu[k].push(p);
  });

  function izaberiProizvod(p) {
    setIzabran(p);
    setForma({
      kupac: p.kupac || "",
      datum: dnow(),
      datumIsp: "",
      kol: "",
      sk: 10,
      nalozi: {
        mat: true,
        stm: !!(p.mats && p.mats.some(function (m) { return m.stm; })),
        kas: !!(p.mats && p.mats.length > 1),
        prf: !!(p.nal && p.nal.includes("perf")),
        rez: true,
      },
      grafika: "Nov posao",
      stm: p.mats && p.mats[0] ? (p.mats[0].stm || "Flexo") : "Flexo",
      brBoja: p.mats && p.mats[0] ? (p.mats[0].brBoja || "4") : "4",
      smer: p.smer || "Desno",
      tipPerf: p.nal && p.nal.includes("perf") ? "Poprečna" : "",
      oblikPerf: "Fina (mikro)",
      razmakPerf: "",
      secivo: "Žilet",
      stranaRez: "Štampa spolja",
      rezBrTraka: "",
      precnikRolne: "do 600mm",
      duzinaRolne: "5000",
      korona: "Ne",
      obelezavanje: "Crvena traka",
      pakovanjeRolni: "Svaka pojedinačno, uviti u foliju",
      paleta: "Euro paleta",
      kilazaRolne: true,
      rezFormati: p.rezFormati || [],
      tipLepka: "PU solventni",
      lepakOdnos: "3:1",
      lepakNanos: "3,5",
      obimValjka: "",
      hilzna: "76",
      nap: "",
    });
  }

  async function kreirajNaloge() {
    if (!izabran || !forma.kol || !forma.kupac || !forma.datumIsp) {
      msg("Unesite kupca, količinu i datum isporuke!", "err"); return;
    }
    setSaving(true);
    try {
      var brN = "MP-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 9000) + 1000);
      var zaRadM = Math.round(+forma.kol * (1 + +forma.sk / 100));
      var kolKg = Math.round(zaRadM * (izabran.sir || 0) / 1000 * ((izabran.mats && izabran.mats[0] && izabran.mats[0].deb) || 20) * 0.91 / 1000);

      var nalogBase = {
        ponBr: brN,
        kupac: forma.kupac,
        prod: izabran.naziv,
        tip: izabran.tip || "folija",
        kol: +forma.kol,
        datum: forma.datum,
        datumIsp: forma.datumIsp,
        status: "Ceka",
        ko: user.ime,
        mats: izabran.mats || [],
        sir: izabran.sir || 0,
        ik: izabran.ik || izabran.sir || 0,
        sk: +forma.sk,
        grafika: forma.grafika,
        stm: forma.stm,
        brBoja: forma.brBoja,
        smer: forma.smer,
        hilzna: forma.hilzna,
        obimValjka: forma.obimValjka,
        tipPerf: forma.tipPerf,
        oblikPerf: forma.oblikPerf,
        razmakPerf: forma.razmakPerf,
        secivo: forma.secivo,
        stranaRez: forma.stranaRez,
        rezBrTraka: forma.rezBrTraka,
        precnikRolne: forma.precnikRolne,
        duzinaRolne: forma.duzinaRolne,
        korona: forma.korona,
        obelezavanje: forma.obelezavanje,
        pakovanjeRolni: forma.pakovanjeRolni,
        paleta: forma.paleta,
        kilazaRolne: forma.kilazaRolne,
        rezFormati: forma.rezFormati,
        tipLepka: forma.tipLepka,
        lepakOdnos: forma.lepakOdnos,
        lepakNanos: forma.lepakNanos,
        nap: forma.nap,
        kolKg: kolKg,
      };

      var NAZIVI = {
        mat: "Nalog za materijal",
        stm: "Nalog za stampu",
        kas: "Nalog za kasiranje",
        prf: "Nalog za perforaciju",
        rez: "Nalog za rezanje",
      };

      var inserts = Object.keys(forma.nalozi).filter(function (k) { return forma.nalozi[k]; }).map(function (k) {
        return Object.assign({}, nalogBase, { naziv: NAZIVI[k], tip_op: k });
      });

      var res = await supabase.from("nalozi").insert(inserts).select();
      if (res.error) throw res.error;

      msg("Kreirano " + inserts.length + " naloga! Br: " + brN);

      // Odmah otvori naloge
      setOtvoreniNalog(Object.assign({}, nalogBase, { naziv_op: "sve" }));
      setIzabran(null);
      setForma(null);
    } catch (e) { msg("Greška: " + e.message, "err"); }
    setSaving(false);
  }

  // Ako je nalog otvoren — prikaži ga
  if (otvoreniNalog) {
    return <NalogFolija nalog={otvoreniNalog} onClose={function () { setOtvoreniNalog(null); }} card={card} inp={inp} lbl={lbl} msg={msg} />;
  }

  // Forma za kreiranje
  if (izabran && forma) {
    var p = izabran;
    var zaRad = forma.kol ? Math.round(+forma.kol * (1 + +forma.sk / 100)) : 0;

    return (
      <div>
        <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
          <button onClick={function () { setIzabran(null); setForma(null); }} style={{ padding: "8px 16px", borderRadius: 8, border: "1.5px solid #1d4ed8", background: "transparent", color: "#1d4ed8", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>← Nazad</button>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>⚡ Kreiraj naloge — {p.naziv}</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {/* LEVO — Proizvod info */}
          <div>
            <div style={Object.assign({}, card, { marginBottom: 14 })}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#1d4ed8" }}>📦 Izabrani proizvod</div>
              <div style={{ background: "#f0f9ff", borderRadius: 8, padding: 12, marginBottom: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#1d4ed8", marginBottom: 4 }}>{p.naziv}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>Kupac: {p.kupac}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  {p.sir && <span style={{ fontSize: 11, background: "#dbeafe", color: "#1e40af", borderRadius: 4, padding: "2px 8px" }}>Š: {p.sir}mm</span>}
                  {p.ik && <span style={{ fontSize: 11, background: "#f0fdf4", color: "#166534", borderRadius: 4, padding: "2px 8px" }}>Idealna: {p.ik}mm</span>}
                  {(p.mats || []).map(function (m, i) {
                    return <span key={i} style={{ fontSize: 11, background: "#f5f3ff", color: "#5b21b6", borderRadius: 4, padding: "2px 8px" }}>{m.tip} {m.deb}mic</span>;
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>Rolne iz magacina (±25mm od {p.ik || p.sir}mm)</div>
                <RolnePreview idealSir={p.ik || p.sir} mats={p.mats || []} />
              </div>
            </div>

            {/* Nalozi za kreiranje */}
            <div style={card}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>📋 Nalozi za kreiranje</div>
              {[
                { k: "mat", l: "Nalog za materijal", i: "📦", suffix: "-7" },
                { k: "stm", l: "Nalog za štampu", i: "🖨️", suffix: "-2" },
                { k: "kas", l: "Nalog za kaširanje", i: "🔗", suffix: "-3" },
                { k: "prf", l: "Nalog za perforaciju", i: "🔵", suffix: "-5" },
                { k: "rez", l: "Nalog za rezanje", i: "✂️", suffix: "-4" },
              ].map(function (n) {
                var checked = forma.nalozi[n.k];
                return (
                  <div key={n.k} onClick={function () {
                    var v = !forma.nalozi[n.k];
                    setForma(function (f) { return Object.assign({}, f, { nalozi: Object.assign({}, f.nalozi, { [n.k]: v }) }); });
                  }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "1.5px solid " + (checked ? "#1d4ed8" : "#e2e8f0"), background: checked ? "#eff6ff" : "#f8fafc", cursor: "pointer", marginBottom: 6 }}>
                    <input type="checkbox" checked={checked} onChange={function () { }} style={{ width: 16, height: 16, accentColor: "#1d4ed8" }} />
                    <span style={{ fontSize: 16 }}>{n.i}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: checked ? "#1d4ed8" : "#64748b", flex: 1 }}>{n.l}</span>
                    <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{checked ? "✓" : "—"}</span>
                    <span style={{ fontSize: 10, background: "#f1f5f9", color: "#64748b", borderRadius: 4, padding: "1px 6px" }}>{n.suffix}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DESNO — Forma */}
          <div>
            <div style={Object.assign({}, card, { marginBottom: 14 })}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#059669" }}>📅 Podaci naloga</div>
              <div style={{ display: "grid", gap: 10 }}>
                <div><label style={lbl}>Kupac *</label><input style={inp} value={forma.kupac} onChange={function (e) { var v = e.target.value; setForma(function (f) { return Object.assign({}, f, { kupac: v }); }); }} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><label style={lbl}>Datum porudžbine</label><input style={inp} value={forma.datum} onChange={function (e) { var v = e.target.value; setForma(function (f) { return Object.assign({}, f, { datum: v }); }); }} /></div>
                  <div><label style={lbl}>Datum isporuke *</label><input style={inp} value={forma.datumIsp} onChange={function (e) { var v = e.target.value; setForma(function (f) { return Object.assign({}, f, { datumIsp: v }); }); }} placeholder="npr. 16.05.2026." /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><label style={lbl}>Naručena količina (m) *</label><input type="number" style={inp} value={forma.kol} onChange={function (e) { var v = e.target.value; setForma(function (f) { return Object.assign({}, f, { kol: v }); }); }} placeholder="npr. 22000" /></div>
                  <div><label style={lbl}>Škart %</label><input type="number" style={inp} value={forma.sk} onChange={function (e) { var v = e.target.value; setForma(function (f) { return Object.assign({}, f, { sk: v }); }); }} /></div>
                </div>
                {zaRad > 0 && (
                  <div style={{ padding: 10, background: "#fef3c7", borderRadius: 8, border: "0.5px solid #fde68a", fontSize: 12 }}>
                    <b>Za rad: {zaRad.toLocaleString()} m</b> &nbsp; (naručeno × {(1 + +forma.sk / 100).toFixed(2)})
                  </div>
                )}
                <div><label style={lbl}>Grafičko rešenje</label>
                  <select style={inp} value={forma.grafika} onChange={function (e) { var v = e.target.value; setForma(function (f) { return Object.assign({}, f, { grafika: v }); }); }}>
                    <option>Nov posao</option><option>Posao sa izmenama</option><option>Ponavljanje</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Ako je štampa čekirana */}
            {forma.nalozi.stm && (
              <div style={Object.assign({}, card, { marginBottom: 14 })}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "#7c3aed" }}>🖨️ Parametri štampe</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><label style={lbl}>Vrsta štampe</label>
                    <select style={inp} value={forma.stm} onChange={function (e) { var v = e.target.value; setForma(function (f) { return Object.assign({}, f, { stm: v }); }); }}>
                      <option>Flexo</option><option>Rotogravura</option><option>Digitalna</option><option>Bez štampe</option>
                    </select>
                  </div>
                  <div><label style={lbl}>Broj boja</label><input type="number" style={inp} value={forma.brBoja} onChange={function (e) { var v = e.target.value; setForma(function (f) { return Object.assign({}, f, { brBoja: v }); }); }} /></div>
                  <div><label style={lbl}>Obim valjka (mm)</label><input type="number" style={inp} value={forma.obimValjka} onChange={function (e) { var v = e.target.value; setForma(function (f) { return Object.assign({}, f, { obimValjka: v }); }); }} /></div>
                  <div><label style={lbl}>Smer odmotavanja</label>
                    <select style={inp} value={forma.smer} onChange={function (e) { var v = e.target.value; setForma(function (f) { return Object.assign({}, f, { smer: v }); }); }}>
                      <option>Desno</option><option>Levo</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Ako je perforacija čekirana */}
            {forma.nalozi.prf && (
              <div style={Object.assign({}, card, { marginBottom: 14 })}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "#0891b2" }}>🔵 Parametri perforacije</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><label style={lbl}>Tip perforacije</label>
                    <select style={inp} value={forma.tipPerf} onChange={function (e) { var v = e.target.value; setForma(function (f) { return Object.assign({}, f, { tipPerf: v }); }); }}>
                      <option value="">—</option><option>Poprečna</option><option>Uzdužna</option><option>Kombinovana</option>
                    </select>
                  </div>
                  <div><label style={lbl}>Razmak perforacija (mm)</label><input type="number" style={inp} value={forma.razmakPerf} onChange={function (e) { var v = e.target.value; setForma(function (f) { return Object.assign({}, f, { razmakPerf: v }); }); }} /></div>
                  <div><label style={lbl}>Oblik perforacije</label>
                    <select style={inp} value={forma.oblikPerf} onChange={function (e) { var v = e.target.value; setForma(function (f) { return Object.assign({}, f, { oblikPerf: v }); }); }}>
                      <option>Fina (mikro)</option><option>Gruba</option><option>Makro</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Šema rezanja */}
            {forma.nalozi.rez && (
              <div style={Object.assign({}, card, { marginBottom: 14 })}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "#059669" }}>✂️ Šema rezanja</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                  <div><label style={lbl}>Vrsta sečiva</label>
                    <select style={inp} value={forma.secivo} onChange={function (e) { var v = e.target.value; setForma(function (f) { return Object.assign({}, f, { secivo: v }); }); }}>
                      <option>Žilet</option><option>Nož</option>
                    </select>
                  </div>
                  <div><label style={lbl}>Br. traka</label><input type="number" style={inp} value={forma.rezBrTraka} onChange={function (e) { var v = e.target.value; setForma(function (f) { return Object.assign({}, f, { rezBrTraka: v }); }); }} /></div>
                  <div><label style={lbl}>Dužina fin. rolne (m)</label><input type="number" style={inp} value={forma.duzinaRolne} onChange={function (e) { var v = e.target.value; setForma(function (f) { return Object.assign({}, f, { duzinaRolne: v }); }); }} /></div>
                </div>
                <RezFormatEditor formati={forma.rezFormati} setFormati={function (v) { setForma(function (f) { return Object.assign({}, f, { rezFormati: v }); }); }} inp={inp} lbl={lbl} idealSir={p.ik || p.sir} />
              </div>
            )}

            <div style={card}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>📝 Napomena</div>
              <textarea style={Object.assign({}, inp, { height: 60, resize: "vertical" })} value={forma.nap} onChange={function (e) { var v = e.target.value; setForma(function (f) { return Object.assign({}, f, { nap: v }); }); }} placeholder="Opšta napomena za sve naloge..." />
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
              <button onClick={kreirajNaloge} disabled={saving} style={{ flex: 1, padding: "12px 24px", borderRadius: 8, border: "none", background: "#059669", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "⏳ Kreiranje..." : "⚡ Kreiraj " + Object.values(forma.nalozi).filter(Boolean).length + " naloga"}
              </button>
              <button onClick={function () { setIzabran(null); setForma(null); }} style={{ padding: "12px 18px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Otkaži
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Lista proizvoda
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>⚡ Kreiraj nalog iz baze</h2>
        <div style={{ fontSize: 13, color: "#64748b" }}>{filtrirani.length} proizvoda</div>
      </div>

      <div style={Object.assign({}, card, { marginBottom: 14, padding: "12px 16px" })}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input style={Object.assign({}, inp, { flex: 1, minWidth: 180 })} placeholder="🔍 Pretraži naziv ili kupca..." value={pretraga} onChange={function (e) { setPretraga(e.target.value); }} />
          <select style={Object.assign({}, inp, { width: 180 })} value={filterKupac} onChange={function (e) { setFilterKupac(e.target.value); }}>
            <option value="">👤 Svi kupci</option>
            {kupci.map(function (k) { return <option key={k} value={k}>{k}</option>; })}
          </select>
          <select style={Object.assign({}, inp, { width: 140 })} value={filterTip} onChange={function (e) { setFilterTip(e.target.value); }}>
            <option value="">🏷️ Svi tipovi</option>
            <option value="folija">🧮 Folija</option>
            <option value="kesa">🛍️ Kesa</option>
            <option value="spulna">🔄 Špulna</option>
          </select>
        </div>
      </div>

      {filtrirani.length === 0 ? (
        <div style={Object.assign({}, card, { textAlign: "center", padding: 50, color: "#94a3b8" })}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📦</div>
          <div>Nema proizvoda u bazi.</div>
          <button onClick={function () { setPage("kalk_folija"); }} style={{ marginTop: 12, padding: "10px 20px", borderRadius: 8, border: "none", background: "#1d4ed8", color: "#fff", fontWeight: 700, cursor: "pointer" }}>+ Dodaj u kalkulator</button>
        </div>
      ) : (
        Object.keys(poKupcu).sort().map(function (kupac) {
          return (
            <div key={kupac} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "#0f172a", borderRadius: "10px 10px 0 0", color: "#fff" }}>
                <span style={{ fontSize: 16 }}>👤</span>
                <span style={{ fontWeight: 800, fontSize: 14 }}>{kupac}</span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{poKupcu[kupac].length} proizvoda</span>
              </div>
              <div style={{ background: "#fff", borderRadius: "0 0 10px 10px", border: "0.5px solid #e2e8f0", borderTop: "none" }}>
                {poKupcu[kupac].map(function (p, i) {
                  var tipBoja = TIP_BOJA[p.tip] || "#64748b";
                  var mats = p.mats || [];
                  return (
                    <div key={p.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 16px", borderBottom: i < poKupcu[kupac].length - 1 ? "0.5px solid #f1f5f9" : "none" }}>
                      <span style={{ background: tipBoja + "20", color: tipBoja, borderRadius: 6, padding: "3px 10px", fontWeight: 700, fontSize: 10, flexShrink: 0 }}>
                        {TIPOVI[p.tip] || p.tip}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 3 }}>{p.naziv}</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {p.sir && <span style={{ fontSize: 11, color: "#1d4ed8", background: "#eff6ff", borderRadius: 4, padding: "1px 6px" }}>Š: {p.sir}mm</span>}
                          {p.ik && p.ik !== p.sir && <span style={{ fontSize: 11, color: "#059669", background: "#f0fdf4", borderRadius: 4, padding: "1px 6px" }}>Idealna: {p.ik}mm</span>}
                          {mats.slice(0, 3).map(function (m, mi) {
                            return <span key={mi} style={{ fontSize: 11, color: "#5b21b6", background: "#f5f3ff", borderRadius: 4, padding: "1px 6px" }}>{m.tip} {m.deb}mic</span>;
                          })}
                          {p.nal && <span style={{ fontSize: 11, color: "#0891b2", background: "#f0f9ff", borderRadius: 4, padding: "1px 6px" }}>{p.nal}</span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={function () { izaberiProizvod(p); }} style={{ padding: "8px 16px", borderRadius: 7, border: "none", background: "#059669", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                          ⚡ Kreiraj nalog
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// Prikaz dostupnih rolni iz magacina
function RolnePreview({ idealSir, mats }) {
  var [rolne, setRolne] = useState([]);

  useEffect(function () {
    if (!idealSir) return;
    supabase.from("magacin").select("br_rolne,tip,sirina,metraza_ost,metraza,palet,status")
      .gte("sirina", idealSir)
      .lte("sirina", +idealSir + 25)
      .neq("status", "Iskorišćeno")
      .order("sirina")
      .limit(8)
      .then(function (r) { setRolne(r.data || []); });
  }, [idealSir]);

  if (!idealSir) return <div style={{ fontSize: 11, color: "#94a3b8" }}>Nema podataka o idealnoj širini.</div>;

  return (
    <div>
      {rolne.length === 0 ? (
        <div style={{ fontSize: 11, padding: "6px 10px", background: "#fef2f2", color: "#991b1b", borderRadius: 5, border: "0.5px solid #fecaca" }}>
          ⚠️ Nema rolni {idealSir}–{+idealSir + 25}mm u magacinu!
        </div>
      ) : rolne.map(function (r) {
        return (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", background: "#f0fdf4", borderRadius: 5, border: "0.5px solid #bbf7d0", marginBottom: 3 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#166534" }}>{r.br_rolne}</span>
            <span style={{ fontSize: 10, color: "#64748b" }}>{r.tip} · {r.sirina}mm · {(r.metraza_ost || r.metraza || 0).toLocaleString()}m</span>
            <span style={{ fontSize: 10, color: "#94a3b8", marginLeft: "auto" }}>{r.palet || "—"}</span>
          </div>
        );
      })}
      {rolne.length > 0 && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>Pronađeno {rolne.length} rolni u opsegu {idealSir}–{+idealSir + 25}mm</div>}
    </div>
  );
}

// Editor formata rezanja
function RezFormatEditor({ formati, setFormati, inp, lbl, idealSir }) {
  function dodajFormat() {
    setFormati([...formati, { sirina: "", metraza: "", brRolni: "", naziv: "", napomena: "", izlaz: "Magacin GP" }]);
  }
  function ukloniFormat(i) {
    setFormati(formati.filter(function (_, j) { return j !== i; }));
  }
  function updateFormat(i, key, val) {
    setFormati(formati.map(function (f, j) { return j === i ? Object.assign({}, f, { [key]: val }) : f; }));
  }

  var SLOVA = ["I", "II", "III", "IV", "V", "VI"];
  var ukupnoSir = formati.reduce(function (s, f) { return s + (+f.sirina || 0); }, 0);

  return (
    <div>
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>
        Idealna širina: <b>{idealSir}mm</b> &nbsp;·&nbsp; Upisano: <b style={{ color: ukupnoSir > idealSir ? "#ef4444" : "#059669" }}>{ukupnoSir}mm</b> &nbsp;·&nbsp; Otpad: <b>{Math.max(0, idealSir - ukupnoSir)}mm</b>
      </div>
      {formati.map(function (f, i) {
        return (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 80px 100px 80px 1fr 100px auto", gap: 6, alignItems: "end", marginBottom: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8", paddingBottom: 6 }}>Format {SLOVA[i]}</div>
            <div><label style={lbl}>Širina mm</label><input type="number" style={inp} value={f.sirina} onChange={function (e) { updateFormat(i, "sirina", e.target.value); }} /></div>
            <div><label style={lbl}>Metraža m</label><input type="number" style={inp} value={f.metraza} onChange={function (e) { updateFormat(i, "metraza", e.target.value); }} /></div>
            <div><label style={lbl}>Br. rolni</label><input type="number" style={inp} value={f.brRolni} onChange={function (e) { updateFormat(i, "brRolni", e.target.value); }} /></div>
            <div><label style={lbl}>Naziv/napomena</label><input style={inp} value={f.napomena} onChange={function (e) { updateFormat(i, "napomena", e.target.value); }} placeholder="npr. za NNTel" /></div>
            <div><label style={lbl}>Izlaz</label>
              <select style={inp} value={f.izlaz} onChange={function (e) { updateFormat(i, "izlaz", e.target.value); }}>
                <option>Magacin GP</option><option>Isporuka</option><option>Posebna paleta</option><option>Reciklaža</option>
              </select>
            </div>
            <button onClick={function () { ukloniFormat(i); }} style={{ padding: "6px 10px", borderRadius: 6, border: "0.5px solid #fecaca", background: "#fef2f2", color: "#ef4444", cursor: "pointer", fontSize: 12, marginBottom: 0, alignSelf: "end" }}>✕</button>
          </div>
        );
      })}
      <button onClick={dodajFormat} style={{ padding: "6px 14px", borderRadius: 6, border: "0.5px solid #bfdbfe", background: "#eff6ff", color: "#1d4ed8", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
        + Dodaj format rezanja
      </button>
    </div>
  );
}
