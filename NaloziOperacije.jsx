import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./supabase.js";

const fmt = (v, suf = "") => (v === undefined || v === null || v === "" ? "—" : `${v}${suf}`);
const num = (v, d = 2) => {
  if (v === undefined || v === null || v === "" || isNaN(Number(v))) return "—";
  return Number(v).toLocaleString("sr-RS", { minimumFractionDigits: d, maximumFractionDigits: d });
};
const int = (v) => {
  if (v === undefined || v === null || v === "" || isNaN(Number(v))) return "—";
  return Number(v).toLocaleString("sr-RS", { maximumFractionDigits: 0 });
};

function norm(nalog) {
  const p = nalog?.parametri || {};
  const osnovno = p.osnovno || {};
  const materijali = Array.isArray(p.materijali)
    ? p.materijali
    : [1, 2, 3, 4]
        .map((i) => ({
          sloj: `Sloj ${i}`,
          materijal: p[`materijal_${i}`],
          debljina: p[`debljina_${i}`],
          sirina: p[`sirina_${i}`] || p.sirina_materijala || p.sirina_trake || p.sirina,
          kg: p[`potreba_kg_${i}`],
          m: p[`potreba_m_${i}`],
        }))
        .filter((m) => m.materijal);

  return {
    broj: nalog?.broj_naloga || nalog?.ponBr || p.broj_naloga || "—",
    status: nalog?.status || p.status || "u_pripremi",
    kupac: osnovno.kupac || p.kupac || nalog?.kupac || "—",
    proizvod: osnovno.naziv || p.naziv || nalog?.naziv || nalog?.prod || "—",
    datum: osnovno.datum_porudzbine || p.datum_porudzbine || nalog?.datum || "—",
    isporuka: osnovno.datum_isporuke || p.datum_isporuke || "—",
    porudzbina: osnovno.broj_porudzbine || p.broj_porudzbine || nalog?.ponBr || "—",
    sirina: osnovno.sirina || p.sirina || p.sirina_trake || p.sirina_trake_rez || "—",
    duzina: osnovno.duzina || p.duzina || "—",
    materijali,
    stampa: p.stampa || {
      masina: p.stampa_masina,
      strana: p.strana_stampe,
      obim: p.obim_valjka,
      boje: p.broj_boja,
      klise: p.klise,
      hilzna: p.precnik_hilzne,
      smer: p.smer_odmotavanja,
      grafika: p.graficko_resenje,
    },
    kasiranje: p.kasiranje || {
      tip_lepka: p.tip_lepka,
      odnos: p.odnos_lepka,
      nanos: p.nanos_lepka,
      sirina_nanosa: p.sirina_nanosa || p.sirina_materijala,
      temperatura_susnice: p.temperatura_susnice || 60,
      brzina: p.brzina_kasiranja || 80,
      pritisak: p.pritisak_valjaka || 4,
      temp_valjaka: p.temperatura_valjaka || 45,
      maturacija: p.vreme_maturacije || 48,
    },
    rezanje: p.rezanje || {
      sirina_maticne: p.sirina_materijala,
      broj_traka: p.broj_traka,
      sirina_trake: p.sirina_trake_rez || p.sirina_trake || p.sirina,
      precnik_rolne: p.precnik_rolne,
      duzina_rolne: p.duzina_rolne,
      tolerancija: p.tolerancija || "±2",
      kolicina: p.potreba_m_1 || p.kolicina_za_rezanje,
      hilzna: p.precnik_hilzne || 76,
      korona: p.korona || "NE",
      lokacija: p.lokacija_rolni || "—",
    },
    perforacija: p.perforacija || {
      tip: p.tip_perforacije || "Poprečna",
      oblik: p.oblik_perforacije || "Standardna linija",
      orijentacija: p.orijentacija_perforacije || "Poprečna",
      pozicija: p.pozicija_perforacije || "Između jedinica",
      razmak: p.razmak_perforacije || p.duzina,
      duzina_reza: p.duzina_reza || 3,
      razmak_reza: p.razmak_reza || 1,
      brzina: p.brzina_perforacije,
    },
    rolna: p.rolna || {
      broj_etiketa_u_metru: p.broj_etiketa_u_metru || (p.duzina ? (1000 / Number(p.duzina)).toFixed(2) : "—"),
      smer_gp: p.smer_odmotavanja_gp || "Na noge",
      hilzna: p.precnik_hilzne || 76,
      precnik: p.precnik_rolne || 400,
      metraza: p.duzina_rolne || "Prema potrebi",
      pakovanje: p.pakovanje_rolni || "Svaka pojedinačno",
      paleta: p.paleta || "Euro paleta",
    },
    kolicine: p.kolicine || {
      poruceno: p.porucena_kolicina,
      za_rad: p.kolicina_za_rad,
    },
  };
}

