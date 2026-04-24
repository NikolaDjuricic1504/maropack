import { useState } from "react";

const demoPlan = [
  {rola:"R-2604676", sirina:1440, metraza:12195, secenja:[500,500,400], otpad:40, iskoriscenje:97.22},
  {rola:"R-2604677", sirina:1440, metraza:12080, secenja:[300,300,300,300], otpad:240, iskoriscenje:83.33},
];

export default function AIsecenjePreview() {
  const [plan,setPlan] = useState(false);
  const card={background:"#fff",borderRadius:12,padding:18,border:"1px solid #e8edf3",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"};
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
        <div>
          <h2 style={{margin:0,fontSize:20,fontWeight:800}}>🧠 Optimizacija sečenja</h2>
          <div style={{fontSize:13,color:"#64748b",marginTop:4}}>Preview izgleda — sledeći korak je povezivanje sa stvarnim rolnama iz magacina.</div>
        </div>
        <button onClick={function(){setPlan(true);}} style={{padding:"10px 18px",borderRadius:8,border:"none",background:"#7c3aed",color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer"}}>Pokreni optimizaciju</button>
      </div>

      <div style={{...card,marginBottom:14,background:"#f8fafc"}}>
        <div style={{fontSize:13,fontWeight:800,marginBottom:10}}>Potrebne širine iz naloga</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10}}>
          {[{s:500,m:12000},{s:400,m:12000},{s:300,m:24000},{s:300,m:24000}].map(function(x,i){return(
            <div key={i} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:12}}>
              <div style={{fontSize:10,fontWeight:800,color:"#94a3b8",textTransform:"uppercase"}}>Traka</div>
              <div style={{fontSize:20,fontWeight:900,color:"#1d4ed8"}}>{x.s} mm</div>
              <div style={{fontSize:12,color:"#64748b"}}>{x.m.toLocaleString("sr-RS")} m</div>
            </div>
          );})}
        </div>
      </div>

      {!plan && <div style={{...card,textAlign:"center",padding:40,color:"#94a3b8"}}>Klikni “Pokreni optimizaciju” da vidiš prikaz plana sečenja.</div>}

      {plan && <div style={{display:"grid",gap:14}}>
        <div style={{...card,background:"#f0fdf4",border:"1px solid #bbf7d0",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <div>
            <div style={{fontSize:11,fontWeight:800,color:"#166534",textTransform:"uppercase"}}>Najbolji predlog</div>
            <div style={{fontSize:18,fontWeight:900,color:"#14532d"}}>Ukupan otpad: 280 mm po širini · prosečna iskorišćenost 90.27%</div>
          </div>
          <button style={{padding:"9px 15px",borderRadius:8,border:"none",background:"#059669",color:"#fff",fontWeight:800,cursor:"pointer"}}>✅ Prihvati plan</button>
        </div>

        {demoPlan.map(function(p,idx){return(
          <div key={p.rola} style={card}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,gap:12,flexWrap:"wrap"}}>
              <div>
                <div style={{fontSize:10,fontWeight:800,color:"#94a3b8",textTransform:"uppercase"}}>Matična rola {idx+1}</div>
                <div style={{fontSize:16,fontWeight:900,color:"#1d4ed8"}}>{p.rola} · {p.sirina} mm · {p.metraza.toLocaleString("sr-RS")} m</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:10,fontWeight:800,color:"#94a3b8",textTransform:"uppercase"}}>Iskorišćenost</div>
                <div style={{fontSize:24,fontWeight:900,color:"#059669"}}>{p.iskoriscenje}%</div>
              </div>
            </div>
            <div style={{height:58,borderRadius:10,overflow:"hidden",border:"1px solid #cbd5e1",display:"flex",background:"#fee2e2"}}>
              {p.secenja.map(function(s,i){return <div key={i} style={{width:(s/p.sirina*100)+"%",background:"#dbeafe",borderRight:"1px solid #93c5fd",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:"#1e40af"}}>{s} mm</div>;})}
              <div style={{width:(p.otpad/p.sirina*100)+"%",background:"#fecaca",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"#991b1b"}}>Otpad {p.otpad}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginTop:12,fontSize:12}}>
              <div style={{background:"#f8fafc",padding:10,borderRadius:8}}><b>Plan:</b><br/>{p.secenja.join(" + ")}</div>
              <div style={{background:"#f8fafc",padding:10,borderRadius:8}}><b>Otpad:</b><br/>{p.otpad} mm</div>
              <div style={{background:"#f8fafc",padding:10,borderRadius:8}}><b>Metraža:</b><br/>{p.metraza.toLocaleString("sr-RS")} m</div>
              <div style={{background:"#f8fafc",padding:10,borderRadius:8}}><b>Status:</b><br/><span style={{color:"#059669",fontWeight:800}}>Spremno za nalog</span></div>
            </div>
          </div>
        );})}
      </div>}
    </div>
  );
}
