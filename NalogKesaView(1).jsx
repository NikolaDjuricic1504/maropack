import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

var QR_URL = function(val) {
  return "https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=" + encodeURIComponent(val);
};

function QRImg({val, size}) {
  return <img src={QR_URL(val)} width={size||90} height={size||90} alt="QR" style={{display:"block",borderRadius:4}}/>;
}

function Hdr({naslov, brN, suffix, boja, kupac, datum, datumIsp}) {
  return (
    <div style={{background:boja,color:"#fff",padding:"12px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{flex:1}}>
        <div style={{fontSize:8,color:"#94a3b8",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Maropack d.o.o. — Radni nalog / Kese</div>
        <div style={{fontSize:17,fontWeight:800,marginBottom:3}}>{naslov}</div>
        <div style={{fontSize:11,color:"#cbd5e1"}}>
          Br: <b style={{color:"#fbbf24"}}>{brN}{suffix}</b>
          &nbsp;·&nbsp; <b>{kupac}</b>
          &nbsp;·&nbsp; {datum}
          {datumIsp && <>&nbsp;·&nbsp; Isp: <b style={{color:"#fde68a"}}>{datumIsp}</b></>}
        </div>
      </div>
      <div style={{textAlign:"center",flexShrink:0,marginLeft:16}}>
        <div style={{background:"#fff",borderRadius:7,padding:5,display:"inline-block"}}>
          <QRImg val={window.location.origin+"?ponbr="+brN+suffix} size={80}/>
        </div>
        <div style={{fontSize:7,color:"#94a3b8",marginTop:2}}>Skeniraj</div>
      </div>
    </div>
  );
}

function Sec({title, boja, children}) {
  return (
    <div style={{padding:"10px 16px",borderBottom:"1px solid #e8edf3"}}>
      <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,color:boja||"#94a3b8",marginBottom:8}}>{title}</div>
      {children}
    </div>
  );
}

function G({n, children, gap, mb}) {
  return <div style={{display:"grid",gridTemplateColumns:`repeat(${n},1fr)`,gap:gap||8,marginBottom:mb||0}}>{children}</div>;
}

function Polje({label, val, c}) {
  var s={normal:{bg:"#f8fafc",cl:"#1e293b",bc:"#e2e8f0"},plava:{bg:"#eff6ff",cl:"#1e40af",bc:"#bfdbfe"},
    zelena:{bg:"#f0fdf4",cl:"#166534",bc:"#bbf7d0"},zuta:{bg:"#fefce8",cl:"#854d0e",bc:"#fde68a"},
    crvena:{bg:"#fef2f2",cl:"#991b1b",bc:"#fecaca"}}[c||"normal"];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:2}}>
      <div style={{fontSize:9,color:"#94a3b8"}}>{label}</div>
      <div style={{fontSize:12,fontWeight:600,padding:"5px 8px",background:s.bg,color:s.cl,borderRadius:5,border:"1px solid "+s.bc,minHeight:28}}>{val||"—"}</div>
    </div>
  );
}

function RolnaKartica({rolna}) {
  if (!rolna) return (
    <div style={{padding:"8px 12px",background:"#fef2f2",borderRadius:6,border:"1px solid #fecaca",fontSize:11,color:"#991b1b",fontWeight:700}}>
      ⚠️ Nema odgovarajuće rolne u magacinu!
    </div>
  );
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"#f0fdf4",borderRadius:6,border:"1px solid #bbf7d0"}}>
      <div style={{background:"#fff",borderRadius:5,padding:4,flexShrink:0}}>
        <QRImg val={window.location.origin+"?rolna="+encodeURIComponent(rolna.br_rolne)} size={56}/>
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:800,color:"#166534"}}>{rolna.br_rolne}</div>
        <div style={{fontSize:11,color:"#64748b",marginTop:2}}>
          {rolna.tip} {rolna.deb>0?rolna.deb+"µ":""} · {rolna.sirina}mm
        </div>
        <div style={{fontSize:11,color:"#059669",fontWeight:600}}>
          Ostalo: {(rolna.metraza_ost||rolna.metraza||0).toLocaleString()}m
          {rolna.kg_neto?" · "+rolna.kg_neto+" kg":""}
        </div>
        {rolna.palet && <div style={{fontSize:10,color:"#64748b"}}>Lok: {rolna.palet} {rolna.lot?"· LOT: "+rolna.lot:""}</div>}
      </div>
    </div>
  );
}

function Chip({label}) {
  if(!label || label==="—" || label==="Ne") return null;
  return <span style={{fontSize:10,padding:"2px 8px",borderRadius:5,background:"#f0fdf4",color:"#166534",border:"1px solid #bbf7d0",margin:2,display:"inline-block"}}>{label}</span>;
}

