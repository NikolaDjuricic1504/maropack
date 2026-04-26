# 📦 FAZA 1: BAZA PROIZVODA - Uputstvo za instalaciju

## 🎯 ŠTA DOBIJAS:
- ✅ Jedinstvena tabela za sve proizvode (folija, kese, špulne)
- ✅ Komponenta za pregled i upravljanje proizvodima
- ✅ Filter po tipu i pretraga
- ✅ Akcije: Kreiraj nalog, Izmeni, Arhiviraj

---

## 📋 KORAK 1: KREIRANJE TABELE U SUPABASE

### 1.1 Otvori Supabase Dashboard
```
https://supabase.com/dashboard
```

### 1.2 Izaberi svoj projekat
- Klikni na svoj Maropack projekat
- URL: https://xmlnvxzdytuybguirjgz.supabase.co

### 1.3 Otvori SQL Editor
- Sidebar: **SQL Editor**
- Klikni: **New Query**

### 1.4 Kopiraj i nalepi SQL
- Otvori fajl: `supabase-proizvodi.sql`
- Kopiraj SVE
- Nalepi u SQL Editor
- Klikni: **RUN** (ili Ctrl+Enter)

### 1.5 Proveri da li je tabela kreirana
```sql
SELECT * FROM proizvodi LIMIT 5;
```
Ako vidiš praznu tabelu - **USPEH!** ✅

---

## 📋 KORAK 2: DODAVANJE KOMPONENTE U APLIKACIJU

### 2.1 Dodaj BazaProizvoda.jsx u /src folder
- Kopiraj fajl `BazaProizvoda.jsx`
- Nalepi u: `/src/BazaProizvoda.jsx`

### 2.2 Dodaj u App.jsx

Otvori `/src/App.jsx` i dodaj:

**Na početku fajla (sa ostalim importima):**
```javascript
import BazaProizvoda from "./BazaProizvoda.jsx";
```

**U meniju (sidebar - dodaj POSLE "Nalog iz baze"):**
```javascript
{tab === "baza" && (
  <div
    onClick={() => setTab("baza")}
    style={{
      padding: "10px 14px",
      background: tab === "baza" ? "#3b82f6" : "transparent",
      color: tab === "baza" ? "#fff" : "#94a3b8",
      borderRadius: 7,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontWeight: 700,
      fontSize: 13,
    }}
  >
    📦 Baza proizvoda
  </div>
)}
```

**U glavnom delu (dodaj POSLE "Nalog iz baze" case-a):**
```javascript
{tab === "baza" && (
  <BazaProizvoda card={card} inp={inp} lbl={lbl} msg={msg} />
)}
```

---

## 📋 KORAK 3: DEPLOY NA VERCEL

### 3.1 Git commit
```bash
git add .
git commit -m "Faza 1: Baza proizvoda - tabela + komponenta"
git push
```

### 3.2 Čekaj Vercel build
- Otvori: https://vercel.com/dashboard
- Čekaj 2-3 minuta
- Proveri: https://maropack-kxnm.vercel.app

---

## 🧪 KORAK 4: TESTIRANJE

### 4.1 Otvori aplikaciju
```
https://maropack-kxnm.vercel.app
```

### 4.2 Klikni "📦 Baza proizvoda" u meniju

### 4.3 Vidi:
- ✅ Prazan ekran (još nema proizvoda)
- ✅ Filter buttone: Svi, Folija, Kesa, Špulna
- ✅ Search polje
- ✅ Dugme "🔄 Osveži"

### 4.4 Test dodavanje proizvoda (ručno u Supabase)

Idi u Supabase > Table Editor > proizvodi > Insert row:

**Test proizvod - KESA:**
```
tip: kesa
naziv: Kesa za hleb 200x300mm
kupac: Maropack
kesa_materijal: BOPP 20
kesa_sirina: 200
kesa_duzina: 300
kesa_klapna: 40
kesa_takt: 100
kesa_ban: 1
status: Aktivan
```

Klikni **Save**.

### 4.5 Proveri u aplikaciji
- Klikni "🔄 Osveži"
- Vidi kartu sa proizvodom! ✅

---

## 🎉 GOTOVO - FAZA 1!

Sada imaš:
- ✅ Tabelu `proizvodi` u Supabase
- ✅ Komponentu za pregled proizvoda
- ✅ Filter i search funkcionalnost

---

## 📸 SCREENSHOT POSLE DEPLOYA

Očekuješ da vidiš:

```
┌─────────────────────────────────────────┐
│ 📦 Baza Proizvoda                       │
│ Ukupno: 1 | Folija: 0 | Kese: 1        │
└─────────────────────────────────────────┘

[Svi] [Folija] [Kesa] [Špulna]
[Search.....................] [🔄 Osveži]

┌─────────────────────────────────────────┐
│ 🛍️ Kesa za hleb 200x300mm              │
│ Kupac: Maropack · SKU: - · Kreiran: .. │
│ Materijal: BOPP 20 · Dim: 200x300mm    │
│ [⚡ Kreiraj Nalog] [✏️ Izmeni] [🗑️]     │
└─────────────────────────────────────────┘
```

---

## 🚀 SLEDEĆA FAZA:

**Opcija A:** Dodaj "Sačuvaj" dugme u kalkulatore  
**Opcija B:** Upgrade NoviNalogIzBaze.jsx sa dropdown-om  
**Opcija C:** Kreiraj novi kompletan nalog

**Koju fazu želiš sledeću?** 🤔
