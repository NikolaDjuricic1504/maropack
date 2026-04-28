// Dashboard-NOVO.jsx - MODERN CORPORATE DESIGN
import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

function n(v){ return Number(v||0); }
function fmt(v, suf){ return n(v).toLocaleString("sr-RS", {maximumFractionDigits: 1}) + (suf||""); }

export default function Dashboard({card}) {
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [stats, setStats] = useState({
    ukupnoRolni: 0,
    ukupnoMetara: 0,
    ukupnoKg: 0,
    vrednost: 0,
    poSirini: [],
    poTipu: [],
    otvoreniNalozi: 0,
    kasneNalozi: 0,
    vrednostPoTipu: [],
    proizvodnjaDana: [],
    radniciEfikasnost: []
  });

  // AUTO-REFRESH SVAKIH 30 SEKUNDI
  useEffect(function() {
    ucitajStatistiku();
    var interval;
    if(autoRefresh) {
      interval = setInterval(ucitajStatistiku, 30000);
    }
    return function() {
      if(interval) clearInterval(interval);
    };
  }, [autoRefresh]);

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

      // Simulirani podaci za proizvodnju (7 dana)
      var proizvodnjaDana = [
        {dan: "Pon", proizvedeno: 1150},
        {dan: "Uto", proizvedeno: 1320},
        {dan: "Sre", proizvedeno: 1180},
        {dan: "Čet", proizvedeno: 1450},
        {dan: "Pet", proizvedeno: 1247},
        {dan: "Sub", proizvedeno: 980},
        {dan: "Ned", proizvedeno: 1100}
      ];

      // Simulirani podaci za radnike
      var radniciEfikasnost = [
        {ime: "Marko", efikasnost: 96},
        {ime: "Jovana", efikasnost: 94},
        {ime: "Stefan", efikasnost: 92},
        {ime: "Ana", efikasnost: 89},
        {ime: "Petar", efikasnost: 87}
      ];

      setStats({
        ukupnoRolni: ukupnoRolni,
        ukupnoMetara: ukupnoMetara,
        ukupnoKg: ukupnoKg,
        vrednost: ukupnaVrednost,
        poSirini: poSiriniArr,
        poTipu: poTipuArr,
        otvoreniNalozi: otvoreniNalozi,
        kasneNalozi: kasneNalozi,
        vrednostPoTipu: vrednostPoTipuArr,
        proizvodnjaDana: proizvodnjaDana,
        radniciEfikasnost: radniciEfikasnost
      });

    } catch(e) {
      console.error("Greška pri učitavanju statistike:", e);
    }
    setLoading(false);
  }

  // Učitaj Chart.js nakon montiranja komponente
  useEffect(function() {
    if(!loading && stats.proizvodnjaDana.length > 0) {
      ucitajGrafikone();
    }
  }, [loading, stats]);

  function ucitajGrafikone() {
    // Učitaj Chart.js ako već nije učitan
    if(typeof window.Chart === "undefined") {
      var script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
      script.onload = function() {
        nacrtajGrafikone();
      };
      document.head.appendChild(script);
    } else {
      nacrtajGrafikone();
    }
  }

  function nacrtajGrafikone() {
    // PROIZVODNJA GRAFIKON
    var ctxProizvodnja = document.getElementById("chartProizvodnja");
    if(ctxProizvodnja && window.Chart) {
      // Uništi stari grafikon ako postoji
      if(window.chartProizvodnjaInstance) {
        window.chartProizvodnjaInstance.destroy();
      }
      
      window.chartProizvodnjaInstance = new window.Chart(ctxProizvodnja, {
        type: "line",
        data: {
          labels: stats.proizvodnjaDana.map(function(x){return x.dan;}),
          datasets: [{
            label: "Proizvedeno komada",
            data: stats.proizvodnjaDana.map(function(x){return x.proizvedeno;}),
            borderColor: "#667eea",
            backgroundColor: "rgba(102, 126, 234, 0.1)",
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: "#667eea"
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { 
              beginAtZero: true,
              grid: { color: "#f7fafc" }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    }

    // TOP PROIZVODI GRAFIKON
    var ctxProizvodi = document.getElementById("chartProizvodi");
    if(ctxProizvodi && window.Chart) {
      if(window.chartProizvodiInstance) {
        window.chartProizvodiInstance.destroy();
      }

      var labels = [];
      var data = [];
      stats.vrednostPoTipu.slice(0, 5).forEach(function(x) {
        labels.push(x.tip);
        data.push(Math.round(x.vrednost));
      });

      window.chartProizvodiInstance = new window.Chart(ctxProizvodi, {
        type: "doughnut",
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: ["#667eea", "#10b981", "#f59e0b", "#8b5cf6", "#718096"],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: { 
                padding: 15,
                font: { size: 12 }
              }
            }
          }
        }
      });
    }

    // RADNICI GRAFIKON
    var ctxRadnici = document.getElementById("chartRadnici");
    if(ctxRadnici && window.Chart) {
      if(window.chartRadniciInstance) {
        window.chartRadniciInstance.destroy();
      }

      window.chartRadniciInstance = new window.Chart(ctxRadnici, {
        type: "bar",
        data: {
          labels: stats.radniciEfikasnost.map(function(x){return x.ime;}),
          datasets: [{
            label: "Efikasnost %",
            data: stats.radniciEfikasnost.map(function(x){return x.efikasnost;}),
            backgroundColor: ["#10b981", "#10b981", "#f59e0b", "#f59e0b", "#ef4444"],
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { 
              beginAtZero: true,
              max: 100,
              grid: { color: "#f7fafc" }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    }
  }

  if(loading) {
    return (
      <div style={Object.assign({}, card, {textAlign:"center",padding:40})}>
        <div style={{fontSize:48,marginBottom:16}}>📊</div>
        <div style={{fontSize:18,fontWeight:900,color:"#667eea"}}>Učitavam dashboard...</div>
      </div>
    );
  }

  // MODERN CORPORATE STYLING
  var gradientBg = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    boxShadow: "0 4px 6px rgba(0,0,0,0.07)"
  };

  var statCard = {
    background: "white",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
    position: "relative",
    overflow: "hidden",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer"
  };

  var statCardHover = {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 24px rgba(0,0,0,0.15)"
  };

  return (
    <div style={{background:"#f7fafc",minHeight:"100vh",padding:20}}>
      {/* HEADER */}
      <div style={gradientBg}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:28,fontWeight:700,marginBottom:4}}>📊 Maropack Dashboard</div>
            <div style={{fontSize:14,opacity:0.9}}>Dobrodošli nazad, Administrator</div>
          </div>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <div style={{
              background: autoRefresh ? "#10b981" : "rgba(255,255,255,0.2)",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6
            }}>
              <span style={{animation: autoRefresh ? "pulse 2s ease-in-out infinite" : "none"}}>●</span>
              {autoRefresh ? "Auto-refresh ON" : "Sistem aktivan"}
            </div>
            <button
              onClick={function(){setAutoRefresh(!autoRefresh);}}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                fontWeight: 800,
                cursor: "pointer"
              }}
            >
              {autoRefresh ? "⏸ Pauziraj" : "▶ Auto-refresh"}
            </button>
            <button
              onClick={ucitajStatistiku}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                fontWeight: 800,
                cursor: "pointer"
              }}
            >
              🔄 Osveži
            </button>
          </div>
        </div>
      </div>

      {/* STAT KARTICE */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:20,marginBottom:24}}>
        <div 
          style={statCard}
          onMouseEnter={function(e){Object.assign(e.currentTarget.style, statCardHover);}}
          onMouseLeave={function(e){Object.assign(e.currentTarget.style, {transform:"translateY(0)",boxShadow:"0 4px 6px rgba(0,0,0,0.07)"});}}
        >
          <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:"linear-gradient(90deg, #667eea, #764ba2)"}}></div>
          <div style={{width:48,height:48,borderRadius:12,background:"linear-gradient(135deg, #667eea, #764ba2)",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,marginBottom:16}}>📋</div>
          <div style={{fontSize:13,color:"#718096",textTransform:"uppercase",letterSpacing:"0.5px",fontWeight:600,marginBottom:8}}>Aktivni nalozi</div>
          <div style={{fontSize:32,fontWeight:700,color:"#1a202c",marginBottom:8}}>{stats.otvoreniNalozi}</div>
          <div style={{fontSize:13,fontWeight:600,color:"#10b981",display:"flex",alignItems:"center",gap:4}}>
            <span>↗</span> +12% ovaj mesec
          </div>
        </div>

        <div 
          style={statCard}
          onMouseEnter={function(e){Object.assign(e.currentTarget.style, statCardHover);}}
          onMouseLeave={function(e){Object.assign(e.currentTarget.style, {transform:"translateY(0)",boxShadow:"0 4px 6px rgba(0,0,0,0.07)"});}}
        >
          <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:"linear-gradient(90deg, #10b981, #34d399)"}}></div>
          <div style={{width:48,height:48,borderRadius:12,background:"linear-gradient(135deg, #10b981, #34d399)",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,marginBottom:16}}>📦</div>
          <div style={{fontSize:13,color:"#718096",textTransform:"uppercase",letterSpacing:"0.5px",fontWeight:600,marginBottom:8}}>Ukupno rolni</div>
          <div style={{fontSize:32,fontWeight:700,color:"#1a202c",marginBottom:8}}>{stats.ukupnoRolni}</div>
          <div style={{fontSize:13,fontWeight:600,color:"#10b981",display:"flex",alignItems:"center",gap:4}}>
            <span>↗</span> {fmt(stats.ukupnoMetara, " m")}
          </div>
        </div>

        <div 
          style={statCard}
          onMouseEnter={function(e){Object.assign(e.currentTarget.style, statCardHover);}}
          onMouseLeave={function(e){Object.assign(e.currentTarget.style, {transform:"translateY(0)",boxShadow:"0 4px 6px rgba(0,0,0,0.07)"});}}
        >
          <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:"linear-gradient(90deg, #f59e0b, #fbbf24)"}}></div>
          <div style={{width:48,height:48,borderRadius:12,background:"linear-gradient(135deg, #f59e0b, #fbbf24)",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,marginBottom:16}}>🏭</div>
          <div style={{fontSize:13,color:"#718096",textTransform:"uppercase",letterSpacing:"0.5px",fontWeight:600,marginBottom:8}}>Magacin</div>
          <div style={{fontSize:32,fontWeight:700,color:"#1a202c",marginBottom:8}}>78%</div>
          <div style={{fontSize:13,fontWeight:600,color:"#ef4444",display:"flex",alignItems:"center",gap:4}}>
            <span>↘</span> -3% od prošle nedelje
          </div>
        </div>

        <div 
          style={statCard}
          onMouseEnter={function(e){Object.assign(e.currentTarget.style, statCardHover);}}
          onMouseLeave={function(e){Object.assign(e.currentTarget.style, {transform:"translateY(0)",boxShadow:"0 4px 6px rgba(0,0,0,0.07)"});}}
        >
          <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:"linear-gradient(90deg, #8b5cf6, #a78bfa)"}}></div>
          <div style={{width:48,height:48,borderRadius:12,background:"linear-gradient(135deg, #8b5cf6, #a78bfa)",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,marginBottom:16}}>⚡</div>
          <div style={{fontSize:13,color:"#718096",textTransform:"uppercase",letterSpacing:"0.5px",fontWeight:600,marginBottom:8}}>Efikasnost</div>
          <div style={{fontSize:32,fontWeight:700,color:"#1a202c",marginBottom:8}}>94%</div>
          <div style={{fontSize:13,fontWeight:600,color:"#10b981",display:"flex",alignItems:"center",gap:4}}>
            <span>↗</span> +2.3% ovaj mesec
          </div>
        </div>
      </div>

      {/* GRAFIKONI */}
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:20,marginBottom:24}}>
        {/* PROIZVODNJA */}
        <div style={{background:"white",borderRadius:16,padding:24,boxShadow:"0 4px 6px rgba(0,0,0,0.07)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <div style={{fontSize:18,fontWeight:700,color:"#1a202c"}}>Proizvodnja po danima</div>
            <div style={{display:"flex",gap:8}}>
              <button style={{padding:"6px 12px",borderRadius:8,background:"#667eea",border:"none",fontSize:13,fontWeight:600,color:"white",cursor:"pointer"}}>7 dana</button>
              <button style={{padding:"6px 12px",borderRadius:8,background:"#f7fafc",border:"none",fontSize:13,fontWeight:600,color:"#718096",cursor:"pointer"}}>30 dana</button>
              <button style={{padding:"6px 12px",borderRadius:8,background:"#f7fafc",border:"none",fontSize:13,fontWeight:600,color:"#718096",cursor:"pointer"}}>Godina</button>
            </div>
          </div>
          <div style={{height:300,position:"relative"}}>
            <canvas id="chartProizvodnja"></canvas>
          </div>
        </div>

        {/* NEDAVNE AKTIVNOSTI */}
        <div style={{background:"white",borderRadius:16,padding:24,boxShadow:"0 4px 6px rgba(0,0,0,0.07)"}}>
          <div style={{fontSize:18,fontWeight:700,color:"#1a202c",marginBottom:20}}>Nedavne aktivnosti</div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{padding:16,background:"#f7fafc",borderRadius:12,borderLeft:"4px solid #667eea",transition:"all 0.2s",cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div style={{fontWeight:600,fontSize:14,color:"#1a202c"}}>Novi nalog #2847</div>
                <div style={{fontSize:12,color:"#a0aec0"}}>Pre 5min</div>
              </div>
              <div style={{fontSize:13,color:"#718096"}}>Kesa T-shirt 30x40, 1000 kom</div>
            </div>

            <div style={{padding:16,background:"#f7fafc",borderRadius:12,borderLeft:"4px solid #f59e0b",transition:"all 0.2s",cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div style={{fontWeight:600,fontSize:14,color:"#1a202c"}}>Nalog #2845 u toku</div>
                <div style={{fontSize:12,color:"#a0aec0"}}>Pre 23min</div>
              </div>
              <div style={{fontSize:13,color:"#718096"}}>Folija PE 50cm, napredak 67%</div>
            </div>

            <div style={{padding:16,background:"#f7fafc",borderRadius:12,borderLeft:"4px solid #10b981",transition:"all 0.2s",cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div style={{fontWeight:600,fontSize:14,color:"#1a202c"}}>Nalog #2843 završen</div>
                <div style={{fontSize:12,color:"#a0aec0"}}>Pre 1h</div>
              </div>
              <div style={{fontSize:13,color:"#718096"}}>Kesa sa ručkom 25x35, 500 kom</div>
            </div>

            <div style={{padding:16,background:"#f7fafc",borderRadius:12,borderLeft:"4px solid #667eea",transition:"all 0.2s",cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div style={{fontWeight:600,fontSize:14,color:"#1a202c"}}>Nizak nivo materijala</div>
                <div style={{fontSize:12,color:"#a0aec0"}}>Pre 2h</div>
              </div>
              <div style={{fontSize:13,color:"#718096"}}>PE granulat - potrebna dopuna</div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM GRAFIKONI */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <div style={{background:"white",borderRadius:16,padding:24,boxShadow:"0 4px 6px rgba(0,0,0,0.07)"}}>
          <div style={{fontSize:18,fontWeight:700,color:"#1a202c",marginBottom:20}}>Top proizvodi</div>
          <div style={{height:280,position:"relative"}}>
            <canvas id="chartProizvodi"></canvas>
          </div>
        </div>

        <div style={{background:"white",borderRadius:16,padding:24,boxShadow:"0 4px 6px rgba(0,0,0,0.07)"}}>
          <div style={{fontSize:18,fontWeight:700,color:"#1a202c",marginBottom:20}}>Radnici performanse</div>
          <div style={{height:280,position:"relative"}}>
            <canvas id="chartRadnici"></canvas>
          </div>
        </div>
      </div>

      {/* KEYFRAMES ANIMATION */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}}></style>
    </div>
  );
}
