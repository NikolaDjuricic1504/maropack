import { masine } from '../lib/demoData.js';
export default function PlanProizvodnje({nalozi,setNalozi,msg}){
  return <div className="grid cards">{masine.map(m=><div className="card" key={m}><h3>{m}</h3><div className="timeline">{nalozi.filter(n=>n.masina===m).map(n=><div className="slot" key={n.id}><b>{n.br}</b><div>{n.proizvod}</div><small>{n.status}</small></div>)}<select onChange={e=>{const id=e.target.value;if(!id)return;setNalozi(nalozi.map(n=>n.id===id?{...n,masina:m}:n));msg('Nalog prebačen na '+m)}}><option value="">Dodaj nalog na mašinu</option>{nalozi.map(n=><option key={n.id} value={n.id}>{n.br} - {n.proizvod}</option>)}</select></div></div>)}</div>
}
