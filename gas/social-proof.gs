// ============================================================
// HUELLA RUNNER — social-proof.gs
// Última actualización: 14/07/2026 13:00 (hora Argentina)
// Cambios en esta versión: Sin cambios en esta versión.
// ============================================================
// TRIGGER NOCTURNO: En Apps Script Editor →
//   Extensiones → Apps Script → Activadores → "+ Añadir activador"
//   Función: actualizarCacheModelosNocturno
//   Tipo: Activador de tiempo → Diario → Entre 3:00 y 4:00 AM
// ============================================================

const CACHE_SHEET   = 'Cache_Modelos';
const ZAPAS_SHEET_SP = 'Zapatillas';   // ajustar si el nombre real difiere

const CACHE_HEADERS = [
  'Marca', 'Modelo', 'Total_Usuarios', 'Total_KM_Acumulados', 'Promedio_KM_Critico'
];

// -----------------------------------------------------------
// A1. CRON NOCTURNO — Reconstruye Cache_Modelos completo
// -----------------------------------------------------------
function actualizarCacheModelosNocturno() {
  const ss        = SpreadsheetApp.openById(SHEET_ID);
  const zapSheet  = ss.getSheetByName(ZAPAS_SHEET_SP);
  if (!zapSheet || zapSheet.getLastRow() < 2) return;

  const data    = zapSheet.getDataRange().getValues();
  const headers = data[0];

  const col = {
    marca:   headers.indexOf('Marca'),
    modelo:  headers.indexOf('Modelo'),
    km:      headers.indexOf('KM_Actuales'),
    email:   headers.indexOf('Email_Usuario'),
    estado:  headers.indexOf('Estado'),
  };

  // Agrupa por "Marca|||Modelo"
  const grupos = {};

  for (let i = 1; i < data.length; i++) {
    const row    = data[i];
    const marca  = (row[col.marca]  || '').toString().trim();
    const modelo = (row[col.modelo] || '').toString().trim();
    if (!marca || !modelo) continue;

    const key   = marca + '|||' + modelo;
    const km    = Number(row[col.km])    || 0;
    const email = (row[col.email] || '').toString().trim().toLowerCase();
    const estado = (row[col.estado] || '').toString().trim().toLowerCase();

    if (!grupos[key]) {
      grupos[key] = { marca, modelo, usuarios: new Set(), kmTotal: 0, kmCriticos: [] };
    }
    grupos[key].usuarios.add(email);
    grupos[key].kmTotal += km;

    // Acumulamos KM cuando el estado indica desgaste avanzado
    if (estado === 'archivada' && km > 0) {
      grupos[key].kmCriticos.push(km);
    }
  }

  // Reconstruye la hoja Cache_Modelos
  let cacheSheet = ss.getSheetByName(CACHE_SHEET);
  if (!cacheSheet) {
    cacheSheet = ss.insertSheet(CACHE_SHEET);
  } else {
    cacheSheet.clearContents();
  }

  cacheSheet.appendRow(CACHE_HEADERS);

  Object.values(grupos).forEach(g => {
    const promedio = g.kmCriticos.length > 0
      ? Math.round(g.kmCriticos.reduce((a, b) => a + b, 0) / g.kmCriticos.length)
      : 0;

    cacheSheet.appendRow([
      g.marca,
      g.modelo,
      g.usuarios.size,
      Math.round(g.kmTotal),
      promedio
    ]);
  });

  SpreadsheetApp.flush();
  Logger.log('Cache_Modelos actualizado: ' + Object.keys(grupos).length + ' modelos.');
}

