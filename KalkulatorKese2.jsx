import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

// ===== PODACI IZ EXCEL SHEETA "Podaci za izbor liste" =====
const OPCIJE = {
  duplofan: ["Nema","Obična","Permanentna","Permanentna bezbedna za hranu","Široka","NE"],
  pozDuplofan: ["Na klapni","NE"],
  ukosenaKlapna: ["DA","DA NA KRACOJ STRANI","NE"],
  perfOtkinuti: ["Fina perforacija","Gruba perforacija","NE"],
  stampa: ["Bez štampe","Termotransfer","Štampa vrućim pečatom crna boja","Štampa vrućim pečatom zelena boja","Štampa vrućim pečatom zlatna boja","Štampa vrućim pečatom srebrna boja","Flexo štampa","NE"],
  eurozumba: ["MALA(30x10x5)","SREDNJA(32x10x5)"," VELIKA(35x12x5)"," SPECIJALNA","NE"],
  anleger: [
    "135µm/20mm/BELI","135µm/25mm/BELI","135µm/30mm/BELI","135µm/35mm/BELI","135µm/40mm/BELI",
    "135µm/20mm/TRANSPARENTNI","135µm/25mm/TRANSPARENTNI","135µm/30mm/TRANSPARENTNI",
    "135µm/35mm/TRANSPARENTNI","135µm/40mm/TRANSPARENTNI",
    "150µm/20mm/BELI","150µm/25mm/BELI","150µm/30mm/BELI","150µm/35mm/BELI","150µm/40mm/BELI",
    "150µm/20mm/TRANSPARENTNI","150µm/25mm/TRANSPARENTNI","150µm/30mm/TRANSPARENTNI",
    "150µm/35mm/TRANSPARENTNI","150µm/40mm/TRANSPARENTNI",
    "140µm/30mm/PLAVI","NE"
  ],
  pakovati: [
    "U banderolu","Gore i dole karton sa banderolom","Gore i dole karton sa gumicom",
    "U keseice po 20 kom","U keseice po 25 kom","U keseice po 50 kom","U keseice po 75 kom","U keseice po 100 kom",
    "U kutiju ide 100 kom","U kutiju ide 200 kom","U kutiju ide 300 kom","U kutiju ide 400 kom",
    "U kutiju ide 500 kom","U kutiju ide 1000 kom","U kutiju ide 5000 kom",
    "U bunt ide 20 kom","U bunt ide 25 kom","U bunt ide 50 kom","U bunt ide 75 kom",
    "U bunt ide 100 kom","U bunt ide 125 kom","U bunt ide 200 kom","U bunt ide 250 kom",
    "Kako vam odgovara"
  ],
  tolerancija: ["+/- 10%","Mora tacna kolicina","Bez + tolerancije","Bez – tolerancije","±2mm","NE"],
  povrsinaStampe: ["Standardno","Standardno za znak reciklaze","Centrirano"],
  pozicijaStampe: ["Na klapni","Pozadi-centrirano","30 mm od desne ivice","Na sredini","NE"],
};

// Cene operacija (€ po kesi) - mogu se menjati
const DEFAULT_CENE = {
  duplofan: 1.5,
  eurozumba: 1.5,
  okruglaZumba: 1.5,
  varDno: 1.5,
  faltaDno: 1.5,
  otvorDno: 1.5,
  perfVrucim: 1.5,
  ukosenaKlapna: 1.5,
  perfOtkinuti: 1.5,
  poprecnaPerf: 1.5,
  poprecniVar: 1.5,
  stampa: 1.5,
  pakZaHranu: 1.5,
  anleger: 1.5,
  utor: 1.5,
};

