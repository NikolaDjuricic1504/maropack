// PackingListParser.jsx - AI Parser za sve formate packing lista
import { useState } from "react";
import { supabase } from "./supabase.js";

// 📋 HARDCODED PARSERS za poznate formate (brzi i pouzdani)

// 1. PLASTCHIM-T Parser (Bugarska)
function parsePlastchim(text) {
  var rolne = [];
  var lines = text.split("\n");
  var currentPallet = "";
  var currentOrder = "";
  
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    
    // Pallet number
    if (line.match(/Pallet:\s*(\d+\.\d+)/)) {
      currentPallet = line.match(/Pallet:\s*(\d+\.\d+)/)[1];
    }
    
    // Order number
    if (line.match(/Order No.*?(\d+)/)) {
      currentOrder = line.match(/Order No.*?(\d+)/)[1];
    }
    
    // Roll data line: 7553927 136180.1 FXC 15 1 560 152 780 28 400 614.00 649.00
    var rollMatch = line.match(/^(\d{7,8})\s+[\d.]+\s+([A-Z]+)\s+(\d+)\s+(\d{3,4})\s+\d+\s+\d+\s+([\d,]+)\s+([\d.]+)\s+([\d.]+)/);
    
    if (rollMatch) {
      var rollNo = rollMatch[1];
      var filmType = rollMatch[2] + " " + rollMatch[3];
      var width = parseInt(rollMatch[4]);
      var length = parseInt(rollMatch[5].replace(/,/g, ""));
      var netKg = parseFloat(rollMatch[6]);
      var grossKg = parseFloat(rollMatch[7]);
      
      rolne.push({
        roll_no: rollNo,
        tip: filmType,
        sirina: width,
        metraza: length,
        kg_neto: netKg,
        kg_bruto: grossKg,
        palet: currentPallet,
        lot: currentOrder,
        dobavljac: "PLASTCHIM-T",
        format: "Plastchim"
      });
    }
  }
  
  return rolne;
}

// 2. TAGHLEEF Parser (Mađarska)
function parseTaghleef(text) {
  var rolne = [];
  var lines = text.split("\n");
  var currentOrder = "";
  var currentPallet = "";
  
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    
    // Balance order No
    if (line.match(/Balance order No.*?(\d+\/\w+\s*\/\d+\/\d+)/)) {
      currentOrder = line.match(/Balance order No.*?(\d+\/\w+\s*\/\d+\/\d+)/)[1];
    }
    
    // Pallet
    if (line.match(/Plt\.No\.\s*(\d+)/)) {
      currentPallet = line.match(/Plt\.No\.\s*(\d+)/)[1];
    }
    
    // Reel line: 110949959 122607302003000 NATIVIA NTSS 30 1650 TO 904,0 14700 152 783 1 13.02.2026
    var reelMatch = line.match(/^(\d{9})\s+\d+\s+([\w\s]+?)\s+([\d,]+)\s+(\d{4,6})\s+\d+\s+\d+/);
    
    if (reelMatch) {
      var reelCode = reelMatch[1];
      var item = reelMatch[2].trim();
      var kg = parseFloat(reelMatch[3].replace(",", "."));
      var length = parseInt(reelMatch[4]);
      
      // Extract width from item name (e.g., "NATIVIA NTSS 30 1650 TO")
      var widthMatch = item.match(/(\d{3,4})\s*TO/);
      var width = widthMatch ? parseInt(widthMatch[1]) : 0;
      
      rolne.push({
        roll_no: reelCode,
        tip: item,
        sirina: width,
        metraza: length,
        kg_neto: kg,
        kg_bruto: kg * 1.05, // Estimate bruto
        palet: currentPallet,
        lot: currentOrder,
        dobavljac: "Taghleef Industries",
        format: "Taghleef"
      });
    }
  }
  
  return rolne;
}

