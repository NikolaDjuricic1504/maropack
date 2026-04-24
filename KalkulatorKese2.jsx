import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

const OPCIJE = {
  duplofan: ["Nema","Obična","Permanentna","Permanentna bezbedna za hranu","Široka","NE"],
  pozDuplofan: ["Na klapni","NE"],
  ukosenaKlapna: ["DA","DA NA KRACOJ STRANI","NE"],
  perfOtkinuti: ["Fina perforacija","Gruba perforacija","NE"],
  stampa: ["Bez štampe","Termotransfer","Štampa vrućim pečatom crna boja","Štampa vrućim pečatom zelena boja","Štampa vrućim pečatom zlatna boja","Štampa vrućim pečatom srebrna boja","Flexo štampa","NE"],
  eurozumba: ["MALA(30x10x5)","SREDNJA(32x10x5)","VELIKA(35x12x5)","SPECIJALNA","NE"],
  anleger: [
    "135µm/20mm/BELI","135µm/25mm/BELI","135µm/30mm/BELI","135µm/35mm/BELI","135µm/40mm/BELI",
    "135µm/20mm/TRANSPARENTNI","135µm/25mm/TRANSPARENTNI","135µm/30mm/TRANSPARENTNI","135µm/35mm/TRANSPARENTNI","135µm/40mm/TRANSPARENTNI",
    "150µm/20mm/BELI","150µm/25mm/BELI","150µm/30mm/BELI","150µm/35mm/BELI","150µm/40mm/BELI",
    "150µm/20mm/TRANSPARENTNI","150µm/25mm/TRANSPARENTNI","150µm/30mm/TRANSPARENTNI","150µm/35mm/TRANSPARENTNI","150µm/40mm/TRANSPARENTNI",
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
  tolerancija: ["+/- 10%","Mora tacna kolicina","Bez + tolerancije","Bez - tolerancije","±2mm","NE"],
};

const DEFAULT_CENE = {
  duplofan:1.5, eurozumba:1.5, okruglaZumba:1.5, varDno:1.5, faltaDno:1.5,
  otvorDno:1.5, perfVrucim:1.5, ukosenaKlapna:1.5, perfOtkinuti:1.5,
  poprecnaPerf:1.5, poprecniVar:1.5, stampa:1.5, pakZaHranu:1.5, anleger:1.5, utor:1.5,
};

var INIT_OPTS = {
  duplofan:{checked:false,val:"Obična",pos:"Na klapni"},
  ukosenaKlapna:{checked:false,val:"DA"},
  perfOtkinuti:{checked:false,val:"Fina perforacija"},
  otvorDno:{checked:false},
  faltaDno:{checked:false},
  varDno:{checked:false},
  stampa:{checked:false,val:"Termotransfer",motiv:""},
  eurozumba:{checked:false,val:"MALA(30x10x5)",rastojanje:""},
  utor:{checked:false},
  perfVrucim:{checked:false},
  okruglaZumba:{checked:false,velPoz:""},
  poprecnaPerf:{checked:false},
  poprecniVar:{checked:false,val:"3mm"},
  pakZaHranu:{checked:false},
  anleger:{checked:false,val:"135µm/30mm/BELI"},
  pakovati:{checked:false,val:"U bunt ide 200 kom"},
  tolerancija:{checked:false,val:"+/- 10%"},
};


var QR = function(val) {
  return "https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=" + encodeURIComponent(val);
};

function Hdr({naslov, brN, suffix, boja, kupac, datum, datumIsp}) {
  return (
    <div style={{background:boja,color:"#fff",padding:"12px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div>
        <div style={{fontSize:8,color:"#94a3b8",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Maropack d.o.o. — Radni nalog / Kese</div>
        <div style={{fontSize:18,fontWeight:800,marginBottom:2}}>{naslov}</div>
        <div style={{fontSize:11,color:"#cbd5e1"}}>
          Br. naloga: <b style={{color:"#fbbf24"}}>{brN}{suffix}</b>
          &nbsp;·&nbsp; Kupac: <b>{kupac}</b>
          &nbsp;·&nbsp; Datum: <b>{datum}</b>
          {datumIsp && <>&nbsp;·&nbsp; Isporuka: <b style={{color:"#fde68a"}}>{datumIsp}</b></>}
        </div>
      </div>
      <div style={{textAlign:"center",flexShrink:0}}>
        <div style={{background:"#fff",borderRadius:8,padding:6,display:"inline-block"}}>
          <img src={QR(window.location.origin+"?ponbr="+brN+suffix)} width={80} height={80} alt="QR" style={{display:"block"}}/>
        </div>
        <div style={{fontSize:8,color:"#94a3b8",marginTop:3}}>Skeniraj telefonom</div>
      </div>
    </div>
  );
}

function Sec({title, children, boja}) {
  return (
    <div style={{padding:"10px 16px",borderBottom:"1px solid #e8edf3"}}>
      <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:boja||"#94a3b8",marginBottom:8}}>{title}</div>
      {children}
    </div>
  );
}

function Grid({n, children, gap=8, mb=0}) {
  return <div style={{display:"grid",gridTemplateColumns:`repeat(${n},1fr)`,gap,marginBottom:mb}}>{children}</div>;
}

function Polje({label, val, boja}) {
  var bg="#f8fafc",cl="#1e293b",bc="#e2e8f0";
  if(boja==="plava"){bg="#eff6ff";cl="#1e40af";bc="#bfdbfe";}
  if(boja==="zelena"){bg="#f0fdf4";cl="#166534";bc="#bbf7d0";}
  if(boja==="zuta"){bg="#fefce8";cl="#854d0e";bc="#fde68a";}
  if(boja==="crvena"){bg="#fef2f2";cl="#991b1b";bc="#fecaca";}
  if(boja==="zelena2"){bg="#059669";cl="#fff";bc="#059669";}
  return (
    <div style={{display:"flex",flexDirection:"column",gap:2}}>
      <div style={{fontSize:9,color:"#94a3b8"}}>{label}</div>
      <div style={{fontSize:12,fontWeight:600,padding:"5px 8px",background:bg,color:cl,borderRadius:5,border:"1px solid "+bc,minHeight:28}}>{val||"—"}</div>
    </div>
  );
}

function RolnaRed({sirina, tip, rolna, metraza, lokacija, ima}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:"#f8fafc",borderRadius:6,border:"1px solid #e2e8f0",marginBottom:5}}>
      <div style={{fontSize:11,fontWeight:700,color:"#059669",background:"#f0fdf4",borderRadius:4,padding:"2px 8px",flexShrink:0}}>Materijal</div>
      <div style={{flex:1,fontSize:12,fontWeight:600}}>{tip} <span style={{color:"#64748b",fontWeight:400}}>· idealna širina: {sirina}mm</span></div>
      {ima ? (
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:11,color:"#166534",fontWeight:700}}>{rolna}</div>
          <div style={{fontSize:10,color:"#64748b"}}>{(metraza||0).toLocaleString()}m · {lokacija}</div>
        </div>
      ) : (
        <span style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:"#fef2f2",color:"#991b1b",border:"1px solid #fecaca",fontWeight:700}}>⚠ Nema u magacinu!</span>
      )}
    </div>
  );
}

