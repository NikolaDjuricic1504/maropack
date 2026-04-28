# 📊 DASHBOARD SA GRAFIKONIMA - BESPLATNA VERZIJA

## ✨ **ŠTA JE NOVO:**

### **📈 GRAFIKONI (Recharts biblioteka):**
1. ✅ **Bar grafikon** - Stanje po širinama (rolni + metara)
2. ✅ **Pie grafikon** - Vrednost po tipu materijala
3. ✅ **Horizontalni bar** - Kg po tipu materijala

### **💰 VREDNOST MAGACINA:**
- Ukupna vrednost sa cenama po tipu
- Prosečna cena €/kg
- Breakdown po materijalu

### **⚡ REAL-TIME INDIKATORI:**
- Otvoreni nalozi (live count)
- Nalozi koji kasne >7 dana (alert)
- Osvežavanje na klik

---

## 🎨 **KAKO IZGLEDA:**

```
┌─────────────────────────────────────────────────┐
│ 📊 Dashboard                        🔄 Osveži   │
│ Pregled magacina i radnih naloga               │
└─────────────────────────────────────────────────┘

┌──────────┬──────────┬──────────┬──────────┐
│ UKUPNO   │ UKUPNO   │ UKUPNO   │ VREDNOST │
│ ROLNI    │ METARA   │ KG       │          │
│   87     │ 1.245.000│ 24.890   │ 69.692 € │
└──────────┴──────────┴──────────┴──────────┘

┌──────────────┬──────────────┐
│ OTVORENI     │ ⚠️ KASNE     │
│ NALOZI       │ (>7 DANA)    │
│    47        │    12        │
└──────────────┴──────────────┘

┌─────────────────────────────────────────────────┐
│ 📏 Stanje po širinama                          │
│                                                 │
│  [BAR GRAFIKON: 1560mm, 740mm, 1650mm...]      │
│                                                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 💰 Vrednost po tipu materijala                  │
│                                                 │
│  [PIE GRAFIKON: BOPP 35%, FXC 28%, CPP 15%...]│
│                                                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ⚖️ Kg po tipu materijala                        │
│                                                 │
│  [HORIZONTAL BAR: BOPP, FXC, CPP, PET...]      │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🚀 **INSTALACIJA:**

```bash
# 1. Raspakuj
unzip maropack-DASHBOARD.zip
cd maropack-minimal-fix

# 2. Instaliraj (uključuje Recharts)
npm install

# 3. Deploy
git add .
git commit -m "Dashboard sa grafikonima + AI Asistent MEGA"
git push
```

---

## 📋 **ŠTA JE UKLJUČENO:**

1. ✅ **Dashboard.jsx** - Nova komponenta sa grafikonima
2. ✅ **Recharts ^2.12.7** u package.json
3. ✅ **AIpanel-MEGA.jsx** - 20+ komandi
4. ✅ **PackingListParser.jsx** - Rossella parser
5. ✅ **Magacin.jsx** - QR debug
6. ✅ **lucide-react** fix

---

## 💰 **CENE PO TIPU (za vrednost magacina):**

```javascript
BOPP:     2.6 €/kg
OPP:      2.6 €/kg
CPP:      2.7 €/kg
PET:      3.1 €/kg
LDPE:     2.4 €/kg
ALU:      8.5 €/kg
PAPIR:    1.9 €/kg
PA:       4.2 €/kg
FXC:      2.8 €/kg
FXPU:     2.9 €/kg
NATIVIA:  3.0 €/kg
CC White: 2.2 €/kg
```

**Možeš ih promeniti u Dashboard.jsx linija ~25!**

---

## 🎯 **KAKO RADI:**

### **1. Učitavanje podataka:**
```javascript
// MAGACIN
SELECT * FROM magacin WHERE status != 'Iskorišćeno'

// NALOZI
SELECT * FROM nalozi ORDER BY created_at DESC LIMIT 200
```

### **2. Računanje statistike:**
```javascript
// Po širini
poSirini = {
  "1560mm": {rolni: 28, metara: 784000, kg: 17105},
  "740mm":  {rolni: 1,  metara: 13900,  kg: 777},
  ...
}

// Vrednost
vrednost = kg_neto * cena_po_tipu
```

### **3. Renderovanje grafikona:**
```javascript
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={stats.poSirini}>
    <Bar dataKey="metara" fill="#3b82f6" />
    <Bar dataKey="rolni" fill="#10b981" />
  </BarChart>
</ResponsiveContainer>
```

---

## ⚡ **OSVEŽIVANJE:**

Trenutno: **Ručno** (dugme "🔄 Osveži")

**SLEDEĆA FAZA (opciono):**
- Auto-refresh svake minute
- Supabase Realtime (live updates)
- Push notifikacije

---

## 🎨 **CUSTOMIZACIJA:**

### **Promeni boje:**
```javascript
// U Dashboard.jsx, linija ~82
var COLORS = [
  "#3b82f6",  // Plava
  "#10b981",  // Zelena
  "#f59e0b",  // Narandžasta
  "#ef4444",  // Crvena
  ...
];
```

### **Promeni cene:**
```javascript
// U Dashboard.jsx, linija ~25
var CENE = {
  "BOPP": 2.8,  // Tvoja cena
  "FXC": 3.0,   // Tvoja cena
  ...
};
```

---

## 📸 **TESTIRANJE:**

1. Deploy
2. Otvori "📊 Dashboard" u meniju
3. Pogledaj grafikone
4. Klikni "🔄 Osveži" da vidiš najnovije podatke

---

## 💡 **NAPOMENA:**

- ✅ **100% BESPLATNO** - Recharts je open-source!
- ✅ **Bez API troškova**
- ✅ **Bez external servisa**
- ✅ **Radi offline** (nakon učitavanja)

---

## 🚀 **SLEDEĆI KORACI:**

Mogu još dodati:

1. **Auto-refresh** (svake minute)
2. **Export u Excel** (svi grafici + podaci)
3. **PDF izveštaji** (mesečni/godišnji)
4. **Trend analiza** (kako se magacin menja)
5. **Predviđanje** (kada će nestati BOPP 1000mm)

**Javi mi šta želiš!** 🎉
