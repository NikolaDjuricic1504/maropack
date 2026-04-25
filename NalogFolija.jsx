import { useState } from "react";
import PlanRezanjaNalog from "./PlanRezanjaNalog.jsx";

export default function NalogFolija({ nalog, onClose, msg }) {
  const [tab, setTab] = useState("rez");

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",zIndex:9999,display:"flex",flexDirection:"column"}}>
      <div style={{background:"#0f172a",padding:"10px 16px",display:"flex",alignItems:"center",gap:10,color:"#fff"}}>
        <button onClick={onClose} style={{padding:"7px 14px",borderRadius:7,border:"none",background:"#334155",color:"#fff",cursor:"pointer",fontWeight:700}}>
          ← Nazad
        </button>
        <div style={{fontWeight:800, flex:1}}>
          📄 Radni nalog: {nalog?.ponBr || nalog?.br || "—"} · {nalog?.kupac || "—"}
        </div>
      </div>

      <div style={{background:"#1e293b",padding:"8px 16px 0",display:"flex",gap:4}}>
        <button onClick={() => setTab("rez")} style={tabBtn(tab==="rez")}>✂️ Rezanje</button>
        <button onClick={() => setTab("mat")} style={tabBtn(tab==="mat")}>📦 Materijal</button>
      </div>

      <div style={{flex:1,overflow:"auto",background:"#f1f5f9",padding:20}}>
        {tab === "rez" && (
          <div style={card}>
            <h2 style={{marginTop:0}}>✂️ Nalog za rezanje</h2>

            <div style={grid}>
              <Info label="Broj naloga" value={nalog?.ponBr || nalog?.br || "—"} />
              <Info label="Kupac" value={nalog?.kupac || "—"} />
              <Info label="Proizvod" value={nalog?.prod || nalog?.naziv || "—"} />
              <Info label="Količina" value={nalog?.kol ? Number(nalog.kol).toLocaleString("sr-RS") + " m" : "—"} />
            </div>

            <PlanRezanjaNalog nalog={nalog} msg={msg} />

            <div style={{marginTop:14,padding:"10px 14px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,fontSize:12,color:"#64748b"}}>
              Nalog izradio: _________________________ &nbsp;&nbsp; Nalog odobrio: _________________________
            </div>
          </div>
        )}

        {tab === "mat" && (
          <div style={card}>
            <h2 style={{marginTop:0}}>📦 Materijal</h2>
            <div style={grid}>
              <Info label="Broj naloga" value={nalog?.ponBr || nalog?.br || "—"} />
              <Info label="Kupac" value={nalog?.kupac || "—"} />
              <Info label="Proizvod" value={nalog?.prod || nalog?.naziv || "—"} />
              <Info label="Status" value={nalog?.status || "—"} />
            </div>
            <p style={{color:"#64748b"}}>Stabilna verzija. Sledeće dodajemo QR, formatiranje, radnike i dashboard jedno po jedno.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({label, value}) {
  return (
    <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:10}}>
      <div style={{fontSize:9,color:"#94a3b8",fontWeight:900,textTransform:"uppercase"}}>{label}</div>
      <div style={{fontSize:13,fontWeight:800,marginTop:3}}>{value || "—"}</div>
    </div>
  );
}

function tabBtn(active) {
  return {
    padding:"8px 16px",
    borderRadius:"8px 8px 0 0",
    border:"none",
    cursor:"pointer",
    fontSize:12,
    fontWeight:800,
    background:active ? "#f1f5f9" : "transparent",
    color:active ? "#0f172a" : "#94a3b8"
  };
}

const card = {
  background:"#fff",
  border:"1px solid #e2e8f0",
  borderRadius:10,
  padding:18,
  boxShadow:"0 2px 8px rgba(0,0,0,0.06)"
};

const grid = {
  display:"grid",
  gridTemplateColumns:"repeat(4,1fr)",
  gap:10,
  marginBottom:14
};
