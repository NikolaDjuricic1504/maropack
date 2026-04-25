import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function DashboardProizvodnja() {
 const [data, setData] = useState([]);

 useEffect(() => {
   load();
   const i = setInterval(load, 5000);
   return ()=>clearInterval(i);
 }, []);

 async function load() {
   const { data } = await supabase.from("radni_ucinak").select("*");
   setData(data || []);
 }

 return (
   <div>
     <h2>🏭 Proizvodnja</h2>
     {data.map((r,i)=>(
       <div key={i}>
         {r.radnik} - {r.kolicina || 0}
       </div>
     ))}
   </div>
 );
}
