// NalogSpulnaView.jsx - PLACEHOLDER
// Radni nalog za špulne

import { useState } from "react";

export default function NalogSpulnaView({ nalog, onClose, msg }) {
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",zIndex:9999,display:"flex",flexDirection:"column"}}>
      <div style={{background:"#0f172a",padding:"10px 16px",display:"flex",alignItems:"center",gap:10,color:"#fff"}}>
        <button onClick={onClose} style={{padding:"7px 14px",borderRadius:7,border:"none",background:"#334155",color:"#fff",cursor:"pointer",fontWeight:700}}>
          ← Nazad
        </button>
        <div style={{fontWeight:800, flex:1}}>
          🔄 Nalog za špulne: {nalog?.ponBr || "—"}
        </div>
      </div>
      
      <div style={{flex:1,overflow:"auto",background:"#f1f5f9",padding:20}}>
        <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:18}}>
          <h2 style={{marginTop:0}}>🔄 Nalog za špulne</h2>
          <p style={{color:"#64748b"}}>
            NAPOMENA: Uploaduj mi trenutnu verziju NalogSpulnaView.jsx da je pogledam i doradim.
          </p>
        </div>
      </div>
    </div>
  );
}
