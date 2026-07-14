# Historial de cambios — Huella Runner

Este archivo es un registro de todo lo que se fue arreglando o cambiando en
cada archivo del proyecto. **Antes de pedir un arreglo, fijate acá si ya
está hecho** — así no le pedimos a Claude que revise dos veces lo mismo.

Cada archivo `.gs` y `.html` tiene además su propio encabezado con fecha y
hora de la última actualización, para que sepas si lo que tenés pegado en
el GAS es la versión más nueva.

> Se actualiza cada vez que se mergea un cambio a GitHub.

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

## admin.gs

- `_adminAutorizado(token)`: acceso al panel admin vía `?page=admin&token=...`.
- `ADMIN_EMAILS`: lista de emails que son admin automáticamente al hacer
  login (sin depender de la columna Rol del sheet). Hoy incluye
  `huellarunner@gmail.com`.
- `_esEmailAdmin(email)`: helper que usa `loginUser()` en codigo.gs.

## trail-points.gs

- Se sacó por completo el descuento del 85% en km cargados a mano
  (`FACTOR_MANUAL`). Los km se acreditan al 100%.
- Sin requisito de hora obligatoria para cargar km manual (antes, si no
  había hora exacta, rechazaba la carga).
- `_guardarEntrenamiento()` usa `appendDataByHeader()` (auto-reparación de
  columnas) en vez de escribir directo a celdas fijas.

## social-proof.gs

- `_encolarNotificacionDiferida()`: notificación de "dato de comunidad"
  (ej. "las X duran en promedio Y km") se manda 24hs después de agregar
  una zapatilla, vía la hoja `Notif_Diferidas`.
- Se sacó una función muerta (`registrarZapatillaConProof`, firma rota,
  no se usaba).
- Nota: existe un archivo aparte, `gas/social-proof-ui.html`, con un
  diseño más vistoso (banner + acordeón) que **no está pegado** en
  Index.html todavía — es una propuesta sin integrar, no un bug.

## Index.html (app principal)

- Todo el branding "Todo Trail" reemplazado por "Huella Runner", incluyendo
  dos casos escondidos que no agarró la primera limpieza:
  - Subtítulo grande "TODO TRAIL" partido en dos `<span>` separados,
    debajo del logo en bienvenida/login/registro.
  - Logo del dashboard, que decía "Todo"/"Trail" en minúsculas (la primera
    búsqueda solo miraba texto en mayúsculas).
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

## Admin.html (panel de administración)

- Todo el branding "Todo Trail" reemplazado por "Huella Runner" (logo,
  ranking, insights).
- Botón "⏻ Salir" agregado al lado de "↺ Actualizar", para volver al login.
  - Primera versión no funcionaba: Apps Script muestra el panel dentro de
    un iframe de otro dominio, y el navegador bloquea en silencio el
    acceso directo a `window.top` por seguridad. Arreglado pidiendo la URL
    real al backend (`getAppUrl()`) y navegando con un link
    `target="_top"`, igual que ya usa el login para entrar al panel.

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

## Raíz del proyecto (index.html, manifest.json, service-worker.js)

- Estos 3 archivos son la "cascarita" PWA (pantalla de bienvenida +
  redirección a la app de Apps Script) — van a Netlify o Vercel, **no** al
  GAS. Están separados de todo lo de `gas/`.
- Pendiente: confirmar la URL `/exec` actual del deploy de Apps Script,
  porque la que está hardcodeada en este `index.html` puede estar
  desactualizada.

## Otros

- Sheet: se revisaron las pestañas Usuarios, Notif_Diferidas, Zapatillas,
  Entrenamientos, Notificaciones, Cupones_Emitidos y Catálogo.
- Se corrigió el `SHEET_ID` que apuntaba a un spreadsheet viejo.
- Se borró `TAREAS.md`: quedó obsoleto (bugs que ya se arreglaron, URL de
  GAS vieja, branch que ya no existe). Lo que hacía falta ya está acá.
