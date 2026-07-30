// ============================================
// HUELLA RUNNER — codigo.gs
// Última actualización: 29/07/2026 23:37 (hora Argentina)
// Cambios en esta versión:
//   - Nuevas getPerfilUsuario(email) y actualizarPerfilUsuario(email,
//     datos): sostienen la pantalla nueva "Mi Perfil" de Index.html.
//     Leen/escriben FechaNacimiento, Provincia, Ciudad, Celular y Grupo
//     de la fila del usuario en Usuarios — los mismos 5 campos que
//     desde ayer quedaron como "opcional, completar después" en el
//     registro, pero que hasta ahora no tenían ningún "después" real.
// Cambios en versiones anteriores:
//   - Semáforo de desgaste (panel admin): getAdminDashboardData() ahora
//     agrega 'limite' y 'porcentaje' (km / KM_Limite propio de la
//     zapatilla) a cada zapatilla de alertasDesgaste. Antes el panel
//     coloreaba/agrupaba por km crudo (bandas fijas 300/600/800) — con
//     el límite por zapatilla ya en uso, dos zapatillas con el mismo km
//     pueden tener urgencias bien distintas si sus límites son
//     distintos. Ver admin.html para el consumo de estos campos nuevos.
// Cambios en versiones anteriores:
//   - BUG DEL LOCKER RESUELTO. Síntoma: el Locker mostraba siempre "El
//     Locker está vacío" aunque las zapatillas estuvieran bien
//     archivadas en el Sheet. Causa: google.script.run no puede
//     empaquetar un objeto que contenga un Date nativo de Sheets —
//     cuando pasa, al frontend le llega null (no una lista vacía: null)
//     sin error ni aviso, y el código lo interpretaba como "no hay
//     nada". La única columna con fecha es Fecha_Archivado, y solo la
//     tienen las archivadas — por eso fallaba el Locker y no el
//     carrusel de activas. Se diagnosticó con _diagLocker() (el
//     servidor devolvía las 2 zapatillas bien) más un alert temporal en
//     el frontend (que recibía archived=null).
//     Fix: nueva _filaZapaAObjeto(headers, fila), que convierte
//     cualquier celda Date a texto "dd/MM/yyyy" antes de devolverla.
//     Se aplica en getArchivedShoes() y también en getUserShoes() — una
//     zapatilla reactivada conserva su Fecha_Archivado vieja, así que el
//     mismo problema podía aparecer en el carrusel de activas.
// Cambios en versiones anteriores:
//   - Nueva función _diagLocker() — TEMPORAL, para diagnosticar el bug
//     reportado por el fundador: el Locker no muestra zapatillas
//     archivadas aunque el Sheet las tenga bien guardadas (confirmado
//     en 2 usuarios distintos, edragotto@hotmail.com y
//     estebandragotto@gmail.com). Compara lo que devuelve
//     getArchivedShoes() contra un recuento manual fila por fila, para
//     encontrar dónde se pierde el dato. Correr a mano desde el editor
//     y mirar el Registro de ejecución. Se puede borrar una vez
//     resuelto — no la usa ninguna pantalla.
// Cambios en versiones anteriores:
//   - Nuevo tipo de destinatario 'lista' en enviarNotificacion(): permite
//     mandar un mensaje a un array de emails ya armado del lado del panel
//     admin (ej. "zapas en alerta", "inactivos", "cumpleaños de la
//     semana"), en vez de solo todos/grupo/individual. Valida que cada
//     email corresponda a un usuario real antes de mandar nada. Requiere
//     token de admin, igual que "todos"/"grupo".
//   - Fix: getAdminDashboardData() arma alertasDesgaste (zapas en zona
//     crítica) sin el campo email — el panel admin lo necesitaba para el
//     filtro "Alerta Zapas" de "Usuarios registrados" (buscaba a.email,
//     que nunca existía) y ahora también para el segmento nuevo de
//     notificaciones. Sin este fix, ese filtro nunca mostraba resultados.
// Cambios en versiones anteriores:
//   - PERFORMANCE: enviarNotificacion() escribía una fila por vez en la
//     hoja Notificaciones, con un SpreadsheetApp.flush() por cada
//     destinatario — con envíos masivos ("todos"/"grupo") eso se
//     notaba (el fundador lo detectó mandando a 53 usuarios simulados:
//     tardaba mucho más que mandar a 1-3). Ahora arma todas las filas
//     en memoria y las escribe de una sola vez con un solo flush, sin
//     importar si son 3 o 300 destinatarios.
// Cambios en versiones anteriores:
//   - "HUELLA" también en cursiva ahora en el logo de los correos
//     (antes solo "RUNNER" estaba en font-style:italic) — a pedido del
//     fundador, para que las dos palabras se vean inclinadas.
// Cambios en versiones anteriores:
//   - Unificado el formato del logo en los correos (bienvenida y
//     recuperación de contraseña): tenían un tercer esquema de color
//     que había quedado suelto (verde lima #dcfd8b + plata), distinto
//     tanto del login viejo como del resto de la app. Ahora usan
//     plata + dorado (#C5B358, el mismo dorado de toda la app), con
//     "RUNNER" en cursiva real (font-style:italic — en emails es más
//     confiable que un inclinado por CSS, que Gmail/Outlook no siempre
//     respetan). También se pasó a dorado la contraseña temporal
//     resaltada y la mención de "Huella Runner" en el correo de
//     bienvenida, que usaban el mismo verde lima viejo.
// Cambios en versiones anteriores:
//   - BUG arreglado: el ícono de la PWA (page=icon) devolvía un SVG
//     como texto plano (Content-Type text/plain), no una imagen real —
//     por eso al agregar la app a la pantalla de inicio del celu
//     aparecía un ícono genérico en vez del logo. El manifest ahora
//     apunta directo a los PNG reales ya alojados en Vercel
//     (huella-runner.vercel.app/icons/icon-192.png y icon-512.png,
//     los mismos que ya usa la pantalla de bienvenida de la PWA). Se
//     sacó el generador de ícono roto, que ya no lo usa nadie. De paso,
//     el color de fondo/tema del manifest (que seguía en negro+neón
//     lima viejo) se actualizó al negro+dorado actual de la marca.
// Cambios en versiones anteriores:
//   - BUG arreglado: getAdminDashboardData() (alertas de desgaste del
//     panel admin) comparaba el km de cada zapatilla contra el umbral
//     global fijo (TP.KM_UMBRAL_CUPON, 650) en vez del KM_Limite propio
//     de cada zapatilla — quedó desincronizado del Paso 1 del límite
//     por zapatilla. Encontrado en revisión de bugs del 20/07.
// Cambios en versiones anteriores:
//   - Paso 1 del límite de km por zapatilla: addShoe() ahora acepta un
//     límite de km opcional por zapatilla (formData.kmLimite). Si no se
//     indica, usa el umbral global de siempre (TP.KM_UMBRAL_CUPON, 650)
//     como valor por defecto. Se guarda en la columna nueva KM_Limite
//     de la hoja Zapatillas (se crea sola si no existe).
//   - reactivateShoe(), deleteTraining() y editarEntrenamiento() ahora
//     recalculan el estado de desgaste usando el KM_Limite propio de
//     cada zapatilla (con fallback a 650 para las zapatillas viejas que
//     no tienen ese dato guardado), en vez del umbral global fijo.
//   - Nueva función editarEntrenamiento(email, idEntreno, idZapatilla,
//     kmNuevo): corrige el km de un registro ya cargado sin borrarlo,
//     ajustando el km de la zapatilla por la diferencia (delta).
//   - archiveShoe() ahora guarda la fecha de archivado
//     (Fecha_Archivado), para mostrarla en el Locker.
//   - enviarNotificacion() ya no genera código de voucher ni distingue
//     tipo "Premio" — se sacó todo lo de Open Sports/voucher del envío
//     de notificaciones (a pedido del fundador). Se guarda 'Mensaje'
//     siempre. _generarCodigoVoucher() eliminada.
//   - loginUser() ahora devuelve requiereCambioPassword: true cuando la
//     cuenta entró con una contraseña temporal (la que genera
//     recoverPassword). recoverPassword() marca la cuenta con la
//     columna nueva Requiere_Cambio_Password al mandar la temporal.
//   - Nueva función establecerNuevaPassword(email, nuevaPassword): la
//     usa la pantalla nueva "Elegí tu contraseña nueva" (Index.html)
//     para que el usuario defina su contraseña definitiva después de
//     entrar con la temporal, con doble ingreso.
//   - addShoe() ya no manda ninguna notificación al buzón — ahora
//     devuelve el dato de comunidad (socialProof) directo en la
//     respuesta, para que Index.html lo muestre al toque en una
//     ventanita (modal) al registrar la zapatilla.
//   - addShoe() encolaba la notificación de "dato de comunidad" para
//     mandar 24hs después — se sacó ese delay, mandándola al toque (y
//     solo si hay datos reales) vía _notificarDatoComunidadSiHayDatos()
//     en social-proof.gs (esa función también se sacó después, ver
//     arriba). Sacadas las llamadas de respaldo a
//     procesarNotificacionesDiferidas() en getNotificacionesUsuario()
//     y contarNoLeidas() (esa función ya no existe, ver social-proof.gs).
//   - BUG DE SEGURIDAD arreglado: getAdminDashboardData() y
//     enviarNotificacion() (envíos a "todos"/"grupo") no revisaban el
//     token de admin. Ahora sí — ver detalle en admin.gs.
//   - BUG DE SEGURIDAD arreglado: las contraseñas se guardaban y se
//     reenviaban por mail en texto plano. Ahora se guardan hasheadas
//     (_hashPassword, formato "salt$hash"). Los usuarios ya registrados
//     se migran solos al formato nuevo la próxima vez que inicien
//     sesión, sin hacer nada distinto. "Olvidé mi contraseña" ya no
//     reenvía la contraseña vieja (no se puede leer de un hash) — ahora
//     genera una nueva y la manda por mail, mismo flujo de siempre.
//   - getAdminUrl() ahora arma el link con el token real leído de
//     Propiedades del script (ver admin.gs), no de una constante en
//     este código.
//   - Sacado "trail" y "sendero" del mail de bienvenida (catálogo,
//     comunidad, desgaste, despedida) y de la descripción del manifest
//     PWA. Emojis de montaña 🏔️ cambiados por 🏃.
//   - BUG REAL arreglado: las notificaciones diferidas de Social Proof
//     quedaban encoladas en Notif_Diferidas para siempre y nunca
//     llegaban a la app. Causa: procesarNotificacionesDiferidas() (en
//     social-proof.gs) solo corre si hay un trigger horario configurado
//     a mano en Apps Script, y nunca se conectó como respaldo. Ahora
//     getNotificacionesUsuario() y contarNoLeidas() la llaman solas
//     cada vez que alguien abre o revisa su buzón, así no depende de
//     que el trigger esté configurado.
//   - loginUser: ahora también es admin si el email está en ADMIN_EMAILS
//     (ver admin.gs), sin depender de la columna Rol del sheet
//   - (mantiene: SHEET_ID "Huella Runner Final 1407", Fecha_Registro,
//     TRAIN_HEADERS unificado, Email_Usuario en Notificaciones, try/catch
//     en login/registro, auto-creación de columnas)
// ============================================

