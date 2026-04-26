// api/gemini.js - Vercel serverless funkcija za Gemini API
// API ključ se čuva u Vercel Environment Variables kao GEMINI_API_KEY

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Koristi POST." });
  }

  try {
    const { modul = "opsti", poruka = "", podaci = {} } = req.body || {};

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Nedostaje GEMINI_API_KEY u Vercel Environment Variables."
      });
    }

    if (!poruka || !String(poruka).trim()) {
      return res.status(400).json({ error: "Poruka je prazna." });
    }

    const systemPrompt = `
Ti si AI asistent za Maropack aplikaciju za fleksibilnu ambalazu.
Radiš za module: magacin, kalkulacije, ponude, radni_nalozi, secenje, opsti.
Odgovaraj na srpskom jeziku, jasno i poslovno.

VAŽNO:
- Ne izmišljaj cene ako korisnik nije dao dovoljno podataka.
- Ako fale podaci, napiši šta fali.
- Za kalkulacije koristi logiku: materijal, debljina, širina, metraža, kg, marža, škart.
- Za magacin nikad ne potvrđuj automatsko skidanje/dodavanje stanja bez korisničke potvrde.
- Za ponude predloži tekst ponude i strukturisane podatke.
- Za radne naloge predloži šta ide na štampu, kasiranje, rezanje, perforaciju i materijal.

Vrati odgovor u ovom obliku:
1) KRATAK ODGOVOR
2) PREDLOG AKCIJE
3) JSON_PREDLOG u code bloku
`;

    const prompt = `${systemPrompt}\n\nMODUL: ${modul}\n\nPORUKA KORISNIKA:\n${poruka}\n\nPODACI IZ APLIKACIJE:\n${JSON.stringify(podaci || {}, null, 2)}`;

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.9,
          maxOutputTokens: 1800
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Gemini API greška.",
        raw: data
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || "")
        .join("\n")
        .trim() || "";

    return res.status(200).json({
      ok: true,
      modul,
      model,
      text,
      raw: data
    });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || "Server error u api/gemini.js"
    });
  }
}
