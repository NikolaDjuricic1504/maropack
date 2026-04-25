import { useState } from "react";

function QRImg({val, size}) {
  var sz = size || 90;
  return (
    <img
      src={"https://api.qrserver.com/v1/create-qr-code/?size="+sz+"x"+sz+"&data="+encodeURIComponent(val || "")}
      width={sz}
      height={sz}
      alt="QR"
      style={{display:"block",borderRadius:4}}
    />
  );
}

function Polje({label, val}) {
  return (
    <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"10px 12px"}}>
      <div style={{fontSize:9,fontWeight:800,color:"#64748b",textTransform:"uppercase",letterSpacing:.6,marginBottom:4}}>{label}</div>
      <div style={{fontSize:13,fontWeight:700,color:"#0f172a"}}>{val || "—"}</div>
    </div>
  );
}

export default function NalogSpulnaView({nalog, onClose}) {
  const [tab,setTab] = useState("opsti");
  var extra = (nalog && nalog.mats && typeof nalog.mats === "object" && !Array.isArray(nalog.mats)) ? nalog.mats : {};
  var n = Object.assign({}, extra, nalog || {});

  var brN = n.ponBr || n.br || "MP-0000";
  var kupac = n.kupac || "—";
  var naziv = n.prod || n.naziv || "—";
  var datum = n.datum || new Date().toLocaleDateString("sr-RS");
  var kol = n.kol || n.nalog || "—";
  var materijal = n.materijal || extra.materijal || "—";
  var sirinaMat = n.sirinaM || n.sirina_mat || extra.sirinaM || "—";
  var sirinaSpulne = n.W || n.sirina_spulne || extra.W || "—";
  var precnik = n.D || n.precnik || extra.D || "—";
  var hilzna = n.di || n.hilzna || extra.di || "—";
  var gramatura = n.gramatura || extra.gramatura || "—";
  var maxMetara = n.maxMetara || extra.maxMetara || "—";

  var tabs = [
    {k:"opsti", l:"📋 Opšti podaci"},
    {k:"materijal", l:"📦 Materijal"},
    {k:"pakovanje", l:"📦 Pakovanje"}
  ];

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,.72)",zIndex:9999,display:"flex",flexDirection:"column"}}>
      <div style={{background:"#0f172a",padding:"10px 16px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        <button onClick={onClose} style={{padding:"7px 14px",borderRadius:7,border:"none",background:"#334155",color:"#fff",cursor:"pointer",fontWeight:800}}>← Nazad</button>
        <div style={{color:"#fff",fontWeight:800,flex:1}}>🔄 Nalog za špulne — {naziv} <span style={{color:"#fbbf24"}}>{brN}</span></div>
        <div style={{background:"#fff",borderRadius:7,padding:4}}><QRImg val={window.location.origin+"?ponbr="+encodeURIComponent(brN)} size={70}/></div>
      </div>

      <div style={{flex:1,overflow:"auto",background:"#f1f5f9",padding:20}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.06)"}}>
            <div style={{background:"#7c3aed",color:"#fff",padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:20,fontWeight:900}}>🔄 NALOG ZA ŠPULNE</div>
                <div style={{fontSize:12,opacity:.9}}>Kupac: <b>{kupac}</b> · Datum: <b>{datum}</b></div>
              </div>
              <div style={{fontSize:14,fontWeight:900,color:"#fde68a"}}>{brN}</div>
            </div>

            <div style={{padding:16,display:"flex",gap:8,flexWrap:"wrap",borderBottom:"1px solid #e2e8f0"}}>
              {tabs.map(function(t){return <button key={t.k} onClick={function(){setTab(t.k);}} style={{padding:"8px 14px",borderRadius:8,border:tab===t.k?"none":"1px solid #e2e8f0",background:tab===t.k?"#7c3aed":"#fff",color:tab===t.k?"#fff":"#64748b",fontWeight:800,cursor:"pointer"}}>{t.l}</button>;})}
            </div>

            <div style={{padding:18}}>
              {tab==="opsti" && (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12}}>
                  <Polje label="Broj naloga" val={brN}/>
                  <Polje label="Kupac" val={kupac}/>
                  <Polje label="Proizvod" val={naziv}/>
                  <Polje label="Količina" val={kol}/>
                  <Polje label="Status" val={n.status || "Ceka"}/>
                  <Polje label="Napomena" val={n.nap}/>
                </div>
              )}

              {tab==="materijal" && (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12}}>
                  <Polje label="Materijal" val={materijal}/>
                  <Polje label="Širina materijala" val={sirinaMat+" mm"}/>
                  <Polje label="Širina špulne" val={sirinaSpulne+" mm"}/>
                  <Polje label="Gramatura" val={gramatura}/>
                  <Polje label="Max metara po špulni" val={maxMetara}/>
                  <Polje label="Hilzna" val={hilzna+" mm"}/>
                  <Polje label="Prečnik" val={precnik+" mm"}/>
                </div>
              )}

              {tab==="pakovanje" && (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12}}>
                  <Polje label="Strana A" val={n.sideA || extra.sideA}/>
                  <Polje label="Strana B" val={n.sideB || extra.sideB}/>
                  <Polje label="Pakovanje" val={n.pakovanje || "Standard"}/>
                  <Polje label="Paleta" val={n.paleta || "Euro paleta"}/>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