const SHEET_ID = '1ThbstRTiGHL3Vfkc6mtX_BluSDYTxQx6-KOSu9QFTPk';
const TZ_AR = 'America/Argentina/Buenos_Aires';

function doGet(e) {
  const page = e && e.parameter ? e.parameter.page : '';

  // ── PWA: Web App Manifest ──
  if (page === 'manifest') {
    const appUrl = ScriptApp.getService().getUrl();
    const manifest = {
      name:             'Huella Runner',
      short_name:       'Huella Runner',
      description:      'Tu zapatilla, siempre bajo control.',
      start_url:        appUrl,
      scope:            appUrl,
      display:          'standalone',
      orientation:      'portrait',
      background_color: '#080808',
      theme_color:      '#C5B358',
      lang:             'es',
      icons: [
        { src: 'https://huella-runner.vercel.app/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
        { src: 'https://huella-runner.vercel.app/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
      ]
    };
    return ContentService
      .createTextOutput(JSON.stringify(manifest))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // ── PWA: Service Worker ──
  if (page === 'sw') {
    const SW_VERSION = 'hr-v1';
    const swCode = `
const CACHE = '${SW_VERSION}';
const SHELL = ['${ScriptApp.getService().getUrl()}'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(SHELL); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    fetch(e.request).then(function(res) {
      var clone = res.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
      return res;
    }).catch(function() {
      return caches.match(e.request).then(function(cached) {
        return cached || new Response('<h2 style="font-family:sans-serif;padding:40px;color:#555">Sin conexión — abrí Huella Runner cuando tengas internet para ver tus datos.</h2>', {headers:{'Content-Type':'text/html'}});
      });
    })
  );
});
`;
    return ContentService
      .createTextOutput(swCode)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  // ── Panel admin ──
  if (page === 'admin') {
    const token = e && e.parameter ? e.parameter.token : '';
    if (!_adminAutorizado(token)) {
      return HtmlService.createHtmlOutput(
        '<h2 style="font-family:sans-serif;color:#c00;padding:40px">Acceso denegado.</h2>'
      );
    }
    const tpl = HtmlService.createTemplateFromFile('Admin');
    tpl.adminToken = token; // el panel lo necesita para pedir sus propios datos
    return tpl.evaluate()
      .setTitle('Admin — Huella Runner')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  }

  // ── App principal ──
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Huella Runner')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

function getAdminUrl() {
  return ScriptApp.getService().getUrl() + '?page=admin&token=' + _getAdminToken();
}

// URL de la app principal (sin ?page=admin), para el botón "Salir" del panel admin.
function getAppUrl() {
  return ScriptApp.getService().getUrl();
}

function getSheetAndHeaders(sheetName, defaultHeaders) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(defaultHeaders);
    SpreadsheetApp.flush();
  }
  const headers = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
  return { sheet, headers };
}

function appendDataByHeader(sheetName, defaultHeaders, dataObj) {
  const { sheet, headers } = getSheetAndHeaders(sheetName, defaultHeaders);
  // Auto-reparación: si el sheet no tiene la columna de un dato, la crea.
  // Sin esto, el valor se descartaba en silencio.
  for (const key in dataObj) {
    if (headers.indexOf(key) === -1) {
      sheet.getRange(1, headers.length + 1).setValue(key);
      headers.push(key);
    }
  }
  let newRow = new Array(headers.length).fill('');
  for (const key in dataObj) {
    const colIndex = headers.indexOf(key);
    if (colIndex !== -1) newRow[colIndex] = dataObj[key];
  }
  sheet.appendRow(newRow);
  SpreadsheetApp.flush();
}

// --- USUARIOS ---
// CAMBIO v2906: Provincia y Ciudad agregados antes de Celular
const USERS_HEADERS = ['Nombre', 'Apellido', 'Email', 'Password', 'Nivel', 'Grupo', 'FechaNacimiento', 'Provincia', 'Ciudad', 'Celular', 'Rol', 'Fecha_Registro'];

// ============================================================
// CONTRASEÑAS: se guardan hasheadas ("salt$hash"), nunca en texto
// plano. _hashPassword no se puede "desarmar" para recuperar la
// contraseña original — por eso recoverPassword() genera una nueva
// en vez de reenviar la vieja.
// ============================================================
function _hashPassword(password, salt) {
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password + ':' + salt, Utilities.Charset.UTF_8);
  return raw.map(function(b) { return ('0' + (b & 0xFF).toString(16)).slice(-2); }).join('');
}

// Compara la contraseña ingresada contra la guardada. Soporta el formato
// nuevo hasheado ("salt$hash") y, para cuentas creadas antes de este
// cambio, el formato viejo en texto plano — si coincide, la migra sola
// al formato hasheado en ese mismo login, sin que el usuario note nada.
function _verificarPassword(guardada, ingresada, sheet, filaIndex, colIndex) {
  if (guardada.indexOf('$') !== -1) {
    const partes = guardada.split('$');
    return _hashPassword(ingresada, partes[0]) === partes[1];
  }
  if (guardada === ingresada) {
    const salt = Utilities.getUuid();
    const hash = _hashPassword(ingresada, salt);
    sheet.getRange(filaIndex + 1, colIndex + 1).setValue(salt + '$' + hash);
    SpreadsheetApp.flush();
    return true;
  }
  return false;
}

function _generarPasswordTemporal() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let pass = '';
  for (let i = 0; i < 10; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

// CAMBIO v2906: registerUser recibe provincia y ciudad
function registerUser(nombre, apellido, email, password, nivel, grupo, fechaNac, provincia, ciudad, celular) {
  try {
    if (!nombre || nombre.toString().trim() === '') {
      return { success: false, error: 'El nombre es requerido.' };
    }
    if (!email) return { success: false, error: 'Email requerido.' };
    const emailClean = email.toString().trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
      return { success: false, error: 'El email no tiene un formato válido.' };
    }
    if (!password || password.toString().length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }
    const nombreClean = nombre.toString().trim();
    const { sheet, headers } = getSheetAndHeaders('Usuarios', USERS_HEADERS);
    const data = sheet.getDataRange().getValues();
    const emailCol = headers.indexOf('Email');
    for (let i = 1; i < data.length; i++) {
      const rowEmail = data[i][emailCol] ? data[i][emailCol].toString().trim().toLowerCase() : '';
      if (rowEmail === emailClean) {
        return { success: false, error: 'El email ya esta registrado.' };
      }
    }
    const salt = Utilities.getUuid();
    const hash = _hashPassword(password.toString(), salt);
    appendDataByHeader('Usuarios', USERS_HEADERS, {
      'Nombre':          nombreClean,
      'Apellido':        apellido,
      'Email':           emailClean,
      'Password':        salt + '$' + hash,
      'Nivel':           nivel || '',
      'Grupo':           grupo || '',
      'FechaNacimiento': fechaNac || '',
      'Provincia':       provincia || '',
      'Ciudad':          ciudad || '',
      'Celular':         celular || '',
      'Rol':             '',
      'Fecha_Registro':  new Date()
    });

    enviarEmailBienvenida(emailClean, nombreClean);
    return { success: true, email: emailClean, nombre: nombreClean };
  } catch(e) {
    Logger.log('registerUser ERROR: ' + e.toString());
    return { success: false, error: 'Error interno al crear la cuenta.' };
  }
}

function loginUser(email, password) {
  try {
    if (!email) return { success: false, error: 'Email requerido.' };
    const emailClean = email.toString().trim().toLowerCase();
    const { sheet, headers } = getSheetAndHeaders('Usuarios', USERS_HEADERS);
    const data = sheet.getDataRange().getValues();
    const emailCol   = headers.indexOf('Email');
    const passCol    = headers.indexOf('Password');
    const nomCol     = headers.indexOf('Nombre');
    const rolCol     = headers.indexOf('Rol');
    const reqCambioCol = headers.indexOf('Requiere_Cambio_Password');
    if (emailCol === -1 || passCol === -1) {
      return { success: false, error: 'Estructura de Usuarios incorrecta.' };
    }
    for (let i = 1; i < data.length; i++) {
      const rowEmail = data[i][emailCol] ? data[i][emailCol].toString().trim().toLowerCase() : '';
      if (rowEmail !== emailClean) continue;
      const rowPass = data[i][passCol] ? data[i][passCol].toString() : '';
      if (!_verificarPassword(rowPass, password.toString(), sheet, i, passCol)) continue;

      const rol = rolCol !== -1 && data[i][rolCol] ? data[i][rolCol].toString().trim().toLowerCase() : '';
      const requiereCambio = reqCambioCol !== -1 && data[i][reqCambioCol] === true;
      return {
        success: true,
        email:   rowEmail,
        nombre:  nomCol !== -1 ? data[i][nomCol] : '',
        esAdmin: rol === 'admin' || _esEmailAdmin(rowEmail),
        requiereCambioPassword: requiereCambio
      };
    }
    return { success: false, error: 'Email o contrasena incorrectos.' };
  } catch(e) {
    Logger.log('loginUser ERROR: ' + e.toString());
    return { success: false, error: 'Error interno al iniciar sesión.' };
  }
}

// ============================================================
// RECUPERACIÓN DE CONTRASEÑA
// ============================================================
function recoverPassword(email) {
  if (!email || email.toString().trim() === '') {
    return { success: false, error: 'Ingresá tu email.' };
  }

  const emailClean = email.toString().trim().toLowerCase();

  var ss, sheet, data, headers;
  try {
    ss    = SpreadsheetApp.openById(SHEET_ID);
    sheet = ss.getSheetByName('Usuarios');
    if (!sheet) {
      Logger.log('recoverPassword: hoja Usuarios no encontrada');
      return { success: false, error: 'Error interno. Contactá al administrador.' };
    }
    data    = sheet.getDataRange().getValues();
    headers = data[0];
  } catch(e) {
    Logger.log('recoverPassword ERROR al abrir sheet: ' + e.toString());
    return { success: false, error: 'Error interno al acceder a los datos.' };
  }

  var emailCol = headers.indexOf('Email');
  var passCol  = headers.indexOf('Password');
  var nomCol   = headers.indexOf('Nombre');

  if (emailCol === -1 || passCol === -1) {
    Logger.log('recoverPassword: columnas Email o Password no encontradas');
    return { success: false, error: 'Error interno en la estructura de datos.' };
  }

  var encontrado    = false;
  var nombreUsuario = '';
  var filaEncontrada = -1;

  for (var i = 1; i < data.length; i++) {
    var rowEmail = data[i][emailCol] ? data[i][emailCol].toString().trim().toLowerCase() : '';
    if (rowEmail === emailClean) {
      encontrado      = true;
      nombreUsuario   = nomCol !== -1 ? data[i][nomCol].toString() : 'Runner';
      filaEncontrada  = i;
      break;
    }
  }

  if (!encontrado) {
    return { success: false, error: 'No encontramos una cuenta con ese email.' };
  }

  // La contraseña guardada está hasheada — no se puede "leer" para atrás.
  // Se genera una temporal, se guarda hasheada, y se marca la cuenta para
  // que en el próximo login la app le pida elegir una definitiva (con
  // doble ingreso) en vez de dejarla seguir con la temporal indefinidamente.
  var passwordTemporal = _generarPasswordTemporal();
  var saltNuevo = Utilities.getUuid();
  var hashNuevo = _hashPassword(passwordTemporal, saltNuevo);
  sheet.getRange(filaEncontrada + 1, passCol + 1).setValue(saltNuevo + '$' + hashNuevo);
  var reqCambioCol = _colEnsure(sheet, headers, 'Requiere_Cambio_Password');
  sheet.getRange(filaEncontrada + 1, reqCambioCol + 1).setValue(true);
  SpreadsheetApp.flush();

  try {
    MailApp.sendEmail({
      to:      emailClean,
      subject: 'Huella Runner — Recuperación de contraseña',
      body:    '',
      htmlBody:
        '<div style="font-family:Arial,sans-serif;background:#080808;padding:32px;border-radius:16px;max-width:480px;margin:auto;">' +
        '<h1 style="color:#E8E8E8;font-size:1.5rem;margin-bottom:4px;font-style:italic;">HUELLA <span style="color:#C5B358;">RUNNER</span></h1>' +
        '<p style="color:#888;font-size:0.65rem;letter-spacing:3px;text-transform:uppercase;margin-top:0;">Powered by Huella Runner MDQ</p>' +
        '<hr style="border:none;border-top:1px solid #1f1f1f;margin:20px 0;">' +
        '<p style="color:#E8E8E8;font-size:1rem;">Hola, <strong>' + nombreUsuario + '</strong> 👋</p>' +
        '<p style="color:#888888;font-size:0.85rem;line-height:1.6;">Recibiste este correo porque solicitaste recuperar tu contraseña. Generamos una temporal para vos:</p>' +
        '<div style="background:#111111;border:1px solid #1f1f1f;border-radius:12px;padding:16px 20px;margin:20px 0;">' +
        '<p style="color:#888;font-size:0.65rem;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Tu contraseña temporal</p>' +
        '<p style="color:#C5B358;font-size:1.3rem;font-weight:900;margin:0;letter-spacing:1px;">' + passwordTemporal + '</p>' +
        '</div>' +
        '<p style="color:#888888;font-size:0.85rem;line-height:1.6;">Iniciá sesión con esta contraseña — al entrar, te vamos a pedir que elijas una definitiva.</p>' +
        '<p style="color:#555;font-size:0.75rem;">Si no solicitaste esto, ignorá este mensaje.</p>' +
        '<hr style="border:none;border-top:1px solid #1f1f1f;margin:20px 0;">' +
        '<p style="color:#333;font-size:0.65rem;">— Equipo Huella Runner MDQ</p>' +
        '</div>',
      name: 'Huella Runner MDQ'
    });
    Logger.log('recoverPassword: email enviado a ' + emailClean);
    return { success: true };
  } catch(e) {
    Logger.log('recoverPassword ERROR al enviar email: ' + e.toString());
    return { success: false, error: 'No se pudo enviar el correo. Verificá los permisos del script. (' + e.message + ')' };
  }
}

// ============================================================
// ESTABLECER CONTRASEÑA DEFINITIVA
// Se llama después de un login exitoso con contraseña temporal
// (requiereCambioPassword === true en la respuesta de loginUser).
// ============================================================
function establecerNuevaPassword(email, nuevaPassword) {
  try {
    if (!email) return { success: false, error: 'Email requerido.' };
    if (!nuevaPassword || nuevaPassword.toString().length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }
    const emailClean = email.toString().trim().toLowerCase();
    const { sheet, headers } = getSheetAndHeaders('Usuarios', USERS_HEADERS);
    const data = sheet.getDataRange().getValues();
    const emailCol = headers.indexOf('Email');
    const passCol  = headers.indexOf('Password');
    if (emailCol === -1 || passCol === -1) {
      return { success: false, error: 'Estructura de Usuarios incorrecta.' };
    }
    for (let i = 1; i < data.length; i++) {
      const rowEmail = data[i][emailCol] ? data[i][emailCol].toString().trim().toLowerCase() : '';
      if (rowEmail !== emailClean) continue;
      const salt = Utilities.getUuid();
      const hash = _hashPassword(nuevaPassword.toString(), salt);
      sheet.getRange(i + 1, passCol + 1).setValue(salt + '$' + hash);
      const reqCambioCol = _colEnsure(sheet, headers, 'Requiere_Cambio_Password');
      sheet.getRange(i + 1, reqCambioCol + 1).setValue(false);
      SpreadsheetApp.flush();
      return { success: true };
    }
    return { success: false, error: 'Usuario no encontrado.' };
  } catch(e) {
    Logger.log('establecerNuevaPassword ERROR: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

// ============================================================
// MI PERFIL — datos opcionales (fecha de nacimiento, provincia, ciudad,
// celular, grupo de running) que se pueden dejar vacíos al registrarse
// y completar después desde la pantalla "Mi Perfil" (Index.html).
// ============================================================
function getPerfilUsuario(email) {
  try {
    if (!email) return { success: false, error: 'Email requerido.' };
    const emailClean = email.toString().trim().toLowerCase();
    const { sheet, headers } = getSheetAndHeaders('Usuarios', USERS_HEADERS);
    const data = sheet.getDataRange().getValues();
    const emailCol      = headers.indexOf('Email');
    const fechaNacCol   = headers.indexOf('FechaNacimiento');
    const provinciaCol  = headers.indexOf('Provincia');
    const ciudadCol     = headers.indexOf('Ciudad');
    const celularCol    = headers.indexOf('Celular');
    const grupoCol      = headers.indexOf('Grupo');
    if (emailCol === -1) return { success: false, error: 'Estructura de Usuarios incorrecta.' };

    for (let i = 1; i < data.length; i++) {
      const rowEmail = data[i][emailCol] ? data[i][emailCol].toString().trim().toLowerCase() : '';
      if (rowEmail !== emailClean) continue;
      return {
        success:         true,
        fechaNacimiento: fechaNacCol  !== -1 ? (data[i][fechaNacCol]  || '').toString() : '',
        provincia:       provinciaCol !== -1 ? (data[i][provinciaCol] || '').toString() : '',
        ciudad:          ciudadCol    !== -1 ? (data[i][ciudadCol]    || '').toString() : '',
        celular:         celularCol   !== -1 ? (data[i][celularCol]   || '').toString() : '',
        grupo:           grupoCol     !== -1 ? (data[i][grupoCol]     || '').toString() : ''
      };
    }
    return { success: false, error: 'Usuario no encontrado.' };
  } catch(e) {
    Logger.log('getPerfilUsuario ERROR: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

function actualizarPerfilUsuario(email, datos) {
  try {
    if (!email || !datos) return { success: false, error: 'Datos incompletos.' };
    const emailClean = email.toString().trim().toLowerCase();
    const { sheet, headers } = getSheetAndHeaders('Usuarios', USERS_HEADERS);
    const data = sheet.getDataRange().getValues();
    const emailCol = headers.indexOf('Email');
    if (emailCol === -1) return { success: false, error: 'Estructura de Usuarios incorrecta.' };

    for (let i = 1; i < data.length; i++) {
      const rowEmail = data[i][emailCol] ? data[i][emailCol].toString().trim().toLowerCase() : '';
      if (rowEmail !== emailClean) continue;

      const campos = {
        'FechaNacimiento': datos.fechaNacimiento,
        'Provincia':       datos.provincia,
        'Ciudad':          datos.ciudad,
        'Celular':         datos.celular,
        'Grupo':           datos.grupo
      };
      for (const nombreCampo in campos) {
        const col = _colEnsure(sheet, headers, nombreCampo);
        sheet.getRange(i + 1, col + 1).setValue(campos[nombreCampo] || '');
      }
      SpreadsheetApp.flush();
      return { success: true };
    }
    return { success: false, error: 'Usuario no encontrado.' };
  } catch(e) {
    Logger.log('actualizarPerfilUsuario ERROR: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

// ============================================================
// EMAIL: BIENVENIDA AL NUEVO USUARIO
// ============================================================
function enviarEmailBienvenida(emailUsuario, nombreUsuario) {
  try {
    if (!emailUsuario || emailUsuario.toString().trim() === '') return;
    var nombre = nombreUsuario ? nombreUsuario.toString().trim() : 'Runner';

    MailApp.sendEmail({
      to:      emailUsuario.toString().trim(),
      subject: '¡Bienvenido/a a Huella Runner, ' + nombre + '! 🏃',
      body:    '',
      htmlBody:
        '<div style="font-family:Arial,sans-serif;background:#080808;padding:32px;border-radius:16px;max-width:480px;margin:auto;">' +
        '<h1 style="color:#E8E8E8;font-size:1.5rem;margin-bottom:4px;font-style:italic;">HUELLA <span style="color:#C5B358;">RUNNER</span></h1>' +
        '<p style="color:#888;font-size:0.65rem;letter-spacing:3px;text-transform:uppercase;margin-top:0;">Powered by Huella Runner MDQ</p>' +
        '<hr style="border:none;border-top:1px solid #1f1f1f;margin:20px 0;">' +
        '<p style="color:#E8E8E8;font-size:1rem;">¡Hola, <strong>' + nombre + '</strong>! 🎉</p>' +
        '<p style="color:#888888;font-size:0.85rem;line-height:1.6;">Ya sos parte de la familia <strong style="color:#C5B358;">Huella Runner</strong>. Nos alegra tenerte con nosotros.</p>' +
        '<div style="background:#111111;border:1px solid #1f1f1f;border-radius:12px;padding:16px 20px;margin:20px 0;">' +
        '<p style="color:#888;font-size:0.65rem;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Desde hoy disfrutás de</p>' +
        '<p style="color:#E8E8E8;font-size:0.85rem;margin:6px 0;">👟 &nbsp;Catálogo exclusivo de calzado running</p>' +
        '<p style="color:#E8E8E8;font-size:0.85rem;margin:6px 0;">✅ &nbsp;Novedades y lanzamientos antes que nadie</p>' +
        '<p style="color:#E8E8E8;font-size:0.85rem;margin:6px 0;">✅ &nbsp;Ofertas y beneficios exclusivos para la comunidad Huella Runner</p>' +
        '<p style="color:#E8E8E8;font-size:0.85rem;margin:6px 0;">✅ &nbsp;Seguí el desgaste real de tus zapatillas, kilómetro a kilómetro</p>' +
        '</div>' +
        '<p style="color:#888888;font-size:0.85rem;line-height:1.6;">Estamos acá para acompañarte en cada kilómetro. 🏃</p>' +
        '<hr style="border:none;border-top:1px solid #1f1f1f;margin:20px 0;">' +
        '<p style="color:#333;font-size:0.65rem;">— Equipo Huella Runner MDQ</p>' +
        '</div>',
      name: 'Huella Runner MDQ'
    });
    Logger.log('enviarEmailBienvenida: email enviado a ' + emailUsuario);
  } catch(e) {
    Logger.log('enviarEmailBienvenida ERROR: ' + e.toString());
  }
}

// --- ZAPATILLAS ---
const SHOES_HEADERS = ['ID_Zapa', 'Email_Usuario', 'Marca', 'Modelo', 'Talle', 'Genero', 'KM_Actuales', 'Alias', 'Estado'];

// ------------------------------------------------------------
// _filaZapaAObjeto: arma el objeto de una zapatilla a partir de su fila,
// convirtiendo cualquier celda de fecha (Date nativo de Sheets) a texto
// "dd/MM/yyyy".
//
// POR QUÉ: google.script.run tiene que "empaquetar" lo que devuelve el
// servidor para mandarlo a la pantalla. Cuando en el objeto viaja un
// Date nativo, ese empaquetado falla y al frontend le llega null (no
// una lista vacía, null) — sin error, sin aviso. Eso era el bug del
// Locker: getArchivedShoes() funcionaba perfecto del lado del servidor
// (el diagnóstico devolvía las 2 zapatillas), pero la pantalla recibía
// null y mostraba siempre "El Locker está vacío".
//
// Solo pasaba en el Locker porque Fecha_Archivado es la única columna
// con fecha, y solo la tienen las zapatillas archivadas. Igual se usa
// también en getUserShoes(): una zapatilla reactivada se queda con su
// Fecha_Archivado vieja, así que el mismo problema podía aparecer en el
// carrusel de activas.
// ------------------------------------------------------------
function _filaZapaAObjeto(headers, fila) {
  const obj = {};
  headers.forEach(function(header, index) {
    const valor = fila[index];
    if (Object.prototype.toString.call(valor) === '[object Date]') {
      obj[header] = isNaN(valor.getTime())
        ? ''
        : Utilities.formatDate(valor, TZ_AR, 'dd/MM/yyyy');
    } else {
      obj[header] = valor;
    }
  });
  return obj;
}

function addShoe(email, formData) {
  if (!email || !formData) return { success: false, error: 'Datos incompletos.' };
  const emailClean = email.toString().trim().toLowerCase();
  const kmInicial = Number(formData.km) || 0;
  // Límite de km opcional por zapatilla: si el usuario no eligió uno
  // propio, se usa el umbral global (TP.KM_UMBRAL_CUPON, definido en
  // trail-points.gs) como valor por defecto.
  const kmLimite = (formData.kmLimite && Number(formData.kmLimite) > 0)
    ? Number(formData.kmLimite)
    : TP.KM_UMBRAL_CUPON;
  appendDataByHeader('Zapatillas', SHOES_HEADERS, {
    'ID_Zapa':       Utilities.getUuid(),
    'Email_Usuario': emailClean,
    'Marca':         formData.marca,
    'Modelo':        formData.modelo,
    'Talle':         formData.talle,
    'Genero':        formData.genero,
    'KM_Actuales':   kmInicial,
    'Alias':         formData.alias || '',
    'Estado':        _calcularEstadoDesgaste(kmInicial, kmLimite),
    'KM_Limite':     kmLimite
  });

  // Dato de comunidad: se lo devolvemos al frontend para mostrar en el
  // momento (ventanita), en vez de mandarlo al buzón de notificaciones.
  // El frontend decide si corresponde mostrarla (solo si esNuevo es false).
  let socialProof = null;
  try {
    socialProof = obtenerDataSocialProof(formData.marca, formData.modelo);
  } catch(_) {}

  return { success: true, socialProof: socialProof };
}

function getUserShoes(email) {
  try {
    if (!email) { Logger.log('getUserShoes: email vacio'); return []; }
    const emailClean = email.toString().trim().toLowerCase();
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('Zapatillas');
    if (!sheet) return [];
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailCol  = headers.indexOf('Email_Usuario');
    const estadoCol = headers.indexOf('Estado');
    if (emailCol === -1) return [];
    let userShoes = [];
    for (let i = 1; i < data.length; i++) {
      const cellEmail  = data[i][emailCol] ? data[i][emailCol].toString().trim().toLowerCase() : '';
      const cellEstado = estadoCol !== -1 ? data[i][estadoCol].toString().trim().toLowerCase() : '';
      if (cellEmail === emailClean && cellEstado !== 'archivada') {
        userShoes.push(_filaZapaAObjeto(headers, data[i]));
      }
    }
    Logger.log('getUserShoes OK: ' + userShoes.length + ' zapas activas para ' + emailClean);
    return userShoes;
  } catch(e) {
    Logger.log('getUserShoes ERROR: ' + e.toString());
    return [];
  }
}

// ============================================================
// ELIMINAR ZAPATILLA
// ============================================================
function deleteShoe(email, idZapatilla) {
  try {
    if (!email || !idZapatilla) return { success: false, error: 'Datos incompletos.' };
    const emailClean = email.toString().trim().toLowerCase();
    const ss = SpreadsheetApp.openById(SHEET_ID);

    const idBuscado = idZapatilla.toString().trim();

    const trainSheet = ss.getSheetByName('Entrenamientos');
    if (trainSheet && trainSheet.getLastRow() > 1) {
      const trainData = trainSheet.getDataRange().getValues();
      const trainHeaders = trainData[0];
      const tIdZapaCol = trainHeaders.indexOf('ID_Zapa');
      const tEmailCol  = trainHeaders.indexOf('Email_Usuario');
      if (tIdZapaCol !== -1 && tEmailCol !== -1) {
        for (let i = trainData.length - 1; i >= 1; i--) {
          const rowZapaId = trainData[i][tIdZapaCol] ? trainData[i][tIdZapaCol].toString().trim() : '';
          const rowEmail  = trainData[i][tEmailCol]  ? trainData[i][tEmailCol].toString().trim().toLowerCase() : '';
          if (rowZapaId === idBuscado && rowEmail === emailClean) {
            trainSheet.deleteRow(i + 1);
          }
        }
        SpreadsheetApp.flush();
      }
    }

    const shoeSheet = ss.getSheetByName('Zapatillas');
    if (shoeSheet && shoeSheet.getLastRow() > 1) {
      const shoeData = shoeSheet.getDataRange().getValues();
      const shoeHeaders = shoeData[0];
      const idCol    = shoeHeaders.indexOf('ID_Zapa');
      const emailCol = shoeHeaders.indexOf('Email_Usuario');
      if (idCol !== -1 && emailCol !== -1) {
        for (let i = shoeData.length - 1; i >= 1; i--) {
          const rowId    = shoeData[i][idCol]    ? shoeData[i][idCol].toString().trim() : '';
          const rowEmail = shoeData[i][emailCol] ? shoeData[i][emailCol].toString().trim().toLowerCase() : '';
          if (rowId === idBuscado && rowEmail === emailClean) {
            shoeSheet.deleteRow(i + 1);
            break;
          }
        }
        SpreadsheetApp.flush();
      }
    }

    return { success: true };
  } catch(e) {
    Logger.log('deleteShoe ERROR: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

// ============================================================
// ARCHIVAR ZAPATILLA (Locker)
// ============================================================
function archiveShoe(email, idZapatilla) {
  try {
    if (!email || !idZapatilla) return { success: false, error: 'Datos incompletos.' };
    const emailClean = email.toString().trim().toLowerCase();
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('Zapatillas');
    if (!sheet) return { success: false, error: 'Hoja Zapatillas no encontrada.' };

    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const idCol       = headers.indexOf('ID_Zapa');
    const emailCol    = headers.indexOf('Email_Usuario');
    const estadoCol   = headers.indexOf('Estado');

    if (idCol === -1 || emailCol === -1 || estadoCol === -1) {
      return { success: false, error: 'Estructura de Zapatillas incorrecta. Verificá que exista la columna Estado.' };
    }

    for (let i = 1; i < data.length; i++) {
      const rowId    = data[i][idCol]    ? data[i][idCol].toString()                        : '';
      const rowEmail = data[i][emailCol] ? data[i][emailCol].toString().trim().toLowerCase() : '';
      if (rowId === idZapatilla.toString() && rowEmail === emailClean) {
        sheet.getRange(i + 1, estadoCol + 1).setValue('archivada');
        const fechaArchivadoCol = _colEnsure(sheet, headers, 'Fecha_Archivado');
        sheet.getRange(i + 1, fechaArchivadoCol + 1).setValue(Utilities.formatDate(new Date(), TZ_AR, 'dd/MM/yyyy'));
        SpreadsheetApp.flush();
        Logger.log('archiveShoe OK: id=' + idZapatilla);
        return { success: true };
      }
    }
    return { success: false, error: 'Zapatilla no encontrada.' };
  } catch(e) {
    Logger.log('archiveShoe ERROR: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

// ============================================================
// DIAGNÓSTICO TEMPORAL — bug del Locker (no muestra zapas archivadas)
// Correr a mano desde el editor (elegir "_diagLocker" arriba y
// Ejecutar), después mirar "Registro de ejecución". Se puede borrar
// esta función una vez resuelto el bug — no la usa ninguna pantalla.
// ============================================================
function _diagLocker() {
  var email = 'edragotto@hotmail.com'; // cambiar acá si querés probar otro usuario
  Logger.log('=== DIAGNÓSTICO LOCKER: ' + email + ' ===');

  var resultado = getArchivedShoes(email);
  Logger.log('getArchivedShoes() devolvió ' + resultado.length + ' resultado(s).');
  resultado.forEach(function(s, i) {
    Logger.log((i + 1) + ') ' + s.Marca + ' ' + s.Modelo + ' — Estado="' + s.Estado + '" Email_Usuario="' + s.Email_Usuario + '"');
  });

  Logger.log('--- Recuento manual, fila por fila, para comparar ---');
  var ss     = SpreadsheetApp.openById(SHEET_ID);
  var sheet  = ss.getSheetByName('Zapatillas');
  var data   = sheet.getDataRange().getValues();
  var headers = data[0];
  var emailCol  = headers.indexOf('Email_Usuario');
  var estadoCol = headers.indexOf('Estado');
  Logger.log('Columna Email_Usuario en índice ' + emailCol + ' | Columna Estado en índice ' + estadoCol);

  var emailClean = email.toString().trim().toLowerCase();
  var contador = 0;
  for (var i = 1; i < data.length; i++) {
    var rawEmail  = data[i][emailCol];
    var rawEstado = data[i][estadoCol];
    var rowEmail  = rawEmail  ? rawEmail.toString().trim().toLowerCase()  : '';
    var rowEstado = rawEstado ? rawEstado.toString().trim().toLowerCase() : '';
    if (rowEmail === emailClean && rowEstado === 'archivada') {
      contador++;
      Logger.log('Fila ' + (i + 1) + ' matchea → email="' + rowEmail + '" estado="' + rowEstado + '" (tipo email: ' + typeof rawEmail + ', tipo estado: ' + typeof rawEstado + ')');
    }
  }
  Logger.log('Total contado a mano: ' + contador);
}

// ============================================================
// OBTENER ZAPAS ARCHIVADAS (Locker)
// ============================================================
function getArchivedShoes(email) {
  try {
    if (!email) return [];
    const emailClean = email.toString().trim().toLowerCase();
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('Zapatillas');
    if (!sheet || sheet.getLastRow() <= 1) return [];

    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailCol  = headers.indexOf('Email_Usuario');
    const estadoCol = headers.indexOf('Estado');
    if (emailCol === -1) return [];

    let archived = [];
    for (let i = 1; i < data.length; i++) {
      const rowEmail  = data[i][emailCol]  ? data[i][emailCol].toString().trim().toLowerCase() : '';
      const rowEstado = estadoCol !== -1   ? data[i][estadoCol].toString().trim().toLowerCase() : '';
      if (rowEmail === emailClean && rowEstado === 'archivada') {
        archived.push(_filaZapaAObjeto(headers, data[i]));
      }
    }
    Logger.log('getArchivedShoes OK: ' + archived.length + ' zapas archivadas para ' + emailClean);
    return archived;
  } catch(e) {
    Logger.log('getArchivedShoes ERROR: ' + e.toString());
    return [];
  }
}

// ============================================================
// REACTIVAR ZAPATILLA (sacar del Locker)
// ============================================================
function reactivateShoe(email, idZapatilla) {
  try {
    if (!email || !idZapatilla) return { success: false, error: 'Datos incompletos.' };
    const emailClean = email.toString().trim().toLowerCase();
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('Zapatillas');
    if (!sheet) return { success: false, error: 'Hoja Zapatillas no encontrada.' };

    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const idCol     = headers.indexOf('ID_Zapa');
    const emailCol  = headers.indexOf('Email_Usuario');
    const estadoCol = headers.indexOf('Estado');
    const kmCol     = headers.indexOf('KM_Actuales');
    const limiteCol = headers.indexOf('KM_Limite');

    if (idCol === -1 || emailCol === -1 || estadoCol === -1) {
      return { success: false, error: 'Estructura de Zapatillas incorrecta.' };
    }

    for (let i = 1; i < data.length; i++) {
      const rowId    = data[i][idCol]    ? data[i][idCol].toString()                        : '';
      const rowEmail = data[i][emailCol] ? data[i][emailCol].toString().trim().toLowerCase() : '';
      if (rowId === idZapatilla.toString() && rowEmail === emailClean) {
        // Restaura el estado de desgaste según los km, no un texto fijo.
        const km      = kmCol !== -1 ? (Number(data[i][kmCol]) || 0) : 0;
        const limite  = limiteCol !== -1 ? (Number(data[i][limiteCol]) || TP.KM_UMBRAL_CUPON) : TP.KM_UMBRAL_CUPON;
        sheet.getRange(i + 1, estadoCol + 1).setValue(_calcularEstadoDesgaste(km, limite));
        SpreadsheetApp.flush();
        Logger.log('reactivateShoe OK: id=' + idZapatilla);
        return { success: true };
      }
    }
    return { success: false, error: 'Zapatilla no encontrada.' };
  } catch(e) {
    Logger.log('reactivateShoe ERROR: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

// ============================================================
// HISTORIAL DE ZAPATILLA
// ============================================================
function getShoeHistory(email, idZapatilla) {
  try {
    if (!email || !idZapatilla) return [];
    const emailClean = email.toString().trim().toLowerCase();
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('Entrenamientos');
    if (!sheet || sheet.getLastRow() <= 1) return [];

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailCol     = headers.indexOf('Email_Usuario');
    const idZapaCol    = headers.indexOf('ID_Zapa');
    const kmCol        = headers.indexOf('KM_Sumados');
    const fechaCol     = headers.indexOf('Fecha');
    const horaCol      = headers.indexOf('Hora');
    const idEntrenoCol = headers.indexOf('ID_Entreno');

    if (emailCol === -1 || idZapaCol === -1 || kmCol === -1 || fechaCol === -1) {
      Logger.log('getShoeHistory: faltan columnas');
      return [];
    }

    const tz = 'America/Argentina/Buenos_Aires';

    // La Fecha se guarda sin hora; la Hora va en su propia columna.
    // Combina ambas y evita mostrar el 00:00 de una fecha sin hora.
    function normalizarFecha(val, horaVal) {
      if (!val) return '—';

      var fechaTxt, horaDeFecha = '';
      if (val instanceof Date) {
        fechaTxt    = Utilities.formatDate(val, tz, 'dd/MM/yyyy');
        horaDeFecha = Utilities.formatDate(val, tz, 'HH:mm');
      } else {
        fechaTxt = val.toString().trim();
      }

      var horaTxt = '';
      if (horaVal instanceof Date) {
        horaTxt = Utilities.formatDate(horaVal, tz, 'HH:mm');
      } else if (horaVal) {
        horaTxt = horaVal.toString().trim();
      }
      if (!horaTxt && horaDeFecha && horaDeFecha !== '00:00') {
        horaTxt = horaDeFecha;
      }

      return horaTxt ? fechaTxt + ' ' + horaTxt : fechaTxt;
    }

    let history = [];
    for (let i = 1; i < data.length; i++) {
      const rowEmail = data[i][emailCol] ? data[i][emailCol].toString().trim().toLowerCase() : '';
      const rowId    = data[i][idZapaCol] ? data[i][idZapaCol].toString() : '';
      if (rowEmail === emailClean && rowId === idZapatilla.toString()) {
        const idEntreno = (idEntrenoCol !== -1 && data[i][idEntrenoCol])
          ? data[i][idEntrenoCol].toString()
          : '';
        history.push({
          ID_Entreno: idEntreno,
          Fecha:      normalizarFecha(data[i][fechaCol], horaCol !== -1 ? data[i][horaCol] : ''),
          KM_Sumados: Number(data[i][kmCol]) || 0
        });
      }
    }
    history.reverse();
    return history;
  } catch(e) {
    Logger.log('getShoeHistory ERROR: ' + e.toString());
    return [];
  }
}

// --- ENTRENAMIENTOS ---
const TRAIN_HEADERS = ['ID_Entreno', 'Email_Usuario', 'ID_Zapa', 'Fecha', 'Hora', 'KM_Brutos', 'KM_Sumados', 'Tipo_Carga', 'Estado_Validacion', 'Motivo_Rechazo'];

function logTraining(email, idZapatilla, kmNuevos) {
  if (!email) return { success: false, error: 'Email requerido.' };

  // Delega a Trail Points: incluye validación anti-fraude, ponderación y cupones.
  const resultado = registrarActividadTrailPoints(
    email, idZapatilla, kmNuevos, 'Manual', null, null
  );

  // La respuesta de trail-points usa kmAcreditados; el frontend solo necesita success/error.
  if (!resultado.success) return resultado;
  return { success: true, cupon: resultado.cupon || null };
}

// ============================================================
// ELIMINAR ENTRENAMIENTO INDIVIDUAL
// ============================================================
function deleteTraining(email, idEntreno, idZapatilla, kmADescontar) {
  try {
    if (!email || !idEntreno || !idZapatilla) {
      return { success: false, error: 'Datos incompletos.' };
    }
    const emailClean = email.toString().trim().toLowerCase();
    const ss = SpreadsheetApp.openById(SHEET_ID);

    const trainSheet = ss.getSheetByName('Entrenamientos');
    if (!trainSheet || trainSheet.getLastRow() <= 1) {
      return { success: false, error: 'No se encontró la hoja de Entrenamientos.' };
    }

    const trainData    = trainSheet.getDataRange().getValues();
    const trainHeaders = trainData[0];
    const idEntrenoCol = trainHeaders.indexOf('ID_Entreno');
    const tEmailCol    = trainHeaders.indexOf('Email_Usuario');

    if (idEntrenoCol === -1 || tEmailCol === -1) {
      return { success: false, error: 'Estructura de Entrenamientos incorrecta.' };
    }

    let filaBorrada = false;
    for (let i = trainData.length - 1; i >= 1; i--) {
      const rowIdEntreno = trainData[i][idEntrenoCol] ? trainData[i][idEntrenoCol].toString() : '';
      const rowEmail     = trainData[i][tEmailCol]    ? trainData[i][tEmailCol].toString().trim().toLowerCase() : '';
      if (rowIdEntreno === idEntreno.toString() && rowEmail === emailClean) {
        trainSheet.deleteRow(i + 1);
        filaBorrada = true;
        break;
      }
    }
    SpreadsheetApp.flush();

    if (!filaBorrada) {
      return { success: false, error: 'No se encontró el entrenamiento.' };
    }

    const shoeSheet = ss.getSheetByName('Zapatillas');
    if (shoeSheet && shoeSheet.getLastRow() > 1) {
      const shoeData    = shoeSheet.getDataRange().getValues();
      const shoeHeaders = shoeData[0];
      const idCol       = shoeHeaders.indexOf('ID_Zapa');
      const kmCol       = shoeHeaders.indexOf('KM_Actuales');
      const sEmailCol   = shoeHeaders.indexOf('Email_Usuario');
      const sEstadoCol  = shoeHeaders.indexOf('Estado');
      const limiteCol   = shoeHeaders.indexOf('KM_Limite');

      for (let i = 1; i < shoeData.length; i++) {
        const rowZapaId = shoeData[i][idCol]     ? shoeData[i][idCol].toString() : '';
        const rowEmail  = shoeData[i][sEmailCol] ? shoeData[i][sEmailCol].toString().trim().toLowerCase() : '';
        if (rowZapaId === idZapatilla.toString() && rowEmail === emailClean) {
          const kmActual = Number(shoeData[i][kmCol]) || 0;
          const kmRestar = Number(kmADescontar) || 0;
          const kmNuevo  = Math.max(kmActual - kmRestar, 0);
          const limite   = limiteCol !== -1 ? (Number(shoeData[i][limiteCol]) || TP.KM_UMBRAL_CUPON) : TP.KM_UMBRAL_CUPON;
          shoeSheet.getRange(i + 1, kmCol + 1).setValue(kmNuevo);
          const estadoActual = sEstadoCol !== -1 ? shoeData[i][sEstadoCol].toString().trim().toLowerCase() : '';
          if (sEstadoCol !== -1 && estadoActual !== 'archivada') {
            shoeSheet.getRange(i + 1, sEstadoCol + 1).setValue(_calcularEstadoDesgaste(kmNuevo, limite));
          }
          SpreadsheetApp.flush();
          Logger.log('deleteTraining: KM actualizados. Antes=' + kmActual + ' Restado=' + kmRestar + ' Ahora=' + kmNuevo);
          break;
        }
      }
    }

    Logger.log('deleteTraining OK: idEntreno=' + idEntreno);
    return { success: true };

  } catch(e) {
    Logger.log('deleteTraining ERROR: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

// ============================================================
// EDITAR ENTRENAMIENTO INDIVIDUAL
// Corrige el km de un registro ya cargado (típico: error de tipeo) sin
// perder la fecha original ni tener que borrar y volver a cargar.
// Ajusta el km de la zapatilla por la diferencia (delta), no lo reemplaza
// entero, para no pisar otros entrenamientos ya sumados.
// ============================================================
function editarEntrenamiento(email, idEntreno, idZapatilla, kmNuevo) {
  try {
    if (!email || !idEntreno || !idZapatilla) {
      return { success: false, error: 'Datos incompletos.' };
    }
    const kmNuevoNum = Number(kmNuevo);
    if (!kmNuevoNum || kmNuevoNum <= 0) {
      return { success: false, error: 'Ingresá un kilometraje válido.' };
    }
    const emailClean = email.toString().trim().toLowerCase();
    const ss = SpreadsheetApp.openById(SHEET_ID);

    const trainSheet = ss.getSheetByName('Entrenamientos');
    if (!trainSheet || trainSheet.getLastRow() <= 1) {
      return { success: false, error: 'No se encontró la hoja de Entrenamientos.' };
    }

    const trainData    = trainSheet.getDataRange().getValues();
    const trainHeaders = trainData[0];
    const idEntrenoCol = trainHeaders.indexOf('ID_Entreno');
    const tEmailCol    = trainHeaders.indexOf('Email_Usuario');
    const kmBrutosCol  = trainHeaders.indexOf('KM_Brutos');
    const kmSumadosCol = trainHeaders.indexOf('KM_Sumados');

    if (idEntrenoCol === -1 || tEmailCol === -1 || kmSumadosCol === -1) {
      return { success: false, error: 'Estructura de Entrenamientos incorrecta.' };
    }

    let kmViejo = null;
    let filaEditada = -1;
    for (let i = 1; i < trainData.length; i++) {
      const rowIdEntreno = trainData[i][idEntrenoCol] ? trainData[i][idEntrenoCol].toString() : '';
      const rowEmail     = trainData[i][tEmailCol]    ? trainData[i][tEmailCol].toString().trim().toLowerCase() : '';
      if (rowIdEntreno === idEntreno.toString() && rowEmail === emailClean) {
        kmViejo = Number(trainData[i][kmSumadosCol]) || 0;
        filaEditada = i;
        break;
      }
    }

    if (filaEditada === -1) {
      return { success: false, error: 'No se encontró el entrenamiento.' };
    }

    trainSheet.getRange(filaEditada + 1, kmSumadosCol + 1).setValue(kmNuevoNum);
    if (kmBrutosCol !== -1) {
      trainSheet.getRange(filaEditada + 1, kmBrutosCol + 1).setValue(kmNuevoNum);
    }
    SpreadsheetApp.flush();

    const delta = kmNuevoNum - kmViejo;

    const shoeSheet = ss.getSheetByName('Zapatillas');
    if (shoeSheet && shoeSheet.getLastRow() > 1) {
      const shoeData    = shoeSheet.getDataRange().getValues();
      const shoeHeaders = shoeData[0];
      const idCol       = shoeHeaders.indexOf('ID_Zapa');
      const kmCol       = shoeHeaders.indexOf('KM_Actuales');
      const sEmailCol   = shoeHeaders.indexOf('Email_Usuario');
      const sEstadoCol  = shoeHeaders.indexOf('Estado');
      const limiteCol   = shoeHeaders.indexOf('KM_Limite');

      for (let i = 1; i < shoeData.length; i++) {
        const rowZapaId = shoeData[i][idCol]     ? shoeData[i][idCol].toString() : '';
        const rowEmail  = shoeData[i][sEmailCol] ? shoeData[i][sEmailCol].toString().trim().toLowerCase() : '';
        if (rowZapaId === idZapatilla.toString() && rowEmail === emailClean) {
          const kmActual   = Number(shoeData[i][kmCol]) || 0;
          const kmAjustado = Math.max(kmActual + delta, 0);
          const limite     = limiteCol !== -1 ? (Number(shoeData[i][limiteCol]) || TP.KM_UMBRAL_CUPON) : TP.KM_UMBRAL_CUPON;
          shoeSheet.getRange(i + 1, kmCol + 1).setValue(kmAjustado);
          const estadoActual = sEstadoCol !== -1 ? shoeData[i][sEstadoCol].toString().trim().toLowerCase() : '';
          if (sEstadoCol !== -1 && estadoActual !== 'archivada') {
            shoeSheet.getRange(i + 1, sEstadoCol + 1).setValue(_calcularEstadoDesgaste(kmAjustado, limite));
          }
          SpreadsheetApp.flush();
          break;
        }
      }
    }

    Logger.log('editarEntrenamiento OK: idEntreno=' + idEntreno + ' kmViejo=' + kmViejo + ' kmNuevo=' + kmNuevoNum);
    return { success: true };

  } catch(e) {
    Logger.log('editarEntrenamiento ERROR: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

// ============================================================
// MÓDULO NOTIFICACIONES
// ============================================================

const NOTIF_HEADERS = ['ID_Notif', 'Email_Usuario', 'Mensaje', 'Fecha', 'Leido', 'Tipo', 'Codigo_Voucher', 'Oculto'];

function getGruposRunning() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('Usuarios');
    if (!sheet || sheet.getLastRow() <= 1) return [];
    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const grupoCol = headers.indexOf('Grupo');
    if (grupoCol === -1) return [];
    const grupos = new Set();
    for (let i = 1; i < data.length; i++) {
      const g = data[i][grupoCol] ? data[i][grupoCol].toString().trim() : '';
      if (g) grupos.add(g);
    }
    return Array.from(grupos).sort();
  } catch(e) {
    Logger.log('getGruposRunning ERROR: ' + e.toString());
    return [];
  }
}

function enviarNotificacion(destinatarioTipo, destinatarioValor, mensaje, tipo, codigoVoucherManual, token) {
  try {
    // Los envíos masivos (a todos, a un grupo entero, o a una lista/segmento
    // ya armado desde el panel) son la parte riesgosa — requieren el token
    // de admin. Los individuales quedan libres porque el propio sistema los
    // usa (cupones, social proof).
    if ((destinatarioTipo === 'todos' || destinatarioTipo === 'grupo' || destinatarioTipo === 'lista') && !_adminAutorizado(token)) {
      return { success: false, error: 'No autorizado.' };
    }
    if (!mensaje || mensaje.toString().trim() === '') {
      return { success: false, error: 'El mensaje no puede estar vacío.' };
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const usersSheet = ss.getSheetByName('Usuarios');
    if (!usersSheet || usersSheet.getLastRow() <= 1) {
      return { success: false, error: 'No hay usuarios registrados.' };
    }

    const usersData    = usersSheet.getDataRange().getValues();
    const usersHeaders = usersData[0];
    const emailCol     = usersHeaders.indexOf('Email');
    const grupoCol     = usersHeaders.indexOf('Grupo');

    if (emailCol === -1) return { success: false, error: 'Columna Email no encontrada en Usuarios.' };

    let destinatarios = [];

    if (destinatarioTipo === 'todos') {
      for (let i = 1; i < usersData.length; i++) {
        const e = usersData[i][emailCol] ? usersData[i][emailCol].toString().trim().toLowerCase() : '';
        if (e) destinatarios.push(e);
      }
    } else if (destinatarioTipo === 'grupo') {
      if (!destinatarioValor || destinatarioValor.toString().trim() === '') {
        return { success: false, error: 'Seleccioná un grupo.' };
      }
      const grupoFiltro = destinatarioValor.toString().trim().toLowerCase();
      for (let i = 1; i < usersData.length; i++) {
        const e = usersData[i][emailCol] ? usersData[i][emailCol].toString().trim().toLowerCase() : '';
        const g = grupoCol !== -1 && usersData[i][grupoCol] ? usersData[i][grupoCol].toString().trim().toLowerCase() : '';
        if (e && g === grupoFiltro) destinatarios.push(e);
      }
      if (destinatarios.length === 0) {
        return { success: false, error: 'No se encontraron usuarios en ese grupo.' };
      }
    } else if (destinatarioTipo === 'individual') {
      const emailInd = destinatarioValor ? destinatarioValor.toString().trim().toLowerCase() : '';
      if (!emailInd) return { success: false, error: 'Ingresá el email del destinatario.' };
      let existe = false;
      for (let i = 1; i < usersData.length; i++) {
        const e = usersData[i][emailCol] ? usersData[i][emailCol].toString().trim().toLowerCase() : '';
        if (e === emailInd) { existe = true; break; }
      }
      if (!existe) return { success: false, error: 'No existe un usuario con ese email.' };
      destinatarios.push(emailInd);
    } else if (destinatarioTipo === 'lista') {
      // Segmento ya calculado del lado del panel (ej. zapas en alerta,
      // inactivos, cumpleaños de la semana) — acá solo se valida que cada
      // email exista de verdad como usuario antes de mandarle nada.
      if (!destinatarioValor || !Array.isArray(destinatarioValor) || destinatarioValor.length === 0) {
        return { success: false, error: 'La lista de destinatarios está vacía.' };
      }
      const emailsValidos = new Set();
      for (let i = 1; i < usersData.length; i++) {
        const e = usersData[i][emailCol] ? usersData[i][emailCol].toString().trim().toLowerCase() : '';
        if (e) emailsValidos.add(e);
      }
      const vistos = new Set();
      destinatarioValor.forEach(function(em) {
        const emClean = (em || '').toString().trim().toLowerCase();
        if (emClean && emailsValidos.has(emClean) && !vistos.has(emClean)) {
          vistos.add(emClean);
          destinatarios.push(emClean);
        }
      });
      if (destinatarios.length === 0) {
        return { success: false, error: 'Ninguno de los emails de la lista corresponde a un usuario registrado.' };
      }
    } else {
      return { success: false, error: 'Tipo de destinatario inválido.' };
    }

    const fecha = Utilities.formatDate(new Date(), TZ_AR, 'dd/MM/yyyy HH:mm');

    // Un solo guardado para todos los destinatarios, en vez de uno por
    // uno: appendDataByHeader() hacía un flush() por cada persona, y
    // con envíos grandes (ej. "todos" con decenas/cientos de usuarios)
    // eso se sentía — cada flush es una escritura completa al Sheet.
    // Acá se arman todas las filas en memoria y se escriben de una sola vez.
    const { sheet, headers } = getSheetAndHeaders('Notificaciones', NOTIF_HEADERS);
    const nIdCol     = headers.indexOf('ID_Notif');
    const nEmailCol  = headers.indexOf('Email_Usuario');
    const nMsgCol    = headers.indexOf('Mensaje');
    const nFechaCol  = headers.indexOf('Fecha');
    const nLeidoCol  = headers.indexOf('Leido');
    const nTipoCol   = headers.indexOf('Tipo');

    const filas = destinatarios.map(function(email) {
      const fila = new Array(headers.length).fill('');
      if (nIdCol    !== -1) fila[nIdCol]    = Utilities.getUuid();
      if (nEmailCol !== -1) fila[nEmailCol] = email;
      if (nMsgCol   !== -1) fila[nMsgCol]   = mensaje.toString().trim();
      if (nFechaCol !== -1) fila[nFechaCol] = fecha;
      if (nLeidoCol !== -1) fila[nLeidoCol] = 'FALSE';
      if (nTipoCol  !== -1) fila[nTipoCol]  = 'Mensaje';
      return fila;
    });

    sheet.getRange(sheet.getLastRow() + 1, 1, filas.length, headers.length).setValues(filas);
    SpreadsheetApp.flush();

    const insertados = filas.length;
    Logger.log('enviarNotificacion OK: ' + insertados + ' notif insertadas.');
    return { success: true, enviados: insertados };

  } catch(e) {
    Logger.log('enviarNotificacion ERROR: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

function getNotificacionesUsuario(email) {
  try {
    if (!email) return [];
    const emailClean = email.toString().trim().toLowerCase();
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('Notificaciones');
    if (!sheet || sheet.getLastRow() <= 1) return [];

    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailCol   = headers.indexOf('Email_Usuario');
    const idCol      = headers.indexOf('ID_Notif');
    const msgCol     = headers.indexOf('Mensaje');
    const fechaCol   = headers.indexOf('Fecha');
    const leidoCol   = headers.indexOf('Leido');
    const tipoCol    = headers.indexOf('Tipo');
    const voucherCol = headers.indexOf('Codigo_Voucher');
    const ocultoCol  = headers.indexOf('Oculto');

    if (emailCol === -1 || idCol === -1) {
      Logger.log('getNotificacionesUsuario: faltan columnas');
      return [];
    }

    let notifs = [];
    for (let i = 1; i < data.length; i++) {
      const rowEmail = data[i][emailCol] ? data[i][emailCol].toString().trim().toLowerCase() : '';
      const oculto   = ocultoCol !== -1 ? data[i][ocultoCol].toString().toUpperCase() : 'FALSE';
      if (rowEmail === emailClean && oculto !== 'TRUE') {
        notifs.push({
          ID_Notif:       idCol      !== -1 ? data[i][idCol].toString()      : '',
          Mensaje:        msgCol     !== -1 ? data[i][msgCol].toString()     : '',
          Fecha:          fechaCol   !== -1 ? data[i][fechaCol].toString()   : '',
          Leido:          leidoCol   !== -1 ? data[i][leidoCol].toString()   : 'FALSE',
          Tipo:           tipoCol    !== -1 ? data[i][tipoCol].toString()    : 'Mensaje',
          Codigo_Voucher: voucherCol !== -1 ? data[i][voucherCol].toString() : ''
        });
      }
    }

    notifs.reverse();
    return notifs;

  } catch(e) {
    Logger.log('getNotificacionesUsuario ERROR: ' + e.toString());
    return [];
  }
}

function marcarLeido(idNotif) {
  try {
    if (!idNotif) return { success: false, error: 'ID requerido.' };
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('Notificaciones');
    if (!sheet || sheet.getLastRow() <= 1) return { success: false, error: 'Hoja Notificaciones no encontrada.' };

    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const idCol    = headers.indexOf('ID_Notif');
    const leidoCol = headers.indexOf('Leido');

    if (idCol === -1 || leidoCol === -1) {
      return { success: false, error: 'Estructura de Notificaciones incorrecta.' };
    }

    for (let i = 1; i < data.length; i++) {
      const rowId = data[i][idCol] ? data[i][idCol].toString() : '';
      if (rowId === idNotif.toString()) {
        sheet.getRange(i + 1, leidoCol + 1).setValue('TRUE');
        SpreadsheetApp.flush();
        Logger.log('marcarLeido OK: id=' + idNotif);
        return { success: true };
      }
    }

    return { success: false, error: 'Notificación no encontrada.' };
  } catch(e) {
    Logger.log('marcarLeido ERROR: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

function contarNoLeidas(email) {
  try {
    if (!email) return 0;
    const emailClean = email.toString().trim().toLowerCase();
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('Notificaciones');
    if (!sheet || sheet.getLastRow() <= 1) return 0;

    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailCol  = headers.indexOf('Email_Usuario');
    const leidoCol  = headers.indexOf('Leido');
    const ocultoCol = headers.indexOf('Oculto');

    if (emailCol === -1 || leidoCol === -1) return 0;

    let count = 0;
    for (let i = 1; i < data.length; i++) {
      const rowEmail = data[i][emailCol] ? data[i][emailCol].toString().trim().toLowerCase() : '';
      const leido    = data[i][leidoCol] ? data[i][leidoCol].toString().toUpperCase() : 'FALSE';
      const oculto   = ocultoCol !== -1 && data[i][ocultoCol] ? data[i][ocultoCol].toString().toUpperCase() : 'FALSE';
      if (rowEmail === emailClean && leido !== 'TRUE' && oculto !== 'TRUE') count++;
    }
    return count;
  } catch(e) {
    Logger.log('contarNoLeidas ERROR: ' + e.toString());
    return 0;
  }
}

function deleteNotificacion(email, idNotif) {
  try {
    if (!email || !idNotif) return { success: false, error: 'Datos incompletos.' };
    const emailClean = email.toString().trim().toLowerCase();
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('Notificaciones');
    if (!sheet || sheet.getLastRow() <= 1) return { success: false, error: 'Hoja Notificaciones no encontrada.' };

    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const idCol    = headers.indexOf('ID_Notif');
    const emailCol = headers.indexOf('Email_Usuario');

    if (idCol === -1 || emailCol === -1) {
      return { success: false, error: 'Estructura de Notificaciones incorrecta.' };
    }

    for (let i = 1; i < data.length; i++) {
      const rowId    = data[i][idCol]    ? data[i][idCol].toString()                        : '';
      const rowEmail = data[i][emailCol] ? data[i][emailCol].toString().trim().toLowerCase() : '';
      if (rowId === idNotif.toString() && rowEmail === emailClean) {
        let ocultoCol = headers.indexOf('Oculto');
        if (ocultoCol === -1) {
          ocultoCol = headers.length;
          sheet.getRange(1, ocultoCol + 1).setValue('Oculto');
          headers.push('Oculto');
        }
        sheet.getRange(i + 1, ocultoCol + 1).setValue('TRUE');
        SpreadsheetApp.flush();
        Logger.log('deleteNotificacion OK: id=' + idNotif);
        return { success: true };
      }
    }

    return { success: false, error: 'Notificación no encontrada.' };
  } catch(e) {
    Logger.log('deleteNotificacion ERROR: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

// ============================================================
// ADMIN DASHBOARD — Métricas operativas
// CAMBIO v2906: agrega rankingCalzado al objeto de retorno
// ============================================================
function getAdminDashboardData(token) {
  if (!_adminAutorizado(token)) return { success: false, error: 'No autorizado.' };
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);

    // — Total usuarios —
    var usersSheet = ss.getSheetByName('Usuarios');
    var totalUsuarios = 0;
    if (usersSheet && usersSheet.getLastRow() > 1) {
      totalUsuarios = usersSheet.getLastRow() - 1;
    }

    // — Mapa usuario → nombre/grupo/provincia —
    var grupoMap = {};
    // — Ranking por provincia + grupo —
    var provinciaMap = {};
    var grupoRankMap  = {};
    if (usersSheet && usersSheet.getLastRow() > 1) {
      var uData0    = usersSheet.getDataRange().getValues();
      var uHeaders0 = uData0[0];
      var uEmailC0  = uHeaders0.indexOf('Email');
      var uNombreC0 = uHeaders0.indexOf('Nombre');
      var uGrupoC0  = uHeaders0.indexOf('Grupo');
      var uProvC0   = uHeaders0.indexOf('Provincia');
      for (var i = 1; i < uData0.length; i++) {
        var ue0 = uData0[i][uEmailC0] ? uData0[i][uEmailC0].toString().trim().toLowerCase() : '';
        var prov0 = uProvC0 !== -1 ? (uData0[i][uProvC0] || '').toString().trim() : '';
        var grp0  = uGrupoC0 !== -1 ? (uData0[i][uGrupoC0] || '').toString().trim() : '';
        if (ue0) grupoMap[ue0] = {
          nombre: uData0[i][uNombreC0] ? uData0[i][uNombreC0].toString() : ue0,
          grupo:  grp0,
          provincia: prov0
        };

        if (prov0) {
          if (!provinciaMap[prov0]) provinciaMap[prov0] = { provincia: prov0, runners: 0, kmTotal: 0 };
          provinciaMap[prov0].runners++;
        }
        if (grp0) {
          if (!grupoRankMap[grp0]) grupoRankMap[grp0] = { grupo: grp0, runners: 0, kmTotal: 0 };
          grupoRankMap[grp0].runners++;
        }
      }
    }

    // — Alertas desgaste crítico (usa el mismo umbral que el estado 'Crítico') —
    var zapSheet = ss.getSheetByName('Zapatillas');
    var alertasDesgaste = [];

    // — RANKING CALZADO: conteo de combinaciones Marca+Modelo activas —
    var rankingCalzado = [];
    var rankingMarca   = [];
    var rankingGenero  = [];

    if (zapSheet && zapSheet.getLastRow() > 1) {
      var zapData    = zapSheet.getDataRange().getValues();
      var zapHeaders = zapData[0];
      var zEmailCol  = zapHeaders.indexOf('Email_Usuario');
      var zMarcaCol  = zapHeaders.indexOf('Marca');
      var zModeloCol = zapHeaders.indexOf('Modelo');
      var zKmCol     = zapHeaders.indexOf('KM_Actuales');
      var zEstadoCol = zapHeaders.indexOf('Estado');
      var zGeneroCol = zapHeaders.indexOf('Genero');
      var zLimiteCol = zapHeaders.indexOf('KM_Limite');

      // Mapa para rankingCalzado: clave = "Marca||Modelo"
      var calzadoMap = {};
      var marcaMap   = {};
      var generoMap  = {};

      for (var i = 1; i < zapData.length; i++) {
        var estado = zEstadoCol !== -1 ? zapData[i][zEstadoCol].toString().trim().toLowerCase() : '';
        if (estado === 'archivada') continue; // ignorar archivadas

        var marca  = zMarcaCol  !== -1 ? (zapData[i][zMarcaCol]  || '').toString().trim() : '';
        var modelo = zModeloCol !== -1 ? (zapData[i][zModeloCol] || '').toString().trim() : '';
        var genero = zGeneroCol !== -1 ? (zapData[i][zGeneroCol] || '').toString().trim() : '';
        var km     = Number(zapData[i][zKmCol]) || 0;
        var limite = zLimiteCol !== -1 ? (Number(zapData[i][zLimiteCol]) || TP.KM_UMBRAL_CUPON) : TP.KM_UMBRAL_CUPON;

        // ── Alertas de desgaste (usa el límite propio de cada zapatilla) ──
        if (km >= limite) {
          var email = zEmailCol !== -1 ? zapData[i][zEmailCol].toString().trim().toLowerCase() : '';
          var uInfo = grupoMap[email] || { nombre: email, grupo: '' };
          alertasDesgaste.push({
            email:       email,
            runner:      uInfo.nombre,
            grupo:       uInfo.grupo,
            zapatilla:   marca + ' ' + modelo,
            kilometraje: km,
            limite:      limite,
            // % sobre el límite PROPIO de esta zapatilla, no un tope fijo —
            // cada una puede tener un límite distinto (KM_Limite), así que
            // comparar km crudo entre zapatillas no dice nada de la urgencia
            // real. Ver admin.html (semáforo/alertas), que ahora colorea
            // según este porcentaje en vez de bandas de km fijas.
            porcentaje:  limite > 0 ? Math.round((km / limite) * 100) : 100
          });
        }

        // ── Ranking calzado (marca + modelo) ──
        if (marca || modelo) {
          var clave = marca + '||' + modelo;
          if (!calzadoMap[clave]) {
            calzadoMap[clave] = { marca: marca, modelo: modelo, cantidad: 0, kmTotal: 0 };
          }
          calzadoMap[clave].cantidad++;
          calzadoMap[clave].kmTotal += km;
        }

        // ── Ranking por marca ──
        if (marca) {
          if (!marcaMap[marca]) marcaMap[marca] = { marca: marca, cantidad: 0, kmTotal: 0 };
          marcaMap[marca].cantidad++;
          marcaMap[marca].kmTotal += km;
        }

        // ── Distribución por género ──
        if (genero) {
          if (!generoMap[genero]) generoMap[genero] = { genero: genero, cantidad: 0 };
          generoMap[genero].cantidad++;
        }
      }

      alertasDesgaste.sort(function(a, b) { return b.kilometraje - a.kilometraje; });

      // Convertir mapas a arrays y ordenar por cantidad descendente
      rankingCalzado = Object.values(calzadoMap)
        .sort(function(a, b) {
          if (b.cantidad !== a.cantidad) return b.cantidad - a.cantidad;
          return b.kmTotal - a.kmTotal; // desempate por km total
        })
        .slice(0, 10); // top 10

      rankingMarca = Object.values(marcaMap)
        .sort(function(a, b) {
          if (b.cantidad !== a.cantidad) return b.cantidad - a.cantidad;
          return b.kmTotal - a.kmTotal;
        })
        .slice(0, 10); // top 10

      rankingGenero = Object.values(generoMap)
        .sort(function(a, b) { return b.cantidad - a.cantidad; });
    }

    // — Ranking actividad (km totales por usuario) + por provincia/grupo + retención —
    var rankingActividad = [];
    var trainSheet = ss.getSheetByName('Entrenamientos');
    var activosUltimos7  = {};
    var activosUltimos30 = {};
    if (trainSheet && trainSheet.getLastRow() > 1) {
      var tData    = trainSheet.getDataRange().getValues();
      var tHeaders = tData[0];
      var tEmailC  = tHeaders.indexOf('Email_Usuario');
      var tKmC     = tHeaders.indexOf('KM_Sumados');
      var tFechaC  = tHeaders.indexOf('Fecha');
      var kmMap    = {};
      var ahoraMs  = Date.now();
      var MS_DIA   = 24 * 60 * 60 * 1000;

      for (var j = 1; j < tData.length; j++) {
        var temail = tData[j][tEmailC] ? tData[j][tEmailC].toString().trim().toLowerCase() : '';
        var tkm    = Number(tData[j][tKmC]) || 0;
        if (temail) kmMap[temail] = (kmMap[temail] || 0) + tkm;

        // ── Retención: actividad reciente ──
        if (temail && tFechaC !== -1 && tData[j][tFechaC]) {
          var fEntreno = _celdaADate(tData[j][tFechaC]);
          var diffDias = fEntreno ? (ahoraMs - fEntreno.getTime()) / MS_DIA : NaN;
          if (diffDias <= 7)  activosUltimos7[temail]  = true;
          if (diffDias <= 30) activosUltimos30[temail] = true;
        }

        // ── Km por provincia/grupo ──
        var uInfoKm = grupoMap[temail];
        if (uInfoKm) {
          if (uInfoKm.provincia && provinciaMap[uInfoKm.provincia]) {
            provinciaMap[uInfoKm.provincia].kmTotal += tkm;
          }
          if (uInfoKm.grupo && grupoRankMap[uInfoKm.grupo]) {
            grupoRankMap[uInfoKm.grupo].kmTotal += tkm;
          }
        }
      }
      for (var email in kmMap) {
        var uInfo = grupoMap[email] || { nombre: email, grupo: '' };
        rankingActividad.push({ email: email, nombre: uInfo.nombre, grupo: uInfo.grupo, kmCargados: kmMap[email] });
      }
      rankingActividad.sort(function(a, b) { return b.kmCargados - a.kmCargados; });
      rankingActividad = rankingActividad.slice(0, 10); // top 10
    }

    var rankingProvincia = Object.values(provinciaMap)
      .sort(function(a, b) {
        if (b.runners !== a.runners) return b.runners - a.runners;
        return b.kmTotal - a.kmTotal;
      })
      .slice(0, 10); // top 10

    var rankingGrupo = Object.values(grupoRankMap)
      .sort(function(a, b) {
        if (b.runners !== a.runners) return b.runners - a.runners;
        return b.kmTotal - a.kmTotal;
      })
      .slice(0, 10); // top 10

    var retencion = {
      activos7:  Object.keys(activosUltimos7).length,
      activos30: Object.keys(activosUltimos30).length,
      total:     totalUsuarios
    };

    return {
      success:          true,
      totalUsuarios:    totalUsuarios,
      alertasDesgaste:  alertasDesgaste,
      rankingMarca:     rankingMarca,
      rankingGenero:    rankingGenero,
      rankingProvincia: rankingProvincia,
      rankingGrupo:     rankingGrupo,
      retencion:        retencion,
      rankingActividad: rankingActividad,
      rankingCalzado:   rankingCalzado   // NUEVO v2906
    };

  } catch(e) {
    Logger.log('getAdminDashboardData ERROR: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}
