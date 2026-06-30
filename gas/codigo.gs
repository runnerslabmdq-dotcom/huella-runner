// ============================================
// HUELLA RUNNER TODO TRAIL - BACKEND 2906 V1
// CAMBIOS vs 2206_V1:
//   1. USUARIOS: USERS_HEADERS + registerUser() con Provincia y Ciudad
//   2. ADMIN: getAdminDashboardData() ahora devuelve rankingCalzado
// ============================================

const SHEET_ID = '1zPS06n_ufECAw-4yWUHzQJDbpqYjxtoL24akjOo0Ofo';

function doGet(e) {
  const page = e && e.parameter ? e.parameter.page : '';
  if (page === 'admin') {
    return HtmlService.createTemplateFromFile('admin')
      .evaluate()
      .setTitle('Admin — Huella Runner')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  }
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Huella Runner')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

function getAdminUrl() {
  return ScriptApp.getService().getUrl() + '?page=admin';
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
const USERS_HEADERS = ['Nombre', 'Apellido', 'Email', 'Password', 'Nivel', 'Grupo', 'FechaNacimiento', 'Provincia', 'Ciudad', 'Celular', 'Rol'];

// CAMBIO v2906: registerUser recibe provincia y ciudad
function registerUser(nombre, apellido, email, password, nivel, grupo, fechaNac, provincia, ciudad, celular) {
  if (!nombre || nombre.toString().trim() === '') {
    return { success: false, error: 'El nombre es requerido.' };
  }
  if (!email) return { success: false, error: 'Email requerido.' };
  const emailClean = email.toString().trim().toLowerCase();
  const nombreClean = nombre.toString().trim();
  const { sheet, headers } = getSheetAndHeaders('Usuarios', USERS_HEADERS);
  const data = sheet.getDataRange().getValues();
  const emailCol = headers.indexOf('Email');
  for (let i = 1; i < data.length; i++) {
    if (data[i][emailCol].toString().trim().toLowerCase() === emailClean) {
      return { success: false, error: 'El email ya esta registrado.' };
    }
  }
  appendDataByHeader('Usuarios', USERS_HEADERS, {
    'Nombre':          nombreClean,
    'Apellido':        apellido,
    'Email':           emailClean,
    'Password':        password,
    'Nivel':           nivel || '',
    'Grupo':           grupo || '',
    'FechaNacimiento': fechaNac || '',
    'Provincia':       provincia || '',
    'Ciudad':          ciudad || '',
    'Celular':         celular || '',
    'Rol':             ''
  });

  enviarEmailBienvenida(emailClean, nombreClean);
  return { success: true, email: emailClean, nombre: nombreClean };
}

function loginUser(email, password) {
  if (!email) return { success: false, error: 'Email requerido.' };
  const emailClean = email.toString().trim().toLowerCase();
  const { sheet, headers } = getSheetAndHeaders('Usuarios', USERS_HEADERS);
  const data = sheet.getDataRange().getValues();
  const emailCol = headers.indexOf('Email');
  const passCol  = headers.indexOf('Password');
  const nomCol   = headers.indexOf('Nombre');
  const rolCol   = headers.indexOf('Rol');
  for (let i = 1; i < data.length; i++) {
    if (data[i][emailCol].toString().trim().toLowerCase() === emailClean &&
        data[i][passCol].toString() === password) {
      const rol = rolCol !== -1 ? data[i][rolCol].toString().trim().toLowerCase() : '';
      return {
        success: true,
        email:   data[i][emailCol].toString().trim().toLowerCase(),
        nombre:  data[i][nomCol],
        esAdmin: rol === 'admin'
      };
    }
  }
  return { success: false, error: 'Email o contrasena incorrectos.' };
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

  var encontrado      = false;
  var nombreUsuario   = '';
  var passwordUsuario = '';

  for (var i = 1; i < data.length; i++) {
    var rowEmail = data[i][emailCol] ? data[i][emailCol].toString().trim().toLowerCase() : '';
    if (rowEmail === emailClean) {
      encontrado       = true;
      nombreUsuario    = nomCol !== -1 ? data[i][nomCol].toString() : 'Runner';
      passwordUsuario  = data[i][passCol].toString();
      break;
    }
  }

  if (!encontrado) {
    return { success: false, error: 'No encontramos una cuenta con ese email.' };
  }

  try {
    MailApp.sendEmail({
      to:      emailClean,
      subject: 'Huella Runner Todo Trail — Recuperación de contraseña',
      body:    '',
      htmlBody:
        '<div style="font-family:Arial,sans-serif;background:#080808;padding:32px;border-radius:16px;max-width:480px;margin:auto;">' +
        '<h1 style="color:#dcfd8b;font-size:1.5rem;margin-bottom:4px;">HUELLA <span style="color:#E8E8E8;">RUNNER</span></h1>' +
        '<p style="color:#888;font-size:0.65rem;letter-spacing:3px;text-transform:uppercase;margin-top:0;">Powered by Huella Runner MDQ · Todo Trail</p>' +
        '<hr style="border:none;border-top:1px solid #1f1f1f;margin:20px 0;">' +
        '<p style="color:#E8E8E8;font-size:1rem;">Hola, <strong>' + nombreUsuario + '</strong> 👋</p>' +
        '<p style="color:#888888;font-size:0.85rem;line-height:1.6;">Recibiste este correo porque solicitaste recuperar tu contraseña.</p>' +
        '<div style="background:#111111;border:1px solid #1f1f1f;border-radius:12px;padding:16px 20px;margin:20px 0;">' +
        '<p style="color:#888;font-size:0.65rem;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px;">Tu contraseña</p>' +
        '<p style="color:#dcfd8b;font-size:1.3rem;font-weight:900;margin:0;letter-spacing:1px;">' + passwordUsuario + '</p>' +
        '</div>' +
        '<p style="color:#555;font-size:0.75rem;">Si no solicitaste esto, ignorá este mensaje.</p>' +
        '<hr style="border:none;border-top:1px solid #1f1f1f;margin:20px 0;">' +
        '<p style="color:#333;font-size:0.65rem;">— Equipo Huella Runner Todo Trail · Huella Runner MDQ</p>' +
        '</div>',
      name: 'Huella Runner Todo Trail'
    });
    Logger.log('recoverPassword: email enviado a ' + emailClean);
    return { success: true };
  } catch(e) {
    Logger.log('recoverPassword ERROR al enviar email: ' + e.toString());
    return { success: false, error: 'No se pudo enviar el correo. Verificá los permisos del script. (' + e.message + ')' };
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
      subject: '¡Bienvenido/a a Huella Runner Todo Trail, ' + nombre + '! 🏔️',
      body:    '',
      htmlBody:
        '<div style="font-family:Arial,sans-serif;background:#080808;padding:32px;border-radius:16px;max-width:480px;margin:auto;">' +
        '<h1 style="color:#dcfd8b;font-size:1.5rem;margin-bottom:4px;">HUELLA <span style="color:#E8E8E8;">RUNNER</span></h1>' +
        '<p style="color:#888;font-size:0.65rem;letter-spacing:3px;text-transform:uppercase;margin-top:0;">Powered by Huella Runner MDQ · Todo Trail</p>' +
        '<hr style="border:none;border-top:1px solid #1f1f1f;margin:20px 0;">' +
        '<p style="color:#E8E8E8;font-size:1rem;">¡Hola, <strong>' + nombre + '</strong>! 🎉</p>' +
        '<p style="color:#888888;font-size:0.85rem;line-height:1.6;">Ya sos parte de la familia <strong style="color:#dcfd8b;">Huella Runner Todo Trail</strong>. Nos alegra tenerte con nosotros.</p>' +
        '<div style="background:#111111;border:1px solid #1f1f1f;border-radius:12px;padding:16px 20px;margin:20px 0;">' +
        '<p style="color:#888;font-size:0.65rem;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Desde hoy disfrutás de</p>' +
        '<p style="color:#E8E8E8;font-size:0.85rem;margin:6px 0;">🏔️ &nbsp;Catálogo exclusivo de calzado trail</p>' +
        '<p style="color:#E8E8E8;font-size:0.85rem;margin:6px 0;">✅ &nbsp;Novedades y lanzamientos antes que nadie</p>' +
        '<p style="color:#E8E8E8;font-size:0.85rem;margin:6px 0;">✅ &nbsp;Ofertas y beneficios exclusivos para la comunidad trail</p>' +
        '<p style="color:#E8E8E8;font-size:0.85rem;margin:6px 0;">✅ &nbsp;Seguí el desgaste de tus zapatillas en cada sendero</p>' +
        '</div>' +
        '<p style="color:#888888;font-size:0.85rem;line-height:1.6;">Estamos acá para acompañarte en cada sendero. 🏔️</p>' +
        '<hr style="border:none;border-top:1px solid #1f1f1f;margin:20px 0;">' +
        '<p style="color:#333;font-size:0.65rem;">— Equipo Huella Runner Todo Trail · Huella Runner MDQ</p>' +
        '</div>',
      name: 'Huella Runner Todo Trail'
    });
    Logger.log('enviarEmailBienvenida: email enviado a ' + emailUsuario);
  } catch(e) {
    Logger.log('enviarEmailBienvenida ERROR: ' + e.toString());
  }
}

