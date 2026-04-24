import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

var dnow = function() { return new Date().toLocaleDateString("sr-RS"); };

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
          var rolne = parsePdfTextLocally(fullText, dobavljacImport, datumImport);
          if(rolne.length > 0) {
            setParsedRolne(rolne);
            msg("Parsirano "+rolne.length+" rolni iz PDF!");
          } else {
            msg("Nema rolni pronađenih u PDF. Pokušaj ručni unos.", "err");
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

  // Pametan univerzalni parser - radi za razlicite formate i velicine rolni
  function parsePdfTextLocally(text, dob, dat) {
    var rolne = [];
    var dobavljac = dob || "";
    if(!dobavljac) {
      var sm = text.match(/(Rossella|Taghleef|Treofan|Jindal|UFlex|Kopafilm|Manucor|Poligal)/i);
      if(sm) dobavljac = sm[0];
    }
    var datum = dat || new Date().toLocaleDateString("sr-RS");

    // PDF.js cesto razdvaja "12.258" na tokene "12" i ".258" koji se spoje sa razmakom
    // Pre parsiranja spoji nazad: "12 .258" -> "12.258", "1 .017" -> "1.017"
    text = text.replace(/(\d)\s+\.(\d{3})\b/g, "$1.$2");

    // Italian number format: 12.258 = 12258, 1.017 = 1017
    function parseIt(s) {
      s = String(s||"").trim();
      if(s.indexOf(",") !== -1) s = s.substring(0, s.indexOf(","));
      var m = s.match(/^(\d{1,3})\.(\d{3})$/);
      if(m) return parseInt(m[1])*1000 + parseInt(m[2]);
      return parseFloat(s.replace(/\./g,"").replace(",",".")) || 0;
    }

    // Gustoca materijala za izracun koeficijenta
    var GUSTOCA = {
      "BOPP":0.905,"OPP":0.905,"CPP":0.905,"PET":1.38,"PA":1.14,
      "LDPE":0.92,"PE":0.92,"HDPE":0.96,"ALU":2.70,
      "FXC":0.92,"FXPU":0.92,"FXCB":0.92,"HSD":0.91
    };

    // kg/m za datu rolnu (koeficijent za izracun)
    function koefKgM(tip, deb, gsm, sirina) {
      if(gsm > 0) return gsm * sirina / 1e6;
      var t = tip.toUpperCase().split(" ")[0];
      var g = GUSTOCA[t] || 0.91;
      if(deb) return deb * g * sirina / 1e6;
      return 0;
    }

    // Prepoznaj tip materijala
    function getTipObj(chunk) {
      if(/CLAY COATED.*055g|CC WHITE.*055/i.test(chunk)) return {tip:"CC White 55g",deb:0,gsm:55};
      if(/CLAY COATED.*060g|CC WHITE.*060/i.test(chunk)) return {tip:"CC White 60g",deb:0,gsm:60};
      if(/CLAY COATED.*070g/i.test(chunk)) return {tip:"CC White 70g",deb:0,gsm:70};
      if(/CLAY COATED.*080g/i.test(chunk)) return {tip:"CC White 80g",deb:0,gsm:80};
      if(/CLAY COATED.*090g/i.test(chunk)) return {tip:"CC White 90g",deb:0,gsm:90};
      if(/CLAY COATED/i.test(chunk)) {
        var gm=chunk.match(/0(\d{2})g/i);
        return {tip:"CC White "+(gm?gm[1]+"g":""),deb:0,gsm:gm?parseInt(gm[1]):60};
      }
      if(/BOPP SEDEF/i.test(chunk)) return {tip:"BOPP SEDEF",deb:20,gsm:0};
      if(/BOPP/i.test(chunk)) {
        var dm=chunk.match(/(\d{2})\s*mic/i); var d=dm?parseInt(dm[1]):20;
        return {tip:"BOPP",deb:d,gsm:0};
      }
      if(/FXPU/i.test(chunk)) return {tip:"FXPU",deb:29,gsm:0};
      if(/FXCB/i.test(chunk)) return {tip:"FXCB",deb:30,gsm:0};
      if(/FXC/i.test(chunk)) return {tip:"FXC",deb:30,gsm:0};
      if(/OPP/i.test(chunk)) {
        var dm=chunk.match(/(\d{2})\s*mic/i); var d=dm?parseInt(dm[1]):30;
        return {tip:"OPP",deb:d,gsm:0};
      }
      if(/PET/i.test(chunk)) return {tip:"PET",deb:12,gsm:0};
      if(/CPP/i.test(chunk)) return {tip:"CPP",deb:20,gsm:0};
      if(/LDPE|LLDPE/i.test(chunk)) return {tip:"LDPE",deb:40,gsm:0};
      if(/PA.?PE/i.test(chunk)) return {tip:"PA/PE",deb:15,gsm:0};
      if(/PAPIR|PAPER|SILICON/i.test(chunk)) return {tip:"Papir silikonizani",deb:0,gsm:65};
      if(/ALU/i.test(chunk)) return {tip:"ALU",deb:9,gsm:0};
      return null;
    }

    // Pametan izracun metaze i kg iz bloka
    function smartParseNums(block, tipObj, sirina) {
      // Eksplicitni Gross/Net iz bloka
      var grossM = block.match(/Gross wt\.?\s*Kg\s*:\s*([\d.,]+)/i);
      var netM = block.match(/Net wt\.?\s*Kg\s*:\s*([\d.,]+)/i);
      var kg_bruto = grossM ? parseIt(grossM[1]) : 0;
      var kg_neto = netM ? parseIt(netM[1]) : 0;

      // Trazi metrazu - Italian DD.DDD format bez decimala
      // Zona pretrage: posle opisa materijala
      var descEnd = block.search(/GN|stampata|Non|LOT/i);
      var zone = descEnd > 0 ? block.substring(descEnd) : block;
      var metraza = 0;

      // 1. Trazimo DD.DDD pattern (Italian hiljadice)
      var itNums = [];
      var rx = /(\d{1,3})\.(\d{3})(?![.,]\d)/g;
      var mm;
      while((mm=rx.exec(zone)) !== null) {
        var v = parseInt(mm[1])*1000 + parseInt(mm[2]);
        // Metraza je > 500m i nije kg
        // Preskoci sirinu i kg vrednosti
        if(v === sirina) continue;
        if(kg_neto && Math.abs(v-kg_neto) < 5) continue;
        if(kg_bruto && Math.abs(v-kg_bruto) < 5) continue;
        if(v >= 500 && v <= 200000) itNums.push(v);
      }
      // VAZNO: uzimamo PRVU vrednost, ne min() - min() bira sirinu (1440) umesto metraze (12258)!
      if(itNums.length > 0) metraza = itNums[0];

      // 2. Ako ne, trazi 5-cifreni broj
      if(!metraza) {
        var m5 = zone.match(/(\d{5,6})/);
        if(m5) { var v=parseInt(m5[1]); if(v>500&&v<500000) metraza=v; }
      }

      // Koeficijent kg/m
      var k = koefKgM(tipObj.tip, tipObj.deb, tipObj.gsm, sirina);

      // Ako nema metraze ali ima kg -> izracunaj po koeficijentu
      if(!metraza && kg_neto > 0 && k > 0) {
        metraza = Math.round(kg_neto / k);
      }

      // Ako nema kg ali ima metrazu -> izracunaj po koeficijentu
      if((!kg_neto || kg_neto < 10) && metraza > 0 && k > 0) {
        kg_neto = Math.round(metraza * k * 10) / 10;
        kg_bruto = Math.round(kg_neto * 1.025 * 10) / 10;
      }

      // Ako ni jedno ni drugo - procena iz sirine i prosecne metraze
      if(!metraza) metraza = 0;

      return {metraza:metraza, kg_bruto:kg_bruto, kg_neto:kg_neto};
    }

    // Sirina: Italian "1.440" ili "NNNmm" ili broj 100-5000
    function parseSirina(block) {
      // Italian format 1.440 = 1440
      var itSir = block.match(/([1-9])\.(\d{3})(?=\s*$|\s*[^.0-9])/);
      if(itSir) {
        var v = parseInt(itSir[1])*1000 + parseInt(itSir[2]);
        if(v >= 100 && v <= 5000) return v;
      }
      // mm format
      var mmSir = block.match(/(\d{3,4})\s*mm/i);
      if(mmSir) { var v=parseInt(mmSir[1]); if(v>=100&&v<=5000) return v; }
      // Broj na kraju bloka
      var endNum = block.match(/(\d{3,4})\s*$/);
      if(endNum) { var v=parseInt(endNum[1]); if(v>=100&&v<=5000) return v; }
      return 1440; // default
    }

    // Razdvoji po "Pallet :" - svaki blok = jedna rolna
    var blocks = text.split(/Pallet\s*:/i);

    for(var i=1; i<blocks.length; i++) {
      var block = blocks[i];

      // Pallet
      var palM = block.match(/^\s*(\d{5,8})/);
      var palet = palM ? palM[1] : "";

      // Sch
      var schM = block.match(/Sch\.?\s*:?\s*(\d{3,6}\/\d{1,3})/i);
      var sch = schM ? schM[1] : "";

      // Tip
      var tipObj = getTipObj(block);
      if(!tipObj) continue;

      // LOT
      var lotM = block.match(/([A-Z]\d{2}\/\d{4,6})/);
      var lot = lotM ? lotM[1] : "";

      // Sirina
      var sirina = parseSirina(block);

      // Metraza i kg - pametan izracun
      var nums = smartParseNums(block, tipObj, sirina);
      if(!nums.metraza) continue;

      rolne.push({
        tip: tipObj.tip,
        deb: tipObj.deb || 0,
        sirina: sirina,
        metraza: nums.metraza,
        metraza_ost: nums.metraza,
        lot: lot,
        dobavljac: dobavljac,
        datum: datum,
        sch: sch,
        palet: palet,
        kg_bruto: nums.kg_bruto,
        kg_neto: nums.kg_neto,
        napomena: tipObj.tip+" "+sirina+"mm"+(lot?" LOT:"+lot:""),
        status: "Na stanju"
      });
    }

    // Ako nema blokova sa Pallet, probaj linijski parsing
    if(rolne.length === 0) {
      var lines = text.split(/[\n\r]+/);
      var currentTip = null;
      for(var j=0; j<lines.length; j++) {
        var line = lines[j];
        var to = getTipObj(line);
        if(to) { currentTip = to; continue; }
        if(!currentTip) continue;
        var sirina2 = parseSirina(line);
        var nums2 = smartParseNums(line, currentTip, sirina2);
        if(nums2.metraza > 500) {
          rolne.push({
            tip:currentTip.tip, deb:currentTip.deb||0, sirina:sirina2,
            metraza:nums2.metraza, metraza_ost:nums2.metraza,
            lot:"", dobavljac:dobavljac, datum:datum, sch:"", palet:"",
            kg_bruto:nums2.kg_bruto, kg_neto:nums2.kg_neto,
            napomena:currentTip.tip+" "+sirina2+"mm", status:"Na stanju"
          });
          currentTip = null;
        }
      }
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
                    {["Br. rolne","Tip","Deb (µ)","Širina","Ostalo (m)","Kg neto","LOT","Sch.","Lokacija","Datum","Status",""].map(function(h){
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
                        {["Tip","Deb (µ)","Širina","Metraža","Kg neto","LOT","Sch.","Lokacija"].map(function(h){
                          return <th key={h} style={{padding:"6px 8px",textAlign:"left",color:"#64748b",fontWeight:600}}>{h}</th>;
                        })}
                      </tr></thead>
                      <tbody>
                        {parsedRolne.map(function(r,i){
                          return (
                            <tr key={i} style={{borderBottom:"1px solid #f1f5f9"}}>
                              <td style={{padding:"6px 8px",fontWeight:600}}>{r.tip}</td>
                              <td style={{padding:"6px 8px",color:"#7c3aed",fontWeight:600}}>{r.deb>0?r.deb+"µ":"—"}</td>
                              <td style={{padding:"6px 8px"}}>{r.sirina}mm</td>
                              <td style={{padding:"6px 8px",color:"#059669",fontWeight:600}}>{(r.metraza||0).toLocaleString()}m</td>
                              <td style={{padding:"6px 8px",fontWeight:600}}>{r.kg_neto||"?"} kg</td>
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
