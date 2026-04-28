MAROPACK - VERZIJA BEZ LOKALNOG SERVERA

Šta je izmenjeno:
- Dodata stranica "AI asistent" u meni.
- Dodata stranica "Sečenje" u meni.
- Optimizacija sečenja radi direktno u React aplikaciji, bez Python/FastAPI servera.
- AI asistent čita Supabase tabele magacin i nalozi.

Kako ubacuješ:
1. Raspakuj ZIP.
2. Sve fajlove uploaduj na GitHub preko postojećeg projekta.
3. Vercel će sam uraditi build/deploy.

Ne moraš da pokrećeš:
- optimizer_backend
- pip install
- uvicorn

Napomena:
Ovo je browser optimizer. Za napredni MILP/PuLP optimizer kasnije možemo prebaciti na cloud backend.
