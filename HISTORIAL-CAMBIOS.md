# Historial de cambios — Huella Runner

Este archivo es un registro de todo lo que se fue arreglando o cambiando en
cada archivo del proyecto. **Antes de pedir un arreglo, fijate acá si ya
está hecho** — así no le pedimos a Claude que revise dos veces lo mismo.

Cada archivo `.gs` y `.html` tiene además su propio encabezado con fecha y
hora de la última actualización, para que sepas si lo que tenés pegado en
el GAS es la versión más nueva.

> Se actualiza cada vez que se mergea un cambio a GitHub.

---

## 29/07/2026 (noche, más tarde) — Cartel de Instagram: ya no bloquea, y más claro

Seguimiento del cambio de recién (registro más corto). El fundador
confirmó también suavizar el aviso que se agregó para quien entra desde
Instagram — la primera versión frenaba el redirect automático y pedía
elegir algo antes de seguir (salir a Chrome, o tocar "Continuar acá
igual"). Con la conversión de registro ya floja (4 de 500 seguidores),
una decisión extra justo en la entrada podía estar espantando gente sin
necesidad.

`pwa/index.html`:
- El aviso ya **no frena a nadie** — se saca el botón "Continuar acá
  igual" y el estado de pausa. Ahora entra solo para todos, como
  siempre, solo que con un poco más de tiempo en pantalla si viene de
  Instagram/Facebook/TikTok (3.5s en vez de 1.2s) para que alcance a
  leer el aviso antes de irse.
- Texto reescrito para ser más directo: arranca tranquilizando ("la app
  va a andar igual, seguí tranquilo") antes de explicar el paso opcional
  para instalarla bien (ícono, pantalla completa).

Probado localmente con Playwright simulando el user-agent de Instagram:
confirmado que redirige solo a los 3.5s sin necesitar ningún toque.

---

## 29/07/2026 (noche) — Registro más corto: de 10 campos visibles a 6

Con 500 seguidores en Instagram y solo 4 registros reales, el fundador
sospechó que el formulario de registro (10 campos: nombre, apellido,
email, 2 contraseñas, fecha de nacimiento, provincia, ciudad, celular,
nivel, grupo) era parte del problema — mucha fricción para alguien que
recién llega desde la bio de Instagram.

Se separaron los campos en dos grupos:
- **Visibles siempre**: Nombre, Apellido, Email, Contraseña (x2), Nivel
  de Corredor.
- **Colapsados atrás de "👤 Completar perfil (opcional)"**: Fecha de
  Nacimiento, Provincia, Ciudad, Celular, Grupo de Running — cerrado por
  defecto, mismo mecanismo de acordeón que ya usa "VER LEGALES +".

Ninguno de estos 5 campos era obligatorio del lado del servidor
(`registerUser()` en `codigo.gs` no los valida, ya se guardaban vacíos
si faltaban) — el problema era solo visual: se mostraban todos juntos y
obligaban a scrollear de más antes de llegar al botón "Crear Cuenta".
Cambio solo en `gas/index.html` (reordenar + colapsar), sin tocar
backend ni validaciones.

El ícono del botón (👤, silueta neutra) se eligió a propósito en vez de
un emoji de persona con género marcado, a pedido del fundador.

Probado localmente con Playwright: capturas antes/después muestran el
formulario corto entrando sin scroll en una pantalla de celu, y el
acordeón abriendo/cerrando bien.

Quedó pendiente para más adelante (no se tocó todavía, a la espera de
decidir con el fundador): suavizar el cartel de "abrí esto en el
navegador" que se agregó ayer para quien entra desde Instagram — podría
estar sumando fricción justo en el peor momento del embudo (primer
contacto), compitiendo con el objetivo de bajar el abandono.

---

## 29/07/2026 (mañana) — Login: "¿No tienes cuenta?" y "¿Olvidaste tu contraseña?" más arriba

El fundador probó el login desde el navegador in-app de Instagram (con el
aviso nuevo de ayer ya andando) y notó que los links de "¿No tienes
cuenta? Regístrate" y "¿Olvidaste tu contraseña?" quedaban muy abajo —
había que scrollear pasando toda la tarjeta de texto ("Huella Runner ·
MDQ · ARG... Gestioná tus zapatillas...") para encontrarlos.

Se movieron los dos justo debajo del botón "Iniciar Sesión" (en ese
orden: primero "¿No tienes cuenta?", después "¿Olvidaste tu
contraseña?"), antes de la tarjeta de texto. Cambio solo de orden en
`gas/index.html`, sin tocar textos, estilos ni funciones.

---

## 28/07/2026 (noche) — pwa/index.html: aviso al entrar desde Instagram/Facebook

El fundador ya subió el link de Vercel (`huella-runner.vercel.app`) a la
bio de Instagram y notó que "se veía todo un poco más grande" — la causa
real: Instagram (y Facebook, TikTok) abren los links de la bio en su
propio navegador "de adentro" (in-app browser), no en Chrome/Safari de
verdad. Eso explica varias cosas encadenadas:
- El texto puede renderizarse distinto (zoom/tamaño distinto al de un
  navegador normal).
- "Agregar a pantalla de inicio" casi nunca instala bien ahí — puede
  explicar el ícono genérico que había visto antes.
- Nunca se logra pantalla completa real desde ese navegador, por más que
  el código esté bien — es una limitación del navegador in-app, no de la
  app.

No se puede forzar que Instagram abra el link en el navegador real (lo
bloquean a propósito para no perder al usuario). Se agregó en su lugar:
`pwa/index.html` ahora detecta el user-agent de Instagram/Facebook/TikTok
y, si lo encuentra, frena el redirect automático y muestra un cartel
explicando el paso manual ("tocá ⋯ arriba a la derecha → Abrir en el
navegador"), con un botón "Continuar acá igual" para quien prefiera
seguir sin salir. En cualquier otro navegador, el comportamiento no
cambió: sigue entrando derecho después de 1.2s, como siempre.

Probado localmente con Playwright simulando el user-agent de Instagram y
uno normal — el cartel aparece solo en el primer caso.

---

## 28/07/2026 (mañana, más tarde) — Semáforo de desgaste, arreglado para usar % del límite propio

Seguimiento de la revisión de bugs de esta mañana: el fundador pidió
arreglar el semáforo/alertas de desgaste del panel admin para que use
porcentaje en vez de km crudo.

Antes, los colores (verde/naranja/rojo) y las bandas del semáforo
("600-800 km", "> 800 km") usaban un tope fijo de km — un resabio de
cuando todas las zapatillas compartían un solo límite global. Pero
desde que existe el límite de km por zapatilla (`KM_Limite`, cada una
puede tener el suyo), esas bandas fijas ya no significaban nada real:
una zapatilla con límite de 400 km y 420 km encima está bastante más
urgente que una con límite de 1000 km y 750 km encima, aunque el km
crudo de la segunda sea más alto.

- `codigo.gs`: `getAdminDashboardData()` ahora manda `limite` y
  `porcentaje` (km ÷ límite propio) en cada zapatilla de
  `alertasDesgaste`.
- `admin.html`: `_kmBarColor()` colorea por porcentaje (100-119%
  amarillo, 120-149% naranja, ≥150% rojo) en vez de por km. Las
  tarjetas de "Alertas de desgaste" muestran el % como número principal
  (con "km / límite" como detalle chico), y la barra ahora representa
  cuánto se pasó del límite, no una escala fija de 0 a 1000 km. El
  semáforo de Insights ("Estado Zapas") y su detalle por tramo usan el
  mismo criterio.

"Saludables" (verde) no cambió: sigue siendo el total de zapatillas
activas menos las que ya llegaron a su propio límite — eso ya no
dependía de un número de km fijo.

---

## 28/07/2026 (mañana) — Bug real: el panel admin contaba entrenamientos rechazados como actividad

Revisión completa de bugs pedida por el fundador antes de la Open Beta
(repaso línea por línea de todos los `.gs` y los 2 `.html` grandes).

Encontrado en `admin.gs`: cuando el anti-fraude rechaza un entrenamiento
(ej. alguien tipea "300 km" en vez de "30 km" y supera el máximo diario
permitido), ese intento queda guardado en el Sheet con 0 km acreditados —
eso ya estaba bien. El problema era que 4 funciones del panel admin no
distinguían un rechazo de una actividad real, y lo contaban igual:

- `getAdminStats()` — "Activos hoy" y "Registros hoy" del resumen general.
- `getAdminUsuarios()` — el punto verde de "entrenó hoy" en la tabla de usuarios.
- `getActividadReciente()` — podía mostrar "Fulano sumó 0 km" en la lista
  de actividad reciente, como si fuera un evento real.
- `getActividadPorDia()` — el gráfico de barras de los últimos 7 días.

No inflaba los kilómetros totales (esos siempre fueron 0 para un
rechazo), solo los conteos de "cuánta gente entrenó". `getInsightsExtendidos()`
(la función más nueva, la de Constancia/Horario Pico/Abandono) ya
filtraba esto bien desde que se creó — las 4 funciones viejas nunca se
habían actualizado con el mismo criterio. Ahora las 4 excluyen los
entrenamientos con `Estado_Validacion = "Rechazada"`, igual que ya hacía
la más nueva.

Con usuarios reales usando la app (algo que va a pasar seguido con
typos), esto habría inflado los números que el fundador mira en vivo
durante el lanzamiento — no afectaba a los usuarios, solo al panel.

En la misma revisión se miraron también 2 cosas menores, que quedan
anotadas pero sin tocar por ahora (no son urgentes):
- Los colores del semáforo/alertas de desgaste en Insights usan un
  umbral fijo (300/600/800/1000 km) en vez del límite propio de cada
  zapatilla (que ahora puede ser distinto por zapatilla) — el color
  podría no reflejar bien la urgencia real en un caso extremo.
- `gas/social-proof-ui.html` quedó sin uso: el modal "dato de comunidad"
  vive directo en `index.html` desde hace un tiempo. Se puede borrar del
  proyecto de Apps Script sin miedo, no lo llama nadie.

---

## 27/07/2026 (noche) — Fix: "Hola, [Nombre]" se pisaba con el logo en pantallas chicas

El fundador mandó una foto real de un celu más angosto que el suyo: el
saludo "Hola, Esteban" (arriba a la derecha del dashboard, al lado del
logo y los íconos) no entraba, se partía en 2 líneas y quedaba pisando
"HUELLA RUNNER". En su propio celu (más ancho) se veía bien.

Se ocultó el saludo solo por debajo de 400px de ancho de pantalla
(`.saludo-topbar`, nuevo `@media (max-width: 400px)`) — en pantallas
normales sigue ahí como siempre, solo desaparece donde genuinamente no
entra. Los íconos (🔔 🌙 Salir) quedan igual en todos los tamaños.

---

## 27/07/2026 (tarde) — Landing nueva: la guía de uso + fix del botón "atrás"

### `landing/index.html` — ahora es la guía de uso

A pedido del fundador, la landing dejó de ser una página de marketing y
pasó a ser **la explicación de cómo se usa la app**, para acompañar el
lanzamiento de la Open Beta del 1 de agosto. Está armada sobre el guión
de 11 pasos que él escribió, con la estética exacta de la app (mismos
colores, Bebas Neue + Montserrat, el logo inclinado).

Además de los pasos, incluye las 3 cosas que pidió explícitamente:
- **El cartel azul de Google** y cómo cerrarlo (con la ✕ azul), aclarando
  que es normal y no un error.
- **Que esto es una Open Beta** y puede haber errores menores, con un
  pedido de feedback.
- **Cómo instalar la app en la pantalla de inicio**, con los pasos
  separados para Android (Chrome) y iPhone (Safari).

Se sube a Vercel como sitio estático, con **Root Directory = `landing/`**.
Se eliminó el `landing.html` que estaba suelto en la raíz del repo.

De paso resuelve dos cosas que habían quedado marcadas de la landing
vieja (ver más abajo, entrada del 24/07): las **estadísticas sin fuente**
("70% de los runners…") ya no están, y las **capturas viejas** que
apuntaban a `../assets/screenshots/` — ruta que se rompía con Root
Directory = `landing/` — se reemplazaron por las capturas nuevas del
fundador, servidas desde Cloudinary con `f_auto,q_auto,w_700` para que
pesen poco en el celular.

**Pendiente de revisar por el fundador**: las 13 capturas se asignaron
*en el orden en que él las pasó*, siguiendo su propia tabla (Paso 0 lleva
2, Paso 2 lleva 2, el resto 1 cada uno = 13). No se pudieron verificar
una por una porque este entorno no tiene acceso a Cloudinary (da 403).
Si alguna quedó en el paso equivocado, se cambia el link del `<img>` de
esa sección — cada una está marcada con un comentario `<!-- PASO N -->`.

### `pwa/index.html` — un escalón menos donde caer en blanco

El fundador apretó "atrás" del navegador dentro de la app y cayó en una
pantalla en blanco (`userCodeAppPanel`). No es un bug nuestro: Google
sirve las apps de Apps Script dentro de un marco interno suyo, y volver
atrás te deja parado en la dirección de ese marco suelto.

No se puede eliminar del todo, pero la pantalla de bienvenida de Vercel
usaba `window.location.href` para saltar a la app, lo que **agrega** un
paso al historial. Se cambió por `window.location.replace()`, que lo
**reemplaza** — un lugar menos donde caer mal parado.

Mitigación real para los usuarios: que instalen la app en la pantalla de
inicio (se explica en la landing nueva), así se abre a pantalla completa
sin las flechas del navegador.

---

## 27/07/2026 (tarde) — ⓘ que explica el límite de km + cabo suelto del 650

- **Nuevo ⓘ al lado de "Límite de km (opcional)"** en el formulario de
  nueva zapatilla. Abre un cartel corto: cuándo conviene un número más
  bajo (≈650 — un solo par sin rotar, asfalto, ritmos fuertes,
  zapatillas livianas de competencia) y cuándo más alto (≈850–1000 —
  rotación entre pares, tierra o pasto, rodajes tranquilos,
  entrenamiento diario amortiguado). Cierra aclarando que la señal que
  más importa no es el número sino cómo se sienten: pisada más dura,
  molestias nuevas o suela lisa.
  El texto quedó corto a propósito — el fundador preguntó si no era
  mucho, y tenía razón: el cartel no scrolleaba y en un celu chico se
  hubiera cortado.
- **Los carteles ahora scrollean** (`max-height: 85vh` + scroll en
  `.modal-recover-content`), como red de seguridad para cualquier texto
  largo en pantallas chicas. Aplica también a "¿Qué es Open Beta?" y a
  "Recuperar contraseña".
- **Cabo suelto corregido**: el cambio de 650 → 850 de esta mañana
  actualizó las dos constantes del código, pero el formulario seguía
  mostrando 650 en dos lugares visibles (el texto gris del casillero y
  el renglón de ayuda "Si no ponés nada, usamos 650 km"). Ya dicen 850.

---

## 27/07/2026 (mediodía) — BUG DEL LOCKER RESUELTO

**El síntoma**: el Locker mostraba siempre "El Locker está vacío",
aunque las zapatillas estuvieran perfectamente archivadas en el Sheet.
Pasaba con todos los usuarios, con datos viejos y con datos nuevos
(se probó con una cuenta recién creada, 2 zapatillas, 1 archivada).

**La causa**: cuando el servidor le manda datos a la pantalla,
`google.script.run` tiene que "empaquetar" el resultado para el viaje.
Si dentro de ese paquete viaja una fecha nativa de Google Sheets (un
objeto `Date`), el empaquetado falla y al frontend le llega **`null`**
— no una lista vacía, `null` — sin error, sin aviso, sin nada en la
consola. El código recibía ese `null` y mostraba "vacío".

La única columna con fecha es `Fecha_Archivado`, y solo la tienen las
zapatillas archivadas: **por eso fallaba el Locker y no el carrusel de
activas**. Google Sheets convierte solo el texto "27/07/2026" que
escribe `archiveShoe()` en una fecha real, así que el problema aparecía
sin que nadie tocara nada.

**Cómo se encontró** (después de descartar varias pistas falsas):
1. `_diagLocker()` (función de diagnóstico agregada a `codigo.gs`)
   probó que del lado del servidor todo estaba bien — devolvía las 2
   zapatillas correctamente, tanto con la función real como con un
   recuento manual fila por fila.
2. Un `alert()` temporal en el frontend mostró que a la pantalla le
   llegaba `archived=null`. Esa diferencia entre "lista vacía" y
   "null" fue la pista definitiva: el código nunca devuelve `null`, así
   que el dato se estaba perdiendo en el viaje, no en el origen.

**El arreglo** (`codigo.gs`): nueva función `_filaZapaAObjeto()`, que
convierte cualquier celda de fecha a texto `"dd/MM/yyyy"` antes de
devolverla. Se aplica en `getArchivedShoes()` y también en
`getUserShoes()` — una zapatilla reactivada conserva su
`Fecha_Archivado` vieja, así que el mismo problema podía aparecer en el
carrusel de activas. De paso, el Locker ahora muestra "Archivada el
27/07/2026" prolijo en vez de la fecha cruda.

Se sacó el `alert()` de diagnóstico del frontend. `_diagLocker()` quedó
en `codigo.gs` por si sirve más adelante — no la usa ninguna pantalla,
se puede borrar cuando se quiera.

**Descartado en el camino** (queda anotado para no volver a investigar
lo mismo): no era caché del navegador, ni el service worker, ni datos
corruptos por el ordenamiento del Sheet, ni una función duplicada, ni
volumen de datos, ni el simulador de entrenamientos.

---

## 27/07/2026 (mañana) — "Open Beta" + tope de km 650→850

Dos cambios chicos confirmados por el fundador:

1. **"Versión Demo" → "Open Beta"** en la pantalla de bienvenida y de
   login, con un ícono ⓘ al lado que abre un cartel corto explicando
   qué es una beta abierta (texto que mandó el fundador: acceso libre
   antes del lanzamiento oficial, puede haber errores menores, sirve
   para medir carga y recibir feedback masivo). Pensado para el
   lanzamiento del 1 de agosto.
2. **Tope de km por defecto: 650 → 850** (`TP.KM_UMBRAL_CUPON` en
   `trail-points.gs`, y su copia en el frontend `KM_LIMITE_DEFAULT` en
   `index.html`). Sigue siendo solo el valor por defecto — cualquiera
   que ya haya puesto su propio límite en una zapatilla no se ve
   afectado.

**Nota aparte, sin relación de código**: el fundador ordenó sin
querer una selección parcial de columnas en la pestaña "Zapatillas"
del Sheet (en vez de la hoja completa), lo que puede descuadrar filas
si se hace así — lo notó porque un usuario de prueba pareció quedarse
sin zapatillas. Restauró el orden desde el historial de versiones del
Sheet antes de que esto se mergeara. Recordatorio para la próxima:
ordenar siempre con "Datos → Ordenar hoja" (toda la hoja junta) o con
un filtro, nunca seleccionando un rango parcial de columnas a mano.

---

## 26/07/2026 (tarde) — 18 grupos de running nuevos en el registro

El fundador mandó una recopilación de equipos/grupos de running por
zona (Mar del Plata y alrededores, Pinamar/Gesell, Tandil, Necochea, La
Plata/GBA, Rosario) para sumar al desplegable "Grupo de running" del
registro de usuarios, más "Team Pura Vida" (pedido aparte). Solo se
tomó el nombre de cada grupo (no Instagram/Facebook/entrenador, que
también venían en la lista).

Los grupos que no son de Mar del Plata llevan la ciudad o provincia
entre paréntesis (ej. "Halcones La Plata" ya lo dice en el nombre, no
lleva paréntesis extra; "GO Team Pilar (Pilar, Buenos Aires)" sí). De
los grupos de MDQ que ya estaban en la lista de antes, se les agregó
"(MDQ)" a los que no lo decían en el nombre: Forest Run Group, Grupo
Troten, JM Corredores, Malgor Track & Field.

**Quedaron 2 cosas sin confirmar** (el fundador dijo que si algo no
cuadraba, se corrige después):
- "Kuden Group Tandil" (ya existía en la lista) — la recopilación nueva
  dice que "Kuden Group" es de Villa Gesell/Pinamar, no de Tandil. No
  se tocó el nombre por la duda.
- "FC Running Team (La Plata)" — el dato original decía "FC Running
  Team / Runner Callejero", no quedaba claro si es un nombre con
  alternativa o dos grupos distintos. Se eligió "FC Running Team".

---

## 26/07/2026 (mediodía) — Bug real: "Actividad reciente" mostraba mal la hora

El fundador lo notó al probar el simulador nuevo: un entrenamiento
recién cargado al mediodía aparecía como "hace 12h" en "Actividad
reciente" del panel admin.

Causa: la columna "Hora" de Entrenamientos a veces Google Sheets la
detecta sola como un valor de hora (no como el texto "12:08" que
escribe la app), y `_combinarFechaHora()` (`admin.gs`) no contemplaba
ese caso — hacía `horaRaw.toString().split(':')`, que con un objeto
Date da un texto largo y el `split` falla en silencio. Resultado: se
perdía la hora real y quedaba en medianoche, así que "hace cuánto fue"
se calculaba mal. El mismo caso ya estaba resuelto en otra parte del
código (`getShoeHistory()`, `codigo.gs`), pero nunca se había aplicado
acá — se corrigió con el mismo criterio (chequear si es un objeto Date
antes de tratarlo como texto).

---

## 26/07/2026 — Trigger que simula entrenamientos (para antes de la beta abierta)

El fundador recordaba un trigger de otra sesión que simulaba usuarios
cargando entrenamientos — no estaba guardado en el repo, así que se
armó de cero.

**Archivo nuevo `simulacion.gs`**: `simularEntrenamientosFalsos()` —
cada corrida, un puñado al azar (15%) de zapatillas activas (nunca las
del admin, `huellarunner@gmail.com`) suma un entrenamiento entre 3 y 15
km. Usa el mismo camino que un entrenamiento real
(`registrarActividadTrailPoints`, `trail-points.gs`), así que de paso
sirve como prueba de carga real del sistema de km/cupones/anti-fraude,
no solo maquillaje visual para la demo.

Se instala UNA vez a mano desde el editor de Apps Script — elegir
`instalarSimulacionEntrenamientos` en el desplegable de arriba y
apretar "Ejecutar". Deja el trigger corriendo cada 4 horas. Para
frenarlo (correr `desinstalarSimulacionEntrenamientos` una vez).

**Importante, ya charlado con el fundador**: como él va a borrar todos
los datos simulados del Sheet (menos el admin) antes de abrir la beta
al público el 1 de agosto, no hizo falta armar ninguna forma de
distinguir cuentas simuladas de reales — total, hoy todo lo que hay es
simulado. Pero por eso mismo, el trigger de simulación se tiene que
**desinstalar antes de esa fecha**, o le va a inventar entrenamientos
falsos a usuarios reales también.

---

## 25/07/2026 (noche) — Segmentos de notificación: compradores inminentes, cumpleaños e inactivos

El fundador pidió poder avisar a 3 grupos puntuales de usuarios,
calculados directamente de lo que ya hay en el Sheet:

1. **🔥 Compradores inminentes** (zapas en zona crítica) — para
   reforzar avisos publicitarios/comerciales a quien está por necesitar
   zapatillas nuevas ya.
2. **🎂 Cumpleaños de la semana** — para dar un descuento o premio en
   su semana. Nuevo: `getCumpleanosProximos()` en `admin.gs`, compara
   solo mes/día de `FechaNacimiento` contra hoy.
3. **😴 Inactivos / nunca entrenaron** — para mensajearlos con un tono
   suave (reutiliza la plantilla que ya existía, "Recordatorio de
   inactividad").

Se armó como un 4to tab "Segmento" dentro de "Enviar notificación" (panel
admin): elegís la opción, te muestra cuántos usuarios entran y quiénes
son, y mandás con el botón de siempre. Nuevo tipo de destinatario
`'lista'` en `enviarNotificacion()` (`codigo.gs`) para esto — valida que
cada email sea de un usuario real antes de mandar nada, y sigue
pidiendo el token de admin como "todos"/"grupo".

**De paso se encontró y arregló un bug real**: el filtro "Alerta Zapas"
de "Usuarios registrados" nunca mostraba resultados — el panel buscaba
el email de cada alerta (`a.email`) pero `getAdminDashboardData()`
(`codigo.gs`) nunca lo incluía en los datos que mandaba. Se agregó ese
campo. Esto también era necesario para que funcione el segmento de
"compradores inminentes".

**Quedó anotado para más adelante** (no se construyó, fue decisión del
fundador): un aviso de "aniversario de registro" por usuario tiene poco
sentido individual todavía, porque al ser una app recién lanzada va a
haber muchos usuarios cumpliendo el año juntos. Mejor pensarlo como un
sorteo por el aniversario de la app en sí (con inscripciones a carreras
como premio, al estilo de lo que se suele regalar), para cuando se
decida fecha y premio.

---

## 25/07/2026 (tarde, más tarde) — Foto real por zapatilla (columna Foto_URL)

El fundador quiere poder subir la foto real de la zapatilla de un
usuario cuando se la manda (él la retoca y la sube a Cloudinary). Se
agregó soporte para eso sin pantalla nueva:

- **`index.html`**: el carrusel y el Locker ahora muestran la foto de
  la columna `Foto_URL` de esa fila (si está cargada), antes que la
  foto genérica del modelo.

**Paso manual pendiente del fundador** (esto no se puede hacer desde
el código, es directamente en el Google Sheet): agregar una columna
nueva llamada exactamente `Foto_URL` en la pestaña "Zapatillas" — una
sola vez. Después, para cada foto real: pegar el link de Cloudinary en
esa columna, en la fila de la zapatilla puntual de ese usuario (se
identifica por email + cuál zapatilla es).

---

## 25/07/2026 (tarde) — 3 bugs reales encontrados y arreglados en revisión general

El fundador pidió una revisión completa de bugs en todo el código (no
podía navegar la PWA en vivo por una restricción de red de este
entorno). Se leyeron los 7 archivos `.gs`/`.html` completos (~9500
líneas). Se encontraron 8 cosas en total; se arreglaron las 3 que el
fundador priorizó, quedan 5 menores anotadas para más adelante (no
rompen nada hoy):

1. **`admin.html`** — El gráfico "Perfil Comunidad" (pestaña Insights)
   contaba mal a los usuarios principiantes: esperaba 5 niveles
   separados pero el registro solo guarda 4 (el nivel inicial es un
   único valor combinado, `"Principiante/Recreativo"`). Esos usuarios
   entraban al total pero no aparecían en ninguna barra, y los
   porcentajes no cerraban en 100%. `NIVELES_ORDER`/`NIVELES_COLORS`
   ahora usan las 4 categorías reales.
2. **`index.html`** — Doble-toque en "Guardar" podía duplicar datos:
   los botones de login, crear cuenta, definir contraseña nueva,
   agregar zapatilla y cargar kilómetros no se deshabilitaban mientras
   esperaban al servidor (a diferencia de "archivar"/"eliminar"/
   "recuperar contraseña", que sí lo hacían). Con mala señal, un
   segundo toque podía disparar la acción dos veces. Ahora todos se
   deshabilitan hasta tener respuesta. De paso, "Guardar Entrenamiento"
   no tenía manejo de error de conexión — ahora sí.
3. **`index.html`** — Una comilla doble (`"`) en un modelo de
   zapatilla cargado a mano ("Otra marca/Otro modelo") podía romper el
   botón "Eliminar" de esa tarjeta y el "Reactivar" del Locker (el
   escapado solo cubría la comilla simple). Nueva función
   `escInlineJs()` que escapa ambas.

Quedan pendientes (menores, sin apuro): un cálculo sin terminar de
"usuarios nuevos esta semana" en `admin.gs` que no se usa en ningún
lado; el orden de "usuarios inactivos" en insights puede salir
desprolijo entre los que nunca entrenaron; "actividad reciente" asume
que las filas del Sheet están en orden cronológico (podría fallar si
se cargan entrenamientos simulados fuera de orden); un detalle interno
sin impacto visible en `_labelDia()`; y en el panel admin, tocar el
filtro "Alerta Zapas" muy rápido apenas entrás puede decir "sin
resultados" por error hasta que lo tocás de nuevo.

---

## 25/07/2026 (mediodía) — Paginado, orden y filtros nuevos en "Usuarios registrados"

Después de simular 50 y probar con más, el fundador notó que la tabla
de usuarios del panel se hacía interminable de scrollear (no era un
bug — la tabla mostraba todo de una, sin paginar). Se armaron 3
mejoras juntas:

1. **Paginado de a 25** — botones "Anterior/Siguiente" abajo de la
   tabla en vez de mostrar todo junto.
2. **Orden por defecto: más nuevos primero** — antes no tenía ningún
   orden definido. Usa una fecha de registro que ya se guardaba
   (`Fecha_Registro`) pero el panel no usaba.
3. **Filtros por Provincia y por Grupo** — se suman a los que ya había
   (Todos / Alerta Zapas / Inactivos / Top Performers). Se arman
   solos con las provincias/grupos que hay cargados, no son una lista
   fija a mantener a mano.

`getAdminUsuarios()` (admin.gs) ahora devuelve también `provincia`,
`fechaRegistro` y `fechaRegistroTs` por usuario.

---

## 25/07/2026 — Plantillas de mensaje en el panel + letra del panel otro 10% más grande

De la charla sobre mensajes de "invitame un cafecito runner" (agua/
banana/gel con link de Mercado Pago) surgió la idea de tener textos
pre-armados para no escribirlos cada vez. Se agregó a "Enviar
notificación" (panel de admin) 10 botones de plantilla:

- 4 de "invitame": agua, banana, combo, sumate — con `[link]` de
  Mercado Pago para completar antes de mandar (no hay forma de que la
  app sepa el link real, hay que pegarlo a mano cada vez).
- 6 de uso general: recordatorio de inactividad, rotar zapatillas
  (para el que tiene varias activas), catálogo nuevo, motivación,
  pedir sugerencias, prevención de lesiones para principiantes.

Tocar un botón completa el cuadro de mensaje — se puede editar antes
de enviar, no manda solo. Fácil de sumar más plantillas más adelante
(quedan en un objeto `PLANTILLAS_MSG` en `admin.html`).

De paso, la letra base del panel subió otro 10% (16,2px → 17,82px),
sobre el +10% de la vez pasada.

---

## 24/07/2026 (noche, más tarde) — Envío de notificaciones más rápido + letra otro 10% más grande

El fundador notó (mandando una prueba a los 53 usuarios simulados) que
enviar a "todos" tardaba mucho más que mandar a 1-3 usuarios, y
preguntó de qué depende la velocidad de la app. Causa real encontrada
en `enviarNotificacion()` (`gas/codigo.gs`): escribía la hoja
Notificaciones fila por fila, con un guardado completo
(`SpreadsheetApp.flush()`) por cada destinatario — no es el teléfono
del usuario ni el tamaño del Sheet en general, es esta función
puntual. Se cambió para armar todas las filas en memoria y escribirlas
de una sola vez, sin importar si son 3 o 300 destinatarios. No hace
falta dividir envíos en tandas por grupo/ciudad como alternativa — con
este arreglo no debería hacer falta.

De paso, el texto de los mensajes de notificaciones subió otro 10%
(1.15rem → 1.27rem, sobre el +40% de antes).

---

## 24/07/2026 (noche) — Letra de los mensajes de notificaciones, 40% más grande

El texto del mensaje dentro de cada notificación (`.notif-mensaje`, en
`gas/index.html`) pasó de 0.82rem a 1.15rem, a pedido del fundador.

Nota aparte: se había preparado una renovación de `landing.html`
(colores actualizados al dorado/plata actual, logo con el mismo
tratamiento inclinado, y un bug real corregido — el botón de esa
página apuntaba a una URL de Apps Script vieja/distinta a la actual).
El fundador pidió dejarlo para después — queda preparado en una
carpeta `landing/` nueva (separada de `pwa/`, mismo criterio de
carpetas), sin commitear todavía.

---

## 24/07/2026 (tarde) — Letra más grande en el panel de admin

El fundador pidió agrandar la letra del panel (14px → 16,2px) — se le
hacía chico, sobre todo cuando lo abre en el celu en vez de
notebook/PC. Como el panel usa `rem` en casi todos los tamaños de
texto (115 de 116 usos), este único cambio en la base agranda todo en
cascada: títulos, tablas, botones, tarjetas.

Quedó pendiente, sin resolver: la lista de usuarios pareció "no
terminar" cuando el fundador simuló 50 usuarios. Se revisó el código
(backend `getAdminUsuarios` y el render de la tabla) y no hay ningún
límite que corte la lista — puede haber sido que se vio a mitad de
carga, o que hacía falta scrollear. Se le pidió una captura para
confirmar antes de tocar nada ahí.

---

## 24/07/2026 (mediodía, más tarde) — 3 modelos más de Puma

Deviate Nitro Elite 3, Foreverrun Nitro, Electrify Nitro 3 — sin foto
propia todavía. Se resolvió una duda vieja: "Foreverrun Nitro" (sin el
"2") resultó ser un modelo real, no el nombre cortado de un link
anterior — se agrega como modelo aparte de "Foreverrun Nitro 2".

Total: 141 modelos en 16 marcas. Sigue pendiente, sin tocar: "Deviate
Nitro 4 Hombre/Mujer" vs el "Deviate Nitro 4" genérico ya cargado.

---

## 24/07/2026 (mediodía) — Marca nueva Brooks + 10 modelos más (solo nombres)

Continuación del relevamiento de Run&Bike Online:

- **Brooks** (marca nueva, primer modelo): Levitate 5. El badge de
  color para Brooks ya estaba en el código sin usarse — se activó
  solo. Todavía sin foto genérica de marca: hasta que se suba una,
  muestra "imagen no disponible" en vez de la genérica (a diferencia
  de Fila/Skechers, que sí tenían genérica lista cuando se agregaron).
- **Adidas**: Pureboost 5, Switch FWD, Ultraboost 5, Adizero SL2,
  Supernova Prima
- **Under Armour**: Infinite Elite
- **Nike**: Invincible 3, Infinity RN 4 Blueprint, Alphafly 3
  Blueprint, Pegasus 40

Total: 138 modelos en 16 marcas.

Sin resolver, a pedido del fundador ("las dos dudas no hagas nada"):
"Asics Sonicblast" vs "Soniblast", y "Nike Air Zoom Pegasus" (sin
número) como posible variante de "Pegasus 41".

De paso, se avisó de un detalle raro en uno de los links pegados
(`product_list_order=evilcorp_discount_amount`) — no era una
instrucción ni afectó nada, solo un parámetro de URL con un nombre
inusual.

---

## 24/07/2026 (mañana) — Bug real: textos invisibles en modo claro

El fundador mandó capturas en modo claro y oscuro pidiendo opinión
sobre legibilidad. En modo oscuro todo bien, pero en modo claro
aparecieron 2 problemas reales — causados por cambios de ayer que
dejaron colores fijos en vez de adaptables al tema:

- El logo "HUELLA" de arriba a la izquierda: blanco fijo (#ffffff),
  invisible sobre el fondo claro.
- "Powered by Huella Runner MDQ" (4 lugares: pie del carrusel y las 3
  pantallas de login/registro) y "Gestioná tus zapatillas...": gris
  fijo (#aaaaaa), casi ilegible sobre fondo claro.

Arreglado con `var(--plata)` (ya existía, se adapta sola) y una
variable nueva `var(--gris-powered)` (#aaaaaa en oscuro — igual que
antes — y #555555 en claro). El modo oscuro queda exactamente igual a
como estaba; el pedido explícito del fundador fue "no tocar el modo
oscuro".

---

## 23/07/2026 (noche, cierre) — Lista de pendientes de foto

Nuevo `docs/pendientes-fotos-modelos.md`: checklist de los 37 modelos
cargados hoy (relevamiento de Run&Bike Online) que todavía muestran la
genérica de su marca. Para ir tildando a medida que el fundador suba
cada foto real a Cloudinary. No toca ningún archivo `.gs`/`.html`, no
requiere publicar nada.

---

## 23/07/2026 (noche, todavía la última) — 7 modelos más de la misma tanda

Siguiendo con el relevamiento de Run&Bike Online: Nike Vaporfly 4,
Nike Pegasus Premium, Nike Pegasus Premium QS, Nike Vomero Plus,
Adidas Adizero Pro 4, Adidas Hyperboost Edge, Asics Superblast 2 — sin
foto propia todavía, misma lógica que la tanda anterior.

Ya estaban cargados (no se duplicaron): Asics Megablast, Hoka Cielo
X1 2.0.

Queda una duda pendiente: la tienda lista "Asics Sonicblast" (con C),
muy parecido a "Soniblast" (sin C) que ya está en el catálogo — no se
tocó hasta saber si es un typo de alguno de los dos lados o son
modelos distintos de verdad.

Total: 127 modelos en 15 marcas.

---

## 23/07/2026 (noche, la última) — 30 modelos nuevos (solo nombres, sacados de Run&Bike Online)

El fundador empezó a pasar un relevamiento de Run&Bike Online (copiado
y pegado del sitio, no scraping automático — no pude entrar yo mismo,
el dominio está bloqueado por la política de red de mi entorno). Se
sacaron los nombres únicos, se compararon contra el catálogo actual
(90 modelos) para no duplicar, y se cargaron 30 nuevos **solo con
nombre**, sin foto propia todavía — usan la genérica de su marca hasta
que el fundador baje las fotos reales, las retoque con IA y las suba a
Cloudinary (mismo flujo de siempre).

Nuevos por marca:
- **Saucony**: Endorphin Pro 4, Axon 3, Endorphin Speed 4
- **Adidas**: Adizero Evo SL, Adizero Boston 13, Adizero Evo SL ATR,
  Adizero Evo SL Exo, Supernova Ease 2, Runfalcon 6 Kids, Boost Run
- **Puma**: Deviate Nitro 3 Wtr+, Velocity Nitro 4 Digitokyo, Deviate
  Nitro 3 Digitokyo, Deviate Nitro 2
- **Salomon**: Aero Blaze 3 GRVL, Aero Glide 3, Aero Glide 3 GRVL, DRX
  Defy GRVL
- **Skechers** (primeros modelos, antes solo genérica): Glide Step
  Altus, Max Cushioning Propulsion, Aero Burst, Aero Spark
- **Fila** (primeros modelos, antes solo genérica): Racer Carbon 3,
  Racer Carbon 2, Float Maxxi 2 Pro
- **New Balance**: Fresh Foam X 1080 v14, Fresh Foam X 1080 v13, Fresh
  Foam X Evoz v3, FuelCell Rebel v5, FuelCell Supercomp Trainer v4

Total: 120 modelos en 15 marcas (antes 90). Quedaron afuera, a pedido
del fundador: "Deviate Nitro 4 Mujer/Hombre" (ambiguo — ya existía un
"Deviate Nitro 4" genérico sin distinguir género) y un link de "Puma
Foreverrun Nitro" con el nombre cortado en el texto pegado.

---

## 23/07/2026 (noche, más tarde) — Sucursales de Open Sports (dato guardado, sin usar todavía)

A raíz de la charla sobre enrutar el botón "Próximamente" de cada
zapatilla según provincia/ciudad del usuario, el fundador pasó la lista
completa de sucursales de Open Sports (Run & Bike). Se guardó en
`docs/sucursales-open-sports.md` (57 sucursales: 46 Buenos Aires, 5 Río
Negro, 4 La Pampa, 1 Chubut, 1 Neuquén) para tenerla lista el día que
se decida armar esa función — todavía no se construyó nada, es solo
acopio de datos. Open Sports no es (todavía) un partner confirmado.
No toca ningún archivo `.gs`/`.html`, no requiere publicar nada.

---

## 23/07/2026 (noche) — Texto del login más grande y más claro

A partir de una captura, el fundador pidió aclarar y agrandar un poco
el texto de la tarjeta informativa de la pantalla de login
("Gestioná tus zapatillas running..." y "acceso exclusivo a ofertas y
beneficios..."). Se subió el tamaño de 0.82rem a 0.86rem y el color de
gris #888888 a #aaaaaa. Una sola clase CSS (`.intro-body`), un solo uso
en todo el archivo — cambio acotado, no afecta nada más.

---

## 23/07/2026 (tarde, más tarde) — Ícono nuevo de la PWA: "HR"

El fundador seguía viendo el ícono genérico (gris, con la letra "G")
al agregar la app a la pantalla de inicio. En vez de seguir
depurando el ícono viejo, se armó uno nuevo desde cero: "HR" con la
misma tipografía del logo de la app (Bebas Neue), H blanca + R dorada,
ambas inclinadas igual que el resto del logo, fondo negro. Se generó acá
mismo (sin depender de Canva) y el fundador lo subió a su Cloudinary.

Se actualizaron los 3 lugares del código que apuntaban al ícono
anterior (`<link rel="icon">`, `<link rel="apple-touch-icon">`, y los
dos tamaños 192/512 del manifest) para que usen las nuevas imágenes.

**Importante:** aunque el código quede bien, Android suele guardar una
copia del ícono viejo en los accesos directos ya instalados — si
después de publicar el celu sigue mostrando el ícono gris, hay que
borrar el acceso directo de "Huella Runner" de la pantalla de inicio y
agregarlo de nuevo (no alcanza con esperar a que se actualice solo).

---

## 23/07/2026 (tarde) — Selección múltiple en notificaciones + historial en el panel, y 2 ajustes visuales chicos

A partir de una captura del panel de admin (con los viejos mensajes de
"Dato de comunidad" que ya no se generan más, pero seguían visibles) el
fundador pidió 4 cosas. Confirmado con él: el aviso de cupón por
desgaste ("tu zapatilla llegó a su límite...") se deja como está, no es
un mensaje genérico de comunidad, es información sobre la zapatilla
propia del usuario.

1. **Selección múltiple en notificaciones** (`gas/index.html`): botón
   "Seleccionar" en la pantalla de notificaciones — al activarlo,
   aparece un círculo en cada mensaje para tildarlo (estilo Google
   Fotos) y una barra abajo con "Borrar" para las tildadas. El borrado
   de a una (el tacho de siempre) sigue funcionando igual. No se tocó
   el backend: `deleteNotificacion()` ya hacía un borrado "de mentira"
   (solo oculta del lado del usuario, marcando "Oculto" en la fila,
   sin borrar nada del Sheet) — eso ya cumplía el pedido de que quede
   historial.

2. **Historial de mensajes en el panel** (`gas/admin.gs` +
   `gas/admin.html`): nuevo "Ver historial completo" dentro de
   "Notificaciones leídas" (Salud del Sistema) — lista cada mensaje
   enviado, a quién, cuándo, y si se leyó o si el usuario lo ocultó de
   su lado. Nueva función `getHistorialNotificaciones()`.

3. **"Powered by Huella Runner MDQ"** de las 3 pantallas de login/
   registro/onboarding: mismo estilo que el del pie del carrusel (más
   chico, "Huella Runner" en cursiva, "Runner" en dorado).

4. **"Tus zapatillas activas"** (subtítulo del carrusel): un poco más
   chico, con la palabra "zapatillas" en dorado.

---

## 23/07/2026 (mediodía) — "Huella Runner" en cursiva dentro del "Powered by"

El fundador vio el "POWERED BY HUELLA RUNNER MDQ" del pie del carrusel
(mandó una captura de la app real) y pidió que "Huella Runner" ahí
también esté en cursiva, y que "Runner" tenga el mismo dorado que el
resto de la app. "Powered by" y "MDQ" quedan como estaban. Como esta
frase usa Montserrat (no Bebas Neue), acá sí se pudo usar cursiva real
en vez del inclinado por CSS.

---

## 23/07/2026 (mañana, todavía más tarde) — Logo de arriba a la izquierda + "Powered by" más legible

Última pata del logo: el que aparece arriba a la izquierda dentro de la
app (dashboard) también se actualizó — "Huella" ahora en blanco puro
(antes plata), "Runner" queda dorado como estaba, y las dos palabras se
inclinan igual que en los otros 4 logos. Se mantuvo la tipografía
(Bebas Neue) sin cambios, a pedido del fundador.

De paso, el "Powered by Huella Runner MDQ" que aparece al pie del
carrusel se aclaró un poco (de un gris #888888 a #aaaaaa) para que se
lea mejor — cambio puntual solo en esa frase, no afecta al resto de
textos secundarios de la app que comparten el mismo gris.

---

## 23/07/2026 (mañana, más tarde) — "HUELLA" también en cursiva

El fundador pidió que "HUELLA" se incline igual que "RUNNER" (no solo
una de las dos palabras). Aplicado en los mismos 6 lugares que se
tocaron antes: los 4 logos de login/registro/contraseña
(`gas/index.html`, mismo `skewX`) y los 2 correos (`gas/codigo.gs`,
cursiva real). El logo de adentro de la app sigue sin tocar.

---

## 23/07/2026 (mañana) — RUNNER en cursiva + correos unificados

Dos cambios pedidos por el fundador:

1. **"RUNNER" con una leve inclinación hacia la derecha** en los 4
   logos de login/registro/contraseña (`gas/index.html`). Se usa un
   inclinado por CSS (`transform:skewX`) en vez de cursiva real porque
   Bebas Neue no tiene una variante itálica. El logo de adentro de la
   app (arriba a la izquierda) no se tocó — queda pendiente si se
   quiere igual ahí.

2. **Correos de bienvenida y recuperación de contraseña**
   (`gas/codigo.gs`) — tenían un tercer esquema de color que había
   quedado suelto: verde lima (#dcfd8b) + plata, ni el verde del login
   viejo ni el dorado del resto de la app. Se unificó a plata + dorado
   (#C5B358), con "RUNNER" en cursiva real esta vez (font-style:italic,
   más confiable en Gmail/Outlook que un inclinado por CSS). También se
   pasó a dorado la contraseña temporal resaltada y la mención de
   "Huella Runner" en el correo de bienvenida, que usaban el mismo
   verde lima viejo.

---

## 23/07/2026 (madrugada, más tarde) — Logo unificado en login/registro

El fundador notó (con capturas) que el logo "HUELLA RUNNER" se veía
distinto en el login (verde + blanco/plata, tipografía Montserrat) que
adentro de la app (plata + dorado, tipografía Bebas Neue). Eran dos
diseños que quedaron desincronizados — el de adentro de la app es el
que coincide con el resto de la paleta (dorado en botones, acentos,
etc.), así que se unificaron las 4 pantallas de login/registro/
contraseña a ese mismo estilo. También se sacaron 3 clases CSS que
habían quedado de un diseño viejo sin usar en ningún lado.

Como la gorra que se está por imprimir es DTF (no bordada), no hace
falta una versión "plana" sin degradé — la que ya usa la app funciona
igual para eso.

---

## 23/07/2026 (madrugada) — 12 modelos nuevos, marcas varias

Agregados con foto propia: Hoka Mafate Speed 4, Hoka Match 6, Hoka
Solimar, Saucony Endorphin Azura, Adidas Terrex Agravic 4, Asics
Novablast 5 Tokyo, New Balance FuelCell Rebel v3, New Balance Fresh
Foam X Vongo v6 (primeros modelos de New Balance — antes la marca no
tenía ninguno cargado), Nike Pegasus 39, Nike Structure 25, Nike
Winflo 9, Under Armour Hovr Synergy (primer modelo de Under Armour,
antes sin ninguno). Ver `docs/cloudinarys-zapatillas.md`.

De los 13 links que llegaron, uno quedó afuera: "Nike Air Zoom Pegasus
41" es la misma zapatilla que "Pegasus 41" (ya cargada) — Nike sacó el
"Air Zoom" del nombre hace unas versiones, es la misma. Queda pendiente
confirmar con el fundador si quería reemplazar esa foto por la nueva.

---

## 22/07/2026 (noche, la última de hoy) — Marca nueva: Puma

Se agrega Puma al desplegable de marcas (entre Osx y Salomon,
alfabético) con 5 modelos y foto propia cada uno: Magnify Nitro 3,
Foreverrun Nitro 2, Deviate Nitro 3, Deviate Nitro 4, Velocity Nitro 4.
Ver `docs/cloudinarys-zapatillas.md`.

---

## 22/07/2026 (noche, todavía más tarde) — 1 modelo más de Saucony

Agregado "Endorphin" (modelo base de esa línea, distinto de "Endorphin
Pro 5" que se había cargado en la tanda anterior).

---

## 22/07/2026 (noche, más tarde) — 7 modelos de Saucony nuevos

Agregados al catálogo con foto propia: Kinvara Pro, Triumph 23, Triumph
21, Triumph 22, Kinvara 14, Ride 16, Endorphin Pro 5. Ver
`docs/cloudinarys-zapatillas.md`. De los 8 links enviados, el 8vo era en
realidad la foto de Nike Revolution 7 (ya cargada antes) — no se
duplicó.

---

## 22/07/2026 (noche) — Respaldo automático diario del Sheet

Después de que una pestaña del Sheet se borrara o se corriera de lugar
por error (y con eso desaparecieran zapatillas de dos usuarios — se
arregló a mano con el historial de versiones de Google Sheets), se
agrega una red de seguridad extra: archivo nuevo `gas/backup.gs`.

- `respaldarSheetDiario()`: hace una copia completa del Sheet todos los
  días y la guarda en una carpeta de Drive ("Huella Runner — Backups"),
  con fecha y hora en el nombre. Copias de más de 30 días se borran
  solas para no acumular basura en Drive.
- `instalarBackupDiario()`: hay que correrla UNA sola vez a mano desde
  el editor de Apps Script (elegir la función → Ejecutar) para que
  quede programado el respaldo diario a las 4 AM. Después no hace falta
  tocar nada más.

Esto es una copia extra, independiente del historial de versiones que
ya trae Google Sheets — sirve sobre todo si el error se nota muchos
días después y el historial normal ya no alcanza.

---

## 22/07/2026 (tarde, todavía más) — Barra de km casi invisible cuando el uso es bajo

El fundador notó que la barrita de progreso de km (debajo de cada
zapatilla, ej. "57 km / 800 km") casi no se veía hasta que empezaba a
rellenarse de amarillo. Causa: el fondo de esa barra era negro puro
(`#000`), igual que el resto de la tarjeta, así que sin relleno era
invisible. Se le agregó un contorno finito gris al 50% de opacidad para
que el "track" completo se vea siempre, tenga poco o mucho uso.
Archivo: `gas/index.html` (`.cf-bar-wrap`).

---

## 22/07/2026 (tarde, aún más tarde) — Bug real: "Actividad Reciente" mostraba mal la hora

El fundador cargó 21km a las 16:15 y el panel mostró "hace 16h" para
ese mismo registro — y las entradas más viejas mostraban solo la fecha,
sin hora. Causa encontrada: la hoja Entrenamientos guarda "Fecha" y
"Hora" en columnas separadas, y `getActividadReciente()` solo leía
"Fecha" — como esa columna no tiene hora, cada evento quedaba fijado a
medianoche (00:00), y "hace cuánto" se calculaba desde ahí, no desde el
momento real de la carga. A las 16:15, "tiempo desde medianoche" da
justo ~16h — coincidencia que confirmó la causa.

Arreglado con una función nueva (`_combinarFechaHora()`) que junta las
dos columnas antes de calcular la hora real. Se aplicó tanto en
`getActividadReciente()` como en `getInsightsExtendidos()` (agregada
hoy mismo, tenía el mismo problema de fondo, aunque no se notaba porque
ahí solo se usan días completos).

## 22/07/2026 (tarde, más tarde) — 6 secciones nuevas en el panel admin

El fundador mandó capturas del panel admin (celu) y pidió un análisis a
fondo + ideas nuevas para recopilar/agrupar datos. Antes de construir
nada, se descubrió que el panel ya tenía **8 pestañas** en "Insights del
Negocio" (el celu solo mostraba 3 por scroll horizontal) — varias de
las ideas pedidas ya existían, parcial o totalmente:

- "Actividad por grupos" → ya existía (pestaña Grupos).
- "Franja horaria" y "vida útil antes de archivar" → ya existían como
  pestañas con texto "Próximamente", sin conectar.
- "Distribución geográfica" → el backend ya la calculaba
  (`rankingProvincia`) pero nunca se mostraba en ningún lado.

Con eso aclarado, se construyó lo que faltaba de verdad — nueva función
`getInsightsExtendidos()` en `admin.gs` + 6 secciones nuevas/renovadas
en `Admin.html`:

1. **Constancia** — ranking de quién entrena más seguido (días
   distintos con actividad en 30 días), no solo quién suma más km.
2. **Geografía** — distribución de la comunidad por provincia (dato ya
   calculado, solo faltaba mostrarlo).
3. **Horario Pico** — dejó de ser un stub, ahora usa la hora real de
   cada entrenamiento (mañana/tarde/noche).
4. **Tendencia Semanal extendida** — semana actual vs. anterior,
   últimas 8 semanas y últimos 6 meses (antes solo últimos 7 días).
5. **Insight Comercial — abandono real** — nueva tarjeta con lista de
   quién no entrena hace 14+ días (o nunca), con botón de notificar por
   persona. Reemplaza la señal débil de "no entrenó hoy" (que marca a
   casi todo el mundo cualquier día).
6. **Salud del Sistema — tasa de lectura de notificaciones**.

De paso, dos arreglos chicos que salieron de la misma revisión:
- "Actividad Reciente" ahora muestra 5 eventos, no 10.
- Texto "El mensaje llegará a 3 los usuarios registrados" tenía las
  palabras en el orden equivocado — ahora dice "a los 3 usuarios".

**Bug real evitado en el camino:** al conectar Horario Pico de verdad,
había dos funciones (la vieja stub y la nueva) escribiendo en el mismo
lugar sin orden garantizado — se sacó la vieja para no correr el riesgo
de que la tapara con datos falsos. Mismo cuidado con la Tendencia
Semanal (se le dio un contenedor propio a la parte nueva para que no
compita con la que ya existía).

Sigue pendiente (no tocado, fuera del pedido de esta tanda): terminar
"Vida Útil" (km promedio antes de archivar una zapatilla).

## 22/07/2026 (tarde) — Texto chico del panel admin, más legible

El fundador no veía bien las letras chicas grises del panel (etiquetas,
subtítulos, horarios). Causa: casi todo ese texto usa una sola variable
de color (`--metal`), que estaba en un gris apagado (#808080) sobre
fondo negro. Se subió a `#E8E8E8` (mismo "plata" que usa el resto de la
app) — un solo cambio arregla decenas de lugares a la vez, porque todos
dependen de la misma variable. También se charló la posibilidad de
modo claro/oscuro para el panel admin (como tiene el resto de la app);
se dejó pendiente — es factible pero no trivial (~30 colores
hardcodeados para revisar), y como el panel lo usa solo el fundador, no
es tan prioritario como en la app de los corredores.

## 22/07/2026 (mediodía) — Mensaje del cupón, más honesto

El fundador notó que todavía no tiene un auspiciante/marca asociada
para que el cupón de desgaste (`HR-DESGASTE-...`) se pueda canjear de
verdad — y el mensaje automático decía "usalo en tu próxima compra",
prometiendo algo que hoy no se puede cumplir (están en fase demo). Se
cambió el texto: ahora avisa que la zapatilla llegó a su límite y que
el código sirve "para cuando sumemos marcas asociadas", sin prometer un
canje inmediato. Mismo mecanismo de siempre (mensaje automático en la
campanita cuando se llega al límite), solo cambió la redacción.

## 22/07/2026 — Ícono de la PWA, segunda vuelta (la buena)

El arreglo del 21/07 (abajo) tocó un manifest que en realidad no se
estaba usando — el que sí manda es uno metido directo en `Index.html`
(línea 172, como "data URI"). Se agregó un `<link rel="icon">` estándar
ahí (apuntando al mismo ícono "HR" de Cloudinary), para el caso de que
el navegador arme un acceso directo simple en vez de instalar la PWA
completa — ese camino usa el favicon de la página, y no había ninguno
declarado. De paso se actualizó el color del manifest real (seguía en
neón lima viejo). Mismo recordatorio de siempre: borrar el acceso
directo del celu y agregarlo de nuevo para ver el ícono nuevo.

## 21/07/2026 (noche, más tarde) — Ícono de la PWA en el celu

El fundador notó que al agregar la app a la pantalla de inicio del
celu, aparecía un ícono genérico (el de respaldo de Brave) en vez del
logo de Huella Runner. Causa real: `codigo.gs` generaba el ícono como
un dibujo (SVG) pero lo devolvía como texto plano, no como imagen — el
celu no podía usarlo. Se arregló apuntando el manifest directo a los
PNG reales que ya están en Vercel (`icons/icon-192.png` y
`icon-512.png`, el logo "HR" amarillo con la zapatilla que ya se usaba
en la pantalla de bienvenida). Se sacó el generador de ícono roto. De
paso se actualizaron los colores del manifest (fondo/tema), que
seguían en el negro+neón lima viejo en vez del negro+dorado actual.

**Importante:** este cambio no se ve hasta borrar el acceso directo
viejo del celu y volver a agregarlo — el ícono se descarga una sola vez
al instalar, no se actualiza solo.

## 21/07/2026 (noche) — Desplegable de marcas alfabético

El `<select>` de "Marca" en Nueva Zapatilla estaba ordenado por
categoría (trail primero, calle después). Se pasó a orden alfabético
puro, que es más fácil de escanear a medida que se siguen agregando
marcas. "Otras..." se mantiene siempre al final.

## 21/07/2026 (tarde) — 11 modelos nuevos de Nike

Agregados al catálogo (`gas/index.html`) con foto propia: Vomero 17,
Run Defy, Winflo 11, Revolution 7, Revolution 8, Renew Run 3, Pegasus
Plus, LunarSpider, Pegasus 41, Downshifter 13, Quest 5. Llegaron 12
links pero dos tenían el mismo nombre de modelo ("Renew Run 3") — se
usó uno solo, ver nota en `docs/cloudinarys-zapatillas.md` por si el
segundo era un modelo o color distinto. Nike pasa a tener modelos
propios (antes solo ofrecía "Otros..." en el desplegable).

## 21/07/2026 (mediodía, más tarde) — "Ver legales" también en Login

El acordeón de "Privacidad y Tratamiento de Datos" solo vivía en la
pantalla de onboarding, que solo se muestra la primera vez (después
queda guardado en el celu y ya no vuelve a aparecer). No había forma de
volver a leer ese texto sin borrar datos del navegador. Se agregó el
mismo botón "VER LEGALES +" con el mismo acordeón al final de la
pantalla de Login (id de acordeón distinto para no chocar con el del
onboarding).

## 21/07/2026 (mediodía) — Revisión de bugs + 3 arreglos

Pedido explícito del fundador: revisión estricta de todo el proyecto,
de adelante para atrás y al revés, buscando bugs sin arreglar nada
hasta comentarlo primero. Se usó un agente para leer los 6 archivos
completos y cruzar cada función/ID/columna, y cada hallazgo se
verificó a mano antes de reportarlo (no todo lo que el agente marcó
resultó ser un bug real).

1. **Alertas de desgaste del panel admin desincronizadas del límite
   por zapatilla.** `getAdminDashboardData()` (codigo.gs) seguía
   comparando el km de cada zapatilla contra el umbral global fijo
   (650) en vez del `KM_Limite` propio que se agregó en el Paso 1 del
   20/07 — quedó un lugar sin actualizar cuando se hizo esa feature.
   Efecto real: una zapatilla con límite bajo (ej. 400) llegaba a
   "Crítico" para el usuario y el cupón, pero no aparecía como alerta
   en el admin; y una con límite alto podía aparecer como alerta falsa
   sin estar realmente gastada. Arreglado — ahora usa el límite propio
   de cada fila, con el mismo fallback a 650 que el resto del sistema.
2. **Fecha de notificaciones, parseo ambiguo.** El buzón de
   notificaciones (Index.html) parseaba la fecha con `new Date(raw)`
   sobre un string en formato argentino ("dd/MM/yyyy"), que JS puede
   confundir con MM/dd/yyyy. No se pudo confirmar al 100% que esté
   fallando en producción (depende de si Google Sheets devuelve esa
   celda como texto o como fecha real), pero se corrigió de todos
   modos parseándola a mano, mismo criterio que ya usa `_formatFecha`
   en Admin.html.
3. **Botones rápidos de km invisibles en modo claro.** Los botones
   5K/10K/21K/42K (modal Registrar KM) tenían el fondo oscuro
   hardcodeado y el texto con la variable `--plata` — en modo claro esa
   variable pasa a ser un color oscuro también, así que quedaba texto
   oscuro sobre fondo oscuro, invisible. Ahora el fondo usa las
   variables de tema (`--card-bg`/`--borde`), visibles en los dos
   modos. Se revisó el resto del archivo por el mismo patrón (fondo
   fijo + `--plata`) y no había otro caso igual.

Hallazgos menores, sin arreglar por ahora (no son bugs urgentes): el
sistema de cupón de desgaste no tiene pantalla propia en la app (hoy
solo se avisa por el texto de la notificación); una métrica interna de
`social-proof.gs` tiene un comentario que no coincide del todo con lo
que calcula, pero no se muestra en ningún lado hoy; y sobra un poco de
CSS sin usar (`.detail-model`).

## 20/07/2026 (tarde) — 5 modelos nuevos de Hoka

Agregados al catálogo (`gas/index.html`) con foto propia: Cielo X1 2.0,
Arahi 7, Clifton 8, Clifton 10, Rocket X2. También se actualizó la foto
de Hoka Bondi 9 (mismo modelo, el fundador mandó un link nuevo). Detalle
de links en `docs/cloudinarys-zapatillas.md`. De paso se documentó el
flujo fijo para agregar zapatillas en `docs/como-agregar-zapatillas.md`,
para no tener que re-explicarlo cada vez.

## 20/07/2026 (madrugada) — Límite de km por zapatilla (Paso 1)

Primer paso de la idea de "cada zapatilla con su propio límite de km",
propuesta por el fundador. Sin categorías por material todavía (eso queda
para más adelante, cuando haya datos de uso reales para validarlo) — por
ahora es solo un número opcional que cada uno puede poner al cargar una
zapatilla.

- **"Nueva Zapatilla"** tiene un campo nuevo opcional, "Límite de km". Si
  se deja vacío, se usa 650 km (el mismo número de siempre).
- Ese límite se guarda por zapatilla (columna nueva `KM_Limite` en la hoja
  Zapatillas, se crea sola la primera vez que se usa).
- El estado de desgaste (Normal/Positivo/Bajo/Crítico) y el cupón por
  desgaste (`HR-DESGASTE-`) ahora se calculan contra el límite propio de
  cada zapatilla, no contra un número fijo para todas. Las zapatillas que
  ya existían (sin este dato guardado) siguen funcionando igual que
  antes, con 650 km de límite por defecto.
- **De paso, un arreglo real:** la barra de progreso del carrusel usaba un
  número fijo distinto (`MAX_KM = 900`) al que usaba todo lo demás para
  "zapatilla gastada" (650). Convivían dos límites distintos sin que
  nadie lo hubiera decidido así. Ahora la barra usa el mismo límite que
  el resto de la app (el de cada zapatilla, con 650 de default).

## 19/07/2026 (noche) — Los 4 bugs de la revisión completa

Resumen de la tanda grande: se sacaron los 4 problemas reales que encontró
la revisión pantalla por pantalla, más el ojito de mostrar/ocultar
contraseña en Login, Registro y la pantalla nueva. Detalle en cada sección
de abajo (codigo.gs, Index.html, admin.html).

1. **Panel admin chico eliminado.** Vivía adentro de la app normal
   (`view-admin-notif`), duplicaba al panel completo (Admin.html) con una
   variable de admin distinta (`ADMIN_EMAIL` vs `ADMIN_EMAILS`), y había
   quedado roto por el candado de seguridad de hace unos días. Ahora hay
   un solo camino de admin: login normal → redirección automática si el
   email está en `ADMIN_EMAILS`.
2. **Voucher/Open Sports eliminado.** Badge "Premio", tarjeta de código,
   checkbox "¿Es un Premio?", pestaña "Premio / Promo" en Admin.html,
   `_generarCodigoVoucher()`. El sistema de cupones por desgaste
   (`trail-points.gs`, prefijo `HR-DESGASTE-`) es independiente y no se
   tocó — sigue funcionando igual, manda el código dentro del mensaje de
   texto, no por la tarjeta de voucher que se sacó.
3. **Flujo de contraseña temporal → definitiva.** "Olvidé mi contraseña"
   ahora marca la cuenta (columna nueva `Requiere_Cambio_Password`). En el
   próximo login con esa temporal, antes de dejar pasar a cualquier lado
   (dashboard o panel admin), la app muestra una pantalla nueva ("Elegí tu
   contraseña nueva") pidiendo la contraseña definitiva dos veces — mismo
   patrón que ya tenía Registro. De paso, se sumó un botón de
   mostrar/ocultar contraseña (👁️) en Login, Registro y esta pantalla
   nueva.
4. **Bienvenida ya no se repite.** Antes tapaba toda la pantalla en cada
   visita a la app, sin excepción, incluso ya logueado. Ahora se guarda en
   el celu (localStorage) que ya se vio, y va directo al login.

## 19/07/2026 (noche) — Tanda 2 de la revisión completa

- **Agregar zapatilla — miniatura en vivo.** Al elegir marca (y después
  modelo) en el formulario de nueva zapatilla, aparece una foto de vista
  previa que se actualiza sola — usa `getShoeImage()`, la misma función
  que ya arma la tarjeta final, así que lo que ves acá es exactamente lo
  que vas a tener después.
- El resto de la Tanda 2 (login, registro, notificaciones, panel chico)
  ya había quedado resuelto dentro de los 4 bugs de arriba — Registro ya
  tenía doble ingreso de contraseña desde antes, y "marcar todas como
  leídas" en Notificaciones ya pasa sola al abrir el buzón (no hacía
  falta un botón nuevo).

## 19/07/2026 (noche) — Tanda 3 de la revisión completa (modales)

- **Registrar KM**: botones rápidos 5K/10K/21K/42K junto al campo libre.
- **Historial**: botón ✏️ nuevo para corregir el km de un registro sin
  borrarlo (nueva función `editarEntrenamiento()` en `codigo.gs`, ajusta
  el km de la zapatilla por la diferencia). Usa un prompt nativo simple,
  no un modal aparte — si en algún momento se quiere algo más prolijo,
  se puede reemplazar después.
- **Confirmar eliminar zapatilla**: "Eliminar para siempre" ahora avisa
  cuántos km de historial se pierden, si la zapatilla tiene alguno.
- **Locker**: cada zapatilla archivada muestra desde cuándo está guardada
  (`archiveShoe()` ahora guarda `Fecha_Archivado`).
- **Modal de voz**: más ejemplos de frases válidas en el texto de ayuda.
- **Modal "dato de comunidad"**: botón "📤 Compartir" — usa el selector
  nativo del celu (WhatsApp, Instagram, etc. según lo que tenga
  instalado) y cae a un link de WhatsApp si el navegador no lo soporta
  (típico en desktop).
- **Confirmar borrar entrenamiento**: ya mostraba fecha y km específico
  del registro — se revisó y no hacía falta tocarlo.
- **Confirmar borrar notificación**: se deja como está, a pedido del
  fundador — es el modal menos crítico del proyecto.

## 19/07/2026 (noche) — Tanda 4 de la revisión completa (carrusel + panel admin)

- **Carrusel de zapatillas activas**: indicador numérico "2 de 5" debajo
  de los puntitos, contando solo zapatillas reales (no la tarjeta de
  "agregar" al final).
- **Panel admin — paleta unificada**: el acento del panel era negro +
  neón lima (`#CCFF00`), ahora usa el mismo dorado apagado (`#C5B358`)
  que la app y la PWA. El fondo negro se mantiene — es la identidad
  propia del panel, no una inconsistencia. La escala de colores por
  nivel de corredor (verde→lima→amarillo→naranja→rojo en Insights) no
  se tocó — es una paleta categórica con su propio significado, no el
  acento de marca.
- **Panel admin — sección "Salud del sistema" nueva**: cupones emitidos
  (total, disponibles, usados) y última corrida del cron nocturno de
  `Cache_Modelos`. Ojo: la idea original también incluía "notificaciones
  fallidas", pero no hay ningún mecanismo que registre fallos de envío
  hoy (las notificaciones se escriben directo a la hoja, no hay entrega
  asincrónica que pueda fallar después) — se dejó afuera en vez de
  inventar un dato falso.

## 19/07/2026 (noche) — BUG REAL: miniatura de "Nueva Zapatilla" pesada

El fundador notó que la pantalla de "Nueva Zapatilla" tardaba más en
aparecer desde que se agregó la miniatura (Tanda 2). Causa: la miniatura
bajaba la foto **original completa** de Cloudinary (las fotos genéricas
son editoriales, pesan bastante) y recién ahí la achicaba a 120x120 con
CSS — o sea, gastaba el mismo ancho de banda que si se mostrara gigante.
Arreglado con `_cloudinaryChica()`: le pide a Cloudinary una versión ya
redimensionada (240px) y comprimida (`q_auto,f_auto`) directo en la URL,
en vez de bajar el archivo entero.

**Extendido (mismo día, más tarde)**: a pedido del fundador, el mismo
arreglo se aplicó también a las fotos grandes del carrusel principal
(480px) y del Locker (400px) — antes solo estaba en la miniatura. Se
confirmó antes de aplicarlo que no hay pérdida de calidad visible
(`c_limit` nunca agranda una foto más chica que el original) ni riesgo
de romper nada (si la URL no es de Cloudinary o no matchea el patrón
esperado, la función devuelve la imagen original tal cual). Pendiente:
probar en la calle con datos móviles (4G/5G), no solo con wifi.

---

## codigo.gs

- SHEET_ID corregido para apuntar al sheet real ("Huella Runner Final 1407").
- `Fecha_Registro` agregado a Usuarios — antes no se guardaba.
- `appendDataByHeader()`: si falta una columna en el sheet, la crea sola en
  vez de descartar el dato en silencio.
- `TRAIN_HEADERS` unificado (Fecha + Hora combinadas correctamente, ya no
  se pierde el horario real del entrenamiento).
- `Email_Usuario` agregado a Notificaciones.
- `loginUser()` / `registerUser()`: manejo de errores con try/catch (antes
  un error se colgaba en "INICIANDO..."/"CREANDO..." para siempre, sin
  aviso).
- Alertas de desgaste crítico usan `TP.KM_UMBRAL_CUPON` en vez de un
  número fijo (700) pisado a mano.
- `loginUser()`: ahora también devuelve `esAdmin: true` si el email está
  en `ADMIN_EMAILS` (ver admin.gs), sin depender de la columna Rol.
- `getAppUrl()`: nueva función, devuelve la URL de la app principal (sin
  `?page=admin`). La usa el botón "Salir" del panel admin.
- BUG REAL arreglado: las notificaciones diferidas de Social Proof
  quedaban encoladas en `Notif_Diferidas` para siempre y nunca llegaban
  a la app (dependían de un trigger horario configurado a mano en Apps
  Script para `procesarNotificacionesDiferidas()`, que nunca se conectó
  como respaldo). Ahora `getNotificacionesUsuario()` y `contarNoLeidas()`
  la llaman solas cada vez que alguien abre o revisa su buzón.
- Sacado "trail" del mail de bienvenida (catálogo, comunidad, desgaste,
  despedida) y de la descripción del manifest PWA. Emojis de montaña 🏔️
  cambiados por 🏃.
- **BUG DE SEGURIDAD arreglado (19/07/2026)**: `getAdminDashboardData()`
  y `enviarNotificacion()` (envíos a "todos"/"grupo") no revisaban
  ningún token — cualquiera que abriera la app normal podía llamarlas
  directo desde la consola del navegador, sin loguearse como admin.
  Ahora las dos piden el token y lo validan con `_adminAutorizado()`.
  Detalle completo abajo, en `admin.gs`.
- **BUG DE SEGURIDAD arreglado (19/07/2026)**: las contraseñas se
  guardaban y se reenviaban por mail en texto plano. Ahora se guardan
  hasheadas (`_hashPassword()`, formato `salt$hash`, SHA-256). Los
  usuarios que ya estaban registrados se migran solos al formato nuevo
  la próxima vez que inicien sesión — no hace falta tocar la planilla
  a mano ni avisarles nada. "Olvidé mi contraseña" ya no puede reenviar
  la contraseña vieja (un hash no se puede leer para atrás): ahora
  genera una nueva al azar, la guarda hasheada, y la manda por mail —
  mismo botón, mismo flujo de siempre, solo cambia el contenido del mail.
- `getAdminUrl()` ahora arma el link con el token leído de Propiedades
  del script (ver `_getAdminToken()` en `admin.gs`), no de una
  constante escrita en el código.

## admin.gs

- `_adminAutorizado(token)`: acceso al panel admin vía `?page=admin&token=...`.
- `ADMIN_EMAILS`: lista de emails que son admin automáticamente al hacer
  login (sin depender de la columna Rol del sheet). Hoy incluye
  `huellarunner@gmail.com`.
- `_esEmailAdmin(email)`: helper que usa `loginUser()` en codigo.gs.
- **BUG DE SEGURIDAD arreglado (19/07/2026)**: `_adminAutorizado(token)`
  solo se usaba para decidir qué *pantalla* mostrar (`?page=admin`),
  pero en Apps Script todas las funciones del proyecto quedan
  accesibles desde cualquier página del mismo proyecto — o sea,
  `getAdminStats`, `getAdminUsuarios`, `getRankingUsuarios`,
  `getActividadReciente` y `getActividadPorDia` se podían llamar
  directo desde la consola del navegador (`google.script.run...`) sin
  pasar por el candado de la pantalla. Ahora las 5 piden el token como
  primer/último parámetro y lo validan igual que la pantalla; si no es
  válido devuelven vacío/error, no explotan.
- `ADMIN_TOKEN` ya no está escrito en este archivo (que está en
  GitHub, público) — se movió a **Propiedades del script** de Apps
  Script (`PropertiesService`), leído por la nueva `_getAdminToken()`.
  Sin esa propiedad configurada, `_adminAutorizado()` rechaza todo
  (falla "cerrado", no "abierto"). El token viejo (`huella-admin-2024`)
  quedaba expuesto en el código público — el nuevo lo generó Claude y
  se lo pasó al fundador solo por chat, nunca se subió a git.
- Panel admin (`Admin.html`): al abrirse, `doGet()` (en `codigo.gs`)
  le pasa el token ya validado como variable de plantilla
  (`tpl.adminToken`), así el panel lo tiene disponible para mandarlo
  de vuelta en cada pedido de datos — no hace falta ningún login nuevo
  ni pantalla extra, la entrada al panel (login normal → redirección
  automática si sos admin) sigue exactamente igual que antes.

## trail-points.gs

- Se sacó por completo el descuento del 85% en km cargados a mano
  (`FACTOR_MANUAL`). Los km se acreditan al 100%.
- Sin requisito de hora obligatoria para cargar km manual (antes, si no
  había hora exacta, rechazaba la carga).
- `_guardarEntrenamiento()` usa `appendDataByHeader()` (auto-reparación de
  columnas) en vez de escribir directo a celdas fijas.
- Sacado "km de trail" del mensaje del cupón (quedaba "de trail" colgado
  sin sentido).
- Prefijo del código de cupón cambiado de `TT-DESGASTE-` a
  `HR-DESGASTE-` (el "TT" era un resto de Todo Trail; los cupones ya
  emitidos con el prefijo viejo quedan como están, solo cambian los
  nuevos).

## social-proof.gs

- **CAMBIO DE DISEÑO (19/07/2026, tarde)**: el dato de comunidad dejó
  de mandarse como notificación (ni al buzón, ni diferida) — ahora
  `addShoe()` devuelve `obtenerDataSocialProof()` directo en la
  respuesta, y `Index.html` lo muestra al toque en una ventanita
  (modal) al registrar la zapatilla. `_notificarDatoComunidadSiHayDatos()`
  se sacó (quedó un rato usándose, ver entrada de abajo, pero duró
  poco: el fundador se acordó de que ya existía un diseño de ventanita
  hecho hace tiempo — `social-proof-ui.html` — que nunca se había
  integrado, y quedaba mejor que mandarlo al buzón). Ver `Index.html`
  para el detalle del modal.
- **CAMBIO DE DISEÑO (19/07/2026, mediodía)**: se sacó la cola de "notificación
  diferida 24hs" (`_encolarNotificacionDiferida` /
  `procesarNotificacionesDiferidas`, ambas eliminadas). Motivo: el
  fundador notó en el celu que estas notificaciones ("¡Dato de
  comunidad! Las X duran en promedio 750 km...") le llegaban todas
  juntas con la misma hora, y siempre con el mismo "750 km" — dos
  problemas reales, no cosmética:
  - El delay de 24hs no cumplía su función sin una notificación push
    real (el celu no avisa solo) — la notificación quedaba esperando
    en la hoja `Notif_Diferidas` hasta la próxima vez que el usuario
    abría la pantalla de Notificaciones, momento en el que todas las
    pendientes se disparaban juntas, pareciendo spam.
  - El "750 km" es un valor de relleno que se usa cuando **no hay
    ningún dato real de comunidad todavía** para esa marca/modelo —
    se estaba mostrando como si fuera un dato real cuando no lo era.
  - Reemplazado por `_notificarDatoComunidadSiHayDatos()`: manda el
    mensaje al toque, al registrar la zapa, y **solo si ya hay datos
    reales** (`proof.esNuevo === false`). Si el modelo es nuevo sin
    comunidad detrás, no se manda nada — ya no se inventa un número.
  - Si tenías un trigger horario configurado en Apps Script para
    `procesarNotificacionesDiferidas`, se puede borrar (Activadores →
    buscarlo → ✕) — la función ya no existe.
  - La hoja `Notif_Diferidas` queda como está (con historial viejo),
    no se borra sola; se puede limpiar a mano si molesta, no es
    obligatorio.
- `_encolarNotificacionDiferida()` (HISTÓRICO, ya eliminada — ver
  arriba): notificación de "dato de comunidad"
  (ej. "las X duran en promedio Y km") se manda 24hs después de agregar
  una zapatilla, vía la hoja `Notif_Diferidas`.
- Se sacó una función muerta (`registrarZapatillaConProof`, firma rota,
  no se usaba).
- `procesarNotificacionesDiferidas()` ya no depende únicamente del
  trigger horario manual — codigo.gs la llama sola como respaldo (ver
  arriba). El trigger sigue siendo válido si lo tenés configurado, pero
  ya no es obligatorio para que las notificaciones lleguen.
- Nota (actualizada 19/07/2026): `gas/social-proof-ui.html` tenía dos
  piezas de diseño sin integrar — el **banner** (ventanita al
  registrar zapatilla) y un **acordeón** ("¿Cómo rinde esta zapatilla
  en la comunidad?") para cada tarjeta. El banner **ya se integró** en
  Index.html (ver esa sección abajo). El acordeón sigue sin integrar,
  el archivo queda como referencia para eso si se quiere sumar más
  adelante.
- `procesarNotificacionesDiferidas()` ahora usa `LockService` para que
  dos visitas casi simultáneas no manden la misma notificación diferida
  dos veces (podía pasar porque ahora se llama desde 2 lugares distintos
  en cada visita, ver codigo.gs arriba).

## Index.html (app principal)

- **10 modelos de Asics (street) agregados (20/07/2026)**: Gel Nimbus 26,
  Soniblast, Cayano 32, Gel Rocket 11, Megablast, Gel Trebuco 13, Gel
  Cumulus 27, Cayano 32 W, Novablast, Novablast 5 Lite — cada uno con
  foto propia (no la genérica). Se verificó que ningún nombre se repita
  con lo que ya existía (Asics no tenía modelos cargados todavía, solo
  la genérica de marca). Ver `docs/cloudinarys-zapatillas.md`.
- **Modal "dato de comunidad" integrado (19/07/2026)**: al registrar
  una zapatilla, si ya hay datos reales de otros usuarios con esa
  marca/modelo, se abre una ventanita — "¡Zapatilla registrada!",
  cuántos runners más la usan, km globales acumulados, botón
  "¡A entrenar! 🏃" — antes de volver al dashboard. Si el modelo es
  nuevo sin comunidad detrás, no se abre nada (no se inventa un dato).
  Es el diseño que ya existía en `social-proof-ui.html` desde hace
  tiempo pero nunca se había pegado; el fundador se acordó de que
  existía y pidió integrarlo en vez de mandar el dato al buzón de
  notificaciones (que fue el paso intermedio de hoy a la mañana).
  Colores adaptados a la paleta actual de la app (dorado apagado
  `#C5B358`, no el amarillo brillante del diseño original).

- Agregados 11 modelos de Adidas (street) al `catalogo` y `modelImages`,
  cada uno con foto propia (no la genérica): Adizero Evo, Ultrarun 5,
  Duramo SL2, Supernova Glise, Supernova Rise 3, Duramo Speed, Adistar
  ByD, Supernova 2, Questar 3, Adizero Drive, Response 2 (17/07/2026).
  Se verificó que ningún nombre se repita con modelos ya existentes
  (todos los demás son marcas trail, sin superposición). Ver
  `docs/cloudinarys-zapatillas.md` para el detalle y los links.
- "VERSIÓN DEMO" agrandada (0.6rem → 0.85rem) en la pantalla de bienvenida,
  y agregada también en la pantalla de login (antes solo estaba en la
  bienvenida) — a pedido del fundador (17/07/2026).
- Todo el branding "Todo Trail" reemplazado por "Huella Runner", incluyendo
  dos casos escondidos que no agarró la primera limpieza:
  - Subtítulo grande "TODO TRAIL" partido en dos `<span>` separados,
    debajo del logo en bienvenida/login/registro.
  - Logo del dashboard, que decía "Todo"/"Trail" en minúsculas (la primera
    búsqueda solo miraba texto en mayúsculas).
  - Los 2 párrafos de la pantalla de bienvenida (onboarding) también
    decían "trail" ("zapatillas trail", "comunidad trail").
- Recuperados: acordeón legal "VER LEGALES +" y toggle de tema 🌙/☀️
  (existían en el GAS en vivo pero no en GitHub).
- `doLogin()` / `doRegister()`: ahora atrapan cualquier error antes de
  llegar al servidor y lo muestran en pantalla — antes, si algo fallaba en
  esa parte, no pasaba absolutamente nada al tocar el botón.
- `doLogin()`: si dejás email o contraseña vacíos, ahora avisa en vez de
  no hacer nada.
- Historial de zapatilla: ya no muestra "00:00" falso cuando no hay hora
  real cargada.
- Sacado el título grande "MIS ZAPAS" de la pantalla del armario —
  "Tus zapatillas activas" ahora es más grande y hace de título.
- Sacado el campo "Apodo" del formulario de agregar zapatilla.
- Botón "Ver en tienda" de cada zapatilla: sacado el link a
  `todotrail.com.ar` y el texto "todo trail". Ahora dice
  "🛒 Próximamente" sin acción (deshabilitado), hasta que haya un destino
  real. `irATodoTrail()` queda sin usar, lista para reactivar con un link
  real cuando lo haya.
- Agregadas 7 marcas street al desplegable de zapatillas: Adidas, Asics,
  Fila, New Balance, Nike, Skechers, Under Armour — con su foto
  genérica de Cloudinary. Todavía sin modelos específicos cargados (el
  desplegable de modelo para estas marcas ofrece solo "Otros...", carga
  manual). Ver `docs/cloudinarys-zapatillas.md` para el detalle.
- Arreglada la genérica de Saucony: usaba por error una foto de la
  Peregrine 16 (una zapatilla específica) como si fuera la genérica de
  marca. Ahora usa una foto genérica real. La Peregrine 16 ya estaba
  bien puesta como modelo específico, no se tocó.
- Ninguna de las marcas/fotos trail existentes se tocó — se verificó
  cada una contra lo que ya había antes de agregar nada.

## Admin.html (panel de administración)

- Todo el branding "Todo Trail" reemplazado por "Huella Runner" (logo,
  ranking, insights).
- Botón "⏻ Salir" agregado al lado de "↺ Actualizar", para volver al login.
  - Primera versión no funcionaba: Apps Script muestra el panel dentro de
    un iframe de otro dominio, y el navegador bloquea en silencio el
    acceso directo a `window.top` por seguridad. Arreglado pidiendo la URL
    real al backend (`getAppUrl()`) y navegando con un link
    `target="_top"`, igual que ya usa el login para entrar al panel.
- Sacado "calzado trail" de un texto de insights (ahora dice "calzado
  running").

## landing.html

- Branding "Todo Trail" reemplazado por "Huella Runner" (título, tag,
  texto de instalación en el footer).
- Capturas de pantalla actualizadas — varias de las que se usaban en la
  landing eran de antes de las correcciones de marca y todavía mostraban
  "TODO TRAIL" bien legible (logo, botón de tienda, un mensaje de prueba
  en notificaciones):
  - `dashboard.jpg` y `login.jpg` se borraron (ya no se usan, eran las que
    mostraban la marca vieja más grande y visible).
  - Nueva captura `desgaste-zapatilla.jpg` (limpia) las reemplaza en el
    header y en la sección "comunidad".
  - `onboarding.jpg`, `nueva-zapatilla.jpg` y `notificaciones.jpg` se
    recortaron o reemplazaron para sacar el texto viejo.
  - `historial.jpg`, `locker.jpg`, `archivar.jpg` y `registrar-km.jpg` no
    hacía falta tocarlas: el logo queda borroso de fondo ahí, no se lee.
- **Pendiente / diferido a pedido explícito del fundador**: la sección
  `<span class="tag">Para Todo Trail</span>` y el texto "inteligencia
  comercial para Todo Trail" del pitch a sponsors siguen como están.
- **Pendiente**: al fundador le quedaron 2 capturas del teléfono con la
  versión vieja de la app todavía pegada en el GAS (pantalla "Mis Zapas"
  vacía y el formulario "Nueva Zapatilla" con el campo Apodo) — no se
  usaron acá porque ya no reflejan el código actual. Cuando repegue el
  Index.html nuevo y saque fotos frescas, se pueden sumar más capturas
  reales (login, notificaciones completas, etc.) para variar un poco las
  que se repiten.

## pwa/ (antes estaba todo esto suelto en la raíz del repo)

- Se movieron `index.html`, `manifest.json`, `service-worker.js` e
  `icons/` a una carpeta `pwa/` propia, para que quede clarísimo qué se
  sube a Vercel/Netlify (esta carpeta, apuntando el "Root Directory" del
  deploy acá) y qué no (todo lo demás, sobre todo `gas/` y
  `landing.html`). Los paths internos son todos relativos, así que
  funcionan igual después de moverlos. Ver `pwa/README.md`.
- Es la "cascarita" PWA (pantalla de bienvenida + redirección a la app
  de Apps Script) — no tiene lógica de negocio, es un sitio estático.
- URL del GAS en `pwa/index.html` actualizada a la del deployment
  actual confirmado por el fundador (16/07/2026).
- BUG REAL arreglado: `service-worker.js` guardaba la página en caché
  y la servía siempre de memoria, sin importar si había una versión
  nueva en el servidor — por eso una actualización recién publicada en
  Vercel no le llegaba a quien ya había visitado la PWA antes (quedaba
  viendo la URL del GAS vieja para siempre, aunque el código ya
  estuviera arreglado). Cambiado a "red primero, caché de respaldo":
  ahora siempre busca la versión más nueva cuando hay conexión, y solo
  usa la copia guardada si no hay internet. Con esto, de acá en más,
  cada actualización que se suba llega sola, sin que nadie tenga que
  borrar caché ni reinstalar la app.
- Pendiente/experimental (no confirmado que funcione): probar si
  meter la app de Apps Script en un iframe en vez de redirigir con
  `window.location.href` saca el cartel de "creado por un usuario de
  Google Apps Script" — ese cartel pertenece a la página real de
  script.google.com, no a esta cascarita, así que redirigiendo (como
  está ahora) sigue apareciendo.
- BUG REAL arreglado: el redirect a la app (`window.location.href = GAS_URL`)
  siempre apuntaba a la misma URL exacta, así que el navegador del celular
  (sobre todo en modo "ícono de pantalla de inicio") podía servir una copia
  vieja de esa página desde su caché normal en vez de pedirla de nuevo —
  por eso un celular llegó a mostrar "imagen no disponible" en una
  zapatilla Adidas mientras la PC (que sí volvía a pedir la página) la
  mostraba bien. Ahora el redirect agrega `?v=` + un número que cambia en
  cada carga (`Date.now()`), así cada visita es una URL "nueva" para el
  navegador y siempre trae la versión más reciente del GAS.
- CAUSA REAL de fondo del bug de arriba (no era solo caché): la URL de
  GAS guardada en `pwa/index.html` (`AKfycbz6jPZr...`) apuntaba a una
  **implementación vieja** de Apps Script, de antes de agregar Adidas —
  se había creado una implementación nueva (con otra URL,
  `AKfycbwxh1GR...`) en vez de actualizar la existente, y Vercel se quedó
  con la dirección vieja anotada. Corregido: `GAS_URL` actualizada a
  `AKfycbwxh1GR...` (17/07/2026). Para que esto no se repita: en Apps
  Script, siempre usar **Implementar → Administrar implementaciones →
  Editar (lápiz) → Nueva versión → Implementar** sobre la implementación
  ya existente, nunca "Nueva implementación" (eso genera una URL
  distinta y hay que volver a actualizar `pwa/index.html`).
- Unificado el color de acento dorado con el de la app real: la PWA
  (splash, `theme-color`, `manifest.json`) usaba `#FFD700` (amarillo
  brillante, resto de la etapa Open Sports), pero `gas/index.html` ya
  usa `#C5B358` (dorado apagado, tipo champagne) desde antes. Cambiado
  en `pwa/index.html` (meta theme-color, título, barra de carga) y
  `pwa/manifest.json` (`theme_color`) — ahora los tres coinciden:
  fondo `#080808`, dorado `#C5B358`, plata `#E8E8E8` (17/07/2026).
- **Pendiente**: el ícono de la PWA (`icons/icon-192.png` e
  `icon-512.png`) sigue con el amarillo brillante viejo de fondo —
  es una imagen ya armada, no un color de CSS, así que no se puede
  unificar solo con código. Hay que regenerar/exportar un ícono nuevo
  con el dorado `#C5B358` desde el diseño original (Canva/Photoshop/etc.)
  y reemplazar esos dos archivos.

## Otros

- Sheet: se revisaron las pestañas Usuarios, Notif_Diferidas, Zapatillas,
  Entrenamientos, Notificaciones, Cupones_Emitidos y Catálogo.
- Se corrigió el `SHEET_ID` que apuntaba a un spreadsheet viejo.
- Se borró `TAREAS.md`: quedó obsoleto (bugs que ya se arreglaron, URL de
  GAS vieja, branch que ya no existe). Lo que hacía falta ya está acá.
- Sheet: pestaña "Entrenamiento" (singular, vacía) duplicada de
  "Entrenamientos" — ningún código la usa, se puede borrar directamente
  en el Sheet sin miedo.
