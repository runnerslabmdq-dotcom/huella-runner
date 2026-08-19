# Plan: botón de tienda por provincia (Open Sports / Todo Trail / Próximamente)

> Creado: 19/08/2026. Plan preparado para implementar rápido cuando
> Esteban confirme que arrancamos — hoy solo queda documentado, no se
> tocó código todavía.

## Objetivo

Generalizar lo que ya se armó como DEV solo para San Luis (PR #152):
en vez de un único `if` puntual, que cada zapatilla muestre el botón
de tienda correcto según la Provincia del usuario:

- **Provincia con sucursal de Open Sports** → botón Open Sports activo
  (rojo/amarillo, como ya está armado en `irATiendaSponsor()`).
- **San Luis** → botón Todo Trail activo (ya armado, PR #152).
- **Cualquier otra provincia** → sigue el botón gris "Próximamente",
  exactamente como está hoy. Sin cambios ahí.

## Mapeo de provincias (confirmado por Esteban, 19/08/2026)

Usando los valores exactos del `<select id="reg-provincia">` (y
`perfil-provincia`, mismo listado) de `gas/index.html`:

### Open Sports activo (5) — según `docs/sucursales-open-sports.md`

- Buenos Aires
- Chubut
- La Pampa
- Neuquén
- Río Negro

### Todo Trail activo (1)

- San Luis

### Próximamente (gris, sin cambios) — 18

- Catamarca
- Chaco
- Ciudad Autónoma de Buenos Aires **(CABA queda afuera de Open Sports
  por ahora — ninguna sucursal de las que tenemos listadas está en la
  Ciudad, todas son de la provincia de Buenos Aires)**
- Córdoba
- Corrientes
- Entre Ríos
- Formosa
- Jujuy
- La Rioja
- Mendoza
- Misiones
- Salta
- San Juan
- Santa Cruz
- Santa Fe
- Santiago del Estero
- Tierra del Fuego
- Tucumán

## Preguntas sin resolver (no bloquean este plan, pero sí una versión más ambiciosa)

- **¿Envío gratis en las provincias sin sucursal?** Open Sports vende
  online a todo el país (esto ya estaba asumido en el comentario
  original de `irATiendaSponsor()`), pero no está confirmado si el
  envío es gratis o tiene costo para el runner. Mientras no se
  confirme, esas provincias se quedan en "Próximamente" — no tiene
  sentido mandar a alguien a comprar si el envío le arruina el precio.
- **Tabla de talles de Todo Trail** — ya quedó anotado en
  `HISTORIAL-CAMBIOS.md` (19/08/2026) que hay al menos una
  inconsistencia (AR 42 = 27cm en el código vs 28cm en un link real).
  Revisar antes de escalar Todo Trail a más provincias.

## Cómo implementarlo (para ir rápido cuando se confirme)

Hoy, en `gas/index.html`, dentro de `renderArmario()` (~línea 3156),
el bloque `shopRowHtml` es un `if/else` puntual:

```js
if (currentUserProvincia === 'San Luis') {
  // Open Sports + Todo Trail
} else {
  // Próximamente
}
```

Pasar esto a una tabla de provincia → sponsor(es), por ejemplo:

```js
const PROVINCIA_SPONSOR = {
  'Buenos Aires': ['openSports'],
  'Chubut':        ['openSports'],
  'La Pampa':      ['openSports'],
  'Neuquén':       ['openSports'],
  'Río Negro':     ['openSports'],
  'San Luis':      ['todoTrail'],
  // el resto: sin entrada → Próximamente
};
```

Y en el `if/else` de `shopRowHtml`, armar los botones según qué
sponsors tenga esa provincia en la tabla (uno, dos, o ninguno → cae al
"Próximamente" de siempre). `currentUserProvincia` ya se carga en
`loadDashboard()` (agregado en el DEV de San Luis), no hace falta
tocar eso.

## Qué NO incluye este plan (a propósito)

- No activa Open Sports en provincias sin sucursal, aunque vendan
  online — queda pendiente la confirmación de envío gratis.
- No agrega ningún sponsor nuevo además de Todo Trail (San Luis) — eso
  espera la investigación que va a hacer Esteban de negocios/empresas
  en otras provincias.
- No toca el texto "Powered by" en ningún lado de la app — decisión
  tomada el 18/08/2026: no hay acuerdo confirmado con ningún sponsor
  todavía como para afirmar eso.
