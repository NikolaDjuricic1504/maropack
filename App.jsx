import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase.js";

const MAT_DATA = {
  "BOPP": [5,10,15,18,20,25,28,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100,105,110,115,120,125,130].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP SEDEF": [5,10,15,20,25,30,35,38,40,45,60,65,70,75,80,85,90,95,100,105,110,115,120,125,130,135,140].map(d=>({d,t:+(d*0.65).toFixed(2)})),
  "BOPP BELI": [5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100,105,110,115,120,125,130,135].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "LDPE": [10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100,105,110,115,120,125,130,135,140].map(d=>({d,t:+(d*0.925).toFixed(2)})),
  "CPP": [5,10,15,18,20,25,28,30,35,40,45,50,70,75].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "PET": [12,15,19,20,21,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58].map(d=>({d,t:+(d*1.4).toFixed(2)})),
  "OPA": [12,15,20,25,30,35,40,52,58,64,70,76,82,88,94,100,106,112,118,124,130,136,142,148,154,160,166].map((d,i)=>({d,t:i<7?+(d*1.1).toFixed(2):+(d*1.21).toFixed(2)})),
  "OPP": [5,10,15,18,20,25,30,35,40,45,50,55,60,65,70].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "PE": [20,25,30,35,40,45,50,55,60,70,80,90,100,120].map(d=>({d,t:+(d*0.92).toFixed(2)})),
  "ALU": [6,7,8,9,12,15,20,25,30].map(d=>({d,t:+(d*2.7).toFixed(2)})),
  "PA/PE koestruzija": [20,25,30,35,40,50,60,70,80,90,100].map(d=>({d,t:+(d*1.0).toFixed(2)})),
  "Papir sigmakraft": [40,50,60,70,80,90,100,120].map(d=>({d,t:+d.toFixed(2)})),
};
const CENE = {"BOPP":3.1,"BOPP SEDEF":3.5,"BOPP BELI":3.2,"LDPE":1.8,"CPP":2.2,"PET":3.5,"OPA":4.0,"OPP":2.9,"PE":1.7,"ALU":7.5,"PA/PE koestruzija":1.8,"Papir sigmakraft":2.7};
const USERS = [
  {id:1,ime:"Admin",uloga:"admin",pass:"admin123"},
  {id:2,ime:"Marko",uloga:"radnik",pass:"marko123"},
  {id:3,ime:"Jelena",uloga:"radnik",pass:"jelena123"},
  {id:4,ime:"Stefan",uloga:"radnik",pass:"stefan123"},
  {id:5,ime:"Ana",uloga:"radnik",pass:"ana123"},
  {id:6,ime:"Nikola",uloga:"radnik",pass:"nikola123"},
];
const PREVODI = {
  sr:{ponuda:"PONUDA",br:"Broj",dat:"Datum",vaz:"Važi do",kup:"Kupac",adr:"Adresa",kon:"Kontakt",naz:"Naziv proizvoda",kol:"Količina (m)",jc:"Cena €/1000m",uk:"Ukupno €",nap:"Napomena",pot:"Ovlašćeno lice",pdv:"PDV nije uključen",hv:"Hvala na poverenju!",pl:"Plaćanje: 30 dana od fakture."},
  en:{ponuda:"QUOTATION",br:"Number",dat:"Date",vaz:"Valid until",kup:"Customer",adr:"Address",kon:"Contact",naz:"Product name",kol:"Quantity (m)",jc:"Unit price €/1000m",uk:"Total €",nap:"Note",pot:"Authorized person",pdv:"VAT not included",hv:"Thank you for your business!",pl:"Payment: 30 days from invoice."},
  de:{ponuda:"ANGEBOT",br:"Nummer",dat:"Datum",vaz:"Gültig bis",kup:"Kunde",adr:"Adresse",kon:"Kontakt",naz:"Produktname",kol:"Menge (m)",jc:"Einzelpreis €/1000m",uk:"Gesamt €",nap:"Bemerkung",pot:"Bevollmächtigte Person",pdv:"MwSt. nicht enthalten",hv:"Vielen Dank!",pl:"Zahlung: 30 Tage nach Rechnung."},
};
const BOJE = ["#1d4ed8","#7c3aed","#0891b2","#059669"];
const SLOJ = ["A","B","C","D"];
const EM = {tip:"",deb:"",cena:"",stamp:false,kas:0,lak:0};
const f2 = v => isNaN(v) ? "—" : (+v).toFixed(2).replace(".",",");
const f4 = v => isNaN(v) ? "—" : (+v).toFixed(4).replace(".",",");
const eu = v => f2(v)+" €";
const dnow = () => new Date().toLocaleDateString("sr-RS");
const nbr = () => "MP-"+new Date().getFullYear()+"-"+String(Math.floor(Math.random()*9000)+1000);

