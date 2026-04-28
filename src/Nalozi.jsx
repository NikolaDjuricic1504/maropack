export default function Nalozi({nalozi}){
  return <div className="card">
    {nalozi.map(n=><div key={n.id}><b>{n.br}</b> {n.proizvod}</div>)}
  </div>
}