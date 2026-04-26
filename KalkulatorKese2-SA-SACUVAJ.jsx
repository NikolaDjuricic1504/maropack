// KalkulatorKese2.jsx - SA DODANIM "💾 SAČUVAJ" DUGMETOM
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase.js";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const PREVODI = {
  sr:{ponuda:"PONUDA",br:"Broj",dat:"Datum",vaz:"Važi do",kup:"Kupac",adr:"Adresa",kon:"Kontakt",naz:"Naziv proizvoda",kol:"Količina (kom)",jc:"Cena €/1000kom",uk:"Ukupno €",nap:"Napomena",pot:"Ovlašćeno lice",pdv:"PDV nije uključen",hv:"Hvala na poverenju!",pl:"Plaćanje: 30 dana od fakture."},
  en:{ponuda:"QUOTATION",br:"Number",dat:"Date",vaz:"Valid until",kup:"Customer",adr:"Address",kon:"Contact",naz:"Product name",kol:"Quantity (pcs)",jc:"Unit price €/1000pcs",uk:"Total €",nap:"Note",pot:"Authorized person",pdv:"VAT not included",hv:"Thank you for your business!",pl:"Payment: 30 days from invoice."},
  de:{ponuda:"ANGEBOT",br:"Nummer",dat:"Datum",vaz:"Gültig bis",kup:"Kunde",adr:"Adresse",kon:"Kontakt",naz:"Produktname",kol:"Menge (Stk)",jc:"Einzelpreis €/1000Stk",uk:"Gesamt €",nap:"Bemerkung",pot:"Bevollmächtigte Person",pdv:"MwSt. nicht enthalten",hv:"Vielen Dank!",pl:"Zahlung: 30 Tage nach Rechnung."},
};

const LOGO_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