// 🤖 AI FALLBACK Parser (za nepoznate formate)
async function parseAI(text) {
  try {
    // Kratkim AI promptom ekstraktuj strukturu
    var prompt = `Ekstraktuj podatke o rolnama folije iz ovog packing lista teksta.

TEKST:
${text.substring(0, 3000)}

Vrati JSON array objekata sa ovim poljima:
- roll_no: broj rolne
- tip: tip materijala (npr. BOPP, FXC, NATIVIA)
- sirina: širina u mm
- metraza: dužina u metrima
- kg_neto: neto kg
- kg_bruto: bruto kg (ako postoji)
- palet: broj paleta
- lot: LOT broj ili order broj
- dobavljac: ime dobavljača

Vrati samo JSON array, bez dodatnog teksta.`;

    var response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    var data = await response.json();
    var content = data.content[0].text;
    
    // Clean JSON response
    var jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("AI nije vratio validan JSON");
    
    var parsed = JSON.parse(jsonMatch[0]);
    
    // Add format marker
    parsed.forEach(function(r) {
      r.format = "AI";
      r.dobavljac = r.dobavljac || "Nepoznat";
    });
    
    return parsed;
  } catch (e) {
    console.error("AI parsing failed:", e);
    return [];
  }
}

// 🔍 HYBRID PARSER - pokušava hardcoded, pa AI
async function parsePackingList(text) {
  // 1. Detektuj format
  var format = "unknown";
  
  if (text.includes("PLASTCHIM") || text.includes("Entegra Manufacturing")) {
    format = "plastchim";
  } else if (text.includes("Taghleef Industries") || text.includes("NATIVIA")) {
    format = "taghleef";
  }
  
  // 2. Hardcoded parser
  var rolne = [];
  
  if (format === "plastchim") {
    console.log("🔧 Koristim Plastchim parser");
    rolne = parsePlastchim(text);
  } else if (format === "taghleef") {
    console.log("🔧 Koristim Taghleef parser");
    rolne = parseTaghleef(text);
  }
  
  // 3. AI Fallback ako hardcoded nije našao ništa
  if (rolne.length === 0) {
    console.log("🤖 Hardcoded parser nije uspeo, koristim AI...");
    rolne = await parseAI(text);
  }
  
  // 4. Generate QR codes
  rolne.forEach(function(r, i) {
    if (!r.br_rolne) {
      r.br_rolne = "R-" + new Date().getFullYear() + "-" + (r.roll_no || String(Date.now() + i).slice(-6));
    }
  });
  
  return rolne;
}

