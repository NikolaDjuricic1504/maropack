import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

var dnow = function() { return new Date().toLocaleDateString("sr-RS"); };

// QR kod za rolnu - vodi na ?rolna=BR_ROLNE
function QRRolna({brRolne, size}) {
  var sz = size || 60;
  var url = window.location.origin + "?rolna=" + encodeURIComponent(brRolne);
  return (
    <img
      src={"https://api.qrserver.com/v1/create-qr-code/?size="+sz+"x"+sz+"&data="+encodeURIComponent(url)}
      alt={"QR "+brRolne}
      style={{width:sz,height:sz,display:"block",borderRadius:4}}
      title={brRolne}
    />
  );
}

// Tipovi materijala sa debljinama i gustocama - isti kao u kalkulatoru
var MAT_DATA_MAG = {
  "BOPP": [5,10,12,15,18,20,25,28,30,35,40,45,50,55,60,65,70].map(function(d){return {d:d,t:+(d*0.91).toFixed(2)};}),
  "BOPP SEDEF": [5,10,15,20,25,30,35,38,40,45].map(function(d){return {d:d,t:+(d*0.65).toFixed(2)};}),
  "BOPP BELI": [5,10,15,20,25,30,35,40,45,50].map(function(d){return {d:d,t:+(d*0.91).toFixed(2)};}),
  "LDPE": [10,15,20,25,30,35,40,45,50,55,60].map(function(d){return {d:d,t:+(d*0.925).toFixed(2)};}),
  "CPP": [5,10,15,18,20,25,28,30,35,40,45,50,55,60].map(function(d){return {d:d,t:+(d*0.91).toFixed(2)};}),
  "PET": [12,15,19,20,21,36,50,150].map(function(d){return {d:d,t:+(d*1.4).toFixed(2)};}),
  "OPA": [12,15,20,25,30,35,40].map(function(d){return {d:d,t:+(d*1.1).toFixed(2)};}),
  "OPP": [5,10,15,18,20,25,28,30,35,40,45,50].map(function(d){return {d:d,t:+(d*0.91).toFixed(2)};}),
  "PLA": [5,10,15,20,25,30,35,40,45].map(function(d){return {d:d,t:+(d*1.24).toFixed(2)};}),
  "HDPE": [5,8,12,15,17,20,25,30,35,40,45,50].map(function(d){return {d:d,t:+(d*0.94).toFixed(2)};}),
  "ALU": [7,9,12,15,20,25,30,35,40,45,50].map(function(d){return {d:d,t:+(d*2.71).toFixed(2)};}),
  "PA": [10,15,20,23,28,30,35,40,45,50].map(function(d){return {d:d,t:+(d*1.14).toFixed(2)};}),
  "PA/PE": [10,15,20,23,28,30,35,40,45,50].map(function(d){return {d:d,t:+(d*1.0).toFixed(2)};}),
  "FXC": [12,15,18,20,25,28,29,30,35,40].map(function(d){return {d:d,t:+(d*0.91).toFixed(2)};}),
  "FXCB": [12,15,18,20,25,30,35,40].map(function(d){return {d:d,t:+(d*0.91).toFixed(2)};}),
  "FXPU": [18,20,25,28,29,30,35,40].map(function(d){return {d:d,t:+(d*0.91).toFixed(2)};}),
  "FXPA": [15,18,20,25,30,35].map(function(d){return {d:d,t:+(d*0.91).toFixed(2)};}),
  "HSD": [28,29,30,31,32,35,40].map(function(d){return {d:d,t:+(d*0.91).toFixed(2)};}),
  "CC White 55g": [{d:0,t:55}],
  "CC White 60g": [{d:0,t:60}],
  "CC White 70g": [{d:0,t:70}],
  "CC White 80g": [{d:0,t:80}],
  "Papir": [{d:0,t:60},{d:0,t:70},{d:0,t:80},{d:0,t:90}],
  "Papir silikonizani": [{d:0,t:65},{d:0,t:80}],
};

var MAT_TIPOVI = Object.keys(MAT_DATA_MAG);

// g/m² po tipu i debljini za auto-izracun kg
var GSM_TABELA = {
  "BOPP": {12:10.9, 15:13.6, 18:16.4, 20:18.2, 25:22.7, 30:27.3, 35:31.8, 40:36.4},
  "OPP":  {18:16.4, 20:18.2, 25:22.7, 30:27.3, 35:31.8, 40:36.4},
  "CPP":  {20:18.8, 25:23.5, 30:28.2, 40:37.6, 50:47.0, 60:56.4},
  "PET":  {12:16.8, 15:21.0, 19:26.6, 23:32.2},
  "PA":   {15:18.0, 20:24.0, 25:30.0},
  "LDPE": {30:27.9, 40:37.2, 50:46.5, 60:55.8},
  "ALU":  {7:18.9, 9:24.3, 12:32.4},
  "FXC":  {20:18.8, 25:23.5, 30:28.2},
  "FXPU": {20:18.8, 25:23.5, 28:26.3, 29:27.3, 30:28.2},
  "CC White 55g": {0:55},
  "CC White 60g": {0:60},
  "Papir": {0:60},
  "Papir silikonizani": {0:65},
};

function izracunajKg(tip, deb, sirina, metraza) {
  if(!tip || !sirina || !metraza) return {kg_neto:0, kg_bruto:0};
  var gsm = 0;
  var tabTip = Object.keys(GSM_TABELA).find(function(k){ return tip.toUpperCase().startsWith(k.toUpperCase()); });
  if(tabTip) {
    var tab = GSM_TABELA[tabTip];
    if(tab[0]) { gsm = tab[0]; } // fixed gsm (papir, CC)
    else if(deb && tab[+deb]) { gsm = tab[+deb]; }
    else if(deb) {
      // Interpolate
      var keys = Object.keys(tab).map(Number).sort(function(a,b){return a-b;});
      var lower = keys.filter(function(k){return k<=+deb;}).pop();
      var upper = keys.filter(function(k){return k>=+deb;})[0];
      if(lower && upper && lower !== upper) {
        gsm = tab[lower] + (tab[upper]-tab[lower]) * (+deb-lower)/(upper-lower);
      } else if(lower) { gsm = tab[lower]; }
      else if(upper) { gsm = tab[upper]; }
    }
  }
  if(!gsm && deb) gsm = +deb * 0.91; // default: mic * gustoca
  if(!gsm) return {kg_neto:0, kg_bruto:0};
  var kg_neto = Math.round(gsm * +sirina/1000 * +metraza / 1000 * 10) / 10;
  return {kg_neto: kg_neto, kg_bruto: Math.round(kg_neto * 1.025 * 10)/10};
}

// Parse PDF packing list text
function parsePdfText(text) {
  var rolne = [];
  var lines = text.split("\n");
  var currentRolna = null;
  var dobavljac = "";

  // Extract supplier
  var supMatch = text.match(/Rossella|Taghleef|Treofan|Jindal|UFlex/i);
  if(supMatch) dobavljac = supMatch[0];

  for(var i=0; i<lines.length; i++) {
    var line = lines[i].trim();
    if(!line) continue;

    // Skip headers
    if(line.startsWith("Page ") || line.startsWith("Description") ||
       line.startsWith("Shipping") || line.startsWith("Customer") ||
       line.startsWith("Summary") || line.startsWith("MAROPACK") ||
       line.startsWith("NOVOSADSKA") || line.startsWith("21299") ||
       line.startsWith("SERBIA") || line.includes("Via IV") ||
       line.startsWith("Package") || line.startsWith("Wooden") ||
       line.startsWith("Total:") || line.startsWith("Pallets no.")) {
      continue;
    }

    // Pallet row: "Pallet : 2604676 Dim. (cm): 100x145x115 Sch.: 61905/7"
    if(line.startsWith("Pallet")) {
      if(currentRolna) {
        var schMatch = line.match(/Sch\.\:\s*([\w/]+)/);
        var paletMatch = line.match(/Pallet\s*:\s*(\d+)/);
        if(schMatch) currentRolna.sch = schMatch[1];
        if(paletMatch) currentRolna.palet = paletMatch[1];
      }
      continue;
    }

    // Gross/Net weight row
    if(line.startsWith("Gross wt.")) {
      if(currentRolna) {
        var grossMatch = line.match(/Gross wt\. Kg:\s*([\d.,]+)/);
        var netMatch = line.match(/Net wt\. Kg:\s*([\d.,]+)/);
        if(grossMatch) currentRolna.kg_bruto = parseFloat(grossMatch[1].replace(",",""));
        if(netMatch) currentRolna.kg_neto = parseFloat(netMatch[1].replace(",",""));
        rolne.push(currentRolna);
        currentRolna = null;
      }
      continue;
    }

    // LOT extraction
    var lotMatch = line.match(/\b([A-Z]\d+\/\d+)\b/);
    var lot = lotMatch ? lotMatch[1] : "";

    // Material type detection
    var tip = "";
    var lCased = line.toUpperCase();
    if(lCased.includes("CLAY COATED") || lCased.includes("CC WHITE")) {
      var gm = line.match(/(\d{2,3})\s*g/);
      tip = "CC White " + (gm ? gm[1]+"g" : "");
    } else if(lCased.includes("BOPP")) { tip = "BOPP"; }
    else if(lCased.includes("OPP")) { tip = "OPP"; }
    else if(lCased.includes("PET")) { tip = "PET"; }
    else if(lCased.includes("CPP")) { tip = "CPP"; }
    else if(lCased.includes("LDPE") || lCased.includes("PE")) { tip = "LDPE"; }
    else if(lCased.includes("PAPIR") || lCased.includes("PAPER")) { tip = "Papir"; }
    else if(lCased.includes("ALU") || lCased.includes("ALUM")) { tip = "ALU"; }
    else if(lCased.includes("FXC")) { tip = "FXC"; }
    else if(lCased.includes("FXPU")) { tip = "FXPU"; }

    if(!tip) continue;

    // Width: look for NNNNmm pattern
    var widthMatch = line.match(/(\d{3,4})\s*mm/i);
    if(!widthMatch) continue;
    var sirina = parseInt(widthMatch[1]);
    if(sirina < 50 || sirina > 3000) continue;

    // Metraza from next number that looks like meters
    // Usually on same line as separate token or next line
    var metMatch = line.match(/\b(\d{1,2}[.,]\d{3})\b/);
    var met = metMatch ? parseFloat(metMatch[1].replace(".","").replace(",",".")) : 0;

    if(met > 100 && sirina > 50) {
      if(currentRolna) rolne.push(currentRolna);
      currentRolna = {
        tip: tip,
        sirina: sirina,
        metraza: met,
        metraza_ost: met,
        lot: lot,
        dobavljac: dobavljac,
        datum: dnow(),
        sch: "",
        palet: "",
        kg_bruto: 0,
        kg_neto: 0,
        napomena: line.substring(0, 80),
        status: "Na stanju"
      };
    }
  }
  if(currentRolna) rolne.push(currentRolna);
  return rolne;
}

