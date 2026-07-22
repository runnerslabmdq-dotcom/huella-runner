// ============================================================
// HUELLA RUNNER — backup.gs
// Última actualización: 22/07/2026 16:45 (hora Argentina)
// Cambios en esta versión:
//   - Archivo nuevo: respaldo automático diario del Sheet completo.
//     A pedido del fundador, después de que una pestaña se borrara/
//     corriera por error y desaparecieran zapatillas de dos usuarios
//     (se corrigió a mano con el historial de versiones de Sheets,
//     pero hacía falta una red de seguridad extra).
// ============================================================

// Carpeta de Drive donde se van guardando las copias.
const BACKUP_CARPETA_NOMBRE = 'Huella Runner — Backups';
// Cuántos días de copias se conservan (después se van borrando solas).
const BACKUP_DIAS_RETENCION = 30;

/**
 * Hace una copia completa del Sheet y la guarda en una carpeta de Drive,
 * con fecha y hora en el nombre. Pensada para correr sola todos los días
 * (ver instalarBackupDiario más abajo). También se puede correr a mano
 * desde el editor si en algún momento se quiere un respaldo extra ya.
 */
function respaldarSheetDiario() {
  const carpeta = _obtenerOCrearCarpetaBackups();
  const archivoOriginal = DriveApp.getFileById(SHEET_ID);

  const ahora = new Date();
  const fechaStr = Utilities.formatDate(ahora, 'America/Argentina/Buenos_Aires', 'dd-MM-yyyy HH:mm');
  const nombreCopia = 'Huella Runner — backup ' + fechaStr;

  archivoOriginal.makeCopy(nombreCopia, carpeta);

  _borrarBackupsViejos(carpeta);
}

function _obtenerOCrearCarpetaBackups() {
  const carpetas = DriveApp.getFoldersByName(BACKUP_CARPETA_NOMBRE);
  if (carpetas.hasNext()) return carpetas.next();
  return DriveApp.createFolder(BACKUP_CARPETA_NOMBRE);
}

function _borrarBackupsViejos(carpeta) {
  const limite = new Date();
  limite.setDate(limite.getDate() - BACKUP_DIAS_RETENCION);

  const archivos = carpeta.getFiles();
  while (archivos.hasNext()) {
    const archivo = archivos.next();
    if (archivo.getDateCreated() < limite) {
      archivo.setTrashed(true);
    }
  }
}

/**
 * Instalador: crear UNA sola vez, a mano, desde el editor de Apps Script
 * (arriba, elegir esta función en el desplegable y apretar "Ejecutar").
 * Deja programado el respaldo diario a las 4 de la mañana (hora
 * Argentina) y no hace falta tocarlo de nuevo — si ya existe un trigger
 * de respaldarSheetDiario, lo borra primero para no duplicarlo.
 */
function instalarBackupDiario() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function (t) {
    if (t.getHandlerFunction() === 'respaldarSheetDiario') {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger('respaldarSheetDiario')
    .timeBased()
    .atHour(4)
    .everyDays(1)
    .inTimezone('America/Argentina/Buenos_Aires')
    .create();
}