function OpcijaChip({label, val}) {
  if(!val || val==="NE" || val==="Ne" || val==="—") return null;
  return <span style={{fontSize:10,padding:"2px 8px",borderRadius:5,background:"#f0fdf4",color:"#166534",border:"1px solid #bbf7d0",margin:2,display:"inline-block"}}>{label}: {val}</span>;
}

function Potpis() {
  return (
    <div style={{padding:"8px 16px",background:"#f8fafc",borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",fontSize:10,color:"#94a3b8"}}>
      <span>Nalog izradio: _________________________ &nbsp;&nbsp; Datum: ___________</span>
      <span>Nalog odobrio: _________________________</span>
    </div>
  );
}

function Kartica({children}) {
  return <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,overflow:"hidden",marginBottom:24}}>{children}</div>;
}

function NalogKesaView({nalog, onClose, msg}) {
  var [tab, setTab] = useState("mat");
  var [rolne, setRolne] = useState([]);
  var [datumIsp, setDatumIsp] = useState("");
  var [brKomInput, setBrKomInput] = useState("");
  var [notes, setNotes] = useState({});

  var extra = (nalog.mats && typeof nalog.mats==="object" && !Array.isArray(nalog.mats)) ? nalog.mats : {};
  var n = Object.assign({}, extra, nalog);
  var brN = n.ponBr || "MP-0000";
  var kupac = n.kupac || "—";
  var naziv = n.prod || n.naziv || "—";
  var datum = n.datum || new Date().toLocaleDateString("sr-RS");
  var datIsp = datumIsp || extra.datumIsp || "";
  var materijal = extra.materijal || n.materijal || "";
  var sir = +(extra.sirina || n.sir || 0);
  var duz = +(extra.duzina || 0);
  var klp = +(extra.klapna || 0);
  var ik = +(extra.ik || n.ik || Math.round(sir + klp*2 + 20));
  var takta = +(extra.takta || 100);
  var ban = +(extra.ban || 1);
  var sk = +(extra.sk || n.sk || 10);
  var opts = extra.opcije || {};
  var kolKom = +brKomInput || +(n.kol || 0);
  var vremeH = takta>0&&ban>0&&kolKom>0 ? Math.round(kolKom/takta/ban/60*100)/100 : 0;
  var zaRadKom = Math.round(kolKom*(1+sk/100));

  useEffect(function(){
    if(!ik) return;
    supabase.from("magacin").select("*")
      .gte("sirina",ik).lte("sirina",ik+25)
      .neq("status","Iskorišćeno")
      .order("sirina")
      .then(function(r){setRolne(r.data||[]);});
  },[ik]);

  function nadjiRolnu() {
    if(!materijal) return null;
    var base = materijal.split(" ")[0].toUpperCase();
    return rolne.find(function(r){return r.tip&&r.tip.toUpperCase().startsWith(base);});
  }

  var rolna = nadjiRolnu();
  var rolnaUrl = rolna ? window.location.origin+"?rolna="+encodeURIComponent(rolna.br_rolne) : "";

  function setNote(k,v){setNotes(function(m){return Object.assign({},m,{[k]:v});});}

  var S = {
    hdr: function(boja) { return {background:boja,color:"#fff",padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}; },
    sec: {padding:"8px 14px",borderBottom:"1px solid #e8edf3"},
    secT: {fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,color:"#94a3b8",marginBottom:7},
    g4: {display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:8},
    g3: {display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:8},
    g2: {display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8},
    potpis: {padding:"7px 14px",background:"#f8fafc",borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",fontSize:10,color:"#94a3b8"},
  };

  function Polje({label,val,boja}){
    var bg="#f8fafc",cl="#1e293b",bc="#e2e8f0";
    if(boja==="plava"){bg="#eff6ff";cl="#1e40af";bc="#bfdbfe";}
    if(boja==="zelena"){bg="#f0fdf4";cl="#166534";bc="#bbf7d0";}
    if(boja==="zuta"){bg="#fefce8";cl="#854d0e";bc="#fde68a";}
    if(boja==="crvena"){bg="#fef2f2";cl="#991b1b";bc="#fecaca";}
    return <div style={{display:"flex",flexDirection:"column",gap:2}}>
      <div style={{fontSize:9,color:"#94a3b8"}}>{label}</div>
      <div style={{fontSize:12,fontWeight:600,padding:"4px 7px",background:bg,color:cl,borderRadius:5,border:"1px solid "+bc,minHeight:26}}>{val||"—"}</div>
    </div>;
  }

  function QRImg({url,size}){
    return <div style={{background:"#fff",borderRadius:5,padding:3,display:"inline-block"}}>
      <img src={"https://api.qrserver.com/v1/create-qr-code/?size="+(size||80)+"x"+(size||80)+"&data="+encodeURIComponent(url)} width={size||80} height={size||80} alt="QR" style={{display:"block"}}/>
    </div>;
  }

  function NalogHdr({naslov,suffix,boja}){
    var url = window.location.origin+"?ponbr="+encodeURIComponent(brN+suffix);
    return <div style={S.hdr(boja)}>
      <div>
        <div style={{fontSize:8,color:"#94a3b8",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Maropack d.o.o. — Radni nalog / Kese</div>
        <div style={{fontSize:17,fontWeight:800,marginBottom:2}}>{naslov}</div>
        <div style={{fontSize:10,color:"#cbd5e1"}}><b style={{color:"#fbbf24"}}>{brN}{suffix}</b> · {kupac} · {datum}{datIsp&&<> · Isporuka: <b style={{color:"#fde68a"}}>{datIsp}</b></>}</div>
      </div>
      <div style={{textAlign:"center",flexShrink:0}}>
        <QRImg url={url} size={80}/><div style={{fontSize:8,color:"#94a3b8",marginTop:2}}>Skeniraj</div>
      </div>
    </div>;
  }

  var Chip = function({label,val}){
    if(!val||val==="Ne"||val==="—") return null;
    return <span style={{fontSize:10,padding:"2px 8px",borderRadius:5,background:"#f0fdf4",color:"#166534",border:"1px solid #bbf7d0",margin:2,display:"inline-block"}}>{label}: {val}</span>;
  };

  var TABS = [{k:"mat",l:"📦 Materijal"},{k:"rez",l:"✂️ Rezanje"}];

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",zIndex:9999,display:"flex",flexDirection:"column"}}>
      <div style={{background:"#0f172a",padding:"10px 16px",display:"flex",alignItems:"center",gap:10,flexShrink:0,flexWrap:"wrap"}}>
        <button onClick={onClose} style={{padding:"7px 14px",borderRadius:7,border:"none",background:"#334155",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}}>← Nazad</button>
        <div style={{color:"#fff",fontWeight:700,fontSize:13,flex:1}}>🛍️ {naziv} — {kupac} <span style={{color:"#fbbf24"}}>{brN}</span></div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <span style={{color:"#94a3b8",fontSize:11}}>Isporuka:</span>
            <input style={{padding:"5px 8px",borderRadius:6,border:"1px solid #475569",background:"#1e293b",color:"#fff",fontSize:12,width:105}}
              value={datumIsp} placeholder="dd.mm.gggg." onChange={function(e){setDatumIsp(e.target.value);}}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <span style={{color:"#94a3b8",fontSize:11}}>Kom:</span>
            <input type="number" style={{padding:"5px 8px",borderRadius:6,border:"1px solid #475569",background:"#1e293b",color:"#fff",fontSize:12,width:80}}
              value={brKomInput} placeholder={kolKom||""} onChange={function(e){setBrKomInput(e.target.value);}}/>
          </div>
          <button onClick={function(){window.print();}} style={{padding:"7px 14px",borderRadius:7,border:"none",background:"#059669",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}}>🖨️ Štampaj A4</button>
        </div>
      </div>
      <div style={{background:"#1e293b",padding:"8px 16px 0",display:"flex",gap:4,flexShrink:0}}>
        {TABS.map(function(t){
          return <button key={t.k} onClick={function(){setTab(t.k);}}
            style={{padding:"8px 16px",borderRadius:"8px 8px 0 0",border:"none",cursor:"pointer",fontSize:12,fontWeight:700,
              background:tab===t.k?"#f1f5f9":"transparent",color:tab===t.k?"#0f172a":"#94a3b8"}}>{t.l}</button>;
        })}
      </div>

      <div style={{flex:1,overflow:"auto",background:"#f1f5f9",padding:20}}>

        {/* ══ MATERIJAL ══ */}
        {tab==="mat"&&(
          <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,overflow:"hidden",marginBottom:20}}>
            <NalogHdr naslov="Nalog za materijal — Kese" suffix="-7" boja="#1e3a5f"/>
            <div style={S.sec}><div style={S.secT}>Identifikacija</div>
              <div style={S.g4}><Polje label="Nalog br." val={brN} boja="plava"/><Polje label="Datum" val={datum}/><Polje label="Isporuka" val={datIsp} boja="zuta"/><Polje label="Kupac" val={kupac}/></div>
              <Polje label="Naziv kese" val={naziv}/>
            </div>
            <div style={S.sec}><div style={S.secT}>Dimenzije kese</div>
              <div style={S.g4}>
                <Polje label="Širina (mm)" val={sir+"mm"} boja="plava"/>
                <Polje label="Dužina (mm)" val={duz+"mm"} boja="plava"/>
                <Polje label="Klapna (mm)" val={klp?klp+"mm":"—"} boja="plava"/>
                <Polje label="Idealna šir. mat." val={ik+"mm"} boja="zelena"/>
              </div>
              <div style={S.g4}>
                <Polje label="Materijal" val={materijal}/>
                <Polje label="Takta/min" val={takta}/>
                <Polje label="Ban" val={ban}/>
                <Polje label="Vreme izrade" val={vremeH>0?vremeH+"h":"—"} boja="zuta"/>
              </div>
            </div>

            {/* Rolna iz magacina sa QR */}
            <div style={S.sec}><div style={S.secT}>{"Rolna iz magacina — "+ik+"–"+(ik+25)+"mm"}</div>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:rolna?"#f0fdf4":"#fef2f2",borderRadius:7,border:"1px solid "+(rolna?"#bbf7d0":"#fecaca")}}>
                {rolna ? (
                  <>
                    <div style={{flexShrink:0,textAlign:"center"}}><QRImg url={rolnaUrl} size={66}/><div style={{fontSize:8,color:"#64748b",marginTop:2}}>Rolna QR</div></div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:800,color:"#166534"}}>{rolna.br_rolne}</div>
                      <div style={{fontSize:12,color:"#64748b",marginTop:2}}>
                        {rolna.tip} {rolna.deb>0?rolna.deb+"µ":""} · {rolna.sirina}mm
                        · Ostalo: <b>{(rolna.metraza_ost||rolna.metraza||0).toLocaleString()}m</b>
                        {rolna.kg_neto>0&&<> · <b>{rolna.kg_neto}kg</b></>}
                        {rolna.palet&&<> · <b style={{color:"#f59e0b"}}>{rolna.palet}</b></>}
                        {rolna.lot&&<> · LOT: {rolna.lot}</>}
                      </div>
                    </div>
                    <div style={{flexShrink:0}}>
                      <div style={{fontFamily:"monospace",fontSize:7,background:"#fff",padding:"3px 6px",borderRadius:3,border:"1px solid #e2e8f0",letterSpacing:2}}> ||| {rolna.br_rolne} |||</div>
                    </div>
                  </>
                ) : (
                  <div style={{color:"#991b1b",fontWeight:700}}>⚠ Nema rolne {ik}–{ik+25}mm u magacinu!</div>
                )}
              </div>
            </div>

            <div style={S.sec}><div style={S.secT}>Količine</div>
              <div style={S.g4}>
                <Polje label="Naručeno (kom)" val={(kolKom||0).toLocaleString()}/>
                <Polje label="Za rad (kom)" val={zaRadKom.toLocaleString()} boja="zuta"/>
                <Polje label="Škart %" val={sk+"%"}/>
                <Polje label="Takta × Ban" val={takta+" × "+ban+" = "+(takta*ban)+" kom/min"}/>
              </div>
            </div>
            <div style={{padding:"8px 14px"}}><div style={S.secT}>Napomena</div>
              <textarea style={{width:"100%",minHeight:36,padding:7,background:"#f8fafc",borderRadius:5,border:"1px solid #e2e8f0",fontSize:12,color:"#64748b",resize:"vertical",boxSizing:"border-box"}}
                value={notes.mat||n.nap||""} onChange={function(e){setNote("mat",e.target.value);}} placeholder="Napomena..."/>
            </div>
            <div style={S.potpis}><span>Nalog izradio: _________________________ &nbsp; Datum: ___________</span><span>Nalog odobrio: _________________________</span></div>
          </div>
        )}

        {/* ══ REZANJE ══ */}
        {tab==="rez"&&(
          <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,overflow:"hidden",marginBottom:20}}>
            <NalogHdr naslov="Nalog za rezanje — Kese" suffix="-4" boja="#1a2e1a"/>
            <div style={S.sec}><div style={S.secT}>Identifikacija</div>
              <div style={S.g4}><Polje label="Nalog br." val={brN} boja="plava"/><Polje label="Datum" val={datum}/><Polje label="Kupac" val={kupac}/><Polje label="Naziv kese" val={naziv}/></div>
            </div>
            <div style={S.sec}><div style={S.secT}>Parametri rezanja</div>
              <div style={S.g4}>
                <Polje label="Materijal" val={materijal}/>
                <Polje label="Šir. matične rolne" val={ik+"mm"} boja="plava"/>
                <Polje label="Vrsta sečiva" val="Žilet"/>
                <Polje label="Korona tretman" val="Ne"/>
              </div>
              <div style={S.g4}>
                <Polje label="Šir. kese (mm)" val={sir+"mm"}/>
                <Polje label="Duz. kese (mm)" val={duz+"mm"}/>
                <Polje label="Naručeno (kom)" val={(kolKom||0).toLocaleString()} boja="plava"/>
                <Polje label="Vreme izrade" val={vremeH>0?vremeH+"h":"—"} boja="zuta"/>
              </div>
            </div>
            <div style={S.sec}><div style={S.secT}>Tehničke opcije kese</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4,padding:"4px 0"}}>
                <Chip label="Duplofan" val={opts.duplofan&&opts.duplofan.checked?opts.duplofan.val:null}/>
                <Chip label="Eurozumba" val={opts.eurozumba&&opts.eurozumba.checked?opts.eurozumba.val:null}/>
                <Chip label="Štampa" val={opts.stampa&&opts.stampa.checked?opts.stampa.val:null}/>
                <Chip label="Okrugla zumba" val={opts.okruglaZumba&&opts.okruglaZumba.checked?opts.okruglaZumba.velPoz||"DA":null}/>
                <Chip label="Falta na dnu" val={opts.faltaDno&&opts.faltaDno.checked?"DA":null}/>
                <Chip label="Var na dnu" val={opts.varDno&&opts.varDno.checked?"DA":null}/>
                <Chip label="Poprečna perf." val={opts.poprecnaPerf&&opts.poprecnaPerf.checked?"DA":null}/>
                <Chip label="Anleger" val={opts.anleger&&opts.anleger.checked?opts.anleger.val:null}/>
                <Chip label="Pakovanje" val={opts.pakovati&&opts.pakovati.checked?opts.pakovati.val:null}/>
                <Chip label="Tolerancija" val={opts.tolerancija&&opts.tolerancija.checked?opts.tolerancija.val:null}/>
              </div>
              {opts.eurozumba&&opts.eurozumba.checked&&opts.eurozumba.rastojanje&&(
                <div style={{fontSize:11,color:"#64748b",marginTop:4}}>Rastojanje eurozumbe od dna: <b>{opts.eurozumba.rastojanje}mm</b></div>
              )}
            </div>
            <div style={S.sec}><div style={S.secT}>Pakovanje finalnog proizvoda</div>
              <div style={S.g4}>
                <Polje label="Pakovanje" val={opts.pakovati&&opts.pakovati.checked?opts.pakovati.val:"U bunt"}/>
                <Polje label="Tolerancija" val={opts.tolerancija&&opts.tolerancija.checked?opts.tolerancija.val:"±10%"}/>
                <Polje label="Obeležavanje" val="Etiketa na svakom buntu"/>
                <Polje label="Paleta" val="Euro paleta"/>
              </div>
            </div>
            <div style={{padding:"8px 14px"}}><div style={S.secT}>Napomena / Napomena operatera</div>
              <div style={S.g2}>
                <textarea style={{padding:7,background:"#f8fafc",borderRadius:5,border:"1px solid #e2e8f0",fontSize:12,color:"#64748b",resize:"vertical",minHeight:44,boxSizing:"border-box"}}
                  value={notes.rez||n.nap||""} onChange={function(e){setNote("rez",e.target.value);}} placeholder="Napomena..."/>
                <textarea style={{padding:7,background:"#fffbeb",borderRadius:5,border:"1px dashed #fde68a",fontSize:12,color:"#92400e",resize:"vertical",minHeight:44,boxSizing:"border-box"}}
                  placeholder="Operater upisuje zapažanja..."/>
              </div>
            </div>
            <div style={S.potpis}><span>Nalog izradio: _________________________ &nbsp; Datum: ___________</span><span>Nalog odobrio: _________________________</span></div>
          </div>
        )}

      </div>
    </div>
  );
}



