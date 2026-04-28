// Magacin.jsx - PLACEHOLDER
// Magacin sa PDF parserom i QR kodovima

export default function Magacin({ msg, inp, card, lbl, user }) {
  return (
    <div style={card}>
      <h2>🏭 Magacin</h2>
      <p style={{color:"#64748b"}}>
        NAPOMENA: Uploaduj mi Magacin.jsx za kompletan prikaz.
        <br/>Treba da sadrži: PDF parser (Rossella format), QR kodove, MobilniMagacin.
      </p>
    </div>
  );
}

export function MobilniMagacin({ brRolne }) {
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"sans-serif"}}>
      <div>
        <h2>📦 Mobilni magacin</h2>
        <p>Rolna: {brRolne}</p>
      </div>
    </div>
  );
}
