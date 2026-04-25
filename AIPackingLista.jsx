import React, { useMemo, useState } from "react";
import { parsePackingLista } from "./packingParser.js";
import { dodajNaStanje, ucitajStanje } from "./stanjeMagacina.js";

export default function AIPackingLista() {
  const [tekst, setTekst] = useState("");
  const [stavke, setStavke] = useState([]);
  const [stanje, setStanje] = useState(() => ucitajStanje());
  const [poruka, setPoruka] = useState("");

  const ukupnoKg = useMemo(
    () => stavke.filter(s => s.potvrdi).reduce((sum, s) => sum + Number(s.kg || 0), 0),
    [stavke]
  );

  const analiziraj = () => {
    const parsed = parsePackingLista(tekst);
    setStavke(parsed);
    setPoruka(parsed.length ? "AI je pronašao stavke. Proveri i potvrdi." : "Nisu pronađene stavke. Nalepi jasniji tekst packing liste.");
  };

  const update = (id, field, value) => {
    setStavke(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const potvrdiPrijem = () => {
    const zaUnos = stavke.filter(s => s.potvrdi);
    if (!zaUnos.length) {
      setPoruka("Nema označenih stavki za unos.");
      return;
    }
    const novoStanje = dodajNaStanje(zaUnos);
    setStanje(novoStanje);
    setPoruka(`Potvrđeno i dodato na stanje: ${zaUnos.length} stavki.`);
    setStavke([]);
    setTekst("");
  };

  return (
    <div className="card">
      <h2>AI prijem robe iz packing liste</h2>
      <p>
        Nalepi tekst iz packing liste. AI će izvući materijal, širinu, kg, broj rola,
        dužinu i lot. Ništa se ne dodaje na stanje dok ti ne klikneš potvrdu.
      </p>

      <div className="field">
        <label>Packing lista / tekst dobavljača</label>
        <textarea
          rows="9"
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          placeholder={"Primer:\nBOPP 20 mic 540 mm 125.5 kg 2 rolls LOT A123\nPAPER 60g 840 mm 920 kg 1 roll LOT P-55"}
        />
      </div>

      <button className="primary" onClick={analiziraj}>AI pročitaj packing listu</button>

      {poruka && <p><b>{poruka}</b></p>}

      {stavke.length > 0 && (
        <div className="card">
          <h3>Provera pre unosa na stanje</h3>
          <p>Označeno ukupno: <b>{ukupnoKg.toFixed(2)} kg</b></p>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Potvrdi</th>
                  <th>Materijal</th>
                  <th>Širina mm</th>
                  <th>kg</th>
                  <th>Broj rola</th>
                  <th>Dužina m</th>
                  <th>Lot</th>
                  <th>Dobavljač</th>
                </tr>
              </thead>
              <tbody>
                {stavke.map(s => (
                  <tr key={s.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={s.potvrdi}
                        onChange={e => update(s.id, "potvrdi", e.target.checked)}
                      />
                    </td>
                    <td><input value={s.materijal} onChange={e => update(s.id, "materijal", e.target.value)} /></td>
                    <td><input value={s.sirina} onChange={e => update(s.id, "sirina", e.target.value)} /></td>
                    <td><input value={s.kg} onChange={e => update(s.id, "kg", e.target.value)} /></td>
                    <td><input value={s.brojRola} onChange={e => update(s.id, "brojRola", e.target.value)} /></td>
                    <td><input value={s.duzina} onChange={e => update(s.id, "duzina", e.target.value)} /></td>
                    <td><input value={s.lot} onChange={e => update(s.id, "lot", e.target.value)} /></td>
                    <td><input value={s.dobavljac} onChange={e => update(s.id, "dobavljac", e.target.value)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <br />
          <button className="primary" onClick={potvrdiPrijem}>
            Potvrdi i dodaj na stanje
          </button>
        </div>
      )}

      <div className="card">
        <h3>Trenutno stanje iz aplikacije</h3>
        {stanje.length === 0 ? (
          <p>Nema unetih stavki.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Materijal</th>
                  <th>Širina</th>
                  <th>kg</th>
                  <th>Rola</th>
                  <th>Lot</th>
                  <th>Dobavljač</th>
                </tr>
              </thead>
              <tbody>
                {stanje.map((s, i) => (
                  <tr key={i}>
                    <td>{new Date(s.datumPrijema).toLocaleDateString("sr-RS")}</td>
                    <td>{s.materijal}</td>
                    <td>{s.sirina}</td>
                    <td>{s.kg}</td>
                    <td>{s.brojRola}</td>
                    <td>{s.lot}</td>
                    <td>{s.dobavljac}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