export default function KalkulatorKese2({user,msg,setPage,inp,card,lbl}) {
  var [kese,setKese]=useState([]);
  var [tab,setTab]=useState("lista");
  var [naziv,setNaziv]=useState("");
  var [kupac,setKupac]=useState("");
  var [materijal,setMaterijal]=useState("");
  var [sirina,setSirina]=useState("");
  var [duzina,setDuzina]=useState("");
  var [klapna,setKlapna]=useState("");
  var [takta,setTakta]=useState(100);
  var [ban,setBan]=useState(1);
  var [napKese,setNapKese]=useState("");
  var [opts,setOpts]=useState(INIT_OPTS);
  var [kol,setKol]=useState(1000);
  var [cenaKg,setCenaKg]=useState("");
  var [sk,setSk]=useState(10);
  var [mar,setMar]=useState(40);
  var [ceneOp,setCeneOp]=useState(Object.assign({},DEFAULT_CENE));
  var [res,setRes]=useState(null);
  var [izabranaKesa,setIzabranaKesa]=useState(null);
  var [pkupac,setPkupac]=useState("");
  var [pnap,setPnap]=useState("");
  var [aktivna,setAktivna]=useState(null);
  var [nalogKesa,setNalogKesa]=useState(null);

  async function kreirajNalogeKesa(){
    if(!pkupac.trim()){msg("Unesite kupca!","err");return;}
    if(!sirina||!duzina){msg("Unesite dimenzije kese!","err");return;}
    var ik = Math.round((+sirina + (+klapna||0)*2 + 20));
    var brN = "MP-"+new Date().getFullYear()+"-"+String(Math.floor(Math.random()*9000)+1000);
    var nalogData = {
      datumIsp:"", sk:+sk, materijal:materijal,
      sirina:+sirina, duzina:+duzina, klapna:+klapna||0,
      ik:ik, takta:+takta, ban:+ban, opcije:opts,
    };
    var NAZIVI = {mat:"Nalog za materijal",kes:"Nalog za kesičarenje",rez:"Nalog za rezanje"};
    var inserts = Object.keys(NAZIVI).map(function(k){
      return {ponBr:brN,kupac:pkupac,prod:naziv||("Kesa "+sirina+"×"+duzina+(klapna?"+"+klapna:"")),
        tip:"kesa",kol:+kol,datum:new Date().toLocaleDateString("sr-RS"),
        status:"Ceka",ko:user.ime,nap:pnap,mats:nalogData,naziv:NAZIVI[k]};
    });
    try{
      var r = await supabase.from("nalozi").insert(inserts);
      if(r.error) throw r.error;
      msg("✅ Kreirano 3 naloga! Br: "+brN);
      setNalogKesa(Object.assign({},nalogData,{ponBr:brN,kupac:pkupac,
        prod:naziv||("Kesa "+sirina+"×"+duzina+(klapna?"+"+klapna:"")),
        kol:+kol,datum:new Date().toLocaleDateString("sr-RS"),mats:nalogData}));
    }catch(e){msg("Greška: "+e.message,"err");}
  }

  useEffect(function(){
    supabase.from('kese').select('*').order('created_at',{ascending:false}).then(function(r){setKese(r.data||[]);});
  },[]);

  useEffect(function(){
    if(!sirina||!duzina||!cenaKg||!kol){setRes(null);return;}
    var sir=+sirina/1000;
    var duz=((+duzina)+(+klapna||0))*2/1000;
    var pov=sir*duz;
    var gram=30;
    var kgK=pov*gram/1000;
    var cenaM=kgK*(+cenaKg);
    var opKesa=Object.keys(opts).filter(function(k){return opts[k].checked&&ceneOp[k];}).reduce(function(s,k){return s+ceneOp[k];},0)/1000;
    var osnK=cenaM+opKesa;
    var sas=osnK*(1+(+sk/100));
    var mf=1+(+mar/100);
    var cenaMar=sas*mf;
    setRes({pov,kgK,cenaM,opKesa,osnK,cenaMar,ukOsn:osnK*(+kol),ukMar:cenaMar*(+kol),ukKg:kgK*(+kol),vreme:((+kol)/(+takta||100)/(+ban||1))/60});
  },[sirina,duzina,klapna,cenaKg,kol,sk,mar,opts,ceneOp,takta,ban]);

  function updOpt(key,field,val){
    setOpts(function(prev){
      var n=Object.assign({},prev);
      n[key]=Object.assign({},n[key]);
      n[key][field]=val;
      return n;
    });
  }

  async function sacuvajKesu(){
    if(!naziv.trim()){msg("Unesite naziv!","err");return;}
    var p={naziv,kupac,materijal,sirina:+sirina,duzina:+duzina,klapna:+klapna,takta:+takta,ban:+ban,napomena:napKese,opcije:opts,datum:new Date().toLocaleDateString("sr-RS"),ko:user.ime};
    try{
      var r=await supabase.from('kese').insert([p]).select();
      if(r.error)throw r.error;
      setKese(function(k){return [r.data[0]].concat(k);});
      msg("Kesa sacuvana!");setTab("lista");
    }catch(e){msg("Greška: "+e.message,"err");}
  }

  async function kreirajPonudu(){
    if(!pkupac.trim()){msg("Unesite kupca!","err");return;}
    if(!res){msg("Najpre kalkuliši!","err");return;}
    var naziv2=izabranaKesa?izabranaKesa.naziv:naziv;
    var p={
      broj:"MP-"+new Date().getFullYear()+"-"+String(Math.floor(Math.random()*9000)+1000),
      datum:new Date().toLocaleDateString("sr-RS"),
      vaz:new Date(Date.now()+30*24*3600000).toLocaleDateString("sr-RS"),
      kupac:pkupac,naziv:naziv2,kol:+kol,c1:res.cenaMar,uk:res.ukMar,
      mats:[],nap:pnap,jez:"sr",status:"Aktivna",ko:user.ime,res:Object.assign({},res),tip:"kesa",
      kesaData:Object.assign({},izabranaKesa||{},{sirina,duzina,klapna,materijal,takta,ban,opcije:opts})
    };
    try{
      var r=await supabase.from('ponude').insert([p]).select();
      if(r.error)throw r.error;
      setAktivna(r.data[0]);msg("Ponuda kreirana!");
    }catch(e){msg("Greška: "+e.message,"err");}
  }

  function ucitajKesu(k){
    setIzabranaKesa(k);
    setMaterijal(k.materijal||"");
    setSirina(String(k.sirina||""));
    setDuzina(String(k.duzina||""));
    setKlapna(String(k.klapna||""));
    setTakta(k.takta||100);
    setBan(k.ban||1);
    if(k.opcije)setOpts(k.opcije);
    if(k.kupac)setPkupac(k.kupac);
    setCenaKg("");
    setTab("kalk");
  }

  var f2=function(v){return (!v||isNaN(v))?"—":(+v).toFixed(2).replace(".",",");};
  var eu=function(v){return f2(v)+" €";};

  var LAB={
    duplofan:"Duplofan traka",ukosenaKlapna:"Ukošena klapna",perfOtkinuti:"Perf. za otkinuti",
    otvorDno:"Otvor na dnu",faltaDno:"Falta na dnu",varDno:"Var na dnu",stampa:"Štampa",
    eurozumba:"Eurozumba",utor:"Utor",perfVrucim:"Perf. vrućim iglama",okruglaZumba:"Okrugla zumba",
    poprecnaPerf:"Poprečna perforacija",poprecniVar:"Poprečni var",pakZaHranu:"Pakovanje za hranu",
    anleger:"Anleger",pakovati:"Pakovanje",tolerancija:"Tolerancija",
  };

  function OptRow({optKey,label,children}){
    var checked=opts[optKey].checked;
    return(
      <div style={{background:checked?"#f0fdf4":"#f8fafc",border:"1.5px solid "+(checked?"#bbf7d0":"#e2e8f0"),borderRadius:10,padding:"10px 14px",marginBottom:6}}>
        <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={function(){updOpt(optKey,"checked",!checked);}}>
          <input type="checkbox" checked={checked} onChange={function(){}} style={{width:16,height:16,accentColor:"#059669",cursor:"pointer"}}/>
          <span style={{fontWeight:700,fontSize:13,color:checked?"#059669":"#64748b",flex:1}}>{label}</span>
          {checked&&ceneOp[optKey]&&<span style={{fontSize:11,color:"#059669",fontWeight:700}}>+{ceneOp[optKey].toFixed(2)} €/1000kom</span>}
        </div>
        {checked&&children&&(
          <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #d1fae5"}}>
            {children}
          </div>
        )}
      </div>
    );
  }

  function Sel({optKey,field,opcije,label}){
    return(
      <div>
        {label&&<label style={{fontSize:9,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:3}}>{label}</label>}
        <select style={inp} value={opts[optKey][field]||""} onChange={function(e){var v=e.target.value;updOpt(optKey,field,v);}}>
          {opcije.map(function(o){return <option key={o} value={o}>{o}</option>;} )}
        </select>
      </div>
    );
  }

  if(nalogKesa){
    return <NalogKesaView nalog={nalogKesa} onClose={function(){setNalogKesa(null);}} msg={msg}/>;
  }

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
        <h2 style={{margin:0,fontSize:20,fontWeight:800}}>🛍️ Kalkulator kese</h2>
        <div style={{display:"flex",gap:6}}>
          {[["lista","📋 Lista"],["nova","➕ Nova kesa"],["kalk","🧮 Kalkulacija"],["pon","📄 Ponuda"],["param","⚙️ Cene"]].map(function(t){
            return <button key={t[0]} onClick={function(){setTab(t[0]);}} style={{padding:"7px 14px",borderRadius:7,border:tab===t[0]?"none":"1px solid #e2e8f0",cursor:"pointer",fontSize:12,fontWeight:700,background:tab===t[0]?"#059669":"#fff",color:tab===t[0]?"#fff":"#64748b"}}>{t[1]}</button>;
          })}
        </div>
      </div>

      {/* LISTA */}
      {tab==="lista"&&(
        <div>
          {kese.length===0?(
            <div style={Object.assign({},card,{textAlign:"center",padding:50,color:"#94a3b8"})}>
              <div style={{fontSize:36,marginBottom:10}}>🛍️</div>
              <div style={{marginBottom:12}}>Nema kesa u bazi.</div>
              <button onClick={function(){setTab("nova");}} style={{padding:"10px 20px",borderRadius:8,border:"none",background:"#059669",color:"#fff",fontWeight:700,cursor:"pointer"}}>+ Dodaj prvu kesu</button>
            </div>
          ):(
            <div style={card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontSize:14,fontWeight:700}}>Baza kesa ({kese.length})</div>
                <button onClick={function(){setTab("nova");setIzabranaKesa(null);setNaziv("");setSirina("");setDuzina("");setKlapna("");setOpts(INIT_OPTS);}} style={{padding:"7px 16px",borderRadius:7,border:"none",background:"#059669",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>+ Nova kesa</button>
              </div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{borderBottom:"2px solid #e2e8f0"}}>
                  {["Naziv","Kupac","Materijal","Dim. (ŠxDxK)","Opcije",""].map(function(h){return <th key={h} style={{padding:"9px 8px",textAlign:"left",color:"#64748b",fontWeight:600}}>{h}</th>;})}
                </tr></thead>
                <tbody>
                  {kese.map(function(k){
                    var opList=k.opcije?Object.keys(k.opcije).filter(function(x){return k.opcije[x].checked;}).slice(0,3):[];
                    return(
                      <tr key={k.id} style={{borderBottom:"1px solid #f1f5f9"}}>
                        <td style={{padding:"9px 8px",fontWeight:700}}>{k.naziv}</td>
                        <td style={{padding:"9px 8px",color:"#64748b"}}>{k.kupac||"—"}</td>
                        <td style={{padding:"9px 8px"}}>{k.materijal||"—"}</td>
                        <td style={{padding:"9px 8px",fontFamily:"monospace",fontSize:12}}>{k.sirina}x{k.duzina}{k.klapna?"+"+k.klapna:""}</td>
                        <td style={{padding:"9px 8px"}}>
                          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                            {opList.map(function(o){return <span key={o} style={{fontSize:9,background:"#dcfce7",color:"#166534",borderRadius:4,padding:"1px 5px",fontWeight:700}}>{LAB[o]||o}</span>;})}
                          </div>
                        </td>
                        <td style={{padding:"9px 8px"}}>
                          <button onClick={function(){ucitajKesu(k);}} style={{padding:"5px 12px",borderRadius:6,border:"none",background:"#059669",color:"#fff",cursor:"pointer",fontSize:11,fontWeight:700}}>Kalkuliši</button>
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

      {/* NOVA KESA */}
      {tab==="nova"&&(
        <div>
          <div style={card}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:14,color:"#059669"}}>📋 Osnovni podaci</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div><label style={lbl}>Naziv kese *</label><input style={inp} value={naziv} onChange={function(e){setNaziv(e.target.value);}} placeholder="npr. Kesa sa klapnom 94x214+32"/></div>
              <div><label style={lbl}>Kupac</label><input style={inp} value={kupac} onChange={function(e){setKupac(e.target.value);}}/></div>
              <div><label style={lbl}>Materijal</label><input style={inp} value={materijal} onChange={function(e){setMaterijal(e.target.value);}} placeholder="npr. OPP30"/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                <div><label style={lbl}>Širina mm</label><input type="number" style={inp} value={sirina} onChange={function(e){setSirina(e.target.value);}}/></div>
                <div><label style={lbl}>Dužina mm</label><input type="number" style={inp} value={duzina} onChange={function(e){setDuzina(e.target.value);}}/></div>
                <div><label style={lbl}>Klapna mm</label><input type="number" style={inp} value={klapna} onChange={function(e){setKlapna(e.target.value);}}/></div>
              </div>
              <div><label style={lbl}>Takta / min</label><input type="number" style={inp} value={takta} onChange={function(e){setTakta(e.target.value);}}/></div>
              <div><label style={lbl}>Ban</label><input type="number" style={inp} value={ban} onChange={function(e){setBan(e.target.value);}}/></div>
            </div>
          </div>

          <div style={card}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:14,color:"#059669"}}>✅ Opcije kese</div>

            <OptRow optKey="duplofan" label="Duplofan traka">
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <Sel optKey="duplofan" field="val" opcije={OPCIJE.duplofan} label="Tip"/>
                <Sel optKey="duplofan" field="pos" opcije={OPCIJE.pozDuplofan} label="Pozicija"/>
              </div>
            </OptRow>
            <OptRow optKey="ukosenaKlapna" label="Ukošena klapna">
              <Sel optKey="ukosenaKlapna" field="val" opcije={OPCIJE.ukosenaKlapna} label="Tip"/>
            </OptRow>
            <OptRow optKey="perfOtkinuti" label="Perforirana za otkinuti na rolni">
              <Sel optKey="perfOtkinuti" field="val" opcije={OPCIJE.perfOtkinuti} label="Tip perforacije"/>
            </OptRow>
            <OptRow optKey="otvorDno" label="Otvor na dnu kese"/>
            <OptRow optKey="faltaDno" label="Falta na dnu"/>
            <OptRow optKey="varDno" label="Var na dnu"/>
            <OptRow optKey="stampa" label="Štampa">
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <Sel optKey="stampa" field="val" opcije={OPCIJE.stampa} label="Tip štampe"/>
                <div>
                  <label style={{fontSize:9,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:3}}>Motiv</label>
                  <input style={inp} value={opts.stampa.motiv||""} onChange={function(e){var v=e.target.value;updOpt("stampa","motiv",v);}} placeholder="Opis motiva..."/>
                </div>
              </div>
            </OptRow>
            <OptRow optKey="eurozumba" label="Eurozumba">
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <Sel optKey="eurozumba" field="val" opcije={OPCIJE.eurozumba} label="Veličina"/>
                <div>
                  <label style={{fontSize:9,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:3}}>Rastojanje od dna (mm)</label>
                  <input type="number" style={inp} value={opts.eurozumba.rastojanje||""} onChange={function(e){var v=e.target.value;updOpt("eurozumba","rastojanje",v);}} placeholder="npr. 9"/>
                </div>
              </div>
            </OptRow>
            <OptRow optKey="utor" label="Utor"/>
            <OptRow optKey="perfVrucim" label="Perforacija vrućim iglama"/>
            <OptRow optKey="okruglaZumba" label="Okrugla zumba">
              <div>
                <label style={{fontSize:9,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:3}}>Veličina i pozicija</label>
                <input style={inp} value={opts.okruglaZumba.velPoz||""} onChange={function(e){var v=e.target.value;updOpt("okruglaZumba","velPoz",v);}} placeholder="npr. dm=6mm NA SREDINI"/>
              </div>
            </OptRow>
            <OptRow optKey="poprecnaPerf" label="Poprečna perforacija"/>
            <OptRow optKey="poprecniVar" label="Poprečni var">
              <div>
                <label style={{fontSize:9,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:3}}>Debljina vara</label>
                <input style={inp} value={opts.poprecniVar.val||""} onChange={function(e){var v=e.target.value;updOpt("poprecniVar","val",v);}} placeholder="npr. 3mm"/>
              </div>
            </OptRow>
            <OptRow optKey="pakZaHranu" label="Pakovanje za hranu"/>
            <OptRow optKey="anleger" label="Anleger">
              <Sel optKey="anleger" field="val" opcije={OPCIJE.anleger} label="Tip anlegera"/>
            </OptRow>
            <OptRow optKey="pakovati" label="Pakovanje">
              <Sel optKey="pakovati" field="val" opcije={OPCIJE.pakovati} label="Način pakovanja"/>
            </OptRow>
            <OptRow optKey="tolerancija" label="Tolerancija u količini">
              <Sel optKey="tolerancija" field="val" opcije={OPCIJE.tolerancija} label="Tolerancija"/>
            </OptRow>
          </div>

          <div style={card}>
            <label style={lbl}>Napomena</label>
            <textarea style={Object.assign({},inp,{height:60,resize:"vertical"})} value={napKese} onChange={function(e){setNapKese(e.target.value);}}/>
          </div>

          <div style={{display:"flex",gap:10}}>
            <button onClick={sacuvajKesu} style={{padding:"10px 20px",borderRadius:8,border:"none",background:"#059669",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>💾 Sacuvaj kesu</button>
            <button onClick={function(){setTab("lista");}} style={{padding:"10px 20px",borderRadius:8,border:"1px solid #e2e8f0",background:"#fff",color:"#64748b",fontWeight:700,fontSize:13,cursor:"pointer"}}>Otkaži</button>
          </div>
        </div>
      )}

      {/* KALKULACIJA */}
      {tab==="kalk"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div>
            <div style={Object.assign({},card,{marginBottom:14})}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>📐 Parametri</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
                <div><label style={lbl}>Širina mm</label><input type="number" style={inp} value={sirina} onChange={function(e){setSirina(e.target.value);}}/></div>
                <div><label style={lbl}>Dužina mm</label><input type="number" style={inp} value={duzina} onChange={function(e){setDuzina(e.target.value);}}/></div>
                <div><label style={lbl}>Klapna mm</label><input type="number" style={inp} value={klapna} onChange={function(e){setKlapna(e.target.value);}}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><label style={lbl}>Cena mat. EUR/kg</label><input type="number" style={inp} value={cenaKg} step={0.1} onChange={function(e){setCenaKg(e.target.value);}}/></div>
                <div><label style={lbl}>Količina (kom)</label><input type="number" style={inp} value={kol} onChange={function(e){setKol(e.target.value);}}/></div>
                <div><label style={lbl}>Škart %</label><input type="number" style={inp} value={sk} onChange={function(e){setSk(e.target.value);}}/></div>
                <div><label style={lbl}>Marža %</label><input type="number" style={inp} value={mar} onChange={function(e){setMar(e.target.value);}}/></div>
              </div>
            </div>
            <div style={card}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:10}}>✅ Aktivne opcije</div>
              {Object.keys(opts).filter(function(k){return opts[k].checked;}).length===0?(
                <div style={{color:"#94a3b8",fontSize:13,textAlign:"center",padding:16}}>Nema čekiranih opcija</div>
              ):(
                Object.keys(opts).filter(function(k){return opts[k].checked;}).map(function(k){
                  return(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",background:"#f0fdf4",borderRadius:7,border:"1px solid #bbf7d0",marginBottom:5,fontSize:12}}>
                      <span style={{fontWeight:600,color:"#166534"}}>✓ {LAB[k]||k}</span>
                      <span style={{color:"#059669",fontWeight:700}}>{ceneOp[k]?"+"+ceneOp[k].toFixed(2)+" €/1000kom":"—"}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div>
            {res?(
              <div style={card}>
                <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>📊 Rezultati</div>
                <div style={{display:"grid",gap:8}}>
                  {[
                    ["Površina kese",f2(res.pov*10000)+" cm²","#64748b"],
                    ["Težina kese",f2(res.kgK*1000)+" g","#64748b"],
                    ["Cena materijala / kesa",eu(res.cenaM),"#64748b"],
                    ["Cena operacija / kesa",eu(res.opKesa),"#f59e0b"],
                    ["Osnovna cena / kesa",eu(res.osnK),"#64748b"],
                    ["Cena sa maržom / kesa",eu(res.cenaMar),"#059669"],
                    ["Ukupno kg materijala",f2(res.ukKg)+" kg","#64748b"],
                    ["Vreme izrade",f2(res.vreme)+" h","#f59e0b"],
                    ["Osnovna cena naloga",eu(res.ukOsn),"#64748b"],
                    ["Cena sa maržom nalog",eu(res.ukMar),"#059669"],
                  ].map(function(x){
                    return(
                      <div key={x[0]} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 12px",background:x[2]==="#059669"?"#f0fdf4":x[2]==="#f59e0b"?"#fffbeb":"#f8fafc",borderRadius:8,border:"1px solid "+(x[2]==="#059669"?"#bbf7d0":x[2]==="#f59e0b"?"#fde68a":"#e2e8f0")}}>
                        <span style={{fontSize:12,color:"#64748b"}}>{x[0]}</span>
                        <span style={{fontSize:14,fontWeight:800,color:x[2]}}>{x[1]}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{display:"flex",gap:8,marginTop:14}}>
                  <button onClick={function(){setPkupac(izabranaKesa&&izabranaKesa.kupac?izabranaKesa.kupac:"");setTab("pon");}} style={{flex:1,padding:"10px",borderRadius:8,border:"none",background:"#059669",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>📄 Kreiraj ponudu</button>
                  <button onClick={function(){setPkupac(izabranaKesa&&izabranaKesa.kupac?izabranaKesa.kupac:"");kreirajNalogeKesa();}} style={{flex:1,padding:"10px",borderRadius:8,border:"none",background:"#0f172a",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>⚡ Kreiraj naloge</button>
                </div>
              </div>
            ):(
              <div style={Object.assign({},card,{textAlign:"center",padding:40,color:"#94a3b8"})}>
                <div style={{fontSize:36,marginBottom:10}}>🧮</div>
                <div>Unesite dimenzije i cenu materijala</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PONUDA */}
      {tab==="pon"&&(
        <div>
          <div style={Object.assign({},card,{marginBottom:14})}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>📄 Podaci za ponudu</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div><label style={lbl}>Kupac *</label><input style={inp} value={pkupac} onChange={function(e){setPkupac(e.target.value);}}/></div>
            </div>
            <div><label style={lbl}>Napomena</label><textarea style={Object.assign({},inp,{height:60,resize:"vertical"})} value={pnap} onChange={function(e){setPnap(e.target.value);}}/></div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={kreirajPonudu} style={{padding:"10px 20px",borderRadius:8,border:"none",background:"#059669",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>📄 Kreiraj ponudu</button>
            <button onClick={kreirajNalogeKesa} style={{padding:"10px 20px",borderRadius:8,border:"none",background:"#0f172a",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>⚡ Kreiraj radne naloge</button>
            {aktivna&&<div style={{padding:"10px 14px",borderRadius:8,background:"#f0fdf4",border:"1px solid #bbf7d0",color:"#166534",fontSize:12,fontWeight:700}}>✅ Ponuda {aktivna.broj} kreirana!</div>}
          </div>
        </div>
      )}

      {/* CENE OPERACIJA */}
      {tab==="param"&&(
        <div style={card}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:16}}>⚙️ Cene operacija (€ / 1000 kom)</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
            {Object.keys(DEFAULT_CENE).map(function(k){
              return(
                <div key={k}>
                  <label style={lbl}>{LAB[k]||k}</label>
                  <input type="number" step={0.1} style={inp} value={ceneOp[k]} onChange={function(e){var v=+e.target.value;setCeneOp(function(c){return Object.assign({},c,{[k]:v});});}}/>
                </div>
              );
            })}
          </div>
          <div style={{marginTop:14,padding:12,background:"#eff6ff",borderRadius:8,border:"1px solid #bfdbfe",fontSize:12,color:"#1e40af"}}>
            ℹ️ Default: 1.50 €/1000 kom za svaku operaciju.
          </div>
        </div>
      )}
    </div>
  );
}
