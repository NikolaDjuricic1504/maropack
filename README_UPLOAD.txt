# 📏 ANALIZA ŠIRINA - Planirano vs Stvarno

## 🎯 **ŠTA RADI:**

Poredi **planirane širine** iz radnih naloga sa **stvarno korišćenim** rolnama iz magacina!

---

## 💡 **ZAŠTO JE OVO KORISNO:**

### **Problem:**
```
Nalog traži: BOPP 20µ 1000mm
Ali koristiš: 1020mm, 980mm, 1030mm, 1000mm

❌ 4 različite širine za isti materijal!
❌ Veći inventar nego što treba
❌ Više otpada prilikom sečenja
```

### **Rešenje:**
```
💬 "Analiza širina"

Vidiš:
- Koje širine su planirane u nalozima
- Koje širine stvarno koristiš
- RAZLIKU i odstupanje
- Preporuke za standardizaciju
```

---

## 📊 **PRIMER OUTPUTA:**

```
💬 "Analiza širina"

📏 ANALIZA ŠIRINA - Planirano vs Stvarno:

▸ BOPP 20µ:
  📋 Planirano: 1000mm (15x), 1500mm (3x)
  ✅ Stvarno: 1000mm (12x), 1020mm (5x), 980mm (2x), 1500mm (3x)
  ⚠️ Korišćeno DRUGE širine: 1020mm, 980mm
  📊 Prosečno odstupanje: 18.3mm
  💡 Preporuka: Standardizuj na 1000mm

▸ CPP 25µ:
  📋 Planirano: 740mm (8x)
  ✅ Stvarno: 740mm (8x)
  ✅ PERFEKTNO poklapanje!

▸ FXC 15µ:
  📋 Planirano: 1560mm (28x)
  ✅ Stvarno: 1560mm (25x), 1580mm (3x)
  ⚠️ Korišćeno DRUGE širine: 1580mm
  📊 Prosečno odstupanje: 20.0mm
  💡 Preporuka: Standardizuj na 1560mm

▸ PET 12µ:
  📋 Planirano: —
  ✅ Stvarno: 850mm (5x)
  ⚠️ Korišćeno bez planiranja u nalozima!

📊 UKUPNO:
Planiranih grupa: 15
Stvarno korišćenih grupa: 18
```

---

## 🔍 **KAKO FUNKCIONIŠE:**

### **Korak 1: Učitaj naloge**
```sql
SELECT * FROM nalozi
WHERE sir IS NOT NULL
  AND mat IS NOT NULL
  AND deb IS NOT NULL
```

### **Korak 2: Grupiši planirano**
```javascript
// Po tipu i debljini
BOPP 20µ:
  - 1000mm → 15 naloga
  - 1500mm → 3 naloga

CPP 25µ:
  - 740mm → 8 naloga
```

### **Korak 3: Učitaj iskorišćene rolne**
```sql
SELECT * FROM magacin
WHERE status = 'Iskorišćeno'
  AND tip IS NOT NULL
  AND sirina IS NOT NULL
```

### **Korak 4: Grupiši stvarno**
```javascript
// Ekstraktuj tip i debljinu iz "BOPP 20"
BOPP 20µ:
  - 1000mm → 12 rolni
  - 1020mm → 5 rolni
  - 980mm → 2 rolni
```

### **Korak 5: Uporedi i analiziraj**
```javascript
// Razlika
Planirano: [1000mm, 1500mm]
Stvarno:   [1000mm, 1020mm, 980mm, 1500mm]

Korišćeno DRUGE širine: [1020mm, 980mm]
Odstupanje: 20mm (1020 - 1000), 20mm (1000 - 980)
Prosečno: 20mm
```

---

## 📋 **KOLONE KOJE SE KORISTE:**

### **Iz tabele `nalozi`:**
- `mat` → Tip materijala (BOPP, CPP, FXC...)
- `deb` → Debljina (20, 25, 15...)
- `sir` → Planirana širina (1000, 740, 1560...)

### **Iz tabele `magacin`:**
- `tip` → Tip materijala sa debljinom ("BOPP 20", "CPP 25"...)
- `sirina` → Stvarna širina (1000, 1020, 980...)
- `status` → Mora biti "Iskorišćeno"

---

## 🎯 **USE CASES:**

### **1. Standardizacija zaliha:**
```
Problem: Koristiš 980mm, 1000mm, 1020mm za isti proizvod
Rešenje: Naručuj samo 1000mm sa tolerancijom ±20mm
```

### **2. Optimizacija nabavke:**
```
Problem: Planirano 1550mm, ali koristiš 1560mm
Rešenje: Promeni plan ili traži 1550mm od dobavljača
```

### **3. Smanjenje otpada:**
```
Problem: Previše različitih širina = više sečenja
Rešenje: Manje varijanti = manje otpada
```

### **4. Otkrivanje grešaka:**
```
Problem: Korišćeno bez naloga
Rešenje: Proveri zašto nema planiranja
```

---

## 🚀 **KAKO KORISTITI:**

### **Osnovni upit:**
```
💬 "Analiza širina"
💬 "Planirano vs stvarno"
```

### **Quick button:**
```
Klikni [Analiza širina] u AI asistentu
```

---

## 📊 **DODATNE MOGUĆNOSTI:**

Mogu još dodati:

### **1. Export u Excel:**
```javascript
💬 "Export analiza širina"
📥 Preuzima analiza_sirina_2026-04-26.csv
```

### **2. Grafikon odstupanja:**
```javascript
💬 "Grafikon širina"
📊 Bar chart sa odstupanjima
```

### **3. Tolerancija:**
```javascript
💬 "Analiza širina tolerancija ±20mm"
✅ Ignoriše odstupanja unutar 20mm
```

### **4. Po kupcu:**
```javascript
💬 "Analiza širina kupac MAROPACK"
📏 Samo za jednog kupca
```

**Hoćeš li nešto od ovoga?** 🤔

---

## ⚠️ **NAPOMENE:**

### **Format tipa u magacinu:**
```javascript
✅ Dobro:  "BOPP 20", "CPP 25", "FXC 15"
❌ Loše:   "BOPP", "CPP 25µ", "FXC-15"

Mora biti: TIP + RAZMAK + DEBLJINA
```

### **Podaci u nalozima:**
```javascript
Mora postojati:
- mat: "BOPP"
- deb: 20
- sir: 1000
```

### **Status u magacinu:**
```javascript
Analiza gleda SAMO:
status = "Iskorišćeno"

Ignoriše:
- "Na stanju"
- "U proizvodnji"
```

---

## 🎉 **TESTIRANJE:**

```bash
# 1. Deploy V2
git add .
git commit -m "Analiza širina - Planirano vs Stvarno"
git push

# 2. Otvori AI asistent
# 3. Klikni [Analiza širina]
# 4. Vidi rezultate!
```

---

## 💰 **100% BESPLATNO!**

- ✅ Direktan SQL query
- ✅ Bez API troškova
- ✅ Instant rezultati

**Radi offline nakon učitavanja!** 🚀