// -----------------------------------------------------------
// A2. CONSULTA RÁPIDA — Leer desde Cache_Modelos
// -----------------------------------------------------------
function obtenerDataSocialProof(marca, modelo) {
  const DEFAULT = {
    totalUsuarios:    1,
    totalKmGlobales:  0,
    promedioKmCritico: 750,
    esNuevo: true
  };

  try {
    const ss         = SpreadsheetApp.openById(SHEET_ID);
    const cacheSheet = ss.getSheetByName(CACHE_SHEET);
    if (!cacheSheet || cacheSheet.getLastRow() < 2) return DEFAULT;

    const data    = cacheSheet.getDataRange().getValues();
    const headers = data[0];

    const col = {
      marca:    headers.indexOf('Marca'),
      modelo:   headers.indexOf('Modelo'),
      usuarios: headers.indexOf('Total_Usuarios'),
      kmTotal:  headers.indexOf('Total_KM_Acumulados'),
      promedio: headers.indexOf('Promedio_KM_Critico'),
    };

    const marcaNorm  = (marca  || '').toString().trim().toLowerCase();
    const modeloNorm = (modelo || '').toString().trim().toLowerCase();

    for (let i = 1; i < data.length; i++) {
      const rowMarca  = (data[i][col.marca]  || '').toString().trim().toLowerCase();
      const rowModelo = (data[i][col.modelo] || '').toString().trim().toLowerCase();

      if (rowMarca === marcaNorm && rowModelo === modeloNorm) {
        return {
          totalUsuarios:    Number(data[i][col.usuarios]) || 1,
          totalKmGlobales:  Number(data[i][col.kmTotal])  || 0,
          promedioKmCritico: Number(data[i][col.promedio]) || 750,
          esNuevo: false
        };
      }
    }

    return DEFAULT;

  } catch(e) {
    Logger.log('obtenerDataSocialProof ERROR: ' + e.toString());
    return DEFAULT;
  }
}

// -----------------------------------------------------------
// A3. NOTIFICACIÓN DIFERIDA (simulada en Sheets)
//     Guarda una notificación con fecha de envío = ahora + 24h.
//     Un cron separado (o la carga del dashboard) la procesa.
// -----------------------------------------------------------
function _encolarNotificacionDiferida(email, marca, modelo, proof) {
  try {
    const ss            = SpreadsheetApp.openById(SHEET_ID);
    const NOTIF_DEFERRED = 'Notif_Diferidas';
    let sheet = ss.getSheetByName(NOTIF_DEFERRED);
    if (!sheet) {
      sheet = ss.insertSheet(NOTIF_DEFERRED);
      sheet.appendRow(['Email', 'Marca', 'Modelo', 'Mensaje', 'EnviarEn', 'Enviado']);
    }

    const enviarEn = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const kmStr    = proof.promedioKmCritico > 0
      ? proof.promedioKmCritico + ' km'
      : 'muchos kilómetros';

    const mensaje = `¡Dato de comunidad! Las ${marca} ${modelo} duran en promedio ${kmStr} en Huella Runner. ¡Seguí entrenando!`;

    sheet.appendRow([email, marca, modelo, mensaje, enviarEn, false]);
    SpreadsheetApp.flush();
  } catch(e) {
    Logger.log('_encolarNotificacionDiferida ERROR: ' + e.toString());
  }
}

// -----------------------------------------------------------
// CRON: Procesar notificaciones diferidas ya vencidas
// Configurar otro trigger diario para esta función (ej: 8:00 AM)
// -----------------------------------------------------------
function procesarNotificacionesDiferidas() {
  try {
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('Notif_Diferidas');
    if (!sheet || sheet.getLastRow() < 2) return;

    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const col = {
      email:    headers.indexOf('Email'),
      marca:    headers.indexOf('Marca'),
      modelo:   headers.indexOf('Modelo'),
      mensaje:  headers.indexOf('Mensaje'),
      enviarEn: headers.indexOf('EnviarEn'),
      enviado:  headers.indexOf('Enviado'),
    };

    const ahora = new Date();

    for (let i = 1; i < data.length; i++) {
      const flagEnviado = (data[i][col.enviado] === true)
        || data[i][col.enviado].toString().trim().toUpperCase() === 'TRUE';
      if (flagEnviado) continue;

      const enviarEn = _celdaADate(data[i][col.enviarEn]);
      if (!enviarEn || ahora < enviarEn) continue;

      const email   = data[i][col.email].toString().trim();
      const mensaje = data[i][col.mensaje].toString();

      enviarNotificacion('individual', email, mensaje, 'Mensaje');

      sheet.getRange(i + 1, col.enviado + 1).setValue(true);
    }

    SpreadsheetApp.flush();
  } catch(e) {
    Logger.log('procesarNotificacionesDiferidas ERROR: ' + e.toString());
  }
}
