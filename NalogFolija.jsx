// NalogFolija-ENHANCED.jsx - SA PARAMETRIMA I KONTROLNIM TAČKAMA
import { useState } from "react";
import { supabase } from "./supabase.js";

export default function NalogFolijaEnhanced({nalog, onClose, msg}) {
  const [parametri, setParametri] = useState({
    // Grafika i štampa
    grafika: nalog.mats?.grafika || "Nov posao",
    stm: nalog.mats?.stm || "Flexo",
    brBoja: nalog.mats?.brBoja || "4",
    smer: nalog.mats?.smer || "Desno",
    obimValjka: nalog.mats?.obimValjka || "",
    hilzna: nalog.mats?.hilzna || "76",
    
    // Perforacija
    tipPerf: nalog.mats?.tipPerf || "",
    oblikPerf: nalog.mats?.oblikPerf || "Fina (mikro)",
    razmakPerf: nalog.mats?.razmakPerf || "",
    brzinaPerf: nalog.mats?.brzinaPerf || "120",
    
    // Rezanje
    secivo: nalog.mats?.secivo || "Zilet",
    stranaRez: nalog.mats?.stranaRez || "Stampa spolja",
    rezBrTraka: nalog.mats?.rezBrTraka || "",
    precnikRolne: nalog.mats?.precnikRolne || "do 600mm",
    duzinaRolne: nalog.mats?.duzinaRolne || "5000",
    
    // Dodatno
    korona: nalog.mats?.korona || "Ne",
    obelezavanje: nalog.mats?.obelezavanje || "Crvena traka",
    pakovanjeRolni: nalog.mats?.pakovanjeRolni || "Svaka pojedinacno",
    paleta: nalog.mats?.paleta || "Euro paleta",
    
    // Lepak (ako ima kasiranje)
    tipLepka: nalog.mats?.tipLepka || "PU solventni",
    lepakOdnos: nalog.mats?.lepakOdnos || "3:1",
    lepakNanos: nalog.mats?.lepakNanos || "3,5"
  });

  const [kontrolneTacke, setKontrolneTacke] = useState([
    {id:1, naziv:"Priprema materijala", zavrseno:false, vreme:null, radnik:null},
    {id:2, naziv:"Podešavanje mašine", zavrseno:false, vreme:null, radnik:null},
    {id:3, naziv:"Test otisak", zavrseno:false, vreme:null, radnik:null},
    {id:4, naziv:"Proizvodnja - prva polovina", zavrseno:false, vreme:null, radnik:null},
    {id:5, naziv:"Međukontro la kvaliteta", zavrseno:false, vreme:null, radnik:null},
    {id:6, naziv:"Proizvodnja - druga polovina", zavrseno:false, vreme:null, radnik:null},
    {id:7, naziv:"Završna kontrola", zavrseno:false, vreme:null, radnik:null},
    {id:8, naziv:"Pakovanje", zavrseno:false, vreme:null, radnik:null}
  ]);

  const [activeTab, setActiveTab] = useState("parametri");

  function toggleKontrolnaTacka(id) {
    setKontrolneTacke(function(prev) {
      return prev.map(function(kt) {
        if (kt.id === id) {
          return Object.assign({}, kt, {
            zavrseno: !kt.zavrseno,
            vreme: !kt.zavrseno ? new Date().toLocaleString("sr-RS") : null,
            radnik: !kt.zavrseno ? (nalog.radnik || "nepoznat") : null
          });
        }
        return kt;
      });
    });
  }

  async function sacuvajParametre() {
    try {
      var res = await supabase
        .from("nalozi")
        .update({
          mats: Object.assign({}, nalog.mats || {}, parametri)
        })
        .eq("id", nalog.id);
      
      if (res.error) throw res.error;
      msg("✅ Parametri sačuvani!");
    } catch(e) {
      msg("Greška: " + e.message, "err");
    }
  }

  var inp = {
    width:"100%",
    padding:"9px 12px",
    borderRadius:8,
    border:"1px solid #e2e8f0",
    fontSize:13,
    color:"#1e293b",
    background:"#f8fafc",
    outline:"none",
    boxSizing:"border-box"
  };

  var lbl = {
    fontSize:10,
    fontWeight:700,
    color:"#64748b",
    textTransform:"uppercase",
    letterSpacing:0.6,
    marginBottom:4,
    display:"block"
  };

  var card = {
    background:"#fff",
    borderRadius:12,
    padding:20,
    boxShadow:"0 1px 3px rgba(0,0,0,0.04)",
    border:"1px solid #e8edf3"
  };

  // Progress
  var zavrseneKT = kontrolneTacke.filter(function(kt){ return kt.zavrseno; }).length;
  var progressProcenat = (zavrseneKT / kontrolneTacke.length) * 100;

  return (
    <div style={{
      position:"fixed",
      top:0,left:0,right:0,bottom:0,
      background:"rgba(0,0,0,0.7)",
      zIndex:9999,
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      padding:20,
      overflow:"auto"
    }}>
      <div style={{
        background:"#fff",
        borderRadius:16,
        maxWidth:900,
        width:"100%",
        maxHeight:"95vh",
        overflow:"auto"
      }}>
        {/* Header */}
        <div style={{
          padding:"16px 24px",
          borderBottom:"2px solid #e2e8f0",
          position:"sticky",
          top:0,
          background:"#fff",
          zIndex:1
        }}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div>
              <div style={{fontSize:20,fontWeight:800,color:"#1d4ed8"}}>
                📄 {nalog.naziv}
              </div>
              <div style={{fontSize:13,color:"#64748b",marginTop:2}}>
                Ponuda: <b>{nalog.ponBr}</b> · Kupac: <b>{nalog.kupac}</b>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                padding:"8px 16px",
                borderRadius:8,
                border:"1px solid #e2e8f0",
                background:"#fff",
                color:"#64748b",
                fontWeight:700,
                fontSize:13,
                cursor:"pointer"
              }}
            >
              ✕ Zatvori
            </button>
          </div>

          {/* Progress bar */}
          <div style={{marginTop:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:11,fontWeight:700,color:"#64748b"}}>
                Napredak: {zavrseneKT}/{kontrolneTacke.length}
              </span>
              <span style={{fontSize:11,fontWeight:700,color:"#1d4ed8"}}>
                {progressProcenat.toFixed(0)}%
              </span>
            </div>
            <div style={{
              height:8,
              background:"#f1f5f9",
              borderRadius:4,
              overflow:"hidden"
            }}>
              <div style={{
                height:"100%",
                background:"linear-gradient(90deg, #1d4ed8, #059669)",
                borderRadius:4,
                width:progressProcenat+"%",
                transition:"width 0.3s"
              }}/>
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",gap:8,marginTop:16}}>
            {[
              {key:"parametri",label:"⚙️ Parametri"},
              {key:"kontrola",label:"✅ Kontrolne tačke"},
              {key:"materijali",label:"🧪 Materijali"}
            ].map(function(tab){
              var active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={function(){ setActiveTab(tab.key); }}
                  style={{
                    padding:"8px 16px",
                    borderRadius:8,
                    border: active ? "2px solid #1d4ed8" : "1px solid #e2e8f0",
                    background: active ? "#eff6ff" : "#fff",
                    color: active ? "#1d4ed8" : "#64748b",
                    fontWeight: active ? 800 : 600,
                    cursor:"pointer",
                    fontSize:13
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{padding:24}}>
          
          {/* PARAMETRI TAB */}
          {activeTab === "parametri" && (
            <div>
              {/* Grafika i štampa */}
              <div style={Object.assign({},card,{marginBottom:16})}>
                <div style={{fontSize:15,fontWeight:800,marginBottom:14,color:"#1d4ed8"}}>
                  🖨️ Grafika i štampa
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div>
                    <label style={lbl}>Grafika</label>
                    <select style={inp} value={parametri.grafika} onChange={function(e){
                      setParametri(function(p){ return Object.assign({},p,{grafika:e.target.value}); });
                    }}>
                      <option>Nov posao</option>
                      <option>Repriza - isti kao prethodni</option>
                      <option>Repriza - izmena grafike</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Tip štampe</label>
                    <select style={inp} value={parametri.stm} onChange={function(e){
                      setParametri(function(p){ return Object.assign({},p,{stm:e.target.value}); });
                    }}>
                      <option>Flexo</option>
                      <option>Rotogravura</option>
                      <option>Bez štampe</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Broj boja</label>
                    <select style={inp} value={parametri.brBoja} onChange={function(e){
                      setParametri(function(p){ return Object.assign({},p,{brBoja:e.target.value}); });
                    }}>
                      {["1","2","3","4","5","6","7","8"].map(function(n){
                        return <option key={n}>{n}</option>;
                      })}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Smer odmotavanja</label>
                    <select style={inp} value={parametri.smer} onChange={function(e){
                      setParametri(function(p){ return Object.assign({},p,{smer:e.target.value}); });
                    }}>
                      <option>Desno</option>
                      <option>Levo</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Obim valjka (mm)</label>
                    <input style={inp} value={parametri.obimValjka} onChange={function(e){
                      setParametri(function(p){ return Object.assign({},p,{obimValjka:e.target.value}); });
                    }} placeholder="npr. 320"/>
                  </div>
                  <div>
                    <label style={lbl}>Hilzna (mm)</label>
                    <select style={inp} value={parametri.hilzna} onChange={function(e){
                      setParametri(function(p){ return Object.assign({},p,{hilzna:e.target.value}); });
                    }}>
                      <option>76</option>
                      <option>152</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Perforacija */}
              <div style={Object.assign({},card,{marginBottom:16})}>
                <div style={{fontSize:15,fontWeight:800,marginBottom:14,color:"#7c3aed"}}>
                  🔵 Perforacija
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div>
                    <label style={lbl}>Tip perforacije</label>
                    <select style={inp} value={parametri.tipPerf} onChange={function(e){
                      setParametri(function(p){ return Object.assign({},p,{tipPerf:e.target.value}); });
                    }}>
                      <option value="">Bez perforacije</option>
                      <option>Uzdužna</option>
                      <option>Poprečna</option>
                      <option>Ukrštena</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Oblik perforacije</label>
                    <select style={inp} value={parametri.oblikPerf} onChange={function(e){
                      setParametri(function(p){ return Object.assign({},p,{oblikPerf:e.target.value}); });
                    }}>
                      <option>Fina (mikro)</option>
                      <option>Standardna</option>
                      <option>Gruba</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Razmak (mm)</label>
                    <input style={inp} value={parametri.razmakPerf} onChange={function(e){
                      setParametri(function(p){ return Object.assign({},p,{razmakPerf:e.target.value}); });
                    }} placeholder="npr. 100"/>
                  </div>
                  <div>
                    <label style={lbl}>Brzina (m/min)</label>
                    <input style={inp} value={parametri.brzinaPerf} onChange={function(e){
                      setParametri(function(p){ return Object.assign({},p,{brzinaPerf:e.target.value}); });
                    }}/>
                  </div>
                </div>
              </div>

              {/* Rezanje */}
              <div style={Object.assign({},card,{marginBottom:16})}>
                <div style={{fontSize:15,fontWeight:800,marginBottom:14,color:"#059669"}}>
                  ✂️ Rezanje
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div>
                    <label style={lbl}>Tip sečiva</label>
                    <select style={inp} value={parametri.secivo} onChange={function(e){
                      setParametri(function(p){ return Object.assign({},p,{secivo:e.target.value}); });
                    }}>
                      <option>Zilet</option>
                      <option>Kružno sečivo</option>
                      <option>Hot-knife</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Strana reza</label>
                    <select style={inp} value={parametri.stranaRez} onChange={function(e){
                      setParametri(function(p){ return Object.assign({},p,{stranaRez:e.target.value}); });
                    }}>
                      <option>Stampa spolja</option>
                      <option>Stampa unutra</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Broj traka</label>
                    <input style={inp} value={parametri.rezBrTraka} onChange={function(e){
                      setParametri(function(p){ return Object.assign({},p,{rezBrTraka:e.target.value}); });
                    }} placeholder="npr. 5"/>
                  </div>
                  <div>
                    <label style={lbl}>Prečnik rolne</label>
                    <select style={inp} value={parametri.precnikRolne} onChange={function(e){
                      setParametri(function(p){ return Object.assign({},p,{precnikRolne:e.target.value}); });
                    }}>
                      <option>do 400mm</option>
                      <option>do 600mm</option>
                      <option>do 800mm</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Dužina rolne (m)</label>
                    <input style={inp} value={parametri.duzinaRolne} onChange={function(e){
                      setParametri(function(p){ return Object.assign({},p,{duzinaRolne:e.target.value}); });
                    }}/>
                  </div>
                </div>
              </div>

              {/* Dodatno */}
              <div style={Object.assign({},card,{marginBottom:16})}>
                <div style={{fontSize:15,fontWeight:800,marginBottom:14,color:"#f59e0b"}}>
                  ⚡ Dodatne operacije
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div>
                    <label style={lbl}>Korona tretman</label>
                    <select style={inp} value={parametri.korona} onChange={function(e){
                      setParametri(function(p){ return Object.assign({},p,{korona:e.target.value}); });
                    }}>
                      <option>Ne</option>
                      <option>Da</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Obeležavanje</label>
                    <select style={inp} value={parametri.obelezavanje} onChange={function(e){
                      setParametri(function(p){ return Object.assign({},p,{obelezavanje:e.target.value}); });
                    }}>
                      <option>Crvena traka</option>
                      <option>Žuta traka</option>
                      <option>Bez obeležavanja</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Pakovanje rolni</label>
                    <select style={inp} value={parametri.pakovanjeRolni} onChange={function(e){
                      setParametri(function(p){ return Object.assign({},p,{pakovanjeRolni:e.target.value}); });
                    }}>
                      <option>Svaka pojedinačno</option>
                      <option>Po 2 u foliji</option>
                      <option>Po 5 u foliji</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Paleta</label>
                    <select style={inp} value={parametri.paleta} onChange={function(e){
                      setParametri(function(p){ return Object.assign({},p,{paleta:e.target.value}); });
                    }}>
                      <option>Euro paleta</option>
                      <option>Američka paleta</option>
                      <option>Bez palete</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Lepak (ako ima kasiranje) */}
              {nalog.mats && nalog.mats.filter && nalog.mats.filter(function(m){return m.kas>0;}).length > 0 && (
                <div style={Object.assign({},card,{marginBottom:16})}>
                  <div style={{fontSize:15,fontWeight:800,marginBottom:14,color:"#1d4ed8"}}>
                    🔗 Lepak (kasiranje)
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                    <div>
                      <label style={lbl}>Tip lepka</label>
                      <select style={inp} value={parametri.tipLepka} onChange={function(e){
                        setParametri(function(p){ return Object.assign({},p,{tipLepka:e.target.value}); });
                      }}>
                        <option>PU solventni</option>
                        <option>PU solventless</option>
                        <option>Akrilatni</option>
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>Odnos mešanja</label>
                      <select style={inp} value={parametri.lepakOdnos} onChange={function(e){
                        setParametri(function(p){ return Object.assign({},p,{lepakOdnos:e.target.value}); });
                      }}>
                        <option>3:1</option>
                        <option>4:1</option>
                        <option>5:1</option>
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>Nanos (g/m²)</label>
                      <input style={inp} value={parametri.lepakNanos} onChange={function(e){
                        setParametri(function(p){ return Object.assign({},p,{lepakNanos:e.target.value}); });
                      }}/>
                    </div>
                  </div>
                </div>
              )}

              {/* Sacuvaj dugme */}
              <button
                onClick={sacuvajParametre}
                style={{
                  width:"100%",
                  padding:14,
                  borderRadius:10,
                  border:"none",
                  background:"#1d4ed8",
                  color:"#fff",
                  fontWeight:800,
                  fontSize:15,
                  cursor:"pointer"
                }}
              >
                💾 Sačuvaj parametere
              </button>
            </div>
          )}

          {/* KONTROLNE TAČKE TAB */}
          {activeTab === "kontrola" && (
            <div>
              <div style={Object.assign({},card,{marginBottom:16,background:"#fffbeb",border:"2px solid #fde68a"})}>
                <div style={{fontSize:14,fontWeight:700,color:"#92400e",marginBottom:8}}>
                  ℹ️ Kontrolne tačke
                </div>
                <div style={{fontSize:13,color:"#78716c"}}>
                  Označavaj svaki korak tokom proizvodnje. Ovo pomaže u praćenju napretka i kvaliteta.
                </div>
              </div>

              <div style={{display:"grid",gap:10}}>
                {kontrolneTacke.map(function(kt){
                  return (
                    <div
                      key={kt.id}
                      style={Object.assign({},card,{
                        background: kt.zavrseno ? "#f0fdf4" : "#fff",
                        border: kt.zavrseno ? "2px solid #bbf7d0" : "1px solid #e2e8f0",
                        cursor:"pointer"
                      })}
                      onClick={function(){ toggleKontrolnaTacka(kt.id); }}
                    >
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{
                          width:32,
                          height:32,
                          borderRadius:"50%",
                          border: kt.zavrseno ? "none" : "2px solid #e2e8f0",
                          background: kt.zavrseno ? "#059669" : "#fff",
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center",
                          fontSize:16,
                          flexShrink:0
                        }}>
                          {kt.zavrseno ? "✅" : kt.id}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{
                            fontSize:15,
                            fontWeight:700,
                            color: kt.zavrseno ? "#166534" : "#1e293b",
                            marginBottom:2
                          }}>
                            {kt.naziv}
                          </div>
                          {kt.zavrseno && kt.vreme && (
                            <div style={{fontSize:11,color:"#64748b"}}>
                              {kt.vreme} · {kt.radnik}
                            </div>
                          )}
                        </div>
                        {!kt.zavrseno && (
                          <div style={{
                            padding:"4px 12px",
                            borderRadius:6,
                            background:"#f1f5f9",
                            color:"#64748b",
                            fontSize:11,
                            fontWeight:700
                          }}>
                            Klikni za završi
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MATERIJALI TAB */}
          {activeTab === "materijali" && (
            <div>
              {nalog.mats && nalog.mats.length > 0 ? (
                <div style={{display:"grid",gap:12}}>
                  {nalog.mats.filter(function(m){return m.tip;}).map(function(m,i){
                    var BOJE = ["#1d4ed8","#7c3aed","#0891b2","#059669"];
                    var SLOJ = ["A","B","C","D"];
                    return (
                      <div key={i} style={Object.assign({},card,{
                        background:BOJE[i]+"10",
                        border:"2px solid "+BOJE[i]+"40"
                      })}>
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                          <span style={{
                            width:32,
                            height:32,
                            borderRadius:"50%",
                            background:BOJE[i],
                            color:"#fff",
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            fontSize:16,
                            fontWeight:800
                          }}>
                            {SLOJ[i]}
                          </span>
                          <div>
                            <div style={{fontSize:16,fontWeight:800,color:BOJE[i]}}>
                              {m.tip} {m.deb}µ
                            </div>
                          </div>
                        </div>
                        <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                          {m.kas > 0 && (
                            <span style={{fontSize:13,color:"#475569"}}>
                              🔗 <b>{m.kas}x</b> kasiranje
                            </span>
                          )}
                          {m.lak > 0 && (
                            <span style={{fontSize:13,color:"#475569"}}>
                              ✨ <b>{m.lak}x</b> lakiranje
                            </span>
                          )}
                          {m.stamp && (
                            <span style={{fontSize:13,color:"#475569"}}>
                              🖨️ štampa
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={Object.assign({},card,{textAlign:"center",padding:40,color:"#94a3b8"})}>
                  <div style={{fontSize:36,marginBottom:10}}>📦</div>
                  <div>Nema podataka o materijalima</div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
