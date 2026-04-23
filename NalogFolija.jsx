import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

var QR = function(val) {
  return "https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=" + encodeURIComponent(val);
};

var f = function(v) { return (+v||0).toLocaleString("sr-RS"); };

function Hdr({naslov, brN, suffix, boja, kupac, datum, datumIsp}) {
  return (
    <div style={{background:boja,color:"#fff",padding:"12px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",pageBreakInside:"avoid"}}>
      <div>
        <div style={{fontSize:8,color:"#94a3b8",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Maropack d.o.o. — Radni nalog</div>
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
          <img src={QR(window.location.origin+"?nalog="+brN+suffix)} width={80} height={80} alt="QR" style={{display:"block"}}/>
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

function Polje({label, val, boja}) {
  var bg="#f8fafc", cl="#1e293b", bc="#e2e8f0";
  if(boja==="plava"){bg="#eff6ff";cl="#1e40af";bc="#bfdbfe";}
  if(boja==="zelena"){bg="#f0fdf4";cl="#166534";bc="#bbf7d0";}
  if(boja==="zuta"){bg="#fefce8";cl="#854d0e";bc="#fde68a";}
  if(boja==="crvena"){bg="#fef2f2";cl="#991b1b";bc="#fecaca";}
  return (
    <div style={{display:"flex",flexDirection:"column",gap:2}}>
      <div style={{fontSize:9,color:"#94a3b8"}}>{label}</div>
      <div style={{fontSize:12,fontWeight:600,padding:"5px 8px",background:bg,color:cl,borderRadius:5,border:"1px solid "+bc,minHeight:28}}>{val||"—"}</div>
    </div>
  );
}

function Grid({n, children, gap=8, mb=0}) {
  return <div style={{display:"grid",gridTemplateColumns:`repeat(${n},1fr)`,gap,marginBottom:mb}}>{children}</div>;
}

function MatRed({br, tip, deb, sirina, rolna, metraza, lokacija, dostupno}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:"#f8fafc",borderRadius:6,border:"1px solid #e2e8f0",marginBottom:5}}>
      <div style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:4,background:["#eff6ff","#f5f3ff","#fefce8","#fff7ed"][br]||"#f8fafc",color:["#1e40af","#5b21b6","#854d0e","#9a3412"][br]||"#64748b",flexShrink:0}}>
        Mat.{br+1}
      </div>
      <div style={{flex:1}}>
        <span style={{fontWeight:700,fontSize:13}}>{tip} {deb?deb+"mic":""}</span>
        <span style={{fontSize:11,color:"#64748b",marginLeft:6}}>· idealna širina: {sirina}mm</span>
      </div>
      {dostupno ? (
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:11,color:"#166534",fontWeight:700}}>{rolna}</div>
          <div style={{fontSize:10,color:"#64748b"}}>{f(metraza)}m · {lokacija||"—"}</div>
        </div>
      ) : (
        <span style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:"#fef2f2",color:"#991b1b",border:"1px solid #fecaca",fontWeight:700}}>⚠ Nema u magacinu!</span>
      )}
    </div>
  );
}

