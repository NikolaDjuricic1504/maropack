
import { useState } from "react";
import { supabase } from "./supabase"; // prilagodi putanju ako je drugacije

export default function AIsecenjePreview() {
  const [plan,setPlan] = useState(false);
  const [loading,setLoading] = useState(false);

  // DEMO rola + plan (mozes zameniti realnim podacima)
  const rola = {
    id: 1, // ID u bazi
    broj:"R-2026-61852/9",
    lokacija:"A5",
    materijal:"CC White 60g",
    sirina:1440,
    metraza:11151,
    lot:"U26/00065",
    status: "Dostupno"
  };

  const planData = {
    rezovi: [500,500,400],
    otpad: 40,
    ukupno_uzeto_m: 3000 // koliko metara skidas (primer)
  };

  async function prihvatiPlan(){
    try{
      setLoading(true);

      // 1. upisi plan u bazu
      const { error: planErr } = await supabase
        .from("planovi_secenja")
        .insert([{
          rola_id: rola.id,
          broj_rolne: rola.broj,
          lokacija: rola.lokacija,
          lot: rola.lot,
          plan: planData.rezovi.join(" + "),
          otpad_mm: planData.otpad
        }]);

      if(planErr) throw planErr;

      // 2. smanji metrazu
      const novaMetraza = rola.metraza - planData.ukupno_uzeto_m;

      const { error: updErr } = await supabase
        .from("magacin")
        .update({
          metraza: novaMetraza,
          status: "Rezervisano"
        })
        .eq("id", rola.id);

      if(updErr) throw updErr;

      alert("Plan prihvacen i rola rezervisana!");

    }catch(e){
      console.error(e);
      alert("Greska prilikom upisa plana");
    }finally{
      setLoading(false);
    }
  }

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
            Otpad: {planData.otpad} mm
          </div>

          <div style={{marginTop:15,background:"#f8fafc",padding:15,borderRadius:10}}>
            <b>ROLA:</b> {rola.broj}<br/>
            <b>Lokacija:</b> {rola.lokacija}<br/>
            <b>Materijal:</b> {rola.materijal}<br/>
            <b>Širina:</b> {rola.sirina} mm<br/>
            <b>Metraža:</b> {rola.metraza} m<br/>
            <b>LOT:</b> {rola.lot}
          </div>

          <div style={{marginTop:10}}>
            Plan: {planData.rezovi.join(" + ")}
          </div>

          <button
            onClick={prihvatiPlan}
            disabled={loading}
            style={{
              marginTop:15,
              padding:12,
              borderRadius:8,
              background:"#16a34a",
              color:"#fff",
              border:"none",
              fontWeight:700,
              cursor:"pointer"
            }}
          >
            {loading ? "..." : "✅ Prihvati plan"}
          </button>

        </div>
      )}

    </div>
  );
}
