# 🎨 MAROPACK - FAZA 5: MODERN CORPORATE UPGRADE

## 📦 ŠTA JE NOVO?

### ✨ **Dashboard-NOVO.jsx** - Modern Corporate Design
- 🎨 Gradient purple-blue pozadina
- 📊 4 animated stat kartice sa hover efektima
- 📈 Chart.js grafikoni (umesto Recharts)
- 🔄 Auto-refresh toggle (30 sekundi)
- ⚡ Smooth animacije i transitions
- 💚 Real-time pulsing indicator

### 🤖 **AIAsistent-Kalkulacije-ENHANCED.jsx** - AI sa Super Powers
- 💡 Pre-defined česta pitanja po modulima
- 💾 Čuvanje omiljenih upita (localStorage)
- 📄 Export odgovora u PDF (print to PDF)
- 📂 Browse saved queries sa delete funkcijom
- ⏱️ Timestamps na svim upitima
- 🎯 Quick load funkcija

---

## 🚀 INSTALACIJA

### KORAK 1: Zameni fajlove

**U tvom `src/` folderu:**

1. **Preimenuj stari Dashboard.jsx:**
   ```bash
   mv Dashboard.jsx Dashboard-OLD.jsx
   ```

2. **Kopiraj novi Dashboard:**
   ```bash
   cp Dashboard-NOVO.jsx Dashboard.jsx
   ```

3. **Preimenuj stari AI Asistent:**
   ```bash
   mv AIAsistent-Kalkulacije.jsx AIAsistent-Kalkulacije-OLD.jsx
   ```

4. **Kopiraj novi AI Asistent:**
   ```bash
   cp AIAsistent-Kalkulacije-ENHANCED.jsx AIAsistent-Kalkulacije.jsx
   ```

### KORAK 2: Proveri da Chart.js radi

Dashboard-NOVO.jsx koristi Chart.js umesto Recharts!

**Chart.js se učitava dinamički iz CDN-a**, ne treba ti ništa instalirati!

### KORAK 3: Deploy

```bash
git add .
git commit -m "FAZA 5: Modern Corporate Dashboard + Enhanced AI"
git push
```

Vercel će automatski deployovati novu verziju!

---

## 🎯 KAKO KORISTITI NOVE FEATURES

### 📊 **Dashboard**

#### Auto-Refresh Toggle
```jsx
// Dugme u gornjem desnom uglu
▶ Auto-refresh  →  klikni da uključiš
⏸ Pauziraj     →  klikni da isključiš
```

Auto-refresh osvežava podatke **svakih 30 sekundi** automatski!

#### Hover Efekti
- Pređi mišem preko **stat kartica** → animacija (lift up)
- Sve kartice imaju **gradient top border**
- Smooth transitions na svim elementima

#### Chart.js Grafikoni
- **Proizvodnja po danima** - Line chart
- **Top proizvodi** - Doughnut chart  
- **Radnici performanse** - Bar chart

### 🤖 **AI Asistent Enhanced**

#### Česta Pitanja
Klikni na bilo koje **pre-defined pitanje** → automatski popunjava input!

Pitanja su **kategorisana po modulima**:
- 🧮 Kalkulacije (5 pitanja)
- 📄 Ponude (5 pitanja)
- 📋 Radni nalozi (5 pitanja)
- 🏭 Magacin (5 pitanja)
- 🧠 Sečenje (5 pitanja)

#### Sačuvaj Upit
```
1. Napiši upit
2. Klikni "💾 Sačuvaj upit"
3. Upit se čuva u localStorage (ne gubi se pri refresh-u!)
```

#### Učitaj Sačuvani Upit
```
1. Klikni "📂 Sačuvani upiti (N)"
2. Klikni "↩ Učitaj" na željenom upitu
3. Upit se automatski popunjava u input
```

#### Export u PDF
```
1. Dobij odgovor od AI-a
2. Klikni "📄 Export PDF"
3. Otvoriće se print dialog
4. Izaberi "Save as PDF" ili printaj
```

PDF sadrži:
- 📌 Header sa Maropack logom
- 📅 Datum i vreme
- 🤖 Modul i pitanje
- ✍️ Kompletan AI odgovor
- 🔖 Footer sa copyright

---

## 🎨 DIZAJN SISTEMA - MODERN CORPORATE

### Paleta Boja
```css
Primary Purple:   #667eea
Secondary Purple: #764ba2
Green Success:    #10b981
Orange Warning:   #f59e0b
Red Danger:       #ef4444
Purple Accent:    #8b5cf6
Background:       #f7fafc
```

