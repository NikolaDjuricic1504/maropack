MAROPACK FULL GITHUB PAKET

1) Raspakuj ZIP.
2) Uploaduj sve fajlove na novi GitHub repo.
3) Na Vercel-u importuj repo i klikni Deploy.
4) Ako koristiš Supabase, napravi .env fajl po .env.example i u Supabase SQL Editor pokreni supabase/schema.sql.

Ovaj paket uključuje BEZ Outlook/AI povezivanja:
- Dashboard
- Kalkulator
- Magacin sa rezervacijom materijala
- Nalozi sa statusima
- Plan proizvodnje po mašinama
- QR praćenje naloga
- Mobile ekran za radnika
- Otpad i profit po nalogu
- Baza proizvoda/template
- Export CSV

Ako deploy pukne:
- proveri da postoji src/App.jsx
- proveri da main.jsx importuje ./App.jsx
- pokreni npm install pa npm run build
