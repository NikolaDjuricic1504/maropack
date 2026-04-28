import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

var IKONE = {
  "Nalog za materijal":"📦","Nalog za stampu":"🖨️","Nalog za kasiranje":"🔗",
  "Nalog za rezanje":"✂️","Nalog za perforaciju":"🔵","Nalog za lakiranje":"✨","Nalog za spulne":"🔄",
};

var ZASTOJI = ["Kvar masine","Nema materijala","Ceka prethodni nalog","Promena podesavanja","Pauza radnika","Ostalo"];

function fmt(sec) {
  var h=Math.floor(sec/3600); var m=Math.floor((sec%3600)/60); var s=sec%60;
  return (h>0?h+"h ":"")+m+"min"+(h===0?" "+String(s).padStart(2,"0")+"s":"");
}

function QRModal({nalog, onClose}) {
  var url = window.location.origin + "?nalog=" + nalog.id;
  var qrSrc = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" + encodeURIComponent(url);
  return(
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.6)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#fff",borderRadius:16,padding:28,maxWidth:420,width:"90%",textAlign:"center",boxShadow:"0 25px 60px rgba(0,0,0,0.3)"}}>
        <div style={{fontSize:16,fontWeight:800,marginBottom:4}}>{nalog.naziv}</div>
        <div style={{fontSize:13,color:"#64748b",marginBottom:20}}>{nalog.ponBr} · {nalog.kupac}</div>
        <div style={{border:"3px solid #1d4ed8",borderRadius:12,padding:12,marginBottom:12,display:"inline-block",background:"#fff"}}>
          <img src={qrSrc} alt="QR kod" style={{width:180,height:180,display:"block"}}/>
        </div>
        <div style={{fontSize:11,color:"#94a3b8",marginBottom:6,wordBreak:"break-all",padding:"0 10px"}}>{url}</div>
        <div style={{fontSize:11,color:"#64748b",marginBottom:16}}>Radnik skenira telefonom → START/STOP timer</div>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <button onClick={function(){window.print();}} style={{padding:"10px 20px",borderRadius:8,border:"none",background:"#1d4ed8",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>🖨️ Štampaj</button>
          <button onClick={onClose} style={{padding:"10px 20px",borderRadius:8,border:"1px solid #e2e8f0",background:"#fff",color:"#64748b",fontWeight:700,fontSize:13,cursor:"pointer"}}>Zatvori</button>
        </div>
      </div>
    </div>
  );
}

export default function PracenjeNaloga({db,setDb,card,inp,lbl,msg,user,TIP_BOJA,TIP_LAB}) {
  var [nalozi,setNalozi]=useState([]);
  var [zastoji,setZastoji]=useState([]);
  var [loading,setLoading]=useState(true);
  var [tab,setTab]=useState("live");
  var [filterKupac,setFilterKupac]=useState("");
  var [filterStatus,setFilterStatus]=useState("aktivni");
  var [qrNalog,setQrNalog]=useState(null);
  var [now,setNow]=useState(Date.now());

  useEffect(function(){loadNalozi();loadZastoji();},[]);

  useEffect(function(){
    var t=setInterval(function(){setNow(Date.now());},1000);
    return function(){clearInterval(t);};
  },[]);

  async function loadNalozi(){
    setLoading(true);
    try{
      var res=await supabase.from('nalozi').select('*').order('created_at',{ascending:false});
      if(res.error)throw res.error;
      setNalozi(res.data||[]);
    }catch(e){msg("Greška: "+e.message,"err");}
    setLoading(false);
  }

  async function loadZastoji(){
    try{
      var res=await supabase.from('nalog_zastoji').select('*').order('created_at',{ascending:false});
      if(!res.error)setZastoji(res.data||[]);
    }catch(e){console.error(e);}
  }

  async function promeniStatus(id,status){
    try{
      await supabase.from('nalozi').update({status}).eq('id',id);
      setNalozi(function(prev){return prev.map(function(n){return n.id===id?Object.assign({},n,{status}):n;});});
    }catch(e){msg("Greška!","err");}
  }

  function getElapsed(n){
    if(!n.start_time)return 0;
    if(n.status==="Završeno"&&n.vreme_rada)return n.vreme_rada;
    return Math.floor((now-new Date(n.start_time).getTime())/1000);
  }

  var uToku=nalozi.filter(function(n){return n.status==="U toku";});
  var cekaju=nalozi.filter(function(n){return n.status==="Ceka";});
  var zavrseni=nalozi.filter(function(n){return n.status==="Završeno";});
  var kupci=[...new Set(nalozi.map(function(n){return n.kupac;}).filter(Boolean))].sort();

  var filtrirani=nalozi.filter(function(n){
    var stOk=filterStatus==="aktivni"?n.status!=="Završeno":filterStatus==="zavrseni"?n.status==="Završeno":true;
    return stOk&&(!filterKupac||n.kupac===filterKupac);
  });

  var poPonudi={};
  filtrirani.forEach(function(n){
    var k=n.ponBr||"—";
    if(!poPonudi[k])poPonudi[k]={ponBr:k,kupac:n.kupac,prod:n.prod,tip:n.tip,nalozi:[]};
    poPonudi[k].nalozi.push(n);
  });

  var stBg={"Ceka":"#fffbeb","U toku":"#eff6ff","Završeno":"#f0fdf4"};
  var stCl={"Ceka":"#f59e0b","U toku":"#3b82f6","Završeno":"#059669"};

  return(
    <div>
      {qrNalog&&<QRModal nalog={qrNalog} onClose={function(){setQrNalog(null);}}/>}

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
        <h2 style={{margin:0,fontSize:20,fontWeight:800}}>🔴 Praćenje naloga</h2>
        <div style={{display:"flex",gap:6}}>
          {[["live","🔴 Live"],["lista","📋 Lista"],["izvestaj","📊 Izveštaj"],["zastoji","⏸️ Zastoji"]].map(function(t){
            return <button key={t[0]} onClick={function(){setTab(t[0]);}} style={{padding:"7px 14px",borderRadius:7,border:tab===t[0]?"none":"1px solid #e2e8f0",cursor:"pointer",fontSize:12,fontWeight:700,background:tab===t[0]?"#1d4ed8":"#fff",color:tab===t[0]?"#fff":"#64748b"}}>{t[1]}</button>;
          })}
          <button onClick={loadNalozi} style={{padding:"7px 12px",borderRadius:7,border:"1px solid #e2e8f0",background:"#fff",color:"#64748b",cursor:"pointer",fontSize:12}}>🔄</button>
        </div>
      </div>

      {/* STAT */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:16}}>
        {[["🔴",uToku.length,"U toku","#ef4444"],["⏳",cekaju.length,"Čekaju","#f59e0b"],["✅",zavrseni.length,"Završenih","#059669"],["📋",nalozi.length,"Ukupno","#1d4ed8"]].map(function(x){
          return(
            <div key={x[2]} style={Object.assign({},card,{borderLeft:"4px solid "+x[3],padding:"14px 16px"})}>
              <div style={{fontSize:22,marginBottom:4}}>{x[0]}</div>
              <div style={{fontSize:24,fontWeight:800,color:x[3]}}>{x[1]}</div>
              <div style={{fontSize:11,color:"#64748b"}}>{x[2]}</div>
            </div>
          );
        })}
      </div>

      {/* LIVE */}
      {tab==="live"&&(
        <div>
          {uToku.length>0&&(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:10,color:"#ef4444"}}>🔴 Aktivni nalozi</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:10}}>
                {uToku.map(function(n){
                  var el=getElapsed(n);
                  var h=Math.floor(el/3600); var m=Math.floor((el%3600)/60); var s=el%60;
                  var timerStr=String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
                  return(
                    <div key={n.id} style={{background:"#fff",borderRadius:12,padding:16,border:"2px solid #bfdbfe",boxShadow:"0 2px 8px rgba(59,130,246,0.1)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                        <div>
                          <div style={{fontSize:16}}>{IKONE[n.naziv]||"🔧"} <b>{n.naziv}</b></div>
                          <div style={{fontSize:12,color:"#64748b"}}>{n.ponBr} · {n.kupac}</div>
                        </div>
                        <span style={{background:"#eff6ff",color:"#3b82f6",borderRadius:6,padding:"2px 8px",fontWeight:700,fontSize:10}}>U toku</span>
                      </div>
                      <div style={{fontSize:32,fontWeight:900,color:"#1d4ed8",textAlign:"center",padding:"8px 0",background:"#f0f9ff",borderRadius:8,marginBottom:10,fontVariantNumeric:"tabular-nums"}}>
                        ⏱️ {timerStr}
                      </div>
                      {n.radnik&&<div style={{fontSize:12,color:"#64748b",marginBottom:8}}>👤 {n.radnik}</div>}
                      <div style={{display:"flex",gap:6}}>
                        <button onClick={function(){setQrNalog(n);}} style={{flex:1,padding:"7px",borderRadius:7,border:"none",background:"#1d4ed8",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer"}}>📱 QR</button>
                        <button onClick={function(){promeniStatus(n.id,"Završeno");}} style={{flex:1,padding:"7px",borderRadius:7,border:"none",background:"#059669",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer"}}>✅ Završi</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {cekaju.length>0&&(
            <div>
              <div style={{fontSize:14,fontWeight:700,marginBottom:10,color:"#f59e0b"}}>⏳ Na čekanju ({cekaju.length})</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:8}}>
                {cekaju.map(function(n){
                  return(
                    <div key={n.id} style={{background:"#fff",borderRadius:10,padding:"12px 14px",border:"1px solid #fde68a",display:"flex",gap:10,alignItems:"center"}}>
                      <div style={{fontSize:20}}>{IKONE[n.naziv]||"🔧"}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:13}}>{n.naziv}</div>
                        <div style={{fontSize:11,color:"#64748b"}}>{n.ponBr} · {n.kupac}</div>
                      </div>
                      <div style={{display:"flex",gap:5}}>
                        <button onClick={function(){setQrNalog(n);}} style={{padding:"5px 8px",borderRadius:6,border:"none",background:"#1d4ed8",color:"#fff",fontWeight:700,fontSize:10,cursor:"pointer"}}>📱</button>
                        <button onClick={function(){promeniStatus(n.id,"U toku");}} style={{padding:"5px 8px",borderRadius:6,border:"none",background:"#f59e0b",color:"#fff",fontWeight:700,fontSize:10,cursor:"pointer"}}>▶️</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {uToku.length===0&&cekaju.length===0&&(
            <div style={Object.assign({},card,{textAlign:"center",padding:50,color:"#94a3b8"})}>
              <div style={{fontSize:36,marginBottom:10}}>🎉</div>
              <div>Nema aktivnih naloga.</div>
            </div>
          )}
        </div>
      )}

      {/* LISTA */}
      {tab==="lista"&&(
        <div>
          <div style={Object.assign({},card,{marginBottom:14,padding:"14px 16px"})}>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
              <select style={Object.assign({},inp,{width:170})} value={filterKupac} onChange={function(e){setFilterKupac(e.target.value);}}>
                <option value="">👤 Svi kupci</option>
                {kupci.map(function(k){return <option key={k} value={k}>{k}</option>;})}
              </select>
              <select style={Object.assign({},inp,{width:140})} value={filterStatus} onChange={function(e){setFilterStatus(e.target.value);}}>
                <option value="aktivni">Aktivni</option>
                <option value="zavrseni">Završeni</option>
                <option value="svi">Svi</option>
              </select>
              <div style={{marginLeft:"auto",fontSize:12,color:"#64748b",fontWeight:600}}>{filtrirani.length} naloga</div>
            </div>
          </div>

          {loading?(
            <div style={{textAlign:"center",padding:40,color:"#94a3b8"}}>⏳ Učitavam...</div>
          ):(
            Object.values(poPonudi).map(function(grp){
              var zavr=grp.nalozi.filter(function(n){return n.status==="Završeno";}).length;
              var pct=grp.nalozi.length>0?Math.round(zavr/grp.nalozi.length*100):0;
              return(
                <div key={grp.ponBr} style={{marginBottom:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",background:"#0f172a",borderRadius:"10px 10px 0 0",color:"#fff"}}>
                    <span style={{fontWeight:800}}>{grp.ponBr}</span>
                    <span style={{color:"#94a3b8",fontSize:12}}>{grp.kupac}</span>
                    {grp.tip&&<span style={{background:(TIP_BOJA[grp.tip]||"#64748b")+"30",color:"#94a3b8",borderRadius:4,padding:"1px 7px",fontSize:10,fontWeight:700}}>{TIP_LAB[grp.tip]||"—"}</span>}
                    <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:12,color:"#94a3b8"}}>{zavr}/{grp.nalozi.length}</span>
                      <div style={{width:60,height:5,background:"#334155",borderRadius:3,overflow:"hidden"}}>
                        <div style={{height:"100%",background:"#22c55e",width:pct+"%"}}/>
                      </div>
                      <span style={{fontSize:11,color:"#22c55e"}}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{background:"#fff",border:"1px solid #e2e8f0",borderTop:"none",borderRadius:"0 0 10px 10px",overflow:"hidden"}}>
                    {grp.nalozi.map(function(n,i){
                      var el=getElapsed(n);
                      return(
                        <div key={n.id} style={{display:"flex",gap:12,alignItems:"center",padding:"10px 14px",borderBottom:i<grp.nalozi.length-1?"1px solid #f1f5f9":"none"}}>
                          <div style={{fontSize:18,flexShrink:0}}>{IKONE[n.naziv]||"🔧"}</div>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:600,fontSize:13}}>{n.naziv}</div>
                            {n.radnik&&<div style={{fontSize:11,color:"#64748b"}}>👤 {n.radnik}</div>}
                            {n.uradjeno&&<div style={{fontSize:11,color:"#059669"}}>✓ {(+n.uradjeno).toLocaleString()} m</div>}
                          </div>
                          {el>0&&<div style={{fontSize:12,color:"#1d4ed8",fontWeight:700,flexShrink:0}}>⏱️ {fmt(el)}</div>}
                          <select style={{padding:"4px 8px",borderRadius:6,border:"1px solid #e2e8f0",fontSize:11,background:stBg[n.status]||"#f8fafc",color:stCl[n.status]||"#64748b",fontWeight:700,cursor:"pointer"}}
                            value={n.status}
                            onChange={function(e){var v=e.target.value;promeniStatus(n.id,v);}}>
                            <option>Ceka</option><option>U toku</option><option>Završeno</option>
                          </select>
                          <button onClick={function(){setQrNalog(n);}} style={{padding:"5px 10px",borderRadius:6,border:"none",background:"#1d4ed8",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer",flexShrink:0}}>📱 QR</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* IZVESTAJ */}
      {tab==="izvestaj"&&(
        <div>
          <div style={Object.assign({},card,{marginBottom:14})}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>📊 Otpad po nalogu</div>
            {nalozi.filter(function(n){return n.status==="Završeno"&&n.skart>0;}).length===0?(
              <div style={{textAlign:"center",padding:30,color:"#94a3b8"}}>Nema završenih naloga sa škartom.</div>
            ):(
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{borderBottom:"2px solid #e2e8f0"}}>
                  {["Ponuda","Kupac","Nalog","Urađeno","Škart","% otpada"].map(function(h){return <th key={h} style={{padding:"9px 8px",textAlign:"left",color:"#64748b",fontWeight:600}}>{h}</th>;})}
                </tr></thead>
                <tbody>
                  {nalozi.filter(function(n){return n.status==="Završeno"&&n.skart>0;}).map(function(n){
                    var pct=n.uradjeno>0?((n.skart/n.uradjeno)*100).toFixed(1):0;
                    return(
                      <tr key={n.id} style={{borderBottom:"1px solid #f1f5f9"}}>
                        <td style={{padding:"9px 8px",fontWeight:700,color:"#1d4ed8"}}>{n.ponBr}</td>
                        <td style={{padding:"9px 8px"}}>{n.kupac}</td>
                        <td style={{padding:"9px 8px",fontSize:12}}>{n.naziv}</td>
                        <td style={{padding:"9px 8px"}}>{(n.uradjeno||0).toLocaleString()} m</td>
                        <td style={{padding:"9px 8px",color:"#ef4444",fontWeight:600}}>{(n.skart||0).toLocaleString()} m</td>
                        <td style={{padding:"9px 8px"}}>
                          <span style={{background:+pct>5?"#fee2e2":"#dcfce7",color:+pct>5?"#991b1b":"#166534",borderRadius:6,padding:"2px 8px",fontWeight:700,fontSize:11}}>
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ZASTOJI ANALIZA */}
      {tab==="zastoji"&&(function(){
        var zavrseniZ=zastoji.filter(function(z){return z.trajanje;});
        var ukupnoZastoja=zavrseniZ.length;
        var ukupnoVreme=zavrseniZ.reduce(function(s,z){return s+(z.trajanje||0);},0);
        var prosek=ukupnoZastoja>0?ukupnoVreme/ukupnoZastoja:0;

        var poRazlogu={};
        zavrseniZ.forEach(function(z){
          if(!poRazlogu[z.razlog])poRazlogu[z.razlog]={razlog:z.razlog,kategorija:z.kategorija,broj:0,vreme:0};
          poRazlogu[z.razlog].broj++;
          poRazlogu[z.razlog].vreme+=(z.trajanje||0);
        });
        var topRazlozi=Object.values(poRazlogu).sort(function(a,b){return b.vreme-a.vreme;});

        var poKategoriji={};
        zavrseniZ.forEach(function(z){
          var k=z.kategorija||"Ostalo";
          if(!poKategoriji[k])poKategoriji[k]={kat:k,broj:0,vreme:0};
          poKategoriji[k].broj++;
          poKategoriji[k].vreme+=(z.trajanje||0);
        });
        var kategorije=Object.values(poKategoriji).sort(function(a,b){return b.vreme-a.vreme;});

        var poRadniku={};
        zavrseniZ.forEach(function(z){
          var r=z.radnik||"nepoznat";
          if(!poRadniku[r])poRadniku[r]={radnik:r,broj:0,vreme:0};
          poRadniku[r].broj++;
          poRadniku[r].vreme+=(z.trajanje||0);
        });
        var radnici=Object.values(poRadniku).sort(function(a,b){return b.vreme-a.vreme;});

        var katBoje={"Planirani":"#8b5cf6","Tehnički":"#ef4444","Materijal":"#f59e0b","Priprema":"#0891b2","Kvalitet":"#ec4899","Ostalo":"#64748b"};

        return(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:16}}>
              <div style={Object.assign({},card,{borderLeft:"4px solid #f59e0b",padding:"14px 16px"})}>
                <div style={{fontSize:22,marginBottom:4}}>⏸️</div>
                <div style={{fontSize:24,fontWeight:800,color:"#f59e0b"}}>{ukupnoZastoja}</div>
                <div style={{fontSize:11,color:"#64748b"}}>Ukupno zastoja</div>
              </div>
              <div style={Object.assign({},card,{borderLeft:"4px solid #ef4444",padding:"14px 16px"})}>
                <div style={{fontSize:22,marginBottom:4}}>⏱️</div>
                <div style={{fontSize:20,fontWeight:800,color:"#ef4444"}}>{fmt(ukupnoVreme)}</div>
                <div style={{fontSize:11,color:"#64748b"}}>Ukupno vreme zastoja</div>
              </div>
              <div style={Object.assign({},card,{borderLeft:"4px solid #0891b2",padding:"14px 16px"})}>
                <div style={{fontSize:22,marginBottom:4}}>📊</div>
                <div style={{fontSize:20,fontWeight:800,color:"#0891b2"}}>{fmt(Math.round(prosek))}</div>
                <div style={{fontSize:11,color:"#64748b"}}>Prosečno trajanje</div>
              </div>
              <div style={Object.assign({},card,{borderLeft:"4px solid #8b5cf6",padding:"14px 16px"})}>
                <div style={{fontSize:22,marginBottom:4}}>🏷️</div>
                <div style={{fontSize:20,fontWeight:800,color:"#8b5cf6"}}>{Object.keys(poRazlogu).length}</div>
                <div style={{fontSize:11,color:"#64748b"}}>Različitih razloga</div>
              </div>
            </div>

            {ukupnoZastoja===0?(
              <div style={Object.assign({},card,{textAlign:"center",padding:50,color:"#94a3b8"})}>
                <div style={{fontSize:36,marginBottom:10}}>🎉</div>
                <div>Nema zabeleženih zastoja!</div>
              </div>
            ):(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <div style={card}>
                  <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>🏆 Top razlozi zastoja</div>
                  {topRazlozi.slice(0,10).map(function(r,i){
                    var pct=(r.vreme/ukupnoVreme*100).toFixed(1);
                    var boja=katBoje[r.kategorija]||"#64748b";
                    return(
                      <div key={r.razlog} style={{marginBottom:10}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                          <div style={{fontSize:12,fontWeight:600}}>
                            <span style={{color:"#94a3b8",marginRight:6,fontWeight:700}}>{i+1}.</span>
                            {r.razlog}
                          </div>
                          <div style={{fontSize:11,color:"#64748b"}}>{r.broj}x · <b style={{color:boja}}>{fmt(r.vreme)}</b></div>
                        </div>
                        <div style={{height:6,background:"#f1f5f9",borderRadius:3,overflow:"hidden"}}>
                          <div style={{height:"100%",background:boja,width:pct+"%"}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={card}>
                  <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>📂 Po kategorijama</div>
                  {kategorije.map(function(k){
                    var pct=(k.vreme/ukupnoVreme*100).toFixed(1);
                    var boja=katBoje[k.kat]||"#64748b";
                    return(
                      <div key={k.kat} style={{marginBottom:10,padding:12,background:boja+"10",borderRadius:8,border:"1px solid "+boja+"30"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                          <div style={{fontWeight:800,fontSize:13,color:boja}}>{k.kat}</div>
                          <div style={{fontSize:11,color:"#64748b"}}>{k.broj} zastoja</div>
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div style={{fontSize:16,fontWeight:800,color:boja}}>{fmt(k.vreme)}</div>
                          <div style={{fontSize:13,fontWeight:700,color:boja}}>{pct}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {radnici.length>0&&(
              <div style={Object.assign({},card,{marginBottom:14})}>
                <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>👥 Zastoji po radniku</div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr style={{borderBottom:"2px solid #e2e8f0"}}>
                    {["Radnik","Broj zastoja","Ukupno vreme","Prosek"].map(function(h){return <th key={h} style={{padding:"9px 8px",textAlign:"left",color:"#64748b",fontWeight:600}}>{h}</th>;})}
                  </tr></thead>
                  <tbody>
                    {radnici.map(function(r){
                      return(
                        <tr key={r.radnik} style={{borderBottom:"1px solid #f1f5f9"}}>
                          <td style={{padding:"9px 8px",fontWeight:700}}>👤 {r.radnik}</td>
                          <td style={{padding:"9px 8px"}}>{r.broj}</td>
                          <td style={{padding:"9px 8px",color:"#ef4444",fontWeight:600}}>{fmt(r.vreme)}</td>
                          <td style={{padding:"9px 8px",color:"#64748b"}}>{fmt(Math.round(r.vreme/r.broj))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div style={card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontSize:14,fontWeight:700}}>📜 Poslednji zastoji</div>
                <button onClick={loadZastoji} style={{padding:"5px 12px",borderRadius:6,border:"1px solid #e2e8f0",background:"#fff",color:"#64748b",cursor:"pointer",fontSize:11}}>🔄 Osveži</button>
              </div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr style={{borderBottom:"2px solid #e2e8f0"}}>
                    {["Vreme","Nalog","Radnik","Kategorija","Razlog","Trajanje","Status"].map(function(h){return <th key={h} style={{padding:"9px 8px",textAlign:"left",color:"#64748b",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>;})}
                  </tr></thead>
                  <tbody>
                    {zastoji.slice(0,30).map(function(z){
                      var nal=nalozi.find(function(n){return n.id===z.nalog_id;});
                      var boja=katBoje[z.kategorija]||"#64748b";
                      var tajming=z.start_time?new Date(z.start_time).toLocaleString("sr-RS",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):"—";
                      return(
                        <tr key={z.id} style={{borderBottom:"1px solid #f1f5f9"}}>
                          <td style={{padding:"8px",color:"#64748b",whiteSpace:"nowrap"}}>{tajming}</td>
                          <td style={{padding:"8px"}}>
                            <div style={{fontWeight:700,color:"#1d4ed8",fontSize:11}}>{nal?nal.ponBr:"—"}</div>
                            <div style={{fontSize:10,color:"#64748b"}}>{nal?nal.naziv:""}</div>
                          </td>
                          <td style={{padding:"8px"}}>👤 {z.radnik||"—"}</td>
                          <td style={{padding:"8px"}}>
                            <span style={{background:boja+"20",color:boja,borderRadius:4,padding:"2px 7px",fontSize:10,fontWeight:700}}>{z.kategorija||"Ostalo"}</span>
                          </td>
                          <td style={{padding:"8px",fontWeight:600}}>{z.razlog}</td>
                          <td style={{padding:"8px",fontWeight:700,color:boja}}>{z.trajanje?fmt(z.trajanje):"—"}</td>
                          <td style={{padding:"8px"}}>
                            {z.end_time?<span style={{background:"#dcfce7",color:"#166534",borderRadius:4,padding:"2px 7px",fontSize:10,fontWeight:700}}>Završen</span>
                              :<span style={{background:"#fef3c7",color:"#92400e",borderRadius:4,padding:"2px 7px",fontSize:10,fontWeight:700}}>U toku</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
