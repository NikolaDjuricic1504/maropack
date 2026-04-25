// NoviNalogIzBaze.jsx - PLACEHOLDER
// Treba da puni podatke iz izabranog proizvoda iz baze

import { useState } from "react";

export default function NoviNalogIzBaze({ user, db, msg, setPage, inp, card, lbl }) {
  return (
    <div style={card}>
      <h2>⚡ Novi nalog iz baze</h2>
      <p style={{color:"#64748b"}}>
        NAPOMENA: Ova komponenta treba da prima proizvod iz BazaProizvoda i puni nalog podacima.
        <br/>Uploaduj mi trenutnu verziju NoviNalogIzBaze.jsx da je popravim.
      </p>
      <button 
        onClick={() => setPage("baza")} 
        style={{padding:"10px 20px",borderRadius:8,border:"none",background:"#1d4ed8",color:"#fff",fontWeight:700,cursor:"pointer"}}
      >
        ← Nazad na bazu
      </button>
    </div>
  );
}