const cfg = {
  materijal: { title: "NALOG ZA POTREBU MATERIJALA", sub: "Rezervacija materijala za proizvodnju", color: "#059669", bg: "#f0fdf4", icon: "📦" },
  stampa: { title: "NALOG ZA ŠTAMPU", sub: "Parametri štampe i grafičke pripreme", color: "#2563eb", bg: "#eff6ff", icon: "🖨️" },
  kasiranje: { title: "NALOG ZA KAŠIRANJE (LAMINACIJU)", sub: "Multi-layer struktura", color: "#f59e0b", bg: "#fffbeb", icon: "🔗" },
  rezanje: { title: "NALOG ZA REZANJE (SEČENJE)", sub: "Interno rezanje za finalne formate", color: "#8b5cf6", bg: "#f5f3ff", icon: "✂️" },
  perforacija: { title: "NALOG ZA PERFORACIJU", sub: "Linija presecanja i odvajanja", color: "#0ea5e9", bg: "#f0f9ff", icon: "⭕" },
  rolna: { title: "IZGLED NA ROLNI - FINALNI PROIZVOD", sub: "Specifikacija namotavanja i izgleda", color: "#ec4899", bg: "#fdf2f8", icon: "🧻" },
};

function Header({ d, type }) {
  const c = cfg[type];
  return (
    <div style={{ background: "white", borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: 18 }}>
      <div style={{ background: `linear-gradient(135deg, ${c.color} 0%, ${c.color}cc 100%)`, color: "white", padding: "1.5rem 2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontSize: 24, fontWeight: 800 }}>{c.title}</div><div style={{ fontSize: 13, opacity: 0.9 }}>{c.sub}</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, opacity: 0.8 }}>Glavni nalog</div><div style={{ fontSize: 28, fontWeight: 800 }}>{d.broj}</div></div>
        </div>
      </div>
      <div style={{ padding: "1.4rem 2rem", background: c.bg, borderBottom: `2px solid ${c.color}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.2rem" }}>
          <Info label="Kupac" val={d.kupac} color={c.color} />
          <Info label="Proizvod" val={d.proizvod} />
          <Info label="Dimenzije" val={`${d.sirina} × ${d.duzina} mm`} />
          <Info label="Rok isporuke" val={d.isporuka} color={c.color} />
        </div>
      </div>
    </div>
  );
}
function Info({ label, val, color = "#111827" }) { return <div><div style={{ fontSize: 11, color: "#666", marginBottom: 4, fontWeight: 700, textTransform: "uppercase" }}>{label}</div><div style={{ fontSize: 15, fontWeight: 800, color }}>{fmt(val)}</div></div>; }
function Section({ type, title, children }) { const c = cfg[type]; return <div style={{ background: "white", borderRadius: 8, border: `2px solid ${c.color}`, marginBottom: 20, overflow: "hidden" }}><div style={{ background: c.bg, padding: "12px 1rem", fontWeight: 800, color: c.color, textTransform: "uppercase", letterSpacing: .4 }}>{title}</div><div style={{ padding: "1.5rem" }}>{children}</div></div>; }
function Table({ rows, color }) { return <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><tbody>{rows.map((r,i)=><tr key={i} style={{ borderBottom: "1px solid #eee" }}>{r.map((cell,j)=><td key={j} style={{ padding: "13px 1rem", background: j%2===0 ? "#fafafa" : "white", fontWeight: j%2===0 ? 700 : 600, color: j%2===1 && i===0 ? color : undefined }}>{cell}</td>)}</tr>)}</tbody></table>; }

function Materijal({ d }) {
  const totalKg = d.materijali.reduce((s,m)=>s+(Number(m.kg)||0),0);
  const totalM = d.materijali.reduce((s,m)=>s+(Number(m.m)||0),0);
  return <><Header d={d} type="materijal"/><Section type="materijal" title="Tabela materijala">
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr style={{background:cfg.materijal.bg,borderBottom:`3px solid ${cfg.materijal.color}`}}>{["RB","Naziv materijala","Širina (mm)","Količina kg","Količina m","Lokacija"].map(h=><th key={h} style={{padding:"14px 1rem",textAlign:h==="Naziv materijala"?"left":"center",color:cfg.materijal.color,fontSize:12,textTransform:"uppercase"}}>{h}</th>)}</tr></thead><tbody>{d.materijali.map((m,i)=><tr key={i} style={{borderBottom:"1px solid #eee",background:i%2?"#fef3c7":"#fffbeb"}}><td style={{padding:"16px 1rem",fontWeight:800,fontSize:18,color:"#b45309"}}>{i+1}</td><td style={{padding:"16px 1rem",fontWeight:800}}>{m.materijal}<div style={{fontSize:11,color:"#666",fontWeight:500}}>{m.sloj}</div></td><td style={{textAlign:"center",fontWeight:700}}>{fmt(m.sirina)}</td><td style={{textAlign:"center",fontWeight:900,fontSize:17,color:cfg.materijal.color}}>{num(m.kg)}</td><td style={{textAlign:"center",fontWeight:700}}>{int(m.m)}</td><td style={{textAlign:"center"}}>________</td></tr>)}<tr style={{background:cfg.materijal.bg}}><td colSpan="3" style={{padding:"16px",fontWeight:900,textAlign:"right",color:cfg.materijal.color}}>UKUPNO:</td><td style={{textAlign:"center",fontWeight:900,fontSize:19,color:cfg.materijal.color}}>{num(totalKg)} kg</td><td style={{textAlign:"center",fontWeight:900}}>{int(totalM)} m</td><td/></tr></tbody></table>
  </Section><Section type="materijal" title="Pomoćni materijali"><Table color={cfg.materijal.color} rows={[["Lepak", fmt(d.kasiranje.tip_lepka)],["Hilzne", fmt(d.rolna.hilzna," mm")],["Pakovanje", fmt(d.rolna.pakovanje)],["Paleta", fmt(d.rolna.paleta)]]}/></Section></>;
}

function Stampa({ d }) { return <><Header d={d} type="stampa"/><Section type="stampa" title="Parametri štampe"><Table color={cfg.stampa.color} rows={[["Štampa mašina",fmt(d.stampa.masina),"Strana štampe",fmt(d.stampa.strana)],["Obim valjka",fmt(d.stampa.obim," mm"),"Broj boja",fmt(d.stampa.boje)],["Kliše",fmt(d.stampa.klise),"Hilzna",fmt(d.stampa.hilzna," mm")],["Smer odmotavanja",fmt(d.stampa.smer),"Grafika",fmt(d.stampa.grafika)]]}/></Section><Section type="stampa" title="Kontrola štampe"><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>{["Uzorak odobren","Boje proverene","KPF/marker proveren","Namotaj proveren"].map(x=><div key={x} style={{background:cfg.stampa.bg,border:`1px solid ${cfg.stampa.color}55`,borderRadius:8,padding:16,fontWeight:800}}>□ {x}</div>)}</div></Section></>; }

function Kasiranje({ d }) {
  const debljina = d.materijali.reduce((s,m)=>s+(Number(m.debljina)||0),0);
  return <><Header d={d} type="kasiranje"/><Section type="kasiranje" title="Struktura multi-layer folije"><div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:20,flexWrap:"wrap"}}>{d.materijali.map((m,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:20}}><div style={{textAlign:"center",background:"linear-gradient(135deg,#fffbeb,#fef3c7)",border:"2px solid #b45309",borderRadius:8,padding:"1.5rem",minWidth:160}}><div style={{fontSize:11,color:"#92400e",fontWeight:800,textTransform:"uppercase"}}>SLOJ {i+1}</div><div style={{fontSize:18,fontWeight:900,color:"#b45309"}}>{m.materijal}</div><div style={{fontSize:13,color:"#666"}}>{fmt(m.debljina,"µ")}</div><div style={{fontSize:12,color:"#666"}}>{num(m.kg)} kg</div></div>{i<d.materijali.length-1&&<div style={{fontSize:30,color:cfg.kasiranje.color}}>→<div style={{fontSize:11,fontWeight:800}}>LEPAK</div></div>}</div>)}</div><div style={{marginTop:24,textAlign:"center",background:"white",padding:16,borderRadius:6,fontWeight:900,color:cfg.kasiranje.color}}>UKUPNA DEBLJINA: {debljina} µm</div></Section><Section type="kasiranje" title="Parametri lepka i procesa"><Table color={cfg.kasiranje.color} rows={[["Tip lepka",fmt(d.kasiranje.tip_lepka),"Odnos komponenti",fmt(d.kasiranje.odnos)],["Nanos lepka",fmt(d.kasiranje.nanos," g/m²"),"Širina nanosa",fmt(d.kasiranje.sirina_nanosa," mm")],["Temperatura sušnice",fmt(d.kasiranje.temperatura_susnice," °C"),"Brzina",fmt(d.kasiranje.brzina," m/min")],["Pritisak valjaka",fmt(d.kasiranje.pritisak," bar"),"Maturacija",fmt(d.kasiranje.maturacija," sati")]]}/></Section></>;
}

function Rezanje({ d }) {
  const n = Number(d.rezanje.broj_traka) || 0; const w = Number(d.rezanje.sirina_trake) || 85; const total = Number(d.rezanje.sirina_maticne) || (n*w+30); const waste = Math.max(0, total - n*w); const side = Math.round(waste/2);
  return <><Header d={d} type="rezanje"/><Section type="rezanje" title="Specifikacija rezanja"><Table color={cfg.rezanje.color} rows={[["Širina matične rolne",fmt(d.rezanje.sirina_maticne," mm"),"Broj traka",fmt(d.rezanje.broj_traka," traka")],["Širina jedne trake",fmt(d.rezanje.sirina_trake," mm"),"Tolerancija",fmt(d.rezanje.tolerancija," mm")],["Količina za rezanje",fmt(int(d.rezanje.kolicina)," m"),"Korona tretman",fmt(d.rezanje.korona)],["Lokacija rolni",fmt(d.rezanje.lokacija),"Prečnik rolne",fmt(d.rezanje.precnik_rolne," mm")]]}/></Section><Section type="rezanje" title="Šema slaganja traka na rolni"><div style={{background:"white",border:"1px solid #e5e7eb",padding:"2rem",borderRadius:6,textAlign:"center"}}><div style={{fontSize:12,fontWeight:800,color:"#666",marginBottom:16}}>MATIČNA ROLNA: {total} mm</div><div style={{display:"flex",justifyContent:"center",gap:2,overflowX:"auto"}}><div style={{width:Math.max(side,14),background:"#fee2e2",height:140,border:"1px solid #dc2626",writingMode:"vertical-rl",display:"flex",alignItems:"center",justifyContent:"center",color:"#dc2626",fontSize:9,fontWeight:800}}>OTPAD {side}mm</div>{Array.from({length:n}).map((_,i)=><div key={i} style={{width:w, minWidth:45, background:"linear-gradient(135deg,#ddd6fe,#8b5cf6)",height:140,border:"2px solid #8b5cf6",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",color:"white",fontWeight:800}}><div style={{writingMode:"vertical-rl",fontSize:11}}>TRAKA {i+1}</div><div>{w}mm</div></div>)}<div style={{width:Math.max(side,14),background:"#fee2e2",height:140,border:"1px solid #dc2626",writingMode:"vertical-rl",display:"flex",alignItems:"center",justifyContent:"center",color:"#dc2626",fontSize:9,fontWeight:800}}>OTPAD {side}mm</div></div><div style={{marginTop:18,color:"#666"}}>Raspored: <b style={{color:cfg.rezanje.color}}>otpad + {Array.from({length:n}).map(()=>w).join(" + ")} + otpad</b></div></div></Section></>;
}

function Perforacija({ d }) { return <><Header d={d} type="perforacija"/><Section type="perforacija" title="Parametri perforacije"><Table color={cfg.perforacija.color} rows={[["Oblik perforacije",fmt(d.perforacija.oblik),"Orijentacija",fmt(d.perforacija.orijentacija)],["Pozicija",fmt(d.perforacija.pozicija),"Razmak između linija",fmt(d.perforacija.razmak," mm")],["Dužina reza",fmt(d.perforacija.duzina_reza," mm"),"Razmak između rezova",fmt(d.perforacija.razmak_reza," mm")]]}/></Section><Section type="perforacija" title="Tehnički crtež perforacije"><div style={{background:"white",border:"1px solid #e5e7eb",padding:"2rem",borderRadius:6,textAlign:"center"}}><div style={{fontSize:12,color:"#666",fontWeight:800,marginBottom:20}}>POPREČNA PERFORACIJA - POGLED SA STRANE</div>{[1,2,3].map((x,i)=><div key={x} style={{display:"flex",flexDirection:"column",alignItems:"center"}}><div style={{width:500,maxWidth:"90%",height:90,background:"linear-gradient(135deg,#dbeafe,#e0f2fe)",border:`2px solid ${cfg.perforacija.color}`,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"#0284c7",position:"relative"}}>JEDINICA #{x}<span style={{position:"absolute",right:10,top:10,fontSize:11,color:"#666",background:"white",padding:"4px 8px",borderRadius:4}}>{d.sirina} × {d.duzina}mm</span></div>{i<2&&<div style={{width:500,maxWidth:"90%",height:8,background:"repeating-linear-gradient(to right,#dc2626 0px,#dc2626 3px,transparent 3px,transparent 5px)",margin:"2px 0"}}/>}</div>)}<div style={{marginTop:20,padding:16,background:cfg.perforacija.bg,borderRadius:6,fontWeight:800,color:cfg.perforacija.color}}>Detalj: {d.perforacija.duzina_reza}mm rez / {d.perforacija.razmak_reza}mm razmak</div></div></Section></>; }

function Rolna({ d }) { return <><Header d={d} type="rolna"/><Section type="rolna" title="Vizuelni prikaz rolne"><div style={{background:"white",border:"1px solid #e5e7eb",padding:"2rem",borderRadius:6}}><div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:"3rem",flexWrap:"wrap"}}><div style={{position:"relative",width:210,height:380,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{position:"absolute",width:200,height:360,background:"linear-gradient(to right,#fce7f3,#ec4899)",borderRadius:100,opacity:.75,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"#831843",writingMode:"vertical-rl"}}>FOLIJA Ø {d.rolna.precnik}mm</div><div style={{position:"absolute",width:90,height:260,background:"linear-gradient(to right,#d1d5db,#9ca3af)",borderRadius:50,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:900,writingMode:"vertical-rl"}}>HILZNA Ø {d.rolna.hilzna}mm</div></div><div style={{background:cfg.rolna.bg,borderLeft:`4px solid ${cfg.rolna.color}`,padding:"1rem",borderRadius:6}}><Info label="Broj etiketa u metru" val={d.rolna.broj_etiketa_u_metru} color={cfg.rolna.color}/><br/><Info label="Smer odmotavanja" val={`${d.rolna.smer_gp} ↓`} /><br/><Info label="Prečnik finalne rolne" val={`${d.rolna.precnik} mm`} color={cfg.rolna.color}/></div></div><div style={{borderTop:"2px dashed #e5e7eb",marginTop:30,paddingTop:24,textAlign:"center"}}><div style={{fontWeight:900,color:cfg.rolna.color,marginBottom:20}}>SMER ODMOTAVANJA: {d.rolna.smer_gp} ↓</div><div style={{display:"inline-block",width:220,background:"linear-gradient(135deg,#fce7f3,#fdf2f8)",border:`2px dashed ${cfg.rolna.color}`,borderRadius:8,padding:"1rem"}}>{[1,2].map(i=><div key={i} style={{background:"white",border:`2px solid ${cfg.rolna.color}`,padding:"1rem",borderRadius:6,marginBottom:8,fontWeight:800,color:"#831843"}}>ETIKETA #{i}<div style={{fontSize:10,color:"#666"}}>{d.sirina} × {d.duzina}mm</div></div>)}<div style={{fontSize:11,color:"#666",fontWeight:800}}>{d.rolna.broj_etiketa_u_metru} etiketa / metar</div></div></div></div></Section><Section type="rolna" title="Specifikacije rolne"><Table color={cfg.rolna.color} rows={[["Širina trake",fmt(d.sirina," mm"),"Dužina jedinice",fmt(d.duzina," mm")],["Broj etiketa u metru",fmt(d.rolna.broj_etiketa_u_metru," kom/m"),"Smer odmotavanja GP",fmt(d.rolna.smer_gp)],["Prečnik hilzne",fmt(d.rolna.hilzna," mm"),"Prečnik finalne rolne",fmt(d.rolna.precnik," mm")],["Metraža po rolni",fmt(d.rolna.metraza),"Broj traka",fmt(d.rezanje.broj_traka," traka")]]}/></Section></>; }

export default function NaloziOperacije({ nalogId, initialNalog }) {
  const [nalog, setNalog] = useState(initialNalog || null);
  const [loading, setLoading] = useState(!initialNalog);
  const [tab, setTab] = useState("materijal");
  const printRef = useRef(null);

  useEffect(() => {
    if (initialNalog || !nalogId) return;
    let alive = true;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase.from("radni_nalozi_folija").select("*").eq("id", nalogId).single();
      if (alive) { if (!error) setNalog(data); setLoading(false); }
    }
    load();
    return () => { alive = false; };
  }, [nalogId, initialNalog]);

  const d = useMemo(() => norm(nalog), [nalog]);
  const tabs = ["materijal","stampa","kasiranje","rezanje","perforacija","rolna"];
  const print = () => window.print();
  if (loading) return <div style={{padding:30}}>Učitavanje operativnih naloga...</div>;
  if (!nalog) return <div style={{padding:30}}>Nalog nije pronađen.</div>;
  const Current = { materijal: Materijal, stampa: Stampa, kasiranje: Kasiranje, rezanje: Rezanje, perforacija: Perforacija, rolna: Rolna }[tab];

  return <div style={{background:"#f5f5f5",padding:"1.5rem"}}>
    <style>{`@media print{body *{visibility:hidden}.print-op,.print-op *{visibility:visible}.print-op{position:absolute;left:0;top:0;width:100%;background:white}.no-print{display:none!important}}`}</style>
    <div className="no-print" style={{maxWidth:1200,margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{tabs.map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:"10px 14px",borderRadius:8,border:tab===t?"none":"1px solid #ddd",background:tab===t?cfg[t].color:"white",color:tab===t?"white":"#111827",fontWeight:800,cursor:"pointer"}}>{cfg[t].icon} {cfg[t].title.replace("NALOG ZA ","").replace(" (SEČENJE)","").replace(" (LAMINACIJU)","").replace("IZGLED NA ROLNI - ","")}</button>)}</div>
      <button onClick={print} style={{padding:"10px 16px",borderRadius:8,border:"none",background:cfg[tab].color,color:"white",fontWeight:900,cursor:"pointer"}}>🖨️ Štampaj / PDF</button>
    </div>
    <div className="print-op" ref={printRef} style={{maxWidth:1200,margin:"0 auto"}}><Current d={d}/></div>
  </div>;
}