export default function KalkulatorKese2({ user, msg, setPage, inp, card, lbl }) {
  const [kese, setKese] = useState([]);
  const [izabranaKesa, setIzabranaKesa] = useState(null);
  const [tab, setTab] = useState("lista");
  const [ktab, setKtab] = useState("unos");

  // Nova kesa - osnovni podaci
  const [naziv, setNaziv] = useState("");
  const [kupac, setKupac] = useState("");
  const [materijal, setMaterijal] = useState("");
  const [sirina, setSirina] = useState("");
  const [duzina, setDuzina] = useState("");
  const [klapna, setKlapna] = useState("");
  const [takta, setTakta] = useState(100);
  const [ban, setBan] = useState(1);
  const [napKese, setNapKese] = useState("");

  // Opcije sa checkboxovima
  const [opts, setOpts] = useState({
    duplofan: { checked: false, val: "Obična", pos: "Na klapni" },
    ukosenaKlapna: { checked: false, val: "DA" },
    perfOtkinuti: { checked: false, val: "Fina perforacija" },
    otvorDno: { checked: false },
    faltaDno: { checked: false },
    varDno: { checked: false },
    stampa: { checked: false, val: "Termotransfer", povrsina: "Standardno", pozicija: "Centrirano", motiv: "" },
    eurozumba: { checked: false, val: "MALA(30x10x5)", rastojanje: "" },
    utor: { checked: false },
    perfVrucim: { checked: false },
    okruglaZumba: { checked: false, velPoz: "" },
    poprecnaPerf: { checked: false },
    poprecniVar: { checked: false, val: "3mm" },
    pakZaHranu: { checked: false },
    anleger: { checked: false, val: "135µm/30mm/BELI" },
    pakovati: { checked: false, val: "U bunt ide 200 kom" },
    bezTolerancijeKol: { checked: false },
    tolerancija: { checked: false, val: "+/- 10%" },
  });

  // Kalkulacija
  const [kol, setKol] = useState(1000);
  const [cenaKg, setCenaKg] = useState("");
  const [sk, setSk] = useState(10);
  const [mar, setMar] = useState(40);
  const [ceneOp, setCeneOp] = useState({ ...DEFAULT_CENE });
  const [res, setRes] = useState(null);

  // Ponuda
  const [pkupac, setPkupac] = useState("");
  const [padr, setPadr] = useState("");
  const [pkon, setPkon] = useState("");
  const [pnap, setPnap] = useState("");
  const [pjez, setPjez] = useState("sr");
  const [aktivna, setAktivna] = useState(null);

  useEffect(function () {
    supabase.from('kese').select('*').order('created_at', { ascending: false })
      .then(function (r) { setKese(r.data || []); });
  }, []);

  // Kalkulacija
  useEffect(function () {
    if (!sirina || !duzina || !cenaKg || !kol) { setRes(null); return; }
    var sir = +sirina / 1000;
    var duz = ((+duzina) + (+klapna || 0)) * 2 / 1000;
    var povKese = sir * duz;
    var gramatura = 30;
    var kgKesa = povKese * gramatura / 1000;
    var cenaMatKesa = kgKesa * (+cenaKg);

    // Saberi cene svih čekiranih opcija (u €/1000 kom)
    var ceneOpKesa = 0;
    Object.keys(opts).forEach(function (k) {
      if (opts[k].checked && ceneOp[k]) {
        ceneOpKesa += ceneOp[k];
      }
    });
    // ceneOpKesa je u €/1000kom → delimo sa 1000 za po kesi
    var cenaOpPoKesi = ceneOpKesa / 1000;

    var cenaKesaOsn = cenaMatKesa + cenaOpPoKesi;
    var sas = cenaKesaOsn * (1 + (+sk / 100));
    var mf = 1 + (+mar / 100);
    var cenaKesaMar = sas * mf;
    var ukOsn = cenaKesaOsn * (+kol);
    var ukMar = cenaKesaMar * (+kol);
    var vremeIzrade = ((+kol) / (+takta || 100) / (+ban || 1)) / 60;

    setRes({ povKese, kgKesa, cenaMatKesa, cenaOpPoKesi, cenaKesaOsn, cenaKesaMar, ukOsn, ukMar, ukKg: kgKesa * (+kol), vremeIzrade, ceneOpKesa });
  }, [sirina, duzina, klapna, cenaKg, kol, sk, mar, opts, ceneOp, takta, ban]);

  function updOpt(key, field, val) {
    setOpts(function (prev) {
      var n = Object.assign({}, prev);
      n[key] = Object.assign({}, n[key]);
      n[key][field] = val;
      return n;
    });
  }

  async function sacuvajKesu() {
    if (!naziv.trim()) { msg("Unesite naziv kese!", "err"); return; }
    var p = {
      naziv, kupac, materijal, sirina: +sirina, duzina: +duzina, klapna: +klapna,
      takta: +takta, ban: +ban, napomena: napKese, opcije: opts,
      datum: new Date().toLocaleDateString("sr-RS"), ko: user.ime
    };
    try {
      const { data, error } = await supabase.from('kese').insert([p]).select();
      if (error) throw error;
      setKese(function (k) { return [data[0]].concat(k); });
      msg("Kesa sacuvana!"); setTab("lista");
    } catch (e) { msg("Greška: " + e.message, "err"); }
  }

  function ucitajKesu(k) {
    setIzabranaKesa(k);
    setMaterijal(k.materijal || "");
    setSirina(k.sirina || "");
    setDuzina(k.duzina || "");
    setKlapna(k.klapna || "");
    setTakta(k.takta || 100);
    setBan(k.ban || 1);
    if (k.opcije) setOpts(k.opcije);
    if (k.kupac) setPkupac(k.kupac);
    setCenaKg("");
    setTab("kalk");
  }

  async function kreirajPonudu() {
    if (!pkupac.trim()) { msg("Unesite kupca!", "err"); return; }
    if (!res) { msg("Najpre izvrši kalkulaciju!", "err"); return; }
    var naziv2 = izabranaKesa ? izabranaKesa.naziv : naziv;
    var p = {
      broj: "MP-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 9000) + 1000),
      datum: new Date().toLocaleDateString("sr-RS"),
      vaz: new Date(Date.now() + 30 * 24 * 3600000).toLocaleDateString("sr-RS"),
      kupac: pkupac, adr: padr, kon: pkon, naziv: naziv2,
      kol: +kol, c1: res.cenaKesaMar, uk: res.ukMar,
      mats: [], nap: pnap, jez: pjez, status: "Aktivna",
      ko: user.ime, res: Object.assign({}, res), tip: "kesa",
      kesaData: Object.assign({}, izabranaKesa || {}, { sirina, duzina, klapna, materijal, takta, ban, opcije: opts })
    };
    try {
      const { data, error } = await supabase.from('ponude').insert([p]).select();
      if (error) throw error;
      setAktivna(data[0]);
      msg("Ponuda kreirana!");
    } catch (e) { msg("Greška: " + e.message, "err"); }
  }

  const f2l = function (v) { return (!v || isNaN(v)) ? "—" : (+v).toFixed(2).replace(".", ","); };
  const eu = function (v) { return f2l(v) + " €"; };

  // Komponenta za jedan checkbox sa opcijama
  function OptRow({ optKey, label, children }) {
    return (
      <div style={{
        background: opts[optKey].checked ? "#f0fdf4" : "#f8fafc",
        border: "1.5px solid " + (opts[optKey].checked ? "#bbf7d0" : "#e2e8f0"),
        borderRadius: 10, padding: "10px 14px", marginBottom: 6
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="checkbox" checked={opts[optKey].checked}
            onChange={function (e) { updOpt(optKey, "checked", e.target.checked); }}
            style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#059669" }} />
          <span style={{ fontWeight: 700, fontSize: 13, color: opts[optKey].checked ? "#059669" : "#64748b" }}>{label}</span>
          {opts[optKey].checked && ceneOp[optKey] && (
            <span style={{ marginLeft: "auto", fontSize: 11, color: "#059669", fontWeight: 700 }}>+{ceneOp[optKey].toFixed(2)} €/1000kom</span>
          )}
        </div>
        {opts[optKey].checked && children && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #d1fae5" }}>
            {children}
          </div>
        )}
      </div>
    );
  }

  // Select helper
  function Sel({ optKey, field, opcije, lbl: label }) {
    return (
      <div>
        {label && <label style={{ fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 3 }}>{label}</label>}
        <select style={inp} value={opts[optKey][field]} onChange={function (e) { updOpt(optKey, field, e.target.value); }}>
          {opcije.map(function (o) { return <option key={o} value={o}>{o}</option>; })}
        </select>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>🛍️ Kalkulator kese</h2>
        <div style={{ display: "flex", gap: 6 }}>
          {[["lista", "📋 Lista kesa"], ["nova", "➕ Nova kesa"], ["kalk", "🧮 Kalkulacija"], ["pon", "📄 Ponuda"], ["param", "⚙️ Cene"]].map(function (t) {
            return <button key={t[0]} onClick={function () { setTab(t[0]); }} style={{ padding: "7px 14px", borderRadius: 7, border: tab === t[0] ? "none" : "1px solid #e2e8f0", cursor: "pointer", fontSize: 12, fontWeight: 700, background: tab === t[0] ? "#059669" : "#fff", color: tab === t[0] ? "#fff" : "#64748b" }}>{t[1]}</button>;
          })}
        </div>
      </div>

      {/* ===== LISTA KESA ===== */}
      {tab === "lista" && (
        <div>
          {kese.length === 0 ? (
            <div style={Object.assign({}, card, { textAlign: "center", padding: 50, color: "#94a3b8" })}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🛍️</div>
              <div style={{ marginBottom: 12 }}>Nema kesa u bazi.</div>
              <button style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#059669", color: "#fff", fontWeight: 700, cursor: "pointer" }} onClick={function () { setTab("nova"); }}>+ Dodaj prvu kesu</button>
            </div>
          ) : (
            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Baza kesa ({kese.length})</div>
                <button style={{ padding: "7px 16px", borderRadius: 7, border: "none", background: "#059669", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }} onClick={function () { setTab("nova"); }}>+ Nova kesa</button>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                  {["Naziv", "Kupac", "Materijal", "Dim. (ŠxDxK)", "Opcije", ""].map(function (h) {
                    return <th key={h} style={{ padding: "9px 8px", textAlign: "left", color: "#64748b", fontWeight: 600 }}>{h}</th>;
                  })}
                </tr></thead>
                <tbody>
                  {kese.map(function (k) {
                    var opcijeArr = k.opcije ? Object.keys(k.opcije).filter(function (x) { return k.opcije[x].checked; }) : [];
                    return (
                      <tr key={k.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "9px 8px", fontWeight: 700 }}>{k.naziv}</td>
                        <td style={{ padding: "9px 8px", color: "#64748b" }}>{k.kupac || "—"}</td>
                        <td style={{ padding: "9px 8px" }}>{k.materijal || "—"}</td>
                        <td style={{ padding: "9px 8px", fontFamily: "monospace", fontSize: 12 }}>{k.sirina}×{k.duzina}{k.klapna ? "+" + k.klapna : ""}</td>
                        <td style={{ padding: "9px 8px" }}>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {opcijeArr.slice(0, 4).map(function (o) {
                              return <span key={o} style={{ fontSize: 9, background: "#dcfce7", color: "#166534", borderRadius: 4, padding: "1px 5px", fontWeight: 700 }}>{o}</span>;
                            })}
                            {opcijeArr.length > 4 && <span style={{ fontSize: 9, color: "#94a3b8" }}>+{opcijeArr.length - 4}</span>}
                          </div>
                        </td>
                        <td style={{ padding: "9px 8px" }}>
                          <button style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: "#059669", color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 700 }} onClick={function () { ucitajKesu(k); }}>Kalkuliši</button>
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

      {/* ===== NOVA KESA ===== */}
      {tab === "nova" && (
        <div>
          <div style={card}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "#059669" }}>➕ Nova kesa — Osnovni podaci</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div><label style={lbl}>Naziv kese *</label><input style={inp} value={naziv} onChange={function (e) { setNaziv(e.target.value); }} placeholder="npr. Kesa sa klapnom 94x214+32" /></div>
              <div><label style={lbl}>Kupac</label><input style={inp} value={kupac} onChange={function (e) { setKupac(e.target.value); }} /></div>
              <div><label style={lbl}>Materijal</label><input style={inp} value={materijal} onChange={function (e) { setMaterijal(e.target.value); }} placeholder="npr. OPP30" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <div><label style={lbl}>Širina mm</label><input type="number" style={inp} value={sirina} onChange={function (e) { setSirina(e.target.value); }} /></div>
                <div><label style={lbl}>Dužina mm</label><input type="number" style={inp} value={duzina} onChange={function (e) { setDuzina(e.target.value); }} /></div>
                <div><label style={lbl}>Klapna mm</label><input type="number" style={inp} value={klapna} onChange={function (e) { setKlapna(e.target.value); }} /></div>
              </div>
              <div><label style={lbl}>Takta / min</label><input type="number" style={inp} value={takta} onChange={function (e) { setTakta(e.target.value); }} /></div>
              <div><label style={lbl}>Ban</label><input type="number" style={inp} value={ban} onChange={function (e) { setBan(e.target.value); }} /></div>
            </div>
          </div>

          {/* OPCIJE SA CHECKBOXOVIMA */}
          <div style={card}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "#059669" }}>✅ Opcije kese</div>

            <OptRow optKey="duplofan" label="Duplofan traka">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Sel optKey="duplofan" field="val" opcije={OPCIJE.duplofan} lbl="Tip duplofan trake" />
                <Sel optKey="duplofan" field="pos" opcije={OPCIJE.pozDuplofan} lbl="Pozicija" />
              </div>
            </OptRow>

            <OptRow optKey="ukosenaKlapna" label="Ukošena klapna">
              <Sel optKey="ukosenaKlapna" field="val" opcije={OPCIJE.ukosenaKlapna} lbl="Tip" />
            </OptRow>

            <OptRow optKey="perfOtkinuti" label="Perforirana za otkinuti na rolni">
              <Sel optKey="perfOtkinuti" field="val" opcije={OPCIJE.perfOtkinuti} lbl="Tip perforacije" />
            </OptRow>

            <OptRow optKey="otvorDno" label="Otvor na dnu kese" />

            <OptRow optKey="faltaDno" label="Falta na dnu" />

            <OptRow optKey="varDno" label="Var na dnu" />

            <OptRow optKey="stampa" label="Štampa">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Sel optKey="stampa" field="val" opcije={OPCIJE.stampa} lbl="Tip štampe" />
                <Sel optKey="stampa" field="povrsina" opcije={OPCIJE.povrsinaStampe} lbl="Površina štampe" />
                <Sel optKey="stampa" field="pozicija" opcije={OPCIJE.pozicijaStampe} lbl="Pozicija štampe" />
                <div>
                  <label style={{ fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 3 }}>Motiv štampe</label>
                  <input style={inp} value={opts.stampa.motiv || ""} onChange={function (e) { updOpt("stampa", "motiv", e.target.value); }} placeholder="Opis motiva..." />
                </div>
              </div>
            </OptRow>

            <OptRow optKey="eurozumba" label="Eurozumba">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Sel optKey="eurozumba" field="val" opcije={OPCIJE.eurozumba} lbl="Veličina" />
                <div>
                  <label style={{ fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 3 }}>Rastojanje od dna (mm)</label>
                  <input type="number" style={inp} value={opts.eurozumba.rastojanje || ""} onChange={function (e) { updOpt("eurozumba", "rastojanje", e.target.value); }} placeholder="npr. 9" />
                </div>
              </div>
            </OptRow>

            <OptRow optKey="utor" label="Utor" />

            <OptRow optKey="perfVrucim" label="Perforacija vrućim iglama" />

            <OptRow optKey="okruglaZumba" label="Okrugla zumba">
              <div>
                <label style={{ fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 3 }}>Veličina i pozicija</label>
                <input style={inp} value={opts.okruglaZumba.velPoz || ""} onChange={function (e) { updOpt("okruglaZumba", "velPoz", e.target.value); }} placeholder="npr. dm=6mm NA SREDINI/CENTRIRANO" />
              </div>
            </OptRow>

            <OptRow optKey="poprecnaPerf" label="Poprečna perforacija" />

            <OptRow optKey="poprecniVar" label="Poprečni var">
              <div>
                <label style={{ fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 3 }}>Debljina vara</label>
                <input style={inp} value={opts.poprecniVar.val || ""} onChange={function (e) { updOpt("poprecniVar", "val", e.target.value); }} placeholder="npr. 3mm" />
              </div>
            </OptRow>

            <OptRow optKey="pakZaHranu" label="Pakovanje za hranu (upotreba rukavica, mrežica za kosu...)" />

            <OptRow optKey="anleger" label="Anleger">
              <Sel optKey="anleger" field="val" opcije={OPCIJE.anleger} lbl="Tip anlegera" />
            </OptRow>

            <OptRow optKey="pakovati" label="Pakovanje">
              <Sel optKey="pakovati" field="val" opcije={OPCIJE.pakovati} lbl="Način pakovanja" />
            </OptRow>

            <OptRow optKey="tolerancija" label="Tolerancija u količini">
              <Sel optKey="tolerancija" field="val" opcije={OPCIJE.tolerancija} lbl="Tolerancija" />
            </OptRow>

            <OptRow optKey="bezTolerancijeKol" label="Bez tolerancije u količini (mora tačna količina)" />
          </div>

          <div style={card}>
            <label style={lbl}>Napomena</label>
            <textarea style={Object.assign({}, inp, { height: 60, resize: "vertical" })} value={napKese} onChange={function (e) { setNapKese(e.target.value); }} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#059669", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }} onClick={sacuvajKesu}>💾 Sacuvaj kesu</button>
            <button style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer" }} onClick={function () { setTab("lista"); }}>Otkaži</button>
          </div>
        </div>
      )}

      {/* ===== KALKULACIJA ===== */}
      {tab === "kalk" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            {/* Dimenzije i materijal */}
            <div style={Object.assign({}, card, { marginBottom: 14 })}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📐 Dimenzije</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div><label style={lbl}>Širina mm</label><input type="number" style={inp} value={sirina} onChange={function (e) { setSirina(e.target.value); }} /></div>
                <div><label style={lbl}>Dužina mm</label><input type="number" style={inp} value={duzina} onChange={function (e) { setDuzina(e.target.value); }} /></div>
                <div><label style={lbl}>Klapna mm</label><input type="number" style={inp} value={klapna} onChange={function (e) { setKlapna(e.target.value); }} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={lbl}>Materijal</label><input style={inp} value={materijal} onChange={function (e) { setMaterijal(e.target.value); }} /></div>
                <div><label style={lbl}>Cena mat. EUR/kg</label><input type="number" style={inp} value={cenaKg} step={0.1} onChange={function (e) { setCenaKg(e.target.value); }} /></div>
                <div><label style={lbl}>Količina (kom)</label><input type="number" style={inp} value={kol} onChange={function (e) { setKol(e.target.value); }} /></div>
                <div><label style={lbl}>Škart %</label><input type="number" style={inp} value={sk} onChange={function (e) { setSk(e.target.value); }} /></div>
                <div><label style={lbl}>Marža %</label><input type="number" style={inp} value={mar} step={1} onChange={function (e) { setMar(e.target.value); }} /></div>
              </div>
            </div>

            {/* Aktivne opcije */}
            <div style={card}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>✅ Aktivne opcije u kalkulaciji</div>
              {Object.keys(opts).filter(function (k) { return opts[k].checked; }).length === 0 ? (
                <div style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: 20 }}>Nema čekiranih opcija</div>
              ) : (
                Object.keys(opts).filter(function (k) { return opts[k].checked; }).map(function (k) {
                  var labMap = {
                    duplofan: "Duplofan traka", ukosenaKlapna: "Ukošena klapna", perfOtkinuti: "Perf. za otkinuti",
                    otvorDno: "Otvor na dnu", faltaDno: "Falta na dnu", varDno: "Var na dnu",
                    stampa: "Štampa", eurozumba: "Eurozumba", utor: "Utor", perfVrucim: "Perf. vrućim iglama",
                    okruglaZumba: "Okrugla zumba", poprecnaPerf: "Poprečna perforacija", poprecniVar: "Poprečni var",
                    pakZaHranu: "Pakovanje za hranu", anleger: "Anleger", pakovati: "Pakovanje", tolerancija: "Tolerancija", bezTolerancijeKol: "Bez tolerancije kol."
                  };
                  return (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "#f0fdf4", borderRadius: 7, border: "1px solid #bbf7d0", marginBottom: 5, fontSize: 12 }}>
                      <span style={{ fontWeight: 600, color: "#166534" }}>✓ {labMap[k] || k}</span>
                      <span style={{ color: "#059669", fontWeight: 700 }}>{ceneOp[k] ? "+" + ceneOp[k].toFixed(2) + " €/1000kom" : "—"}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Rezultati */}
          <div>
            {res ? (
              <div style={card}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>📊 Rezultati kalkulacije</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {[
                    ["Površina kese", f2l(res.povKese * 10000) + " cm²", "#64748b"],
                    ["Težina kese", f2l(res.kgKesa * 1000) + " g", "#64748b"],
                    ["Cena materijala / kesa", eu(res.cenaMatKesa), "#64748b"],
                    ["Cena operacija / kesa", eu(res.cenaOpPoKesi), "#f59e0b"],
                    ["Osnovna cena / kesa", eu(res.cenaKesaOsn), "#64748b"],
                    ["Cena sa maržom / kesa", eu(res.cenaKesaMar), "#059669"],
                    ["Ukupno kg materijala", f2l(res.ukKg) + " kg", "#64748b"],
                    ["Vreme izrade", f2l(res.vremeIzrade) + " h", "#f59e0b"],
                    ["Osnovna cena naloga", eu(res.ukOsn), "#64748b"],
                    ["Cena sa maržom nalog", eu(res.ukMar), "#059669"],
                  ].map(function (x) {
                    return (
                      <div key={x[0]} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 12px", background: x[2] === "#059669" ? "#f0fdf4" : x[2] === "#f59e0b" ? "#fffbeb" : "#f8fafc", borderRadius: 8, border: "1px solid " + (x[2] === "#059669" ? "#bbf7d0" : x[2] === "#f59e0b" ? "#fde68a" : "#e2e8f0") }}>
                        <span style={{ fontSize: 12, color: "#64748b" }}>{x[0]}</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: x[2] }}>{x[1]}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Struktura cene */}
                {res.ceneOpKesa > 0 && (
                  <div style={{ marginTop: 14, padding: 12, background: "#fffbeb", borderRadius: 8, border: "1px solid #fde68a" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", marginBottom: 6 }}>Doprinos operacija u ceni</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Materijal: {f2l(res.cenaMatKesa * 1000)} €/1000kom · Operacije: {f2l(res.cenaOpPoKesi * 1000)} €/1000kom</div>
                  </div>
                )}

                <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
                  <button style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "#059669", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }} onClick={function () { setPkupac(izabranaKesa && izabranaKesa.kupac ? izabranaKesa.kupac : ""); setTab("pon"); }}>📄 Kreiraj ponudu</button>
                </div>
              </div>
            ) : (
              <div style={Object.assign({}, card, { textAlign: "center", padding: 40, color: "#94a3b8" })}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🧮</div>
                <div>Unesite dimenzije i cenu materijala</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== PONUDA ===== */}
      {tab === "pon" && (
        <div>
          <div style={Object.assign({}, card, { marginBottom: 14 })}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📄 Podaci za ponudu</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div><label style={lbl}>Kupac *</label><input style={inp} value={pkupac} onChange={function (e) { setPkupac(e.target.value); }} /></div>
              <div><label style={lbl}>Adresa</label><input style={inp} value={padr} onChange={function (e) { setPadr(e.target.value); }} /></div>
              <div><label style={lbl}>Kontakt</label><input style={inp} value={pkon} onChange={function (e) { setPkon(e.target.value); }} /></div>
              <div><label style={lbl}>Jezik</label>
                <select style={inp} value={pjez} onChange={function (e) { setPjez(e.target.value); }}>
                  <option value="sr">🇷🇸 Srpski</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="de">🇩🇪 Deutsch</option>
                </select>
              </div>
            </div>
            <div><label style={lbl}>Napomena</label><textarea style={Object.assign({}, inp, { height: 60, resize: "vertical" })} value={pnap} onChange={function (e) { setPnap(e.target.value); }} /></div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#059669", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }} onClick={kreirajPonudu}>📄 Kreiraj ponudu</button>
            {aktivna && <div style={{ padding: "10px 14px", borderRadius: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontSize: 12, fontWeight: 700 }}>✅ Ponuda {aktivna.broj} kreirana</div>}
          </div>
        </div>
      )}

      {/* ===== CENE OPERACIJA ===== */}
      {tab === "param" && (
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>⚙️ Cene operacija (€ / 1000 kom)</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {[
              ["duplofan", "Duplofan traka"],
              ["eurozumba", "Eurozumba"],
              ["okruglaZumba", "Okrugla zumba"],
              ["varDno", "Var na dnu"],
              ["faltaDno", "Falta na dnu"],
              ["otvorDno", "Otvor na dnu"],
              ["perfVrucim", "Perforacija vrućim iglama"],
              ["ukosenaKlapna", "Ukošena klapna"],
              ["perfOtkinuti", "Perf. za otkinuti"],
              ["poprecnaPerf", "Poprečna perforacija"],
              ["poprecniVar", "Poprečni var"],
              ["stampa", "Štampa"],
              ["pakZaHranu", "Pakovanje za hranu"],
              ["anleger", "Anleger"],
              ["utor", "Utor"],
            ].map(function (x) {
              return (
                <div key={x[0]}>
                  <label style={lbl}>{x[1]} (€/1000kom)</label>
                  <input type="number" step={0.1} style={inp} value={ceneOp[x[0]]} onChange={function (e) { setCeneOp(function (c) { return Object.assign({}, c, { [x[0]]: +e.target.value }); }); }} />
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14, padding: 12, background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe", fontSize: 12, color: "#1e40af" }}>
            ℹ️ Default cena je 1.50 €/1000 kom za svaku operaciju. Možete menjati po potrebi.
          </div>
        </div>
      )}
    </div>
  );
}
