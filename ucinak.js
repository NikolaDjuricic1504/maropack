import { supabase } from "./supabase";

export async function startRad(nalog, rola, radnik) {
 return await supabase.from("radni_ucinak").insert([{
   nalog_id: nalog.id,
   rola_id: rola.id,
   radnik,
   pocetak: new Date()
 }]);
}
