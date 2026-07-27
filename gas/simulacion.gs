// ============================================================
// HUELLA RUNNER — simulacion.gs
// Última actualización: 26/07/2026 11:39 (hora Argentina)
// Cambios en esta versión:
//   - Archivo nuevo: simularEntrenamientosFalsos(), para que la demo se
//     vea "viva" mientras los datos del Sheet son todos simulados (antes
//     de la beta abierta). Cada corrida, un puñado al azar de zapatillas
//     activas suma un entrenamiento nuevo — usa el mismo camino que un
//     usuario real (registrarActividadTrailPoints, en trail-points.gs),
//     así que también sirve como prueba de carga real del sistema de
//     km/cupones/anti-fraude, no solo maquillaje visual.
//   - IMPORTANTE: el fundador va a borrar todos los datos simulados del
//     Sheet (menos el usuario admin) antes de abrir la beta al público
//     el 1 de agosto. Este archivo está pensado solo para ese período
//     previo — desinstalar el trigger (desinstalarSimulacionEntrenamientos,
//     acá abajo) antes de esa fecha, para no inventarle entrenamientos
//     falsos a usuarios reales.
// ============================================================

// Nunca se le simula actividad al usuario admin.
const SIM_EMAILS_EXCLUIR = ['huellarunner@gmail.com'];

// Probabilidad de que una zapatilla activa "entrene" en cada corrida —
// no el 100%, sería poco realista que todas sumen el mismo día.
const SIM_PORCENTAJE_ACTIVO = 0.15;

// Techo de zapatillas tocadas por corrida, para no acercarse al límite
// de 6 minutos de ejecución de Apps Script si hay muchas cargadas.
const SIM_MAX_POR_CORRIDA = 40;

/**
 * Simula un entrenamiento nuevo para un puñado al azar de zapatillas
 * activas (no archivadas, no del admin). Pensada para correr sola cada
 * unas horas (ver instalarSimulacionEntrenamientos más abajo). También
 * se puede correr a mano desde el editor para probar.
 */
function simularEntrenamientosFalsos() {
  try {
    const ss        = SpreadsheetApp.openById(SHEET_ID);
    const shoeSheet = ss.getSheetByName('Zapatillas');
    if (!shoeSheet || shoeSheet.getLastRow() <= 1) {
      Logger.log('simularEntrenamientosFalsos: no hay zapatillas cargadas.');
      return;
    }

    const shoeData    = shoeSheet.getDataRange().getValues();
    const shoeHeaders = shoeData[0];
    const idCol     = shoeHeaders.indexOf('ID_Zapa');
    const emailCol  = shoeHeaders.indexOf('Email_Usuario');
    const estadoCol = shoeHeaders.indexOf('Estado');

    if (idCol === -1 || emailCol === -1) {
      Logger.log('simularEntrenamientosFalsos: faltan columnas en Zapatillas.');
      return;
    }

    // Candidatas: zapatillas activas de usuarios que no sean el admin.
    const candidatas = [];
    for (let i = 1; i < shoeData.length; i++) {
      const email  = shoeData[i][emailCol] ? shoeData[i][emailCol].toString().trim().toLowerCase() : '';
      const estado = estadoCol !== -1 ? shoeData[i][estadoCol].toString().trim().toLowerCase() : '';
      if (!email || SIM_EMAILS_EXCLUIR.indexOf(email) !== -1) continue;
      if (estado === 'archivada') continue;
      candidatas.push({ idZapa: shoeData[i][idCol].toString(), email: email });
    }

    if (candidatas.length === 0) {
      Logger.log('simularEntrenamientosFalsos: no hay zapatillas candidatas.');
      return;
    }

    // Elige al azar quiénes "entrenan" en esta corrida, con un techo.
    let elegidas = candidatas.filter(function() { return Math.random() < SIM_PORCENTAJE_ACTIVO; });
    if (elegidas.length > SIM_MAX_POR_CORRIDA) {
      elegidas = elegidas
        .sort(function() { return Math.random() - 0.5; })
        .slice(0, SIM_MAX_POR_CORRIDA);
    }

    let exitos = 0;
    elegidas.forEach(function(c) {
      const km  = Math.round((3 + Math.random() * 12) * 10) / 10; // 3.0 a 15.0 km
      const res = registrarActividadTrailPoints(c.email, c.idZapa, km, 'Simulado', null, null);
      if (res && res.success) exitos++;
    });

    Logger.log('simularEntrenamientosFalsos OK: ' + exitos + '/' + elegidas.length +
      ' entrenamientos simulados (de ' + candidatas.length + ' zapatillas candidatas).');
  } catch(e) {
    Logger.log('simularEntrenamientosFalsos ERROR: ' + e.toString());
  }
}

/**
 * Instalador: crear UNA sola vez, a mano, desde el editor de Apps Script
 * (arriba, elegir esta función en el desplegable y apretar "Ejecutar").
 * Deja programada la simulación cada 4 horas y no hace falta tocarlo de
 * nuevo — si ya existe un trigger de simularEntrenamientosFalsos, lo
 * borra primero para no duplicarlo.
 */
function instalarSimulacionEntrenamientos() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(t) {
    if (t.getHandlerFunction() === 'simularEntrenamientosFalsos') {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger('simularEntrenamientosFalsos')
    .timeBased()
    .everyHours(4)
    .create();
}

/**
 * Para cuando llegue el momento de frenar la simulación (antes de la
 * beta abierta) — correr esta función una vez, a mano, desde el editor.
 */
function desinstalarSimulacionEntrenamientos() {
  const triggers = ScriptApp.getProjectTriggers();
  let borrados = 0;
  triggers.forEach(function(t) {
    if (t.getHandlerFunction() === 'simularEntrenamientosFalsos') {
      ScriptApp.deleteTrigger(t);
      borrados++;
    }
  });
  Logger.log('desinstalarSimulacionEntrenamientos: ' + borrados + ' trigger(s) borrado(s).');
}
