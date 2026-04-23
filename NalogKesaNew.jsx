import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

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

export default function NalogKesaView({nalog, onClose, msg}) {
  var [tab, setTab] = useState("mat");
  var [rolne, setRolne] = useState([]);

  // Extract data
  var extra = (nalog.mats && typeof nalog.mats==="object" && !Array.isArray(nalog.mats)) ? nalog.mats : {};
  var n = Object.assign({}, extra, nalog);
  var brN = n.ponBr || "MP-0000";
  var kupac = n.kupac || "—";
  var naziv = n.prod || n.naziv || "—";
  var datum = n.datum || new Date().toLocaleDateString("sr-RS");
  var datumIsp = extra.datumIsp || n.datumIsp || "";
  var kolKom = +(n.kol||0);
  var materijal = extra.materijal || n.materijal || "";
  var sir = +(extra.sirina || n.sir || 0);
  var duz = +(extra.duzina || 0);
  var klp = +(extra.klapna || 0);
  var ik = +(extra.ik || n.ik || sir);
  var takta = +(extra.takta || 100);
  var ban = +(extra.ban || 1);
  var sk = +(extra.sk || n.sk || 10);
  var opts = extra.opcije || {};
  var zaRadM = ik>0 ? Math.round(kolKom/(takta*ban)*60/60*ik/1000) : 0;
  var vremeH = takta>0 && ban>0 ? +(kolKom/takta/ban/60).toFixed(2) : 0;

  // Idealna sirina = (sirina + klapna) * 2 + margine
  var idealnaStr = ik || Math.round((sir + klp*2 + 20));

  useEffect(function(){
    if(!idealnaStr) return;
    supabase.from("magacin").select("*")
      .gte("sirina", idealnaStr).lte("sirina", idealnaStr+25)
      .neq("status","Iskorišćeno")
      .order("sirina")
      .then(function(r){ setRolne(r.data||[]); });
  },[idealnaStr]);

  function nadjiRolnu(tip) {
    if(!tip) return null;
    var base = tip.split(" ")[0].toUpperCase();
    return rolne.find(function(r){ return r.tip&&r.tip.toUpperCase().startsWith(base); });
  }

  var rolna = nadjiRolnu(materijal);
  
  var TABOVI = [
    {k:"mat", l:"📦 Materijal", boja:"#1e3a5f", suffix:"-7"},
    {k:"kes", l:"🛍️ Kesičarenje", boja:"#059669", suffix:"-K"},
    {k:"rez", l:"✂️ Rezanje", boja:"#1a2e1a", suffix:"-4"},
  ];

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",zIndex:9999,display:"flex",flexDirection:"column"}}>
      <div style={{background:"#0f172a",padding:"10px 16px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <button onClick={onClose} style={{padding:"7px 16px",borderRadius:7,border:"none",background:"#334155",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}}>← Nazad</button>
        <div style={{color:"#fff",fontWeight:700,fontSize:15}}>🛍️ {naziv} &nbsp;·&nbsp; {kupac}</div>
        <div style={{marginLeft:"auto"}}>
          <button onClick={function(){window.print();}} style={{padding:"7px 16px",borderRadius:7,border:"none",background:"#059669",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}}>🖨️ Štampaj A4</button>
        </div>
      </div>

      <div style={{background:"#1e293b",padding:"8px 16px 0",display:"flex",gap:4,flexShrink:0}}>
        {TABOVI.map(function(t){
          return <button key={t.k} onClick={function(){setTab(t.k);}}
            style={{padding:"8px 16px",borderRadius:"8px 8px 0 0",border:"none",cursor:"pointer",fontSize:12,fontWeight:700,
              background:tab===t.k?"#f1f5f9":"transparent",color:tab===t.k?"#0f172a":"#94a3b8"}}>{t.l}</button>;
        })}
      </div>

      <div style={{flex:1,overflow:"auto",background:"#f1f5f9",padding:20}}>

        {/* ===== MATERIJAL ===== */}
        {tab==="mat" && (
          <Kartica>
            <Hdr naslov="Nalog za materijal — Kese" brN={brN} suffix="-7" boja="#1e3a5f" kupac={kupac} datum={datum} datumIsp={datumIsp}/>
            <Sec title="Identifikacija">
              <Grid n={4} mb={8}>
                <Polje label="Radni nalog br." val={brN} boja="plava"/>
                <Polje label="Datum" val={datum}/>
                <Polje label="Datum isporuke" val={datumIsp} boja="zuta"/>
                <Polje label="Kupac" val={kupac}/>
              </Grid>
              <Polje label="Naziv kese" val={naziv}/>
            </Sec>

            <Sec title="Dimenzije kese" boja="#1e3a5f">
              <Grid n={4} mb={8}>
                <Polje label="Širina (mm)" val={sir+"mm"} boja="plava"/>
                <Polje label="Dužina (mm)" val={duz+"mm"} boja="plava"/>
                <Polje label="Klapna (mm)" val={klp?""+klp+"mm":"—"} boja="plava"/>
                <Polje label="Idealna šir. mat." val={idealnaStr+"mm"} boja="zelena"/>
              </Grid>
              <Grid n={4}>
                <Polje label="Materijal" val={materijal}/>
                <Polje label="Takta/min" val={takta}/>
                <Polje label="Ban" val={ban}/>
                <Polje label="Vreme izrade" val={vremeH>0?vremeH+"h":"—"} boja="zuta"/>
              </Grid>
            </Sec>

            <Sec title={"Rolna iz magacina — idealna širina: "+idealnaStr+"mm (±25mm)"} boja="#059669">
              <RolnaRed sirina={idealnaStr} tip={materijal}
                rolna={rolna?rolna.br_rolne:""} metraza={rolna?rolna.metraza_ost||rolna.metraza:0}
                lokacija={rolna?rolna.palet||rolna.sch||"—":""} ima={!!rolna}/>
              {rolne.length>1 && (
                <div style={{fontSize:10,color:"#64748b",marginTop:4}}>
                  Ostale dostupne: {rolne.slice(1,4).map(function(r){return r.br_rolne+" ("+r.sirina+"mm)";}).join(", ")}
                </div>
              )}
            </Sec>

            <Sec title="Količine">
              <Grid n={4}>
                <Polje label="Naručeno (kom)" val={(kolKom||0).toLocaleString()}/>
                <Polje label="Za rad (m mat.)" val={zaRadM>0?zaRadM.toLocaleString()+"m":"—"} boja="zuta"/>
                <Polje label="Škart %" val={sk+"%"}/>
                <Polje label="Takta × Ban" val={takta+" × "+ban+" = "+(takta*ban)+" kom/min"}/>
              </Grid>
            </Sec>

            <Sec title="Napomena">
              <div style={{padding:8,background:"#f8fafc",borderRadius:5,border:"1px solid #e2e8f0",minHeight:40,fontSize:12,color:"#64748b"}}>
                {n.nap||"Proveriti stanje i kvalitet materijala pre puštanja u produkciju."}
              </div>
            </Sec>
            <Potpis/>
          </Kartica>
        )}

        {/* ===== KESIČARENJE ===== */}
        {tab==="kes" && (
          <Kartica>
            <Hdr naslov="Nalog za kesičarenje" brN={brN} suffix="-K" boja="#059669" kupac={kupac} datum={datum} datumIsp={datumIsp}/>
            <Sec title="Identifikacija">
              <Grid n={3} mb={8}>
                <Polje label="Radni nalog br." val={brN} boja="plava"/>
                <Polje label="Kupac" val={kupac}/>
                <Polje label="Datum isporuke" val={datumIsp} boja="zuta"/>
              </Grid>
              <Polje label="Naziv kese" val={naziv}/>
            </Sec>

            <Sec title="Tehničke dimenzije kese" boja="#059669">
              <Grid n={4} mb={8}>
                <Polje label="Širina kese (mm)" val={sir} boja="plava"/>
                <Polje label="Dužina kese (mm)" val={duz} boja="plava"/>
                <Polje label="Klapna (mm)" val={klp||"—"} boja="plava"/>
                <Polje label="Materijal" val={materijal}/>
              </Grid>
              <Grid n={4}>
                <Polje label="Idealna šir. rolne" val={idealnaStr+"mm"} boja="zelena"/>
                <Polje label="Takta/min" val={takta}/>
                <Polje label="Ban" val={ban}/>
                <Polje label="Vreme izrade" val={vremeH+"h"} boja="zuta"/>
              </Grid>
            </Sec>

            <Sec title="Opcije kese" boja="#059669">
              <div style={{padding:"8px 0",flexWrap:"wrap",display:"flex"}}>
                <OpcijaChip label="Duplofan" val={opts.duplofan&&opts.duplofan.checked?opts.duplofan.val:null}/>
                <OpcijaChip label="Eurozumba" val={opts.eurozumba&&opts.eurozumba.checked?opts.eurozumba.val:null}/>
                <OpcijaChip label="Štampa" val={opts.stampa&&opts.stampa.checked?opts.stampa.val:null}/>
                <OpcijaChip label="Ukošena klapna" val={opts.ukosenaKlapna&&opts.ukosenaKlapna.checked?opts.ukosenaKlapna.val:null}/>
                <OpcijaChip label="Otvor na dnu" val={opts.otvorDno&&opts.otvorDno.checked?"DA":null}/>
                <OpcijaChip label="Falta na dnu" val={opts.faltaDno&&opts.faltaDno.checked?"DA":null}/>
                <OpcijaChip label="Var na dnu" val={opts.varDno&&opts.varDno.checked?"DA":null}/>
                <OpcijaChip label="Okrugla zumba" val={opts.okruglaZumba&&opts.okruglaZumba.checked?opts.okruglaZumba.velPoz||"DA":null}/>
                <OpcijaChip label="Poprečna perf." val={opts.poprecnaPerf&&opts.poprecnaPerf.checked?"DA":null}/>
                <OpcijaChip label="Poprečni var" val={opts.poprecniVar&&opts.poprecniVar.checked?opts.poprecniVar.val:null}/>
                <OpcijaChip label="Anleger" val={opts.anleger&&opts.anleger.checked?opts.anleger.val:null}/>
                <OpcijaChip label="Pakovanje" val={opts.pakovati&&opts.pakovati.checked?opts.pakovati.val:null}/>
                <OpcijaChip label="Tolerancija" val={opts.tolerancija&&opts.tolerancija.checked?opts.tolerancija.val:null}/>
                <OpcijaChip label="Pak. za hranu" val={opts.pakZaHranu&&opts.pakZaHranu.checked?"DA":null}/>
              </div>
              {opts.stampa&&opts.stampa.checked&&opts.stampa.motiv&&(
                <div style={{fontSize:11,color:"#64748b",marginTop:4}}>Motiv štampe: <b>{opts.stampa.motiv}</b></div>
              )}
              {opts.eurozumba&&opts.eurozumba.checked&&opts.eurozumba.rastojanje&&(
                <div style={{fontSize:11,color:"#64748b",marginTop:4}}>Rastojanje eurozumbe od dna: <b>{opts.eurozumba.rastojanje}mm</b></div>
              )}
            </Sec>

            <Sec title="Količine">
              <Grid n={3}>
                <Polje label="Naručena kol. (kom)" val={(kolKom||0).toLocaleString()} boja="plava"/>
                <Polje label="Sa škartom (kom)" val={Math.round(kolKom*(1+sk/100)).toLocaleString()} boja="zuta"/>
                <Polje label="Procenjeno vreme" val={vremeH+"h"} boja="zelena"/>
              </Grid>
            </Sec>

            <Sec title="Napomena radniku / Napomena operatera">
              <Grid n={2}>
                <div style={{padding:8,background:"#f8fafc",borderRadius:5,border:"1px solid #e2e8f0",fontSize:12,color:"#64748b",minHeight:44}}>
                  {n.nap||"Čvrsti savovi, bez vlakana po ivicama. Kese ne smeju biti savijene. Pakovati ravno."}
                </div>
                <div style={{padding:8,background:"#fffbeb",borderRadius:5,border:"1px dashed #fde68a",fontSize:12,color:"#92400e",minHeight:44}}>
                  Operater upisuje zapažanja...
                </div>
              </Grid>
            </Sec>
            <Potpis/>
          </Kartica>
        )}

        {/* ===== REZANJE ===== */}
        {tab==="rez" && (
          <Kartica>
            <Hdr naslov="Nalog za rezanje — Kese" brN={brN} suffix="-4" boja="#1a2e1a" kupac={kupac} datum={datum} datumIsp={datumIsp}/>
            <Sec title="Identifikacija">
              <Grid n={4} mb={8}>
                <Polje label="Radni nalog br." val={brN} boja="plava"/>
                <Polje label="Datum" val={datum}/>
                <Polje label="Kupac" val={kupac}/>
                <Polje label="Naziv kese" val={naziv}/>
              </Grid>
            </Sec>

            <Sec title="Parametri rezanja" boja="#1a2e1a">
              <Grid n={4} mb={8}>
                <Polje label="Materijal" val={materijal}/>
                <Polje label="Šir. matične rolne" val={idealnaStr+"mm"} boja="plava"/>
                <Polje label="Vrsta sečiva" val="Žilet"/>
                <Polje label="Korona tretman" val="Ne"/>
              </Grid>
              <Grid n={4}>
                <Polje label="Šir. kese (mm)" val={sir}/>
                <Polje label="Duz. kese (mm)" val={duz}/>
                <Polje label="Naručeno (kom)" val={(kolKom||0).toLocaleString()}/>
                <Polje label="Za rad mat. (m)" val={zaRadM>0?zaRadM.toLocaleString()+"m":"—"} boja="zuta"/>
              </Grid>
            </Sec>

            <Sec title="Pakovanje finalnog proizvoda">
              <Grid n={4} mb={8}>
                <Polje label="Pakovanje" val={opts.pakovati&&opts.pakovati.checked?opts.pakovati.val:"U bunt"}/>
                <Polje label="Tolerancija" val={opts.tolerancija&&opts.tolerancija.checked?opts.tolerancija.val:"±10%"}/>
                <Polje label="Obeležavanje" val="Etiketa na svakom buntu"/>
                <Polje label="Paleta" val="Euro paleta"/>
              </Grid>
            </Sec>

            <Sec title="Napomena / Napomena operatera">
              <Grid n={2}>
                <div style={{padding:8,background:"#f8fafc",borderRadius:5,border:"1px solid #e2e8f0",fontSize:12,color:"#64748b",minHeight:44}}>
                  {n.nap||"—"}
                </div>
                <div style={{padding:8,background:"#fffbeb",borderRadius:5,border:"1px dashed #fde68a",fontSize:12,color:"#92400e",minHeight:44}}>
                  Operater upisuje...
                </div>
              </Grid>
            </Sec>
            <Potpis/>
          </Kartica>
        )}
      </div>
    </div>
  );
}
