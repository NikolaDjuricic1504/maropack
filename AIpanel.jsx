import { useState } from "react";

export default function AIpanel() {
  const [pitanje,setPitanje] = useState("");
  const [odgovor,setOdgovor] = useState("");

  async function pitajAI() {
    if(!pitanje) return;
    setOdgovor("Razmišljam...");
    setTimeout(function(){
      var q = pitanje.toLowerCase();
      if(q.includes("bopp")) setOdgovor("Primer odgovora: pronađi BOPP rolne u Magacinu, filtriraj širinu i vidi dostupnu metražu/kg. Sledeći korak je povezivanje sa Supabase bazom da odgovor bude stvaran.");
      else if(q.includes("nalog")) setOdgovor("Primer odgovora: mogu da pomognem da pronađeš nalog, status i povezane rolne. Trenutno je ovo demo panel bez poziva ka bazi.");
      else setOdgovor("AI panel je dodat u sistem. Ovo je bezbedan preview — sledeće se povezuje sa Supabase i tvojim Python optimizerom.");
    },700);
  }

  return (
    <div style={{background:"#fff",borderRadius:12,padding:16,border:"1px solid #e2e8f0",marginBottom:14,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
        <div style={{width:34,height:34,borderRadius:10,background:"#eff6ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🤖</div>
        <div>
          <div style={{fontSize:15,fontWeight:800,color:"#0f172a"}}>AI asistent u sistemu</div>
          <div style={{fontSize:12,color:"#64748b"}}>Preview panel — zadržava tvoj dizajn i ne dira postojeće funkcije.</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8}}>
        <input
          placeholder="Pitaj npr: Koliko imam BOPP 1000mm?"
          value={pitanje}
          onChange={function(e){setPitanje(e.target.value);}}
          onKeyDown={function(e){if(e.key==="Enter")pitajAI();}}
          style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13,background:"#f8fafc",outline:"none",boxSizing:"border-box"}}
        />
        <button onClick={pitajAI} style={{padding:"10px 16px",borderRadius:8,border:"none",background:"#1d4ed8",color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer"}}>Pitaj AI</button>
      </div>
      {odgovor && <div style={{marginTop:10,fontSize:13,background:"#f8fafc",padding:12,borderRadius:8,border:"1px solid #e2e8f0",color:"#334155",whiteSpace:"pre-wrap"}}>{odgovor}</div>}
    </div>
  );
}
