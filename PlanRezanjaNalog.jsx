import { useEffect, useState } from "react";
import { supabase } from "./supabase.js";

export default function PlanRezanjaNalog({ nalog, msg }) {
  const [plan, setPlan] = useState(null);
  const [edit, setEdit] = useState(false);
  const [rolne, setRolne] = useState([]);
  const [loading, setLoading] = useState(false);

  const [forma, setForma] = useState({
    rola_id:"",
    broj_rolne:"",
    qr_rolne:"",
    lokacija:"",
    lot:"",
    materijal:"",
    sirina_maticne:"",
    plan_rezanja:"500 + 500 + 400",
    metraza:"",
    otpad_mm:"",
    napomena:""
  });

  const ponBr = nalog?.ponBr || nalog?.br || "";

  useEffect(() => {
    ucitajPlan();
    ucitajRolne();
  }, [nalog?.id, ponBr]);

  async function ucitajPlan() {
    try {
      let q = supabase.from("planovi_rezanja_naloga").select("*").order("created_at", { ascending:false }).limit(1);
      if (nalog?.id) q = q.eq("nalog_id", nalog.id);
      else if (ponBr) q = q.eq("ponbr", ponBr);
      else return;
      const { data, error } = await q;
      if (error) throw error;
      if (data && data[0]) {
        setPlan(data[0]);
        setForma({
          rola_id:data[0].rola_id || "",
          broj_rolne:data[0].broj_rolne || "",
          qr_rolne:data[0].qr_rolne || "",
          lokacija:data[0].lokacija || "",
          lot:data[0].lot || "",
          materijal:data[0].materijal || "",
          sirina_maticne:data[0].sirina_maticne || "",
          plan_rezanja:data[0].plan_rezanja || "",
          metraza:data[0].metraza || "",
          otpad_mm:data[0].otpad_mm || "",
          napomena:data[0].napomena || ""
        });
      }
    } catch(e) { console.error(e); }
  }

  async function ucitajRolne() {
    try {
      const { data } = await supabase.from("magacin").select("*").limit(100);
      setRolne(data || []);
    } catch(e) { console.error(e); }
  }

  function izaberiRolnu(id) {
    const r = rolne.find(x => String(x.id) === String(id));
    if (!r) return;
    const broj = r.br_rolne || r.broj || r.broj_rolne || "";
    setForma(prev => ({
      ...prev,
      rola_id:r.id,
      broj_rolne:broj,
      qr_rolne:window.location.origin + "?rolna=" + encodeURIComponent(broj),
      lokacija:r.lokacija || r.palet || r.sch || "",
      lot:r.lot || r.LOT || "",
      materijal:r.tip || "",
      sirina_maticne:r.sirina || "",
      metraza:r.metraza_ost || r.metraza || ""
    }));
  }

  async function sacuvajPlan() {
    try {
      setLoading(true);
      const payload = {
        nalog_id: nalog?.id || null,
        ponbr: ponBr,
        tip_proizvoda: nalog?.tip || "folija",
        vrsta_naloga: nalog?.naziv || "Nalog za rezanje",
        rola_id: forma.rola_id || null,
        broj_rolne: forma.broj_rolne || null,
        qr_rolne: forma.qr_rolne || null,
        lokacija: forma.lokacija || null,
        lot: forma.lot || null,
        materijal: forma.materijal || null,
        sirina_maticne: forma.sirina_maticne || null,
        plan_rezanja: forma.plan_rezanja || "",
        metraza: forma.metraza || null,
        otpad_mm: forma.otpad_mm || null,
        napomena: forma.napomena || null
      };

      const { data, error } = await supabase.from("planovi_rezanja_naloga").insert([payload]).select().single();
      if (error) throw error;

      if (nalog?.id) {
        await supabase.from("nalozi").update({ plan_secenja: payload }).eq("id", nalog.id);
      }

      setPlan(data);
      setEdit(false);
      if (msg) msg("Plan rezanja sačuvan!");
      else alert("Plan rezanja sačuvan!");
    } catch(e) {
      console.error(e);
      if (msg) msg("Greška: " + e.message, "err");
      else alert("Greška: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  function stampajPlan() { window.print(); }

  const prikaz = plan || forma;

  return (
    <div style={{marginTop:14,border:"1px solid #e2e8f0",borderRadius:12,overflow:"hidden",background:"#fff"}}>
      <div style={{padding:"12px 16px",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
        <div>
          <div style={{fontSize:15,fontWeight:900}}>✂️ Plan rezanja</div>
          <div style={{fontSize:11,color:"#64748b"}}>Nalog: <b>{ponBr || "—"}</b></div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={() => setEdit(!edit)} style={btn("#7c3aed")}>{plan ? "Izmeni plan" : "Dodaj plan"}</button>
          <button onClick={stampajPlan} style={btn("#1d4ed8")}>🖨️ Štampaj plan</button>
        </div>
      </div>

      {edit && (
        <div style={{padding:16,borderBottom:"1px solid #e2e8f0"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>
              <label style={lbl}>Izaberi rolnu iz magacina</label>
              <select style={inp} value={forma.rola_id || ""} onChange={e => izaberiRolnu(e.target.value)}>
                <option value="">-- ručni unos / bez rolne --</option>
                {rolne.map(r => {
                  const broj = r.br_rolne || r.broj || r.broj_rolne || r.id;
                  return <option key={r.id} value={r.id}>{broj} · {r.tip || "—"} · {r.sirina || "—"}mm</option>;
                })}
              </select>
            </div>
            <Field label="Broj rolne" value={forma.broj_rolne} setValue={v => setForma({...forma, broj_rolne:v})} />
            <Field label="Lokacija" value={forma.lokacija} setValue={v => setForma({...forma, lokacija:v})} />
            <Field label="LOT" value={forma.lot} setValue={v => setForma({...forma, lot:v})} />
            <Field label="Materijal" value={forma.materijal} setValue={v => setForma({...forma, materijal:v})} />
            <Field label="Širina matične" value={forma.sirina_maticne} setValue={v => setForma({...forma, sirina_maticne:v})} />
            <Field label="Metraža" value={forma.metraza} setValue={v => setForma({...forma, metraza:v})} />
            <Field label="Otpad mm" value={forma.otpad_mm} setValue={v => setForma({...forma, otpad_mm:v})} />
          </div>

          <div style={{marginTop:10}}>
            <label style={lbl}>Plan rezanja</label>
            <textarea style={{...inp,height:70}} value={forma.plan_rezanja} onChange={e => setForma({...forma, plan_rezanja:e.target.value})} placeholder="npr. 500 + 500 + 400" />
          </div>

          <button disabled={loading} onClick={sacuvajPlan} style={{...btn("#16a34a"),marginTop:12}}>
            {loading ? "..." : "✅ Sačuvaj plan"}
          </button>
        </div>
      )}

      <div style={{padding:16}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:12}}>
          <Info label="Broj rolne" value={prikaz?.broj_rolne} />
          <Info label="Lokacija" value={prikaz?.lokacija} />
          <Info label="LOT" value={prikaz?.lot} />
          <Info label="Materijal" value={prikaz?.materijal} />
        </div>

        <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:14,marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:900,color:"#1d4ed8",textTransform:"uppercase",letterSpacing:0.8}}>Plan</div>
          <div style={{fontSize:24,fontWeight:900,marginTop:6}}>{prikaz?.plan_rezanja || "Plan nije dodat"}</div>
        </div>
      </div>
    </div>
  );
}

function Field({label,value,setValue}) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      <input style={inp} value={value || ""} onChange={e => setValue(e.target.value)} />
    </div>
  );
}

function Info({label,value}) {
  return (
    <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:10}}>
      <div style={{fontSize:9,color:"#94a3b8",fontWeight:900,textTransform:"uppercase"}}>{label}</div>
      <div style={{fontSize:13,fontWeight:800,marginTop:3}}>{value || "—"}</div>
    </div>
  );
}

const inp = {width:"100%",boxSizing:"border-box",padding:"8px 10px",borderRadius:7,border:"1px solid #dbe3ef",background:"#fff",fontSize:13};
const lbl = {display:"block",fontSize:9,fontWeight:900,color:"#64748b",textTransform:"uppercase",marginBottom:3};
const btn = (bg) => ({padding:"8px 12px",borderRadius:7,border:"none",background:bg,color:"#fff",fontWeight:900,fontSize:12,cursor:"pointer"});
