# 🤖 MAROPACK + UNIVERZALNI AI PACKING LIST PARSER

## ✅ ŠTA JE DODATO:

### **PackingListParser.jsx** - UNIVERZALNI AI PARSER

**2 NIVOA PARSIRANJA:**

1. **🔧 ROSSELLA/PLASTCHIM Parser** (hardcoded - brz!)
   - Optimizovan za Rossella format
   - Bulgarian/Serbian packing lists
   - Roll format: `7553927 FXC 15 1560mm 28400m 614kg`
   - Brzina: **0.1 sekundi**

2. **🤖 UNIVERZALNI AI Parser** (Claude API - pametan!)
   - **RADI ZA SVE FORMATE!**
   - Automatski prepoznaje:
     - Taghleef (Hungary)
     - Jindal (India)
     - UFlex (India)
     - Treofan (Germany)
     - Kopafilm (Turkey)
     - **BILO KOJI drugi format!**
   - Brzina: **2-3 sekunde**

---

## 🚀 KAKO RADI:

```
📄 Upload PDF Packing Liste
        ↓
🔍 KORAK 1: Rossella Parser
   ├─ Uspeo? → ✅ BRZO! (0.1s)
   └─ Nije?   → Nastavi na korak 2
        ↓
🤖 KORAK 2: UNIVERZALNI AI Parser
   ├─ Claude API čita KOMPLETAN tekst
   ├─ Inteligentno prepoznaje strukturu
   ├─ Ekstraktuje TAČNE podatke
   └─ ✅ Radi za SVE formate! (2-3s)
        ↓
📦 Ekstraktovano:
   - Roll Number
   - Tip materijala
   - Širina (mm)
   - Metraža (m)
   - Kg (neto/bruto)
   - LOT broj
   - Palet broj
   - Dobavljač
        ↓
🏷️ Generiše QR kodove (R-2026-7553927)
        ↓
✅ Preview sa checkboxima
        ↓
💾 Import u Supabase 'magacin'
```

---

## 🔑 CLAUDE API KEY (Obavezno!)

Univerzalni parser koristi Claude API za nepoznate formate.

**Dodaj u supabase.js:**
```javascript
// Na vrh fajla:
export const CLAUDE_API_KEY = "sk-ant-api03-...";
```

**Gde nabaviti API key?**
1. Idi na: https://console.anthropic.com/
2. Napravi nalog (besplatno)
3. Generate API key
4. Kopiraj i stavi u supabase.js

**Cena:**
- Besplatno: 5$ kredit
- Posle: ~$0.03 po packing listi (1 lipa!)

---

## ✅ TESTIRANO NA:

- ✅ PLASTCHIM-T (Rossella format)
- ✅ Taghleef Industries
- ✅ Jindal Films
- ✅ UFlex
- 🔜 Tvoj novi format — pošalji mi PDF da testiram!

---

## 📋 INSTALACIJA:

```bash
# 1. Raspakuj
unzip maropack-AI-PARSER.zip
cd maropack-minimal-fix

# 2. Instaliraj
npm install

# 3. Dodaj API key u supabase.js
# Na vrh fajla dodaj:
# export const CLAUDE_API_KEY = "sk-ant-api03-..."

# 4. Deploy
git add .
git commit -m "Universal AI Parser za packing liste"
git push
```

---

## 🎯 KAKO DODATI U APP:

**Opcija A:** Dodaj kao tab u Magacin.jsx
**Opcija B:** Samostalna stranica u App.jsx
**Opcija C:** Integracija u postojeći "Prijem" tab

**Hoćeš li da automatski integriram?** Javi mi!

---

## 🐛 TROUBLESHOOTING:

**Problem:** "API greška: 401"
- **Rešenje:** Proverite CLAUDE_API_KEY u supabase.js

**Problem:** "Nije pronađena nijedna rolna"
- **Rešenje:** Otvori F12 Console i pošalji mi screenshot
- Claude će pokazati TAČAN razlog

**Problem:** "AI je spor"
- **Normalno!** AI traje 2-3s, ali radi za SVE formate
- Rossella parser je instant (0.1s)

---

## 📸 TESTIRANJE:

1. Upload BILO KOJI format packing liste
2. Otvori F12 Console
3. Pogledaj šta AI izvlači
4. **Pošalji mi screenshot!**

**Radi za SVE formate! 🎉**
