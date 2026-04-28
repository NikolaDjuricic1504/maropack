export default function Dashboard({nalozi,magacin,otpad}){
  const aktivni=nalozi.filter(n=>!['Završen','Isporučen'].includes(n.status)).length;
  const profit=nalozi.reduce((s,n)=>s+(n.cena-n.trosak),0);
  const kg=magacin.reduce((s,m)=>s+m.kg,0);
  const rez=magacin.reduce((s,m)=>s+m.rezervisano,0);
  return <div className="grid">
    <div className="grid cards">
      <div className="card"><div className="label">Aktivni nalozi</div><div className="kpi">{aktivni}</div></div>
      <div className="card"><div className="label">Ukupno kg u magacinu</div><div className="kpi">{kg.toLocaleString()}</div></div>
      <div className="card"><div className="label">Rezervisano kg</div><div className="kpi">{rez.toLocaleString()}</div></div>
      <div className="card"><div className="label">Profit naloga</div><div className="kpi">{profit.toLocaleString()} €</div></div>
    </div>
    <div className="card"><h3>Tok sistema</h3><p>Kalkulacija → nalog → rezervacija materijala → plan proizvodnje → QR praćenje → potrošnja → otpad/profit.</p></div>
  </div>
}
