# Pitch específico para Open Sports

> Creado: 19/08/2026. **Borrador, pendiente de pulir** — Esteban lo va
> a revisar antes de usarlo tal cual.
>
> Distinto de `docs/pitch-tiendas-partnership.md` (pensado para una
> tienda chica/local): Open Sports ya es una cadena grande, con
> presencia fuerte en Mar del Plata y sucursales en varias provincias
> (ver `docs/sucursales-open-sports.md`). El ángulo acá es distinto:
> formalizar algo que ya está pasando sin acuerdo formal, no arrancar
> de cero.
>
> Contexto técnico relevante para la charla: el botón "Ver en tienda"
> de la app ya manda tráfico a `opensports.com.ar`, filtrado por
> género y talle (`irATiendaSponsor()` en `gas/index.html`) — pero
> nunca se les avisó ni se acordó nada formalmente con ellos. Y hay un
> plan ya armado (`docs/plan-boton-tienda-por-provincia.md`) para
> mostrar ese botón solo en las provincias donde tienen sucursal — pero
> esa decisión depende de lo que ellos prefieran, no es nuestra.

## Mensaje

```
Hola! Soy Esteban, de Huella Runner — una app que armamos en Mar del
Plata para que los corredores controlen el desgaste real de sus
zapatillas (cuántos km lleva cada par, cuándo conviene revisarlas).

Te escribo porque hay algo que ya está pasando sin que lo hayamos
hablado formalmente: la app tiene un botón que manda a los corredores
directo a comprar a Open Sports, filtrado por su talle. Lo armamos así
porque son la referencia obvia en Mar del Plata, pero nunca lo
charlamos con ustedes — y me parece que corresponde.

Te propongo formalizarlo, y sumar un paso más: hoy tenemos pocos
usuarios todavía (recién estamos arrancando en serio), pero justamente
por eso creo que un beneficio real de Open Sports —un código de
descuento exclusivo, por ejemplo— no sería un premio por usuarios que
ya tenemos, sino el gancho que nos ayudaría a conseguirlos. Un
corredor que ve "descuento real con Open Sports" tiene un motivo
concreto para registrarse, mucho más fuerte que "controlá tus km".

Dos cosas puntuales que te quería preguntar:
1. ¿Les interesa aparecer en toda la app a nivel país (venden online a
   cualquier provincia), o prefieren que solo aparezcan donde tienen
   sucursal física?
2. ¿Tendría sentido para ustedes armar un código de descuento
   exclusivo para la comunidad de Huella Runner, aunque hoy seamos
   pocos? Lo pienso como una inversión conjunta en crecer juntos, no
   como pago por algo ya armado.

¿Tenés 15 minutos esta semana para charlarlo?
```

## Qué hacer con la respuesta a la pregunta 1 (sucursal vs. nacional)

Sea cual sea la respuesta, actualizar `docs/plan-boton-tienda-por-provincia.md`
con la decisión real de Open Sports antes de tocar código — hoy ese
doc asume "solo donde hay sucursal" como default, pero es un supuesto
nuestro, no confirmado por ellos.