function Potpis() {
  return (
    <div style={{padding:"8px 16px",background:"#f8fafc",borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",fontSize:10,color:"#94a3b8"}}>
      <span>Nalog izradio: _________________________ &nbsp; Datum: ___________</span>
      <span>Nalog odobrio: _________________________</span>
    </div>
  );
}

function Kartica({children}) {
  return <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,overflow:"hidden",marginBottom:24,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>{children}</div>;
}

export default function NalogKesaView({nalog, onClose, msg}) {
  var [tab, setTab] = useState("mat");
  var [rolne, setRolne] = useState([]);
  var [loading, setLoading] = useState(true);
  var [kolKom, setKolKom] = useState("");
  var [datumIspEdit, setDatumIspEdit] = useState("");

  // Izvuci podatke
  var extra = (nalog.mats && typeof nalog.mats==="object" && !Array.isArray(nalog.mats)) ? nalog.mats : {};
  var n = Object.assign({}, extra, nalog);
  var brN = n.ponBr || "MP-0000";
  var kupac = n.kupac || "—";
  var naziv = n.prod || n.naziv || "—";
  var datum = n.datum || new Date().toLocaleDateString("sr-RS");
  var datumIsp = datumIspEdit || extra.datumIsp || n.datumIsp || "";

  // Dimenzije kese
  var sir   = +(extra.sirina   || n.sir    || 0);
  var duz   = +(extra.duzina   || 0);
  var klp   = +(extra.klapna   || 0);
  var ik    = +(extra.ik       || n.ik     || sir);
  var mat   = extra.materijal  || n.materijal || "";
  var takta = +(extra.takta    || 100);
  var ban   = +(extra.ban      || 1);
  var sk    = +(extra.sk       || n.sk     || 10);
  var opts  = extra.opcije     || {};

  // Kolicine
  var kol = kolKom ? +kolKom : +(n.kol||0);
  var zaRadKom = kol ? Math.round(kol*(1+sk/100)) : 0;
  // Metraza materijala: (sirina + klapna*2 + 20mm margina) / 1000 * broj_kesa / ban / takta
  var idealnaStr = ik || Math.round(sir + klp*2 + 20);
  var zaRadM = takta>0 && ban>0 && zaRadKom>0 ? Math.round(zaRadKom / (ban) * (duz>0?(duz+klp+20)/1000:1)) : 0;
  var vremeH = takta>0 && ban>0 && zaRadKom>0 ? +(zaRadKom/takta/ban/60).toFixed(2) : 0;

  useEffect(function(){
    if(!idealnaStr){setLoading(false);return;}
    supabase.from("magacin").select("*")
      .gte("sirina", idealnaStr).lte("sirina", idealnaStr+25)
      .neq("status","Iskorišćeno")
      .order("sirina")
      .then(function(r){setRolne(r.data||[]);setLoading(false);});
  },[idealnaStr]);

  function nadjiRolnu(tip) {
    if(!tip) return rolne[0]||null;
    var base=tip.split(" ")[0].toUpperCase();
    return rolne.find(function(r){return r.tip&&r.tip.toUpperCase().startsWith(base);})||rolne[0]||null;
  }

  var TABOVI = [
    {k:"mat",l:"📦 Materijal",boja:"#1e3a5f",suffix:"-7"},
    {k:"rez",l:"✂️ Rezanje",boja:"#1a2e1a",suffix:"-4"},
  ];

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",zIndex:9999,display:"flex",flexDirection:"column"}}>

      {/* TOP BAR */}
      <div style={{background:"#0f172a",padding:"10px 16px",display:"flex",alignItems:"center",gap:12,flexShrink:0,flexWrap:"wrap"}}>
        <button onClick={onClose} style={{padding:"7px 16px",borderRadius:7,border:"none",background:"#334155",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}}>← Nazad</button>
        <div style={{color:"#fff",fontWeight:700,fontSize:14,flex:1}}>🛍️ {naziv} · {kupac}</div>

        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <span style={{color:"#94a3b8",fontSize:11}}>Kol (kom):</span>
            <input type="number" value={kolKom} onChange={function(e){setKolKom(e.target.value);}}
              placeholder={String(n.kol||"")}
              style={{width:100,padding:"5px 8px",borderRadius:6,border:"1px solid #334155",background:"#1e293b",color:"#fff",fontSize:12}}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <span style={{color:"#94a3b8",fontSize:11}}>Isp:</span>
            <input value={datumIspEdit} onChange={function(e){setDatumIspEdit(e.target.value);}}
              placeholder="dd.mm.yyyy"
              style={{width:100,padding:"5px 8px",borderRadius:6,border:"1px solid #334155",background:"#1e293b",color:"#fff",fontSize:12}}/>
          </div>
        </div>
        <button onClick={function(){window.print();}} style={{padding:"7px 16px",borderRadius:7,border:"none",background:"#059669",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}}>🖨️ Štampaj A4</button>
      </div>

      {/* TABS */}
      <div style={{background:"#1e293b",padding:"8px 16px 0",display:"flex",gap:4,flexShrink:0}}>
        {TABOVI.map(function(t){
          return (
            <button key={t.k} onClick={function(){setTab(t.k);}}
              style={{padding:"7px 14px",borderRadius:"7px 7px 0 0",border:"none",cursor:"pointer",fontSize:12,fontWeight:700,
                background:tab===t.k?"#f1f5f9":"transparent",color:tab===t.k?"#0f172a":"#94a3b8"}}>
              {t.l}
            </button>
          );
        })}
      </div>

      {/* SADRZAJ */}
      <div style={{flex:1,overflow:"auto",background:"#f1f5f9",padding:20}}>

        {/* ===== MATERIJAL ===== */}
        {tab==="mat" && (
          <Kartica>
            <Hdr naslov="Nalog za materijal — Kese" brN={brN} suffix="-7" boja="#1e3a5f" kupac={kupac} datum={datum} datumIsp={datumIsp}/>

            <Sec title="Podaci o kesi" boja="#1e3a5f">
              <G n={4} mb={8}>
                <Polje label="Naziv kese" val={naziv}/>
                <Polje label="Kupac" val={kupac}/>
                <Polje label="Datum" val={datum}/>
                <Polje label="Datum isporuke" val={datumIsp} c="zuta"/>
              </G>
              <G n={4} mb={8}>
                <Polje label="Širina kese (mm)" val={sir||"—"} c="plava"/>
                <Polje label="Dužina kese (mm)" val={duz||"—"} c="plava"/>
                <Polje label="Klapna (mm)" val={klp||"—"} c="plava"/>
                <Polje label="Idealna šir. mat." val={idealnaStr+"mm"} c="zelena"/>
              </G>
              <G n={4}>
                <Polje label="Materijal" val={mat}/>
                <Polje label="Takta/min" val={takta}/>
                <Polje label="Ban" val={ban}/>
                <Polje label="Škart %" val={sk+"%"}/>
              </G>
            </Sec>

            <Sec title="Količine">
              <G n={4}>
                <Polje label="Naručeno (kom)" val={kol?kol.toLocaleString():"—"}/>
                <Polje label="Za rad (kom)" val={zaRadKom?zaRadKom.toLocaleString():"—"} c="zuta"/>
                <Polje label="Metraza mat. (m)" val={zaRadM?zaRadM.toLocaleString()+"m":"—"} c="plava"/>
                <Polje label="Vreme izrade" val={vremeH?vremeH+"h":"—"} c="zelena"/>
              </G>
            </Sec>

            <Sec title={"Rolna iz magacina — "+idealnaStr+"mm do "+(idealnaStr+25)+"mm"} boja="#059669">
              {loading ? <div style={{fontSize:11,color:"#94a3b8"}}>⏳ Tražim...</div> : (
                <div>
                  <RolnaKartica rolna={nadjiRolnu(mat)}/>
                  {rolne.length>1 && (
                    <div style={{fontSize:10,color:"#64748b",marginTop:6}}>
                      Ostale dostupne: {rolne.slice(1,4).map(function(r){return r.br_rolne+" ("+r.sirina+"mm)";}).join(", ")}
                    </div>
                  )}
                </div>
              )}
            </Sec>

            <Sec title="Tehničke opcije kese">
              <div style={{display:"flex",flexWrap:"wrap",gap:2}}>
                {opts.duplofan&&opts.duplofan.checked&&<Chip label={"Duplofan: "+(opts.duplofan.val||"")}/>}
                {opts.eurozumba&&opts.eurozumba.checked&&<Chip label={"Eurozumba: "+(opts.eurozumba.val||"")}/>}
                {opts.stampa&&opts.stampa.checked&&<Chip label={"Štampa: "+(opts.stampa.val||"")}/>}
                {opts.okruglaZumba&&opts.okruglaZumba.checked&&<Chip label={"Okrugla zumba"}/>}
                {opts.faltaDno&&opts.faltaDno.checked&&<Chip label="Falta na dnu"/>}
                {opts.varDno&&opts.varDno.checked&&<Chip label="Var na dnu"/>}
                {opts.poprecnaPerf&&opts.poprecnaPerf.checked&&<Chip label="Poprečna perf."/>}
                {opts.anleger&&opts.anleger.checked&&<Chip label={"Anleger: "+(opts.anleger.val||"")}/>}
                {opts.pakovati&&opts.pakovati.checked&&<Chip label={"Pakovanje: "+(opts.pakovati.val||"")}/>}
                {opts.tolerancija&&opts.tolerancija.checked&&<Chip label={"Tolerancija: "+(opts.tolerancija.val||"")}/>}
                {opts.pakZaHranu&&opts.pakZaHranu.checked&&<Chip label="Pakovanje za hranu ✓"/>}
              </div>
              {opts.eurozumba&&opts.eurozumba.checked&&opts.eurozumba.rastojanje&&(
                <div style={{fontSize:11,color:"#64748b",marginTop:6}}>Rastojanje eurozumbe od dna: <b>{opts.eurozumba.rastojanje}mm</b></div>
              )}
            </Sec>

            <Sec title="Napomena">
              <div style={{padding:8,background:"#f8fafc",borderRadius:5,border:"1px solid #e2e8f0",minHeight:40,fontSize:12,color:"#64748b"}}>
                {n.nap||"Proveriti stanje i kvalitet materijala pre puštanja u produkciju."}
              </div>
            </Sec>
            <Potpis/>
          </Kartica>
        )}

        {/* ===== REZANJE ===== */}
        {tab==="rez" && (
          <Kartica>
            <Hdr naslov="Nalog za rezanje — Kese" brN={brN} suffix="-4" boja="#1a2e1a" kupac={kupac} datum={datum} datumIsp={datumIsp}/>

            <Sec title="Identifikacija">
              <G n={4} mb={8}>
                <Polje label="Radni nalog br." val={brN} c="plava"/>
                <Polje label="Datum" val={datum}/>
                <Polje label="Kupac" val={kupac}/>
                <Polje label="Naziv kese" val={naziv}/>
              </G>
            </Sec>

            <Sec title="Dimenzije i rezanje" boja="#1a2e1a">
              <G n={4} mb={8}>
                <Polje label="Materijal" val={mat}/>
                <Polje label="Šir. mat. rolne" val={idealnaStr+"mm"} c="plava"/>
                <Polje label="Vrsta sečiva" val="Žilet"/>
                <Polje label="Korona tretman" val="Ne"/>
              </G>
              <G n={4}>
                <Polje label="Šir. kese (mm)" val={sir||"—"}/>
                <Polje label="Duz. kese (mm)" val={duz||"—"}/>
                <Polje label="Naručeno (kom)" val={kol?kol.toLocaleString():"—"}/>
                <Polje label="Za rad (kom)" val={zaRadKom?zaRadKom.toLocaleString():"—"} c="zuta"/>
              </G>
            </Sec>

            <Sec title="Tehničke opcije">
              <div style={{display:"flex",flexWrap:"wrap",gap:2,marginBottom:10}}>
                {opts.duplofan&&opts.duplofan.checked&&<Chip label={"Duplofan: "+(opts.duplofan.val||"")}/>}
                {opts.eurozumba&&opts.eurozumba.checked&&<Chip label={"Eurozumba: "+(opts.eurozumba.val||"")}/>}
                {opts.stampa&&opts.stampa.checked&&<Chip label={"Štampa: "+(opts.stampa.val||"")}/>}
                {opts.okruglaZumba&&opts.okruglaZumba.checked&&<Chip label="Okrugla zumba"/>}
                {opts.faltaDno&&opts.faltaDno.checked&&<Chip label="Falta na dnu"/>}
                {opts.pakovati&&opts.pakovati.checked&&<Chip label={"Pakovanje: "+(opts.pakovati.val||"")}/>}
                {opts.tolerancija&&opts.tolerancija.checked&&<Chip label={"Tolerancija: "+(opts.tolerancija.val||"")}/>}
              </div>
              <G n={4}>
                <Polje label="Pakovanje" val={opts.pakovati&&opts.pakovati.checked?opts.pakovati.val:"U bunt"}/>
                <Polje label="Tolerancija" val={opts.tolerancija&&opts.tolerancija.checked?opts.tolerancija.val:"±10%"}/>
                <Polje label="Obeležavanje" val="Etiketa na svakom buntu"/>
                <Polje label="Paleta" val="Euro paleta"/>
              </G>
            </Sec>

            <Sec title="Napomena / Napomena operatera">
              <G n={2}>
                <div style={{padding:8,background:"#f8fafc",borderRadius:5,border:"1px solid #e2e8f0",minHeight:44,fontSize:12,color:"#64748b"}}>
                  {n.nap||"Čvrsti savovi, bez vlakana po ivicama. Kese ne smeju biti savijene."}
                </div>
                <div style={{padding:8,background:"#fffbeb",borderRadius:5,border:"1px dashed #fde68a",minHeight:44,fontSize:12,color:"#92400e"}}>
                  Operater upisuje...
                </div>
              </G>
            </Sec>
            <Potpis/>
          </Kartica>
        )}

      </div>
    </div>
  );
}
