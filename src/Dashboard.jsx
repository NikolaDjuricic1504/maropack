export default function Dashboard({nalozi,magacin,otpad}){
  const aktivni=nalozi.filter(n=>!['Završen','Isporučen'].includes(n.status)).length;
  const profit=nalozi.reduce((s,n)=>s+(n.cena-n.trosak),0);
  const kg=magacin.reduce((s,m)=>s+m.kg,0);
  return <div className="grid cards">
    <div className="card"><div>Aktivni</div><div className="kpi">{aktivni}</div></div>
    <div className="card"><div>Kg</div><div className="kpi">{kg}</div></div>
    <div className="card"><div>Profit</div><div className="kpi">{profit}</div></div>
  </div>
}