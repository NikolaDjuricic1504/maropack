# Maropack - full dizajn operativnih naloga

Uploaduj `NaloziOperacije.jsx` u `src/` i zameni postojeći fajl.

U App.jsx mora da postoji:

```jsx
import NaloziOperacije from "./NaloziOperacije.jsx";
```

I render:

```jsx
{page==="operativni_nalozi" && (
  <NaloziOperacije nalogId={glavniNalogId} />
)}
```

Komponenta prikazuje:
- Potreba materijala
- Nalog za štampu
- Nalog za kaširanje
- Nalog za rezanje
- Nalog za perforaciju
- Izgled na rolni
