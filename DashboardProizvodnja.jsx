import React, { useState } from "react";
import { parseUpit } from "./aiParser.js";
import { izracunajCenu } from "./excelKalkulacija.js";

export default function AIponuda() {
  const [text, setText] = useState("");
  const [data, setData] = useState(null);
  const [cena, setCena] = useState(null);
  const [nalog, setNalog] = useState(null);

  const analiziraj = () => {
    setData(parseUpit(text));
    setCena(null);
    setNalog(null);
  };

  const izracunaj = () => {
    setCena(izracunajCenu(data));
  };

  const napraviNalog = () => {
    setNalog({
      brojNaloga: "RN-" + new Date().getTime().toString().slice(-6),
      kupac: data.kupac || "Kupac iz upita",
      tip: data.tip,
      materijal: data.materijal,
      sirina: data.sirina || data.dimenzijaSirina,
      kolicinaKg: cena?.kg?.toFixed(2),
      kolicinaM2: cena?.m2?.toFixed(2),
      operacije: [
        data.stampa ? "Štampa" : null,
        data.materijal === "DUPLEX" || data.materijal === "TRIPLEX" ? "Kasiranje" : null,
        "Rezanje",
        data.perforacija ? "Perforacija" : null
      ].filter(Boolean)
    });
  };

  return (
    <div className="card">
      <h2>AI ponuda iz upita kupca</h2>
      <p>Nalepi mejl kupca. Sistem izvlači podatke, računa cenu i pravi osnovni radni nalog.</p>

      <div className="field">
        <label>Upit kupca</label>
        <textarea
          rows="7"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Primer: Treba mi triplex za kafu, širina 840 mm, količina 2000 kg, sa štampom."
        />
      </div>

      <button className="primary" onClick={analiziraj}>AI analiziraj</button>

      {data && (
        <div className="card">
          <h3>Prepoznati podaci</h3>
          <div className="grid">
            <div className="field"><label>Tip</label><input value={data.tip} onChange={e => setData({...data, tip:e.target.value})} /></div>
            <div className="field"><label>Materijal</label><input value={data.materijal} onChange={e => setData({...data, materijal:e.target.value})} /></div>
            <div className="field"><label>Širina mm</label><input value={data.sirina} onChange={e => setData({...data, sirina:e.target.value})} /></div>
            <div className="field"><label>Količina kg</label><input value={data.kolicinaKg} onChange={e => setData({...data, kolicinaKg:e.target.value})} /></div>
            <div className="field"><label>Količina kom</label><input value={data.kolicinaKom} onChange={e => setData({...data, kolicinaKom:e.target.value})} /></div>
            <div className="field"><label>Količina m²</label><input value={data.kolicinaM2} onChange={e => setData({...data, kolicinaM2:e.target.value})} /></div>
          </div>

          <p>Štampa: <b>{data.stampa ? "DA" : "NE"}</b> | Perforacija: <b>{data.perforacija ? "DA" : "NE"}</b></p>
          <button className="primary" onClick={izracunaj}>Izračunaj ponudu</button>
        </div>
      )}

      {cena && (
        <div className="card">
          <h3>Predlog ponude</h3>
          <table>
            <tbody>
              <tr><td>Materijal</td><td>{data.materijal}</td></tr>
              <tr><td>m²</td><td>{cena.m2.toFixed(2)}</td></tr>
              <tr><td>kg</td><td>{cena.kg.toFixed(2)}</td></tr>
              <tr><td>Cena materijala</td><td>{cena.materijal.toFixed(2)} €</td></tr>
              <tr><td>Proizvodnja</td><td>{cena.proizvodnja.toFixed(2)} €</td></tr>
              <tr><td>Štampa</td><td>{cena.stampa.toFixed(2)} €</td></tr>
              <tr><td>Perforacija</td><td>{cena.perforacija.toFixed(2)} €</td></tr>
              <tr><th>Ukupno</th><th>{cena.ukupno.toFixed(2)} €</th></tr>
              <tr><th>Cena/kg</th><th>{cena.cenaKgUkupno.toFixed(2)} €</th></tr>
            </tbody>
          </table>

          <br />
          <button className="primary" onClick={napraviNalog}>Napravi radni nalog iz ponude</button>
        </div>
      )}

      {nalog && (
        <div className="card">
          <h3>Automatski radni nalog</h3>
          <div className="preview">{JSON.stringify(nalog, null, 2)}</div>
        </div>
      )}
    </div>
  );
}
