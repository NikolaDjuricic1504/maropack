import { useState } from "react";
import { supabase } from "./supabase.js";
import { acceptPlan } from "./lib/acceptPlan.js";

export default function AIsecenjeOptimizer() {

  const [loadingId,setLoadingId] = useState(null);

  const rezultati = [
    {
      rola:{id:1, broj:"R-TEST", lokacija:"A1", lot:"L1", metraza:10000},
      plan:{rezovi:[500,500,400], otpad:40, ukupno_uzeto_m:3000}
    }
  ];

  async function onAccept(item){
    try{
      setLoadingId(item.rola.id);
      await acceptPlan(supabase,item.rola,item.plan);
      alert("Plan prihvacen!");
    }catch(e){
      console.log(e);
      alert("Greska");
    }finally{
      setLoadingId(null);
    }
  }

  return (
    <div style={{padding:20}}>
      {rezultati.map((item,i)=>(
        <div key={i} style={{marginBottom:20}}>
          <div>Plan: {item.plan.rezovi.join(" + ")}</div>
          <button onClick={()=>onAccept(item)}>
            {loadingId===item.rola.id ? "..." : "✅ Prihvati plan"}
          </button>
        </div>
      ))}
    </div>
  );
}
