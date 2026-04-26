# MAROPACK - MINIMAL QR FIX

## ✅ ŠTA JE PROMENJENO:

### **SAMO 2 MINIMALNE IZMENE:**

1. **Magacin.jsx** (linija 251-264)
   - Dodato: `console.log("🔍 Tražim rolnu:", brRolne)`
   - Dodato: `console.log("📦 Rezultat:", r)`
   - **NIŠTA DRUGO NIJE PROMENJENO!**

2. **package.json**
   - Dodato: `"lucide-react": "^0.263.1"`
   - Potrebno za build na Vercel
   - **NIŠTA DRUGO NIJE PROMENJENO!**

---

## 🚀 INSTALACIJA:

```bash
# 1. Raspakuj
unzip maropack-minimal-fix.zip
cd maropack-minimal-fix

# 2. Instaliraj
npm install

# 3. Deploy
git add .
git commit -m "Minimal fix: QR debug + lucide-react"
git push
```

---

## 🔍 DEBUG QR PROBLEMA:

1. Deploy na Vercel
2. Otvori https://maropack-kxnm.vercel.app
3. **F12** → Console
4. Skeniraj QR kod
5. **Screenshot Console-a** i pošalji mi!

Trebalo bi da vidiš:
```
🔍 Tražim rolnu: R-2026-12345
📦 Rezultat: {data: ..., error: ...}
```

---

## 📋 SVE OSTALO JE IDENTIČNO TVOJOJ VERZIJI!

- ✅ App.jsx - ISTI
- ✅ AIpanel.jsx - ISTI
- ✅ AIsecenjeOptimizer.jsx - ISTI
- ✅ Svi ostali fajlovi - ISTI

**Samo debug za QR problem!**
