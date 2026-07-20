// ============================================================
// HUELLA RUNNER — social-proof.gs
// Última actualización: 19/07/2026 22:33 (hora Argentina)
// Cambios en esta versión:
//   - actualizarCacheModelosNocturno() ahora guarda cuándo corrió por
//     última vez (Propiedades del script), para mostrarlo en la sección
//     "Salud del sistema" del panel admin.
// Cambios en versiones anteriores:
//   - _notificarDatoComunidadSiHayDatos() se sacó — el dato de
//     comunidad ya no se manda como notificación de ningún tipo.
//     obtenerDataSocialProof() ahora la usa directo addShoe() (en
//     codigo.gs) para mostrar una ventanita (modal) al toque en
//     Index.html, en vez de una notificación al buzón.
//   - Sacada la cola de "notificación diferida 24hs" (a pedido del
//     fundador): sin push real no cumplía su función, y llegaba a
//     mostrar un dato de relleno (750 km) como si fuera real para
//     modelos sin ningún usuario todavía. _encolarNotificacionDiferida
//     y procesarNotificacionesDiferidas() se sacaron.
//   - Si tenés un trigger horario configurado en Apps Script para
//     procesarNotificacionesDiferidas, se puede borrar — la función ya
//     no existe en el código (Activadores → buscarlo → ✕).
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
  PropertiesService.getScriptProperties().setProperty('CACHE_MODELOS_ULTIMA_CORRIDA', new Date().toISOString());
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
// A3. NOTA: el "dato de comunidad" ya no se manda como notificación.
//     addShoe() (en codigo.gs) devuelve obtenerDataSocialProof() directo
//     en la respuesta, y el frontend (Index.html) lo muestra al toque en
//     una ventanita al registrar la zapatilla — solo si esNuevo es false
//     (ya hay al menos otro usuario real con esa marca/modelo). Antes
//     pasó por dos etapas: primero una cola de 24hs, después el buzón de
//     notificaciones; ninguna de las dos se sentía tan inmediata como
//     esta ventanita, que ya estaba diseñada en social-proof-ui.html
//     desde antes pero nunca se había integrado.
// -----------------------------------------------------------
