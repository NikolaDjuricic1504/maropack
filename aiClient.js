export async function acceptPlan(supabase, rola, plan) {

  const planText = plan.rezovi.join(" + ");

  await supabase.from("planovi_secenja").insert([{
    rola_id: rola.id,
    broj_rolne: rola.broj,
    lokacija: rola.lokacija,
    lot: rola.lot,
    plan: planText,
    otpad_mm: plan.otpad
  }]);

  const novaMetraza = rola.metraza - plan.ukupno_uzeto_m;

  await supabase.from("magacin")
    .update({metraza:novaMetraza, status:"Rezervisano"})
    .eq("id",rola.id);
}
