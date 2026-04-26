import { useEffect, useState } from "react";
import { supabase } from "./supabase.js";

function num(v){ return Number(v||0); }
function fmt(v){ return num(v).toLocaleString("sr-RS", {maximumFractionDigits: 1}); }
function comboKey(c){ return c.slice().sort(function(a,b){return a-b;}).join("+"); }

function genCombos(widths, masterWidth, maxPieces) {
  var out = [];
  var seen = {};
  widths = widths.filter(function(x){return num(x)>0;}).sort(function(a,b){return b-a;});
  function rec(start, arr, sum) {
    if(arr.length>0) {
      var key = comboKey(arr);
      if(!seen[key]) { seen[key]=true; out.push({items:arr.slice(), sum:sum, waste:masterWidth-sum}); }
    }
    if(arr.length >= maxPieces) return;
    for(var i=start;i<widths.length;i++) {
      var w = num(widths[i]);
      if(sum + w <= masterWidth) {
        arr.push(w);
        rec(i, arr, sum+w);
        arr.pop();
      }
    }
  }
  rec(0, [], 0);
  return out.sort(function(a,b){ return a.waste-b.waste || b.sum-a.sum; }).slice(0, 1500);
}

function napraviPlan(rolne, potrebe, maxPieces) {
  var remaining = {};
  potrebe.forEach(function(p){
    var w = num(p.sirina);
    var m = num(p.metraza) * Math.max(1, num(p.kolicina)||1);
    if(w && m) remaining[w] = (remaining[w]||0) + m;
  });

  var aktivneSirine = Object.keys(remaining).map(Number).filter(function(w){return remaining[w]>0;});
  var dostupne = rolne
    .filter(function(r){return num(r.sirina)>0 && num(r.metraza_ost || r.metraza)>0;})
    .sort(function(a,b){return num(b.sirina)-num(a.sirina);});

  var plan = [];
  dostupne.forEach(function(rola){
    aktivneSirine = Object.keys(remaining).map(Number).filter(function(w){return remaining[w]>0;});
    if(aktivneSirine.length===0) return;
    var master = num(rola.sirina);
    var len = num(rola.metraza_ost || rola.metraza);
    var combos = genCombos(aktivneSirine, master, maxPieces||10);
    if(combos.length===0) return;

    var best = null;
    combos.forEach(function(c){
      var korisno = 0;
      c.items.forEach(function(w){ korisno += Math.min(len, remaining[w]||0); });
      var score = korisno*1000 - c.waste*len - Math.max(0,c.items.length-6)*100;
      if(!best || score > best.score) best = Object.assign({}, c, {score:score, korisno:korisno});
    });
    if(!best || best.korisno<=0) return;

    var covered = {};
    best.items.forEach(function(w){
      var use = Math.min(len, remaining[w]||0);
      remaining[w] = Math.max(0, (remaining[w]||0) - len);
      covered[w] = (covered[w]||0) + use;
    });

    plan.push({
      br_rolne: rola.br_rolne || rola.br || rola.id,
      tip: rola.tip || "",
      master: master,
      metraza: len,
      kg: num(rola.kg_neto || rola.kg || 0),
      secenja: best.items,
      suma: best.sum,
      otpad: best.waste,
      iskoriscenje: master ? (best.sum/master*100) : 0,
      covered: covered,
      lot: rola.lot || "",
      lokacija: rola.lokacija || rola.palet || rola.sch || ""
    });
  });

  var ukupnoPotrebno = potrebe.reduce(function(s,p){return s + num(p.metraza)*Math.max(1,num(p.kolicina)||1);},0);
  var ostalo = Object.keys(remaining).reduce(function(s,k){return s+remaining[k];},0);
  var otpadMm = plan.reduce(function(s,p){return s+p.otpad;},0);
  return {plan:plan, remaining:remaining, pokriveno:ukupnoPotrebno-ostalo, ukupnoPotrebno:ukupnoPotrebno, otpadMm:otpadMm};
}

