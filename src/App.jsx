import { useMemo, useState } from 'react';
import { LayoutDashboard, Calculator, Boxes, Factory, QrCode, CalendarDays, Trash2, TrendingUp, FileDown, PackageCheck, ClipboardList, Smartphone } from 'lucide-react';
import Dashboard from './pages/Dashboard.jsx';
import Magacin from './pages/Magacin.jsx';
import Nalozi from './pages/Nalozi.jsx';
import PlanProizvodnje from './pages/PlanProizvodnje.jsx';
import QRPracenje from './pages/QRPracenje.jsx';
import OtpadProfit from './pages/OtpadProfit.jsx';
import Proizvodi from './pages/Proizvodi.jsx';
import MobileRadnik from './pages/MobileRadnik.jsx';
import Kalkulator from './pages/Kalkulator.jsx';
import ExportCentar from './pages/ExportCentar.jsx';
import { initialMagacin, initialNalozi } from './lib/demoData.js';

const menu = [
  ['dashboard','Dashboard',LayoutDashboard],['kalk','Kalkulator',Calculator],['magacin','Magacin',Boxes],['nalozi','Nalozi',Factory],['plan','Plan proizvodnje',CalendarDays],['qr','QR praćenje',QrCode],['otpad','Otpad i profit',TrendingUp],['proizvodi','Baza proizvoda',ClipboardList],['mobile','Mobile radnik',Smartphone],['export','Export',FileDown]
];

export default function App(){
  const [page,setPage] = useState('dashboard');
  const [nalozi,setNalozi] = useState(initialNalozi);
  const [magacin,setMagacin] = useState(initialMagacin);
  const [otpad,setOtpad] = useState([]);
  const [toast,setToast] = useState('');
  const msg = (m)=>{setToast(m); setTimeout(()=>setToast(''),2600)};
  const ctx = {nalozi,setNalozi,magacin,setMagacin,otpad,setOtpad,msg};
  const title = useMemo(()=>menu.find(m=>m[0]===page)?.[1] || 'Maropack ERP',[page]);
  const Page = {dashboard:Dashboard,kalk:Kalkulator,magacin:Magacin,nalozi:Nalozi,plan:PlanProizvodnje,qr:QRPracenje,otpad:OtpadProfit,proizvodi:Proizvodi,mobile:MobileRadnik,export:ExportCentar}[page];
  return <div className="app">
    <aside className="side"><div className="brand">MAROPACK ERP</div><div className="sub">Proizvodnja · magacin · QR · profit</div><nav className="nav">{menu.map(([id,label,Icon])=><button key={id} className={page===id?'active':''} onClick={()=>setPage(id)}><Icon size={18}/>{label}</button>)}</nav></aside>
    <main className="main"><div className="top"><h1>{title}</h1><span className="badge"><PackageCheck size={14}/> Demo full GitHub paket</span></div>{Page && <Page {...ctx}/>}</main>
    {toast && <div style={{position:'fixed',right:20,top:20,background:'#0f172a',color:'#fff',padding:'12px 18px',borderRadius:12,fontWeight:800}}>{toast}</div>}
  </div>
}
