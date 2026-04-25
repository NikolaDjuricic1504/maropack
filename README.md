# 📦 Maropack ERP — Export aplikacije

## 🎯 Kompletan sistem za upravljanje proizvodnjom fleksibilne ambalaže

Ovo je **export trenutnog stanja** aplikacije sa svim komponentama i fajlovima.

---

## 📂 Struktura projekta

```
maropack-export/
├── README.md                  # Ova datoteka
├── package.json               # NPM dependencies
├── App.jsx                    # Glavna aplikacija
├── supabase.js                # Supabase konfiguracija
├── constants.js               # Logo i konstante
├── AIpanel.jsx                # AI asistent panel
├── Magacin.jsx                # Magacin + mobilno
├── KalkulatorKese2.jsx        # Kalkulator za kese
├── PracenjeNaloga.jsx         # Praćenje naloga
├── NalogFolija.jsx            # Radni nalog za folije
├── NalogKesaView.jsx          # Radni nalog za kese
├── NalogSpulnaView.jsx        # Radni nalog za špulne
├── NoviNalogIzBaze.jsx        # Kreiranje naloga iz baze
├── PlanRezanjaNalog.jsx       # Plan rezanja
└── database.sql               # SQL šema baze
```

---

## 🚀 Instalacija

### 1. **Instaliraj dependencies:**
```bash
npm install react react-dom
npm install @supabase/supabase-js
npm install html2canvas jspdf
npm install vite
```

### 2. **Supabase setup:**
Kreiraj `.env` fajl sa tvojim Supabase kredencijalima:
```
VITE_SUPABASE_URL=tvoj_url
VITE_SUPABASE_ANON_KEY=tvoj_key
```

### 3. **Pokreni aplikaciju:**
```bash
npm run dev
```

---

## ✅ ŠTA VEĆ RADI:

### Kalkulatori:
- ✅ **Folija** — 4 sloja (A,B,C,D), kasiranje, lakiranje, štampa
- ✅ **Kese** — Kompletan kalkulator
- ✅ **Špulne** — Dimenzije i gramatura

### Baza:
- ✅ **BazaProizvoda** — prikazuje sve proizvode
- ✅ Dugmad: "Otvori kalk." i "Kreiraj nalog"

### Nalozi:
- ✅ **NalogFolija** — 2 taba (Rezanje + Materijal)
- ✅ **NalogKesaView** — Nalog za kese
- ✅ **NalogSpulnaView** — Nalog za špulne
- ✅ **PracenjeNaloga** — Praćenje uživo

### Magacin:
- ✅ **Magacin** — PDF parser, QR kodovi
- ✅ **MobilniMagacin** — QR skeniranje rolni

### Mobilno:
- ✅ **MobilniRadnik** — Praćenje rada, zastoji, završetak
- ✅ **MobilniRadnikPonBr** — QR skeniranje naloga

---

## 🔜 PLAN RADA (Koraci 2-8):

### **Korak 2:** Kese kalkulator — 3 materijala (A,B,C)
- Dodati 3 reda materijala sa MAT_DATA select
- Auto kg kalkulacija

### **Korak 3:** Kalkulacija → Nalog (sve 3 vrste)
- Folija ✅ već ima "Kreiraj naloge direktno"
- Kese: dodati dugme
- Špulne: dodati dugme

### **Korak 4:** Baza → Nalog (sve 3 vrste)
- Popraviti NoviNalogIzBaze.jsx da puni podatke

### **Korak 5:** Nalog za kese — 2 A4 (bez kesičarenja)
- Skloniti kesičarenje tab ako postoji

### **Korak 6:** Nalog za špulne
- Proveriti i doraditi

### **Korak 7:** Upload fajlova ✅ VEĆ RADI

### **Korak 8:** Auto-izračun: kom→metraza→kg
- Dodati u sve naloge

---

## 🤖 AI INTEGRACIJA (posle Koraka 8):

1. **AI u kalkulaciji** — predlog cene
2. **AI u magacinu — PDF** — čita packing liste
3. **AI u magacinu — chat** — odgovara na pitanja
4. **AI za ponude** — generiše tekst
5. **AI za naloge** — tehnički parametri

---

## 📊 Baza podataka (Supabase):

### Tabele:
- `proizvodi` — Baza proizvoda (folije, kese, špulne)
- `ponude` — Komercijalne ponude
- `nalozi` — Radni nalozi
- `magacin` — Rolne materijala
- `nalog_zastoji` — Zastoji u proizvodnji
- `spulne` — Špulne proizvodi

### SQL šema:
Pogledaj `database.sql` za kompletan CREATE TABLE

---

## 👤 Login kredencijali:

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

## 📞 Kontakt:

Za pitanja i podršku kontaktiraj developera.

**Verzija:** 1.0.0  
**Datum:** 25. april 2026.