function Counter({val,set,max,lab,col}) {
  return (
    <div>
      <div style={{fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>{lab}</div>
      <div style={{display:"flex",border:"1px solid #e2e8f0",borderRadius:8,overflow:"hidden",background:"#f8fafc"}}>
        <button onClick={function(){set(Math.max(0,val-1));}} style={{width:32,height:36,border:"none",background:"transparent",cursor:"pointer",fontSize:16,color:"#94a3b8",fontWeight:700}}>-</button>
        <div style={{flex:1,textAlign:"center",fontSize:14,fontWeight:700,padding:"6px 0",color:val>0?col:"#cbd5e1",background:val>0?col+"15":"transparent",borderLeft:"1px solid #e2e8f0",borderRight:"1px solid #e2e8f0"}}>{val}x</div>
        <button onClick={function(){set(Math.min(max,val+1));}} style={{width:32,height:36,border:"none",background:"transparent",cursor:"pointer",fontSize:16,color:"#94a3b8",fontWeight:700}}>+</button>
      </div>
    </div>
  );
}

function Notif({msg,tip}) {
  return (
    <div style={{position:"fixed",top:20,right:20,zIndex:9999,background:tip==="err"?"#fef2f2":"#f0fdf4",border:"1px solid "+(tip==="err"?"#fecaca":"#bbf7d0"),color:tip==="err"?"#ef4444":"#16a34a",borderRadius:10,padding:"12px 20px",fontWeight:600,fontSize:13,boxShadow:"0 4px 20px rgba(0,0,0,0.1)"}}>
      {msg}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dash");
  const [db, setDb] = useState({proizvodi:[],ponude:[],nalozi:[]});
  const [notif, setNotif] = useState(null);

  // Login
  const [lIme, setLIme] = useState("");
  const [lPass, setLPass] = useState("");
  const [lErr, setLErr] = useState("");

  // Kalkulator
  const [mats, setMats] = useState([Object.assign({},EM)]);
  const [naziv, setNaziv] = useState("");
  const [sir, setSir] = useState(85);
  const [met, setMet] = useState(1000);
  const [nal, setNal] = useState(120);
  const [sk, setSk] = useState(10);
  const [mar, setMar] = useState(40);
  const [pKas, setPKas] = useState(0.03);
  const [pSt, setPSt] = useState(1.35);
  const [pLakU, setPLakU] = useState(1.1);
  const [pTr, setPTr] = useState(0.3);
  const [pPak, setPPak] = useState(0.2);
  const [plep, setPlep] = useState(0.002);
  const [plak, setPlak] = useState(0.0012);
  const [clep, setClep] = useState(6);
  const [clak, setClak] = useState(6);
  const [ktab, setKtab] = useState("unos");
  const [res, setRes] = useState(null);

  // Ponuda forma
  const [pkupac, setPkupac] = useState("");
  const [padr, setPadr] = useState("");
  const [pkon, setPkon] = useState("");
  const [pnap, setPnap] = useState("");
  const [pjez, setPjez] = useState("sr");
  const [aktivna, setAktivna] = useState(null);

  // Pregled
  const [pregNalog, setPregNalog] = useState(null);
  const [pregPonuda, setPregPonuda] = useState(null);
  const [stampa, setStampa] = useState(null); // {nalog, tip: 'pdf'|'perforacija'|'kesa'}
  const [uploading, setUploading] = useState(null); // id naloga

  const msg = useCallback(function(m,t) {
    setNotif({msg:m,tip:t||"ok"});
    setTimeout(function(){setNotif(null);},3000);
  },[]);

  // KALKULATOR
  const calc = useCallback(function() {
    var vm = mats.filter(function(m){return m.tip && m.deb;});
    if(!vm.length || !sir || !met){setRes(null);return;}
    var W = +sir/1000;
    var M = +met;
    var MN = +nal;
    var kas = vm.reduce(function(s,m){return s+(+m.kas||0);},0);
    var lak = vm.reduce(function(s,m){return s+(+m.lak||0);},0);
    var det = vm.map(function(m) {
      var arr = MAT_DATA[m.tip]||[];
      var found = null;
      for(var i=0;i<arr.length;i++){if(arr[i].d===+m.deb){found=arr[i];break;}}
      var tg = found ? found.t : 0;
      var tkg = (W*M*tg)/1000;
      var c = +m.cena || CENE[m.tip] || 0;
      return Object.assign({},m,{tg:tg,tkg:tkg,c:c,uk:tkg*c});
    });
    var ukM = det.reduce(function(s,m){return s+m.uk;},0);
    var ukK = det.reduce(function(s,m){return s+m.tkg;},0);
    var ukLep = +plep*kas*+clep;
    var ukLakM = +plak*(W*M)*lak*+clak;
    var ukKas = kas*+pKas*W*M;
    var stMat = null;
    for(var i=0;i<det.length;i++){if(det[i].stamp){stMat=det[i];break;}}
    var ukSt = stMat ? stMat.tkg*+pSt : 0;
    var ukLakU = det.reduce(function(s,m){return s+(m.lak>0?m.tkg*+pLakU:0);},0);
    var ukTr = +pTr*ukK;
    var ukPk = +pPak;
    var osn = ukM+ukLep+ukLakM+ukKas+ukSt+ukLakU+ukTr+ukPk;
    var sas = osn*(1+(+sk/100));
    var pun = sas*MN;
    var mf = 1+(+mar/100);
    var k1 = sas*mf;
    var kkg = ukK>0 ? (pun/(ukK*MN))*mf : 0;
    var kn = pun*mf;
    setRes({det:det,ukM:ukM,ukK:ukK,ukLep:ukLep,ukLakM:ukLakM,ukKas:ukKas,ukSt:ukSt,ukLakU:ukLakU,ukTr:ukTr,ukPk:ukPk,kas:kas,lak:lak,osn:osn,sas:sas,pun:pun,k1:k1,kkg:kkg,kn:kn});
  },[mats,sir,met,nal,sk,mar,pKas,pSt,pLakU,pTr,pPak,plep,plak,clep,clak]);

  useEffect(function(){calc();},[calc]);

  // SUPABASE - ucitavanje i real-time sync
  useEffect(function(){
    if(!user) return;
    // Inicijalno ucitavanje
    async function loadData(){
      try {
        const [p, po, na] = await Promise.all([
          supabase.from('proizvodi').select('*').order('created_at',{ascending:false}),
          supabase.from('ponude').select('*').order('created_at',{ascending:false}),
          supabase.from('nalozi').select('*').order('created_at',{ascending:false}),
        ]);
        setDb({
          proizvodi: p.data || [],
          ponude: po.data || [],
          nalozi: na.data || []
        });
      } catch(e) { console.error('Load error:', e); }
    }
    loadData();

    // Real-time subscription
    const ch = supabase.channel('maropack-changes')
      .on('postgres_changes',{event:'*',schema:'public',table:'proizvodi'},function(){loadData();})
      .on('postgres_changes',{event:'*',schema:'public',table:'ponude'},function(){loadData();})
      .on('postgres_changes',{event:'*',schema:'public',table:'nalozi'},function(){loadData();})
      .subscribe();

    return function(){ supabase.removeChannel(ch); };
  },[user]);

  function updM(i,f,v) {
    setMats(function(p){
      var n=p.slice();
      n[i]=Object.assign({},n[i]);
      n[i][f]=v;
      if(f==="tip"){n[i].deb="";n[i].cena=CENE[v]||"";}
      return n;
    });
  }
  function addM(){if(mats.length<4)setMats(function(p){return p.concat([Object.assign({},EM)]);});}
  function delM(i){if(mats.length>1)setMats(function(p){return p.filter(function(_,j){return j!==i;});});}

  async function sacuvaj() {
    if(!res||!naziv.trim()){msg("Unesite naziv proizvoda!","err");return;}
    var p={naziv:naziv,sir:sir,met:met,nal:nal,sk:sk,mar:mar,mats:mats.slice(),res:Object.assign({},res),datum:dnow(),ko:user.ime};
    try {
      const {error} = await supabase.from('proizvodi').insert([p]);
      if(error) throw error;
      msg("Proizvod sacuvan!");
    } catch(e) { msg("Greska: "+e.message,"err"); }
  }

  async function kreirajPonudu() {
    if(!res||!naziv.trim()){msg("Najpre zavrsiti kalkulaciju!","err");return;}
    if(!pkupac.trim()){msg("Unesite naziv kupca!","err");return;}
    var p={broj:nbr(),datum:dnow(),vaz:new Date(Date.now()+30*24*3600000).toLocaleDateString("sr-RS"),kupac:pkupac,adr:padr,kon:pkon,naziv:naziv,kol:+nal*1000,c1:res.k1,uk:res.kn,mats:mats.filter(function(m){return m.tip&&m.deb;}),nap:pnap,jez:pjez,status:"Aktivna",ko:user.ime,res:Object.assign({},res)};
    try {
      const {data,error} = await supabase.from('ponude').insert([p]).select();
      if(error) throw error;
      setAktivna(data[0]);
      msg("Ponuda kreirana!");
    } catch(e) { msg("Greska: "+e.message,"err"); }
  }

  async function kreirajNaloge(pon) {
    var vm = pon.mats;
    var brKas = vm.reduce(function(s,m){return s+(+m.kas||0);},0);
    var brLak = vm.reduce(function(s,m){return s+(+m.lak||0);},0);
    var hasSt = vm.some(function(m){return m.stamp;});
    var tipovi = [];
    tipovi.push({tip:"mag",naziv:"Nalog za materijal",ik:"box",boj:"#f59e0b"});
    if(hasSt) tipovi.push({tip:"st",naziv:"Nalog za stampu",ik:"print",boj:"#3b82f6"});
    for(var i=1;i<=brKas;i++) tipovi.push({tip:"kas"+i,naziv:"Nalog za kasiranje "+i,ik:"link",boj:"#1d4ed8"});
    tipovi.push({tip:"rez",naziv:"Nalog za rezanje",ik:"cut",boj:"#6366f1"});
    tipovi.push({tip:"perf",naziv:"Nalog za perforaciju",ik:"circle",boj:"#8b5cf6"});
    if(brLak>0) tipovi.push({tip:"lak",naziv:"Nalog za lakiranje",ik:"star",boj:"#7c3aed"});
    var novi = tipovi.map(function(t){
      return {ponBr:pon.broj,ponId:pon.id,kupac:pon.kupac,prod:pon.naziv,naziv:t.naziv,ik:t.ik,boj:t.boj,status:"Ceka",datum:dnow(),radnik:"",nap:"",kol:pon.kol,mats:pon.mats};
    });
    try {
      const {error:e1} = await supabase.from('nalozi').insert(novi);
      if(e1) throw e1;
      const {error:e2} = await supabase.from('ponude').update({status:"Odobrena"}).eq('id',pon.id);
      if(e2) throw e2;
      msg("Kreirano "+novi.length+" radnih naloga!");
      setPage("nalozi");
    } catch(e) { msg("Greska: "+e.message,"err"); }
  }

  async function updN(id,f,v) {
    try {
      const {error} = await supabase.from('nalozi').update({[f]:v}).eq('id',id);
      if(error) throw error;
    } catch(e) { msg("Greska: "+e.message,"err"); }
  }

  async function uploadFajl(nalogId, tipFajla, file) {
    if(!file) return;
    setUploading(nalogId+"_"+tipFajla);
    try {
      const ext = file.name.split('.').pop();
      const path = "nalog_"+nalogId+"/"+tipFajla+"_"+Date.now()+"."+ext;
      const {error:upErr} = await supabase.storage.from('maropack-files').upload(path, file);
      if(upErr) throw upErr;
      const {data:urlData} = supabase.storage.from('maropack-files').getPublicUrl(path);
      const url = urlData.publicUrl;
      const kolona = "link_"+tipFajla;
      const {error:dbErr} = await supabase.from('nalozi').update({[kolona]:url}).eq('id',nalogId);
      if(dbErr) throw dbErr;
      // Takodje sacuvaj u proizvode (ako proizvod sa tim nazivom postoji)
      msg("Fajl uploadovan!");
    } catch(e) { msg("Greska upload: "+e.message,"err"); }
    setUploading(null);
  }

  async function obrisiFajl(nalogId, tipFajla) {
    try {
      const kolona = "link_"+tipFajla;
      const {error} = await supabase.from('nalozi').update({[kolona]:null}).eq('id',nalogId);
      if(error) throw error;
      msg("Fajl obrisan");
    } catch(e) { msg("Greska: "+e.message,"err"); }
  }

  async function odbijPonudu(id) {
    try {
      const {error} = await supabase.from('ponude').update({status:"Odbijena"}).eq('id',id);
      if(error) throw error;
      msg("Ponuda odbijena");
    } catch(e) { msg("Greska: "+e.message,"err"); }
  }

  // STILOVI
  var inp={width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13,color:"#1e293b",background:"#f8fafc",outline:"none",boxSizing:"border-box"};
  var card={background:"#fff",borderRadius:12,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,0.04)",border:"1px solid #e8edf3"};
  var lbl={fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:0.6,marginBottom:4,display:"block"};

  var SBJ = {
    "Ceka":"#f59e0b","U toku":"#3b82f6","Završeno":"#10b981",
    "Ceka_bg":"#fffbeb","U toku_bg":"#eff6ff","Završeno_bg":"#f0fdf4"
  };

  // IKONICE za naloge
  var ICONS = {"box":"📦","print":"🖨️","link":"🔗","cut":"✂️","circle":"🔵","star":"✨"};

  // LOGIN
  if(!user) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f172a,#1e3a5f)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{background:"#fff",borderRadius:20,padding:40,width:340,boxShadow:"0 25px 60px rgba(0,0,0,0.4)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:40}}>🏭</div>
          <div style={{fontSize:24,fontWeight:900,color:"#0f172a",letterSpacing:-0.5,marginTop:8}}>Maropack</div>
          <div style={{fontSize:12,color:"#64748b",marginTop:4}}>Sistem za upravljanje proizvodnjom</div>
        </div>
        <div style={{marginBottom:14}}>
          <label style={lbl}>Korisnicko ime</label>
          <input style={inp} value={lIme} onChange={function(e){setLIme(e.target.value);}} placeholder="Ime"/>
        </div>
        <div style={{marginBottom:20}}>
          <label style={lbl}>Lozinka</label>
          <input style={inp} type="password" value={lPass} onChange={function(e){setLPass(e.target.value);}} placeholder="Lozinka"/>
        </div>
        {lErr&&<div style={{color:"#ef4444",fontSize:12,marginBottom:12,textAlign:"center"}}>{lErr}</div>}
        <button style={{width:"100%",padding:12,borderRadius:8,border:"none",background:"#1d4ed8",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}} onClick={function(){
          var k=null;
          for(var i=0;i<USERS.length;i++){if(USERS[i].ime.toLowerCase()===lIme.toLowerCase()&&USERS[i].pass===lPass){k=USERS[i];break;}}
          if(k){setUser(k);setLErr("");}else{setLErr("Pogresno ime ili lozinka");}
        }}>Prijava</button>
        <div style={{marginTop:16,fontSize:11,color:"#94a3b8",textAlign:"center"}}>Demo: Admin/admin123</div>
      </div>
    </div>
  );

  var nav=[
    {k:"dash",l:"Dashboard",i:"📊"},
    {k:"kalk",l:"Kalkulator",i:"🧮"},
    {k:"ponude",l:"Ponude",i:"📄"},
    {k:"nalozi",l:"Radni nalozi",i:"🔧"},
    {k:"baza",l:"Baza proizvoda",i:"📦"},
  ];
  if(user.uloga==="admin") nav.push({k:"pod",l:"Podesavanja",i:"⚙️"});

  return (
    <div style={{minHeight:"100vh",background:"#f1f5f9",fontFamily:"'Segoe UI',system-ui,sans-serif",color:"#1e293b",display:"flex"}}>
      {notif && <Notif msg={notif.msg} tip={notif.tip}/>}
      {stampa && <PrintA4 data={stampa} onClose={function(){setStampa(null);}}/>}

      {/* SIDEBAR */}
      <div style={{width:210,background:"#0f172a",display:"flex",flexDirection:"column",flexShrink:0,minHeight:"100vh"}}>
        <div style={{padding:"22px 18px 18px",borderBottom:"1px solid #1e293b"}}>
          <div style={{fontSize:18,fontWeight:900,color:"#fff"}}>🏭 Maropack</div>
          <div style={{fontSize:10,color:"#475569",marginTop:2}}>Fleksibilna ambalaza</div>
        </div>
        <nav style={{padding:"10px 8px",flex:1}}>
          {nav.map(function(n){
            return (
              <button key={n.k} onClick={function(){setPage(n.k);}} style={{width:"100%",textAlign:"left",padding:"10px 12px",borderRadius:7,border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:10,marginBottom:2,fontSize:13,fontWeight:600,background:page===n.k?"#1d4ed8":"transparent",color:page===n.k?"#fff":"#94a3b8"}}>
                <span>{n.i}</span>{n.l}
              </button>
            );
          })}
        </nav>
        <div style={{padding:"14px 18px",borderTop:"1px solid #1e293b"}}>
          <div style={{fontSize:12,color:"#94a3b8",marginBottom:6}}>{user.ime} · {user.uloga==="admin"?"Admin":"Radnik"}</div>
          <button onClick={function(){setUser(null);setLIme("");setLPass("");}} style={{fontSize:11,padding:"5px 12px",borderRadius:6,border:"1px solid #334155",background:"transparent",color:"#94a3b8",cursor:"pointer"}}>Odjava</button>
        </div>
      </div>

      {/* SADRZAJ */}
      <div style={{flex:1,overflow:"auto",padding:22}}>

        {/* DASHBOARD */}
        {page==="dash" && (
          <div>
            <h2 style={{margin:"0 0 18px",fontSize:20,fontWeight:800}}>Dashboard</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginBottom:20}}>
              {[
                ["Proizvodi",db.proizvodi.length,"📦","#1d4ed8"],
                ["Akt. ponude",db.ponude.filter(function(p){return p.status==="Aktivna";}).length,"📄","#7c3aed"],
                ["Otv. nalozi",db.nalozi.filter(function(n){return n.status!=="Završeno";}).length,"🔧","#f59e0b"],
                ["Zavrseni",db.nalozi.filter(function(n){return n.status==="Završeno";}).length,"✅","#10b981"],
              ].map(function(item){
                return (
                  <div key={item[0]} style={Object.assign({},card,{borderLeft:"4px solid "+item[3]})}>
                    <div style={{fontSize:26,marginBottom:6}}>{item[2]}</div>
                    <div style={{fontSize:28,fontWeight:800,color:item[3]}}>{item[1]}</div>
                    <div style={{fontSize:12,color:"#64748b"}}>{item[0]}</div>
                  </div>
                );
              })}
            </div>
            {db.nalozi.length===0 ? (
              <div style={Object.assign({},card,{textAlign:"center",padding:50,color:"#94a3b8"})}>
                <div style={{fontSize:40,marginBottom:10}}>🚀</div>
                <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>Dobrodosli u Maropack!</div>
                <div style={{fontSize:13}}>Idite na Kalkulator da kreirate prvu kalkulaciju.</div>
              </div>
            ) : (
              <div style={card}>
                <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>🔧 Poslednji nalozi</div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr style={{borderBottom:"2px solid #e2e8f0"}}>
                    {["Ponuda","Kupac","Nalog","Status","Datum"].map(function(h){return <th key={h} style={{padding:"8px",textAlign:"left",color:"#64748b",fontWeight:600}}>{h}</th>;})}
                  </tr></thead>
                  <tbody>
                    {db.nalozi.slice(-6).reverse().map(function(n){
                      return (
                        <tr key={n.id} style={{borderBottom:"1px solid #f1f5f9"}}>
                          <td style={{padding:"9px 8px",fontWeight:600,color:"#1d4ed8"}}>{n.ponBr}</td>
                          <td style={{padding:"9px 8px"}}>{n.kupac}</td>
                          <td style={{padding:"9px 8px"}}>{ICONS[n.ik]} {n.naziv}</td>
                          <td style={{padding:"9px 8px"}}>
                            <span style={{background:SBJ[n.status+"_bg"]||"#f8fafc",color:SBJ[n.status]||"#64748b",borderRadius:6,padding:"2px 8px",fontWeight:700,fontSize:11}}>{n.status}</span>
                          </td>
                          <td style={{padding:"9px 8px",color:"#64748b"}}>{n.datum}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* KALKULATOR */}
        {page==="kalk" && (
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
              <h2 style={{margin:0,fontSize:20,fontWeight:800}}>🧮 Kalkulator</h2>
              <div style={{display:"flex",gap:6}}>
                {[["unos","📋 Unos"],["param","⚙️ Parametri"],["pon","📄 Ponuda"],["rez","📊 Rezultati"]].map(function(t){
                  return (
                    <button key={t[0]} onClick={function(){setKtab(t[0]);}} style={{padding:"7px 14px",borderRadius:7,border:ktab===t[0]?"none":"1px solid #e2e8f0",cursor:"pointer",fontSize:12,fontWeight:700,background:ktab===t[0]?"#1d4ed8":"#fff",color:ktab===t[0]?"#fff":"#64748b"}}>
                      {t[1]}
                    </button>
                  );
                })}
              </div>
            </div>

            {ktab==="unos" && (
              <div>
                <div style={Object.assign({},card,{marginBottom:14})}>
                  <label style={lbl}>Naziv proizvoda</label>
                  <input style={Object.assign({},inp,{fontSize:14,fontWeight:600})} value={naziv} onChange={function(e){setNaziv(e.target.value);}} placeholder="npr. BOPP/ALU/PE laminat 85mm"/>
                </div>
                <div style={Object.assign({},card,{marginBottom:14})}>
                  <div style={{fontSize:14,fontWeight:700,marginBottom:12,display:"flex",alignItems:"center",flexWrap:"wrap",gap:8}}>
                    🧪 Sastav materijala
                    <span style={{marginLeft:"auto",fontSize:11,fontWeight:400,color:"#94a3b8"}}>{mats.filter(function(m){return m.tip;}).length}/4 sloja</span>
                    {res && res.kas>0 && <span style={{fontSize:11,background:"#eff6ff",color:"#1d4ed8",borderRadius:6,padding:"2px 8px",fontWeight:700}}>🔗 {res.kas}x kas.</span>}
                    {res && res.lak>0 && <span style={{fontSize:11,background:"#f5f3ff",color:"#7c3aed",borderRadius:6,padding:"2px 8px",fontWeight:700}}>✨ {res.lak}x lak.</span>}
                  </div>
                  {mats.map(function(m,i){
                    return (
                      <div key={i} style={{background:m.tip?BOJE[i]+"08":"#f8fafc",borderRadius:10,padding:14,border:"1.5px solid "+(m.tip?BOJE[i]+"30":"#e2e8f0"),marginBottom:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                          <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:22,height:22,borderRadius:5,background:BOJE[i],color:"#fff",fontSize:11,fontWeight:700}}>{SLOJ[i]}</span>
                          <span style={{fontWeight:700,fontSize:13,color:BOJE[i]}}>Materijal {SLOJ[i]}</span>
                          {mats.length>1 && <button onClick={function(){delM(i);}} style={{marginLeft:"auto",background:"#fef2f2",border:"1px solid #fecaca",color:"#ef4444",borderRadius:6,padding:"2px 8px",cursor:"pointer",fontSize:11,fontWeight:700}}>x Ukloni</button>}
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
                          <div>
                            <label style={lbl}>Tip materijala</label>
                            <select style={inp} value={m.tip} onChange={function(e){updM(i,"tip",e.target.value);}}>
                              <option value="">-- Izaberi --</option>
                              {Object.keys(MAT_DATA).map(function(k){return <option key={k} value={k}>{k}</option>;})}
                            </select>
                          </div>
                          <div>
                            <label style={lbl}>Debljina (µ)</label>
                            <select style={Object.assign({},inp,{color:m.tip?"#1e293b":"#94a3b8"})} value={m.deb} disabled={!m.tip} onChange={function(e){updM(i,"deb",e.target.value);}}>
                              <option value="">-- Izaberi --</option>
                              {(MAT_DATA[m.tip]||[]).map(function(o){return <option key={o.d} value={o.d}>{o.d}µ</option>;})}
                            </select>
                          </div>
                          <div>
                            <label style={lbl}>Spec. tezina g/m²</label>
                            <div style={Object.assign({},inp,{color:"#64748b",background:"#f1f5f9"})}>
                              {(function(){
                                if(!m.tip||!m.deb) return "—";
                                var arr=MAT_DATA[m.tip]||[];
                                for(var j=0;j<arr.length;j++){if(arr[j].d===+m.deb) return f2(arr[j].t)+" g/m²";}
                                return "—";
                              })()}
                            </div>
                          </div>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto 1fr",gap:10,alignItems:"start"}}>
                          <Counter val={m.kas} set={function(v){updM(i,"kas",v);}} max={3} lab="Kasiranje (prolazi)" col="#1d4ed8"/>
                          <Counter val={m.lak} set={function(v){updM(i,"lak",v);}} max={3} lab="Lakiranje (prolazi)" col="#7c3aed"/>
                          <div>
                            <label style={lbl}>Stampa</label>
                            <button onClick={function(){updM(i,"stamp",!m.stamp);}} style={{padding:"9px 12px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700,border:"1.5px solid "+(m.stamp?"#0891b2":"#e2e8f0"),background:m.stamp?"#ecfeff":"#fff",color:m.stamp?"#0891b2":"#94a3b8"}}>
                              🖨️ {m.stamp?"Da":"Ne"}
                            </button>
                          </div>
                          <div>
                            <label style={lbl}>Cena EUR/kg</label>
                            <input type="number" style={inp} value={m.cena} step={0.1} placeholder={String(CENE[m.tip]||"")} onChange={function(e){updM(i,"cena",e.target.value);}}/>
                            {m.tip && <div style={{fontSize:10,color:"#1d4ed8",marginTop:3}}>Baza: {CENE[m.tip]} EUR/kg</div>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {mats.length<4 && <button onClick={addM} style={{width:"100%",padding:10,borderRadius:8,border:"2px dashed #cbd5e1",background:"transparent",color:"#94a3b8",fontSize:13,cursor:"pointer"}}>+ Dodaj sloj</button>}
                </div>
                <div style={Object.assign({},card,{marginBottom:14})}>
                  <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>📐 Dimenzije i nalog</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12}}>
                    {[["Sirina mm",sir,setSir,1],["Metraza x1000m",met,setMet,100],["Nalog x1000m",nal,setNal,1],["Skart %",sk,setSk,0.5],["Marza %",mar,setMar,1]].map(function(item){
                      return (
                        <div key={item[0]}>
                          <label style={lbl}>{item[0]}</label>
                          <input type="number" style={inp} value={item[1]} step={item[3]} onChange={function(e){item[2](e.target.value);}}/>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {res && (
                  <div style={Object.assign({},card,{background:"linear-gradient(135deg,#eff6ff,#f0fdf4)",border:"1px solid #bfdbfe"})}>
                    <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:10,color:"#64748b",marginBottom:2,fontWeight:700}}>KONACNA CENA / 1.000m</div>
                        <div style={{fontSize:26,fontWeight:900,color:"#1d4ed8"}}>{eu(res.k1)}</div>
                      </div>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                        <button style={{padding:"9px 16px",borderRadius:8,border:"none",background:"#059669",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}} onClick={sacuvaj}>💾 Sacuvaj u bazu</button>
                        <button style={{padding:"9px 16px",borderRadius:8,border:"none",background:"#7c3aed",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}} onClick={function(){setKtab("pon");}}>📄 Napravi ponudu</button>
                        <button style={{padding:"9px 16px",borderRadius:8,border:"none",background:"#1d4ed8",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}} onClick={function(){setKtab("rez");}}>📊 Rezultati</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {ktab==="param" && (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div style={card}>
                  <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>🔗 Lepak i lak</div>
                  {[["Potrosak lepka kg/m²",plep,setPlep,0.0001],["Cena lepka EUR/kg",clep,setClep,0.1],["Potrosak laka kg/m²",plak,setPlak,0.0001],["Cena laka EUR/kg",clak,setClak,0.1]].map(function(x){
                    return <div key={x[0]} style={{marginBottom:10}}><label style={lbl}>{x[0]}</label><input type="number" style={inp} value={x[1]} step={x[3]} onChange={function(e){x[2](e.target.value);}}/></div>;
                  })}
                </div>
                <div style={card}>
                  <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>🏭 Usluge</div>
                  {[["Kasiranje EUR/m²",pKas,setPKas,0.01],["Stampanje EUR/kg",pSt,setPSt,0.05],["Lakiranje usluga EUR/kg",pLakU,setPLakU,0.05],["Transport EUR/kg",pTr,setPTr,0.01],["Pakovanje EUR fiksno",pPak,setPPak,0.01]].map(function(x){
                    return <div key={x[0]} style={{marginBottom:10}}><label style={lbl}>{x[0]}</label><input type="number" style={inp} value={x[1]} step={x[3]} onChange={function(e){x[2](e.target.value);}}/></div>;
                  })}
                </div>
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
                    <div>
                      <label style={lbl}>Jezik</label>
                      <select style={inp} value={pjez} onChange={function(e){setPjez(e.target.value);}}>
                        <option value="sr">🇷🇸 Srpski</option>
                        <option value="en">🇬🇧 English</option>
                        <option value="de">🇩🇪 Deutsch</option>
                      </select>
                    </div>
                  </div>
                  <div><label style={lbl}>Napomena</label><textarea style={Object.assign({},inp,{height:65,resize:"vertical"})} value={pnap} onChange={function(e){setPnap(e.target.value);}}/></div>
                </div>
                {res && (
                  <div style={Object.assign({},card,{marginBottom:14,background:"#fafbfc"})}>
                    <div style={{fontSize:12,fontWeight:700,color:"#64748b",marginBottom:12}}>PREGLED PONUDE</div>
                    <PonudaView t={PREVODI[pjez]} naziv={naziv} kupac={pkupac} adr={padr} kon={pkon} kol={+nal*1000} c1={res.k1} uk={res.kn} nap={pnap} mats={mats.filter(function(m){return m.tip&&m.deb;})}/>
                  </div>
                )}
                <div style={{display:"flex",gap:10}}>
                  <button style={{padding:"10px 20px",borderRadius:8,border:"none",background:"#7c3aed",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}} onClick={kreirajPonudu}>📄 Kreiraj ponudu</button>
                  {aktivna && (
                    <button style={{padding:"10px 20px",borderRadius:8,border:"none",background:"#059669",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}} onClick={function(){kreirajNaloge(aktivna);}}>🔧 Kreiraj radne naloge</button>
                  )}
                </div>
              </div>
            )}

            {ktab==="rez" && (
              !res ? <div style={Object.assign({},card,{textAlign:"center",padding:40,color:"#94a3b8"})}>Unesite materijale u Unos tab.</div> : (
                <div style={{display:"grid",gap:14}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                    {[["Cena 1000m",res.k1,"#1d4ed8"],["Mat. troskak/kg",res.kkg,"#7c3aed"],["Pun nalog",res.kn,"#059669"]].map(function(x){
                      return (
                        <div key={x[0]} style={{background:x[2]+"10",border:"1.5px solid "+x[2]+"30",borderRadius:12,padding:"16px 18px"}}>
                          <div style={{fontSize:10,color:"#64748b",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>{x[0]}</div>
                          <div style={{fontSize:22,fontWeight:900,color:x[2]}}>{eu(x[1])}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={card}>
                    <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>📊 Struktura troskova</div>
                    {[["Materijali",res.ukM],["Lepak",res.ukLep],["Lak mat.",res.ukLakM],["Kasiranje",res.ukKas],["Stampa",res.ukSt],["Lakiranje usl.",res.ukLakU],["Transport",res.ukTr],["Pakovanje",res.ukPk]].map(function(x){
                      var pct=res.osn>0?x[1]/res.osn*100:0;
                      return (
                        <div key={x[0]} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
                          <div style={{width:140,fontSize:12,color:"#64748b"}}>{x[0]}</div>
                          <div style={{flex:1,height:6,background:"#f1f5f9",borderRadius:3,overflow:"hidden"}}>
                            <div style={{height:"100%",background:"#1d4ed8",borderRadius:3,width:Math.max(pct,0.3)+"%"}}/>
                          </div>
                          <div style={{width:80,textAlign:"right",fontSize:12,fontWeight:600}}>{f4(x[1])} €</div>
                          <div style={{width:34,textAlign:"right",fontSize:10,color:"#94a3b8"}}>{pct.toFixed(0)}%</div>
                        </div>
                      );
                    })}
                    <div style={{borderTop:"2px solid #e2e8f0",paddingTop:8,marginTop:8,display:"flex",justifyContent:"space-between",fontWeight:700}}>
                      <span>OSNOVNA CENA</span><span style={{color:"#1d4ed8"}}>{f4(res.osn)} €</span>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* PONUDE */}
        {page==="ponude" && (
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
              <h2 style={{margin:0,fontSize:20,fontWeight:800}}>📄 Ponude</h2>
              <button style={{padding:"9px 18px",borderRadius:8,border:"none",background:"#1d4ed8",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}} onClick={function(){setPage("kalk");setKtab("pon");}}>+ Nova ponuda</button>
            </div>
            {pregPonuda ? (
              <div>
                <button onClick={function(){setPregPonuda(null);}} style={{padding:"8px 16px",borderRadius:8,border:"1.5px solid #1d4ed8",background:"transparent",color:"#1d4ed8",cursor:"pointer",fontWeight:700,fontSize:13,marginBottom:14}}>← Nazad</button>
                <div style={card}>
                  <PonudaView t={PREVODI[pregPonuda.jez||"sr"]} naziv={pregPonuda.naziv} kupac={pregPonuda.kupac} adr={pregPonuda.adr} kon={pregPonuda.kon} kol={pregPonuda.kol} c1={pregPonuda.c1} uk={pregPonuda.uk} nap={pregPonuda.nap} mats={pregPonuda.mats} broj={pregPonuda.broj} dat={pregPonuda.datum} vaz={pregPonuda.vaz}/>
                  {pregPonuda.status==="Aktivna" && (
                    <div style={{marginTop:18,paddingTop:18,borderTop:"1px solid #e2e8f0",display:"flex",gap:10}}>
                      <button style={{padding:"10px 18px",borderRadius:8,border:"none",background:"#059669",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}} onClick={function(){kreirajNaloge(pregPonuda);setPregPonuda(null);}}>🔧 Odobri i kreiraj naloge</button>
                      <button style={{padding:"10px 18px",borderRadius:8,border:"none",background:"#ef4444",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}} onClick={function(){odbijPonudu(pregPonuda.id);setPregPonuda(null);}}>✕ Odbij</button>
                    </div>
                  )}
                </div>
              </div>
            ) : db.ponude.length===0 ? (
              <div style={Object.assign({},card,{textAlign:"center",padding:50,color:"#94a3b8"})}>
                <div style={{fontSize:36,marginBottom:10}}>📄</div>
                <div>Nema ponuda. Kreirajte kroz Kalkulator.</div>
              </div>
            ) : (
              <div style={card}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr style={{borderBottom:"2px solid #e2e8f0"}}>
                    {["Broj","Kupac","Naziv","Kolicina","Ukupno","Status","Datum",""].map(function(h){return <th key={h} style={{padding:"9px 8px",textAlign:"left",color:"#64748b",fontWeight:600}}>{h}</th>;})}
                  </tr></thead>
                  <tbody>
                    {db.ponude.map(function(p){
                      var stBg=p.status==="Aktivna"?"#fef9c3":p.status==="Odobrena"?"#dcfce7":"#fee2e2";
                      var stCl=p.status==="Aktivna"?"#854d0e":p.status==="Odobrena"?"#166534":"#991b1b";
                      return (
                        <tr key={p.id} style={{borderBottom:"1px solid #f1f5f9"}}>
                          <td style={{padding:"9px 8px",fontWeight:700,color:"#1d4ed8"}}>{p.broj}</td>
                          <td style={{padding:"9px 8px",fontWeight:600}}>{p.kupac}</td>
                          <td style={{padding:"9px 8px",color:"#64748b",fontSize:12}}>{p.naziv}</td>
                          <td style={{padding:"9px 8px"}}>{(p.kol||0).toLocaleString()} m</td>
                          <td style={{padding:"9px 8px",fontWeight:700}}>{eu(p.uk)}</td>
                          <td style={{padding:"9px 8px"}}><span style={{background:stBg,color:stCl,borderRadius:6,padding:"2px 8px",fontWeight:700,fontSize:11}}>{p.status}</span></td>
                          <td style={{padding:"9px 8px",color:"#64748b"}}>{p.datum}</td>
                          <td style={{padding:"9px 8px"}}><button style={{padding:"5px 12px",borderRadius:6,border:"none",background:"#1d4ed8",color:"#fff",cursor:"pointer",fontSize:11,fontWeight:700}} onClick={function(){setPregPonuda(p);}}>Pregled</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* RADNI NALOZI */}
        {page==="nalozi" && (
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
              <h2 style={{margin:0,fontSize:20,fontWeight:800}}>🔧 Radni nalozi</h2>
              <div style={{fontSize:13,color:"#64748b"}}>{db.nalozi.filter(function(n){return n.status!=="Završeno";}).length} otvorenih / {db.nalozi.length} ukupno</div>
            </div>
            {pregNalog ? (
              <div>
                <button onClick={function(){setPregNalog(null);}} style={{padding:"8px 16px",borderRadius:8,border:"1.5px solid #1d4ed8",background:"transparent",color:"#1d4ed8",cursor:"pointer",fontWeight:700,fontSize:13,marginBottom:14}}>← Nazad</button>
                <div style={card}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:18}}>
                    <div>
                      <div style={{fontSize:20,marginBottom:4}}>{ICONS[pregNalog.ik]} {pregNalog.naziv}</div>
                      <div style={{fontSize:12,color:"#64748b"}}>Ponuda: <b>{pregNalog.ponBr}</b> · Kupac: <b>{pregNalog.kupac}</b></div>
                      <div style={{fontSize:12,color:"#64748b"}}>Proizvod: <b>{pregNalog.prod}</b> · Kolicina: <b>{(pregNalog.kol||0).toLocaleString()} m</b></div>
                    </div>
                    <select style={Object.assign({},inp,{width:"auto",fontWeight:700,color:SBJ[pregNalog.status]||"#64748b"})} value={pregNalog.status} onChange={function(e){var v=e.target.value;updN(pregNalog.id,"status",v);setPregNalog(function(p){return Object.assign({},p,{status:v});});}}>
                      {["Ceka","U toku","Završeno"].map(function(s){return <option key={s} value={s}>{s}</option>;})}
                    </select>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                    <div>
                      <label style={lbl}>Zaduzena osoba</label>
                      <select style={inp} value={pregNalog.radnik||""} onChange={function(e){var v=e.target.value;updN(pregNalog.id,"radnik",v);setPregNalog(function(p){return Object.assign({},p,{radnik:v});});}}>
                        <option value="">-- Izaberi --</option>
                        {USERS.filter(function(u){return u.uloga!=="admin";}).map(function(u){return <option key={u.id} value={u.ime}>{u.ime}</option>;})}
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>Napomena</label>
                      <input style={inp} value={pregNalog.nap||""} placeholder="Unesi napomenu..." onChange={function(e){var v=e.target.value;updN(pregNalog.id,"nap",v);setPregNalog(function(p){return Object.assign({},p,{nap:v});});}}/>
                    </div>
                  </div>
                  {pregNalog.mats && pregNalog.mats.length>0 && (
                    <div>
                      <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>📋 Materijali</div>
                      {pregNalog.mats.filter(function(m){return m.tip;}).map(function(m,i){
                        return (
                          <div key={i} style={{display:"flex",gap:14,padding:"9px 12px",background:"#f8fafc",borderRadius:8,marginBottom:5,fontSize:13}}>
                            <span style={{fontWeight:700,color:BOJE[i]}}>{SLOJ[i]}</span>
                            <span style={{fontWeight:600}}>{m.tip}</span>
                            <span style={{color:"#64748b"}}>{m.deb}µ</span>
                            {m.kas>0 && <span style={{color:"#1d4ed8"}}>🔗 {m.kas}x kasiranje</span>}
                            {m.lak>0 && <span style={{color:"#7c3aed"}}>✨ {m.lak}x lakiranje</span>}
                            {m.stamp && <span style={{color:"#0891b2"}}>🖨️ stampa</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* UPLOAD FAJLOVA */}
                  <div style={{marginTop:20,paddingTop:16,borderTop:"1px solid #e2e8f0"}}>
                    <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>📎 Dokumenti naloga</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                      {[
                        {tip:"pdf",naz:"PDF dokument",ik:"📄",col:"#dc2626"},
                        {tip:"perforacija",naz:"Perforacija",ik:"⚫",col:"#7c3aed"},
                        {tip:"kesa",naz:"Izgled kese",ik:"🛍️",col:"#059669"},
                      ].map(function(f){
                        var link = pregNalog["link_"+f.tip];
                        var upId = pregNalog.id+"_"+f.tip;
                        return (
                          <div key={f.tip} style={{background:link?f.col+"08":"#f8fafc",border:"1.5px solid "+(link?f.col+"40":"#e2e8f0"),borderRadius:10,padding:12}}>
                            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                              <span style={{fontSize:16}}>{f.ik}</span>
                              <span style={{fontWeight:700,fontSize:12}}>{f.naz}</span>
                            </div>
                            {link ? (
                              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                                <a href={link} target="_blank" rel="noopener" style={{fontSize:11,color:f.col,wordBreak:"break-all",textDecoration:"underline"}}>Otvori fajl ↗</a>
                                <div style={{display:"flex",gap:4}}>
                                  <button onClick={function(){setStampa({nalog:pregNalog,tip:f.tip,naz:f.naz,ik:f.ik,col:f.col,link:link});}} style={{flex:1,padding:"5px 8px",borderRadius:6,border:"none",background:f.col,color:"#fff",fontWeight:700,fontSize:10,cursor:"pointer"}}>🖨️ Stampaj A4</button>
                                  <button onClick={function(){obrisiFajl(pregNalog.id,f.tip);setPregNalog(function(p){var n=Object.assign({},p);n["link_"+f.tip]=null;return n;});}} style={{padding:"5px 8px",borderRadius:6,border:"1px solid #fecaca",background:"#fef2f2",color:"#ef4444",fontWeight:700,fontSize:10,cursor:"pointer"}}>✕</button>
                                </div>
                              </div>
                            ) : (
                              <label style={{display:"block",cursor:"pointer"}}>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{display:"none"}} onChange={function(e){
                                  var file = e.target.files[0];
                                  if(file){
                                    uploadFajl(pregNalog.id, f.tip, file).then(function(){
                                      // Osvezi pregledNalog iz db
                                      setTimeout(function(){
                                        supabase.from('nalozi').select('*').eq('id',pregNalog.id).single().then(function(r){
                                          if(r.data) setPregNalog(r.data);
                                        });
                                      },500);
                                    });
                                  }
                                }}/>
                                <div style={{padding:"8px 10px",borderRadius:6,border:"2px dashed #cbd5e1",textAlign:"center",fontSize:11,color:"#64748b"}}>
                                  {uploading===upId ? "⏳ Upload..." : "+ Dodaj fajl"}
                                </div>
                                <div style={{fontSize:9,color:"#94a3b8",marginTop:4,textAlign:"center"}}>PDF, JPG, PNG</div>
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : db.nalozi.length===0 ? (
              <div style={Object.assign({},card,{textAlign:"center",padding:50,color:"#94a3b8"})}>
                <div style={{fontSize:36,marginBottom:10}}>🔧</div>
                <div>Nema naloga. Odobrite ponudu da kreirate naloge.</div>
              </div>
            ) : (
              <div>
                {(function(){
                  var grupe = {};
                  db.nalozi.forEach(function(n){if(!grupe[n.ponBr])grupe[n.ponBr]=[];grupe[n.ponBr].push(n);});
                  return Object.keys(grupe).map(function(br){
                    var gr=grupe[br];
                    var zav=gr.filter(function(n){return n.status==="Završeno";}).length;
                    var pct=gr.length>0?(zav/gr.length)*100:0;
                    return (
                      <div key={br} style={Object.assign({},card,{marginBottom:14})}>
                        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12,paddingBottom:10,borderBottom:"1px solid #f1f5f9",flexWrap:"wrap"}}>
                          <span style={{fontWeight:800,fontSize:14,color:"#1d4ed8"}}>{br}</span>
                          <span style={{fontWeight:600,fontSize:13}}>{gr[0].kupac}</span>
                          <span style={{color:"#64748b",fontSize:12}}>{gr[0].prod}</span>
                          <span style={{marginLeft:"auto",fontSize:12,color:"#64748b"}}>{zav}/{gr.length} zavrseno</span>
                          <div style={{width:80,height:6,background:"#f1f5f9",borderRadius:3,overflow:"hidden"}}>
                            <div style={{height:"100%",background:"#10b981",borderRadius:3,width:pct+"%"}}/>
                          </div>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
                          {gr.map(function(n){
                            return (
                              <div key={n.id} onClick={function(){setPregNalog(n);}} style={{background:SBJ[n.status+"_bg"]||"#f8fafc",border:"1.5px solid "+(SBJ[n.status]||"#e2e8f0")+"40",borderRadius:10,padding:"11px 13px",cursor:"pointer"}}>
                                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                                  <span style={{fontSize:16}}>{ICONS[n.ik]}</span>
                                  <span style={{fontWeight:700,fontSize:12}}>{n.naziv}</span>
                                </div>
                                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                                  <span style={{background:(SBJ[n.status]||"#64748b")+"20",color:SBJ[n.status]||"#64748b",borderRadius:6,padding:"2px 7px",fontWeight:700,fontSize:10}}>{n.status}</span>
                                  {n.radnik && <span style={{fontSize:10,color:"#64748b"}}>{n.radnik}</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        )}

        {/* BAZA PROIZVODA */}
        {page==="baza" && (
          <div>
            <h2 style={{margin:"0 0 18px",fontSize:20,fontWeight:800}}>📦 Baza proizvoda</h2>
            {db.proizvodi.length===0 ? (
              <div style={Object.assign({},card,{textAlign:"center",padding:50,color:"#94a3b8"})}>
                <div style={{fontSize:36,marginBottom:10}}>📦</div>
                <div>Baza je prazna. Sacuvajte kalkulaciju da dodate proizvod.</div>
              </div>
            ) : (
              <div style={card}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr style={{borderBottom:"2px solid #e2e8f0"}}>
                    {["Naziv","Struktura","Sirina","Cena/1000m","Datum","Ko",""].map(function(h){return <th key={h} style={{padding:"9px 8px",textAlign:"left",color:"#64748b",fontWeight:600}}>{h}</th>;})}
                  </tr></thead>
                  <tbody>
                    {db.proizvodi.map(function(p){
                      return (
                        <tr key={p.id} style={{borderBottom:"1px solid #f1f5f9"}}>
                          <td style={{padding:"9px 8px",fontWeight:700}}>{p.naziv}</td>
                          <td style={{padding:"9px 8px",color:"#64748b",fontSize:11}}>{p.mats.filter(function(m){return m.tip;}).map(function(m){return m.tip+" "+m.deb+"µ";}).join(" / ")}</td>
                          <td style={{padding:"9px 8px"}}>{p.sir} mm</td>
                          <td style={{padding:"9px 8px",fontWeight:700,color:"#1d4ed8"}}>{eu(p.res.k1)}</td>
                          <td style={{padding:"9px 8px",color:"#64748b"}}>{p.datum}</td>
                          <td style={{padding:"9px 8px",color:"#64748b"}}>{p.ko}</td>
                          <td style={{padding:"9px 8px"}}>
                            <button style={{padding:"5px 12px",borderRadius:6,border:"none",background:"#1d4ed8",color:"#fff",cursor:"pointer",fontSize:11,fontWeight:700}} onClick={function(){setNaziv(p.naziv);setMats(p.mats);setSir(p.sir);setMet(p.met);setNal(p.nal);setSk(p.sk);setMar(p.mar);setPage("kalk");setKtab("unos");msg("Proizvod ucitan!");}}>Ucitaj</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PODESAVANJA */}
        {page==="pod" && user.uloga==="admin" && (
          <div>
            <h2 style={{margin:"0 0 18px",fontSize:20,fontWeight:800}}>⚙️ Podesavanja</h2>
            <div style={card}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>👥 Korisnici sistema</div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{borderBottom:"2px solid #e2e8f0"}}>
                  {["Ime","Uloga","Lozinka"].map(function(h){return <th key={h} style={{padding:"8px",textAlign:"left",color:"#64748b",fontWeight:600}}>{h}</th>;})}
                </tr></thead>
                <tbody>
                  {USERS.map(function(u){
                    return (
                      <tr key={u.id} style={{borderBottom:"1px solid #f1f5f9"}}>
                        <td style={{padding:"10px 8px",fontWeight:600}}>{u.ime}</td>
                        <td style={{padding:"10px 8px"}}>
                          <span style={{background:u.uloga==="admin"?"#fef3c7":"#dbeafe",color:u.uloga==="admin"?"#92400e":"#1e40af",borderRadius:6,padding:"2px 10px",fontWeight:700,fontSize:11}}>{u.uloga==="admin"?"Administrator":"Radnik"}</span>
                        </td>
                        <td style={{padding:"10px 8px",fontFamily:"monospace",color:"#94a3b8"}}>{u.pass}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function PrintA4({data, onClose}) {
  const nalog = data.nalog;
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(data.link);
  const isPdf = /\.pdf$/i.test(data.link);

  function print() {
    window.print();
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 210mm; min-height: 297mm; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.6)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflow:"auto"}}>
        <div style={{background:"#fff",borderRadius:12,maxWidth:900,width:"100%",maxHeight:"95vh",overflow:"auto",display:"flex",flexDirection:"column"}}>
          {/* Header - skriven pri stampanju */}
          <div className="no-print" style={{padding:"14px 20px",borderBottom:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"#fff",zIndex:1}}>
            <div style={{fontWeight:700,fontSize:14}}>A4 prikaz za štampu - {data.naz}</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={print} style={{padding:"8px 18px",borderRadius:8,border:"none",background:data.col,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>🖨️ Štampaj</button>
              <button onClick={onClose} style={{padding:"8px 14px",borderRadius:8,border:"1px solid #e2e8f0",background:"#fff",color:"#64748b",fontWeight:700,fontSize:13,cursor:"pointer"}}>✕ Zatvori</button>
            </div>
          </div>

          {/* A4 sadržaj */}
          <div className="print-area" style={{padding:"20mm 15mm",fontFamily:"'Segoe UI',system-ui,sans-serif",color:"#0f172a",width:"100%",boxSizing:"border-box",background:"#fff"}}>
            {/* Zaglavlje */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",paddingBottom:16,borderBottom:"3px solid "+data.col,marginBottom:20}}>
              <div>
                <div style={{fontSize:28,fontWeight:900,letterSpacing:-0.5}}>🏭 Maropack</div>
                <div style={{fontSize:11,color:"#64748b",marginTop:2}}>Fleksibilna ambalaža</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:18,fontWeight:800,color:data.col}}>{data.ik} {data.naz.toUpperCase()}</div>
                <div style={{fontSize:11,color:"#64748b",marginTop:4}}>{new Date().toLocaleDateString("sr-RS")}</div>
              </div>
            </div>

            {/* Podaci */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:20}}>
              <div style={{background:"#f8fafc",borderRadius:8,padding:"10px 14px",border:"1px solid #e2e8f0"}}>
                <div style={{fontSize:9,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>Broj naloga</div>
                <div style={{fontSize:16,fontWeight:900,color:data.col}}>{nalog.ponBr||"—"}</div>
              </div>
              <div style={{background:"#f8fafc",borderRadius:8,padding:"10px 14px",border:"1px solid #e2e8f0"}}>
                <div style={{fontSize:9,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>Kupac</div>
                <div style={{fontSize:14,fontWeight:700}}>{nalog.kupac||"—"}</div>
              </div>
              <div style={{background:"#f8fafc",borderRadius:8,padding:"10px 14px",border:"1px solid #e2e8f0"}}>
                <div style={{fontSize:9,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>Proizvod</div>
                <div style={{fontSize:14,fontWeight:700}}>{nalog.prod||nalog.naziv||"—"}</div>
              </div>
            </div>

            {/* Dokument */}
            <div style={{border:"1px solid #e2e8f0",borderRadius:10,overflow:"hidden",background:"#fafafa"}}>
              {isImage && (
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:400}}>
                  <img src={data.link} alt={data.naz} style={{maxWidth:"100%",maxHeight:"180mm",display:"block"}}/>
                </div>
              )}
              {isPdf && (
                <iframe src={data.link} style={{width:"100%",height:"180mm",border:"none"}} title={data.naz}/>
              )}
              {!isImage && !isPdf && (
                <div style={{padding:40,textAlign:"center",color:"#64748b"}}>
                  <div style={{fontSize:40,marginBottom:10}}>📄</div>
                  <a href={data.link} target="_blank" rel="noopener" style={{color:data.col}}>Otvori dokument u novom tabu</a>
                </div>
              )}
            </div>

            {/* Potpis sekcija */}
            <div style={{marginTop:20,display:"flex",justifyContent:"space-between",fontSize:10,color:"#64748b"}}>
              <div>Radnik: _____________________</div>
              <div>Potpis: _____________________</div>
              <div>Datum: {new Date().toLocaleDateString("sr-RS")}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function PonudaView({t,naziv,kupac,adr,kon,kol,c1,uk,nap,mats,broj,dat,vaz}) {
  var f2l = function(v){return isNaN(v)?"—":(+v).toFixed(2).replace(".",",");};
  return (
    <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:28,fontFamily:"'Segoe UI',serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,paddingBottom:16,borderBottom:"2px solid #1d4ed8"}}>
        <div>
          <div style={{fontSize:24,fontWeight:900,color:"#0f172a"}}>🏭 Maropack</div>
          <div style={{fontSize:11,color:"#64748b",marginTop:2}}>Fleksibilna ambalaza · Srbija</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:20,fontWeight:800,color:"#1d4ed8"}}>{t.ponuda}</div>
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
        <div style={{background:"#eff6ff",borderRadius:8,padding:"12px 14px"}}>
          <div style={{fontSize:9,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>{t.naz}</div>
          <div style={{fontWeight:700,fontSize:13}}>{naziv||"—"}</div>
          {mats && mats.filter(function(m){return m.tip;}).length>0 && (
            <div style={{fontSize:10,color:"#64748b",marginTop:3}}>{mats.filter(function(m){return m.tip;}).map(function(m){return m.tip+" "+(m.deb||m.debljina)+"µ";}).join(" / ")}</div>
          )}
        </div>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,marginBottom:16}}>
        <thead>
          <tr style={{background:"#1d4ed8",color:"#fff"}}>
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
            <td style={{padding:"10px",fontWeight:900,fontSize:15,textAlign:"right",color:"#1d4ed8"}}>{f2l(uk)} €</td>
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
