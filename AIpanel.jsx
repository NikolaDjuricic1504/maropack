import { useState } from "react";

export default function AIpanel() {
  const [pitanje,setPitanje] = useState("");
  const [odgovor,setOdgovor] = useState("");

  async function pitajAI() {
    if(!pitanje) return;

    setOdgovor("Razmišljam...");

    setTimeout(()=>{
      setOdgovor("Na stanju imaš približno 12,000 kg BOPP materijala širine oko 1000mm.");
    },1000);
  }

  return (
    <div style={{
      background:"#fff",
      borderRadius:12,
      padding:16,
      border:"1px solid #e2e8f0",
      marginTop:10
    }}>
      <h3 style={{fontSize:16,fontWeight:800}}>
        AI u sistemu — plan:
      </h3>

      <p style={{fontSize:13,color:"#64748b"}}>
        Pitaj AI o magacinu i nalozima
      </p>

      <input
        placeholder="Koliko imam BOPP 1000mm?"
        value={pitanje}
        onChange={(e)=>setPitanje(e.target.value)}
        style={{
          width:"100%",
          padding:8,
          borderRadius:6,
          border:"1px solid #e2e8f0",
          marginTop:8
        }}
      />

      <button
        onClick={pitajAI}
        style={{
          width:"100%",
          marginTop:8,
          padding:8,
          borderRadius:6,
          background:"#1d4ed8",
          color:"#fff",
          border:"none",
          fontWeight:700
        }}
      >
        🚀 Pitaj AI
      </button>

      {odgovor && (
        <div style={{
          marginTop:10,
          fontSize:13,
          background:"#f8fafc",
          padding:10,
          borderRadius:6
        }}>
          {odgovor}
        </div>
      )}
    </div>
  );
}
