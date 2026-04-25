import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase.js";
import { LOGO_B64, SPULNA_B64 } from "./constants.js";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Magacin, {MobilniMagacin} from "./Magacin.jsx";
import KalkulatorKese2 from "./KalkulatorKese2.jsx";
import PracenjeNaloga from "./PracenjeNaloga.jsx";
import NalogFolija from "./NalogFolija.jsx";
import NalogKesaView from "./NalogKesaView.jsx";
import NalogSpulnaView from "./NalogSpulnaView.jsx";
import NoviNalogIzBaze from "./NoviNalogIzBaze.jsx";
import AIpanel from "./AIpanel.jsx";

// ===================== MATERIJALI =====================
const MAT_DATA = {
  "BOPP": [5,10,15,18,20,25,28,30,35,40,45,50,55,60,65,70].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP SEDEF": [5,10,15,20,25,30,35,38,40,45].map(d=>({d,t:+(d*0.65).toFixed(2)})),
  "BOPP BELI": [5,10,15,20,25,30,35,40,45,50].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "LDPE": [10,15,20,25,30,35,40,45,50,55,60].map(d=>({d,t:+(d*0.925).toFixed(2)})),
  "CPP": [5,10,15,18,20,25,28,30,35,40,45,50,55,60].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "PET": [12,15,19,20,21,36,50,150].map(d=>({d,t:+(d*1.4).toFixed(2)})),
  "OPA": [12,15,20,25,30,35,40].map(d=>({d,t:+(d*1.1).toFixed(2)})),
  "OPP": [5,10,15,18,20,25,28,30,35,40,45,50].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "PLA": [5,10,15,20,25,30,35,40,45].map(d=>({d,t:+(d*1.24).toFixed(2)})),
  "HDPE": [5,8,12,15,17,20,25,30,35,40,45,50].map(d=>({d,t:+(d*0.94).toFixed(2)})),
  "ALU": [7,9,12,15,20,25,30,35,40,45,50].map(d=>({d,t:+(d*2.71).toFixed(2)})),
  "CELULOZA": [10,15,20,23,28,30,35,40,45,50].map(d=>({d,t:+(d*1.45).toFixed(2)})),
  "CELOFAN": [10,15,20,23,28,30,35,40,45,50].map(d=>({d,t:+(d*1.45).toFixed(2)})),
  "PA": [10,15,20,23,28,30,35,40,45,50].map(d=>({d,t:+(d*1.14).toFixed(2)})),
  "PA/PE koestruzija": [10,15,20,23,28,30,35,40,45,50].map(d=>({d,t:+(d*1.0).toFixed(2)})),
  "CPP PLC": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "CPP PLCB": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "CPP PLCBZ": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "CPP PLCDF": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "CPP PLCM": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "CPP PLCML": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "CPP PLCMLS": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "CPP PLCBAF": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP FXC": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP FXCB": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP FXCM": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP FXCMT": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP FXPMT": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP FXCFM": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP FXCW": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP FXPF": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP FXS": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP FXA": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP FXAA": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP FXPA": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP FXPM": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP FXPFM": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP FXPFB": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP FXPLA": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP FXPLF": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP FXPU": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP FXCLS": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP FXCMLS": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP FXCHFM": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP FXPBR": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP FXCHM": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
  "BOPP FXCMB": [12,15,18,20,25,30,35,40,45,48,50,60,70,80,90,100].map(d=>({d,t:+(d*0.91).toFixed(2)})),
};

const CENE = {
  "BOPP":3.1,"BOPP SEDEF":3.5,"BOPP BELI":3.2,"LDPE":1.8,"CPP":2.2,
  "PET":3.5,"OPA":4.0,"OPP":2.9,"PLA":3.8,"HDPE":1.9,"ALU":7.5,
  "CELULOZA":3.0,"CELOFAN":3.0,"PA":4.2,"PA/PE koestruzija":1.8,
  "CPP PLC":2.4,"CPP PLCB":2.4,"CPP PLCBZ":2.4,"CPP PLCDF":2.4,
  "CPP PLCM":2.4,"CPP PLCML":2.4,"CPP PLCMLS":2.4,"CPP PLCBAF":2.4,
  "BOPP FXC":3.1,"BOPP FXCB":3.1,"BOPP FXCM":3.1,"BOPP FXCMT":3.1,
  "BOPP FXPMT":3.1,"BOPP FXCFM":3.1,"BOPP FXCW":3.1,"BOPP FXPF":3.1,
  "BOPP FXS":3.1,"BOPP FXA":3.1,"BOPP FXAA":3.1,"BOPP FXPA":3.1,
  "BOPP FXPM":3.1,"BOPP FXPFM":3.1,"BOPP FXPFB":3.1,"BOPP FXPLA":3.1,
  "BOPP FXPLF":3.1,"BOPP FXPU":3.1,"BOPP FXCLS":3.1,"BOPP FXCMLS":3.1,
  "BOPP FXCHFM":3.1,"BOPP FXPBR":3.1,"BOPP FXCHM":3.1,"BOPP FXCMB":3.1,
};

export { MAT_DATA, CENE };

const USERS = [
  {id:1,ime:"Admin",uloga:"admin",pass:"admin123"},
  {id:2,ime:"Jovana",uloga:"radnik",pass:"jovana123"},
  {id:3,ime:"Jelena",uloga:"radnik",pass:"jelena123"},
  {id:4,ime:"Dunja",uloga:"radnik",pass:"dunja123"},
  {id:5,ime:"Tihana",uloga:"radnik",pass:"tihana123"},
  {id:6,ime:"Milan",uloga:"radnik",pass:"milan123"},
];

// Ostatak App.jsx koda ostaje isti kao što si dao...
// (Kompletna implementacija sa svim funkcijama)

export default function App() {
  // ... sav tvoj kod ...
}
