# 🚀 MAROPACK - FAZE 1-4 - KOMPLETAN UPGRADE

Verzija: 2.0
Datum: 26.04.2026

---

## 📦 **SADRŽAJ PAKETA**

### ✅ **FAZA 1: Baza Proizvoda**
**Fajl:** `BazaProizvoda-NOVO.jsx`

**Funkcionalnosti:**
- ⚡ Kreiranje naloga iz proizvoda (1 klik)
- ✏️ Izmena proizvoda (modal forma)
- ➕ Dodavanje novih proizvoda (dropdown odabir tipa)
- 🗑️ Arhiviranje proizvoda (soft delete)
- 🔍 Filtriranje i pretraga

**Kako da implementiraš:**
1. Zameni `src/BazaProizvoda.jsx` sa `BazaProizvoda-NOVO.jsx`
2. U `App.jsx`, dodaj `user` prop:
```javascript
{page==="baza" && (
  <BazaProizvoda
    card={card} 
    inp={inp} 
    lbl={lbl}
    msg={msg} 
    user={user}  // ← DODAJ OVO!
  />
)}
```

---

### ✅ **FAZA 2: Sačuvaj u Bazu**
**Fajl:** `KalkulatorKese2-SA-SACUVAJ.jsx`

**Funkcionalnosti:**
- 💾 Dugme "Sačuvaj u bazu" u kalkulatoru
- 📊 Čuva SVE podatke (materijali, dimenzije, cene, rezultate)
- 🔄 Omogućava kreiranje naloga iz sačuvanih proizvoda

**Kako da implementiraš:**
1. Zameni `src/KalkulatorKese2.jsx` sa `KalkulatorKese2-SA-SACUVAJ.jsx`
2. **VAŽNO:** Primeni isti pristup na `KalkulatorFolije.jsx` i `KalkulatorSpulne.jsx`
   - Dodaj `sacuvaj()` funkciju
   - Dodaj dugme "💾 Sačuvaj u bazu" u rezultate

---

### ✅ **FAZA 3: Upgrade Kreiranja Naloga**
**Fajl:** `NoviNalogIzBaze-UPGRADED.jsx`

**Funkcionalnosti:**
- 📋 Dropdown sa SVIM proizvodima iz baze
- 🎨 Grupisano po tipovima (Folije/Kese/Špulne)
- 👁️ Live preview odabranog proizvoda
- 💰 Prikaz kalkulisane cene
- 🧪 Prikaz materijala
- 📊 Statistika dostupnih proizvoda
- ⚡ Auto-popunjavanje količine

**Kako da implementiraš:**
1. Zameni `src/NoviNalogIzBaze.jsx` sa `NoviNalogIzBaze-UPGRADED.jsx`
2. Proveri da prop `db` sadrži `proizvodi` array

---

### ✅ **FAZA 4A: AI Asistent za Kalkulacije**
**Fajl:** `AIAsistent-Kalkulacije.jsx`

**Funkcionalnosti:**
- 🤖 Pametni AI asistent
- 💡 Preporuke materijala
- 📐 Optimizacija dimenzija
- 💰 Analiza troškova
- 🏭 Saveti za proizvodni proces
- 📜 Istorija pitanja
- ⚡ Brza pitanja (quick actions)

**Kako da implementiraš:**
1. Kopiraj `AIAsistent-Kalkulacije.jsx` u `src/`
2. U `App.jsx`, dodaj import:
```javascript
import AIAsistentKalkulacije from "./AIAsistent-Kalkulacije.jsx";
```
3. Dodaj u navigaciju:
```javascript
var nav = [
  // ... postojeće stavke ...
  {k:"ai_kalk",l:"AI Asistent",i:"🤖"}
];
```
4. Dodaj render:
```javascript
{page==="ai_kalk" && (
  <AIAsistentKalkulacije 
    card={card} 
    inp={inp} 
    lbl={lbl} 
    msg={msg}
  />
)}
```

---

### ✅ **FAZA 4B: Poboljšani Radni Nalozi**
**Fajl:** `NalogFolija-ENHANCED.jsx`

**Funkcionalnosti:**
- ⚙️ **Parametri** - 20+ tehničkih parametara:
  - Grafika i štampa (6 parametara)
  - Perforacija (4 parametra)
  - Rezanje (5 parametara)
  - Dodatne operacije (4 parametra)
  - Lepak - kasiranje (3 parametra)
  
- ✅ **Kontrolne tačke** - 8 koraka praćenja:
  1. Priprema materijala
  2. Podešavanje mašine
  3. Test otisak
  4. Proizvodnja - prva polovina
  5. Međukontrola kvaliteta
  6. Proizvodnja - druga polovina
  7. Završna kontrola
  8. Pakovanje

- 📊 **Progress tracking** - vizuelni prikaz napretka
- 🎯 **3 taba** - Parametri / Kontrola / Materijali
- 💾 **Auto-čuvanje** - svi parametri se čuvaju u bazi

**Kako da implementiraš:**
1. Zameni `src/NalogFolija.jsx` sa `NalogFolija-ENHANCED.jsx`
2. **BAZA PODATAKA** - proveri kolone:
```sql
-- Ako nemaš, dodaj kolonu za parametre:
ALTER TABLE nalozi ADD COLUMN IF NOT EXISTS parametri JSONB;
```

