// aiClient.js - zajednički AI klijent za celu React aplikaciju
// Koristi ga iz bilo kog modula: kalkulacije, magacin, ponude, radni nalozi...

export async function pitajGemini({ modul = "opsti", poruka = "", podaci = {} }) {
  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ modul, poruka, podaci })
  });

  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error("Server nije vratio JSON odgovor.");
  }

  if (!response.ok) {
    throw new Error(data?.error || "Greška pri pozivu Gemini API-ja.");
  }

  return data;
}