### Gradients
```css
Header: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
Blue:   linear-gradient(90deg, #667eea, #764ba2)
Green:  linear-gradient(90deg, #10b981, #34d399)
Orange: linear-gradient(90deg, #f59e0b, #fbbf24)
Purple: linear-gradient(90deg, #8b5cf6, #a78bfa)
```

### Animacije
```css
Pulse (status indicator):
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

Hover Transform:
transform: translateY(-4px);
box-shadow: 0 12px 24px rgba(0,0,0,0.15);
```

---

## 📝 DODATNE NAPOMENE

### Chart.js vs Recharts
**STARI Dashboard:** Recharts (React komponente)  
**NOVI Dashboard:** Chart.js (vanilla JS, lakši, brži)

Chart.js se učitava **dinamički** preko CDN-a:
```javascript
https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js
```

### LocalStorage za Saved Queries
```javascript
Key: "maropack_saved_queries"
Format: JSON array
Example: [
  {
    id: 1234567890,
    upit: "Kako da kalkulišem...",
    modul: "kalkulacije",
    timestamp: "27.4.2026. 14:42"
  }
]
```

### Browser Compatibility
- ✅ Chrome/Edge (preporučeno)
- ✅ Firefox
- ✅ Safari
- ⚠️ IE11 (ne podržava Chart.js 4.x)

---

## 🐛 TROUBLESHOOTING

### Problem: Grafikoni se ne prikazuju
**Rešenje:** Proveri konzolu (F12) da li ima greške sa Chart.js učitavanjem.

```javascript
// Ako vidiš: "Chart is not defined"
// Znači da CDN nije učitao Chart.js

// Fix: Dodaj u index.html <head>:
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>
```

### Problem: Auto-refresh ne radi
**Rešenje:** Proveri da li si kliknuo na dugme "▶ Auto-refresh"

```javascript
// U kodu:
const [autoRefresh, setAutoRefresh] = useState(false);

// Mora biti true da bi radio:
setAutoRefresh(true);
```

### Problem: Saved Queries nestaju
**Rešenje:** Proveri localStorage u browser DevTools

```javascript
// Otvori Console (F12)
localStorage.getItem("maropack_saved_queries")

// Ako je null, znači da nema saved queries
// Ako vraća JSON, znači da postoje ali možda ima bug u render-u
```

### Problem: PDF export ne radi
**Rešenje:** Proveri da li browser dozvoljava popup prozore

```javascript
// Chrome: Settings → Privacy → Popups → Allow
// Firefox: Options → Privacy → Exceptions → Allow
```

---

## 🎯 SLEDEĆE FAZE (Coming Soon!)

### FAZA 6: Baza Proizvoda Advanced
- 🔍 Advanced search (tip, dimenzije, datum)
- 🏷️ Tags & kategorije  
- 📤 Excel export (kompletna baza)
- 🖼️ Image preview za proizvode
- 📊 Analytics po tipu proizvoda

### FAZA 7: Radni Nalozi QR
- 📱 QR kod za svaki nalog
- 📲 Mobile-friendly skeniranje
- ⏱️ Timer funkcionalnost (start/stop)
- 👷 Statistika po radniku
- 📈 Real-time tracking

### FAZA 8: Magacin Visual
- 🗺️ Vizuelna mapa lokacija (2D grid)
- 🔔 Low stock alerts (push notifications)
- 📊 Graf potrošnje materijala (Chart.js)
- 📍 Heatmap najkorišćenijih lokacija
- 🔄 Automatska rotacija (FIFO/LIFO)

---

## 📞 PODRŠKA

Ako imaš pitanja ili probleme:

1. Proveri ovaj README
2. Proveri browser konzolu (F12)
3. Proveri Vercel deployment logs
4. Pitaj me! 🤖

---

## ✅ CHECKLIST ZA DEPLOYMENT

- [ ] Zamenjeni fajlovi (Dashboard.jsx, AIAsistent-Kalkulacije.jsx)
- [ ] Testirano lokalno (`npm run dev`)
- [ ] Commit i push na GitHub
- [ ] Vercel deploy uspešan
- [ ] Chart.js grafikoni rade
- [ ] Auto-refresh toggle radi
- [ ] Saved queries rade (localStorage)
- [ ] PDF export radi
- [ ] Mobile responsive (proveri na telefonu)

---

**🎉 GOTOVO! UŽIVAJ U NOVOM DASHBOARDU! 🎉**
