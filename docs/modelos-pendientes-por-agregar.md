# Modelos pendientes de agregar al catálogo

> Creado: 20/08/2026. Esteban va pegando listados de zapatillas de
> distintos negocios (tiendas físicas y online de Argentina) para que
> se comparen contra `catalogo{}` en `gas/index.html`. Acá queda
> anotado lo que falta, para agregarlo en tandas cuando se decida —
> este archivo se va sumando cada vez que llega un listado nuevo, no
> se agrega nada al catálogo real hasta que Esteban lo confirme.

## Cómo leer este archivo

- **Nuevos, sin dudas**: el modelo no está en el catálogo bajo ningún
  nombre parecido — listo para agregar tal cual, solo falta que
  Esteban diga que sí.
- **Dudosos**: puede ser el mismo modelo que ya tenemos con otro
  nombre, o una variante/edición especial — necesitan que Esteban
  confirme antes de agregarlos como si fueran nuevos.
- **Baja prioridad**: generación anterior de un modelo que ya tenemos
  en su versión más nueva (ej. tenemos Pegasus 41, aparece Pegasus 39
  en la tienda) — se anota igual por si sirve, pero no es urgente.
- **Marca nueva**: la tienda vende una marca que hoy no existe en
  absoluto en el catálogo (ni siquiera como opción en el desplegable).

---

## Open Sports (20/08/2026)

Fuente: listado scrapeado de las primeras 5 páginas de zapatillas de
running de opensports.com.ar (de 24 páginas totales — falta el resto).

### Nuevos, sin dudas

**Adidas:**
- 4DFWD X Strung
- Duramo RC2
- Galaxy 8
- Response Super
- Supernova Stride
- Supernova Stride 2

**Nike:**
- Experience Run 11
- Flex Experience RN 12 / Flex Experience Run 12 (mismo modelo, nombre
  con variación en la fuente)
- Free RN NN
- Interact Run
- Journey Run
- Journey Run Beyond
- Juniper Trail 2 GORE-TEX (trail)
- Kiger 9 / Terra Kiger 9 (trail — mismo modelo, dos nombres en la fuente)
- Renew Run 4
- Run Swift 3
- Structure 26
- Zoom Fly 6

**Puma:**
- Deviate Nitro Elite 3 Marathon Series (edición especial)
- Fast-R Nitro Elite 2
- Skyrocket Lite 2
- Softride Carson
- Softride Enzo 5
- Softride Symmetry Fuzion

**New Balance:**
- Fresh Foam X Hierro V8 (sería el primer modelo de trail de esta marca
  en el catálogo)

### Dudosos — confirmar con Esteban antes de agregar

- **Nike Lunarspider R 6** — ¿es el mismo "LunarSpider" que ya
  tenemos (sin número), o una versión distinta?
- **Nike Reactx Infinity** — ¿es el mismo "Infinity RN 4 Blueprint"
  que ya tenemos, con otro nombre comercial, o un modelo aparte?
- **Asics Gel-Kayano 32** — probablemente el mismo "Cayano 32" que ya
  tenemos (posible typo nuestro: "Kayano" es el nombre real de Asics,
  "Cayano" no existe como marca). Revisar y corregir el nombre en vez
  de agregar como nuevo.

### Baja prioridad (generación anterior, ya tenemos la más nueva)

- Nike Air Zoom Pegasus (genérico/viejo — ya tenemos 39/40/41/42)
- Nike Downshifter 12 (ya tenemos 13)
- Nike Revolution 6 (ya tenemos 7 y 8)
- Nike Vaporfly 3 Electric (ya tenemos Vaporfly 4)
- Puma Velocity Nitro 3 (ya tenemos Velocity Nitro 4)

### Marcas nuevas — no existen en absoluto en el catálogo hoy

- **Reebok** (visto: Energen Lite JP) — marca no existe ni en el
  desplegable de "Nueva zapatilla".
- ~~**Topper** (visto: Fast)~~ — agregada al catálogo y al desplegable
  el 26/08/2026 (primer modelo cargado: Stance 3, no Fast — el
  fundador pasó otra foto). El modelo "Fast" visto acá en Open Sports
  sigue pendiente de agregar si se consigue una foto.

Nota técnica: agregar una marca nueva necesita el mismo cuidado que la
vez que "On" no aparecía — hay que sumarla tanto a `catalogo{}` como
a la lista fija de `<option>` del desplegable `<select id="shoe-marca">`,
si no, no aparece como elegible aunque esté en el catálogo (ver
`HISTORIAL-CAMBIOS.md`, 17/08/2026 — bug de "On").

---

## Pendiente

- Terminar de revisar las 19 páginas restantes de Open Sports (esto es
  solo de las primeras 5 de 24).
- Seguir sumando otras tiendas a medida que Esteban las vaya pasando.
