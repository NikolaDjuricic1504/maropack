import {useState} from 'react';
import Dashboard from './Dashboard.jsx';
import Kalkulator from './Kalkulator.jsx';
import Magacin from './Magacin.jsx';
import Nalozi from './Nalozi.jsx';
import AIponuda from './AIponuda.jsx';

export default function App(){
  const [page,setPage]=useState('dashboard');
  const [nalozi,setNalozi]=useState([]);
  const [magacin,setMagacin]=useState([]);
  const [otpad,setOtpad]=useState([]);

  function add(data){
    const br='MP-'+Date.now();
    setNalozi([{id:crypto.randomUUID(),br,proizvod:data.naziv,status:'Kreiran',cena:data.cena*data.kg,trosak:data.trosak*data.kg},...nalozi]);
  }

  const render=()=>{
    if(page==='dashboard')return <Dashboard nalozi={nalozi} magacin={magacin} otpad={otpad}/>
    if(page==='kalk')return <Kalkulator add={add}/>
    if(page==='magacin')return <Magacin magacin={magacin} setMagacin={setMagacin}/>
    if(page==='nalozi')return <Nalozi nalozi={nalozi}/>
    if(page==='ai')return <AIponuda add={add}/>
  }

  return <div className="app">
    <div className="sidebar">
      <button className="nav" onClick={()=>setPage('dashboard')}>Dashboard</button>
      <button className="nav" onClick={()=>setPage('ai')}>AI</button>
      <button className="nav" onClick={()=>setPage('kalk')}>Kalkulator</button>
      <button className="nav" onClick={()=>setPage('nalozi')}>Nalozi</button>
      <button className="nav" onClick={()=>setPage('magacin')}>Magacin</button>
    </div>
    <div className="main">{render()}</div>
  </div>
}