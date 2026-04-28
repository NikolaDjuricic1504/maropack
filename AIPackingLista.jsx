export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { modul, poruka, podaci } = req.body || {};

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Nedostaje GEMINI_API_KEY u Vercel Environment Variables"
      });
    }

    const prompt = `
Ti si AI asistent za Maropack proizvodnju.

Modul: ${modul}

Zadatak:
- Daj konkretan, praktičan odgovor
- Ako možeš, predloži materijal, širinu, proces
- Ako je ponuda, napiši predlog ponude
- Ako je magacin, izvuci podatke
- Ako je radni nalog, predloži strukturu

Korisnikov zahtev:
${poruka}

Dodatni podaci:
${JSON.stringify(podaci || {}, null, 2)}

Odgovori jasno i konkretno na srpskom jeziku.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1200
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Gemini API greška",
        raw: data
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map(p => p.text || "")
        .join("\n") || "Nema odgovora od Gemini";

    return res.status(200).json({
      text,
      model: "gemini-flash-latest"
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message || "Server error"
    });
  }
}
