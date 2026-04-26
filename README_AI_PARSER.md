# 🤖 MAROPACK + AI PACKING LIST PARSER

## ✅ ŠTA JE DODATO:

### **PackingListParser.jsx** - HYBRID AI PARSER

**3 NIVOA PARSIRANJA:**

1. **🔧 PLASTCHIM-T Parser** (hardcoded)
   - Rossella format
   - Bulgarian packing lists
   - Roll format: `7553927 FXC 15 1560mm 28400m 614kg`

2. **🔧 TAGHLEEF Parser** (hardcoded)
   - Hungarian packing lists
   - Reel format: `110949959 NATIVIA NTSS 30 1650 904kg 14700m`

3. **🤖 AI Fallback** (Claude API)
   - SVE OSTALE formate!
   - Automatski ekstraktuje: roll_no, tip, širina, metraža, kg, LOT, palet

---

## 🚀 KAKO KORISTITI:

### **1. Dodaj u App.jsx:**

```javascript
import PackingListParser from "./PackingListParser.jsx";

// U navigaciji dodaj:
["aiParser", "🤖 AI Parser"]

// U renderPage() dodaj:
case "aiParser": return <PackingListParser msg={msg} card={card} inp={inp} lbl={lbl} />;
```

### **2. Uploaduj PDF:**
1. Klikni "🤖 AI Parser" u meniju
2. Upload PDF packing liste
3. Parser automatski detektuje format
4. Preview rolni sa checkboxima
5. Klikni "💾 Uvezi u magacin"

---

## 📋 KAKO RADI:

```
PDF Upload
    ↓
PDF.js ekstraktuje tekst
    ↓
Format detection:
  ├─ PLASTCHIM? → Hardcoded parser (brzo!)
  ├─ TAGHLEEF?  → Hardcoded parser (brzo!)
  └─ Nepoznato? → AI Claude API (pametno!)
    ↓
Generiše QR kodove (R-2026-7553927)
    ↓
Preview sa checkboxima
    ↓
User potvrđuje
    ↓
INSERT u Supabase tabelu 'magacin'
```

---

## 🔑 POTREBAN CLAUDE API KEY:

AI fallback koristi Claude API. Bez key-a, radi samo za PLASTCHIM i TAGHLEEF formate.

**Dodaj u supabase.js:**
```javascript
export const CLAUDE_API_KEY = "sk-ant-api03-...";
```

**Ili izbaci AI fallback:**
```javascript
// Zakomentiraj u PackingListParser.jsx liniju ~170:
// rolne = await parseAI(text);
```

---

## ✅ TESTIRANO NA:

- ✅ PLASTCHIM-T (0040090953.pdf)
- ✅ TAGHLEEF (Packing_List_nr_2026-989.pdf)
- 🔜 Rossella (dodaj primer da testiram!)
- 🔜 Ostali formati (AI će ih razumeti!)

---

## 🎯 SLEDEĆI KORACI:

1. **Dodaj dobavljača u Supabase dropdown**
2. **Dodaj LOT search u Magacin.jsx**
3. **Batch QR print** (štampaj sve QR kodove odjednom)
4. **Auto-location** (AI predlaže lokaciju u magacinu)

**Javi mi kada budeš testirao!** 🚀
