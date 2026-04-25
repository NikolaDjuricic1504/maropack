export function parsePackingLista(text) {
  const lines = (text || "")
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const stavke = [];

  for (const line of lines) {
    const lower = line.toLowerCase();

    const materijal =
      lower.includes("bopp") ? "BOPP" :
      lower.includes("cpp") ? "CPP" :
      lower.includes("pet") ? "PET" :
      lower.includes("papir") || lower.includes("paper") ? "PAPIR" :
      lower.includes("alu") || lower.includes("aluminium") ? "ALU" :
      lower.includes("pe") ? "PE" :
      "NEPOZNATO";

    const sirinaMatch = line.match(/(\d{3,4})\s?(mm|x)/i);
    const kgMatch = line.match(/(\d+(?:[.,]\d+)?)\s?(kg|kgs)/i);
    const rolaMatch = line.match(/(\d+)\s?(rola|role|roll|rolls|pcs|kom)/i);
    const duzinaMatch = line.match(/(\d+(?:[.,]\d+)?)\s?(m|meter|metara)/i);
    const lotMatch = line.match(/(?:lot|batch|šarža|sarza)[:\s-]*([A-Z0-9\-\/]+)/i);

    if (materijal !== "NEPOZNATO" || kgMatch || sirinaMatch) {
      stavke.push({
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
        original: line,
        materijal,
        sirina: sirinaMatch ? Number(sirinaMatch[1].replace(",", ".")) : "",
        kg: kgMatch ? Number(kgMatch[1].replace(",", ".")) : "",
        brojRola: rolaMatch ? Number(rolaMatch[1]) : 1,
        duzina: duzinaMatch ? Number(duzinaMatch[1].replace(",", ".")) : "",
        lot: lotMatch ? lotMatch[1] : "",
        dobavljac: "",
        potvrdi: true
      });
    }
  }

  return stavke;
}
