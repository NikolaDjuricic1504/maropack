# 🏭 Maropack ERP — Sistem za upravljanje proizvodnjom

**Kompletan ERP sistem za fleksibilnu ambalažu** sa kalkulatorima, magacinom, radnim nalozima i AI optimizacijom.

---

## 🚀 INSTALACIJA

### 1. Instaliraj dependencies:
```bash
npm install
```

### 2. Supabase konfiguracija:
Kreiraj `.env` fajl (kopiraj iz `.env.template`):
```bash
cp .env.template .env
```

Popuni sa svojim Supabase kredencijalima:
```
VITE_SUPABASE_URL=https://tvoj-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=tvoj-anon-key
```

### 3. Pokreni aplikaciju:
```bash
npm run dev
```

Aplikacija će biti dostupna na: `http://localhost:5173`

---

## 📦 STRUKTURA PROJEKTA

```
maropack-final/
├── src/
│   ├── App.jsx                     # Glavna aplikacija
│   ├── main.jsx                    # Entry point
│   ├── supabase.js                 # Supabase konfiguracija
│   ├── constants.js                # Logo i konstante
│   ├── AIpanel.jsx                 # AI asistent
│   ├── AIsecenjeOptimizer.jsx      # AI optimizacija sečenja
│   ├── AIsecenjePreview.jsx        # Preview optimizacije
│   ├── DashboardProizvodnja.jsx    # Dashboard proizvodnje
│   ├── KalkulatorKese2.jsx         # Kalkulator za kese
│   ├── Magacin.jsx                 # Magacin + mobilno
│   ├── NalogFolija.jsx             # Radni nalog folije
│   ├── NalogKesaView.jsx           # Radni nalog kese
│   ├── NalogSpulna.jsx             # Radni nalog špulne
│   ├── NalogSpulnaView.jsx         # View špulne
│   ├── NoviNalogIzBaze.jsx         # Kreiranje iz baze
│   ├── PlanRezanjaNalog.jsx        # Plan rezanja
│   └── PracenjeNaloga.jsx          # Praćenje naloga
├── index.html                      # HTML template
├── vite.config.js                  # Vite config
├── package.json                    # Dependencies
├── .env.template                   # Environment template
├── .gitignore                      # Git ignore
└── README.md                       # Ova datoteka
```

---

## ✅ FUNKCIONALNOSTI

### 🧮 Kalkulatori:
- **Folija** — 4 sloja (A,B,C,D), kasiranje, lakiranje, štampa
- **Kese** — 3 sloja materijala
- **Špulne** — Dimenzije i gramatura

### 📦 Baza proizvoda:
- Prikazuje sve proizvode (folije, kese, špulne)
- Dugmad: "Otvori kalk." i "Kreiraj nalog"

### 🔧 Radni nalozi:
- Folija — 2 taba (Rezanje + Materijal)
- Kese — Materijal + Rezanje
- Špulne — Kompletan nalog sa ček listom

### 🏭 Magacin:
- PDF parser (Rossella format)
- QR kodovi za rolne
- MobilniMagacin

### 🤖 AI:
- AIpanel — chat sa bazom
- AIsecenjeOptimizer — optimizacija sečenja
- Supabase live queries

### 📱 Mobilno:
- MobilniRadnik — praćenje rada
- QR skeniranje naloga i rolni

---

## 👤 LOGIN KREDENCIJALI

**Admin:**
- Username: `Admin`
- Password: `admin123`

**Radnici:**
- Jovana / jovana123
- Jelena / jelena123
- Dunja / dunja123
- Tihana / tihana123
- Milan / milan123

---

## 🗄️ BAZA PODATAKA (Supabase)

### Tabele:
- `proizvodi` — Baza proizvoda
- `ponude` — Komercijalne ponude
- `nalozi` — Radni nalozi
- `magacin` — Rolne materijala
- `nalog_zastoji` — Zastoji u proizvodnji
- `spulne` — Špulne proizvodi
- `planovi_secenja` — Planovi rezanja

SQL šema se nalazi na Supabase dashboardu.

---

## 📝 DEPLOY NA VERCEL

1. Push projekat na GitHub
2. Povežite sa Vercel-om
3. Dodajte Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

---

## 🛠️ TEHNOLOGIJE

- **React 18** — UI framework
- **Vite** — Build tool
- **Supabase** — Backend & Database
- **html2canvas + jsPDF** — PDF export
- **QR Code API** — QR kodovi

---

## 📞 PODRŠKA

Za pitanja i podršku kontaktiraj developera.

**Verzija:** 1.0.0  
**Datum:** 25. april 2026.

---

## 🎯 ROADMAP (Koraci 2-8)

- [ ] **Korak 2:** Kese kalkulator sa 3 materijala (A,B,C)
- [ ] **Korak 3:** Kalkulacija → Nalog (sve 3 vrste)
- [ ] **Korak 4:** Baza → Nalog (sve 3 vrste)
- [ ] **Korak 5:** Nalog za kese — 2 A4 (bez kesičarenja)
- [ ] **Korak 6:** Nalog za špulne
- [x] **Korak 7:** Upload fajlova na nalog (VEĆ RADI!)
- [ ] **Korak 8:** Auto-izračun: kom→metraza→kg

**Posle osnova:** AI integracija! 🤖
