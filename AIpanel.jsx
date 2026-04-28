import { useState } from "react";
import { supabase } from "./supabase.js";

function n(v){ return Number(v||0); }
function fmt(v, suf){ return n(v).toLocaleString("sr-RS", {maximumFractionDigits: 1}) + (suf||""); }

export default function AIpanel({card}) {
  const [pitanje,setPitanje] = useState("");
  const [odgovor,setOdgovor] = useState("");
  const [loading,setLoading] = useState(false);

  async function pitajAI() {
    var q = pitanje.trim();
    if(!q) return;
    setLoading(true);
    setOdgovor("Tražim u bazi...");
    try {
      var low = q.toLowerCase();

      if(low.includes("magacin") || low.includes("imam") || low.includes("stanje") || low.includes("roln")) {
        var r = await supabase.from("magacin").select("*").neq("status", "Iskorišćeno");
        if(r.error) throw r.error;
        var data = r.data || [];

        var materijal = "";
        var poznati = ["bopp", "cpp", "pet", "alu", "ldpe", "papir", "cc white", "fxc", "fxpu", "opp", "pa"];
        for(var i=0;i<poznati.length;i++) if(low.includes(poznati[i])) materijal = poznati[i];

        var sirMatch = q.match(/(\d{3,4})\s*mm?/i);
        var sir = sirMatch ? parseInt(sirMatch[1]) : null;

        var filtrirane = data.filter(function(x){
          var ok = true;
          if(materijal) ok = ok && String(x.tip||"").toLowerCase().includes(materijal);
          if(sir) ok = ok && Math.abs(n(x.sirina) - sir) <= 25;
          return ok;
        });

        var kg = filtrirane.reduce(function(s,x){return s+n(x.kg_neto||x.kg||0);},0);
        var m = filtrirane.reduce(function(s,x){return s+n(x.metraza_ost||x.metraza||0);},0);
        var tipovi = Array.from(new Set(filtrirane.map(function(x){return x.tip;}).filter(Boolean))).slice(0,6).join(", ");

        setOdgovor(
          "Nađeno: " + filtrirane.length + " rolni\n" +
          "Ukupno: " + fmt(m, " m") + "\n" +
          "Kg neto: " + fmt(kg, " kg") + "\n" +
          (tipovi ? "Tipovi: " + tipovi : "")
        );
      } else if(low.includes("nalog") || low.includes("kasni") || low.includes("završ")) {
        var rn = await supabase.from("nalozi").select("*").order("created_at", {ascending:false}).limit(200);
        if(rn.error) throw rn.error;
        var nd = rn.data || [];
        var otvoreni = nd.filter(function(x){return x.status !== "Završeno" && x.status !== "Zavrseno";}).length;
        var zav = nd.filter(function(x){return x.status === "Završeno" || x.status === "Zavrseno";}).length;
        setOdgovor("Radni nalozi u bazi: " + nd.length + "\nOtvoreni: " + otvoreni + "\nZavršeni: " + zav);
      } else {
        setOdgovor("Mogu da odgovorim na pitanja tipa:\n• Koliko imam BOPP 1000mm?\n• Koliko imam rolni u magacinu?\n• Koliko ima otvorenih naloga?");
      }
    } catch(e) {
      setOdgovor("Greška pri čitanju baze: " + e.message);
    }
    setLoading(false);
  }

  return (
    <div style={Object.assign({}, card||{}, {background:"#fff",borderRadius:14,padding:18,border:"1px solid #e2e8f0",marginBottom:16})}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:10}}>
        <div>
          <div style={{fontSize:18,fontWeight:900,color:"#0f172a"}}>🤖 AI asistent</div>
          <div style={{fontSize:13,color:"#64748b",marginTop:2}}>Pitaj bazu: magacin, rolne i radne naloge.</div>
        </div>
        <div style={{fontSize:11,fontWeight:800,color:"#1d4ed8",background:"#eff6ff",padding:"5px 10px",borderRadius:999}}>Supabase live</div>
      </div>

      <div style={{display:"flex",gap:8}}>
        <input
          placeholder="Npr: Koliko imam BOPP 1000mm?"
          value={pitanje}
          onChange={function(e){setPitanje(e.target.value);}}
          onKeyDown={function(e){if(e.key==="Enter")pitajAI();}}
          style={{flex:1,padding:"11px 12px",borderRadius:10,border:"1px solid #dbe3ef",fontSize:14,outline:"none"}}
        />
        <button onClick={pitajAI} disabled={loading} style={{padding:"11px 16px",borderRadius:10,border:"none",background:loading?"#94a3b8":"#1d4ed8",color:"#fff",fontWeight:800,cursor:"pointer"}}>
          {loading ? "Tražim..." : "Pitaj"}
        </button>
      </div>

      {odgovor && <pre style={{whiteSpace:"pre-wrap",fontFamily:"inherit",marginTop:12,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:10,padding:12,fontSize:13,color:"#334155",lineHeight:1.5}}>{odgovor}</pre>}
    </div>
  );
}
