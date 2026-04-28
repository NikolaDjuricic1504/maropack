import { useState } from 'react';
export default function Proizvodi(){
 const [items,setItems]=useState([{id:1,naziv:'Triplex Papir/ALU/PE 840mm',sastav:'Papir 50 + ALU 7 + PE 30',sirina:840},{id:2,naziv:'BOPP/PE 250mm',sastav:'BOPP 20 + PE 30',sirina:250}]);
 return <div className="grid"><div className="card"><button className="primary" onClick={()=>setItems([{id:Date.now(),naziv:'Novi proizvod',sastav:'BOPP 20',sirina:500},...items])}>+ Novi template proizvod</button></div><table><thead><tr><th>Naziv</th><th>Sastav</th><th>Širina</th><th>Standardi</th></tr></thead><tbody>{items.map(i=><tr key={i.id}><td>{i.naziv}</td><td>{i.sastav}</td><td>{i.sirina} mm</td><td>štampa · kasiranje · rezanje</td></tr>)}</tbody></table></div>
}
