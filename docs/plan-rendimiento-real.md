# Plan (a futuro, no implementado): "Rendimiento real" de una zapatilla

> Creado: 30/08/2026. El fundador armó en ChatGPT un posteo de
> Instagram (mismo estilo visual de siempre) proponiendo un dato
> nuevo: no solo cuántos km lleva una zapatilla, sino si esa zapatilla
> **rinde más o menos de lo esperado**, comparado contra datos reales
> — no contra lo que dice la caja. Queda anotado para pensarlo y
> construirlo más adelante, no implementado todavía.

## Las 4 ideas que surgieron (resumen)

1. **Cajita "rendimiento real" en la tarjeta** (la del mockup) — el km
   actual de esa zapatilla puntual, comparado contra el promedio real
   de la comunidad para ese mismo modelo.
2. **Ranking público de "rendimiento real" por modelo/marca** — qué
   modelos aguantan más o menos km en la vida real de corredores de
   Mar del Plata. Contenido único, shareable, y argumento fuerte para
   el pitch de Open Sports.
3. **"Certificado" al retirar una zapatilla** — conecta con la idea
   vieja de la tarjeta de despedida (ver conversación anterior sobre
   ideas disruptivas): al archivar, un resumen de cómo rindió
   comparada con el promedio real.
4. **Aviso cuando cruza el promedio real** — si una zapatilla supera
   (o queda muy por debajo) el promedio real de duración de su
   modelo, la app avisa.

Elegida para arrancar: **la 1**, porque es la más chica y usa datos
que ya se están juntando.

## Por qué esto es honesto (y no un truco de marketing)

El "esperado" **no puede ser un número inventado** — sería prometer
algo que no se puede sostener, lo mismo que se cuidó antes con el
mensaje del cupón de desgaste. La base tiene que ser dato real:
`Cache_Modelos`, la tabla que ya arma `actualizarCacheModelosNocturno()`
(social-proof.gs) todas las noches, con el promedio real de km al que
la gente llega con cada modelo.

**Ojo con un detalle a corregir antes de construir esto**: hoy
`Cache_Modelos` calcula `Promedio_KM_Critico` usando **zapatillas
archivadas** (`estado === 'archivada'`), sin importar por qué se
archivaron — alguien puede archivar una zapatilla a los 50km por una
lesión, y eso arrastraría el promedio para abajo sin que tenga que ver
con el desgaste real. Para que "rendimiento real" sea un dato
confiable, conviene cambiar el criterio a: **zapatillas (archivadas o
no) que llegaron a estado "Crítico"** (superaron su propio KM_Limite)
— eso sí mide desgaste, no motivos ajenos.

## Cómo se construiría — opción 1 en detalle

**Qué medir**: por cada combinación Marca+Modelo, dos números:
- `Muestra_Criticos`: cuántas zapatillas de ese modelo llegaron a
  estado Crítico entre todos los usuarios (activas o archivadas).
- `Promedio_Km_Critico`: el promedio de km al que llegaron cuando
  cruzaron ese umbral.

**Backend — 2 cambios**:
1. `actualizarCacheModelosNocturno()` (social-proof.gs): cambiar el
   filtro de "estado === archivada" a "estado === Crítico" (o
   `km >= limite`), y sumar el conteo de muestra.
2. Nueva función (o extender `getUserShoes()` directamente, para no
   duplicar pedidos al servidor por cada zapatilla): calcular, para
   cada zapatilla activa del usuario, `% = (kmActual - PromedioKmCritico)
   / PromedioKmCritico * 100` — pero **solo si `Muestra_Criticos` llega a
   un mínimo** (propongo arrancar con 5 — mostrar una comparación con
   1 o 2 casos sería mentir con una muestra chica). Si no hay
   suficiente muestra, la zapatilla simplemente no muestra la cajita
   — mismo criterio que ya usás para "esNuevo" en el dato de
   comunidad.

**Frontend**: la cajita solo aparece cuando el dato está disponible.
Texto claro sobre qué significa (no solo el número): "+18% vs.
promedio real de este modelo" en vez de solo "+18%", para que quede
claro contra qué se compara.

**Panel admin**: nueva pestaña (o extensión de una de Insights) con
una tabla por modelo — Marca, Modelo, Muestra, Promedio km a Crítico,
ordenada de mayor a menor duración real. Sirve para dos cosas: saber
cuándo hay "suficiente dato" para mostrar esto en público, y es
contenido útil de por sí para el pitch de Open Sports ("estos son los
datos reales de qué dura más, no lo que dice el fabricante").

## Sobre postear el mockup ahora

**No, todavía no** — y el fundador ya lo intuyó él mismo. El mockup
muestra "+18% — Rinde más de lo esperado" como si fuera un dato real
ya disponible, pero la comparación recién tiene sentido con volumen de
uso — varios usuarios cargando el mismo modelo, durante semanas. Postear
ese número ahora sería mostrar una función que no existe con un dato
que nadie midió — exactamente el tipo de promesa que este proyecto
evitó a propósito antes (mensaje del cupón).

**Alternativa honesta**: postear el concepto, no el resultado —
"Estamos armando algo nuevo: vas a poder saber si tu zapatilla rinde
más o menos de lo esperado, con datos reales de corredores como vos.
Cuantos más seamos cargando, más preciso se pone — sumate." Convierte
la limitación (falta de datos) en el gancho mismo del posteo (efecto
red: más gente = mejor producto), sin prometer un número que todavía
no existe.