export default function AIsecenjeOptimizer({card, inp, lbl, msg}) {
  var [rolne,setRolne] = useState([]);
  var [loading,setLoading] = useState(false);
  var [potrebe,setPotrebe] = useState([{sirina:"500",metraza:"12000",kolicina:"1"},{sirina:"400",metraza:"12000",kolicina:"1"},{sirina:"300",metraza:"12000",kolicina:"2"}]);
  var [result,setResult] = useState(null);
  var [filterTip,setFilterTip] = useState("");
  var [maxPieces,setMaxPieces] = useState(10);

  useEffect(function(){ ucitajRolne(); },[]);

  async function ucitajRolne(){
    setLoading(true);
    try{
      var r = await supabase.from("magacin").select("*").neq("status","Iskorišćeno").order("sirina",{ascending:false});
      if(r.error) throw r.error;
      setRolne(r.data||[]);
    }catch(e){ if(msg) msg("Greška magacin: "+e.message,"err"); }
    setLoading(false);
  }

  function upd(i,k,v){ setPotrebe(potrebe.map(function(p,j){ return i===j ? Object.assign({},p,{[k]:v}) : p; })); }
  function dodaj(){ setPotrebe(potrebe.concat([{sirina:"",metraza:"",kolicina:"1"}])); }
  function ukloni(i){ setPotrebe(potrebe.filter(function(_,j){return i!==j;})); }

  function pokreni(){
    var source = rolne.filter(function(r){ return !filterTip || String(r.tip||"").toLowerCase().includes(filterTip.toLowerCase()); });
    var res = napraviPlan(source, potrebe, num(maxPieces)||10);
    setResult(res);
    if(msg) msg("Plan sečenja izračunat u browseru");
  }

  // 📊 NOVO: Export u Excel
  async function exportToExcel() {
    if(!result || !result.plan.length) {
      if(msg) msg("Nema plana za export!", "err");
      return;
    }
    
    try {
      // Učitaj XLSX library dinamički
      if(!window.XLSX) {
        var script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
        await new Promise(function(res, rej) {
          script.onload = res;
          script.onerror = rej;
          document.head.appendChild(script);
        });
      }

      // Pripremi podatke za Excel
      var excelData = result.plan.map(function(p, i) {
        return {
          "Red": i + 1,
          "Matična rolna": p.br_rolne,
          "Tip": p.tip,
          "Širina mm": p.master,
          "Metraža m": p.metraza,
          "Sečenja": p.secenja.join(" + "),
          "Suma mm": p.suma,
          "Otpad mm": p.otpad,
          "Iskorišćenje %": p.iskoriscenje.toFixed(2),
          "LOT": p.lot,
          "Lokacija": p.lokacija
        };
      });

      // Kreiraj Excel fajl
      var worksheet = window.XLSX.utils.json_to_sheet(excelData);
      var workbook = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(workbook, worksheet, "Plan sečenja");
      
      // Download
      var filename = "plan-secenja-" + new Date().toISOString().slice(0,10) + ".xlsx";
      window.XLSX.writeFile(workbook, filename);
      
      if(msg) msg("✅ Excel fajl preuzet: " + filename);
    } catch(e) {
      if(msg) msg("Greška pri exportu: " + e.message, "err");
    }
  }

  var tipovi = Array.from(new Set(rolne.map(function(r){return r.tip;}).filter(Boolean))).sort();
  var ukupnoKg = rolne.reduce(function(s,r){return s+num(r.kg_neto||r.kg||0);},0);
  var ukupnoM = rolne.reduce(function(s,r){return s+num(r.metraza_ost||r.metraza||0);},0);

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:18}}>
        <div>
          <h2 style={{margin:0,fontSize:22,fontWeight:900}}>🧠 Optimizacija sečenja</h2>
          <div style={{fontSize:13,color:"#64748b",marginTop:3}}>Radi direktno u aplikaciji — bez lokalnog Python servera.</div>
        </div>
        <button onClick={ucitajRolne} style={{padding:"9px 14px",borderRadius:9,border:"1px solid #dbe3ef",background:"#fff",fontWeight:800,cursor:"pointer"}}>↻ Osveži rolne</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:16}}>
        <div style={Object.assign({},card,{borderLeft:"4px solid #1d4ed8"})}><div style={{fontSize:26}}>📦</div><div style={{fontSize:26,fontWeight:900,color:"#1d4ed8"}}>{rolne.length}</div><div style={{fontSize:12,color:"#64748b"}}>Rolni dostupno</div></div>
        <div style={Object.assign({},card,{borderLeft:"4px solid #059669"})}><div style={{fontSize:26}}>📏</div><div style={{fontSize:26,fontWeight:900,color:"#059669"}}>{fmt(ukupnoM)} m</div><div style={{fontSize:12,color:"#64748b"}}>Ukupno metara</div></div>
        <div style={Object.assign({},card,{borderLeft:"4px solid #7c3aed"})}><div style={{fontSize:26}}>⚖️</div><div style={{fontSize:26,fontWeight:900,color:"#7c3aed"}}>{fmt(ukupnoKg)} kg</div><div style={{fontSize:12,color:"#64748b"}}>Ukupno kg</div></div>
      </div>

      <div style={Object.assign({},card,{marginBottom:16})}>
        <div style={{fontSize:15,fontWeight:900,marginBottom:12}}>Potrebne trake</div>
        {potrebe.map(function(p,i){return(
          <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 36px",gap:8,marginBottom:8,alignItems:"end"}}>
            <div><label style={lbl}>Širina mm</label><input style={inp} type="number" value={p.sirina} onChange={function(e){upd(i,"sirina",e.target.value);}}/></div>
            <div><label style={lbl}>Metraža po roli</label><input style={inp} type="number" value={p.metraza} onChange={function(e){upd(i,"metraza",e.target.value);}}/></div>
            <div><label style={lbl}>Količina</label><input style={inp} type="number" value={p.kolicina} onChange={function(e){upd(i,"kolicina",e.target.value);}}/></div>
            <button onClick={function(){ukloni(i);}} style={{height:38,border:"1px solid #fecaca",background:"#fef2f2",color:"#ef4444",borderRadius:8,fontWeight:900,cursor:"pointer"}}>×</button>
          </div>
        );})}
        <div style={{display:"flex",gap:10,alignItems:"end",marginTop:12,flexWrap:"wrap"}}>
          <button onClick={dodaj} style={{padding:"10px 14px",borderRadius:9,border:"1px solid #dbe3ef",background:"#fff",fontWeight:800,cursor:"pointer"}}>+ Dodaj traku</button>
          <div><label style={lbl}>Filter materijala</label><select style={Object.assign({},inp,{minWidth:180})} value={filterTip} onChange={function(e){setFilterTip(e.target.value);}}><option value="">Svi materijali</option>{tipovi.map(function(t){return <option key={t} value={t}>{t}</option>;})}</select></div>
          <div><label style={lbl}>Max traka u kombinaciji</label><input style={Object.assign({},inp,{width:110})} type="number" value={maxPieces} onChange={function(e){setMaxPieces(e.target.value);}}/></div>
          <button onClick={pokreni} disabled={loading} style={{padding:"11px 20px",borderRadius:9,border:"none",background:"#7c3aed",color:"#fff",fontWeight:900,cursor:"pointer"}}>🧠 Optimizuj</button>
        </div>
      </div>

      {result && (
        <div>
          <div style={Object.assign({},card,{background:"#ecfdf5",border:"1px solid #bbf7d0",marginBottom:16})}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:13,color:"#166534",fontWeight:900,textTransform:"uppercase"}}>Rezultat</div>
                <div style={{fontSize:22,fontWeight:900,color:"#064e3b",marginTop:4}}>Pokriveno {fmt(result.pokriveno)} m od {fmt(result.ukupnoPotrebno)} m</div>
                <div style={{fontSize:13,color:"#166534",marginTop:4}}>Korišćeno rolni: <b>{result.plan.length}</b> · Ukupan otpad po kombinacijama: <b>{result.otpadMm} mm</b></div>
              </div>
              <button onClick={exportToExcel} style={{padding:"10px 18px",borderRadius:9,border:"none",background:"#059669",color:"#fff",fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>
                📊 Export u Excel
              </button>
            </div>
          </div>

          {Object.keys(result.remaining).some(function(k){return result.remaining[k]>0;}) && <div style={Object.assign({},card,{background:"#fff7ed",border:"1px solid #fed7aa",marginBottom:16})}><b>⚠️ Nepokriveno:</b> {Object.keys(result.remaining).filter(function(k){return result.remaining[k]>0;}).map(function(k){return k+"mm: "+fmt(result.remaining[k])+"m";}).join(" · ")}</div>}

          {result.plan.map(function(p,idx){return(
            <div key={idx} style={Object.assign({},card,{marginBottom:12})}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,gap:10}}>
                <div><div style={{fontSize:12,color:"#64748b",fontWeight:800}}>Matična rola</div><div style={{fontSize:16,fontWeight:900,color:"#1d4ed8"}}>{p.br_rolne} · {p.tip} · {p.master}mm</div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:12,color:"#64748b",fontWeight:800}}>Iskorišćenost</div><div style={{fontSize:22,fontWeight:900,color:p.iskoriscenje>95?"#059669":"#f59e0b"}}>{p.iskoriscenje.toFixed(2)}%</div></div>
              </div>
              <div style={{height:58,border:"1px solid #cbd5e1",borderRadius:10,overflow:"hidden",display:"flex",background:"#fee2e2"}}>
                {p.secenja.map(function(w,i){return <div key={i} style={{width:(w/p.master*100)+"%",background:"#dbeafe",borderRight:"1px solid #93c5fd",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:"#1e40af"}}>{w}mm</div>;})}
                {p.otpad>0 && <div style={{width:(p.otpad/p.master*100)+"%",background:"#fecaca",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"#991b1b"}}>Otpad {p.otpad}</div>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:8,marginTop:10,fontSize:12}}>
                <div style={{background:"#f8fafc",padding:9,borderRadius:8}}><b>Plan:</b><br/>{p.secenja.join(" + ")}</div>
                <div style={{background:"#f8fafc",padding:9,borderRadius:8}}><b>Metraža:</b><br/>{fmt(p.metraza)} m</div>
                <div style={{background:"#f8fafc",padding:9,borderRadius:8}}><b>Otpad:</b><br/>{p.otpad} mm</div>
                <div style={{background:"#f8fafc",padding:9,borderRadius:8}}><b>LOT/Lokacija:</b><br/>{p.lot || "—"} {p.lokacija ? " · "+p.lokacija : ""}</div>
              </div>
            </div>
          );})}
        </div>
      )}
    </div>
  );
}
