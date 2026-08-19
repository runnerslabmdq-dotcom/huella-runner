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

## Versión pulida — email corporativo + DM corto (agregada 19/08/2026)

> Segunda vuelta, más formal y más corta, pensada específicamente para
> una empresa grande (no suena igual que escribirle a una tienda
> chica). Dos cambios respecto a la versión de arriba: lidera con el
> valor para Open Sports en el primer párrafo en vez de con el
> contexto, y no menciona la cantidad de usuarios actual — no es
> deshonesto omitirlo en un primer contacto (nadie arranca un pitch
> confesando sus puntos débiles), simplemente no se ofrece ese dato sin
> que lo pidan. Elegir esta versión o la de arriba según el canal.

### Opción A — Email corporativo (recomendada para el primer contacto formal)

```
Asunto: Propuesta de alianza: Huella Runner x Open Sports

Hola, [Nombre del contacto / Equipo de Open Sports]:

Soy Esteban, fundador de Huella Runner, una app desarrollada en Mar
del Plata que ayuda a los corredores a medir el desgaste real de sus
zapatillas por kilómetros.

Les escribo porque hoy la app redirige automáticamente a nuestros
usuarios a comprar en la tienda online de Open Sports según su talle.
Queremos formalizar esta alianza e integrarlos de manera estratégica
desde esta etapa inicial.

Un código de descuento exclusivo para la comunidad de Huella Runner
impulsará las conversiones de compra directa en su tienda y
fortalecerá la adopción de la plataforma entre los corredores de la
región.

Me gustaría hacerles dos consultas breves:
- ¿Les interesa tener visibilidad nacional en la app (vía e-commerce)
  o priorizan las zonas con sucursales físicas?
- ¿Ven viable generar un código de descuento exclusivo para validar el
  volumen de conversión?

¿Tienen 15 minutos esta semana para una llamada breve?

Saludos,
Esteban | Huella Runner
```

### Opción B — Mensaje directo (LinkedIn / WhatsApp)

```
Hola, [Nombre]! Soy Esteban, creador de Huella Runner, una app nacida
en MDQ para que los runners controlen los kilómetros de sus
zapatillas.

Actualmente la app incluye un botón que deriva a los usuarios a
comprar el recambio de su calzado directo en Open Sports filtrado por
talle. Me gustaría formalizar este flujo e integrar un beneficio
exclusivo (ej. código de descuento) para incentivar la compra directa
en su tienda.

¿Tendrás 10-15 minutos esta semana para charlarlo brevemente? ¡Muchas
gracias!
```

## Qué hacer con la respuesta a la pregunta 1 (sucursal vs. nacional)

Sea cual sea la respuesta, actualizar `docs/plan-boton-tienda-por-provincia.md`
con la decisión real de Open Sports antes de tocar código — hoy ese
doc asume "solo donde hay sucursal" como default, pero es un supuesto
nuestro, no confirmado por ellos.
