// Dashboard.jsx - VIZUELNI DASHBOARD sa grafikonima
import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

function n(v){ return Number(v||0); }
function fmt(v, suf){ return n(v).toLocaleString("sr-RS", {maximumFractionDigits: 1}) + (suf||""); }

export default function Dashboard({card}) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ukupnoRolni: 0,
    ukupnoMetara: 0,
    ukupnoKg: 0,
    vrednost: 0,
    poSirini: [],
    poTipu: [],
    otvoreniNalozi: 0,
    kasneNalozi: 0,
    vrednostPoTipu: []
  });

  useEffect(function() {
    ucitajStatistiku();
  }, []);

  async function ucitajStatistiku() {
    setLoading(true);
    try {
      // MAGACIN podaci
      var rm = await supabase.from("magacin").select("*").neq("status", "Iskorišćeno");
      if(rm.error) throw rm.error;
      var magacin = rm.data || [];

      // NALOZI podaci
      var rn = await supabase.from("nalozi").select("*").order("created_at", {ascending:false}).limit(200);
      if(rn.error) throw rn.error;
      var nalozi = rn.data || [];

      // CENE po tipu
      var CENE = {
        "BOPP": 2.6, "OPP": 2.6, "CPP": 2.7, "PET": 3.1,
        "LDPE": 2.4, "ALU": 8.5, "PAPIR": 1.9, "PA": 4.2,
        "FXC": 2.8, "FXPU": 2.9, "NATIVIA": 3.0, "CC White": 2.2
      };

      // Računaj statistiku
      var ukupnoRolni = magacin.length;
      var ukupnoMetara = magacin.reduce(function(s,x){return s+n(x.metraza_ost||x.metraza||0);},0);
      var ukupnoKg = magacin.reduce(function(s,x){return s+n(x.kg_neto||0);},0);

      // Po širini
      var poSirini = {};
      magacin.forEach(function(x) {
        var sir = x.sirina;
        if(!poSirini[sir]) poSirini[sir] = {sirina: sir + "mm", rolni: 0, metara: 0, kg: 0};
        poSirini[sir].rolni++;
        poSirini[sir].metara += n(x.metraza_ost||x.metraza||0);
        poSirini[sir].kg += n(x.kg_neto||0);
      });
      var poSiriniArr = Object.values(poSirini).sort(function(a,b){return b.metara - a.metara;}).slice(0,10);

      // Po tipu materijala
      var poTipu = {};
      var vrednostPoTipu = {};
      var ukupnaVrednost = 0;

      magacin.forEach(function(x) {
        var tip = x.tip || "Ostalo";
        var kg = n(x.kg_neto||0);
        
        // Pronađi cenu
        var cenaKg = 2.8;
        for(var t in CENE) {
          if(String(tip).toUpperCase().includes(t)) {
            cenaKg = CENE[t];
            break;
          }
        }
        
        var vrednost = kg * cenaKg;
        ukupnaVrednost += vrednost;

        if(!poTipu[tip]) poTipu[tip] = {tip: tip, rolni: 0, kg: 0};
        poTipu[tip].rolni++;
        poTipu[tip].kg += kg;

        if(!vrednostPoTipu[tip]) vrednostPoTipu[tip] = {tip: tip, vrednost: 0};
        vrednostPoTipu[tip].vrednost += vrednost;
      });

      var poTipuArr = Object.values(poTipu).sort(function(a,b){return b.kg - a.kg;}).slice(0,8);
      var vrednostPoTipuArr = Object.values(vrednostPoTipu).sort(function(a,b){return b.vrednost - a.vrednost;}).slice(0,8);

      // Nalozi
      var otvoreniNalozi = nalozi.filter(function(x){
        return x.status !== "Završeno" && x.status !== "Zavrseno";
      }).length;

      var danas = new Date();
      var kasneNalozi = nalozi.filter(function(x) {
        if(x.status === "Završeno" || x.status === "Zavrseno") return false;
        if(!x.created_at) return false;
        var created = new Date(x.created_at);
        var diff = (danas - created) / (1000 * 60 * 60 * 24);
        return diff > 7;
      }).length;

      setStats({
        ukupnoRolni: ukupnoRolni,
        ukupnoMetara: ukupnoMetara,
        ukupnoKg: ukupnoKg,
        vrednost: ukupnaVrednost,
        poSirini: poSiriniArr,
        poTipu: poTipuArr,
        otvoreniNalozi: otvoreniNalozi,
        kasneNalozi: kasneNalozi,
        vrednostPoTipu: vrednostPoTipuArr
      });

    } catch(e) {
      console.error("Greška pri učitavanju statistike:", e);
    }
    setLoading(false);
  }

  var COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

  if(loading) {
    return (
      <div style={Object.assign({}, card, {textAlign:"center",padding:40})}>
        <div style={{fontSize:48,marginBottom:16}}>📊</div>
        <div style={{fontSize:18,fontWeight:900,color:"#1d4ed8"}}>Učitavam dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div style={Object.assign({}, card, {marginBottom:16,background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",color:"#fff"})}>
        <div style={{fontSize:24,fontWeight:900,marginBottom:4}}>📊 Dashboard</div>
        <div style={{fontSize:14,opacity:0.9}}>Pregled magacina i radnih naloga u realnom vremenu</div>
        <button
          onClick={ucitajStatistiku}
          style={{
            marginTop:12,
            padding:"8px 16px",
            borderRadius:8,
            border:"none",
            background:"rgba(255,255,255,0.2)",
            color:"#fff",
            fontWeight:800,
            cursor:"pointer"
          }}
        >
          🔄 Osveži
        </button>
      </div>

      {/* KARTICA SA OSNOVNIM BROJEVIMA */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:16,marginBottom:16}}>
        {/* Ukupno rolni */}
        <div style={Object.assign({}, card, {background:"#eff6ff",borderLeft:"4px solid #3b82f6"})}>
          <div style={{fontSize:12,color:"#64748b",fontWeight:700,marginBottom:4}}>UKUPNO ROLNI</div>
          <div style={{fontSize:32,fontWeight:900,color:"#1e293b"}}>{stats.ukupnoRolni}</div>
        </div>

        {/* Ukupno metara */}
        <div style={Object.assign({}, card, {background:"#f0fdf4",borderLeft:"4px solid #10b981"})}>
          <div style={{fontSize:12,color:"#64748b",fontWeight:700,marginBottom:4}}>UKUPNO METARA</div>
          <div style={{fontSize:32,fontWeight:900,color:"#1e293b"}}>{fmt(stats.ukupnoMetara, " m")}</div>
        </div>

        {/* Ukupno kg */}
        <div style={Object.assign({}, card, {background:"#fef3c7",borderLeft:"4px solid #f59e0b"})}>
          <div style={{fontSize:12,color:"#64748b",fontWeight:700,marginBottom:4}}>UKUPNO KG</div>
          <div style={{fontSize:32,fontWeight:900,color:"#1e293b"}}>{fmt(stats.ukupnoKg, " kg")}</div>
        </div>

        {/* Vrednost */}
        <div style={Object.assign({}, card, {background:"#fef2f2",borderLeft:"4px solid #ef4444"})}>
          <div style={{fontSize:12,color:"#64748b",fontWeight:700,marginBottom:4}}>VREDNOST</div>
          <div style={{fontSize:32,fontWeight:900,color:"#1e293b"}}>{fmt(stats.vrednost, " €")}</div>
        </div>
      </div>

      {/* RADNI NALOZI KARTICE */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))",gap:16,marginBottom:16}}>
        {/* Otvoreni nalozi */}
        <div style={Object.assign({}, card, {background:"#f0f9ff",borderLeft:"4px solid #0ea5e9"})}>
          <div style={{fontSize:12,color:"#64748b",fontWeight:700,marginBottom:4}}>OTVORENI NALOZI</div>
          <div style={{fontSize:48,fontWeight:900,color:"#0ea5e9"}}>{stats.otvoreniNalozi}</div>
        </div>

        {/* Kasne nalozi */}
        <div style={Object.assign({}, card, {background:"#fef2f2",borderLeft:"4px solid #dc2626"})}>
          <div style={{fontSize:12,color:"#64748b",fontWeight:700,marginBottom:4}}>⚠️ KASNE (>7 DANA)</div>
          <div style={{fontSize:48,fontWeight:900,color:"#dc2626"}}>{stats.kasneNalozi}</div>
        </div>
      </div>

      {/* GRAFIKON - STANJE PO ŠIRINAMA */}
      <div style={Object.assign({}, card, {marginBottom:16})}>
        <div style={{fontSize:18,fontWeight:900,marginBottom:16,color:"#0f172a"}}>📏 Stanje po širinama</div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.poSirini}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="sirina" style={{fontSize:12}} />
            <YAxis style={{fontSize:12}} />
            <Tooltip 
              contentStyle={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8}}
              formatter={function(value, name) {
                if(name === "metara") return [fmt(value, " m"), "Metara"];
                if(name === "rolni") return [value, "Rolni"];
                if(name === "kg") return [fmt(value, " kg"), "Kg"];
                return value;
              }}
            />
            <Legend />
            <Bar dataKey="metara" fill="#3b82f6" name="Metara" />
            <Bar dataKey="rolni" fill="#10b981" name="Rolni" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* GRAFIKON - VREDNOST PO TIPU MATERIJALA */}
      <div style={Object.assign({}, card, {marginBottom:16})}>
        <div style={{fontSize:18,fontWeight:900,marginBottom:16,color:"#0f172a"}}>💰 Vrednost po tipu materijala</div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={stats.vrednostPoTipu}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={function(entry) {
                return entry.tip + " (" + fmt(entry.vrednost, "€") + ")";
              }}
              outerRadius={100}
              fill="#8884d8"
              dataKey="vrednost"
            >
              {stats.vrednostPoTipu.map(function(entry, index) {
                return <Cell key={"cell-" + index} fill={COLORS[index % COLORS.length]} />;
              })}
            </Pie>
            <Tooltip 
              contentStyle={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8}}
              formatter={function(value) {
                return fmt(value, " €");
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* GRAFIKON - KG PO TIPU */}
      <div style={Object.assign({}, card, {marginBottom:16})}>
        <div style={{fontSize:18,fontWeight:900,marginBottom:16,color:"#0f172a"}}>⚖️ Kg po tipu materijala</div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.poTipu} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" style={{fontSize:12}} />
            <YAxis dataKey="tip" type="category" style={{fontSize:12}} width={100} />
            <Tooltip 
              contentStyle={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8}}
              formatter={function(value, name) {
                if(name === "kg") return [fmt(value, " kg"), "Kg"];
                if(name === "rolni") return [value, "Rolni"];
                return value;
              }}
            />
            <Legend />
            <Bar dataKey="kg" fill="#f59e0b" name="Kg" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* FOOTER INFO */}
      <div style={Object.assign({}, card, {background:"#f8fafc",borderLeft:"4px solid #64748b"})}>
        <div style={{fontSize:12,color:"#64748b"}}>
          💡 <strong>Napomena:</strong> Dashboard se ažurira svaki put kada kliknete "Osveži". 
          Za automatsko osveživanje svake minute, dodaću Real-Time Supabase konekciju u sledećoj verziji.
        </div>
      </div>
    </div>
  );
}
