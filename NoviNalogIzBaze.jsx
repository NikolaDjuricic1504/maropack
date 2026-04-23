import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";
import NalogFolija from "./NalogFolija.jsx";
import NalogKesaView from "./NalogKesaNew.jsx";

var dnow = function() { return new Date().toLocaleDateString("sr-RS"); };

function RolnePregled({ik, mats}) {
  var [rolne, setRolne] = useState([]);
  useEffect(function(){
    if(!ik) return;
    supabase.from("magacin").select("br_rolne,tip,sirina,metraza_ost,metraza,palet,sch,status")
      .gte("sirina", +ik).lte("sirina", +ik+25)
      .neq("status","Iskorišćeno")
      .order("sirina").limit(8)
      .then(function(r){ setRolne(r.data||[]); });
  },[ik]);

  if(!ik) return null;
  return (
    <div style={{marginTop:10}}>
      <div style={{fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",marginBottom:6}}>
        Rolne u magacinu {ik}–{+ik+25}mm
      </div>
      {rolne.length===0?(
        <div style={{fontSize:11,padding:"6px 10px",background:"#fef2f2",color:"#991b1b",borderRadius:5,border:"1px solid #fecaca"}}>
          ⚠️ Nema dostupnih rolni u ovom opsegu!
        </div>
      ):rolne.map(function(r){
        return (
          <div key={r.id} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 10px",background:"#f0fdf4",borderRadius:5,border:"1px solid #bbf7d0",marginBottom:3}}>
            <span style={{fontSize:10,fontWeight:700,color:"#166534"}}>{r.br_rolne}</span>
            <span style={{fontSize:10,color:"#64748b",flex:1}}>{r.tip} · {r.sirina}mm · {(r.metraza_ost||r.metraza||0).toLocaleString()}m</span>
            <span style={{fontSize:10,color:"#94a3b8"}}>{r.palet||r.sch||"—"}</span>
          </div>
        );
      })}
    </div>
  );
}

function RezFormatEditor({formati, setFormati, inp, lbl, sir}) {
  var SLOVA = ["I","II","III","IV","V","VI"];
  var ukupno = formati.reduce(function(s,f){ return s+(+f.sirina||0); },0);

  function dodaj() { setFormati([...formati, {sirina:"",metraza:"",brRolni:"",naziv:"",napomena:"",izlaz:"Magacin GP"}]); }
  function ukloni(i) { setFormati(formati.filter(function(_,j){return j!==i;})); }
  function upd(i,k,v) { setFormati(formati.map(function(f,j){return j===i?Object.assign({},f,{[k]:v}):f;})); }

  return (
    <div>
      <div style={{fontSize:11,color:"#64748b",marginBottom:8}}>
        Matična rolna: <b>{sir}mm</b> &nbsp;·&nbsp; Suma formata: <b style={{color:ukupno>sir?"#ef4444":"#059669"}}>{ukupno}mm</b> &nbsp;·&nbsp; Otpad: <b>{Math.max(0,sir-ukupno)}mm</b>
      </div>
      {formati.map(function(f,i){
        return (
          <div key={i} style={{display:"grid",gridTemplateColumns:"50px 80px 100px 70px 1fr 110px 28px",gap:6,marginBottom:6,alignItems:"end"}}>
            <div style={{fontSize:12,fontWeight:700,color:"#1d4ed8",paddingBottom:6}}>Fmt {SLOVA[i]}</div>
            <div><label style={lbl}>Širina mm</label><input type="number" style={inp} value={f.sirina} onChange={function(e){var v=e.target.value;upd(i,"sirina",v);}}/></div>
            <div><label style={lbl}>Metraža m</label><input type="number" style={inp} value={f.metraza} onChange={function(e){var v=e.target.value;upd(i,"metraza",v);}}/></div>
            <div><label style={lbl}>Br. rolni</label><input type="number" style={inp} value={f.brRolni} onChange={function(e){var v=e.target.value;upd(i,"brRolni",v);}}/></div>
            <div><label style={lbl}>Napomena</label><input style={inp} value={f.napomena} placeholder="npr. za NNTel" onChange={function(e){var v=e.target.value;upd(i,"napomena",v);}}/></div>
            <div><label style={lbl}>Izlaz</label>
              <select style={inp} value={f.izlaz} onChange={function(e){var v=e.target.value;upd(i,"izlaz",v);}}>
                <option>Magacin GP</option><option>Isporuka</option><option>Posebna paleta</option><option>Reciklaža</option>
              </select>
            </div>
            <button onClick={function(){ukloni(i);}} style={{padding:"5px",borderRadius:5,border:"1px solid #fecaca",background:"#fef2f2",color:"#ef4444",cursor:"pointer",alignSelf:"end",marginBottom:0}}>✕</button>
          </div>
        );
      })}
      <button onClick={dodaj} style={{padding:"6px 14px",borderRadius:6,border:"1px solid #bfdbfe",background:"#eff6ff",color:"#1d4ed8",cursor:"pointer",fontSize:12,fontWeight:700}}>
        + Dodaj format rezanja
      </button>
    </div>
  );
}

export default function NoviNalogIzBaze({user, db, msg, setPage, inp, card, lbl}) {
  var [pretraga, setPretraga] = useState("");
  var [filterKupac, setFilterKupac] = useState("");
  var [filterTip, setFilterTip] = useState("");
  var [izabran, setIzabran] = useState(null);
  var [forma, setForma] = useState(null);
  var [otvoreniNalog, setOtvoreniNalog] = useState(null);
  var [saving, setSaving] = useState(false);

  var TIP_BOJA = {folija:"#1d4ed8",kesa:"#059669",spulna:"#7c3aed"};
  var TIP_LAB = {folija:"🧮 Folija",kesa:"🛍️ Kesa",spulna:"🔄 Špulna"};

  var kupci = [...new Set((db.proizvodi||[]).map(function(p){return p.kupac;}).filter(Boolean))].sort();

  var filtrirani = (db.proizvodi||[]).filter(function(p){
    return (!filterKupac||p.kupac===filterKupac) &&
           (!filterTip||p.tip===filterTip) &&
           (!pretraga||(p.naziv||"").toLowerCase().includes(pretraga.toLowerCase())||(p.kupac||"").toLowerCase().includes(pretraga.toLowerCase()));
  });

  var poKupcu = {};
  filtrirani.forEach(function(p){ var k=p.kupac||"—"; if(!poKupcu[k])poKupcu[k]=[]; poKupcu[k].push(p); });

  function izaberiProizvod(p) {
    setIzabran(p);
    setForma({
      kupac: p.kupac||"",
      datum: dnow(),
      datumIsp: "",
      kol: "",
      sk: 10,
      grafika: "Nov posao",
      stm: "Flexo",
      brBoja: "4",
      smer: "Desno",
      obimValjka: "",
      hilzna: "76",
      tipPerf: "",
      oblikPerf: "Fina (mikro)",
      razmakPerf: "",
      brzinaPerf: "120",
      secivo: "Žilet",
      stranaRez: "Štampa spolja",
      rezBrTraka: "",
      precnikRolne: "do 600mm",
      duzinaRolne: "5000",
      korona: "Ne",
      obelezavanje: "Crvena traka",
      pakovanjeRolni: "Svaka pojedinačno, uviti u foliju",
      paleta: "Euro paleta",
      tipLepka: "PU solventni",
      lepakOdnos: "3:1",
      lepakNanos: "3,5",
      rezFormati: [],
      nap: "",
      nalozi: {mat:true, stm:false, kas:(p.mats||[]).length>1, prf:false, rez:true},
    });
  }

  function setF(key, val) { setForma(function(f){ return Object.assign({},f,{[key]:val}); }); }
  function setNalog(key, val) { setForma(function(f){ return Object.assign({},f,{nalozi:Object.assign({},f.nalozi,{[key]:val})}); }); }

  async function kreirajNaloge() {
    if(!izabran||!forma.kol||!forma.kupac||!forma.datumIsp) {
      msg("Unesite kupca, količinu i datum isporuke!","err"); return;
    }
    setSaving(true);
    try {
      var brN = "MP-"+new Date().getFullYear()+"-"+String(Math.floor(Math.random()*9000)+1000);
      var zaRad = Math.round(+forma.kol*(1+(+forma.sk/100)));

      var nalogData = {
        datumIsp:forma.datumIsp, sk:+forma.sk,
        mats:izabran.mats||[], sir:+(izabran.sir||0), ik:+(izabran.ik||izabran.sir||0),
        grafika:forma.grafika, stm:forma.stm, brBoja:forma.brBoja, smer:forma.smer,
        obimValjka:forma.obimValjka, hilzna:forma.hilzna,
        tipPerf:forma.tipPerf, oblikPerf:forma.oblikPerf,
        razmakPerf:forma.razmakPerf, brzinaPerf:forma.brzinaPerf,
        secivo:forma.secivo, stranaRez:forma.stranaRez,
        rezBrTraka:forma.rezBrTraka, precnikRolne:forma.precnikRolne,
        duzinaRolne:forma.duzinaRolne, korona:forma.korona,
        obelezavanje:forma.obelezavanje, pakovanjeRolni:forma.pakovanjeRolni,
        paleta:forma.paleta, tipLepka:forma.tipLepka,
        lepakOdnos:forma.lepakOdnos, lepakNanos:forma.lepakNanos,
        rezFormati:forma.rezFormati,
      };

      var baza = {
        ponBr:brN, kupac:forma.kupac, prod:izabran.naziv,
        tip:izabran.tip||"folija", kol:+forma.kol,
        datum:forma.datum, status:"Ceka", ko:user.ime,
        nap:forma.nap,
        mats:nalogData,
        res:nalogData,
      };

      var NAZIVI = {mat:"Nalog za materijal",stm:"Nalog za stampu",kas:"Nalog za kasiranje",prf:"Nalog za perforaciju",rez:"Nalog za rezanje"};
      var inserts = Object.keys(forma.nalozi).filter(function(k){return forma.nalozi[k];}).map(function(k){
        return Object.assign({},baza,{naziv:NAZIVI[k]});
      });

      var res = await supabase.from("nalozi").insert(inserts);
      if(res.error) throw res.error;

      msg("✅ Kreirano "+inserts.length+" naloga! Br: "+brN);
      // Pass full data for display including nalogData
      setOtvoreniNalog(Object.assign({}, baza, nalogData, {ponBr:brN}));
      setIzabran(null);
      setForma(null);
    } catch(e) { msg("Greška: "+e.message,"err"); }
    setSaving(false);
  }

  // Otvori prikaz naloga
  if(otvoreniNalog) {
    if(otvoreniNalog.tip==="kesa") {
      return <NalogKesaView nalog={otvoreniNalog} onClose={function(){setOtvoreniNalog(null);}} msg={msg}/>;
    }
    return <NalogFolija nalog={otvoreniNalog} onClose={function(){setOtvoreniNalog(null);}} msg={msg}/>;
  }

  // Forma za kreiranje
  if(izabran && forma) {
    var p = izabran;
    var zaRad = forma.kol ? Math.round(+forma.kol*(1+(+forma.sk/100))) : 0;
    var ik = +(p.ik||p.sir||0);

    return (
      <div>
        <div style={{display:"flex",gap:10,marginBottom:18,alignItems:"center"}}>
          <button onClick={function(){setIzabran(null);setForma(null);}} style={{padding:"8px 16px",borderRadius:8,border:"1.5px solid #1d4ed8",background:"transparent",color:"#1d4ed8",cursor:"pointer",fontWeight:700,fontSize:13}}>← Nazad</button>
          <h2 style={{margin:0,fontSize:18,fontWeight:800}}>⚡ Kreiraj naloge — {p.naziv}</h2>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {/* LEVO */}
          <div>
            {/* Info o proizvodu */}
            <div style={Object.assign({},card,{marginBottom:14})}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:12,color:"#1d4ed8"}}>📦 Izabrani proizvod</div>
              <div style={{background:"#f0f9ff",borderRadius:8,padding:12,marginBottom:10}}>
                <div style={{fontSize:15,fontWeight:800,color:"#1d4ed8",marginBottom:4}}>{p.naziv}</div>
                <div style={{fontSize:12,color:"#64748b",marginBottom:8}}>Kupac: {p.kupac}</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {p.sir&&<span style={{fontSize:11,background:"#dbeafe",color:"#1e40af",borderRadius:4,padding:"2px 8px"}}>Š: {p.sir}mm</span>}
                  {ik&&<span style={{fontSize:11,background:"#f0fdf4",color:"#166534",borderRadius:4,padding:"2px 8px"}}>Idealna: {ik}mm</span>}
                  {(p.mats||[]).map(function(m,i){
                    return <span key={i} style={{fontSize:11,background:"#f5f3ff",color:"#5b21b6",borderRadius:4,padding:"2px 8px"}}>{m.tip} {m.deb}mic</span>;
                  })}
                </div>
              </div>
              <RolnePregled ik={ik} mats={p.mats||[]}/>
            </div>

            {/* Nalozi */}
            <div style={card}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>📋 Koje naloge kreirati</div>
              {[
                {k:"mat",l:"Nalog za materijal",i:"📦",suffix:"-7"},
                {k:"stm",l:"Nalog za štampu",i:"🖨️",suffix:"-2"},
                {k:"kas",l:"Nalog za kaširanje",i:"🔗",suffix:"-3"},
                {k:"prf",l:"Nalog za perforaciju",i:"🔵",suffix:"-5"},
                {k:"rez",l:"Nalog za rezanje",i:"✂️",suffix:"-4"},
              ].map(function(n){
                var ch = forma.nalozi[n.k];
                return (
                  <div key={n.k} onClick={function(){setNalog(n.k,!ch);}}
                    style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,border:"1.5px solid "+(ch?"#1d4ed8":"#e2e8f0"),background:ch?"#eff6ff":"#f8fafc",cursor:"pointer",marginBottom:6}}>
                    <input type="checkbox" checked={ch} onChange={function(){}} style={{width:16,height:16,accentColor:"#1d4ed8"}}/>
                    <span style={{fontSize:16}}>{n.i}</span>
                    <span style={{fontWeight:700,fontSize:13,color:ch?"#1d4ed8":"#64748b",flex:1}}>{n.l}</span>
                    <span style={{fontSize:10,background:"#f1f5f9",color:"#64748b",borderRadius:4,padding:"1px 6px",fontFamily:"monospace"}}>{n.suffix}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DESNO */}
          <div>
            {/* Osnovni podaci */}
            <div style={Object.assign({},card,{marginBottom:14})}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:12,color:"#059669"}}>📅 Podaci naloga</div>
              <div style={{display:"grid",gap:10}}>
                <div><label style={lbl}>Kupac *</label><input style={inp} value={forma.kupac} onChange={function(e){setF("kupac",e.target.value);}}/></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><label style={lbl}>Datum porudžbine</label><input style={inp} value={forma.datum} onChange={function(e){setF("datum",e.target.value);}}/></div>
                  <div><label style={lbl}>Datum isporuke *</label><input style={inp} value={forma.datumIsp} placeholder="npr. 16.05.2026." onChange={function(e){setF("datumIsp",e.target.value);}}/></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><label style={lbl}>Naručena kol. (m) *</label><input type="number" style={inp} value={forma.kol} placeholder="npr. 22000" onChange={function(e){setF("kol",e.target.value);}}/></div>
                  <div><label style={lbl}>Škart %</label><input type="number" style={inp} value={forma.sk} onChange={function(e){setF("sk",e.target.value);}}/></div>
                </div>
                {zaRad>0&&(
                  <div style={{padding:10,background:"#fef3c7",borderRadius:8,border:"1px solid #fde68a",fontSize:12}}>
                    ⚠️ Za rad: <b>{zaRad.toLocaleString()} m</b> (naručeno × {(1+(+forma.sk/100)).toFixed(2)})
                  </div>
                )}
                <div><label style={lbl}>Grafičko rešenje</label>
                  <select style={inp} value={forma.grafika} onChange={function(e){setF("grafika",e.target.value);}}>
                    <option>Nov posao</option><option>Posao sa izmenama</option><option>Ponavljanje</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stampa */}
            {forma.nalozi.stm && (
              <div style={Object.assign({},card,{marginBottom:14})}>
                <div style={{fontSize:13,fontWeight:700,marginBottom:10,color:"#7c3aed"}}>🖨️ Parametri štampe</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><label style={lbl}>Vrsta štampe</label>
                    <select style={inp} value={forma.stm} onChange={function(e){setF("stm",e.target.value);}}>
                      <option>Flexo</option><option>Rotogravura</option><option>Digitalna</option><option>Bez štampe</option>
                    </select>
                  </div>
                  <div><label style={lbl}>Broj boja</label><input type="number" style={inp} value={forma.brBoja} onChange={function(e){setF("brBoja",e.target.value);}}/></div>
                  <div><label style={lbl}>Obim valjka (mm)</label><input type="number" style={inp} value={forma.obimValjka} onChange={function(e){setF("obimValjka",e.target.value);}}/></div>
                  <div><label style={lbl}>Smer odmotavanja</label>
                    <select style={inp} value={forma.smer} onChange={function(e){setF("smer",e.target.value);}}>
                      <option>Desno</option><option>Levo</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Perforacija */}
            {forma.nalozi.prf && (
              <div style={Object.assign({},card,{marginBottom:14})}>
                <div style={{fontSize:13,fontWeight:700,marginBottom:10,color:"#0891b2"}}>🔵 Parametri perforacije</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><label style={lbl}>Tip perforacije</label>
                    <select style={inp} value={forma.tipPerf} onChange={function(e){setF("tipPerf",e.target.value);}}>
                      <option value="">—</option><option>Poprečna</option><option>Uzdužna</option><option>Kombinovana</option>
                    </select>
                  </div>
                  <div><label style={lbl}>Razmak (mm)</label><input type="number" style={inp} value={forma.razmakPerf} onChange={function(e){setF("razmakPerf",e.target.value);}}/></div>
                  <div><label style={lbl}>Oblik perforacije</label>
                    <select style={inp} value={forma.oblikPerf} onChange={function(e){setF("oblikPerf",e.target.value);}}>
                      <option>Fina (mikro)</option><option>Gruba</option><option>Makro</option>
                    </select>
                  </div>
                  <div><label style={lbl}>Brzina mašine (m/min)</label><input type="number" style={inp} value={forma.brzinaPerf} onChange={function(e){setF("brzinaPerf",e.target.value);}}/></div>
                </div>
              </div>
            )}

            {/* Rezanje */}
            {forma.nalozi.rez && (
              <div style={Object.assign({},card,{marginBottom:14})}>
                <div style={{fontSize:13,fontWeight:700,marginBottom:10,color:"#059669"}}>✂️ Parametri rezanja</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                  <div><label style={lbl}>Vrsta sečiva</label>
                    <select style={inp} value={forma.secivo} onChange={function(e){setF("secivo",e.target.value);}}>
                      <option>Žilet</option><option>Nož</option>
                    </select>
                  </div>
                  <div><label style={lbl}>Br. traka</label><input type="number" style={inp} value={forma.rezBrTraka} onChange={function(e){setF("rezBrTraka",e.target.value);}}/></div>
                  <div><label style={lbl}>Dužina fin. rolne (m)</label><input type="number" style={inp} value={forma.duzinaRolne} onChange={function(e){setF("duzinaRolne",e.target.value);}}/></div>
                </div>
                <RezFormatEditor formati={forma.rezFormati} setFormati={function(v){setF("rezFormati",v);}} inp={inp} lbl={lbl} sir={+(p.sir||0)}/>
              </div>
            )}

            {/* Napomena */}
            <div style={Object.assign({},card,{marginBottom:14})}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>📝 Napomena</div>
              <textarea style={Object.assign({},inp,{height:60,resize:"vertical"})} value={forma.nap} placeholder="Opšta napomena..." onChange={function(e){setF("nap",e.target.value);}}/>
            </div>

            <div style={{display:"flex",gap:10}}>
              <button onClick={kreirajNaloge} disabled={saving}
                style={{flex:1,padding:"13px",borderRadius:8,border:"none",background:"#059669",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",opacity:saving?0.7:1}}>
                {saving?"⏳ Kreiranje...":"⚡ Kreiraj "+Object.values(forma.nalozi).filter(Boolean).length+" naloga"}
              </button>
              <button onClick={function(){setIzabran(null);setForma(null);}}
                style={{padding:"13px 18px",borderRadius:8,border:"1px solid #e2e8f0",background:"#fff",color:"#64748b",fontWeight:700,cursor:"pointer"}}>
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
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
        <h2 style={{margin:0,fontSize:20,fontWeight:800}}>⚡ Kreiraj nalog iz baze</h2>
        <span style={{fontSize:13,color:"#64748b"}}>{filtrirani.length} proizvoda</span>
      </div>

      <div style={Object.assign({},card,{marginBottom:14,padding:"12px 16px"})}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <input style={Object.assign({},inp,{flex:1,minWidth:180})} placeholder="🔍 Pretraži naziv ili kupca..." value={pretraga} onChange={function(e){setPretraga(e.target.value);}}/>
          <select style={Object.assign({},inp,{width:180})} value={filterKupac} onChange={function(e){setFilterKupac(e.target.value);}}>
            <option value="">👤 Svi kupci</option>
            {kupci.map(function(k){return <option key={k} value={k}>{k}</option>;})}
          </select>
          <select style={Object.assign({},inp,{width:140})} value={filterTip} onChange={function(e){setFilterTip(e.target.value);}}>
            <option value="">🏷️ Svi tipovi</option>
            <option value="folija">🧮 Folija</option>
            <option value="kesa">🛍️ Kesa</option>
            <option value="spulna">🔄 Špulna</option>
          </select>
        </div>
      </div>

      {filtrirani.length===0?(
        <div style={Object.assign({},card,{textAlign:"center",padding:50,color:"#94a3b8"})}>
          <div style={{fontSize:36,marginBottom:10}}>📦</div>
          <div style={{marginBottom:12}}>Nema proizvoda u bazi.</div>
          <button onClick={function(){setPage("kalk_folija");}} style={{padding:"10px 20px",borderRadius:8,border:"none",background:"#1d4ed8",color:"#fff",fontWeight:700,cursor:"pointer"}}>+ Dodaj u kalkulator</button>
        </div>
      ):(
        Object.keys(poKupcu).sort().map(function(kup){
          return (
            <div key={kup} style={{marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",background:"#0f172a",borderRadius:"10px 10px 0 0",color:"#fff"}}>
                <span style={{fontSize:16}}>👤</span>
                <span style={{fontWeight:800,fontSize:14}}>{kup}</span>
                <span style={{fontSize:12,color:"#94a3b8"}}>{poKupcu[kup].length} proizvoda</span>
              </div>
              <div style={{background:"#fff",borderRadius:"0 0 10px 10px",border:"1px solid #e2e8f0",borderTop:"none"}}>
                {poKupcu[kup].map(function(p,i){
                  var boja = TIP_BOJA[p.tip]||"#64748b";
                  return (
                    <div key={p.id} style={{display:"flex",gap:12,alignItems:"center",padding:"13px 16px",borderBottom:i<poKupcu[kup].length-1?"1px solid #f1f5f9":"none"}}>
                      <span style={{background:boja+"20",color:boja,borderRadius:6,padding:"3px 10px",fontWeight:700,fontSize:10,flexShrink:0}}>
                        {TIP_LAB[p.tip]||p.tip}
                      </span>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:800,fontSize:14,marginBottom:4}}>{p.naziv}</div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          {p.sir&&<span style={{fontSize:11,color:"#1d4ed8",background:"#eff6ff",borderRadius:4,padding:"1px 6px"}}>Š: {p.sir}mm</span>}
                          {p.ik&&p.ik!==p.sir&&<span style={{fontSize:11,color:"#059669",background:"#f0fdf4",borderRadius:4,padding:"1px 6px"}}>Idealna: {p.ik}mm</span>}
                          {(p.mats||[]).slice(0,3).map(function(m,mi){
                            return <span key={mi} style={{fontSize:11,color:"#5b21b6",background:"#f5f3ff",borderRadius:4,padding:"1px 6px"}}>{m.tip} {m.deb}mic</span>;
                          })}
                        </div>
                      </div>
                      <button onClick={function(){izaberiProizvod(p);}}
                        style={{padding:"9px 18px",borderRadius:7,border:"none",background:"#059669",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",whiteSpace:"nowrap"}}>
                        ⚡ Kreiraj nalog
                      </button>
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
