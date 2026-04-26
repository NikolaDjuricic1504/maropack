import React, { useState } from "react";
import DashboardProizvodnja from "./DashboardProizvodnja.jsx";
import AIponuda from "./AIponuda.jsx";
import AIPackingLista from "./AIPackingLista.jsx";

function Placeholder({ title }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <p>Ovaj deo je spreman kao mesto za tvoj postojeći modul.</p>
    </div>
  );
}

const pages = [
  ["dashboard", "Dashboard"],
  ["aiPonuda", "AI ponuda"],
  ["aiPacking", "AI packing lista"],
  ["radniNalog", "Radni nalog"],
  ["kalkulacije", "Kalkulacije"],
  ["magacin", "Magacin"],
  ["rezanje", "Plan rezanja"]
];

export default function App() {
  const [page, setPage] = useState("aiPonuda");

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardProizvodnja />;
      case "aiPonuda": return <AIponuda />;
      case "aiPacking": return <AIPackingLista />;
      case "radniNalog": return <Placeholder title="Radni nalog" />;
      case "kalkulacije": return <Placeholder title="Kalkulacije" />;
      case "magacin": return <Placeholder title="Magacin" />;
      case "rezanje": return <Placeholder title="Plan rezanja" />;
      default: return <AIponuda />;
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">MAROPACK</div>
        <div className="sub">AI ponude • packing liste • nalozi</div>
        {pages.map(([key, label]) => (
          <button
            key={key}
            className={"nav " + (page === key ? "active" : "")}
            onClick={() => setPage(key)}
          >
            {label}
          </button>
        ))}
      </aside>

      <main className="main">
        <div className="card">
          <h1>Maropack AI sistem</h1>
          <p><span className="badge">BUILD OK</span> Fajlovi su ispravno razdvojeni.</p>
        </div>
        {renderPage()}
      </main>
    </div>
  );
}