// Parse Excel/CSV packing list
function parseExcelText(text) {
  var rolne = [];
  var lines = text.split("\n");

  for(var i=0; i<lines.length; i++) {
    var parts = lines[i].split(/[\t;,]/);
    if(parts.length < 3) continue;

    var tip = "";
    var sirina = 0;
    var met = 0;
    var kg = 0;
    var lot = "";
    var sch = "";

    for(var j=0; j<parts.length; j++) {
      var v = parts[j].trim();
      if(!v) continue;

      if(/BOPP|OPP|PET|CPP|LDPE|FXC|FXPU|ALU|PAPIR/i.test(v)) tip = v;
      else if(/^\d{3,4}$/.test(v) && parseInt(v) > 50 && parseInt(v) < 3000) sirina = parseInt(v);
      else if(/^\d{4,6}([.,]\d+)?$/.test(v.replace(/\./g,""))) {
        var n = parseFloat(v.replace(/\./g,"").replace(",","."));
        if(n > 1000 && n < 500000) met = n;
        else if(n > 50 && n < 5000) kg = n;
      }
      else if(/^[A-Z]\d+\/\d+$/.test(v)) lot = v;
      else if(/^\d+\/\d+$/.test(v)) sch = v;
    }

    if(tip && sirina > 0 && met > 0) {
      rolne.push({
        tip, sirina, metraza: met, metraza_ost: met,
        lot, dobavljac: "", datum: dnow(),
        sch, palet: "", kg_bruto: kg*1.02, kg_neto: kg,
        napomena: "", status: "Na stanju"
      });
    }
  }
  return rolne;
}

