# Plan (a futuro, no implementado): integración con Strava

> Creado: 27/08/2026. Idea del fundador después de ver que otra app de
> un grupo runner de Mar del Plata sincroniza sola con Strava. Queda
> anotada para pensarla más adelante — **no arrancar sin retomar la
> charla primero**, y no antes de cerrar lo de la reunión con Open
> Sports (ver `docs/reunion-open-sports-guia.md`). Mezclar dos
> proyectos grandes a la vez es la forma más segura de no terminar
> ninguno bien.

## La idea

Que un trote registrado en Strava sume km solo en Huella Runner, sin
que el usuario tenga que cargarlo a mano después de cada carrera. Hoy
esa carga manual es la fricción principal del uso diario de la app.

## Por qué tiene sentido (y no compite con Strava)

Conecta con lo que ya hablamos sobre Strava: en vez de competir con
ellos como app de trackeo, Huella Runner se "sube arriba" de Strava
para lo que ellos no hacen — desgaste de zapatilla por modelo, y
comercio local (cupones, tiendas). Strava sigue siendo donde la gente
ya registra sus salidas; Huella Runner deja de pedirle que lo haga dos
veces.

## Cómo funcionaría, en criollo

Es como conectar Spotify a Instagram para mostrar qué estás
escuchando: el usuario autoriza una vez, y de ahí en más la conexión
anda sola.

Strava tiene una "puerta pública" (API) para esto: una app externa le
pide permiso a un usuario para leer sus actividades, y Strava le avisa
a esa app apenas la persona termina un trote.

## Qué hace falta construir (no es un ajuste chico, es un proyecto propio)

1. Registrar Huella Runner como app en el panel de desarrolladores de
   Strava (gratis, rápido, sin trámite complicado).
2. Pantalla de "Conectar con Strava" — el usuario autoriza una vez
   (flujo estándar: lo manda a Strava, aprueba, vuelve a Huella
   Runner).
3. Guardar y renovar el permiso de cada usuario — el acceso vence
   solo y hay que refrescarlo sin que la persona note nada.
4. Decidir qué zapatilla se lleva el km de cada trote. Strava sabe si
   el usuario etiquetó una zapatilla de las suyas, pero esa lista no
   es la misma que la de Huella Runner. Lo más simple: sumarlo a la
   zapatilla que la persona tenga marcada como "activa" en ese
   momento, sin pedirle que etiquete nada nuevo.
5. Ese km pasa por el mismo filtro anti-fraude que ya existe
   (`trail-points.gs` — límites diario/semanal). No hace falta nada
   nuevo ahí, se reusa tal cual.

## Cuándo retomarlo

Después de la reunión con Open Sports, cuando haya lugar para meterse
en un proyecto grande de nuevo. Si en el medio aparece otra prioridad
más urgente, esto puede seguir esperando — no tiene apuro, es una
mejora de fondo, no un parche.
