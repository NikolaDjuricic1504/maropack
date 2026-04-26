// PackingListParser.jsx - AI Parser za sve formate packing lista
import { useState } from "react";
import { supabase } from "./supabase.js";

// 📋 HARDCODED PARSERS za poznate formate (brzi i pouzdani)

// 1. PLASTCHIM-T / ROSSELLA Parser
function parsePlastchim(text) {
  var rolne = [];
  
  // 🔧 FIX: Ignoriši fakturu - traži samo "Packing list" sekciju
  var packingStartIndex = text.indexOf("Packing list");
  if (packingStartIndex > 0) {
    text = text.substring(packingStartIndex);
    console.log("✂️ Skipped invoice section, reading only packing list");
  }
  
  var lines = text.split("\n");
  var currentPallet = "";
  var currentOrder = "";
  
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    
    // Skip header lines
    if (line.includes("Packing list Date:") || 
        line.includes("Order No:") || 
        line.includes("Customer:") ||
        line.includes("PRODUCT:") ||
        line.includes("TARIC CODE:") ||
        line.includes("Roll No") ||
        line.includes("Film Type") ||
        line.includes("Total Net Weight") ||
        line.includes("Total Gross Weight") ||
        line.includes("Total Roll Count")) {
      
      // Extract Order Number
      if (line.includes("Order No:")) {
        var orderMatch = line.match(/Order No:\s*(\d+)/);
        if (orderMatch) currentOrder = orderMatch[1];
      }
      continue;
    }
    
    // Pallet line: "Pallet: 136180.1 Net weight: 614.00; Gross weight: 670.00; Pallet size: 1700 x 800"
    if (line.match(/Pallet:\s*([\d.]+)/)) {
      currentPallet = line.match(/Pallet:\s*([\d.]+)/)[1];
      continue;
    }
    
    // Net/Gross weight summary lines - skip
    if (line.match(/^Net Weight:|^Gross Weight:/)) {
      continue;
    }
    
    // Roll data line: "7553927 136180.1 FXC 15 1 560 152 780 28 400 614.00 649.00"
    // Format: RollNo PalletRef FilmType Thickness Width ID OD Length NetKg GrossKg
    var rollMatch = line.match(/^(\d{7,9})\s+[\d.]+\s+([A-Z]+)\s+(\d{1,3})\s+(\d{3,4})\s+\d+\s+\d+\s+([\d\s,]+)\s+([\d.]+)\s+([\d.]+)/);
    
    if (rollMatch) {
      var rollNo = rollMatch[1];
      var filmType = rollMatch[2] + " " + rollMatch[3]; // e.g., "FXC 15"
      var width = parseInt(rollMatch[4]);
      var lengthRaw = rollMatch[5].replace(/\s/g, ""); // Remove spaces
      var length = parseInt(lengthRaw.replace(/,/g, ""));
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
        format: "Rossella"
      });
      
      console.log("✅ Parsed roll:", rollNo, filmType, width + "mm", length + "m");
    }
  }
  
  console.log("📦 Total rolls parsed:", rolne.length);
  return rolne;
}

// 🤖 UNIVERZALNI AI PARSER (radi za SVE formate)
async function parsePackingListUniversal(text) {
  try {
    console.log("🤖 Pokrećem univerzalni AI parser...");
    
    var prompt = `Analiziraj ovaj packing list i ekstraktuj podatke o SVIM rolnama/reelovima.

TEKST PACKING LISTE:
${text}

Traži podatke u ovim formatima:
- Roll Number / Reel Code / Rola broj (može biti 7-9 cifara, ili kod tipa "110949959")
- Film Type / Tip materijala (npr. FXC 15, NATIVIA NTSS 30, BOPP, CPP, PET)
- Width / Širina u mm (npr. 1560, 740, 1650)
- Length / Dužina u metrima (npr. 28400, 14700)
- Net Weight / Neto kg
- Gross Weight / Bruto kg (ako postoji)
- Pallet Number / Broj paleta
- LOT / Batch Number
- Order Number / Broj narudžbine

VAŽNO:
- Ignoriši header/footer linije
- Ignoriši ukupne sume (Total, Summary)
- Svaka rolna je JEDAN red u tabeli

Vrati JSON array gde je svaki objekat jedna rolna:
[
  {
    "roll_no": "7553927",
    "tip": "FXC 15",
    "sirina": 1560,
    "metraza": 28400,
    "kg_neto": 614.00,
    "kg_bruto": 649.00,
    "palet": "136180.1",
    "lot": "136180",
    "dobavljac": "PLASTCHIM-T"
  }
]

Vrati SAMO JSON array, bez markdown formatiranja ili dodatnog teksta.`;

    var response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error("API greška: " + response.status);
    }

    var data = await response.json();
    var content = data.content[0].text;
    
    console.log("📥 AI odgovor:", content.substring(0, 200));
    
    // Clean i parse JSON
    var jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("❌ AI nije vratio JSON array");
      return [];
    }
    
    var parsed = JSON.parse(jsonMatch[0]);
    
    console.log("✅ AI parsirao:", parsed.length, "rolni");
    
    // Normalizuj podatke i dodaj QR kodove
    var rolne = parsed.map(function(r, i) {
      return {
        roll_no: r.roll_no || r.reel_code || String(Date.now() + i).slice(-6),
        tip: r.tip || r.film_type || "Nepoznato",
        sirina: parseInt(r.sirina || r.width || 0),
        metraza: parseInt(r.metraza || r.length || 0),
        kg_neto: parseFloat(r.kg_neto || r.net_weight || 0),
        kg_bruto: parseFloat(r.kg_bruto || r.gross_weight || r.kg_neto * 1.05 || 0),
        palet: r.palet || r.pallet || "",
        lot: r.lot || r.batch || r.order || "",
        dobavljac: r.dobavljac || r.supplier || "Nepoznat",
        br_rolne: "R-" + new Date().getFullYear() + "-" + (r.roll_no || String(Date.now() + i).slice(-6)),
        format: "AI Universal"
      };
    });
    
    return rolne;
    
  } catch (e) {
    console.error("❌ AI parsing greška:", e);
    return [];
  }
}

// 🔍 HYBRID PARSER - Rossella first, pa AI fallback
async function parsePackingList(text) {
  console.log("📄 Parsing packing list...");
  
  // 1. Pokušaj Rossella/PLASTCHIM parser (brz)
  var rolne = parsePlastchim(text);
  
  if (rolne.length > 0) {
    console.log("✅ Rossella parser uspeo! Pronađeno:", rolne.length, "rolni");
    
    // Dodaj QR kodove
    rolne.forEach(function(r, i) {
      if (!r.br_rolne) {
        r.br_rolne = "R-" + new Date().getFullYear() + "-" + (r.roll_no || String(Date.now() + i).slice(-6));
      }
    });
    
    return rolne;
  }
  
  // 2. UNIVERZALNI AI Parser za SVE OSTALE formate
  console.log("⚠️ Rossella parser nije našao rolne");
  console.log("🤖 Pokrećem UNIVERZALNI AI parser...");
  
  rolne = await parsePackingListUniversal(text);
  
  if (rolne.length > 0) {
    console.log("✅ AI Universal parser uspeo! Pronađeno:", rolne.length, "rolni");
  } else {
    console.error("❌ Ni jedan parser nije uspeo!");
  }
  
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
