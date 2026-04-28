export function normalizujNalog(nalog) {
  return {
    broj: nalog.ponBr || nalog.br || "MP-0000",
    kupac: nalog.kupac || "—",
    proizvod: nalog.prod || "—",
    kolicina_m: Number(nalog.kol || 0),
    sirina: Number(nalog.sir || 0),
    status: nalog.status || "Ceka",
    original: nalog
  };
}
