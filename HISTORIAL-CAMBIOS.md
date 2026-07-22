# Historial de cambios — Huella Runner

Este archivo es un registro de todo lo que se fue arreglando o cambiando en
cada archivo del proyecto. **Antes de pedir un arreglo, fijate acá si ya
está hecho** — así no le pedimos a Claude que revise dos veces lo mismo.

Cada archivo `.gs` y `.html` tiene además su propio encabezado con fecha y
hora de la última actualización, para que sepas si lo que tenés pegado en
el GAS es la versión más nueva.

> Se actualiza cada vez que se mergea un cambio a GitHub.

---

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
