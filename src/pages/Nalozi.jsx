import { statusi } from '../lib/demoData.js';
export default function Nalozi({nalozi,setNalozi,magacin,setMagacin,msg}){
  function status(id,st){
    setNalozi(nalozi.map(n=>n.id===id?{...n,status:st}:n));
    if(st==='Materijal rezervisan'){ setMagacin(magacin.map((m,i)=>i===0?{...m,rezervisano:m.rezervisano+100}:m)); msg('Materijal rezervisan'); }
    if(st==='Završen'){ setMagacin(magacin.map((m,i)=>i===0?{...m,kg:Math.max(0,m.kg-100),rezervisano:Math.max(0,m.rezervisano-100)}:m)); msg('Nalog završen, materijal skinut'); }
  }
  return <table><thead><tr><th>Broj</th><th>Kupac</th><th>Proizvod</th><th>Mašina</th><th>Status</th><th>Profit</th></tr></thead><tbody>{nalozi.map(n=><tr key={n.id}><td><b>{n.br}</b></td><td>{n.kupac}</td><td>{n.proizvod}</td><td>{n.masina}</td><td><select value={n.status} onChange={e=>status(n.id,e.target.value)}>{statusi.map(s=><option key={s}>{s}</option>)}</select></td><td>{(n.cena-n.trosak).toLocaleString()} €</td></tr>)}</tbody></table>
}