function PonudaView({t,naziv,kupac,adr,kon,kol,c1,uk,nap,printRef,broj,dat,vaz}) {
  var f2l = function(v){return isNaN(v)?"—":(+v).toFixed(2).replace(".",",");};
  return (
    <div ref={printRef} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:28,fontFamily:"'Segoe UI',serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,paddingBottom:16,borderBottom:"2px solid #059669"}}>
        <div>
          <img src={LOGO_B64} alt="Maropack" style={{height:50,objectFit:"contain"}}/>
          <div style={{fontSize:11,color:"#64748b",marginTop:4}}>Fleksibilna ambalaza · Srbija</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:20,fontWeight:800,color:"#059669"}}>{t.ponuda}</div>
          {broj && <div style={{fontSize:11,color:"#64748b",marginTop:3}}>{t.br}: <b>{broj}</b></div>}
          {dat && <div style={{fontSize:11,color:"#64748b"}}>{t.dat}: <b>{dat}</b></div>}
          {vaz && <div style={{fontSize:11,color:"#64748b"}}>{t.vaz}: <b>{vaz}</b></div>}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
        <div style={{background:"#f8fafc",borderRadius:8,padding:"12px 14px"}}>
          <div style={{fontSize:9,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>{t.kup}</div>
          <div style={{fontWeight:700,fontSize:13}}>{kupac||"—"}</div>
          {adr && <div style={{fontSize:11,color:"#64748b",marginTop:2}}>{adr}</div>}
          {kon && <div style={{fontSize:11,color:"#64748b"}}>{kon}</div>}
        </div>
        <div style={{background:"#f0fdf4",borderRadius:8,padding:"12px 14px"}}>
          <div style={{fontSize:9,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>{t.naz}</div>
          <div style={{fontWeight:700,fontSize:13}}>{naziv||"—"}</div>
        </div>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,marginBottom:16}}>
        <thead>
          <tr style={{background:"#059669",color:"#fff"}}>
            <th style={{padding:"9px 10px",textAlign:"left"}}>{t.naz}</th>
            <th style={{padding:"9px 10px",textAlign:"right"}}>{t.kol}</th>
            <th style={{padding:"9px 10px",textAlign:"right"}}>{t.jc}</th>
            <th style={{padding:"9px 10px",textAlign:"right"}}>{t.uk}</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{borderBottom:"1px solid #e2e8f0"}}>
            <td style={{padding:"10px"}}>{naziv||"—"}</td>
            <td style={{padding:"10px",textAlign:"right"}}>{(kol||0).toLocaleString()}</td>
            <td style={{padding:"10px",textAlign:"right"}}>{f2l(c1)}</td>
            <td style={{padding:"10px",textAlign:"right",fontWeight:700}}>{f2l(uk)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr style={{background:"#f8fafc"}}>
            <td colSpan={3} style={{padding:"10px",fontWeight:700,textAlign:"right"}}>{t.uk}:</td>
            <td style={{padding:"10px",fontWeight:900,fontSize:15,textAlign:"right",color:"#059669"}}>{f2l(uk)} €</td>
          </tr>
        </tfoot>
      </table>
      <div style={{fontSize:10,color:"#94a3b8",marginBottom:6}}>* {t.pdv}</div>
      {nap && <div style={{background:"#fffbeb",borderRadius:7,padding:"9px 12px",fontSize:11,color:"#92400e",marginBottom:10}}>📌 {t.nap}: {nap}</div>}
      <div style={{borderTop:"1px solid #e2e8f0",paddingTop:14,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
        <div style={{fontSize:10,color:"#64748b"}}>{t.pl}</div>
        <div style={{textAlign:"center"}}>
          <div style={{width:100,borderTop:"1px solid #0f172a",paddingTop:4,fontSize:10,color:"#64748b"}}>{t.pot}</div>
        </div>
      </div>
      <div style={{textAlign:"center",marginTop:12,fontSize:11,color:"#94a3b8",fontStyle:"italic"}}>{t.hv}</div>
    </div>
  );
}

export default function KalkulatorKese2({user,msg,setPage,inp,card,lbl}) {
  const [naziv,setNaziv]=useState("");
  const [kupacKalk,setKupacKalk]=useState("");
  const [materijal,setMaterijal]=useState("BOPP 20");
  const [sirina,setSirina]=useState(200);
  const [duzina,setDuzina]=useState(300);
  const [klapna,setKlapna]=useState(40);
  const [takt,setTakt]=useState(100);
  const [ban,setBan]=useState(1);
  const [nalog,setNalog]=useState(100);
  const [sk,setSk]=useState(10);
  const [mar,setMar]=useState(40);
  const [cenaFolije,setCenaFolije]=useState(3.1);
  const [gramatura,setGramatura]=useState(18.2);
  const [ktab,setKtab]=useState("unos");
  const [res,setRes]=useState(null);
  
  // Ponuda
  const [pkupac,setPkupac]=useState("");
  const [padr,setPadr]=useState("");
  const [pkon,setPkon]=useState("");
  const [pnap,setPnap]=useState("");
  const [pjez,setPjez]=useState("sr");
  const [aktivna,setAktivna]=useState(null);
  const [pdfLoading,setPdfLoading]=useState(false);
  const ponudaRef=useRef(null);

  const calc=useCallback(function(){
    if(!sirina||!duzina||!takt||!ban||!nalog) {setRes(null);return;}
    
    var S=+sirina;
    var D=+duzina;
    var K=+klapna;
    var T=+takt;
    var B=+ban;
    var N=+nalog;
    
    // Površina kese
    var povrsinaKese = ((2*S + 2*K) * D) / 1000000; // m²
    
    // Težina kese
    var tezinaKese = povrsinaKese * (+gramatura); // g
    
    // Broj kesa po nalogu
    var kesePo1000 = 1000;
    var kesePoNalogu = kesePo1000 * N;
    
    // Materijal
    var ukM2 = povrsinaKese * kesePoNalogu;
    var ukKg = (tezinaKese * kesePoNalogu) / 1000;
    var ukMat = ukKg * (+cenaFolije);
    
    // Osnovna cena
    var osn = ukMat;
    var osn_1000 = (osn / N);
    var osn_kg = ukKg > 0 ? osn / ukKg : 0;
    
    // Sa škartom i maržom
    var sas = osn * (1 + (+sk/100));
    var mf = 1 + (+mar/100);
    var k1 = (sas / N) * mf;
    var kkg = ukKg > 0 ? ((sas * mf) / ukKg) : 0;
    var kn = sas * mf;
    
    setRes({
      povrsinaKese, tezinaKese, kesePo1000, kesePoNalogu,
      ukM2, ukKg, ukMat,
      osn, osn_1000, osn_kg,
      sas, k1, kkg, kn
    });
  },[sirina,duzina,klapna,takt,ban,nalog,sk,mar,cenaFolije,gramatura]);

  useEffect(function(){calc();},[calc]);

  async function sacuvaj(){
    if(!res||!naziv.trim()){msg("Unesite naziv proizvoda!","err");return;}
    
    var p = {
      naziv: naziv,
      kupac: kupacKalk,
      tip: "kesa",
      kesa_materijal: materijal,
      kesa_sirina: +sirina,
      kesa_duzina: +duzina,
      kesa_klapna: +klapna,
      kesa_takt: +takt,
      kesa_ban: +ban,
      nal: +nalog,
      sk: +sk,
      mar: +mar,
      mats: [{tip:materijal, deb:gramatura.toString(), kas:0, lak:0, stamp:false}],
      res: Object.assign({}, res),
      datum: new Date().toLocaleDateString("sr-RS"),
      ko: user.ime,
      status: "Aktivan"
    };
    
    try {
      const {error} = await supabase.from('proizvodi').insert([p]);
      if(error) throw error;
      msg("✅ Proizvod sačuvan u bazi!");
    } catch(e) {
      msg("Greška: " + e.message, "err");
    }
  }

  async function kreirajPonudu(){
    if(!res||!naziv.trim()){msg("Najpre završiti kalkulaciju!","err");return;}
    if(!pkupac.trim()){msg("Unesite naziv kupca!","err");return;}
    
    var p = {
      broj: "MP-"+new Date().getFullYear()+"-"+String(Math.floor(Math.random()*9000)+1000),
      datum: new Date().toLocaleDateString("sr-RS"),
      vaz: new Date(Date.now()+30*24*3600000).toLocaleDateString("sr-RS"),
      kupac: pkupac,
      adr: padr,
      kon: pkon,
      naziv: naziv,
      kol: res.kesePoNalogu,
      c1: res.k1,
      uk: res.kn,
      mats: [{tip:materijal, deb:gramatura.toString()}],
      nap: pnap,
      jez: pjez,
      status: "Aktivna",
      ko: user.ime,
      res: Object.assign({}, res),
      tip: "kesa"
    };
    
    try {
      const {data,error} = await supabase.from('ponude').insert([p]).select();
      if(error) throw error;
      setAktivna(data[0]);
      msg("✅ Ponuda kreirana!");
    } catch(e) {
      msg("Greška: " + e.message, "err");
    }
  }

  async function downloadPDF(ref,filename){
    if(!ref.current) return;
    setPdfLoading(true);
    try {
      const canvas = await html2canvas(ref.current,{scale:2,useCORS:true,backgroundColor:"#ffffff"});
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      pdf.addImage(imgData,"PNG",0,0,pdfW,pdfH);
      pdf.save(filename+".pdf");
      msg("PDF preuzet!");
    } catch(e) {
      msg("Greška PDF","err");
    }
    setPdfLoading(false);
  }

  var f2 = function(v){return isNaN(v)||v===null?"—":(+v).toFixed(2).replace(".",",");};
  var eu = function(v){return f2(v)+" €";};

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
        <h2 style={{margin:0,fontSize:20,fontWeight:800}}>🛍️ Kalkulator kese</h2>
        <div style={{display:"flex",gap:6}}>
          {[["unos","📋 Unos"],["pon","📄 Ponuda"],["rez","📊 Rezultati"]].map(function(t){
            return <button key={t[0]} onClick={function(){setKtab(t[0]);}} style={{padding:"7px 14px",borderRadius:7,border:ktab===t[0]?"none":"1px solid #e2e8f0",cursor:"pointer",fontSize:12,fontWeight:700,background:ktab===t[0]?"#059669":"#fff",color:ktab===t[0]?"#fff":"#64748b"}}>{t[1]}</button>;
          })}
        </div>
      </div>

      {ktab==="unos" && (
        <div>
          <div style={Object.assign({},card,{marginBottom:14})}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div><label style={lbl}>Naziv kese *</label><input style={Object.assign({},inp,{fontSize:14,fontWeight:600})} value={naziv} onChange={function(e){setNaziv(e.target.value);}} placeholder="npr. Kesa za hleb 200x300mm"/></div>
              <div><label style={lbl}>Kupac</label><input style={Object.assign({},inp,{fontSize:14})} value={kupacKalk} onChange={function(e){setKupacKalk(e.target.value);}} placeholder="Naziv kupca"/></div>
            </div>
          </div>

          <div style={Object.assign({},card,{marginBottom:14})}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>🧪 Materijal</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              <div><label style={lbl}>Tip materijala</label><input style={inp} value={materijal} onChange={function(e){setMaterijal(e.target.value);}} placeholder="BOPP 20"/></div>
              <div><label style={lbl}>Gramatura (g/m²)</label><input type="number" style={inp} value={gramatura} step={0.1} onChange={function(e){setGramatura(e.target.value);}}/></div>
              <div><label style={lbl}>Cena folije (EUR/kg)</label><input type="number" style={inp} value={cenaFolije} step={0.1} onChange={function(e){setCenaFolije(e.target.value);}}/></div>
            </div>
          </div>

          <div style={Object.assign({},card,{marginBottom:14})}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>📐 Dimenzije kese</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12}}>
              {[["Širina (mm)",sirina,setSirina,1],["Dužina (mm)",duzina,setDuzina,1],["Klapna (mm)",klapna,setKlapna,1],["Takt (kom/min)",takt,setTakt,1],["Baner",ban,setBan,1],["Nalog (x1000)",nalog,setNalog,1],["Škart %",sk,setSk,0.5],["Marža %",mar,setMar,1]].map(function(item){
                return <div key={item[0]}><label style={lbl}>{item[0]}</label><input type="number" style={inp} value={item[1]} step={item[3]} onChange={function(e){item[2](e.target.value);}}/></div>;
              })}
            </div>
          </div>

          {res && (
            <div style={Object.assign({},card,{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",border:"1px solid #bbf7d0"})}>
              <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,color:"#64748b",marginBottom:2,fontWeight:700}}>CENA SA MARŽOM / 1.000 kom</div>
                  <div style={{fontSize:26,fontWeight:900,color:"#059669"}}>{eu(res.k1)}</div>
                  <div style={{fontSize:11,color:"#64748b",marginTop:2}}>Osnovna: {eu(res.osn_1000)} | Nalog: {eu(res.kn)}</div>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <button style={{padding:"9px 16px",borderRadius:8,border:"none",background:"#059669",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}} onClick={sacuvaj}>💾 Sačuvaj u bazu</button>
                  <button style={{padding:"9px 16px",borderRadius:8,border:"none",background:"#7c3aed",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}} onClick={function(){setKtab("pon");if(kupacKalk)setPkupac(kupacKalk);}}>📄 Ponuda</button>
                  <button style={{padding:"9px 16px",borderRadius:8,border:"none",background:"#1d4ed8",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}} onClick={function(){setKtab("rez");}}>📊 Rezultati</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {ktab==="pon" && (
        <div>
          <div style={Object.assign({},card,{marginBottom:14})}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>📄 Podaci za ponudu</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div><label style={lbl}>Kupac *</label><input style={inp} value={pkupac} onChange={function(e){setPkupac(e.target.value);}} placeholder="Firma d.o.o."/></div>
              <div><label style={lbl}>Adresa</label><input style={inp} value={padr} onChange={function(e){setPadr(e.target.value);}} placeholder="Ulica, Grad"/></div>
              <div><label style={lbl}>Kontakt</label><input style={inp} value={pkon} onChange={function(e){setPkon(e.target.value);}} placeholder="email / tel"/></div>
              <div><label style={lbl}>Jezik</label>
                <select style={inp} value={pjez} onChange={function(e){setPjez(e.target.value);}}>
                  <option value="sr">🇷🇸 Srpski</option><option value="en">🇬🇧 English</option><option value="de">🇩🇪 Deutsch</option>
                </select>
              </div>
            </div>
            <div><label style={lbl}>Napomena</label><textarea style={Object.assign({},inp,{height:65,resize:"vertical"})} value={pnap} onChange={function(e){setPnap(e.target.value);}}/></div>
          </div>
          
          {res && (
            <div style={Object.assign({},card,{marginBottom:14,background:"#fafbfc"})}>
              <div style={{fontSize:12,fontWeight:700,color:"#64748b",marginBottom:12}}>PREGLED PONUDE</div>
              <PonudaView printRef={ponudaRef} t={PREVODI[pjez]} naziv={naziv} kupac={pkupac} adr={padr} kon={pkon} kol={res.kesePoNalogu} c1={res.k1} uk={res.kn} nap={pnap}/>
            </div>
          )}
          
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <button style={{padding:"10px 20px",borderRadius:8,border:"none",background:"#7c3aed",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}} onClick={kreirajPonudu}>📄 Kreiraj ponudu</button>
            {aktivna && (
              <button style={{padding:"10px 20px",borderRadius:8,border:"none",background:"#dc2626",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",opacity:pdfLoading?0.7:1}} onClick={function(){downloadPDF(ponudaRef,"Ponuda-"+aktivna.broj);}}>
                {pdfLoading?"⏳ Generišem...":"⬇️ Preuzmi PDF"}
              </button>
            )}
          </div>
        </div>
      )}

      {ktab==="rez" && (
        !res ? <div style={Object.assign({},card,{textAlign:"center",padding:40,color:"#94a3b8"})}>Unesite podatke u Unos tab.</div> : (
          <div style={{display:"grid",gap:12}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {[
                ["Cena / 1000 kom",res.k1,"#059669"],
                ["Cena / kg",res.kkg,"#059669"],
                ["Ukupno nalog",res.kn,"#1d4ed8"]
              ].map(function(x){
                return (
                  <div key={x[0]} style={Object.assign({},card,{background:x[2]+"10",border:"1.5px solid "+x[2]+"30"})}>
                    <div style={{fontSize:9,color:"#64748b",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{x[0]}</div>
                    <div style={{fontSize:18,fontWeight:900,color:x[2]}}>{eu(x[1])}</div>
                  </div>
                );
              })}
            </div>
            
            <div style={card}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>📦 Podaci o proizvodnji</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:8}}>
                {[
                  ["Površina kese",res.povrsinaKese.toFixed(4)+" m²","#7c3aed"],
                  ["Težina kese",res.tezinaKese.toFixed(2)+" g","#1d4ed8"],
                  ["Ukupno m²",res.ukM2.toFixed(1)+" m²","#059669"],
                  ["Ukupno kg",res.ukKg.toFixed(1)+" kg","#059669"],
                  ["Broj kesa",res.kesePoNalogu.toLocaleString()+" kom","#64748b"]
                ].map(function(x){
                  return (
                    <div key={x[0]} style={{background:x[2]+"10",border:"1px solid "+x[2]+"30",borderRadius:8,padding:"10px 12px"}}>
                      <div style={{fontSize:9,color:"#64748b",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{x[0]}</div>
                      <div style={{fontSize:16,fontWeight:800,color:x[2]}}>{x[1]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
