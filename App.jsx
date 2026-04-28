export function parseUpit(text) {
  const safeText = text || "";
  const lower = safeText.toLowerCase();

  const sirinaMatch = safeText.match(/(\d{2,4})\s?(mm|milimetara)/i);
  const dimMatch = safeText.match(/(\d{2,4})\s?[x×]\s?(\d{2,4})/i);
  const kgMatch = safeText.match(/(\d+(?:[.,]\d+)?)\s?kg/i);
  const komMatch = safeText.match(/(\d+(?:[.,]\d+)?)\s?(kom|komada|pcs)/i);
  const m2Match = safeText.match(/(\d+(?:[.,]\d+)?)\s?(m2|m²)/i);

  let materijal = "NEPOZNATO";
  if (lower.includes("triplex")) materijal = "TRIPLEX";
  else if (lower.includes("duplex")) materijal = "DUPLEX";
  else if (lower.includes("bopp")) materijal = "BOPP";
  else if (lower.includes("cpp")) materijal = "CPP";
  else if (lower.includes("pet")) materijal = "PET";
  else if (lower.includes("papir") || lower.includes("paper")) materijal = "PAPIR";
  else if (lower.includes("alu") || lower.includes("alumin")) materijal = "ALU";
  else if (lower.includes("pe")) materijal = "PE";

  let tip = "FOLIJA";
  if (lower.includes("kesa") || lower.includes("kese")) tip = "KESA";
  if (lower.includes("spulna") || lower.includes("špulna")) tip = "ŠPULNA";

  return {
    kupac: "",
    tip,
    materijal,
    sirina: sirinaMatch ? Number(sirinaMatch[1].replace(",", ".")) : "",
    dimenzijaSirina: dimMatch ? Number(dimMatch[1]) : "",
    dimenzijaVisina: dimMatch ? Number(dimMatch[2]) : "",
    kolicinaKg: kgMatch ? Number(kgMatch[1].replace(",", ".")) : "",
    kolicinaKom: komMatch ? Number(komMatch[1].replace(",", ".")) : "",
    kolicinaM2: m2Match ? Number(m2Match[1].replace(",", ".")) : "",
    stampa: lower.includes("stampa") || lower.includes("štampa") || lower.includes("print"),
    perforacija: lower.includes("perforacija") || lower.includes("perforirano"),
    napomena: safeText
  };
}
