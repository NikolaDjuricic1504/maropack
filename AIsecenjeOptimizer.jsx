import { useState } from "react";
import { supabase } from "./supabase.js";

export default function AIsecenjeOptimizer() {
  const [loading, setLoading] = useState(false);

  const rola = {
    id: 1,
    broj: "R-TEST",
    lokacija: "A1",
    lot: "L1",
    metraza: 10000
  };

  const plan = {
    rezovi: [500, 500, 400],
    otpad: 40,
    ukupno_uzeto_m: 3000
  };

  async function prihvatiPlan() {
    try {
      setLoading(true);

      await supabase.from("planovi_secenja").insert([{
        rola_id: rola.id,
        broj_rolne: rola.broj,
        lokacija: rola.lokacija,
        lot: rola.lot,
        plan: plan.rezovi.join(" + "),
        otpad_mm: plan.otpad
      }]);

      await supabase.from("magacin")
        .update({
          metraza: rola.metraza - plan.ukupno_uzeto_m,
          status: "Rezervisano"
        })
        .eq("id", rola.id);

      alert("Plan prihvaćen!");
    } catch (e) {
      console.error(e);
      alert("Greška prilikom prihvatanja plana");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>🧠 Optimizacija sečenja</h2>

      <div style={{ marginTop: 15, padding: 15, background: "#f8fafc", borderRadius: 10 }}>
        <b>Rola:</b> {rola.broj}<br />
        <b>Lokacija:</b> {rola.lokacija}<br />
        <b>LOT:</b> {rola.lot}<br />
        <b>Plan:</b> {plan.rezovi.join(" + ")}<br />
        <b>Otpad:</b> {plan.otpad} mm
      </div>

      <button
        onClick={prihvatiPlan}
        disabled={loading}
        style={{
          marginTop: 15,
          padding: "10px 16px",
          borderRadius: 8,
          background: "#16a34a",
          color: "#fff",
          border: "none",
          fontWeight: 700,
          cursor: "pointer"
        }}
      >
        {loading ? "..." : "✅ Prihvati plan"}
      </button>
    </div>
  );
}
