import { supabase } from "./supabase";

export async function proveriQR(qr, nalog) {
 const { data } = await supabase.from("magacin").select("*").eq("br_rolne", qr).single();
 if (!data) return { ok:false, msg:"Rola ne postoji" };
 if (data.status==="Iskorišćeno") return { ok:false, msg:"Već iskorišćena" };
 return { ok:true, rola:data };
}