// 📦 REACT KOMPONENTA
export default function PackingListParser({ msg, card, inp, lbl }) {
  var [loading, setLoading] = useState(false);
  var [rolne, setRolne] = useState([]);
  var [selected, setSelected] = useState({});
  var [importing, setImporting] = useState(false);

  // PDF Upload handler
  async function handlePdfUpload(e) {
    var file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    setRolne([]);
    
    try {
      // Load PDF.js
      if (!window.pdfjsLib) {
        var script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        await new Promise(function(res, rej) {
          script.onload = res;
          script.onerror = rej;
          document.head.appendChild(script);
        });
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }
      
      // Read PDF
      var arrayBuffer = await file.arrayBuffer();
      var pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      var fullText = "";
      for (var i = 1; i <= pdf.numPages; i++) {
        var page = await pdf.getPage(i);
        var content = await page.getTextContent();
        var pageText = content.items.map(function(item) { return item.str; }).join(" ");
        fullText += pageText + "\n";
      }
      
      console.log("📄 PDF text extracted:", fullText.substring(0, 500));
      
      // Parse with hybrid parser
      var parsed = await parsePackingList(fullText);
      
      if (parsed.length > 0) {
        setRolne(parsed);
        // Select all by default
        var sel = {};
        parsed.forEach(function(_, i) { sel[i] = true; });
        setSelected(sel);
        if (msg) msg("✅ Parsirano " + parsed.length + " rolni!");
      } else {
        if (msg) msg("⚠️ Nije pronađena nijedna rolna. Proverite format PDF-a.", "err");
      }
    } catch (e) {
      if (msg) msg("Greška: " + e.message, "err");
      console.error(e);
    }
    
    setLoading(false);
  }

  // Import to Supabase
  async function uvozUMagacin() {
    var selectedRolne = rolne.filter(function(_, i) { return selected[i]; });
    
    if (selectedRolne.length === 0) {
      if (msg) msg("Označite barem jednu rolnu!", "err");
      return;
    }
    
    setImporting(true);
    
    try {
      var inserts = selectedRolne.map(function(r) {
        return {
          br_rolne: r.br_rolne,
          tip: r.tip,
          sirina: r.sirina,
          metraza: r.metraza,
          metraza_ost: r.metraza,
          kg_neto: r.kg_neto,
          kg_bruto: r.kg_bruto || r.kg_neto * 1.05,
          lot: r.lot || "",
          dobavljac: r.dobavljac || "",
          palet: r.palet || "",
          datum: new Date().toLocaleDateString("sr-RS"),
          napomena: "Import: " + (r.format || "AI") + " parser",
          status: "Na stanju"
        };
      });
      
      var res = await supabase.from("magacin").insert(inserts);
      
      if (res.error) throw res.error;
      
      if (msg) msg("✅ Uvezeno " + inserts.length + " rolni u magacin!");
      
      // Reset
      setRolne([]);
      setSelected({});
    } catch (e) {
      if (msg) msg("Greška: " + e.message, "err");
    }
    
    setImporting(false);
  }

  function toggleSelect(i) {
    setSelected(function(prev) {
      var next = Object.assign({}, prev);
      next[i] = !next[i];
      return next;
    });
  }

  function selectAll() {
    var sel = {};
    rolne.forEach(function(_, i) { sel[i] = true; });
    setSelected(sel);
  }

  function deselectAll() {
    setSelected({});
  }

  var selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <div>
      <div style={Object.assign({}, card, { marginBottom: 16 })}>
        <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>
          🤖 AI Parser Packing Lista
        </div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
          Podržava: PLASTCHIM-T, Taghleef, Rossella i SVE OSTALE formate (AI fallback)
        </div>

        <div style={{
          border: "2px dashed #bfdbfe",
          borderRadius: 10,
          padding: 24,
          textAlign: "center",
          background: "#f8fafc",
          cursor: "pointer"
        }} onClick={function() { document.getElementById("pdfInput").click(); }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📄</div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#1d4ed8", marginBottom: 4 }}>
            Klikni ili prevuci PDF packing listu
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>
            Automatski prepoznaje format i ekstraktuje rolne
          </div>
          <input
            id="pdfInput"
            type="file"
            accept=".pdf"
            style={{ display: "none" }}
            onChange={handlePdfUpload}
          />
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: 20, color: "#1d4ed8" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🤖</div>
            <div style={{ fontWeight: 700 }}>AI čita packing listu...</div>
          </div>
        )}
      </div>

      {rolne.length > 0 && (
        <div style={Object.assign({}, card, { marginBottom: 16 })}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#059669" }}>
                ✅ Pronađeno {rolne.length} rolni
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                Parser: {rolne[0]?.format || "Unknown"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={selectAll}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid #dbe3ef",
                  background: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Označi sve
              </button>
              <button
                onClick={deselectAll}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid #dbe3ef",
                  background: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Poništi
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ padding: "8px", textAlign: "left" }}>✓</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>Roll No</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>Tip</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>Širina</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>Metraža</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>Kg neto</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>LOT</th>
                  <th style={{ padding: "8px", textAlign: "left" }}>Palet</th>
                </tr>
              </thead>
              <tbody>
                {rolne.map(function(r, i) {
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "8px" }}>
                        <input
                          type="checkbox"
                          checked={!!selected[i]}
                          onChange={function() { toggleSelect(i); }}
                        />
                      </td>
                      <td style={{ padding: "8px", fontWeight: 700, color: "#1d4ed8" }}>
                        {r.roll_no}
                      </td>
                      <td style={{ padding: "8px" }}>{r.tip}</td>
                      <td style={{ padding: "8px" }}>{r.sirina} mm</td>
                      <td style={{ padding: "8px", color: "#059669", fontWeight: 700 }}>
                        {(r.metraza || 0).toLocaleString()} m
                      </td>
                      <td style={{ padding: "8px" }}>{r.kg_neto} kg</td>
                      <td style={{ padding: "8px", color: "#64748b" }}>{r.lot || "—"}</td>
                      <td style={{ padding: "8px", color: "#64748b" }}>{r.palet || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{
            marginTop: 16,
            padding: "12px 16px",
            background: "#f0fdf4",
            borderRadius: 8,
            border: "1px solid #bbf7d0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div style={{ fontSize: 13, color: "#166534", fontWeight: 700 }}>
              Označeno: {selectedCount} / {rolne.length} rolni
            </div>
            <button
              onClick={uvozUMagacin}
              disabled={importing || selectedCount === 0}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                background: importing || selectedCount === 0 ? "#94a3b8" : "#059669",
                color: "#fff",
                fontWeight: 800,
                cursor: importing || selectedCount === 0 ? "not-allowed" : "pointer"
              }}
            >
              {importing ? "⏳ Uvoz..." : "💾 Uvezi u magacin (" + selectedCount + ")"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
