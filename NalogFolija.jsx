import { useState } from "react";
import PlanRezanjaNalog from "./PlanRezanjaNalog.jsx";
import QRScanner from "./QRScanner.jsx";
import RadnikPanel from "./RadnikPanel.jsx";
import { proveriStartProizvodnje } from "./proizvodnjaLock.js";

export default function NalogFolija({ nalog, msg }) {
  const [tab, setTab] = useState("rez");
  const [qr, setQr] = useState("");
  const [rola, setRola] = useState(null);
  const [status, setStatus] = useState("");
  const [dozvola, setDozvola] = useState(false);

  async function startProizvodnja() {
    const res = await proveriStartProizvodnje(nalog, qr);

    if (!res.ok) {
      setStatus("❌ " + res.msg);
      setDozvola(false);
    } else {
      setStatus("✅ Dozvoljen rad");
      setRola(res.rola);
      setDozvola(true);
    }
  }

  return (
    <div style={{ padding: 20 }}>

      <h2>📄 Nalog: {nalog?.ponBr || "—"}</h2>

      {/* TAB */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setTab("rez")}>✂️ Rezanje</button>
        <button onClick={() => setTab("format")}>📦 Formatiranje</button>
        <button onClick={() => setTab("start")}>🔒 Start</button>
      </div>

      {/* ================= REZANJE ================= */}
      {tab === "rez" && (
        <div style={box}>
          <h3>✂️ Plan rezanja</h3>
          <PlanRezanjaNalog nalog={nalog} msg={msg} />
        </div>
      )}

      {/* ================= FORMATIRANJE ================= */}
      {tab === "format" && (
        <div style={box}>
          <h3>📦 Formatiranje</h3>

          <input
            placeholder="QR ili broj rolne (npr R-1001)"
            value={qr}
            onChange={(e) => setQr(e.target.value)}
          />

          <button onClick={() => setStatus("➡️ Ovde pozovi izvrsiFormatiranje()")}>
            Formatiraj
          </button>

          <div>{status}</div>
        </div>
      )}

      {/* ================= START PROIZVODNJE ================= */}
      {tab === "start" && (
        <div style={box}>
          <h3>🔒 Start proizvodnje</h3>

          <input
            placeholder="Skeniraj QR rolne"
            value={qr}
            onChange={(e) => setQr(e.target.value)}
          />

          <button onClick={startProizvodnja}>
            Proveri
          </button>

          <div style={{ marginTop: 10 }}>{status}</div>

          {dozvola && (
            <>
              <div style={{ color: "green", marginTop: 10 }}>
                ▶️ Proizvodnja dozvoljena
              </div>

              {/* RADNIK PANEL */}
              <RadnikPanel nalog={nalog} rola={rola} />
            </>
          )}
        </div>
      )}

    </div>
  );
}

const box = {
  background: "#fff",
  padding: 20,
  borderRadius: 10,
  marginTop: 10
};
