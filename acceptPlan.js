/**
 * acceptPlan.js
 * Reusable helper to persist cutting plan and update stock in Supabase.
 * Expects:
 *  - rola: { id, broj, lokacija, lot, metraza }
 *  - plan: { rezovi: number[], otpad: number, ukupno_uzeto_m: number }
 */
export async function acceptPlan(supabase, rola, plan) {
  if (!rola || !rola.id) {
    throw new Error("Rola nema validan ID");
  }
  const planText = Array.isArray(plan.rezovi) ? plan.rezovi.join(" + ") : String(plan.rezovi || "");
  const uzeto = Number(plan.ukupno_uzeto_m || 0);
  const novaMetraza = Math.max(0, Number(rola.metraza || 0) - uzeto);

  // 1) upis plana
  const { error: planErr } = await supabase
    .from("planovi_secenja")
    .insert([{
      rola_id: rola.id,
      broj_rolne: rola.broj,
      lokacija: rola.lokacija || null,
      lot: rola.lot || null,
      plan: planText,
      otpad_mm: Number(plan.otpad || 0)
    }]);
  if (planErr) throw planErr;

  // 2) update magacin (metraza + status)
  const { error: updErr } = await supabase
    .from("magacin")
    .update({
      metraza: novaMetraza,
      status: "Rezervisano"
    })
    .eq("id", rola.id);
  if (updErr) throw updErr;

  return { novaMetraza };
}