function Potpis() {
  return (
    <div style={{padding:"8px 16px",background:"#f8fafc",borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",fontSize:10,color:"#94a3b8"}}>
      <span>Nalog izradio: _________________________ &nbsp;&nbsp; Datum: ___________</span>
      <span>Nalog odobrio: _________________________</span>
    </div>
  );
}

function NalogKartica({children}) {
  return (
    <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,overflow:"hidden",marginBottom:24,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
      {children}
    </div>
  );
}

export default function NalogFolija({nalog, onClose, msg}) {
  var [tab, setTab] = useState("mat");
  var [rolne, setRolne] = useState([]);
  var [loading, setLoading] = useState(true);

  // Merge kesaData (JSONB) with nalog root fields
  var d = Object.assign({}, nalog.kesaData||{}, nalog);
  var n = d;
  var brN = d.ponBr || d.br || "MP-0000";
  var kupac = d.kupac || "—";
  var naziv = d.prod || d.naziv || "—";
  var datum = d.datum || new Date().toLocaleDateString("sr-RS");
  var datumIsp = d.datumIsp || "";
  var mats = (d.kesaData && d.kesaData.mats) || d.mats || [];
  var kolM = +(d.kol||0);
  var sk = +((d.kesaData && d.kesaData.sk) || d.sk || 10);
  var zaRad = Math.round(kolM*(1+sk/100));
  var sir = +((d.kesaData && d.kesaData.sir) || d.sir || 0);
  var ik = +((d.kesaData && d.kesaData.ik) || d.ik || sir);

  useEffect(function(){
    if(!ik) { setLoading(false); return; }
    supabase.from("magacin").select("*")
      .gte("sirina", ik)
      .lte("sirina", ik+25)
      .neq("status","Iskorišćeno")
      .order("sirina")
      .then(function(r){ setRolne(r.data||[]); setLoading(false); });
  },[ik]);

  function nadjiRolnu(tip) {
    if(!tip) return null;
    var base = tip.split(" ")[0].toUpperCase();
    return rolne.find(function(r){ return r.tip && r.tip.toUpperCase().startsWith(base); });
  }

  var TABOVI = [
    {k:"mat", l:"📦 Materijal", boja:"#1e3a5f", suffix:"-7"},
    {k:"stm", l:"🖨️ Štampa",    boja:"#1a3a1a", suffix:"-2"},
    {k:"kas", l:"🔗 Kaširanje", boja:"#3a1a1a", suffix:"-3"},
    {k:"prf", l:"🔵 Perforacija",boja:"#1a1a3a", suffix:"-5"},
    {k:"rez", l:"✂️ Rezanje",   boja:"#1a2e1a", suffix:"-4"},
  ];
  var aktTab = TABOVI.find(function(t){return t.k===tab;});

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",zIndex:9999,display:"flex",flexDirection:"column"}}>

      {/* TOP BAR */}
      <div style={{background:"#0f172a",padding:"10px 16px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <button onClick={onClose} style={{padding:"7px 16px",borderRadius:7,border:"none",background:"#334155",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}}>← Nazad</button>
        <div style={{color:"#fff",fontWeight:700,fontSize:15}}>{naziv} &nbsp;·&nbsp; {kupac}</div>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <button onClick={function(){window.print();}} style={{padding:"7px 16px",borderRadius:7,border:"none",background:"#1d4ed8",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}}>🖨️ Štampaj A4</button>
        </div>
      </div>

      {/* TABS */}
      <div style={{background:"#1e293b",padding:"8px 16px 0",display:"flex",gap:4,flexShrink:0}}>
        {TABOVI.map(function(t){
          return (
            <button key={t.k} onClick={function(){setTab(t.k);}}
              style={{padding:"8px 16px",borderRadius:"8px 8px 0 0",border:"none",cursor:"pointer",fontSize:12,fontWeight:700,
                background:tab===t.k?"#f1f5f9":"transparent",
                color:tab===t.k?"#0f172a":"#94a3b8"}}>
              {t.l}
            </button>
          );
        })}
      </div>

      {/* SADRZAJ */}
      <div style={{flex:1,overflow:"auto",background:"#f1f5f9",padding:20}}>

        {/* ========== 1. MATERIJAL ========== */}
        {tab==="mat" && (
          <NalogKartica>
            <Hdr naslov="Nalog za potrebu materijala" brN={brN} suffix="-7" boja="#1e3a5f" kupac={kupac} datum={datum} datumIsp={datumIsp}/>
            <Sec title="Identifikacija">
              <Grid n={4} mb={8}>
                <Polje label="Radni nalog br." val={brN} boja="plava"/>
                <Polje label="Datum izdavanja" val={datum}/>
                <Polje label="Datum isporuke" val={datumIsp} boja="zuta"/>
                <Polje label="Kupac" val={kupac}/>
              </Grid>
              <Polje label="Naziv proizvoda" val={naziv}/>
            </Sec>

            <Sec title={"Materijali — idealna širina: "+ik+"mm, tražim: "+ik+"–"+(ik+25)+"mm u magacinu"} boja="#1e3a5f">
              {loading && <div style={{fontSize:12,color:"#94a3b8",padding:8}}>⏳ Pretražujem magacin...</div>}
              {!loading && mats.length===0 && <div style={{fontSize:12,color:"#94a3b8",padding:8}}>Nema definisanih materijala za ovaj proizvod.</div>}
              {!loading && mats.map(function(m,i){
                var r = nadjiRolnu(m.tip);
                return <MatRed key={i} br={i} tip={m.tip} deb={m.deb} sirina={ik} rolna={r?r.br_rolne:""} metraza={r?r.metraza_ost||r.metraza:0} lokacija={r?r.palet||r.sch:""} dostupno={!!r}/>;
              })}
              {!loading && rolne.length>0 && (
                <div style={{marginTop:8,fontSize:10,color:"#64748b"}}>Sve dostupne rolne u opsegu {ik}–{ik+25}mm: {rolne.map(function(r){return r.br_rolne+" ("+r.sirina+"mm)";}).join(", ")}</div>
              )}
            </Sec>

            <Sec title="Količine">
              <Grid n={4}>
                <Polje label="Poručeno (m)" val={f(kolM)}/>
                <Polje label="Za rad (m)" val={f(zaRad)} boja="zuta"/>
                <Polje label="Škart %" val={sk+"%"}/>
                <Polje label="Širina materijala" val={sir+"mm"} boja="plava"/>
              </Grid>
            </Sec>

            <Sec title="Napomena">
              <div style={{padding:8,background:"#f8fafc",borderRadius:5,border:"1px solid #e2e8f0",minHeight:40,fontSize:12,color:"#64748b"}}>
                {n.nap||"Proveriti stanje i kvalitet materijala pre puštanja u produkciju. Izmeriti debljinu i širinu."}
              </div>
            </Sec>
            <Potpis/>
          </NalogKartica>
        )}

        {/* ========== 2. STAMPA ========== */}
        {tab==="stm" && (
          <NalogKartica>
            <Hdr naslov="Nalog za štampu" brN={brN} suffix="-2" boja="#1a3a1a" kupac={kupac} datum={datum} datumIsp={datumIsp}/>
            <Sec title="Identifikacija">
              <Grid n={4} mb={8}>
                <Polje label="Porudžbenica br." val={brN} boja="plava"/>
                <Polje label="Datum izdavanja" val={datum}/>
                <Polje label="Rok isporuke" val="5 dana od mat." boja="zuta"/>
                <Polje label="Status posla" val={n.grafika||"Nov posao"}/>
              </Grid>
              <Grid n={2}>
                <Polje label="Kupac" val={kupac}/>
                <Polje label="Naziv proizvoda" val={naziv}/>
              </Grid>
            </Sec>

            <Sec title="Specifikacija štampe" boja="#1a3a1a">
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                  <thead>
                    <tr style={{background:"#f8fafc",borderBottom:"1px solid #e2e8f0"}}>
                      {["RB","Naziv proizvoda","Dim. rasklopa","Br. traka/šir.","Materijal","Kol. (m)","Kol. (kg)","Vrsta štampe","Br. boja","Smer"].map(function(h){
                        return <th key={h} style={{padding:"5px 8px",textAlign:"left",color:"#64748b",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{borderBottom:"1px solid #f1f5f9"}}>
                      <td style={{padding:"6px 8px",fontWeight:700}}>1</td>
                      <td style={{padding:"6px 8px"}}>{naziv}</td>
                      <td style={{padding:"6px 8px",fontFamily:"monospace"}}>{sir}×{zaRad}</td>
                      <td style={{padding:"6px 8px"}}>1</td>
                      <td style={{padding:"6px 8px"}}>{mats[0]?mats[0].tip+" "+(mats[0].deb||"")+"mic "+ik+"mm":"—"}</td>
                      <td style={{padding:"6px 8px",color:"#059669",fontWeight:700}}>{f(zaRad)}</td>
                      <td style={{padding:"6px 8px"}}>{mats[0]&&mats[0].deb?Math.round(zaRad*sir/1000*mats[0].deb*0.91/1000)+" kg":"—"}</td>
                      <td style={{padding:"6px 8px",color:"#7c3aed",fontWeight:700}}>{n.stm||"Flexo"}</td>
                      <td style={{padding:"6px 8px"}}>{n.brBoja||"4"}</td>
                      <td style={{padding:"6px 8px"}}>{n.smer||"Desno"}</td>
                    </tr>
                    {[2,3,4].map(function(i){
                      return <tr key={i} style={{borderBottom:"1px solid #f1f5f9"}}>
                        <td style={{padding:"6px 8px",color:"#94a3b8"}}>{i}</td>
                        {Array(9).fill("—").map(function(x,j){return <td key={j} style={{padding:"6px 8px",color:"#94a3b8"}}>{x}</td>;})}
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{fontSize:10,color:"#64748b",marginTop:6}}>Cena usluge: 0,50 €/kg</div>
            </Sec>

            <Sec title="Tehnički parametri">
              <Grid n={4} mb={8}>
                <Polje label="Štamparska mašina" val={n.stmMasina||"Flexo 8-boja"}/>
                <Polje label="Obim valjka (mm)" val={n.obimValjka||"—"}/>
                <Polje label="Strana štampe" val={n.stranaStm||"Spolja"}/>
                <Polje label="Unutr. prečnik hilzne" val={(n.hilzna||"76")+" mm"}/>
              </Grid>
              <Grid n={4}>
                <Polje label="Br. traka po širini" val={n.brTraka||"1"}/>
                <Polje label="Kliše" val={n.klise||"—"}/>
                <Polje label="Print proof" val={n.proof||"—"}/>
                <Polje label="Linijatura" val={n.linijatura||"—"}/>
              </Grid>
            </Sec>

            <Sec title="Opšte napomene">
              <div style={{fontSize:11,color:"#64748b",padding:8,background:"#f8fafc",borderRadius:5,border:"1px solid #e2e8f0"}}>
                Obratiti pažnju na kvalitet štampe. Bez ogrebotina, raspasivanja, prskanja boje. Adhezija adekvatna. Rolne ravno namotane, bez nastavaka. Škart vratiti sa štampanim materijalom.
              </div>
            </Sec>
            <div style={{padding:"5px 16px",background:"#f8fafc",fontSize:10,color:"#94a3b8",borderTop:"1px solid #e2e8f0"}}>
              Kontakt za overu: Marko Savić · m.savic@maropack.rs · 060/381-0123 · Dokument punovažan bez pečata i potpisa.
            </div>
            <Potpis/>
          </NalogKartica>
        )}

        {/* ========== 3. KASIRANJE ========== */}
        {tab==="kas" && (
          <NalogKartica>
            <Hdr naslov="Nalog za kaširanje" brN={brN} suffix="-3" boja="#3a1a1a" kupac={kupac} datum={datum} datumIsp={datumIsp}/>
            <Sec title="Identifikacija">
              <Grid n={4} mb={8}>
                <Polje label="Radni nalog br." val={brN} boja="plava"/>
                <Polje label="Datum izdavanja" val={datum}/>
                <Polje label="Kupac" val={kupac}/>
                <Polje label="Tiraz (m)" val={f(zaRad)}/>
              </Grid>
              <Grid n={2}>
                <Polje label="Naziv proizvoda" val={naziv}/>
                <Polje label="Sastav GP" val={mats.map(function(m){return m.tip+" "+(m.deb||"")+"mic";}).join(" + ")||"—"}/>
              </Grid>
            </Sec>

            {[0,1,2].map(function(kasI){
              var matA = mats[kasI*2];
              var matB = mats[kasI*2+1];
              var aktivan = kasI===0 || (matA&&matB);
              var rolnaA = matA?nadjiRolnu(matA.tip):null;
              var rolnaB = matB?nadjiRolnu(matB.tip):null;
              return (
                <Sec key={kasI} title={(kasI+1)+". kaširanje"+(aktivan?"":" — nije potrebno")} boja="#3a1a1a">
                  <div style={{opacity:aktivan?1:0.4}}>
                    <Grid n={4} mb={8}>
                      <Polje label="Širina nanosa lepka (mm)" val={aktivan?sir:"—"}/>
                      <Polje label="Širina form. valjka (mm)" val={aktivan?(sir+10):"—"}/>
                      <Polje label="Odnos komponenti lepka" val={aktivan?(n.lepakOdnos||"3:1"):"—"}/>
                      <Polje label="Nanos lepka (g/m²)" val={aktivan?(n.lepakNanos||"3,5"):"—"} boja={aktivan?"zuta":""}/>
                    </Grid>
                    <MatRed br={kasI*2} tip={matA?(matA.tip+" "+(matA.deb||"")+"mic"):"—"} sirina={ik}
                      rolna={rolnaA?rolnaA.br_rolne:""} metraza={rolnaA?rolnaA.metraza_ost||rolnaA.metraza:0}
                      lokacija={rolnaA?rolnaA.palet||rolnaA.sch:""} dostupno={aktivan&&!!rolnaA}/>
                    <MatRed br={kasI*2+1} tip={matB?(matB.tip+" "+(matB.deb||"")+"mic"):"—"} sirina={ik}
                      rolna={rolnaB?rolnaB.br_rolne:""} metraza={rolnaB?rolnaB.metraza_ost||rolnaB.metraza:0}
                      lokacija={rolnaB?rolnaB.palet||rolnaB.sch:""} dostupno={aktivan&&!!rolnaB}/>
                  </div>
                </Sec>
              );
            })}

            <Sec title="Parametri kaširanja">
              <Grid n={4}>
                <Polje label="Tip lepka" val={n.tipLepka||"PU solventni"}/>
                <Polje label="Prečnik fin. rolne" val="do 800mm"/>
                <Polje label="Ulaz materijala" val="Magacin"/>
                <Polje label="Izlaz materijala" val="Rezanje"/>
              </Grid>
            </Sec>

            <Sec title="Napomene">
              <div style={{padding:8,background:"#f8fafc",borderRadius:5,border:"1px solid #e2e8f0",minHeight:40,fontSize:12,color:"#64748b"}}>
                {n.nap||"Proveriti adheziju na nastavku svake rolne. Meriti nanos lepka svakih 2.000m. Prečnik finalne rolne max 800mm."}
              </div>
            </Sec>
            <Potpis/>
          </NalogKartica>
        )}

        {/* ========== 4. PERFORACIJA ========== */}
        {tab==="prf" && (
          <NalogKartica>
            <Hdr naslov="Nalog za perforaciju" brN={brN} suffix="-5" boja="#1a1a3a" kupac={kupac} datum={datum} datumIsp={datumIsp}/>
            <Sec title="Identifikacija">
              <Grid n={4}>
                <Polje label="Radni nalog br." val={brN} boja="plava"/>
                <Polje label="Datum" val={datum}/>
                <Polje label="Kupac" val={kupac}/>
                <Polje label="Naziv proizvoda" val={naziv}/>
              </Grid>
            </Sec>

            <Sec title="Parametri perforacije" boja="#1a1a3a">
              <Grid n={4} mb={8}>
                <Polje label="Tip perforacije" val={n.tipPerf||"—"} boja={n.tipPerf?"plava":""}/>
                <Polje label="Oblik perforacije" val={n.oblikPerf||"—"}/>
                <Polje label="Orijentacija" val={n.orjentPerf||"—"}/>
                <Polje label="Razmak (mm)" val={n.razmakPerf||"—"}/>
              </Grid>
              <Grid n={4}>
                <Polje label="Širina materijala" val={sir+"mm"}/>
                <Polje label="Količina (m)" val={f(zaRad)}/>
                <Polje label="Brzina mašine (m/min)" val={n.brzinaPerf||"120"}/>
                <Polje label="Vreme izrade" val={n.brzinaPerf?Math.round(zaRad/+n.brzinaPerf/60*10)/10+"h":"—"} boja="zelena"/>
              </Grid>
            </Sec>

            <Sec title="Kontrola kvaliteta">
              <Grid n={3}>
                <Polje label="Sila kidanja (N)" val="Izmeriti i upisati"/>
                <Polje label="Tačnost razmaka (mm)" val={n.razmakPerf?(n.razmakPerf+" ± 0,5"):"—"}/>
                <Polje label="Vizuelna kontrola" val="Svakih 5.000m"/>
              </Grid>
            </Sec>

            <Sec title="Napomena">
              <div style={{padding:8,background:"#f8fafc",borderRadius:5,border:"1px solid #e2e8f0",minHeight:40,fontSize:12,color:"#64748b"}}>
                {n.nap||"Proveriti silu kidanja na početku i svakih 2.000m. Škart odvojiti i izmeriti."}
              </div>
            </Sec>

            <Sec title="Napomena operatera (upisati po završetku)">
              <div style={{padding:8,background:"#fffbeb",borderRadius:5,border:"1px dashed #fde68a",minHeight:48,fontSize:12,color:"#92400e"}}>&nbsp;</div>
            </Sec>
            <Potpis/>
          </NalogKartica>
        )}

        {/* ========== 5. REZANJE ========== */}
        {tab==="rez" && (
          <NalogKartica>
            <Hdr naslov="Nalog za rezanje" brN={brN} suffix="-4" boja="#1a2e1a" kupac={kupac} datum={datum} datumIsp={datumIsp}/>
            <Sec title="Identifikacija">
              <Grid n={4} mb={8}>
                <Polje label="Radni nalog br." val={brN} boja="plava"/>
                <Polje label="Datum" val={datum}/>
                <Polje label="Kupac" val={kupac}/>
                <Polje label="Kol. za rasecanje" val={f(zaRad)+" m"}/>
              </Grid>
              <Grid n={2}>
                <Polje label="Naziv proizvoda" val={naziv}/>
                <Polje label="Sastav materijala" val={mats.map(function(m){return m.tip+" "+(m.deb||"")+"mic";}).join(" + ")||"—"}/>
              </Grid>
            </Sec>

            <Sec title="Parametri rezanja" boja="#1a2e1a">
              <Grid n={4} mb={8}>
                <Polje label="Vrsta sečiva" val={n.secivo||"Žilet"}/>
                <Polje label="Šir. matične rolne" val={sir+"mm iskoristivo"} boja="plava"/>
                <Polje label="Br. traka" val={n.rezBrTraka||"—"}/>
                <Polje label="Strana namotavanja" val={n.stranaRez||"Štampa spolja"}/>
              </Grid>
              <Grid n={4}>
                <Polje label="Prečnik fin. rolne" val={n.precnikRolne||"do 600mm"}/>
                <Polje label="Dužina fin. rolne" val={(n.duzinaRolne||"5000")+"m"}/>
                <Polje label="Korona tretman" val={n.korona||"Ne"}/>
                <Polje label="Plan. br. rolni" val={n.rezBrTraka&&n.duzinaRolne?Math.ceil(zaRad/+n.duzinaRolne)+" rolni":"—"} boja="zelena"/>
              </Grid>
            </Sec>

            {/* SEMA REZANJA */}
            {n.rezFormati && n.rezFormati.length>0 && (
              <Sec title="Šema rezanja — vizuelni prikaz" boja="#1a2e1a">
                <div style={{display:"flex",gap:3,alignItems:"stretch",marginBottom:10,padding:8,background:"#f8fafc",borderRadius:6,border:"1px solid #e2e8f0"}}>
                  <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:3,padding:"4px 6px",color:"#991b1b",fontSize:9,display:"flex",alignItems:"center",flexShrink:0}}>otpad</div>
                  {n.rezFormati.map(function(fmt,i){
                    var boje=[["#dbeafe","#93c5fd","#1e40af"],["#dcfce7","#86efac","#166534"],["#f3e8ff","#c4b5fd","#5b21b6"],["#fef3c7","#fcd34d","#92400e"]];
                    var b=boje[i%boje.length];
                    return (
                      <div key={i} style={{background:b[0],border:"1px solid "+b[1],borderRadius:3,padding:"5px 10px",color:b[2],fontWeight:700,fontSize:11,textAlign:"center",flex:+(fmt.sirina)||1}}>
                        {"IVII III IV V VI".split(" ")[i] || (i+1)}. — {fmt.sirina}mm
                        <div style={{fontSize:9,fontWeight:400,marginTop:2}}>{fmt.metraza?f(fmt.metraza)+"m":""} {fmt.napomena||""}</div>
                      </div>
                    );
                  })}
                  <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:3,padding:"4px 6px",color:"#991b1b",fontSize:9,display:"flex",alignItems:"center",flexShrink:0}}>otpad</div>
                </div>

                <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                  <thead>
                    <tr style={{background:"#f8fafc",borderBottom:"1px solid #e2e8f0"}}>
                      {["Format","Širina (mm)","Br. naloga","Kupac / Naziv","Metraža (m)","Br. rolni","Hilzna","Izlaz"].map(function(h){
                        return <th key={h} style={{padding:"5px 8px",textAlign:"left",color:"#64748b",fontWeight:600}}>{h}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {n.rezFormati.map(function(fmt,i){
                      return (
                        <tr key={i} style={{borderBottom:"1px solid #f1f5f9"}}>
                          <td style={{padding:"5px 8px",fontWeight:700}}>{"I II III IV V VI".split(" ")[i]}</td>
                          <td style={{padding:"5px 8px"}}>{fmt.sirina}mm</td>
                          <td style={{padding:"5px 8px",color:"#1d4ed8",fontWeight:600}}>{brN}-{"ABCDE"[i]}</td>
                          <td style={{padding:"5px 8px"}}>{kupac} · {fmt.naziv||naziv}</td>
                          <td style={{padding:"5px 8px",color:"#059669",fontWeight:600}}>{fmt.metraza?f(fmt.metraza):"—"}</td>
                          <td style={{padding:"5px 8px",color:"#059669",fontWeight:600}}>{fmt.brRolni||"—"}</td>
                          <td style={{padding:"5px 8px"}}>{(n.hilzna||"76")}mm</td>
                          <td style={{padding:"5px 8px"}}>{fmt.izlaz||"Magacin GP"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Sec>
            )}

            <Sec title="Pakovanje i označavanje">
              <Grid n={4} mb={8}>
                <Polje label="Rolne za isporuku" val={n.rolneIsporuka||"Sa nastavkom"}/>
                <Polje label="Obeležavanje nast." val={n.obelezavanje||"Crvena traka"} boja="zuta"/>
                <Polje label="Pakovanje rolni" val={n.pakovanjeRolni||"Svaka pojedinačno"}/>
                <Polje label="Paleta" val={n.paleta||"Euro paleta"}/>
              </Grid>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {["1. Etiketa u hilznu","2. Etiketa na rolnu","3. Etiketa na omot"].map(function(x){
                  return <span key={x} style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:"#eff6ff",color:"#1e40af",border:"1px solid #bfdbfe"}}>{x}</span>;
                })}
                <span style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:"#f0fdf4",color:"#166534",border:"1px solid #bbf7d0"}}>Na etiketu upisati kilažu rolne</span>
              </div>
            </Sec>

            <Sec title="Napomena / Napomena operatera">
              <Grid n={2}>
                <div style={{padding:8,background:"#f8fafc",borderRadius:5,border:"1px solid #e2e8f0",minHeight:44,fontSize:12,color:"#64748b"}}>
                  {n.nap||"—"}
                </div>
                <div style={{padding:8,background:"#fffbeb",borderRadius:5,border:"1px dashed #fde68a",minHeight:44,fontSize:12,color:"#92400e"}}>
                  Operater upisuje zapažanja...
                </div>
              </Grid>
            </Sec>
            <Potpis/>
          </NalogKartica>
        )}
      </div>
    </div>
  );
}
