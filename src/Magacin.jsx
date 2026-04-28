export default function Magacin({magacin,setMagacin}){
  return <div className="card">
    <button className="nav" onClick={()=>setMagacin([{id:Date.now(),materijal:'BOPP',kg:1000},...magacin])}>+ Dodaj</button>
    {magacin.map(m=><div key={m.id}>{m.materijal} {m.kg}kg</div>)}
  </div>
}