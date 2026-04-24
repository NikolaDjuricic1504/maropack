import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { radnici, masine } from '../lib/demoData.js';
export default function QRPracenje({nalozi,msg}){
  const [qr,setQr]=useState(''); const [nalog,setNalog]=useState(nalozi[0]?.br||'');
  useEffect(()=>{QRCode.toDataURL(`${location.origin}/?nalog=${nalog}`).then(setQr)},[nalog]);
  return <div className="grid"><div className="card row"><div><div className="label">Nalog za QR</div><select value={nalog} onChange={e=>setNalog(e.target.value)}>{nalozi.map(n=><option key={n.id}>{n.br}</option>)}</select></div><div>{qr&&<img src={qr} width="140"/>}</div></div><div className="card"><h3>Ekran posle skeniranja</h3><div className="row"><select>{radnici.map(r=><option key={r}>{r}</option>)}</select><select>{masine.map(m=><option key={m}>{m}</option>)}</select></div><br/><button className="primary" onClick={()=>msg('Početak rada evidentiran')}>Početak</button> <button className="primary green" onClick={()=>msg('Završetak rada evidentiran')}>Završeno</button></div></div>
}
