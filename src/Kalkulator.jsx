import {useState} from 'react';
export default function Kalkulator({add}){
  const [naziv,setNaziv]=useState('Triplex'); const [kg,setKg]=useState(1000);
  const [cena,setCena]=useState(5); const [trosak,setTrosak]=useState(3);
  return <div className="card">
    <input value={naziv} onChange={e=>setNaziv(e.target.value)} />
    <input type="number" value={kg} onChange={e=>setKg(+e.target.value)} />
    <button className="nav" onClick={()=>add({naziv,kg,cena,trosak})}>Kreiraj nalog</button>
  </div>
}