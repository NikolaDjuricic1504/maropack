export const statusi = ['Kreiran','Materijal rezervisan','U štampi','U kasiranju','U rezanju','Završen','Isporučen'];
export const radnici = ['Milan','Jovana','Jelena','Dunja','Tihana'];
export const masine = ['Štampa 1','Kasirka 1','Kasirka 2','Rezač 1','Špulna'];
export const initialNalozi = [
  {id:'n1', br:'MP-2026-0001', kupac:'Maxi', proizvod:'BOPP/PE 250mm', status:'U štampi', cena:4200, trosak:3100, masina:'Štampa 1'},
  {id:'n2', br:'MP-2026-0002', kupac:'Banda Bianca', proizvod:'Triplex 840mm', status:'Materijal rezervisan', cena:6500, trosak:4700, masina:'Kasirka 1'},
  {id:'n3', br:'MP-2026-0003', kupac:'Mayer', proizvod:'Kese 95mm', status:'U rezanju', cena:2800, trosak:1900, masina:'Rezač 1'}
];
export const initialMagacin = [
  {id:'m1', materijal:'Papir', debljina:'55g', sirina:840, kg:12400, rezervisano:2100, rolni:11, lot:'RS-55-A'},
  {id:'m2', materijal:'Papir', debljina:'60g', sirina:840, kg:9800, rezervisano:0, rolni:25, lot:'RS-60-B'},
  {id:'m3', materijal:'BOPP', debljina:'20µ', sirina:1250, kg:8200, rezervisano:900, rolni:8, lot:'BOPP20-C'},
  {id:'m4', materijal:'ALU', debljina:'7µ', sirina:840, kg:1600, rezervisano:300, rolni:3, lot:'ALU7-D'}
];
