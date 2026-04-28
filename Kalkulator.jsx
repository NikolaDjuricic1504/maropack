<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maropack - KOMPLETAN WORKFLOW - Interaktivni Demo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; }
    
    .screen { min-height: 100vh; display: none; }
    .screen.active { display: block; }
    
    /* HEADER STYLES */
    .header { background: linear-gradient(135deg, #1e40af, #1e3a8a); color: white; padding: 1.5rem 2rem; }
    .header-title { font-size: 28px; font-weight: 500; margin-bottom: 4px; }
    .header-subtitle { font-size: 14px; opacity: 0.9; }
    
    /* KALKULACIJA STYLES */
    .kalk-container { max-width: 1400px; margin: 0 auto; background: white; }
    .kalk-summary { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 2rem; margin: 2rem; border-radius: 8px; }
    .kalk-summary-title { font-size: 24px; font-weight: 600; margin-bottom: 1rem; }
    .kalk-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .kalk-item { background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 6px; }
    .kalk-label { font-size: 11px; opacity: 0.8; margin-bottom: 4px; }
    .kalk-value { font-size: 20px; font-weight: 600; }
    
    /* PROGRESS STYLES */
    .progress-container { max-width: 1200px; margin: 3rem auto; padding: 2rem; }
    .progress-box { background: white; border-radius: 12px; padding: 3rem; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .progress-title { font-size: 28px; font-weight: 700; color: #1a1a1a; text-align: center; margin-bottom: 2rem; }
    .progress-steps { display: flex; gap: 1rem; margin-bottom: 3rem; }
    .step { flex: 1; text-align: center; }
    .step-circle { width: 60px; height: 60px; border-radius: 50%; background: #f3f4f6; border: 3px solid #e5e7eb; margin: 0 auto 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: #999; }
    .step.done .step-circle { background: #d1fae5; border-color: #10b981; color: #047857; }
    .step.active .step-circle { background: #dbeafe; border-color: #3b82f6; color: #1e40af; animation: pulse 2s infinite; }
    .step-label { font-size: 13px; font-weight: 500; color: #666; }
    .step.done .step-label { color: #047857; }
    .step.active .step-label { color: #1e40af; font-weight: 600; }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    .result-box { background: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 2rem; margin-top: 2rem; }
    .result-title { font-size: 20px; font-weight: 600; color: #047857; margin-bottom: 1rem; text-align: center; }
    .result-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .result-item { background: white; padding: 1rem; border-radius: 6px; }
    .result-item-icon { font-size: 24px; margin-bottom: 0.5rem; }
    .result-item-label { font-size: 11px; color: #666; margin-bottom: 4px; }
    .result-item-value { font-size: 14px; font-weight: 600; color: #1a1a1a; }
    
    /* TABS STYLES */
    .tabs-container { background: white; }
    .tabs { display: flex; background: #f9fafb; border-bottom: 2px solid #e5e7eb; overflow-x: auto; }
    .tab { padding: 1rem 1.5rem; background: transparent; border: none; border-bottom: 3px solid transparent; font-size: 14px; font-weight: 500; cursor: pointer; color: #666; display: flex; align-items: center; gap: 0.5rem; white-space: nowrap; }
    .tab.active { background: white; border-bottom-color: #1e40af; color: #1e40af; font-weight: 600; }
    .tab-badge { padding: 2px 8px; background: #f3f4f6; color: #666; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .tab.active .tab-badge { background: #dbeafe; color: #1e40af; }
    
    .tab-content { padding: 2rem; display: none; }
    .tab-content.active { display: block; }
    
    .nalog-title { font-size: 24px; font-weight: 600; color: #1a1a1a; margin-bottom: 1.5rem; }
    .nalog-box { background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; }
    .nalog-box-title { font-size: 16px; font-weight: 600; color: #1e40af; margin-bottom: 1rem; }
    .nalog-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
    .nalog-item { }
    .nalog-item-label { font-size: 11px; color: #999; margin-bottom: 4px; text-transform: uppercase; }
    .nalog-item-value { font-size: 15px; font-weight: 500; color: #333; }
    
    .table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    .table th { padding: 12px; text-align: left; background: #f9fafb; border-bottom: 2px solid #e5e7eb; font-size: 13px; font-weight: 600; color: #666; }
    .table td { padding: 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
    .table tr:hover { background: #f9fafb; }
    
    .sql-view-box { background: #1e293b; color: #e2e8f0; padding: 2rem; border-radius: 8px; margin: 2rem; font-family: 'Courier New', monospace; }
    .sql-title { font-size: 18px; font-weight: 600; margin-bottom: 1rem; color: #60a5fa; }
    .sql-code { font-size: 13px; line-height: 1.8; white-space: pre-wrap; }
    .sql-keyword { color: #f472b6; font-weight: 600; }
    .sql-table { color: #34d399; }
    .sql-comment { color: #94a3b8; font-style: italic; }
    
    /* NAVIGATION */
    .nav-bottom { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 2px solid #e5e7eb; padding: 1rem 2rem; display: flex; justify-content: center; gap: 1rem; box-shadow: 0 -2px 10px rgba(0,0,0,0.1); z-index: 100; }
    button { padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; }
    .btn-primary { background: #1e40af; color: white; }
    .btn-success { background: #059669; color: white; }
    .btn-secondary { background: white; border: 1px solid #d1d5db; color: #333; }
  </style>
</head>
<body>

<!-- SCREEN 1: KALKULACIJA -->
<div class="screen active" id="screen1">
  <div class="kalk-container">
    <div class="header">
      <div class="header-title">💰 Kalkulacija - Spremna za generisanje</div>
      <div class="header-subtitle">MPML Crux Magnezijum 3g</div>
    </div>

    <div class="kalk-summary">
      <div class="kalk-summary-title">📊 Kompletna kalkulacija</div>
      <div class="kalk-grid">
        <div class="kalk-item">
          <div class="kalk-label">KUPAC</div>
          <div class="kalk-value">MEDOMIX</div>
        </div>
        <div class="kalk-item">
          <div class="kalk-label">MATERIJALI</div>
          <div class="kalk-value">Sigmakraft + ALU + PE</div>
        </div>
        <div class="kalk-item">
          <div class="kalk-label">DIMENZIJE</div>
          <div class="kalk-value">85 × 110 mm</div>
        </div>
        <div class="kalk-item">
          <div class="kalk-label">ŠTAMPA</div>
          <div class="kalk-value">Materijal A (Sigmakraft)</div>
        </div>
        <div class="kalk-item">
          <div class="kalk-label">KAŠIRANJE</div>
          <div class="kalk-value">2 prolaza</div>
        </div>
        <div class="kalk-item">
          <div class="kalk-label">KONAČNA CENA</div>
          <div class="kalk-value">67.91 €</div>
        </div>
      </div>
    </div>

    <div style="text-align: center; padding: 3rem;">
      <div style="font-size: 48px; margin-bottom: 1rem;">🚀</div>
      <div style="font-size: 24px; font-weight: 600; color: #1a1a1a; margin-bottom: 1rem;">
        Klikni "Kreiraj RN" da generišeš SVE naloge!
      </div>
      <div style="font-size: 16px; color: #666; margin-bottom: 2rem;">
        Sistem će automatski kreirati:<br>
        Glavni nalog + Štampa + Materijali + Kaširanje + Rezanje + Perforacija + Izgled
      </div>
      <button class="btn-success" onclick="showScreen(2)" style="padding: 16px 32px; font-size: 16px;">
        🚀 Kreiraj radni nalog
      </button>
    </div>
  </div>

  <div class="nav-bottom">
    <button class="btn-primary" onclick="showScreen(2)">▶ Vidi GENERISANJE NALOGA</button>
  </div>
</div>

<!-- SCREEN 2: PROGRESS GENERISANJA -->
<div class="screen" id="screen2">
  <div class="progress-container">
    <div class="progress-box">
      <div class="progress-title">⚙️ Generisanje svih naloga u toku...</div>
      
      <div class="progress-steps">
        <div class="step done">
          <div class="step-circle">✓</div>
          <div class="step-label">Generiši<br>broj naloga</div>
        </div>
        <div class="step done">
          <div class="step-circle">✓</div>
          <div class="step-label">Kreiraj<br>glavni nalog</div>
        </div>
        <div class="step done">
          <div class="step-circle">✓</div>
          <div class="step-label">Štampa<br>nalog</div>
        </div>
        <div class="step done">
          <div class="step-circle">✓</div>
          <div class="step-label">Materijali<br>nalog</div>
        </div>
        <div class="step done">
          <div class="step-circle">✓</div>
          <div class="step-label">Kaširanje<br>nalog</div>
        </div>
        <div class="step done">
          <div class="step-circle">✓</div>
          <div class="step-label">Rezanje<br>nalog</div>
        </div>
        <div class="step done">
          <div class="step-circle">✓</div>
          <div class="step-label">Perforacija<br>nalog</div>
        </div>
        <div class="step done">
          <div class="step-circle">✓</div>
          <div class="step-label">Izgled<br>nalog</div>
        </div>
      </div>

      <div class="result-box">
        <div style="font-size: 64px; text-align: center; margin-bottom: 1rem;">✅</div>
        <div class="result-title">SVA 7 NALOGA USPEŠNO KREIRANA!</div>
        
        <div style="background: white; padding: 1.5rem; border-radius: 6px; margin: 1.5rem 0; text-align: center;">
          <div style="font-size: 13px; color: #666; margin-bottom: 4px;">BROJ NALOGA</div>
          <div style="font-size: 36px; font-weight: 700; color: #1e40af;">0202020/2026</div>
        </div>

        <div class="result-grid">
          <div class="result-item">
            <div class="result-item-icon">📋</div>
            <div class="result-item-label">GLAVNI NALOG</div>
            <div class="result-item-value">ID: xyz789-abc...</div>
          </div>
          <div class="result-item">
            <div class="result-item-icon">🖨️</div>
            <div class="result-item-label">ŠTAMPA</div>
            <div class="result-item-value">ID: stampa-001</div>
          </div>
          <div class="result-item">
            <div class="result-item-icon">📦</div>
            <div class="result-item-label">MATERIJALI</div>
            <div class="result-item-value">ID: materijali-001</div>
          </div>
          <div class="result-item">
            <div class="result-item-icon">🔄</div>
            <div class="result-item-label">KAŠIRANJE</div>
            <div class="result-item-value">ID: kasiranje-001</div>
          </div>
          <div class="result-item">
            <div class="result-item-icon">✂️</div>
            <div class="result-item-label">REZANJE</div>
            <div class="result-item-value">ID: rezanje-001</div>
          </div>
          <div class="result-item">
            <div class="result-item-icon">⚙️</div>
            <div class="result-item-label">PERFORACIJA</div>
            <div class="result-item-value">ID: perforacija-001</div>
          </div>
          <div class="result-item">
            <div class="result-item-icon">🎨</div>
            <div class="result-item-label">IZGLED</div>
            <div class="result-item-value">ID: izgled-001</div>
          </div>
        </div>

        <div style="background: white; padding: 1rem; border-radius: 6px; margin-top: 1.5rem; font-size: 13px; color: #047857;">
          <strong>✓ Svi nalozi povezani sa kalkulacijom</strong><br>
          ✓ Svi nalozi povezani sa glavnim nalogom<br>
          ✓ Status kalkulacije: U proizvodnji<br>
          ✓ Svi podaci automatski popunjeni
        </div>
      </div>
    </div>
  </div>

  <div class="nav-bottom">
    <button class="btn-secondary" onclick="showScreen(1)">◀ Nazad</button>
    <button class="btn-primary" onclick="showScreen(3)">▶ Vidi PREGLED SA TABOVIMA</button>
  </div>
</div>

<!-- SCREEN 3: PREGLED SA TABOVIMA -->
<div class="screen" id="screen3">
  <div class="tabs-container">
    <div class="header">
      <div class="header-title">📋 Kompletan pregled naloga - 0202020/2026</div>
      <div class="header-subtitle">MPML Crux Magnezijum 3g • MEDOMIX</div>
    </div>

    <div class="tabs">
      <button class="tab active" onclick="showTab('glavni')">
        📋 Glavni nalog
      </button>
      <button class="tab" onclick="showTab('stampa')">
        🖨️ Štampa
        <span class="tab-badge">čeka</span>
      </button>
      <button class="tab" onclick="showTab('materijali')">
        📦 Materijali
        <span class="tab-badge">čeka</span>
      </button>
      <button class="tab" onclick="showTab('kasiranje')">
        🔄 Kaširanje
        <span class="tab-badge">čeka</span>
      </button>
      <button class="tab" onclick="showTab('rezanje')">
        ✂️ Rezanje
        <span class="tab-badge">čeka</span>
      </button>
      <button class="tab" onclick="showTab('perforacija')">
        ⚙️ Perforacija
        <span class="tab-badge">čeka</span>
      </button>
      <button class="tab" onclick="showTab('izgled')">
        🎨 Izgled
        <span class="tab-badge">čeka</span>
      </button>
    </div>

    <!-- TAB CONTENT: GLAVNI -->
    <div class="tab-content active" id="tab-glavni">
      <div style="padding: 2rem;">
        <h2 class="nalog-title">📋 Glavni radni nalog</h2>
        
        <div class="nalog-box">
          <div class="nalog-box-title">🔗 Linkovanja</div>
          <div class="nalog-grid">
            <div class="nalog-item">
              <div class="nalog-item-label">ID Glavnog naloga</div>
              <div class="nalog-item-value" style="font-family: 'Courier New', monospace; font-size: 13px;">
                xyz789-abc123-def456
              </div>
            </div>
            <div class="nalog-item">
              <div class="nalog-item-label">Kalkulacija ID</div>
              <div class="nalog-item-value" style="font-family: 'Courier New', monospace; font-size: 13px;">
                abc123-def456-ghi789
              </div>
            </div>
          </div>
        </div>

        <div class="nalog-box">
          <div class="nalog-box-title">📊 Osnovni podaci</div>
          <div class="nalog-grid">
            <div class="nalog-item">
              <div class="nalog-item-label">Broj naloga</div>
              <div class="nalog-item-value">0202020/2026</div>
            </div>
            <div class="nalog-item">
              <div class="nalog-item-label">Kupac</div>
              <div class="nalog-item-value">MEDOMIX</div>
            </div>
            <div class="nalog-item">
              <div class="nalog-item-label">Status</div>
              <div class="nalog-item-value">U pripremi</div>
            </div>
            <div class="nalog-item">
              <div class="nalog-item-label">Konačna cena</div>
              <div class="nalog-item-value">67.91 €</div>
            </div>
          </div>
        </div>

        <div class="nalog-box" style="background: #eff6ff; border-color: #3b82f6;">
          <div class="nalog-box-title">🔗 Povezani pojedinačni nalozi</div>
          <table class="table">
            <thead>
              <tr>
                <th>Tip naloga</th>
                <th>ID</th>
                <th>Status</th>
                <th>Linkovi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>🖨️ Štampa</td>
                <td><code>stampa-001</code></td>
                <td><span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 11px;">čeka</span></td>
                <td style="font-size: 12px;">glavni_nalog_id + kalkulacija_id</td>
              </tr>
              <tr>
                <td>📦 Materijali</td>
                <td><code>materijali-001</code></td>
                <td><span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 11px;">čeka</span></td>
                <td style="font-size: 12px;">glavni_nalog_id + kalkulacija_id</td>
              </tr>
              <tr>
                <td>🔄 Kaširanje</td>
                <td><code>kasiranje-001</code></td>
                <td><span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 11px;">čeka</span></td>
                <td style="font-size: 12px;">glavni_nalog_id + kalkulacija_id</td>
              </tr>
              <tr>
                <td>✂️ Rezanje</td>
                <td><code>rezanje-001</code></td>
                <td><span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 11px;">čeka</span></td>
                <td style="font-size: 12px;">glavni_nalog_id + kalkulacija_id</td>
              </tr>
              <tr>
                <td>⚙️ Perforacija</td>
                <td><code>perforacija-001</code></td>
                <td><span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 11px;">čeka</span></td>
                <td style="font-size: 12px;">glavni_nalog_id + kalkulacija_id</td>
              </tr>
              <tr>
                <td>🎨 Izgled</td>
                <td><code>izgled-001</code></td>
                <td><span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 11px;">čeka</span></td>
                <td style="font-size: 12px;">glavni_nalog_id + kalkulacija_id</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB CONTENT: ŠTAMPA -->
    <div class="tab-content" id="tab-stampa">
      <div style="padding: 2rem;">
        <h2 class="nalog-title">🖨️ Nalog za štampu</h2>
        
        <div class="nalog-box">
          <div class="nalog-box-title">📋 Parametri štampe (automatski iz kalkulacije)</div>
          <div class="nalog-grid">
            <div class="nalog-item">
              <div class="nalog-item-label">Mašina</div>
              <div class="nalog-item-value">UTECO ONYX</div>
            </div>
            <div class="nalog-item">
              <div class="nalog-item-label">Broj boja</div>
              <div class="nalog-item-value">4+lak</div>
            </div>
            <div class="nalog-item">
              <div class="nalog-item-label">Štampani materijal</div>
              <div class="nalog-item-value">Sigmakraft 70µ (Materijal A)</div>
            </div>
            <div class="nalog-item">
              <div class="nalog-item-label">Smer odmotavanja</div>
              <div class="nalog-item-value">Na glavu</div>
            </div>
            <div class="nalog-item">
              <div class="nalog-item-label">Strana štampe</div>
              <div class="nalog-item-value">SPOLJNA</div>
            </div>
            <div class="nalog-item">
              <div class="nalog-item-label">Prečnik hilzne</div>
              <div class="nalog-item-value">152 mm</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB CONTENT: MATERIJALI -->
    <div class="tab-content" id="tab-materijali">
      <div style="padding: 2rem;">
        <h2 class="nalog-title">📦 Nalog za materijale</h2>
        
        <div class="nalog-box">
          <div class="nalog-box-title">📊 Sastav proizvoda (automatski iz kalkulacije)</div>
          <table class="table">
            <thead>
              <tr>
                <th>Sloj</th>
                <th>Materijal</th>
                <th>Debljina</th>
                <th>Potreba (kg)</th>
                <th>Potreba (m)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>SLOJ 1</strong></td>
                <td>Papir sigmakraft 70µ</td>
                <td>70 µm</td>
                <td><strong>5.95 kg</strong></td>
                <td>1000 m</td>
              </tr>
              <tr>
                <td><strong>SLOJ 2</strong></td>
                <td>ALU 7µ</td>
                <td>7 µm</td>
                <td><strong>1.61 kg</strong></td>
                <td>1000 m</td>
              </tr>
              <tr>
                <td><strong>SLOJ 3</strong></td>
                <td>PA/PE koestruzija 30µ</td>
                <td>30 µm</td>
                <td><strong>2.55 kg</strong></td>
                <td>1000 m</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB CONTENT: KAŠIRANJE -->
    <div class="tab-content" id="tab-kasiranje">
      <div style="padding: 2rem;">
        <h2 class="nalog-title">🔄 Nalog za kaširanje</h2>
        
        <div class="nalog-box">
          <div class="nalog-box-title">📋 Parametri kaširanja (automatski iz kalkulacije)</div>
          <div class="nalog-grid">
            <div class="nalog-item">
              <div class="nalog-item-label">Tip lepka</div>
              <div class="nalog-item-value">SF724A 324CA</div>
            </div>
            <div class="nalog-item">
              <div class="nalog-item-label">Odnos lepka</div>
              <div class="nalog-item-value">100:60</div>
            </div>
            <div class="nalog-item">
              <div class="nalog-item-label">Nanos lepka</div>
              <div class="nalog-item-value">0.002 kg/m²</div>
            </div>
            <div class="nalog-item">
              <div class="nalog-item-label">Broj prolaza</div>
              <div class="nalog-item-value">2</div>
            </div>
            <div class="nalog-item">
              <div class="nalog-item-label">Doradne mašine</div>
              <div class="nalog-item-value">Štampanje, 2x Kaširanje, Rezanje</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB CONTENT: REZANJE -->
    <div class="tab-content" id="tab-rezanje">
      <div style="padding: 2rem;">
        <h2 class="nalog-title">✂️ Nalog za rezanje</h2>
        
        <div class="nalog-box">
          <div class="nalog-box-title">📋 Parametri rezanja (automatski iz kalkulacije)</div>
          <div class="nalog-grid">
            <div class="nalog-item">
              <div class="nalog-item-label">Širina trake</div>
              <div class="nalog-item-value">85 mm</div>
            </div>
            <div class="nalog-item">
              <div class="nalog-item-label">Broj traka</div>
              <div class="nalog-item-value">8</div>
            </div>
            <div class="nalog-item">
              <div class="nalog-item-label">Smer odmotavanja</div>
              <div class="nalog-item-value">Na noge</div>
            </div>
            <div class="nalog-item">
              <div class="nalog-item-label">Prečnik rolne</div>
              <div class="nalog-item-value">400 mm</div>
            </div>
            <div class="nalog-item">
              <div class="nalog-item-label">Br. etiketa u metru</div>
              <div class="nalog-item-value">9.09</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB CONTENT: PERFORACIJA -->
    <div class="tab-content" id="tab-perforacija">
      <div style="padding: 2rem;">
        <h2 class="nalog-title">⚙️ Nalog za perforaciju</h2>
        
        <div class="nalog-box">
          <div class="nalog-box-title">📋 Parametri perforacije</div>
          <div style="padding: 2rem; text-align: center; color: #666;">
            <div style="font-size: 48px; margin-bottom: 1rem;">ℹ️</div>
            <div style="font-size: 16px; margin-bottom: 0.5rem;">Perforacija nije potrebna</div>
            <div style="font-size: 14px;">Nalog kreiran sa default parametrima</div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB CONTENT: IZGLED -->
    <div class="tab-content" id="tab-izgled">
      <div style="padding: 2rem;">
        <h2 class="nalog-title">🎨 Nalog za izgled</h2>
        
        <div class="nalog-box">
          <div class="nalog-box-title">📋 Parametri izgleda (automatski iz kalkulacije)</div>
          <div class="nalog-grid">
            <div class="nalog-item">
              <div class="nalog-item-label">Opis</div>
              <div class="nalog-item-value">MPML Crux Magnezijum 3g</div>
            </div>
            <div class="nalog-item">
              <div class="nalog-item-label">Dimenzije</div>
              <div class="nalog-item-value">85 × 110 mm</div>
            </div>
            <div class="nalog-item">
              <div class="nalog-item-label">Boje</div>
              <div class="nalog-item-value">4+lak</div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <div class="nav-bottom">
    <button class="btn-secondary" onclick="showScreen(2)">◀ Nazad</button>
    <button class="btn-primary" onclick="showScreen(4)">▶ Vidi SQL VIEW</button>
  </div>
</div>

<!-- SCREEN 4: SQL VIEW -->
<div class="screen" id="screen4">
  <div style="max-width: 1400px; margin: 0 auto; background: white; min-height: 100vh; padding-bottom: 100px;">
    <div class="header">
      <div class="header-title">💾 SQL VIEW - Automatsko spajanje svih podataka</div>
      <div class="header-subtitle">kompletan_nalog_view</div>
    </div>

    <div class="sql-view-box">
      <div class="sql-title">📝 SQL VIEW Definition</div>
      <div class="sql-code"><span class="sql-keyword">CREATE VIEW</span> <span class="sql-table">kompletan_nalog_view</span> <span class="sql-keyword">AS</span>
<span class="sql-keyword">SELECT</span> 
  <span class="sql-comment">-- Kalkulacija</span>
  k.id <span class="sql-keyword">as</span> kalkulacija_id,
  k.naziv <span class="sql-keyword">as</span> proizvod,
  k.kupac,
  k.konacna_cena,
  
  <span class="sql-comment">-- Glavni nalog</span>
  gn.id <span class="sql-keyword">as</span> glavni_nalog_id,
  gn.broj_naloga,
  gn.status <span class="sql-keyword">as</span> status_glavnog,
  
  <span class="sql-comment">-- Štampa</span>
  sn.id <span class="sql-keyword">as</span> stampa_nalog_id,
  sn.status <span class="sql-keyword">as</span> status_stampe,
  
  <span class="sql-comment">-- Materijali</span>
  mn.id <span class="sql-keyword">as</span> materijali_nalog_id,
  mn.status <span class="sql-keyword">as</span> status_materijala,
  
  <span class="sql-comment">-- Kaširanje</span>
  kn.id <span class="sql-keyword">as</span> kasiranje_nalog_id,
  kn.status <span class="sql-keyword">as</span> status_kasiranja,
  
  <span class="sql-comment">-- Rezanje</span>
  rn.id <span class="sql-keyword">as</span> rezanje_nalog_id,
  rn.status <span class="sql-keyword">as</span> status_rezanja,
  
  <span class="sql-comment">-- Perforacija</span>
  pn.id <span class="sql-keyword">as</span> perforacija_nalog_id,
  pn.status <span class="sql-keyword">as</span> status_perforacije,
  
  <span class="sql-comment">-- Izgled</span>
  izn.id <span class="sql-keyword">as</span> izgled_nalog_id,
  izn.status <span class="sql-keyword">as</span> status_izgleda

<span class="sql-keyword">FROM</span> <span class="sql-table">kalkulacije</span> k
<span class="sql-keyword">LEFT JOIN</span> <span class="sql-table">radni_nalozi_glavni</span> gn <span class="sql-keyword">ON</span> k.id = gn.kalkulacija_id
<span class="sql-keyword">LEFT JOIN</span> <span class="sql-table">stampa_nalozi</span> sn <span class="sql-keyword">ON</span> gn.id = sn.glavni_nalog_id
<span class="sql-keyword">LEFT JOIN</span> <span class="sql-table">materijali_nalozi</span> mn <span class="sql-keyword">ON</span> gn.id = mn.glavni_nalog_id
<span class="sql-keyword">LEFT JOIN</span> <span class="sql-table">kasiranje_nalozi</span> kn <span class="sql-keyword">ON</span> gn.id = kn.glavni_nalog_id
<span class="sql-keyword">LEFT JOIN</span> <span class="sql-table">rezanje_nalozi</span> rn <span class="sql-keyword">ON</span> gn.id = rn.glavni_nalog_id
<span class="sql-keyword">LEFT JOIN</span> <span class="sql-table">perforacija_nalozi</span> pn <span class="sql-keyword">ON</span> gn.id = pn.glavni_nalog_id
<span class="sql-keyword">LEFT JOIN</span> <span class="sql-table">izgled_nalozi</span> izn <span class="sql-keyword">ON</span> gn.id = izn.glavni_nalog_id;</div>
    </div>

    <div style="padding: 2rem;">
      <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 1rem;">🔍 Kako koristi VIEW u React-u</h2>
      
      <div class="sql-view-box">
        <div class="sql-title">JavaScript / React kod</div>
        <div class="sql-code" style="color: #e2e8f0;">// Učitaj SVE podatke sa JEDNIM upitom!
<span style="color: #f472b6;">const</span> { data, error } = <span style="color: #f472b6;">await</span> supabase
  .<span style="color: #34d399;">from</span>(<span style="color: #fbbf24;">'kompletan_nalog_view'</span>)
  .<span style="color: #34d399;">select</span>(<span style="color: #fbbf24;">'*'</span>)
  .<span style="color: #34d399;">eq</span>(<span style="color: #fbbf24;">'kalkulacija_id'</span>, kalkulacijaId)
  .<span style="color: #34d399;">single</span>();

<span class="sql-comment">// Dobijaš SVE odjednom:</span>
console.log(data.proizvod);           <span class="sql-comment">// "MPML Crux..."</span>
console.log(data.broj_naloga);        <span class="sql-comment">// "0202020/2026"</span>
console.log(data.stampa_nalog_id);    <span class="sql-comment">// "stampa-001"</span>
console.log(data.status_stampe);      <span class="sql-comment">// "ceka"</span>
console.log(data.materijali_nalog_id);<span class="sql-comment">// "materijali-001"</span>
<span class="sql-comment">// ... svi ostali!</span></div>
      </div>

      <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 2rem; margin-top: 2rem;">
        <h3 style="font-size: 20px; font-weight: 600; color: #047857; margin-bottom: 1rem;">
          ✨ Prednosti SQL VIEW-a
        </h3>
        <ul style="list-style: none; padding: 0;">
          <li style="padding: 0.5rem 0; padding-left: 1.5rem; position: relative;">
            <span style="position: absolute; left: 0; color: #10b981; font-weight: 700;">✓</span>
            <strong>1 SQL upit</strong> umesto 7 - brže učitavanje
          </li>
          <li style="padding: 0.5rem 0; padding-left: 1.5rem; position: relative;">
            <span style="position: absolute; left: 0; color: #10b981; font-weight: 700;">✓</span>
            <strong>Automatsko spajanje</strong> svih tabela
          </li>
          <li style="padding: 0.5rem 0; padding-left: 1.5rem; position: relative;">
            <span style="position: absolute; left: 0; color: #10b981; font-weight: 700;">✓</span>
            <strong>LEFT JOIN</strong> - radi čak i ako neki nalog ne postoji
          </li>
          <li style="padding: 0.5rem 0; padding-left: 1.5rem; position: relative;">
            <span style="position: absolute; left: 0; color: #10b981; font-weight: 700;">✓</span>
            <strong>Svi statusi</strong> na jednom mestu
          </li>
          <li style="padding: 0.5rem 0; padding-left: 1.5rem; position: relative;">
            <span style="position: absolute; left: 0; color: #10b981; font-weight: 700;">✓</span>
            <strong>Jednostavan kod</strong> - ne moraš ručno spajati
          </li>
          <li style="padding: 0.5rem 0; padding-left: 1.5rem; position: relative;">
            <span style="position: absolute; left: 0; color: #10b981; font-weight: 700;">✓</span>
            <strong>Performanse</strong> - optimizovano od strane baze
          </li>
        </ul>
      </div>
    </div>
  </div>

  <div class="nav-bottom">
    <button class="btn-secondary" onclick="showScreen(3)">◀ Nazad</button>
    <button class="btn-success" onclick="showScreen(1)">✓ ZAVRŠI - Nazad na početak</button>
  </div>
</div>

<script>
function showScreen(num) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen' + num).classList.add('active');
  window.scrollTo(0, 0);
}

function showTab(tabName) {
  // Remove active from all tabs
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
  
  // Add active to clicked tab
  event.currentTarget.classList.add('active');
  document.getElementById('tab-' + tabName).classList.add('active');
}
</script>

</body>
</html>