// ============================================================
// FUNCIÓN DE PRUEBA TEMPORAL — ELIMINAR DESPUÉS DE AUTORIZAR
// ============================================================
function testPermisoEmail() {
  var resultado = recoverPassword('runnerslabmdq@gmail.com');
  Logger.log(JSON.stringify(resultado));
}

// --- ZAPATILLAS ---
const SHOES_HEADERS = ['ID_Zapa', 'Email_Usuario', 'Marca', 'Modelo', 'Talle', 'Genero', 'KM_Actuales', 'Alias', 'Estado'];

function addShoe(email, formData) {
  if (!email || !formData) return { success: false, error: 'Datos incompletos.' };
  const emailClean = email.toString().trim().toLowerCase();
  appendDataByHeader('Zapatillas', SHOES_HEADERS, {
    'ID_Zapa':       Utilities.getUuid(),
    'Email_Usuario': emailClean,
    'Marca':         formData.marca,
    'Modelo':        formData.modelo,
    'Talle':         formData.talle,
    'Genero':        formData.genero,
    'KM_Actuales':   Number(formData.km),
    'Alias':         formData.alias || ''
  });
  return { success: true };
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
        let obj = {};
        headers.forEach((header, index) => { obj[header] = data[i][index]; });
        userShoes.push(obj);
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

    const trainSheet = ss.getSheetByName('Entrenamientos');
    if (trainSheet && trainSheet.getLastRow() > 1) {
      const trainData = trainSheet.getDataRange().getValues();
      const trainHeaders = trainData[0];
      const tIdZapaCol = trainHeaders.indexOf('ID_Zapa');
      const tEmailCol  = trainHeaders.indexOf('Email_Usuario');
      for (let i = trainData.length - 1; i >= 1; i--) {
        if (trainData[i][tIdZapaCol] === idZapatilla &&
            trainData[i][tEmailCol].toString().trim().toLowerCase() === emailClean) {
          trainSheet.deleteRow(i + 1);
        }
      }
      SpreadsheetApp.flush();
    }

    const shoeSheet = ss.getSheetByName('Zapatillas');
    if (shoeSheet) {
      const shoeData = shoeSheet.getDataRange().getValues();
      const shoeHeaders = shoeData[0];
      const idCol    = shoeHeaders.indexOf('ID_Zapa');
      const emailCol = shoeHeaders.indexOf('Email_Usuario');
      for (let i = shoeData.length - 1; i >= 1; i--) {
        if (shoeData[i][idCol] === idZapatilla &&
            shoeData[i][emailCol].toString().trim().toLowerCase() === emailClean) {
          shoeSheet.deleteRow(i + 1);
          break;
        }
      }
      SpreadsheetApp.flush();
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
        let obj = {};
        headers.forEach((header, index) => { obj[header] = data[i][index]; });
        archived.push(obj);
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

    if (idCol === -1 || emailCol === -1 || estadoCol === -1) {
      return { success: false, error: 'Estructura de Zapatillas incorrecta.' };
    }

    for (let i = 1; i < data.length; i++) {
      const rowId    = data[i][idCol]    ? data[i][idCol].toString()                        : '';
      const rowEmail = data[i][emailCol] ? data[i][emailCol].toString().trim().toLowerCase() : '';
      if (rowId === idZapatilla.toString() && rowEmail === emailClean) {
        sheet.getRange(i + 1, estadoCol + 1).setValue('');
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
    const idEntrenoCol = headers.indexOf('ID_Entreno');

    if (emailCol === -1 || idZapaCol === -1 || kmCol === -1 || fechaCol === -1) {
      Logger.log('getShoeHistory: faltan columnas');
      return [];
    }

    function normalizarFecha(val) {
      if (!val) return '—';
      if (val instanceof Date) {
        var tz   = 'America/Argentina/Buenos_Aires';
        var opts = { timeZone: tz, hour12: false,
                     day: '2-digit', month: '2-digit', year: 'numeric',
                     hour: '2-digit', minute: '2-digit' };
        var partes = val.toLocaleString('es-AR', opts);
        return partes.replace(',', '').replace(/\s+/, ' ').trim();
      }
      return val.toString();
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
          Fecha:      normalizarFecha(data[i][fechaCol]),
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
const TRAIN_HEADERS = ['ID_Entreno', 'Email_Usuario', 'ID_Zapa', 'KM_Sumados', 'Fecha'];

function logTraining(email, idZapatilla, kmNuevos) {
  if (!email) return { success: false, error: 'Email requerido.' };
  const emailClean = email.toString().trim().toLowerCase();

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const shoeSheet = ss.getSheetByName('Zapatillas');
  if (!shoeSheet) return { success: false, error: 'Hoja Zapatillas no encontrada.' };

  const shoeData    = shoeSheet.getDataRange().getValues();
  const shoeHeaders = shoeData[0];
  const idCol       = shoeHeaders.indexOf('ID_Zapa');
  const kmCol       = shoeHeaders.indexOf('KM_Actuales');

  let filaZapa = -1;
  for (let i = 1; i < shoeData.length; i++) {
    if (shoeData[i][idCol] === idZapatilla) {
      filaZapa = i;
      break;
    }
  }

  if (filaZapa === -1) {
    Logger.log('logTraining: zapatilla no encontrada id=' + idZapatilla);
    return { success: false, error: 'Zapatilla no encontrada.' };
  }

  const now  = new Date();
  const dd   = String(now.getDate()).padStart(2, '0');
  const mm   = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const hh   = String(now.getHours()).padStart(2, '0');
  const min  = String(now.getMinutes()).padStart(2, '0');
  const fechaFormateada = dd + '/' + mm + '/' + yyyy + ' ' + hh + ':' + min;

  appendDataByHeader('Entrenamientos', TRAIN_HEADERS, {
    'ID_Entreno':    Utilities.getUuid(),
    'Email_Usuario': emailClean,
    'ID_Zapa':       idZapatilla,
    'KM_Sumados':    Number(kmNuevos),
    'Fecha':         fechaFormateada
  });

  const totalKm = Number(shoeData[filaZapa][kmCol]) + Number(kmNuevos);
  shoeSheet.getRange(filaZapa + 1, kmCol + 1).setValue(totalKm);
  SpreadsheetApp.flush();
  return { success: true };
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

      for (let i = 1; i < shoeData.length; i++) {
        const rowZapaId = shoeData[i][idCol]     ? shoeData[i][idCol].toString() : '';
        const rowEmail  = shoeData[i][sEmailCol] ? shoeData[i][sEmailCol].toString().trim().toLowerCase() : '';
        if (rowZapaId === idZapatilla.toString() && rowEmail === emailClean) {
          const kmActual = Number(shoeData[i][kmCol]) || 0;
          const kmRestar = Number(kmADescontar) || 0;
          const kmNuevo  = Math.max(kmActual - kmRestar, 0);
          shoeSheet.getRange(i + 1, kmCol + 1).setValue(kmNuevo);
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
// MÓDULO NOTIFICACIONES
// ============================================================

const NOTIF_HEADERS = ['ID_Notif', 'Email', 'Mensaje', 'Fecha', 'Leido', 'Tipo', 'Codigo_Voucher'];

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

function enviarNotificacion(destinatarioTipo, destinatarioValor, mensaje, tipo) {
  try {
    if (!mensaje || mensaje.toString().trim() === '') {
      return { success: false, error: 'El mensaje no puede estar vacío.' };
    }
    if (!tipo || (tipo !== 'Mensaje' && tipo !== 'Premio')) {
      return { success: false, error: 'Tipo inválido. Debe ser Mensaje o Premio.' };
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
    } else {
      return { success: false, error: 'Tipo de destinatario inválido.' };
    }

    const now  = new Date();
    const dd   = String(now.getDate()).padStart(2, '0');
    const mm   = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const hh   = String(now.getHours()).padStart(2, '0');
    const min  = String(now.getMinutes()).padStart(2, '0');
    const fecha = dd + '/' + mm + '/' + yyyy + ' ' + hh + ':' + min;

    let insertados = 0;
    for (let d = 0; d < destinatarios.length; d++) {
      const codigoVoucher = tipo === 'Premio' ? _generarCodigoVoucher() : '';
      appendDataByHeader('Notificaciones', NOTIF_HEADERS, {
        'ID_Notif':       Utilities.getUuid(),
        'Email':          destinatarios[d],
        'Mensaje':        mensaje.toString().trim(),
        'Fecha':          fecha,
        'Leido':          'FALSE',
        'Tipo':           tipo,
        'Codigo_Voucher': codigoVoucher
      });
      insertados++;
    }

    Logger.log('enviarNotificacion OK: ' + insertados + ' notif insertadas. Tipo=' + tipo);
    return { success: true, enviados: insertados };

  } catch(e) {
    Logger.log('enviarNotificacion ERROR: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

function _generarCodigoVoucher() {
  var chars  = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var codigo = 'HR-OPEN-';
  for (var i = 0; i < 4; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  codigo += String(Math.floor(Math.random() * 90) + 10);
  return codigo;
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
    const emailCol   = headers.indexOf('Email');
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
    const emailCol = headers.indexOf('Email');
    const leidoCol = headers.indexOf('Leido');

    if (emailCol === -1 || leidoCol === -1) return 0;

    let count = 0;
    for (let i = 1; i < data.length; i++) {
      const rowEmail = data[i][emailCol] ? data[i][emailCol].toString().trim().toLowerCase() : '';
      const leido    = data[i][leidoCol] ? data[i][leidoCol].toString().toUpperCase() : 'FALSE';
      if (rowEmail === emailClean && leido !== 'TRUE') count++;
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
    const emailCol = headers.indexOf('Email');

    if (idCol === -1 || emailCol === -1) {
      return { success: false, error: 'Estructura de Notificaciones incorrecta.' };
    }

    for (let i = 1; i < data.length; i++) {
      const rowId    = data[i][idCol]    ? data[i][idCol].toString()                        : '';
      const rowEmail = data[i][emailCol] ? data[i][emailCol].toString().trim().toLowerCase() : '';
      if (rowId === idNotif.toString() && rowEmail === emailClean) {
        const ocultoCol = headers.indexOf('Oculto');
        if (ocultoCol === -1) {
          return { success: false, error: 'Columna Oculto no encontrada.' };
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
function getAdminDashboardData() {
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);

    // — Total usuarios —
    var usersSheet = ss.getSheetByName('Usuarios');
    var totalUsuarios = 0;
    if (usersSheet && usersSheet.getLastRow() > 1) {
      totalUsuarios = usersSheet.getLastRow() - 1;
    }

    // — Mapa usuario → nombre/grupo —
    var grupoMap = {};
    if (usersSheet && usersSheet.getLastRow() > 1) {
      var uData0    = usersSheet.getDataRange().getValues();
      var uHeaders0 = uData0[0];
      var uEmailC0  = uHeaders0.indexOf('Email');
      var uNombreC0 = uHeaders0.indexOf('Nombre');
      var uGrupoC0  = uHeaders0.indexOf('Grupo');
      for (var i = 1; i < uData0.length; i++) {
        var ue0 = uData0[i][uEmailC0] ? uData0[i][uEmailC0].toString().trim().toLowerCase() : '';
        if (ue0) grupoMap[ue0] = {
          nombre: uData0[i][uNombreC0] ? uData0[i][uNombreC0].toString() : ue0,
          grupo:  uGrupoC0 !== -1 ? (uData0[i][uGrupoC0] || '').toString() : ''
        };
      }
    }

    // — Alertas desgaste crítico (KM_Actuales >= 700) —
    var zapSheet = ss.getSheetByName('Zapatillas');
    var alertasDesgaste = [];

    // — RANKING CALZADO: conteo de combinaciones Marca+Modelo activas —
    var rankingCalzado = [];

    if (zapSheet && zapSheet.getLastRow() > 1) {
      var zapData    = zapSheet.getDataRange().getValues();
      var zapHeaders = zapData[0];
      var zEmailCol  = zapHeaders.indexOf('Email_Usuario');
      var zMarcaCol  = zapHeaders.indexOf('Marca');
      var zModeloCol = zapHeaders.indexOf('Modelo');
      var zKmCol     = zapHeaders.indexOf('KM_Actuales');
      var zEstadoCol = zapHeaders.indexOf('Estado');

      // Mapa para rankingCalzado: clave = "Marca||Modelo"
      var calzadoMap = {};

      for (var i = 1; i < zapData.length; i++) {
        var estado = zEstadoCol !== -1 ? zapData[i][zEstadoCol].toString().trim().toLowerCase() : '';
        if (estado === 'archivada') continue; // ignorar archivadas

        var marca  = zMarcaCol  !== -1 ? (zapData[i][zMarcaCol]  || '').toString().trim() : '';
        var modelo = zModeloCol !== -1 ? (zapData[i][zModeloCol] || '').toString().trim() : '';
        var km     = Number(zapData[i][zKmCol]) || 0;

        // ── Alertas de desgaste ──
        if (km >= 700) {
          var email = zEmailCol !== -1 ? zapData[i][zEmailCol].toString().trim().toLowerCase() : '';
          var uInfo = grupoMap[email] || { nombre: email, grupo: '' };
          alertasDesgaste.push({
            runner:      uInfo.nombre,
            grupo:       uInfo.grupo,
            zapatilla:   marca + ' ' + modelo,
            kilometraje: km
          });
        }

        // ── Ranking calzado ──
        if (marca || modelo) {
          var clave = marca + '||' + modelo;
          if (!calzadoMap[clave]) {
            calzadoMap[clave] = { marca: marca, modelo: modelo, cantidad: 0, kmTotal: 0 };
          }
          calzadoMap[clave].cantidad++;
          calzadoMap[clave].kmTotal += km;
        }
      }

      alertasDesgaste.sort(function(a, b) { return b.kilometraje - a.kilometraje; });

      // Convertir mapa a array y ordenar por cantidad descendente
      rankingCalzado = Object.values(calzadoMap)
        .sort(function(a, b) {
          if (b.cantidad !== a.cantidad) return b.cantidad - a.cantidad;
          return b.kmTotal - a.kmTotal; // desempate por km total
        })
        .slice(0, 15); // top 15
    }

    // — Ranking actividad (km totales por usuario) —
    var rankingActividad = [];
    var trainSheet = ss.getSheetByName('Entrenamientos');
    if (trainSheet && trainSheet.getLastRow() > 1) {
      var tData    = trainSheet.getDataRange().getValues();
      var tHeaders = tData[0];
      var tEmailC  = tHeaders.indexOf('Email_Usuario');
      var tKmC     = tHeaders.indexOf('KM_Sumados');
      var kmMap    = {};
      for (var j = 1; j < tData.length; j++) {
        var temail = tData[j][tEmailC] ? tData[j][tEmailC].toString().trim().toLowerCase() : '';
        var tkm    = Number(tData[j][tKmC]) || 0;
        if (temail) kmMap[temail] = (kmMap[temail] || 0) + tkm;
      }
      for (var email in kmMap) {
        var uInfo = grupoMap[email] || { nombre: email, grupo: '' };
        rankingActividad.push({ email: email, nombre: uInfo.nombre, grupo: uInfo.grupo, kmCargados: kmMap[email] });
      }
      rankingActividad.sort(function(a, b) { return b.kmCargados - a.kmCargados; });
      rankingActividad = rankingActividad.slice(0, 20);
    }

    return {
      success:          true,
      totalUsuarios:    totalUsuarios,
      alertasDesgaste:  alertasDesgaste,
      rankingActividad: rankingActividad,
      rankingCalzado:   rankingCalzado   // NUEVO v2906
    };

  } catch(e) {
    Logger.log('getAdminDashboardData ERROR: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}