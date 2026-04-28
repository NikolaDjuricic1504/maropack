import {useState} from 'react';
export default function AIponuda({add}){
  const [text,setText]=useState('');
  return <div className="card">
    <textarea value={text} onChange={e=>setText(e.target.value)} />
    <button className="nav" onClick={()=>add({naziv:'AI proizvod',kg:1000,cena:5,trosak:3})}>AI → Nalog</button>
  </div>
}