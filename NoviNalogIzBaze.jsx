// NalogKesaView.jsx - PLACEHOLDER
// Radni nalog za kese - treba proveriti da li ima kesičarenje tab

import { useState } from "react";

export default function NalogKesaView({ nalog, onClose, msg }) {
  const [tab, setTab] = useState("mat");
  
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",zIndex:9999,display:"flex",flexDirection:"column"}}>
      <div style={{background:"#0f172a",padding:"10px 16px",display:"flex",alignItems:"center",gap:10,color:"#fff"}}>
        <button onClick={onClose} style={{padding:"7px 14px",borderRadius:7,border:"none",background:"#334155",color:"#fff",cursor:"pointer",fontWeight:700}}>
          ← Nazad
        </button>
        <div style={{fontWeight:800, flex:1}}>
          🛍️ Nalog za kese: {nalog?.ponBr || "—"}
        </div>
      </div>
      
      <div style={{flex:1,overflow:"auto",background:"#f1f5f9",padding:20}}>
        <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:18}}>
          <h2 style={{marginTop:0}}>🛍️ Nalog za kese</h2>
          <p style={{color:"#64748b"}}>
            NAPOMENA: Uploaduj mi trenutnu verziju NalogKesaView.jsx da proverim strukturu.
            <br/>Treba da ima 2 taba: Materijal + Rezanje (bez kesičarenja).
          </p>
        </div>
      </div>
    </div>
  );
}
