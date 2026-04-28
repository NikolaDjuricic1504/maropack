import { supabase } from "./supabase";

export async function izvrsiFormatiranje(rola, plan) {
 const delovi = plan.split("+").map(x => Number(x.trim()));

 await supabase.from("magacin")
   .update({ status: "Formatirano" })
   .eq("id", rola.id);

 const nove = delovi.map((sirina, i) => ({
   parent_rola_id: rola.id,
   operacija: "formatiranje",
   sirina,
   metraza: rola.metraza,
   br_rolne: rola.br_rolne + "-" + (i+1)
 }));

 await supabase.from("magacin").insert(nove);
}
