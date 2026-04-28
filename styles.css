const STORAGE_KEY = "maropack_stanje_magacina";

export function ucitajStanje() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function sacuvajStanje(stanje) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stanje));
}

export function dodajNaStanje(stavke) {
  const trenutno = ucitajStanje();

  const noveStavke = stavke.map(s => ({
    ...s,
    datumPrijema: new Date().toISOString(),
    izvor: "AI packing lista"
  }));

  const novoStanje = [...noveStavke, ...trenutno];
  sacuvajStanje(novoStanje);
  return novoStanje;
}
