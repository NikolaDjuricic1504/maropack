import { supabase } from "./supabase";

export async function proveriStart(nalog, qr) {
 const { data: plan } = await supabase.from("planovi_rezanja").select("*").eq("nalog_id", nalog.id);
 if (!plan.length) return { ok:false, msg:"Nema plana" };

 const { data: rola } = await supabase.from("magacin").select("*").eq("br_rolne", qr).single();
 if (!rola) return { ok:false, msg:"Rola ne postoji" };

 return { ok:true };
}
