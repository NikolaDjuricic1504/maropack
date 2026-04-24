import { useState } from "react";

export default function AIsecenjePreview() {

  const [plan,setPlan] = useState(false);

  return (
    <div style={{padding:20}}>

      <h2 style={{fontWeight:800}}>🧠 Optimizacija sečenja</h2>

      <button
        onClick={()=>setPlan(true)}
        style={{
          padding:10,
          borderRadius:8,
          background:"#7c3aed",
          color:"#fff",
          border:"none",
          fontWeight:700,
          marginTop:10
        }}
      >
        Pokreni optimizaciju
      </button>

      {plan && (
        <div style={{marginTop:20}}>

          <div style={{background:"#ecfdf5",padding:15,borderRadius:10}}>
            <b>Najbolji plan</b><br/>
            Otpad: 40mm
          </div>

          <div style={{marginTop:10}}>
            Rola 1440mm → 500 + 500 + 400
          </div>

          <div style={{
            display:"flex",
            marginTop:10,
            height:40
          }}>
            <div style={{background:"#60a5fa",flex:5}}>500</div>
            <div style={{background:"#60a5fa",flex:5}}>500</div>
            <div style={{background:"#60a5fa",flex:4}}>400</div>
            <div style={{background:"#f87171",flex:1}}>40</div>
          </div>

        </div>
      )}

    </div>
  );
}