// Mobilna stranica za skeniranje QR koda rolne - unos lokacije
export function MobilniMagacin({brRolne}) {
  var [rolna, setRolna] = useState(null);
  var [loading, setLoading] = useState(true);
  var [lokacija, setLokacija] = useState("");
  var [napomena, setNapomena] = useState("");
  var [saved, setSaved] = useState(false);
  var [saving, setSaving] = useState(false);
  var [greska, setGreska] = useState("");

  useEffect(function(){
    if(!brRolne) { setLoading(false); setGreska("Nema broja rolne!"); return; }
    
    // 🔍 DEBUG: Prikaži šta tražimo
    console.log("🔍 MAROPACK DEBUG: Tražim rolnu:", brRolne);
    console.log("🔍 URL parametar:", window.location.search);
    
    // 🛠️ POKUŠAJ 1: Traži direktno po br_rolne
    supabase.from("magacin").select("*").eq("br_rolne", brRolne).single()
      .then(function(r1){
        console.log("📦 Rezultat po br_rolne:", r1);
        
        if(r1.data) {
          // ✅ Pronađeno!
          console.log("✅ PRONAĐENO direktno!", r1.data);
          setRolna(r1.data);
          setLokacija(r1.data.palet || "");
          setNapomena(r1.data.napomena || "");
          setLoading(false);
        } else {
          // ⚠️ Nije pronađeno, pokušaj alternativne kolone
          console.warn("⚠️ Nije pronađeno po br_rolne, probam 'broj' i 'broj_rolne'...");
          
          // 🛠️ POKUŠAJ 2: Traži u više kolona odjednom
          supabase.from("magacin").select("*")
            .or("broj.eq."+brRolne+",broj_rolne.eq."+brRolne)
            .then(function(r2){
              console.log("📦 Rezultat po broj/broj_rolne:", r2);
              
              if(r2.data && r2.data.length > 0) {
                console.log("✅ PRONAĐENO u alternat. koloni!", r2.data[0]);
                setRolna(r2.data[0]);
                setLokacija(r2.data[0].palet || "");
                setNapomena(r2.data[0].napomena || "");
              } else {
                // ❌ Definitivno ne postoji
                console.error("❌ Rolna NIJE PRONAĐENA ni u jednoj koloni!");
                console.error("Proverite:");
                console.error("1. Da li kolona u Supabase tabeli 'magacin' postoji?");
                console.error("2. Da li je vrednost tačna:", brRolne);
                setGreska("Rolna '"+brRolne+"' nije pronađena. Proveri Supabase tabelu 'magacin' i naziv kolone!");
              }
              setLoading(false);
            })
            .catch(function(err2){
              console.error("❌ Greška u alternat. pretrazi:", err2);
              setGreska("Greška baze (alt): " + err2.message);
              setLoading(false);
            });
        }
      })
      .catch(function(err1){
        console.error("❌ Greška u osnovnoj pretrazi:", err1);
        setGreska("Greška baze: " + err1.message);
        setLoading(false);
      });
  }, [brRolne]);

  async function sacuvaj() {
    if(!lokacija.trim()) { setGreska("Unesite lokaciju!"); return; }
    setSaving(true);
    setGreska("");
    try {
      var res = await supabase.from("magacin")
        .update({palet: lokacija.trim(), napomena: napomena})
        .eq("br_rolne", brRolne);
      if(res.error) throw res.error;
      setRolna(function(r){ return Object.assign({},r,{palet:lokacija,napomena:napomena}); });
      setSaved(true);
    } catch(e) {
      setGreska("Greška: "+e.message);
    }
    setSaving(false);
  }

  var st = {
    page: {minHeight:"100vh",background:"#f1f5f9",fontFamily:"system-ui,sans-serif",padding:0},
    hdr:  {background:"#0f172a",color:"#fff",padding:"16px 20px",display:"flex",alignItems:"center",gap:12},
    logo: {fontSize:22,fontWeight:800},
    sub:  {fontSize:12,color:"#94a3b8",marginTop:2},
    card: {background:"#fff",borderRadius:12,padding:20,margin:"16px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"},
    lbl:  {fontSize:12,fontWeight:600,color:"#64748b",display:"block",marginBottom:4},
    inp:  {width:"100%",padding:"12px 14px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:15,boxSizing:"border-box",outline:"none"},
    btn:  {width:"100%",padding:"14px",borderRadius:10,border:"none",background:"#059669",color:"#fff",fontWeight:800,fontSize:16,cursor:"pointer"},
    row:  {display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f1f5f9"},
    key:  {fontSize:13,color:"#64748b"},
    val:  {fontSize:13,fontWeight:700,color:"#1e293b",textAlign:"right"},
  };

  if(loading) return (
    <div style={Object.assign({},st.page,{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12})}>
      <div style={{fontSize:36}}>⏳</div>
      <div style={{color:"#64748b",fontWeight:600}}>Učitavam podatke...</div>
    </div>
  );

  if(greska && !rolna) return (
    <div style={Object.assign({},st.page,{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12,padding:24})}>
      <div style={{fontSize:48}}>❌</div>
      <div style={{color:"#ef4444",fontWeight:700,textAlign:"center"}}>{greska}</div>
      <div style={{color:"#64748b",fontSize:13}}>Br. rolne: {brRolne}</div>
    </div>
  );

  if(saved) return (
    <div style={Object.assign({},st.page,{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,padding:24})}>
      <div style={{fontSize:72}}>✅</div>
      <div style={{fontSize:20,fontWeight:800,color:"#059669"}}>Lokacija sačuvana!</div>
      <div style={st.card}>
        <div style={st.row}><span style={st.key}>Rolna</span><span style={Object.assign({},st.val,{color:"#1d4ed8"})}>{rolna.br_rolne}</span></div>
        <div style={st.row}><span style={st.key}>Tip</span><span style={st.val}>{rolna.tip} {rolna.deb>0?rolna.deb+"µ":""}</span></div>
        <div style={st.row}><span style={st.key}>Širina</span><span style={st.val}>{rolna.sirina}mm</span></div>
        <div style={st.row}><span style={st.key}>Metraža</span><span style={Object.assign({},st.val,{color:"#059669"})}>{(rolna.metraza_ost||rolna.metraza||0).toLocaleString()}m</span></div>
        <div style={st.row}><span style={st.key}>📍 Lokacija</span><span style={Object.assign({},st.val,{color:"#f59e0b",fontSize:16})}>{lokacija}</span></div>
      </div>
      <button onClick={function(){setSaved(false);}} style={Object.assign({},st.btn,{background:"#1d4ed8",maxWidth:300})}>
        ✏️ Izmeni lokaciju
      </button>
    </div>
  );

  return (
    <div style={st.page}>
      {/* Header */}
      <div style={st.hdr}>
        <div>
          <div style={st.logo}>📦 Maropack — Magacin</div>
          <div style={st.sub}>Unos lokacije rolne</div>
        </div>
      </div>

      {/* Rolna info */}
      <div style={st.card}>
        <div style={{fontSize:12,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Podaci o rolni</div>
        <div style={Object.assign({},st.row,{paddingTop:0})}>
          <span style={st.key}>Br. rolne</span>
          <span style={Object.assign({},st.val,{color:"#1d4ed8",fontSize:15})}>{rolna.br_rolne}</span>
        </div>
        <div style={st.row}>
          <span style={st.key}>Tip</span>
          <span style={st.val}>{rolna.tip} {rolna.deb>0?rolna.deb+"µ":""}</span>
        </div>
        <div style={st.row}>
          <span style={st.key}>Širina</span>
          <span style={st.val}>{rolna.sirina}mm</span>
        </div>
        <div style={st.row}>
          <span style={st.key}>Metraža ostalo</span>
          <span style={Object.assign({},st.val,{color:"#059669"})}>{(rolna.metraza_ost||rolna.metraza||0).toLocaleString()}m</span>
        </div>
        {rolna.kg_neto>0 && <div style={st.row}><span style={st.key}>Kg neto</span><span style={st.val}>{rolna.kg_neto} kg</span></div>}
        {rolna.lot && <div style={st.row}><span style={st.key}>LOT</span><span style={Object.assign({},st.val,{color:"#1d4ed8"})}>{rolna.lot}</span></div>}
        {rolna.sch && <div style={st.row}><span style={st.key}>Sch.</span><span style={st.val}>{rolna.sch}</span></div>}
        {rolna.dobavljac && <div style={st.row}><span style={st.key}>Dobavljač</span><span style={st.val}>{rolna.dobavljac}</span></div>}
        {rolna.datum && <div style={st.row}><span style={st.key}>Datum prijema</span><span style={st.val}>{rolna.datum}</span></div>}
        <div style={Object.assign({},st.row,{borderBottom:"none"})}>
          <span style={st.key}>Status</span>
          <span style={{fontSize:12,fontWeight:700,padding:"3px 10px",borderRadius:6,background:rolna.status==="Na stanju"?"#f0fdf4":"#f1f5f9",color:rolna.status==="Na stanju"?"#166534":"#64748b"}}>{rolna.status}</span>
        </div>
      </div>

      {/* Trenutna lokacija */}
      {rolna.palet && (
        <div style={Object.assign({},st.card,{background:"#fef3c7",border:"1.5px solid #fde68a",margin:"0 16px 16px"})}>
          <div style={{fontSize:12,color:"#92400e",fontWeight:700,marginBottom:4}}>📍 Trenutna lokacija</div>
          <div style={{fontSize:20,fontWeight:800,color:"#92400e"}}>{rolna.palet}</div>
        </div>
      )}

      {/* Forma za lokaciju */}
      <div style={st.card}>
        <div style={{fontSize:12,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:1,marginBottom:16}}>
          {rolna.palet ? "Izmeni lokaciju" : "Unesi lokaciju"}
        </div>

        <div style={{marginBottom:14}}>
          <label style={st.lbl}>📍 Lokacija / Palet *</label>
          <input style={Object.assign({},st.inp,{
            fontSize:20,fontWeight:700,textAlign:"center",
            border:"2px solid "+(lokacija?"#059669":"#e2e8f0"),
            color:lokacija?"#059669":"#94a3b8"
          })}
          value={lokacija}
          onChange={function(e){setLokacija(e.target.value);}}
          placeholder="npr. B5, MM, Nadstrešnica..."
          autoFocus
          />
          <div style={{fontSize:11,color:"#94a3b8",marginTop:4}}>Unesite oznaku lokacije ili paleta</div>
        </div>

        <div style={{marginBottom:20}}>
          <label style={st.lbl}>Napomena (opciono)</label>
          <textarea
            style={Object.assign({},st.inp,{height:70,resize:"none",fontSize:13})}
            value={napomena}
            onChange={function(e){setNapomena(e.target.value);}}
            placeholder="Npr. zadnji red, oštećen omot..."
          />
        </div>

        {greska && (
          <div style={{padding:"10px 14px",background:"#fef2f2",color:"#991b1b",borderRadius:8,marginBottom:14,fontSize:13,fontWeight:600}}>
            ⚠️ {greska}
          </div>
        )}

        <button onClick={sacuvaj} disabled={saving} style={Object.assign({},st.btn,{opacity:saving?0.7:1})}>
          {saving ? "⏳ Čuvam..." : "💾 Sačuvaj lokaciju"}
        </button>
      </div>
    </div>
  );
}

export default function Magacin({msg, inp, card, lbl, user}) {
  var [rolne, setRolne] = useState([]);
  var [loading, setLoading] = useState(true);
  var [tab, setTab] = useState("stanje");
  var [filterTip, setFilterTip] = useState("");
  var [filterSirina, setFilterSirina] = useState("");
  var [filterStatus, setFilterStatus] = useState("aktivne");
  var [saving, setSaving] = useState(false);
  var [qrRolna, setQrRolna] = useState(null); // rolna za QR modal

  // Import states
  var [importTab, setImportTab] = useState("pdf"); // pdf, excel, rucni
  var [parsedRolne, setParsedRolne] = useState([]);
  var [parseLoading, setParseLoading] = useState(false);
  var [dobavljacImport, setDobavljacImport] = useState("");
  var [datumImport, setDatumImport] = useState(dnow());

  // Manual form
  var [form, setForm] = useState({
    tip:"", sirina:"", metraza:"", kg_bruto:"", kg_neto:"",
    lot:"", dobavljac:"", datum:dnow(), sch:"", palet:"", napomena:""
  });

  useEffect(function(){ loadRolne(); }, []);

  async function loadRolne() {
    setLoading(true);
    try {
      var res = await supabase.from("magacin").select("*").order("created_at", {ascending:false});
      if(res.error) throw res.error;
      setRolne(res.data||[]);
    } catch(e) { msg("Greška: "+e.message, "err"); }
    setLoading(false);
  }

  // ===== PDF UPLOAD — parsira direktno u browseru =====
  async function handlePdfUpload(e) {
    var file = e.target.files[0];
    if(!file) return;
    setParseLoading(true);
    setParsedRolne([]);

    try {
      var reader = new FileReader();
      reader.onload = async function(ev) {
        var arrayBuffer = ev.target.result;
        try {
          // Load PDF.js dynamically
          if(!window.pdfjsLib) {
            await new Promise(function(res, rej) {
              var s = document.createElement("script");
              s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
              s.onload = res; s.onerror = rej;
              document.head.appendChild(s);
            });
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          }

          var pdf = await window.pdfjsLib.getDocument({data: arrayBuffer}).promise;
          var fullText = "";
          for(var i=1; i<=pdf.numPages; i++) {
            var page = await pdf.getPage(i);
            var content = await page.getTextContent();
            var items = content.items;
            var pageText = "";
            // Pametno spajanje: ako prethodni item nema EOL i sledeci pocinje cifrom ili tackom,
            // ne dodajemo razmak (sprecava split "12" " .258" -> "12.258")
            for(var j=0; j<items.length; j++) {
              var str = items[j].str;
              if(j === 0) { pageText += str; continue; }
              var prev = pageText.slice(-1);
              var next = str.charAt(0);
              // Ako prethodni zavrsava cifrom i sledeci pocinje tackom+ciframa -> spoji bez razmaka
              if(/\d/.test(prev) && /^[.,]\d/.test(str.trimLeft())) {
                pageText += str;
              } else if(/[.,]\d/.test(prev.slice(-3)) && /^\d/.test(next)) {
                pageText += str;
              } else {
                pageText += " " + str;
              }
            }
            fullText += pageText + "\n";
          }

          // Parse the extracted text
          // DEBUG: prikazi prvih 500 chars da vidimo sta PDF.js vraca
          console.log("=== PDF.js raw text (first 1000 chars) ===");
          console.log(JSON.stringify(fullText.substring(0, 1000)));
          // Nadji prvi blok posle "Pallet :"
          var debugBlocks = fullText.split(/Pallet\s*:/i);
          if(debugBlocks.length > 1) {
            console.log("=== Block 1 (after Pallet:) ===");
            console.log(JSON.stringify(debugBlocks[1].substring(0, 300)));
          }

          var rolne = parsePdfTextLocally(fullText, dobavljacImport, datumImport);
          if(rolne.length > 0) {
            setParsedRolne(rolne);
            msg("Parsirano "+rolne.length+" rolni iz PDF!");
          } else {
            // Debug: show what text we got
            var preview = fullText.substring(0, 200).replace(/\n/g, " ");
            msg("Nema rolni. Raw tekst: "+preview, "err");
          }
        } catch(err) {
          msg("Greška pri čitanju PDF: "+err.message, "err");
        }
        setParseLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch(e) {
      msg("Greška: "+e.message, "err");
      setParseLoading(false);
    }
  }

  // Parser za PDF packing liste (Rossella i slicni formati)
  // PDF.js vraca kolone s desna na levo, pa je redosled u tekstu:
  // [sirina] [ukupno_m2] [ukupno_m] [metraza_po_rolni] [LOT] [opis] [rolls] [kg_bruto] [kg_neto] Gross/Net...
  function parsePdfTextLocally(text, dob, dat) {
    var rolne = [];
    var dobavljac = dob || "";
    if(!dobavljac) {
      var sm = text.match(/(Rossella|Taghleef|Treofan|Jindal|UFlex|Kopafilm|Manucor)/i);
      if(sm) dobavljac = sm[0];
    }
    var datum = dat || new Date().toLocaleDateString("sr-RS");

    // Italian format: 12.258 = 12258, 1.017 = 1017
    function parseIt(s) {
      s = String(s||"").trim().split(",")[0];
      var m = s.match(/^(\d{1,3})\.(\d{3})$/);
      if(m) return parseInt(m[1])*1000 + parseInt(m[2]);
      return parseFloat(s.replace(/\./g,"").replace(",",".")) || 0;
    }

    // Prepoznaj tip i gsm
    function getTipGsm(chunk) {
      if(/055g/i.test(chunk)) return {tip:"CC White 55g",deb:0,gsm:55};
      if(/060g/i.test(chunk)) return {tip:"CC White 60g",deb:0,gsm:60};
      if(/070g/i.test(chunk)) return {tip:"CC White 70g",deb:0,gsm:70};
      if(/080g/i.test(chunk)) return {tip:"CC White 80g",deb:0,gsm:80};
      if(/CLAY COATED/i.test(chunk)) {
        var gm=chunk.match(/0(\d{2})g/i);
        return {tip:"CC White "+(gm?gm[1]+"g":""),deb:0,gsm:gm?parseInt(gm[1]):60};
      }
      if(/FXPU/i.test(chunk)) return {tip:"FXPU",deb:29,gsm:0};
      if(/FXCB/i.test(chunk)) return {tip:"FXCB",deb:30,gsm:0};
      if(/FXC/i.test(chunk))  return {tip:"FXC",deb:30,gsm:0};
      if(/BOPP SEDEF/i.test(chunk)) return {tip:"BOPP SEDEF",deb:20,gsm:0};
      if(/BOPP/i.test(chunk)) return {tip:"BOPP",deb:20,gsm:0};
      if(/OPP/i.test(chunk))  return {tip:"OPP",deb:30,gsm:0};
      if(/PET/i.test(chunk))  return {tip:"PET",deb:12,gsm:0};
      if(/CPP/i.test(chunk))  return {tip:"CPP",deb:20,gsm:0};
      if(/LDPE|LLDPE/i.test(chunk)) return {tip:"LDPE",deb:40,gsm:0};
      if(/PA.?PE/i.test(chunk)) return {tip:"PA/PE",deb:15,gsm:0};
      if(/PAPIR|PAPER|SILICON/i.test(chunk)) return {tip:"Papir silikonizani",deb:0,gsm:65};
      if(/ALU/i.test(chunk))  return {tip:"ALU",deb:9,gsm:0};
      return null;
    }

    // Split po "Pallet :" - svaki blok sadrzi podatke za jednu rolnu
    var blocks = text.split(/Pallet\s*:/i);

    for(var i=1; i<blocks.length; i++) {
      var block = blocks[i];

      // Palet broj
      var palM = block.match(/^\s*(\d{5,8})/);
      var palet = palM ? palM[1] : "";

      // Sch
      var schM = block.match(/Sch\.?\s*:?\s*(\d{3,6}\/\d{1,3})/i);
      var sch = schM ? schM[1] : "";

      // LOT - format U26/00064
      var lotM = block.match(/\b([A-Z]\d{2}\/\d{5,6})\b/);
      var lot = lotM ? lotM[1] : "";

      // Tip materijala
      var tipObj = getTipGsm(block);
      if(!tipObj) continue;

      // Sirina: 1.440 = 1440 (Italian), ili NNNmm
      var sirina = 1440;
      var sirM = block.match(/\b1[.,]440\b/);
      if(!sirM) {
        var sirM2 = block.match(/\b(\d{3,4})\s*mm\b/i);
        if(sirM2) { var si=parseInt(sirM2[1]); if(si>=100&&si<=5000) sirina=si; }
      }

      // Metraza: DD.DDD BEZ zareza, PRE LOT-a, nije sirina
      // PDF.js vraca: "1.440 17.652,00 12.258,0 12.258 U26/00064 CLAY..."
      // Metraza je poslednji DD.DDD pre LOT-a koji nije sirina
      var lotPos = lot ? block.indexOf(lot) : block.search(/CLAY|BOPP|OPP|PET|CPP|ALU/i);
      var preDesc = lotPos > 5 ? block.substring(0, lotPos) : block;
      var metCands = [];
      var rxMet = /\b(\d{2})\.(\d{3})\b(?!,)/g;
      var mm;
      while((mm=rxMet.exec(preDesc))!==null) {
        var v=parseInt(mm[1])*1000+parseInt(mm[2]);
        if(v!==sirina && v>=1000 && v<=99999) metCands.push(v);
      }
      // Uzimamo poslednji kandidat pre LOT-a (to je metraza/rolni, ne ukupno)
      var metraza = metCands.length>0 ? metCands[metCands.length-1] : 0;

      // Gross/Net: "1.017   994 Gross wt. Kg:   Net wt. Kg:"
      // kg_bruto dolazi neposredno pre "Gross wt.", kg_neto pre "Net wt."
      var gwM = block.match(/([\d.,]+)\s+Gross wt\.?\s*Kg\s*:/i);
      var nwM = block.match(/([\d.,]+)\s+Net wt\.?\s*Kg\s*:/i);
      var kg_bruto = gwM ? parseIt(gwM[1]) : 0;
      var kg_neto  = nwM ? parseIt(nwM[1]) : 0;

      // Auto-izracun kg po koeficijentu ako nema iz PDF-a
      if((!kg_neto||kg_neto<10) && metraza>0) {
        var k = tipObj.gsm>0 ? tipObj.gsm*sirina/1e6 : tipObj.deb*0.91*sirina/1e6;
        if(k>0) {
          kg_neto  = Math.round(metraza*k*10)/10;
          kg_bruto = Math.round(kg_neto*1.025*10)/10;
        }
      }

      if(!metraza) continue;

      rolne.push({
        tip:      tipObj.tip,
        deb:      tipObj.deb||0,
        sirina:   sirina,
        metraza:  metraza,
        metraza_ost: metraza,
        lot:      lot,
        dobavljac: dobavljac,
        datum:    datum,
        sch:      sch,
        palet:    palet,
        kg_bruto: kg_bruto,
        kg_neto:  kg_neto,
        napomena: tipObj.tip+" "+sirina+"mm"+(lot?" LOT:"+lot:""),
        status:   "Na stanju"
      });
    }

    return rolne;
  }


  // ===== EXCEL UPLOAD — SheetJS lokalno =====
  async function handleExcelUpload(e) {
    var file = e.target.files[0];
    if(!file) return;
    setParseLoading(true);
    setParsedRolne([]);

    try {
      // Load SheetJS dynamically
      if(!window.XLSX) {
        await new Promise(function(res, rej) {
          var s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
          s.onload = res; s.onerror = rej;
          document.head.appendChild(s);
        });
      }

      var reader = new FileReader();
      reader.onload = function(ev) {
        try {
          var data = new Uint8Array(ev.target.result);
          var workbook = window.XLSX.read(data, {type:"array"});
          var allText = "";

          // Combine all sheets into text
          workbook.SheetNames.forEach(function(sheetName) {
            var sheet = workbook.Sheets[sheetName];
            var csv = window.XLSX.utils.sheet_to_csv(sheet);
            allText += csv + "\n";
          });

          // Parse the CSV text using the same local parser
          var rolne = parsePdfTextLocally(allText, dobavljacImport, datumImport);

          // Also try CSV row-by-row parsing for structured Excel files
          if(rolne.length === 0) {
            rolne = parseExcelCsvLocally(allText, dobavljacImport, datumImport);
          }

          if(rolne.length > 0) {
            setParsedRolne(rolne);
            msg("Parsirano "+rolne.length+" rolni iz Excel!");
          } else {
            msg("Nema rolni pronađenih. Proveri format fajla.", "err");
          }
        } catch(err) { msg("Greška pri čitanju Excel: "+err.message, "err"); }
        setParseLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch(e) {
      msg("Greška: "+e.message, "err");
      setParseLoading(false);
    }
  }

  // CSV parser za strukturirane Excel packing liste
  function parseExcelCsvLocally(csv, dob, dat) {
    var rolne = [];
    var lines = csv.split("\n");
    var tipovi = ["BOPP","OPP","PET","CPP","LDPE","FXC","FXPU","ALU","Papir","CC White"];

    for(var i=0; i<lines.length; i++) {
      var cols = lines[i].split(",").map(function(c){ return c.replace(/"/g,"").trim(); });
      if(cols.length < 3) continue;

      var tip = "", sirina = 0, metraza = 0, kg = 0, lot = "", sch = "";

      cols.forEach(function(v) {
        if(!v) return;
        // Tip materijala
        for(var j=0; j<tipovi.length; j++) {
          if(v.toUpperCase().indexOf(tipovi[j].toUpperCase()) >= 0) { tip = v; break; }
        }
        // Sirina mm
        var wm = v.match(/^(\d{3,4})$/);
        if(wm && parseInt(wm[1]) >= 100 && parseInt(wm[1]) <= 3000) sirina = parseInt(wm[1]);
        // Metraza
        var mm = v.match(/^(\d{4,6})([.,]\d+)?$/);
        if(mm && parseFloat(mm[1]) > 500) metraza = parseFloat(mm[1]);
        // Kg
        var km = v.match(/^(\d{2,4})([.,]\d+)?$/);
        if(km && parseFloat(km[1]) > 50 && parseFloat(km[1]) < 5000 && metraza > 0 && parseFloat(km[1]) < metraza) kg = parseFloat(km[1]);
        // LOT
        if(/^[A-Z]\d{2}\/\d{4,6}$/.test(v)) lot = v;
        // Sch
        if(/^\d{4,6}\/\d{1,3}$/.test(v)) sch = v;
      });

      if(tip && sirina > 0 && metraza > 0) {
        rolne.push({
          tip, sirina, metraza, metraza_ost: metraza,
          lot, dobavljac: dob||"", datum: dat||new Date().toLocaleDateString("sr-RS"),
          sch, palet:"", kg_bruto: Math.round(kg*1.02), kg_neto: kg,
          napomena:"", status:"Na stanju"
        });
      }
    }
    return rolne;
  }

  // ===== UVOZ ROLNI =====
  async function uvozRolne() {
    if(!parsedRolne.length) return;
    setSaving(true);
    try {
      var inserts = parsedRolne.map(function(r, i) {
        var br = "R-"+new Date().getFullYear()+"-"+(r.sch||String(Date.now()+i).slice(-5));
        return Object.assign({}, r, {
          br_rolne: br,
          dobavljac: dobavljacImport || r.dobavljac || "",
          datum: datumImport,
        });
      });
      var res = await supabase.from("magacin").insert(inserts);
      if(res.error) throw res.error;
      msg("✅ Uvezeno "+inserts.length+" rolni!");
      setParsedRolne([]);
      loadRolne();
      setTab("stanje");
    } catch(e) { msg("Greška: "+e.message, "err"); }
    setSaving(false);
  }

  // ===== RUCNI UNOS =====
  async function dodajRolnu() {
    if(!form.tip || !form.sirina || !form.metraza) {
      msg("Tip, širina i metraža su obavezni!", "err"); return;
    }
    setSaving(true);
    try {
      var sch = form.sch || "";
      var suffix = sch ? sch.replace("/","-") : String(Date.now()).slice(-5);
      var brRolne = "R-"+new Date().getFullYear()+"-"+suffix;
      var res = await supabase.from("magacin").insert([{
        br_rolne: brRolne, tip:form.tip, deb:+form.deb||0, sirina:+form.sirina,
        metraza:+form.metraza, metraza_ost:+form.metraza,
        kg_bruto:+form.kg_bruto||0, kg_neto:+form.kg_neto||0,
        lot:form.lot, dobavljac:form.dobavljac, datum:form.datum,
        sch:form.sch, palet:form.palet, napomena:form.napomena,
        status:"Na stanju"
      }]);
      if(res.error) throw res.error;
      msg("Rolna "+brRolne+" dodata!");
      setForm({tip:"",deb:"",sirina:"",metraza:"",gsm:"",kg_bruto:"",kg_neto:"",lot:"",dobavljac:"",datum:dnow(),sch:"",palet:"",napomena:""});
      loadRolne();
      setTab("stanje");
    } catch(e) { msg("Greška: "+e.message, "err"); }
    setSaving(false);
  }

  async function promeniStatus(id, val) {
    try {
      await supabase.from("magacin").update({status:val}).eq("id",id);
      setRolne(function(prev){ return prev.map(function(r){ return r.id===id?Object.assign({},r,{status:val}):r; }); });
    } catch(e) { msg("Greška!", "err"); }
  }

  var filtrirane = rolne.filter(function(r) {
    var stOk = filterStatus==="sve" || (filterStatus==="aktivne" ? r.status!=="Iskorišćeno" : r.status==="Iskorišćeno");
    return stOk && (!filterTip||r.tip===filterTip) && (!filterSirina||String(r.sirina)===filterSirina);
  });

  var naStanju = rolne.filter(function(r){ return r.status==="Na stanju"; });
  var ukM = naStanju.reduce(function(s,r){ return s+(r.metraza_ost||0); }, 0);
  var ukKg = naStanju.reduce(function(s,r){ return s+(r.kg_neto||0); }, 0);
  var tipovi = [...new Set(rolne.map(function(r){ return r.tip; }))].sort();
  var sirine = [...new Set(rolne.filter(function(r){ return !filterTip||r.tip===filterTip; }).map(function(r){ return r.sirina; }))].sort(function(a,b){return a-b;});

  var stBg = {"Na stanju":"#dcfce7","Rezervisano":"#fef3c7","Delimično":"#dbeafe","Iskorišćeno":"#f1f5f9"};
  var stCl = {"Na stanju":"#166534","Rezervisano":"#92400e","Delimično":"#1e40af","Iskorišćeno":"#94a3b8"};

  return (
    <div>
      {/* QR Modal */}
      {qrRolna && (
        <div onClick={function(){setQrRolna(null);}} style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={function(e){e.stopPropagation();}} style={{background:"#fff",borderRadius:16,padding:32,textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.3)",maxWidth:340}}>
            <div style={{fontSize:13,color:"#64748b",marginBottom:4}}>QR kod za rolnu</div>
            <div style={{fontSize:20,fontWeight:800,color:"#1d4ed8",marginBottom:16}}>{qrRolna.br_rolne}</div>
            <div style={{display:"inline-block",background:"#fff",padding:12,borderRadius:10,border:"2px solid #e2e8f0",marginBottom:16}}>
              <QRRolna brRolne={qrRolna.br_rolne} size={200}/>
            </div>
            <div style={{fontSize:12,color:"#64748b",marginBottom:4}}>{qrRolna.tip} {qrRolna.deb>0?qrRolna.deb+"µ":""} · {qrRolna.sirina}mm</div>
            <div style={{fontSize:12,color:"#64748b",marginBottom:4}}>Metraža: <b>{(qrRolna.metraza_ost||qrRolna.metraza||0).toLocaleString()}m</b> · {qrRolna.kg_neto||"—"} kg neto</div>
            {qrRolna.lot && <div style={{fontSize:12,color:"#1d4ed8",marginBottom:4}}>LOT: {qrRolna.lot}</div>}
            {qrRolna.sch && <div style={{fontSize:12,color:"#64748b",marginBottom:16}}>Sch.: {qrRolna.sch} · {qrRolna.palet||"—"}</div>}
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              <button onClick={function(){window.print();}} style={{padding:"8px 18px",borderRadius:8,border:"none",background:"#1d4ed8",color:"#fff",fontWeight:700,cursor:"pointer"}}>🖨️ Štampaj</button>
              <button onClick={function(){setQrRolna(null);}} style={{padding:"8px 18px",borderRadius:8,border:"1px solid #e2e8f0",background:"#fff",color:"#64748b",fontWeight:700,cursor:"pointer"}}>Zatvori</button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
        <h2 style={{margin:0,fontSize:20,fontWeight:800}}>🏭 Magacin</h2>
        <div style={{display:"flex",gap:6}}>
          {[["stanje","📋 Stanje"],["prijem","➕ Prijem"],["analiza","📊 Analiza"]].map(function(t){
            return <button key={t[0]} onClick={function(){setTab(t[0]);}} style={{padding:"7px 14px",borderRadius:7,border:tab===t[0]?"none":"1px solid #e2e8f0",cursor:"pointer",fontSize:12,fontWeight:700,background:tab===t[0]?"#1d4ed8":"#fff",color:tab===t[0]?"#fff":"#64748b"}}>{t[1]}</button>;
          })}
        </div>
      </div>

      {/* STAT */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:16}}>
        {[["📦",naStanju.length,"Rolni na stanju","#1d4ed8"],["📏",Math.round(ukM).toLocaleString()+" m","Ukupno metara","#059669"],["⚖️",Math.round(ukKg).toLocaleString()+" kg","Ukupno kg","#7c3aed"],["🧪",tipovi.length,"Tipova materijala","#f59e0b"]].map(function(x){
          return (
            <div key={x[2]} style={Object.assign({},card,{borderLeft:"4px solid "+x[3],padding:"14px 16px"})}>
              <div style={{fontSize:22,marginBottom:4}}>{x[0]}</div>
              <div style={{fontSize:20,fontWeight:800,color:x[3]}}>{x[1]}</div>
              <div style={{fontSize:11,color:"#64748b"}}>{x[2]}</div>
            </div>
          );
        })}
      </div>

      {/* ===== STANJE ===== */}
      {tab==="stanje" && (
        <div style={card}>
          <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{fontSize:14,fontWeight:700,flex:1}}>Stanje magacina ({filtrirane.length} rolni)</div>
            <select style={Object.assign({},inp,{width:180})} value={filterTip} onChange={function(e){setFilterTip(e.target.value);setFilterSirina("");}}>
              <option value="">Svi materijali</option>
              {tipovi.map(function(t){return <option key={t} value={t}>{t}</option>;})}
            </select>
            <select style={Object.assign({},inp,{width:120})} value={filterSirina} onChange={function(e){setFilterSirina(e.target.value);}}>
              <option value="">Sve širine</option>
              {sirine.map(function(s){return <option key={s} value={s}>{s}mm</option>;})}
            </select>
            <select style={Object.assign({},inp,{width:140})} value={filterStatus} onChange={function(e){setFilterStatus(e.target.value);}}>
              <option value="aktivne">Aktivne</option>
              <option value="sve">Sve</option>
              <option value="iskorisc">Iskorišćene</option>
            </select>
          </div>

          {loading ? (
            <div style={{textAlign:"center",padding:40,color:"#94a3b8"}}>⏳ Učitavam...</div>
          ) : filtrirane.length===0 ? (
            <div style={{textAlign:"center",padding:40,color:"#94a3b8"}}>
              <div style={{fontSize:36,marginBottom:10}}>📦</div>
              <div style={{marginBottom:12}}>Nema rolni.</div>
              <button onClick={function(){setTab("prijem");}} style={{padding:"10px 20px",borderRadius:8,border:"none",background:"#1d4ed8",color:"#fff",fontWeight:700,cursor:"pointer"}}>+ Prijem rolne</button>
            </div>
          ) : (
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead>
                  <tr style={{borderBottom:"2px solid #e2e8f0"}}>
                    {["QR","Br. rolne","Tip","Deb (µ)","Širina","Ostalo (m)","Kg neto","LOT","Sch.","Lokacija","Datum","Status",""].map(function(h){
                      return <th key={h} style={{padding:"9px 8px",textAlign:"left",color:"#64748b",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filtrirane.map(function(r){
                    return (
                      <tr key={r.id} style={{borderBottom:"1px solid #f1f5f9",opacity:r.status==="Iskorišćeno"?0.5:1}}>
                        <td style={{padding:"4px",cursor:"pointer"}} onClick={function(){setQrRolna(r);}} title="Klikni za QR modal">
                          {r.br_rolne && <QRRolna brRolne={r.br_rolne} size={52}/>}
                        </td>
                        <td style={{padding:"8px",fontWeight:700,color:"#1d4ed8",whiteSpace:"nowrap"}}>{r.br_rolne}</td>
                        <td style={{padding:"8px",fontWeight:600}}>{r.tip}</td>
                        <td style={{padding:"8px",color:"#7c3aed",fontWeight:600}}>{r.deb>0?r.deb+"µ":"—"}</td>
                        <td style={{padding:"8px"}}>{r.sirina}mm</td>
                        <td style={{padding:"8px",fontWeight:700,color:(r.metraza_ost||0)<(r.metraza||1)*0.2?"#ef4444":"#059669"}}>
                          {(r.metraza_ost||r.metraza||0).toLocaleString()}m
                          {r.metraza&&r.metraza_ost<r.metraza&&<div style={{fontSize:9,color:"#94a3b8"}}>od {r.metraza.toLocaleString()}m</div>}
                        </td>
                        <td style={{padding:"8px"}}>{r.kg_neto?r.kg_neto+" kg":"—"}</td>
                        <td style={{padding:"8px",color:"#64748b"}}>{r.lot||"—"}</td>
                        <td style={{padding:"8px",color:"#64748b"}}>{r.sch||"—"}</td>
                        <td style={{padding:"8px",color:"#64748b"}}>{r.palet||"—"}</td>
                        <td style={{padding:"8px",color:"#64748b",whiteSpace:"nowrap"}}>{r.datum}</td>
                        <td style={{padding:"8px"}}>
                          <span style={{background:stBg[r.status]||"#f1f5f9",color:stCl[r.status]||"#64748b",borderRadius:6,padding:"2px 8px",fontWeight:700,fontSize:10}}>{r.status}</span>
                        </td>
                        <td style={{padding:"8px"}}>
                          <select style={{padding:"3px 6px",borderRadius:5,border:"1px solid #e2e8f0",fontSize:10,cursor:"pointer",background:"#f8fafc"}}
                            value={r.status} onChange={function(e){var v=e.target.value;promeniStatus(r.id,v);}}>
                            <option>Na stanju</option><option>Rezervisano</option><option>Delimično</option><option>Iskorišćeno</option>
                          </select>
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

      {/* ===== PRIJEM ===== */}
      {tab==="prijem" && (
        <div>
          {/* Sub-tabs */}
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            {[["pdf","📄 Uvoz iz PDF"],["excel","📊 Uvoz iz Excel"],["rucni","✍️ Ručni unos"]].map(function(t){
              return <button key={t[0]} onClick={function(){setImportTab(t[0]);setParsedRolne([]);}} style={{padding:"8px 16px",borderRadius:8,border:importTab===t[0]?"none":"1px solid #e2e8f0",cursor:"pointer",fontSize:12,fontWeight:700,background:importTab===t[0]?"#0f172a":"#fff",color:importTab===t[0]?"#fff":"#64748b"}}>{t[1]}</button>;
            })}
          </div>

          {/* Dobavljac + datum za import */}
          {(importTab==="pdf"||importTab==="excel") && (
            <div style={Object.assign({},card,{marginBottom:14})}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Podaci za uvoz</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><label style={lbl}>Dobavljač</label><input style={inp} value={dobavljacImport} onChange={function(e){setDobavljacImport(e.target.value);}} placeholder="npr. Rossella S.p.A."/></div>
                <div><label style={lbl}>Datum prijema</label><input style={inp} value={datumImport} onChange={function(e){setDatumImport(e.target.value);}}/></div>
              </div>
            </div>
          )}

          {/* PDF UVOZ */}
          {importTab==="pdf" && (
            <div style={card}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:4,color:"#1d4ed8"}}>📄 Uvoz iz Packing Liste (PDF)</div>
              <div style={{fontSize:12,color:"#64748b",marginBottom:16}}>Učitaj PDF packing listu — sistem automatski prepoznaje sve rolne, metraze, LOT brojeve, Sch. i težine.</div>

              <div style={{border:"2px dashed #bfdbfe",borderRadius:10,padding:24,textAlign:"center",background:"#f8fafc",marginBottom:14,cursor:"pointer"}} onClick={function(){document.getElementById("pdfInput").click();}}>
                <div style={{fontSize:36,marginBottom:8}}>📤</div>
                <div style={{fontWeight:700,fontSize:14,color:"#1d4ed8",marginBottom:4}}>Klikni ili prevuci PDF ovde</div>
                <div style={{fontSize:11,color:"#94a3b8"}}>Podržani formati: PDF packing liste (Rossella, Taghleef, Jindal, itd.)</div>
                <input id="pdfInput" type="file" accept=".pdf" style={{display:"none"}} onChange={handlePdfUpload}/>
              </div>

              {parseLoading && (
                <div style={{textAlign:"center",padding:20,color:"#1d4ed8"}}>
                  <div style={{fontSize:24,marginBottom:8}}>🤖</div>
                  <div style={{fontWeight:700}}>AI parsira packing listu...</div>
                  <div style={{fontSize:11,color:"#94a3b8",marginTop:4}}>Prepoznajem rolne, metraže, LOT-ove...</div>
                </div>
              )}

              {parsedRolne.length>0 && (
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#059669"}}>✅ Pronađeno {parsedRolne.length} rolni</div>
                    <button onClick={uvozRolne} disabled={saving} style={{padding:"9px 20px",borderRadius:8,border:"none",background:"#059669",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",opacity:saving?0.7:1}}>
                      {saving?"⏳ Uvoz...":"💾 Uvezi sve u magacin"}
                    </button>
                  </div>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                      <thead><tr style={{background:"#f8fafc",borderBottom:"1px solid #e2e8f0"}}>
                        {["Tip","Deb (µ)","Širina","Metraža","Kg neto","LOT","Sch."].map(function(h){
                          return <th key={h} style={{padding:"6px 8px",textAlign:"left",color:"#64748b",fontWeight:600}}>{h}</th>;
                        })}
                      </tr></thead>
                      <tbody>
                        {parsedRolne.map(function(r,i){
                          return (
                            <tr key={i} style={{borderBottom:"1px solid #f1f5f9"}}>
                              <td style={{padding:"6px 8px",fontWeight:700,color:"#059669"}}>{r.tip}</td>
                              <td style={{padding:"6px 8px",color:"#7c3aed",fontWeight:600}}>{r.deb>0?r.deb+"µ":"—"}</td>
                              <td style={{padding:"6px 8px"}}>{r.sirina}mm</td>
                              <td style={{padding:"6px 8px",color:"#059669",fontWeight:700}}>{(r.metraza||0).toLocaleString()}m</td>
                              <td style={{padding:"6px 8px",fontWeight:700}}>{r.kg_neto||"?"} kg</td>
                              <td style={{padding:"6px 8px",color:"#1d4ed8"}}>{r.lot||"—"}</td>
                              <td style={{padding:"6px 8px"}}>{r.sch||"—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div style={{marginTop:10,padding:10,background:"#f0fdf4",borderRadius:6,fontSize:11,color:"#166534"}}>
                    Ukupno: {parsedRolne.reduce(function(s,r){return s+(r.metraza||0);},0).toLocaleString()}m &nbsp;·&nbsp;
                    {Math.round(parsedRolne.reduce(function(s,r){return s+(r.kg_neto||0);},0)).toLocaleString()} kg
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EXCEL UVOZ */}
          {importTab==="excel" && (
            <div style={card}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:4,color:"#059669"}}>📊 Uvoz iz Excel/CSV</div>
              <div style={{fontSize:12,color:"#64748b",marginBottom:16}}>Učitaj Excel ili CSV packing listu. AI automatski prepoznaje strukturu i uvozi rolne.</div>

              <div style={{border:"2px dashed #bbf7d0",borderRadius:10,padding:24,textAlign:"center",background:"#f8fafc",marginBottom:14,cursor:"pointer"}} onClick={function(){document.getElementById("excelInput").click();}}>
                <div style={{fontSize:36,marginBottom:8}}>📊</div>
                <div style={{fontWeight:700,fontSize:14,color:"#059669",marginBottom:4}}>Klikni ili prevuci Excel/CSV ovde</div>
                <div style={{fontSize:11,color:"#94a3b8"}}>Podržano: .xlsx, .xls, .csv, .pdf (sa tabelama)</div>
                <input id="excelInput" type="file" accept=".xlsx,.xls,.csv,.pdf" style={{display:"none"}} onChange={handleExcelUpload}/>
              </div>

              {parseLoading && (
                <div style={{textAlign:"center",padding:20,color:"#059669"}}>
                  <div style={{fontSize:24,marginBottom:8}}>🤖</div>
                  <div style={{fontWeight:700}}>AI parsira fajl...</div>
                </div>
              )}

              {parsedRolne.length>0 && (
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#059669"}}>✅ Pronađeno {parsedRolne.length} rolni</div>
                    <button onClick={uvozRolne} disabled={saving} style={{padding:"9px 20px",borderRadius:8,border:"none",background:"#059669",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                      {saving?"⏳ Uvoz...":"💾 Uvezi sve u magacin"}
                    </button>
                  </div>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                      <thead><tr style={{background:"#f8fafc",borderBottom:"1px solid #e2e8f0"}}>
                        {["Tip","Širina","Metraža","Kg neto","LOT","Sch."].map(function(h){
                          return <th key={h} style={{padding:"6px 8px",textAlign:"left",color:"#64748b",fontWeight:600}}>{h}</th>;
                        })}
                      </tr></thead>
                      <tbody>
                        {parsedRolne.map(function(r,i){
                          return (
                            <tr key={i} style={{borderBottom:"1px solid #f1f5f9"}}>
                              <td style={{padding:"6px 8px",fontWeight:600}}>{r.tip}</td>
                              <td style={{padding:"6px 8px"}}>{r.sirina}mm</td>
                              <td style={{padding:"6px 8px",color:"#059669",fontWeight:600}}>{(r.metraza||0).toLocaleString()}m</td>
                              <td style={{padding:"6px 8px"}}>{r.kg_neto||"—"} kg</td>
                              <td style={{padding:"6px 8px",color:"#1d4ed8"}}>{r.lot||"—"}</td>
                              <td style={{padding:"6px 8px"}}>{r.sch||"—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RUCNI UNOS */}
          {importTab==="rucni" && (
            <div style={card}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:16,color:"#7c3aed"}}>✍️ Ručni unos rolne</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
                <div style={{gridColumn:"span 2"}}>
                  <label style={lbl}>Tip materijala *</label>
                  <select style={inp} value={form.tip} onChange={function(e){
                    var v=e.target.value;
                    setForm(function(f){
                      // Reset deb kad se menja tip
                      return Object.assign({},f,{tip:v,deb:"",gsm:"",kg_neto:"",kg_bruto:""});
                    });
                  }}>
                    <option value="">-- Izaberi tip --</option>
                    {MAT_TIPOVI.map(function(t){return <option key={t} value={t}>{t}</option>;})}
                  </select>
                </div>
  
                {/* Debljina - padajuca lista sa µ simbolom */}
                <div>
                  <label style={lbl}>Debljina (µ)</label>
                  <select style={Object.assign({},inp,{color:form.tip&&(MAT_DATA_MAG[form.tip]||[]).length>0?"#1e293b":"#94a3b8"})}
                    value={form.deb}
                    disabled={!form.tip}
                    onChange={function(e){
                      var v=e.target.value;
                      setForm(function(f){
                        // Auto-izracun gsm iz MAT_DATA_MAG
                        var arr=MAT_DATA_MAG[f.tip]||[];
                        var obj=arr.find(function(o){return String(o.d)===String(v);});
                        var gsmVal=obj?obj.t:f.gsm;
                        var kg=izracunajKg(f.tip,v,f.sirina,f.metraza);
                        return Object.assign({},f,{deb:v,gsm:gsmVal,
                          kg_neto:kg.kg_neto||f.kg_neto,
                          kg_bruto:kg.kg_bruto||f.kg_bruto});
                      });
                    }}>
                    <option value="">-- Izaberi µ --</option>
                    {(MAT_DATA_MAG[form.tip]||[]).map(function(o){
                      return <option key={o.d} value={o.d}>
                        {o.d>0?o.d+"µ":"— ("+o.t+" g/m²)"} &nbsp; {o.d>0?"("+o.t+" g/m²)":""}
                      </option>;
                    })}
                  </select>
                  {form.tip && (MAT_DATA_MAG[form.tip]||[]).length===0 && (
                    <input type="number" style={Object.assign({},inp,{marginTop:4})} value={form.deb}
                      placeholder="unesi ručno µ"
                      onChange={function(e){
                        var v=e.target.value;
                        setForm(function(f){
                          var kg=izracunajKg(f.tip,v,f.sirina,f.metraza);
                          return Object.assign({},f,{deb:v,kg_neto:kg.kg_neto||f.kg_neto,kg_bruto:kg.kg_bruto||f.kg_bruto});
                        });
                      }}/>
                  )}
                  {form.deb>0 && (
                    <div style={{fontSize:10,color:"#7c3aed",marginTop:2,fontWeight:600}}>
                      {form.deb}µ = {(MAT_DATA_MAG[form.tip]||[]).find(function(o){return String(o.d)===String(form.deb);})?
                        (MAT_DATA_MAG[form.tip]||[]).find(function(o){return String(o.d)===String(form.deb);}).t+" g/m²":"—"}
                    </div>
                  )}
                </div>

                {/* Sirina */}
                <div>
                  <label style={lbl}>Širina (mm) *</label>
                  <input type="number" style={inp} value={form.sirina} placeholder="npr. 1440"
                    onChange={function(e){
                      var v=e.target.value;
                      setForm(function(f){
                        var kg=izracunajKg(f.tip,f.deb,v,f.metraza);
                        return Object.assign({},f,{sirina:v,kg_neto:kg.kg_neto||f.kg_neto,kg_bruto:kg.kg_bruto||f.kg_bruto});
                      });
                    }}/>
                </div>

                {/* Metraza */}
                <div>
                  <label style={lbl}>Metraža (m) *</label>
                  <input type="number" style={inp} value={form.metraza} placeholder="npr. 12258"
                    onChange={function(e){
                      var v=e.target.value;
                      setForm(function(f){
                        var kg=izracunajKg(f.tip,f.deb,f.sirina,v);
                        return Object.assign({},f,{metraza:v,kg_neto:kg.kg_neto||f.kg_neto,kg_bruto:kg.kg_bruto||f.kg_bruto});
                      });
                    }}/>
                </div>

                {/* g/m2 prikaz - automatski iz MAT_DATA_MAG */}
                <div>
                  <label style={lbl}>g/m² (spec. težina)</label>
                  <div style={Object.assign({},inp,{background:"#f1f5f9",color:"#7c3aed",fontWeight:600})}>
                    {(function(){
                      if(!form.tip) return "—";
                      var arr=MAT_DATA_MAG[form.tip]||[];
                      if(form.deb) {
                        var obj=arr.find(function(o){return String(o.d)===String(form.deb);});
                        if(obj) return obj.t+" g/m²";
                      }
                      if(arr.length===1&&arr[0].d===0) return arr[0].t+" g/m²";
                      return "— (izaberi µ)";
                    })()}
                  </div>
                </div>

                {/* Auto-izracunato kg */}
                {(form.kg_neto>0||form.kg_bruto>0) && (
                  <div style={{gridColumn:"span 2",padding:"8px 12px",background:"#f0fdf4",borderRadius:6,border:"1px solid #bbf7d0",fontSize:12,display:"flex",gap:16,alignItems:"center"}}>
                    <span style={{color:"#166534",fontWeight:700}}>⚖️ Auto-izračun:</span>
                    <span>Neto: <b>{form.kg_neto} kg</b></span>
                    <span>Bruto: <b>{form.kg_bruto} kg</b></span>
                    <button onClick={function(){setForm(function(f){return Object.assign({},f,{kg_neto:"",kg_bruto:""});});}} style={{marginLeft:"auto",fontSize:10,padding:"2px 8px",borderRadius:4,border:"1px solid #bbf7d0",background:"#fff",cursor:"pointer",color:"#64748b"}}>Unesi ručno</button>
                  </div>
                )}

                {/* Kg polja - samo ako nije auto */}
                {!(form.kg_neto>0||form.kg_bruto>0) && (
                  <>
                    <div>
                      <label style={lbl}>Bruto kg (ručno)</label>
                      <input type="number" style={inp} value={form.kg_bruto} onChange={function(e){var v=e.target.value;setForm(function(f){return Object.assign({},f,{kg_bruto:v});});}}/>
                    </div>
                    <div>
                      <label style={lbl}>Neto kg (ručno)</label>
                      <input type="number" style={inp} value={form.kg_neto} onChange={function(e){var v=e.target.value;setForm(function(f){return Object.assign({},f,{kg_neto:v});});}}/>
                    </div>
                  </>
                )}

                {[
                  ["LOT broj","lot","text","npr. U26/00064"],
                  ["Dobavljač","dobavljac","text","npr. Rossella S.p.A."],
                  ["Datum prijema","datum","text",""],
                  ["Sch. broj","sch","text","npr. 61905/7"],
                  ["Lokacija / Palet","palet","text","npr. B5, MM..."],
                ].map(function(x){
                  return (
                    <div key={x[0]}>
                      <label style={lbl}>{x[0]}</label>
                      <input type={x[2]} style={inp} value={form[x[1]]} placeholder={x[3]}
                        onChange={function(e){var v=e.target.value;var k=x[1];setForm(function(f){return Object.assign({},f,{[k]:v});});}
                      }/>
                    </div>
                  );
                })}
              </div>
              <div style={{marginTop:12}}>
                <label style={lbl}>Napomena</label>
                <textarea style={Object.assign({},inp,{height:60,resize:"vertical"})} value={form.napomena}
                  onChange={function(e){var v=e.target.value;setForm(function(f){return Object.assign({},f,{napomena:v});});}}/>
              </div>
              <div style={{marginTop:16,display:"flex",gap:10}}>
                <button onClick={dodajRolnu} disabled={saving}
                  style={{padding:"10px 24px",borderRadius:8,border:"none",background:"#7c3aed",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",opacity:saving?0.7:1}}>
                  {saving?"⏳ Čuvam...":"💾 Dodaj u magacin"}
                </button>
                <button onClick={function(){setTab("stanje");}}
                  style={{padding:"10px 18px",borderRadius:8,border:"1px solid #e2e8f0",background:"#fff",color:"#64748b",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                  Otkaži
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== ANALIZA ===== */}
      {tab==="analiza" && (
        <div>
          <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>📊 Stanje po materijalu i širini</div>
          {tipovi.length===0 ? (
            <div style={Object.assign({},card,{textAlign:"center",padding:40,color:"#94a3b8"})}>Nema podataka.</div>
          ) : tipovi.map(function(tip){
            var rTip = rolne.filter(function(r){ return r.tip===tip && r.status!=="Iskorišćeno"; });
            if(rTip.length===0) return null;
            var sirineT = [...new Set(rTip.map(function(r){ return r.sirina; }))].sort(function(a,b){return a-b;});
            var totM = rTip.reduce(function(s,r){return s+(r.metraza_ost||0);},0);
            var totKg = rTip.reduce(function(s,r){return s+(r.kg_neto||0);},0);
            return (
              <div key={tip} style={{marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",background:"#0f172a",borderRadius:"10px 10px 0 0",color:"#fff"}}>
                  <span style={{fontWeight:800,fontSize:14}}>🧪 {tip}</span>
                  <span style={{fontSize:12,color:"#94a3b8"}}>{rTip.length} rolni</span>
                  <span style={{marginLeft:"auto",fontWeight:700,fontSize:13,color:"#93c5fd"}}>
                    {Math.round(totM).toLocaleString()}m · {Math.round(totKg).toLocaleString()}kg
                  </span>
                </div>
                <div style={{background:"#fff",border:"1px solid #e2e8f0",borderTop:"none",borderRadius:"0 0 10px 10px"}}>
                  {sirineT.map(function(sir){
                    var rSir = rTip.filter(function(r){ return r.sirina===sir; });
                    var mSir = rSir.reduce(function(s,r){return s+(r.metraza_ost||0);},0);
                    var kgSir = rSir.reduce(function(s,r){return s+(r.kg_neto||0);},0);
                    return (
                      <div key={sir} style={{padding:"10px 16px",borderBottom:"1px solid #f1f5f9",display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
                        <div style={{background:"#1d4ed810",color:"#1d4ed8",borderRadius:6,padding:"4px 10px",fontWeight:800,fontSize:13,flexShrink:0}}>{sir}mm</div>
                        <div style={{flex:1,display:"flex",gap:5,flexWrap:"wrap"}}>
                          {rSir.map(function(r){
                            return (
                              <span key={r.id} style={{fontSize:11,background:stBg[r.status]||"#f1f5f9",color:stCl[r.status]||"#64748b",borderRadius:5,padding:"2px 7px",fontWeight:600}}>
                                {r.br_rolne} · {(r.metraza_ost||0).toLocaleString()}m
                                {r.lot&&<span style={{color:"#94a3b8"}}> · {r.lot}</span>}
                              </span>
                            );
                          })}
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontSize:14,fontWeight:800,color:"#059669"}}>{Math.round(mSir).toLocaleString()}m</div>
                          <div style={{fontSize:11,color:"#64748b"}}>{Math.round(kgSir).toLocaleString()}kg · {rSir.length} rolni</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