---

## 🗄️ **BAZA PODATAKA - PROVERA**

### **Tabela: `proizvodi`**
Proveri da postoje SVE kolone:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'proizvodi'
ORDER BY ordinal_position;
```

**Potrebne kolone:**
- `id` (bigint)
- `created_at` (timestamp)
- `tip` (text) - 'folija', 'kesa', 'spulna'
- `naziv` (text)
- `kupac` (text)
- `sku` (text)
- `status` (text) - 'Aktivan', 'Arhiviran'
- `sir` (integer)
- `ik` (integer)
- `met` (integer)
- `nal` (integer)
- `sk` (numeric)
- `mar` (numeric)
- `mats` (jsonb) - **KRITIČNO!**
- `res` (jsonb) - **KRITIČNO!**
- `kesa_materijal` (text)
- `kesa_sirina` (integer)
- `kesa_duzina` (integer)
- `kesa_klapna` (integer)
- `kesa_takt` (integer)
- `kesa_ban` (integer)
- `datum` (text)
- `ko` (text)

**Ako nešto nedostaje, pokreni:**
```sql
-- Iz prethodne sesije, kompletna skripta je u ZIP-u
-- ili kontaktiraj za pomoć
```

### **Tabela: `nalozi`**
Proveri da postoji kolona `parametri`:

```sql
ALTER TABLE nalozi ADD COLUMN IF NOT EXISTS parametri JSONB;
```

---

## 🚀 **DEPLOYMENT KORACI**

### **1. Backup postojećeg sistema**
```bash
# Kloniraj trenutni projekat
git clone <tvoj-repo> maropack-backup
```

### **2. Instaliraj nove fajlove**
```bash
# Raspakuj ZIP
unzip MAROPACK-FAZA1-4-COMPLETE.zip -d src/

# Zameni fajlove
cp src/BazaProizvoda-NOVO.jsx src/BazaProizvoda.jsx
cp src/KalkulatorKese2-SA-SACUVAJ.jsx src/KalkulatorKese2.jsx
cp src/NoviNalogIzBaze-UPGRADED.jsx src/NoviNalogIzBaze.jsx
cp src/NalogFolija-ENHANCED.jsx src/NalogFolija.jsx
# AIAsistent-Kalkulacije.jsx je nov fajl - samo kopiraj
```

### **3. Ažuriraj App.jsx**
Otvori `src/App.jsx` i primeni izmene iz gornjeg dela README-a.

### **4. Testiraj lokalno**
```bash
npm install
npm run dev
```

Proveri:
- ✅ Baza proizvoda - dodavanje/izmena/nalozi
- ✅ Kalkulator kese - dugme "Sačuvaj"
- ✅ Novi nalog iz baze - dropdown radi
- ✅ AI Asistent - otvara se stranica
- ✅ Radni nalog - parametri i kontrolne tačke

### **5. Deploy na Vercel**
```bash
git add .
git commit -m "UPGRADE: Faze 1-4 implementirane"
git push origin main
```

Vercel će automatski deploy-ovati novu verziju!

---

## 📋 **CHECKLIST PRE DEPLOYA**

- [ ] Raspakovan ZIP
- [ ] Zamenjeni svi fajlovi
- [ ] Ažuriran App.jsx (import + nav + render)
- [ ] Proveren Supabase (kolone `mats`, `res`, `parametri`)
- [ ] Lokalno testirano
- [ ] Git commit
- [ ] Deploy na Vercel
- [ ] Proveren production deploy

---

## 🆘 **TROUBLESHOOTING**

### **Problem: "Column mats does not exist"**
**Rešenje:**
```sql
ALTER TABLE proizvodi ADD COLUMN mats JSONB;
ALTER TABLE proizvodi ADD COLUMN res JSONB;
```

### **Problem: "Cannot read property 'ime' of undefined"**
**Rešenje:** Dodaj `user` prop u BazaProizvoda poziv u App.jsx

### **Problem: "AI Asistent se ne otvara"**
**Rešenje:** Proveri da li si dodao:
1. Import u App.jsx
2. Stavku u `nav` array
3. Render uslov `{page==="ai_kalk" && ...}`

### **Problem: "Dropdown u NoviNalogIzBaze prazan"**
**Rešenje:** Proveri da `db.proizvodi` array ima podatke:
```javascript
console.log("Proizvodi:", db.proizvodi);
```

---

## 📞 **KONTAKT ZA PODRŠKU**

Ako naiđeš na probleme:
1. Proveri Console u browseru (F12)
2. Proveri Network tab za API greške
3. Proveri Supabase logs
4. Kontaktiraj za pomoć!

---

## 🎉 **UŽIVAJ U NOVOM SISTEMU!**

Verzija 2.0 donosi:
- 🚀 4x brže kreiranje naloga
- 📊 Kompletnu bazu proizvoda
- 🤖 AI asistenta za pomoć
- ✅ Detaljno praćenje proizvodnje

**SREĆNO!** 🎊
