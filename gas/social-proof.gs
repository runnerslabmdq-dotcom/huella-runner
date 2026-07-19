// ============================================================
// HUELLA RUNNER — social-proof.gs
// Última actualización: 19/07/2026 09:15 (hora Argentina)
// Cambios en esta versión:
//   - Sacada la cola de "notificación diferida 24hs" (a pedido del
//     fundador): sin push real no cumplía su función, y llegaba a
//     mostrar un dato de relleno (750 km) como si fuera real para
//     modelos sin ningún usuario todavía. _encolarNotificacionDiferida
//     y procesarNotificacionesDiferidas() se sacaron; reemplazadas por
//     _notificarDatoComunidadSiHayDatos(), que manda el mensaje al
//     toque al registrar la zapa, y solo si ya hay datos reales de
//     comunidad para esa marca/modelo (proof.esNuevo === false).
//   - Si tenés un trigger horario configurado en Apps Script para
//     procesarNotificacionesDiferidas, se puede borrar — la función ya
//     no existe en el código (Activadores → buscarlo → ✕).
// Cambios en versiones anteriores:
//   - procesarNotificacionesDiferidas() usaba LockService para evitar
//     mandar la misma notificación diferida dos veces si dos visitas
//     casi simultáneas la disparaban al mismo tiempo.
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
// A3. NOTIFICACIÓN DE DATO DE COMUNIDAD — inmediata, solo si hay datos reales
//     Antes se guardaba en una cola para mandar 24hs después. Se sacó
//     el delay: sin notificación push real, el usuario solo la veía la
//     próxima vez que abría la app —a veces junto con otras acumuladas
//     de una sola vez, pareciendo spam— y encima, para un modelo sin
//     ningún usuario real todavía, mostraba un promedio de relleno
//     (750 km) como si fuera un dato real de comunidad. Ahora: se
//     manda al toque al registrar la zapa, y solo si proof.esNuevo es
//     false (ya hay al menos otro usuario real con esa marca/modelo).
// -----------------------------------------------------------
function _notificarDatoComunidadSiHayDatos(email, marca, modelo, proof) {
  try {
    if (!proof || proof.esNuevo) return; // sin datos reales todavía, no se manda nada
    const kmStr = proof.promedioKmCritico > 0
      ? proof.promedioKmCritico + ' km'
      : 'muchos kilómetros';
    const mensaje = `¡Dato de comunidad! Las ${marca} ${modelo} duran en promedio ${kmStr} en Huella Runner. ¡Seguí entrenando!`;
    enviarNotificacion('individual', email, mensaje, 'Mensaje');
  } catch(e) {
    Logger.log('_notificarDatoComunidadSiHayDatos ERROR: ' + e.toString());
  }
}
