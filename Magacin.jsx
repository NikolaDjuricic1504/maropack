import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

var dnow = function() { return new Date().toLocaleDateString("sr-RS"); };

var MAT_TIPOVI = [
  "BOPP","BOPP SEDEF","BOPP BELI","LDPE","CPP","PET","OPA","OPP","PLA","HDPE","ALU",
  "CELULOZA","CELOFAN","PA","PA/PE","FXC","FXCB","FXCU","FXCM","FXCMT","FXCMTS",
  "FXCFM","FXCAF","FXCLS","FXCMB","FXCWP","FXCW","FXCHFM","FXPU","FXPF","FXPA",
  "FXPMT","FXPBR","FXPLA","FXPLF","FXPFM","FXPFB","FXA","FXS","FXAA",
  "OPP30","OPP35","HSD31","BTHL BOPP","CC White 55g","CC White 60g",
  "Papir","Papir silikonizani"
];

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

export default function Magacin({msg, inp, card, lbl, user}) {
  var [rolne, setRolne] = useState([]);
  var [loading, setLoading] = useState(true);
  var [tab, setTab] = useState("stanje");
  var [filterTip, setFilterTip] = useState("");
  var [filterSirina, setFilterSirina] = useState("");
  var [filterStatus, setFilterStatus] = useState("aktivne");
  var [saving, setSaving] = useState(false);

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

  // ===== PDF UPLOAD =====
  async function handlePdfUpload(e) {
    var file = e.target.files[0];
    if(!file) return;
    setParseLoading(true);
    setParsedRolne([]);

    try {
      // Use Claude API to parse PDF
      var reader = new FileReader();
      reader.onload = async function(ev) {
        var base64 = ev.target.result.split(",")[1];
        try {
          var response = await fetch("https://api.anthropic.com/v1/messages", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({
              model:"claude-sonnet-4-20250514",
              max_tokens:4000,
              messages:[{
                role:"user",
                content:[
                  {type:"document", source:{type:"base64", media_type:"application/pdf", data:base64}},
                  {type:"text", text:`Extract all individual rolls from this packing list PDF. Return ONLY a JSON array, no other text. Each roll object must have:
- tip: material type string (e.g. "CC White 55g", "BOPP 20mic", "OPP 30mic", "FXC", "FXPU", etc.)
- sirina: width in mm as integer
- metraza: length in meters as number  
- kg_bruto: gross weight kg as number
- kg_neto: net weight kg as number
- lot: LOT number string (e.g. "U26/00064")
- sch: Sch number string (e.g. "61905/7")
- palet: pallet number string
- dobavljac: supplier name string
Example: [{"tip":"CC White 55g","sirina":1440,"metraza":12258,"kg_bruto":1017,"kg_neto":994,"lot":"U26/00064","sch":"61905/7","palet":"2604676","dobavljac":"Rossella S.p.A."}]`}
                ]
              }]
            })
          });
          var data = await response.json();
          var text = (data.content||[]).map(function(c){return c.text||"";}).join("");
          var clean = text.replace(/```json|```/g,"").trim();
          var parsed = JSON.parse(clean);
          if(Array.isArray(parsed) && parsed.length > 0) {
            // Add default fields
            parsed = parsed.map(function(r) {
              return Object.assign({
                metraza_ost: r.metraza,
                dobavljac: dobavljacImport || r.dobavljac || "",
                datum: datumImport,
                napomena: "",
                status: "Na stanju"
              }, r);
            });
            setParsedRolne(parsed);
            msg("Parsirano "+parsed.length+" rolni iz PDF!");
          } else {
            msg("Nema rolni u PDF!", "err");
          }
        } catch(err) {
          msg("Greška pri parsiranju: "+err.message, "err");
        }
        setParseLoading(false);
      };
      reader.readAsDataURL(file);
    } catch(e) {
      msg("Greška: "+e.message, "err");
      setParseLoading(false);
    }
  }

  // ===== EXCEL UPLOAD =====
  async function handleExcelUpload(e) {
    var file = e.target.files[0];
    if(!file) return;
    setParseLoading(true);
    setParsedRolne([]);

    try {
      var reader = new FileReader();
      reader.onload = async function(ev) {
        var base64 = ev.target.result.split(",")[1];
        try {
          var response = await fetch("https://api.anthropic.com/v1/messages", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({
              model:"claude-sonnet-4-20250514",
              max_tokens:4000,
              messages:[{
                role:"user",
                content:[
                  {type:"document", source:{type:"base64", media_type:"application/pdf", data:base64}},
                  {type:"text", text:`This is a packing list document. Extract all individual rolls/items. Return ONLY a JSON array. Each object: tip (material type), sirina (width mm, integer), metraza (meters, number), kg_bruto, kg_neto, lot, sch, palet, dobavljac. No other text.`}
                ]
              }]
            })
          });
          var data = await response.json();
          var text = (data.content||[]).map(function(c){return c.text||"";}).join("");
          var clean = text.replace(/```json|```/g,"").trim();
          var parsed = JSON.parse(clean);
          if(Array.isArray(parsed)) {
            parsed = parsed.map(function(r){
              return Object.assign({metraza_ost:r.metraza, datum:datumImport, napomena:"", status:"Na stanju"}, r);
            });
            setParsedRolne(parsed);
            msg("Parsirano "+parsed.length+" rolni!");
          }
        } catch(err) { msg("Greška: "+err.message, "err"); }
        setParseLoading(false);
      };
      reader.readAsDataURL(file);
    } catch(e) { setParseLoading(false); }
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
        br_rolne: brRolne, tip:form.tip, sirina:+form.sirina,
        metraza:+form.metraza, metraza_ost:+form.metraza,
        kg_bruto:+form.kg_bruto||0, kg_neto:+form.kg_neto||0,
        lot:form.lot, dobavljac:form.dobavljac, datum:form.datum,
        sch:form.sch, palet:form.palet, napomena:form.napomena,
        status:"Na stanju"
      }]);
      if(res.error) throw res.error;
      msg("Rolna "+brRolne+" dodata!");
      setForm({tip:"",sirina:"",metraza:"",kg_bruto:"",kg_neto:"",lot:"",dobavljac:"",datum:dnow(),sch:"",palet:"",napomena:""});
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
                    {["Br. rolne","Tip","Širina","Ostalo (m)","Kg neto","LOT","Sch.","Lokacija","Datum","Status",""].map(function(h){
                      return <th key={h} style={{padding:"9px 8px",textAlign:"left",color:"#64748b",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filtrirane.map(function(r){
                    return (
                      <tr key={r.id} style={{borderBottom:"1px solid #f1f5f9",opacity:r.status==="Iskorišćeno"?0.5:1}}>
                        <td style={{padding:"8px",fontWeight:700,color:"#1d4ed8",whiteSpace:"nowrap"}}>{r.br_rolne}</td>
                        <td style={{padding:"8px",fontWeight:600}}>{r.tip}</td>
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
                        {["Tip","Širina","Metraža","Kg bruto","Kg neto","LOT","Sch.","Lokacija"].map(function(h){
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
                              <td style={{padding:"6px 8px"}}>{r.kg_bruto||"—"} kg</td>
                              <td style={{padding:"6px 8px"}}>{r.kg_neto||"—"} kg</td>
                              <td style={{padding:"6px 8px",color:"#1d4ed8"}}>{r.lot||"—"}</td>
                              <td style={{padding:"6px 8px"}}>{r.sch||"—"}</td>
                              <td style={{padding:"6px 8px"}}>{r.palet||"—"}</td>
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
                <div>
                  <label style={lbl}>Tip materijala *</label>
                  <select style={inp} value={form.tip} onChange={function(e){var v=e.target.value;setForm(function(f){return Object.assign({},f,{tip:v});});}}>
                    <option value="">-- Izaberi --</option>
                    {MAT_TIPOVI.map(function(t){return <option key={t} value={t}>{t}</option>;})}
                  </select>
                </div>
                {[
                  ["Širina (mm) *","sirina","number","npr. 1440"],
                  ["Metraža (m) *","metraza","number","npr. 12258"],
                  ["Bruto kg","kg_bruto","number",""],
                  ["Neto kg","kg_neto","number",""],
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
