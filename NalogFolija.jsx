import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";
import PlanRezanjaNalog from "./PlanRezanjaNalog.jsx";

export default function NalogFolija({ nalog, onClose, msg }) {
  const [tab, setTab] = useState("rez");

  return (
    <div style={{padding:20}}>

      <h2>📄 Nalog: {nalog?.ponBr || "—"}</h2>

      {/* TAB SELECT */}
      <div style={{marginBottom:20}}>
        <button onClick={()=>setTab("rez")}>✂️ Rezanje</button>
        <button onClick={()=>setTab("mat")}>📦 Materijal</button>
      </div>

      {/* REZANJE TAB */}
      {tab === "rez" && (
        <div style={{background:"#fff",padding:20,borderRadius:10}}>

          <h3>✂️ Plan rezanja</h3>

          {/* PLAN REZANJA */}
          <PlanRezanjaNalog nalog={nalog} msg={msg} />

          {/* NAPOMENA */}
          <div style={{marginTop:20}}>
            <textarea
              placeholder="Napomena..."
              style={{width:"100%",height:80}}
            />
          </div>

        </div>
      )}

      {/* MATERIJAL TAB */}
      {tab === "mat" && (
        <div style={{background:"#fff",padding:20,borderRadius:10}}>
          <h3>📦 Materijal</h3>
          <p>Ovde ide prikaz rolni iz magacina...</p>
        </div>
      )}

    </div>
  );
}
