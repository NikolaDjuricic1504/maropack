import { useEffect, useState } from "react";
import { supabase } from "./supabase.js";

function qrUrl(text, size = 90) {
  return "https://api.qrserver.com/v1/create-qr-code/?size=" + size + "x" + size + "&data=" + encodeURIComponent(text || "");
}

function tipLabel(tip) {
  if ((tip || "").toLowerCase().includes("kesa")) return "KESA";
  if ((tip || "").toLowerCase().includes("spulna") || (tip || "").toLowerCase().includes("špulna")) return "ŠPULNA";
  return "FOLIJA";
}

function defaultPlanZaTip(tip) {
  const t = tipLabel(tip);
  if (t === "KESA") {
    return {
      plan_rezanja: "Format kese / širina materijala",
      metraza: "",
      otpad_mm: "",
      napomena: "Plan formatiranja za kese"
    };
  }
  if (t === "ŠPULNA") {
    return {
      plan_rezanja: "Širina špulne / broj špulni",
      metraza: "",
      otpad_mm: "",
      napomena: "Plan rezanja za špulne"
    };
  }
  return {
    plan_rezanja: "500 + 500 + 400",
    metraza: "",
    otpad_mm: "",
    napomena: "Plan sečenja folije"
  };
}

export default function PlanRezanjaNalog({ nalog, user, msg }) {
  const [plan, setPlan] = useState(null);
  const [edit, setEdit] = useState(false);
  const [rolne, setRolne] = useState([]);
  const [forma, setForma] = useState(defaultPlanZaTip(nalog?.tip));
  const [loading, setLoading] = useState(false);

  const tip = tipLabel(nalog?.tip || nalog?.naziv);
  const ponBr = nalog?.ponBr || nalog?.broj || "";

  useEffect(() => {
    ucitajPlan();
    ucitajRolne();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nalog?.id, ponBr]);

  async function ucitajPlan() {
    if (!nalog?.id && !ponBr) return;
    let q = supabase.from("planovi_rezanja_naloga").select("*").order("created_at", { ascending: false }).limit(1);
    if (nalog?.id) q = q.eq("nalog_id", nalog.id);
    else q = q.eq("ponbr", ponBr);
    const { data } = await q;
    if (data && data[0]) {
      setPlan(data[0]);
      setForma({
        broj_rolne: data[0].broj_rolne || "",
        rola_id: data[0].rola_id || "",
        qr_rolne: data[0].qr_rolne || "",
        lokacija: data[0].lokacija || "",
        lot: data[0].lot || "",
        materijal: data[0].materijal || "",
        sirina_maticne: data[0].sirina_maticne || "",
        plan_rezanja: data[0].plan_rezanja || "",
        metraza: data[0].metraza || "",
        otpad_mm: data[0].otpad_mm || "",
        napomena: data[0].napomena || ""
      });
    }
  }

  async function ucitajRolne() {
    const { data } = await supabase
      .from("magacin")
      .select("*")
      .neq("status", "Iskorišćeno")
      .order("created_at", { ascending: false })
      .limit(50);
    setRolne(data || []);
  }

  function izaberiRolnu(id) {
    const r = rolne.find(x => String(x.id) === String(id));
    if (!r) return;
    const broj = r.br_rolne || r.broj || r.broj_rolne || "";
    setForma(prev => ({
      ...prev,
      rola_id: r.id,
      broj_rolne: broj,
      qr_rolne: window.location.origin + "?rolna=" + encodeURIComponent(broj),
      lokacija: r.lokacija || r.palet || r.sch || "",
      lot: r.lot || r.LOT || "",
      materijal: r.tip || "",
      sirina_maticne: r.sirina || ""
    }));
  }

  async function sacuvajPlan() {
    try {
      setLoading(true);
      const payload = {
        nalog_id: nalog?.id || null,
        ponbr: ponBr,
        tip_proizvoda: nalog?.tip || tip.toLowerCase(),
        vrsta_naloga: nalog?.naziv || "",
        broj_rolne: forma.broj_rolne || null,
        rola_id: forma.rola_id || null,
        qr_rolne: forma.qr_rolne || null,
        lokacija: forma.lokacija || null,
        lot: forma.lot || null,
        materijal: forma.materijal || null,
        sirina_maticne: forma.sirina_maticne || null,
        plan_rezanja: forma.plan_rezanja || "",
        metraza: forma.metraza || null,
        otpad_mm: forma.otpad_mm || null,
        napomena: forma.napomena || null,
        created_by: user?.ime || user?.email || null
      };

      const { data, error } = await supabase
        .from("planovi_rezanja_naloga")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      if (nalog?.id) {
        await supabase.from("nalozi").update({ plan_secenja: payload }).eq("id", nalog.id);
      }

      setPlan(data);
      setEdit(false);
      if (msg) msg("Plan rezanja sačuvan!");
      else alert("Plan rezanja sačuvan!");
    } catch (e) {
      console.error(e);
      if (msg) msg("Greška: " + e.message, "err");
      else alert("Greška: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  function stampajPlan() {
    window.print();
  }

  const prikaz = plan || forma;

  return (
    <div style={{marginTop:14,border:"1px solid #e2e8f0",borderRadius:12,overflow:"hidden",background:"#fff"}}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-plan-rezanja, .print-plan-rezanja * { visibility: visible; }
          .print-plan-rezanja {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            min-height: 297mm;
            padding: 16mm;
            background: white;
            box-sizing: border-box;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print" style={{padding:"12px 16px",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
        <div>
          <div style={{fontSize:15,fontWeight:900}}>🧠 Plan rezanja / formatiranja</div>
          <div style={{fontSize:11,color:"#64748b"}}>Tip: <b>{tip}</b> · Nalog: <b>{ponBr || "—"}</b></div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={() => setEdit(!edit)} style={btn("#7c3aed")}>🧠 {plan ? "Izmeni plan" : "Dodaj plan"}</button>
          <button onClick={stampajPlan} style={btn("#1d4ed8")}>🖨️ Štampaj plan</button>
        </div>
      </div>

      {edit && (
        <div className="no-print" style={{padding:16,borderBottom:"1px solid #e2e8f0"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>
              <label style={lbl}>Izaberi rolnu iz magacina</label>
              <select style={inp} value={forma.rola_id || ""} onChange={e => izaberiRolnu(e.target.value)}>
                <option value="">-- ručni unos / bez rolne --</option>
                {rolne.map(r => {
                  const broj = r.br_rolne || r.broj || r.broj_rolne || r.id;
                  return <option key={r.id} value={r.id}>{broj} · {r.tip} · {r.sirina}mm · {r.lokacija || r.palet || r.sch || "bez lokacije"}</option>;
                })}
              </select>
            </div>
            <Field label="Broj rolne" value={forma.broj_rolne || ""} setValue={v => setForma({...forma, broj_rolne:v})} />
            <Field label="Lokacija" value={forma.lokacija || ""} setValue={v => setForma({...forma, lokacija:v})} />
            <Field label="LOT" value={forma.lot || ""} setValue={v => setForma({...forma, lot:v})} />
            <Field label="Materijal" value={forma.materijal || ""} setValue={v => setForma({...forma, materijal:v})} />
            <Field label="Širina matične / materijala" value={forma.sirina_maticne || ""} setValue={v => setForma({...forma, sirina_maticne:v})} />
            <Field label="Metraža" value={forma.metraza || ""} setValue={v => setForma({...forma, metraza:v})} />
            <Field label="Otpad mm" value={forma.otpad_mm || ""} setValue={v => setForma({...forma, otpad_mm:v})} />
          </div>
          <div style={{marginTop:10}}>
            <label style={lbl}>Plan rezanja / formatiranja</label>
            <textarea style={{...inp,height:70}} value={forma.plan_rezanja || ""} onChange={e => setForma({...forma, plan_rezanja:e.target.value})} placeholder="npr. 500 + 500 + 400" />
          </div>
          <div style={{marginTop:10}}>
            <label style={lbl}>Napomena</label>
            <textarea style={{...inp,height:60}} value={forma.napomena || ""} onChange={e => setForma({...forma, napomena:e.target.value})} />
          </div>
          <button disabled={loading} onClick={sacuvajPlan} style={{...btn("#16a34a"),marginTop:12}}>
            {loading ? "..." : "✅ Sačuvaj plan"}
          </button>
        </div>
      )}

      <div className="print-plan-rezanja" style={{padding:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",borderBottom:"3px solid #1d4ed8",paddingBottom:12,marginBottom:14}}>
          <div>
            <div style={{fontSize:22,fontWeight:900,color:"#1d4ed8"}}>PLAN REZANJA / FORMATIRANJA</div>
            <div style={{fontSize:12,color:"#64748b",marginTop:4}}>Tip: <b>{tip}</b> · Nalog: <b>{ponBr || "—"}</b></div>
            <div style={{fontSize:12,color:"#64748b"}}>Kupac: <b>{nalog?.kupac || "—"}</b> · Proizvod: <b>{nalog?.prod || nalog?.naziv || "—"}</b></div>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{textAlign:"center"}}>
              <img src={qrUrl(window.location.origin + "?nalog=" + encodeURIComponent(nalog?.id || ponBr),90)} width={90} height={90} alt="QR nalog" />
              <div style={{fontSize:9,color:"#64748b"}}>QR naloga</div>
            </div>
            {prikaz?.broj_rolne && (
              <div style={{textAlign:"center"}}>
                <img src={qrUrl(prikaz.qr_rolne || (window.location.origin + "?rolna=" + encodeURIComponent(prikaz.broj_rolne)),90)} width={90} height={90} alt="QR rolne" />
                <div style={{fontSize:9,color:"#64748b"}}>QR rolne</div>
              </div>
            )}
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:12}}>
          <Info label="Broj rolne" value={prikaz?.broj_rolne} />
          <Info label="Lokacija" value={prikaz?.lokacija} />
          <Info label="LOT" value={prikaz?.lot} />
          <Info label="Materijal" value={prikaz?.materijal} />
          <Info label={tip === "ŠPULNA" ? "Širina špulne" : "Širina materijala"} value={prikaz?.sirina_maticne ? prikaz.sirina_maticne + " mm" : "—"} />
          <Info label="Metraža" value={prikaz?.metraza ? prikaz.metraza + " m" : "—"} />
          <Info label="Otpad" value={prikaz?.otpad_mm ? prikaz.otpad_mm + " mm" : "—"} />
          <Info label="Vrsta naloga" value={nalog?.naziv || "—"} />
        </div>

        <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:14,marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:900,color:"#1d4ed8",textTransform:"uppercase",letterSpacing:0.8}}>Plan</div>
          <div style={{fontSize:24,fontWeight:900,marginTop:6}}>{prikaz?.plan_rezanja || "Plan nije dodat"}</div>
        </div>

        {String(prikaz?.plan_rezanja || "").includes("+") && (
          <div style={{display:"flex",height:54,borderRadius:8,overflow:"hidden",border:"1px solid #93c5fd",marginBottom:12}}>
            {String(prikaz.plan_rezanja).split("+").map((x,i) => {
              const w = Number(x.trim()) || 1;
              return <div key={i} style={{flex:w,background:"#dbeafe",borderRight:"1px solid #93c5fd",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"#1e40af"}}>{x.trim()} mm</div>;
            })}
            {prikaz?.otpad_mm && Number(prikaz.otpad_mm) > 0 && (
              <div style={{flex:Number(prikaz.otpad_mm),background:"#fecaca",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"#991b1b"}}>Otpad {prikaz.otpad_mm}</div>
            )}
          </div>
        )}

        {prikaz?.napomena && (
          <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:10,fontSize:12}}>
            <b>Napomena:</b> {prikaz.napomena}
          </div>
        )}

        <div style={{marginTop:22,display:"flex",justifyContent:"space-between",fontSize:11,color:"#64748b"}}>
          <span>Radnik: _________________________</span>
          <span>Kontrola: _________________________</span>
          <span>Datum: {new Date().toLocaleDateString("sr-RS")}</span>
        </div>
      </div>
    </div>
  );
}

function Field({label,value,setValue}) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      <input style={inp} value={value} onChange={e => setValue(e.target.value)} />
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
