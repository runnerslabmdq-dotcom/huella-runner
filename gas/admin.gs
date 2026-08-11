// ============================================================
// HUELLA RUNNER — admin.gs
// Última actualización: 10/08/2026 21:35 (hora Argentina)
// Cambios en esta versión:
//   - BUG real: "Usuarios Totales" del panel admin contaba también la
//     cuenta admin (huellarunner@gmail.com) — getAdminStats() hacía
//     getLastRow()-1 (cuenta filas nomás), sin excluirla. Ahora recorre
//     la hoja Usuarios y descarta los emails de ADMIN_EMAILS (mismo
//     helper _esEmailAdmin() que ya se usa en eliminarCuenta). El
//     fundador notó la diferencia comparando contra sus usuarios reales.
// Cambios en versiones anteriores:
//   - BUG real: sumas de km daban números gigantes (filas viejas con
//     KM_Sumados guardado como Date). Nuevo helper _kmSeguro().
// (Historial completo de versiones anteriores: ver HISTORIAL-CAMBIOS.md
// en la raíz del repo — a partir de ahora este encabezado solo guarda
// los últimos 2 cambios, para no seguir creciendo sin límite.)
// ============================================================

// ⚠️ REEMPLAZAR el doGet() del archivo principal (Code.gs) por este:
//
// function doGet(e) {
//   const page  = e && e.parameter ? e.parameter.page  : '';
//   const token = e && e.parameter ? e.parameter.token : '';
//   if (page === 'admin') {
//     if (!_adminAutorizado(token)) {
//       return HtmlService.createHtmlOutput('<h2 style="font-family:sans-serif;color:#c00;padding:40px">Acceso denegado.</h2>');
//     }
//     return HtmlService.createTemplateFromFile('Admin')
//       .evaluate()
//       .setTitle('Admin — Huella Runner')
//       .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
//       .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
//   }
//   return HtmlService.createTemplateFromFile('Index')
//     .evaluate()
//     .setTitle('Huella Runner')
//     .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
//     .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
// }

// ============================================================
// CONFIGURACIÓN ADMIN
// El token real NO vive en este archivo (este código está en GitHub,
// público) — vive en Propiedades del script de Apps Script, para que
// nadie que solo lea el código en GitHub se entere de la clave real.
// Cómo configurarlo: Apps Script → ⚙️ Configuración del proyecto →
// Propiedades del script → Añadir propiedad → nombre "ADMIN_TOKEN".
// Acceso: ...exec?page=admin&token=TU_CLAVE
// ============================================================

// Emails que son admin automáticamente, sin importar la columna Rol
// del sheet Usuarios. Para sacar a alguien de acá, borrar su email.
const ADMIN_EMAILS = ['huellarunner@gmail.com'];

function _getAdminToken() {
  return PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN') || '';
}

function _adminAutorizado(token) {
  const real = _getAdminToken();
  if (!real) return false; // sin token configurado en Propiedades, nadie entra
  return !!token && token.toString() === real;
}

function _esEmailAdmin(email) {
  const emailClean = (email || '').toString().trim().toLowerCase();
  return ADMIN_EMAILS.indexOf(emailClean) !== -1;
}

// ============================================================
// VERIFICAR TOKEN DESDE EL FRONTEND (llamada AJAX)
// ============================================================
function verificarAdmin(token) {
  return _adminAutorizado(token);
}

// ============================================================
// MÉTRICAS GENERALES
// Retorna: usuariosTotales, activosHoy, zapatillasTotales,
//          zapasArchivadas, kmHoy, kmSemana, notifEnviadas
// ============================================================
function getAdminStats(token) {
  if (!_adminAutorizado(token)) return { success: false, error: 'No autorizado.' };
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);

    // --- Usuarios (sin contar la cuenta admin) ---
    const usersSheet = ss.getSheetByName('Usuarios');
    let usuariosTotales = 0;
    if (usersSheet && usersSheet.getLastRow() > 1) {
      const uData     = usersSheet.getDataRange().getValues();
      const uEmailCol = uData[0].indexOf('Email');
      for (let i = 1; i < uData.length; i++) {
        const email = uEmailCol !== -1 && uData[i][uEmailCol] ? uData[i][uEmailCol].toString().trim().toLowerCase() : '';
        if (email && !_esEmailAdmin(email)) usuariosTotales++;
      }
    }

    // --- Zapatillas ---
    const zapSheet = ss.getSheetByName('Zapatillas');
    let zapatillasTotales = 0;
    let zapasArchivadas   = 0;
    if (zapSheet && zapSheet.getLastRow() > 1) {
      const zapData    = zapSheet.getDataRange().getValues();
      const zapHeaders = zapData[0];
      const estadoCol  = zapHeaders.indexOf('Estado');
      for (let i = 1; i < zapData.length; i++) {
        const estado = estadoCol !== -1 ? zapData[i][estadoCol].toString().trim().toLowerCase() : '';
        if (estado === 'archivada') {
          zapasArchivadas++;
        } else {
          zapatillasTotales++;
        }
      }
    }

    // --- Entrenamientos: activos hoy, km hoy, km semana ---
    const trainSheet = ss.getSheetByName('Entrenamientos');
    let activosHoy  = 0;
    let kmHoy       = 0;
    let kmSemana    = 0;
    let registrosHoy = 0;

    const now    = new Date();
    const hoy    = _formatFecha(now);
    const hace7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const usuariosActivosHoy = new Set();

    if (trainSheet && trainSheet.getLastRow() > 1) {
      const trainData    = trainSheet.getDataRange().getValues();
      const trainHeaders = trainData[0];
      const fechaCol  = trainHeaders.indexOf('Fecha');
      const kmCol     = trainHeaders.indexOf('KM_Sumados');
      const emailCol  = trainHeaders.indexOf('Email_Usuario');
      const estadoCol = trainHeaders.indexOf('Estado_Validacion');

      for (let i = 1; i < trainData.length; i++) {
        const estadoVal = estadoCol !== -1 ? (trainData[i][estadoCol] || '').toString().trim().toLowerCase() : '';
        if (estadoVal === 'rechazada') continue; // intento bloqueado por el anti-fraude, no es actividad real

        const km        = Number(trainData[i][kmCol]) || 0;
        const email     = trainData[i][emailCol] ? trainData[i][emailCol].toString().trim().toLowerCase() : '';
        const fechaDate = _celdaADate(trainData[i][fechaCol]);
        if (!fechaDate) continue;

        if (_mismaFecha(fechaDate, now)) {
          kmHoy += km;
          usuariosActivosHoy.add(email);
          registrosHoy++;
        }
        if (fechaDate >= hace7d) {
          kmSemana += km;
        }
      }
      activosHoy = usuariosActivosHoy.size;
    }

    // --- Notificaciones enviadas ---
    const notifSheet = ss.getSheetByName('Notificaciones');
    const notifEnviadas = notifSheet && notifSheet.getLastRow() > 1
      ? notifSheet.getLastRow() - 1 : 0;

    // --- Nuevos usuarios esta semana ---
    let nuevosEstaSemana = 0;
    // (no tenemos fecha de registro en la sheet, se muestra como dato fijo por ahora)

    return {
      success:           true,
      usuariosTotales:   usuariosTotales,
      zapatillasTotales: zapatillasTotales,
      zapasArchivadas:   zapasArchivadas,
      activosHoy:        activosHoy,
      kmHoy:             Math.round(kmHoy),
      kmSemana:          Math.round(kmSemana),
      notifEnviadas:     notifEnviadas,
      registrosHoy:      registrosHoy
    };
  } catch(e) {
    Logger.log('getAdminStats ERROR: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

// ============================================================
// TABLA COMPLETA DE USUARIOS
// Retorna array con datos de cada usuario + sus km totales
// ============================================================
// FechaNacimiento se guarda como texto "yyyy-mm-dd" (viene de un
// <input type="date">). _celdaADate() la interpretaría con new Date(str),
// que trata las fechas sin hora como UTC — con el huso de Argentina
// (UTC-3) eso corre la fecha un día para atrás. Acá se arma la fecha
// local a mano, componente por componente, para evitar ese corrimiento.
function _parseFechaNacimiento(valor) {
  if (!valor) return null;
  if (Object.prototype.toString.call(valor) === '[object Date]') {
    return isNaN(valor.getTime()) ? null : valor;
  }
  const str = valor.toString().trim();
  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    return isNaN(d.getTime()) ? null : d;
  }
  return _celdaADate(str);
}

// ============================================================
// CUMPLEAÑOS PRÓXIMOS (próximos 7 días, incluye hoy)
// Compara solo mes/día de FechaNacimiento contra hoy — el año de
// nacimiento no importa para esto. Pensado para el segmento
// "Cumpleaños" del panel de notificaciones (descuentos/premios).
// ============================================================
function getCumpleanosProximos(token) {
  if (!_adminAutorizado(token)) return { success: false, error: 'No autorizado.' };
  try {
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('Usuarios');
    if (!sheet || sheet.getLastRow() <= 1) return { success: true, lista: [] };

    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailCol  = headers.indexOf('Email');
    const nomCol    = headers.indexOf('Nombre');
    const apeCol    = headers.indexOf('Apellido');
    const fechaCol  = headers.indexOf('FechaNacimiento');
    if (emailCol === -1 || fechaCol === -1) return { success: true, lista: [] };

    const DIAS_VENTANA = 7;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const lista = [];
    for (let i = 1; i < data.length; i++) {
      const email = data[i][emailCol] ? data[i][emailCol].toString().trim().toLowerCase() : '';
      if (!email) continue;
      const fNac = _parseFechaNacimiento(data[i][fechaCol]);
      if (!fNac) continue;

      // Próximo cumpleaños desde hoy: mismo mes/día, este año o el que viene.
      let proximo = new Date(hoy.getFullYear(), fNac.getMonth(), fNac.getDate());
      if (proximo < hoy) proximo = new Date(hoy.getFullYear() + 1, fNac.getMonth(), fNac.getDate());
      const diasFaltan = Math.round((proximo.getTime() - hoy.getTime()) / 86400000);
      if (diasFaltan > DIAS_VENTANA) continue;

      const nom = nomCol !== -1 ? (data[i][nomCol] || '').toString().trim() : '';
      const ape = apeCol !== -1 ? (data[i][apeCol] || '').toString().trim() : '';
      lista.push({
        email:      email,
        nombre:     (nom + ' ' + ape).trim() || email,
        fecha:      Utilities.formatDate(proximo, TZ_AR, 'dd/MM'),
        diasFaltan: diasFaltan,
        esHoy:      diasFaltan === 0
      });
    }
    lista.sort(function(a, b) { return a.diasFaltan - b.diasFaltan; });
    return { success: true, lista: lista };
  } catch(e) {
    Logger.log('getCumpleanosProximos ERROR: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

function getAdminUsuarios(token) {
  if (!_adminAutorizado(token)) return [];
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);

    const usersSheet = ss.getSheetByName('Usuarios');
    if (!usersSheet || usersSheet.getLastRow() <= 1) return [];

    const usersData    = usersSheet.getDataRange().getValues();
    const usersHeaders = usersData[0];
    const nomCol       = usersHeaders.indexOf('Nombre');
    const apeCol       = usersHeaders.indexOf('Apellido');
    const emailCol     = usersHeaders.indexOf('Email');
    const nivelCol     = usersHeaders.indexOf('Nivel');
    const grupoCol     = usersHeaders.indexOf('Grupo');
    const pisadaCol    = usersHeaders.indexOf('Pisada');
    const provinciaCol = usersHeaders.indexOf('Provincia');
    const fechaRegCol  = usersHeaders.indexOf('Fecha_Registro');

    // Calcular KM totales por email desde Zapatillas
    const zapSheet = ss.getSheetByName('Zapatillas');
    const kmPorEmail = {};
    const zapsPorEmail = {};
    if (zapSheet && zapSheet.getLastRow() > 1) {
      const zapData    = zapSheet.getDataRange().getValues();
      const zapHeaders = zapData[0];
      const zEmailCol  = zapHeaders.indexOf('Email_Usuario');
      const zKmCol     = zapHeaders.indexOf('KM_Actuales');
      const zEstadoCol = zapHeaders.indexOf('Estado');
      for (let i = 1; i < zapData.length; i++) {
        const em     = zapData[i][zEmailCol] ? zapData[i][zEmailCol].toString().trim().toLowerCase() : '';
        const km     = Number(zapData[i][zKmCol]) || 0;
        const estado = zEstadoCol !== -1 ? zapData[i][zEstadoCol].toString().trim().toLowerCase() : '';
        if (!em) continue;
        if (estado !== 'archivada') {
          kmPorEmail[em]   = (kmPorEmail[em]   || 0) + km;
          zapsPorEmail[em] = (zapsPorEmail[em] || 0) + 1;
        }
      }
    }

    // Detectar quién entrenó hoy
    const trainSheet = ss.getSheetByName('Entrenamientos');
    const activosHoy = new Set();
    const ahora = new Date();
    if (trainSheet && trainSheet.getLastRow() > 1) {
      const tData    = trainSheet.getDataRange().getValues();
      const tHeaders = tData[0];
      const tEmailCol  = tHeaders.indexOf('Email_Usuario');
      const tFechaCol  = tHeaders.indexOf('Fecha');
      const tEstadoCol = tHeaders.indexOf('Estado_Validacion');
      for (let i = 1; i < tData.length; i++) {
        const estadoVal = tEstadoCol !== -1 ? (tData[i][tEstadoCol] || '').toString().trim().toLowerCase() : '';
        if (estadoVal === 'rechazada') continue; // intento bloqueado por el anti-fraude, no es actividad real
        const em        = tData[i][tEmailCol] ? tData[i][tEmailCol].toString().trim().toLowerCase() : '';
        const fechaDate = _celdaADate(tData[i][tFechaCol]);
        if (em && fechaDate && _mismaFecha(fechaDate, ahora)) activosHoy.add(em);
      }
    }

    const usuarios = [];
    for (let i = 1; i < usersData.length; i++) {
      const email = emailCol !== -1 ? usersData[i][emailCol].toString().trim().toLowerCase() : '';
      if (!email) continue;
      const fechaRegDate = fechaRegCol !== -1 ? _celdaADate(usersData[i][fechaRegCol]) : null;
      usuarios.push({
        nombre:         nomCol       !== -1 ? usersData[i][nomCol].toString()       : '',
        apellido:       apeCol       !== -1 ? usersData[i][apeCol].toString()       : '',
        email:          email,
        nivel:          nivelCol     !== -1 ? usersData[i][nivelCol].toString()     : '',
        grupo:          grupoCol     !== -1 ? usersData[i][grupoCol].toString()     : '',
        pisada:         pisadaCol    !== -1 ? usersData[i][pisadaCol].toString()    : '',
        provincia:      provinciaCol !== -1 ? usersData[i][provinciaCol].toString() : '',
        fechaRegistro:  fechaRegDate ? Utilities.formatDate(fechaRegDate, TZ_AR, 'dd/MM/yyyy HH:mm') : '',
        fechaRegistroTs: fechaRegDate ? fechaRegDate.getTime() : 0,
        kmTotales: Math.round(kmPorEmail[email]   || 0),
        zapatillas: zapsPorEmail[email] || 0,
        activoHoy: activosHoy.has(email)
      });
    }
    return usuarios;
  } catch(e) {
    Logger.log('getAdminUsuarios ERROR: ' + e.toString());
    return [];
  }
}

// ============================================================
// RANKING DE USUARIOS POR KM TOTALES
// ============================================================
function getRankingUsuarios(token) {
  if (!_adminAutorizado(token)) return [];
  try {
    const usuarios = getAdminUsuarios(token);
    return usuarios
      .sort(function(a, b) { return b.kmTotales - a.kmTotales; })
      .slice(0, 10);
  } catch(e) {
    Logger.log('getRankingUsuarios ERROR: ' + e.toString());
    return [];
  }
}

// ============================================================
// ACTIVIDAD RECIENTE (últimos 5 eventos combinados)
// Tipo: 'entrenamiento' | 'registro'
// ============================================================
function getActividadReciente(token) {
  if (!_adminAutorizado(token)) return [];
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const eventos = [];

    // --- Mapa email → nombre completo (hoja Usuarios) ---
    const nameMap = {};
    const usersSheet = ss.getSheetByName('Usuarios');
    if (usersSheet && usersSheet.getLastRow() > 1) {
      const uData    = usersSheet.getDataRange().getValues();
      const uHeaders = uData[0];
      const uEmail   = uHeaders.indexOf('Email');
      const uNombre  = uHeaders.indexOf('Nombre');
      const uApell   = uHeaders.indexOf('Apellido');
      for (let i = 1; i < uData.length; i++) {
        const em = uData[i][uEmail] ? uData[i][uEmail].toString().trim().toLowerCase() : '';
        if (em) {
          const nom = uNombre !== -1 ? uData[i][uNombre].toString().trim() : '';
          const ape = uApell  !== -1 ? uData[i][uApell].toString().trim()  : '';
          nameMap[em] = (nom + ' ' + ape).trim() || em;
        }
      }
    }

    // --- Mapa ID_Zapa → "Marca Modelo" (hoja Zapatillas) ---
    const zapaMap = {};
    const zapSheet = ss.getSheetByName('Zapatillas');
    if (zapSheet && zapSheet.getLastRow() > 1) {
      const zData    = zapSheet.getDataRange().getValues();
      const zHeaders = zData[0];
      const zId      = zHeaders.indexOf('ID_Zapa');
      const zMarca   = zHeaders.indexOf('Marca');
      const zModelo  = zHeaders.indexOf('Modelo');
      for (let i = 1; i < zData.length; i++) {
        const id = zId !== -1 && zData[i][zId] ? zData[i][zId].toString() : '';
        if (id) {
          const marca  = zMarca  !== -1 ? (zData[i][zMarca]  || '').toString().trim() : '';
          const modelo = zModelo !== -1 ? (zData[i][zModelo] || '').toString().trim() : '';
          zapaMap[id] = (marca + ' ' + modelo).trim();
        }
      }
    }

    // --- Entrenamientos recientes ---
    const trainSheet = ss.getSheetByName('Entrenamientos');
    if (trainSheet && trainSheet.getLastRow() > 1) {
      const tData    = trainSheet.getDataRange().getValues();
      const tHeaders = tData[0];
      const tEmailCol  = tHeaders.indexOf('Email_Usuario');
      const tKmCol     = tHeaders.indexOf('KM_Sumados');
      const tFechaCol  = tHeaders.indexOf('Fecha');
      const tHoraCol   = tHeaders.indexOf('Hora');
      const tZapaCol   = tHeaders.indexOf('ID_Zapa');
      const tEstadoCol = tHeaders.indexOf('Estado_Validacion');

      // Tomar los últimos 20 registros (están ordenados cronológicamente)
      const desde = Math.max(1, tData.length - 20);
      for (let i = tData.length - 1; i >= desde; i--) {
        const estadoVal = tEstadoCol !== -1 ? (tData[i][tEstadoCol] || '').toString().trim().toLowerCase() : '';
        if (estadoVal === 'rechazada') continue; // intento bloqueado por el anti-fraude, no es actividad real

        const email = tData[i][tEmailCol] ? tData[i][tEmailCol].toString().trim().toLowerCase() : '';
        const km    = _kmSeguro(tData[i][tKmCol]);
        const idZapa = tZapaCol !== -1 && tData[i][tZapaCol] ? tData[i][tZapaCol].toString() : '';
        const horaRaw   = tHoraCol !== -1 ? tData[i][tHoraCol] : '';
        const fechaDate = _combinarFechaHora(tData[i][tFechaCol], horaRaw);
        const fechaStr  = fechaDate ? _formatFechaHora(fechaDate) : '';
        if (email) {
          eventos.push({
            tipo:      'entrenamiento',
            email:     email,
            nombre:    nameMap[email] || email,
            zapatilla: zapaMap[idZapa] || '',
            km:        km,
            fecha:     fechaStr,
            ts:        fechaDate
          });
        }
      }
    }

    // Ordenar por fecha descendente y devolver los 5 más recientes
    eventos.sort(function(a, b) {
      const ta = a.ts ? a.ts.getTime() : 0;
      const tb = b.ts ? b.ts.getTime() : 0;
      return tb - ta;
    });

    return eventos.slice(0, 5).map(function(ev) {
      return {
        tipo:      ev.tipo,
        email:     ev.email,
        nombre:    ev.nombre,
        zapatilla: ev.zapatilla,
        km:        ev.km,
        fecha:     ev.fecha
      };
    });
  } catch(e) {
    Logger.log('getActividadReciente ERROR: ' + e.toString());
    return [];
  }
}

// ============================================================
// ENTRENAMIENTOS SOSPECHOSOS — el anti-fraude los marca "Sospechosa"
// cuando el acumulado semanal de la persona supera el máximo (180 km),
// pero a diferencia de "Rechazada" SÍ se acreditan — quedan marcados
// "para revisión" (ver trail-points.gs), pero hasta esta versión esa
// revisión no existía en ningún lado del panel: la marca quedaba en el
// Sheet y nadie se enteraba. Devuelve los últimos 20, más reciente
// primero, para que el fundador los pueda mirar a mano.
// ============================================================
function getEntrenamientosSospechosos(token) {
  if (!_adminAutorizado(token)) return [];
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);

    // --- Mapa email → nombre completo (hoja Usuarios) ---
    const nameMap = {};
    const usersSheet = ss.getSheetByName('Usuarios');
    if (usersSheet && usersSheet.getLastRow() > 1) {
      const uData    = usersSheet.getDataRange().getValues();
      const uHeaders = uData[0];
      const uEmail   = uHeaders.indexOf('Email');
      const uNombre  = uHeaders.indexOf('Nombre');
      const uApell   = uHeaders.indexOf('Apellido');
      for (let i = 1; i < uData.length; i++) {
        const em = uData[i][uEmail] ? uData[i][uEmail].toString().trim().toLowerCase() : '';
        if (em) {
          const nom = uNombre !== -1 ? uData[i][uNombre].toString().trim() : '';
          const ape = uApell  !== -1 ? uData[i][uApell].toString().trim()  : '';
          nameMap[em] = (nom + ' ' + ape).trim() || em;
        }
      }
    }

    // --- Mapa ID_Zapa → "Marca Modelo" (hoja Zapatillas) ---
    const zapaMap = {};
    const zapSheet = ss.getSheetByName('Zapatillas');
    if (zapSheet && zapSheet.getLastRow() > 1) {
      const zData    = zapSheet.getDataRange().getValues();
      const zHeaders = zData[0];
      const zId      = zHeaders.indexOf('ID_Zapa');
      const zMarca   = zHeaders.indexOf('Marca');
      const zModelo  = zHeaders.indexOf('Modelo');
      for (let i = 1; i < zData.length; i++) {
        const id = zId !== -1 && zData[i][zId] ? zData[i][zId].toString() : '';
        if (id) {
          const marca  = zMarca  !== -1 ? (zData[i][zMarca]  || '').toString().trim() : '';
          const modelo = zModelo !== -1 ? (zData[i][zModelo] || '').toString().trim() : '';
          zapaMap[id] = (marca + ' ' + modelo).trim();
        }
      }
    }

    const trainSheet = ss.getSheetByName('Entrenamientos');
    const sospechosos = [];
    if (trainSheet && trainSheet.getLastRow() > 1) {
      const tData    = trainSheet.getDataRange().getValues();
      const tHeaders = tData[0];
      const tEmailCol  = tHeaders.indexOf('Email_Usuario');
      const tKmCol     = tHeaders.indexOf('KM_Brutos');
      const tFechaCol  = tHeaders.indexOf('Fecha');
      const tZapaCol   = tHeaders.indexOf('ID_Zapa');
      const tEstadoCol = tHeaders.indexOf('Estado_Validacion');
      const tMotivoCol = tHeaders.indexOf('Motivo_Rechazo');

      for (let i = tData.length - 1; i >= 1 && sospechosos.length < 20; i--) {
        const estado = tEstadoCol !== -1 ? (tData[i][tEstadoCol] || '').toString().trim().toLowerCase() : '';
        if (estado !== 'sospechosa') continue;

        const email  = tEmailCol !== -1 && tData[i][tEmailCol] ? tData[i][tEmailCol].toString().trim().toLowerCase() : '';
        const idZapa = tZapaCol  !== -1 && tData[i][tZapaCol]  ? tData[i][tZapaCol].toString()  : '';
        const fechaDate = tFechaCol !== -1 ? _celdaADate(tData[i][tFechaCol]) : null;

        sospechosos.push({
          email:     email,
          nombre:    nameMap[email] || email,
          zapatilla: zapaMap[idZapa] || '',
          km:        tKmCol !== -1 ? _kmSeguro(tData[i][tKmCol]) : 0,
          fecha:     fechaDate ? _formatFecha(fechaDate) : '',
          motivo:    tMotivoCol !== -1 ? (tData[i][tMotivoCol] || '').toString() : ''
        });
      }
    }

    return sospechosos;
  } catch(e) {
    Logger.log('getEntrenamientosSospechosos ERROR: ' + e.toString());
    return [];
  }
}

// ============================================================
// ACTIVIDAD POR DÍA — últimos 7 días para el gráfico de barras
// Retorna array de 7 objetos: { dia, label, cantidad, km }
// ============================================================
function getActividadPorDia(token) {
  if (!_adminAutorizado(token)) return [];
  try {
    const ss         = SpreadsheetApp.openById(SHEET_ID);
    const trainSheet = ss.getSheetByName('Entrenamientos');
    const dias = [];

    const now = new Date();
    for (let d = 6; d >= 0; d--) {
      const fecha = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
      dias.push({
        key:      _formatFecha(fecha),
        dateObj:  fecha,
        label:    _labelDia(fecha),
        cantidad: 0,
        km:       0,
        usuarios: new Set()
      });
    }

    if (trainSheet && trainSheet.getLastRow() > 1) {
      const tData    = trainSheet.getDataRange().getValues();
      const tHeaders = tData[0];
      const tEmailCol  = tHeaders.indexOf('Email_Usuario');
      const tKmCol     = tHeaders.indexOf('KM_Sumados');
      const tFechaCol  = tHeaders.indexOf('Fecha');
      const tEstadoCol = tHeaders.indexOf('Estado_Validacion');

      for (let i = 1; i < tData.length; i++) {
        const estadoVal = tEstadoCol !== -1 ? (tData[i][tEstadoCol] || '').toString().trim().toLowerCase() : '';
        if (estadoVal === 'rechazada') continue; // intento bloqueado por el anti-fraude, no es actividad real

        const email     = tData[i][tEmailCol] ? tData[i][tEmailCol].toString().trim().toLowerCase() : '';
        const km        = _kmSeguro(tData[i][tKmCol]);
        const fechaDate = _celdaADate(tData[i][tFechaCol]);
        if (!fechaDate) continue;

        const diaObj = dias.find(function(d) { return _mismaFecha(d.dateObj, fechaDate); });
        if (diaObj) {
          diaObj.cantidad++;
          diaObj.km += km;
          diaObj.usuarios.add(email);
        }
      }
    }

    return dias.map(function(d) {
      return {
        label:    d.label,
        cantidad: d.cantidad,
        km:       Math.round(d.km),
        usuarios: d.usuarios.size
      };
    });
  } catch(e) {
    Logger.log('getActividadPorDia ERROR: ' + e.toString());
    return [];
  }
}

// ============================================================
// SALUD DEL SISTEMA — cupones emitidos + última corrida del cron
// nocturno de Cache_Modelos (social-proof.gs). Pensado para que el
// fundador se entere de un problema (ej. el cron dejó de correr) antes
// que un usuario.
// ============================================================
function getSystemHealth(token) {
  if (!_adminAutorizado(token)) return { success: false, error: 'No autorizado.' };
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);

    let cuponesTotal = 0, cuponesDisponibles = 0, cuponesUsados = 0;
    const cSheet = ss.getSheetByName('Cupones_Emitidos');
    if (cSheet && cSheet.getLastRow() > 1) {
      const cData    = cSheet.getDataRange().getValues();
      const cHeaders = cData[0];
      const estadoCol = cHeaders.indexOf('Estado');
      cuponesTotal = cData.length - 1;
      for (let i = 1; i < cData.length; i++) {
        const estado = estadoCol !== -1 ? (cData[i][estadoCol] || '').toString().trim().toLowerCase() : '';
        if (estado === 'disponible') cuponesDisponibles++;
        else if (estado === 'usado') cuponesUsados++;
      }
    }

    let ultimaCorridaCache = 'Nunca corrió';
    const ultimaCorridaRaw = PropertiesService.getScriptProperties().getProperty('CACHE_MODELOS_ULTIMA_CORRIDA');
    if (ultimaCorridaRaw) {
      const d = new Date(ultimaCorridaRaw);
      if (!isNaN(d.getTime())) {
        ultimaCorridaCache = Utilities.formatDate(d, TZ_AR, 'dd/MM/yyyy HH:mm');
      }
    }

    return {
      success: true,
      cuponesTotal: cuponesTotal,
      cuponesDisponibles: cuponesDisponibles,
      cuponesUsados: cuponesUsados,
      ultimaCorridaCache: ultimaCorridaCache
    };
  } catch(e) {
    Logger.log('getSystemHealth ERROR: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

// ============================================================
// INSIGHTS EXTENDIDOS — constancia, horario pico real, tendencia
// semanal/mensual con comparación, abandono real (no solo "hoy") y
// tasa de lectura de notificaciones. Todo en una sola función para no
// multiplicar idas y vueltas al Sheet.
// ============================================================
function getInsightsExtendidos(token) {
  if (!_adminAutorizado(token)) return { success: false, error: 'No autorizado.' };
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);

    // --- Mapa email → nombre/grupo (Usuarios) ---
    const nameMap = {};
    const usersSheet = ss.getSheetByName('Usuarios');
    let totalUsuarios = 0;
    if (usersSheet && usersSheet.getLastRow() > 1) {
      const uData    = usersSheet.getDataRange().getValues();
      const uHeaders = uData[0];
      const uEmail   = uHeaders.indexOf('Email');
      const uNombre  = uHeaders.indexOf('Nombre');
      const uApell   = uHeaders.indexOf('Apellido');
      const uGrupo   = uHeaders.indexOf('Grupo');
      totalUsuarios  = uData.length - 1;
      for (let i = 1; i < uData.length; i++) {
        const em = uEmail !== -1 && uData[i][uEmail] ? uData[i][uEmail].toString().trim().toLowerCase() : '';
        if (!em) continue;
        const nom = uNombre !== -1 ? (uData[i][uNombre] || '').toString().trim() : '';
        const ape = uApell  !== -1 ? (uData[i][uApell]  || '').toString().trim() : '';
        const grp = uGrupo  !== -1 ? (uData[i][uGrupo]  || '').toString().trim() : '';
        nameMap[em] = { nombre: (nom + ' ' + ape).trim() || em, grupo: grp };
      }
    }

    // --- Un solo recorrido de Entrenamientos para todo lo demás ---
    const trainSheet    = ss.getSheetByName('Entrenamientos');
    const franjas       = { manana: 0, tarde: 0, noche: 0 };
    let franjasTotal     = 0;
    const diasPorUsuario = {}; // email -> Set "dd/mm/yyyy" (constancia, ventana 30 días)
    const ultimaActividad = {}; // email -> Date más reciente
    const semanaMap      = {}; // key "dd/mm/yyyy" (lunes) -> {km, runners:Set}
    const mesMap         = {}; // key "yyyy-mm" -> {km}

    const ahora  = new Date();
    const hace30 = new Date(ahora.getTime() - 30 * 86400000);

    if (trainSheet && trainSheet.getLastRow() > 1) {
      const tData    = trainSheet.getDataRange().getValues();
      const tHeaders = tData[0];
      const tEmail   = tHeaders.indexOf('Email_Usuario');
      const tKm      = tHeaders.indexOf('KM_Sumados');
      const tFecha   = tHeaders.indexOf('Fecha');
      const tHora    = tHeaders.indexOf('Hora');
      const tEstado  = tHeaders.indexOf('Estado_Validacion');

      for (let i = 1; i < tData.length; i++) {
        const estado = tEstado !== -1 ? (tData[i][tEstado] || '').toString().trim().toLowerCase() : '';
        if (estado === 'rechazada') continue; // no acreditó km, no cuenta como actividad real

        const email = tEmail !== -1 && tData[i][tEmail] ? tData[i][tEmail].toString().trim().toLowerCase() : '';
        const km    = tKm !== -1 ? _kmSeguro(tData[i][tKm]) : 0;
        const horaRawVal = tHora !== -1 ? tData[i][tHora] : '';
        const fechaDate  = tFecha !== -1 ? _combinarFechaHora(tData[i][tFecha], horaRawVal) : null;
        if (!email || !fechaDate) continue;

        if (!ultimaActividad[email] || fechaDate > ultimaActividad[email]) {
          ultimaActividad[email] = fechaDate;
        }

        if (fechaDate >= hace30) {
          if (!diasPorUsuario[email]) diasPorUsuario[email] = new Set();
          diasPorUsuario[email].add(_formatFecha(fechaDate));
        }

        const horaStr = tHora !== -1 ? (tData[i][tHora] || '').toString().trim() : '';
        if (horaStr) {
          const horaNum = parseInt(horaStr.split(':')[0], 10);
          if (!isNaN(horaNum)) {
            franjasTotal++;
            if (horaNum >= 6 && horaNum < 12) franjas.manana++;
            else if (horaNum >= 12 && horaNum < 19) franjas.tarde++;
            else franjas.noche++;
          }
        }

        const lunes  = _lunesDeSemana(fechaDate);
        const semKey = _formatFecha(lunes);
        if (!semanaMap[semKey]) semanaMap[semKey] = { km: 0, runners: new Set() };
        semanaMap[semKey].km += km;
        semanaMap[semKey].runners.add(email);

        const mesKey = fechaDate.getFullYear() + '-' + String(fechaDate.getMonth() + 1).padStart(2, '0');
        if (!mesMap[mesKey]) mesMap[mesKey] = { km: 0 };
        mesMap[mesKey].km += km;
      }
    }

    // --- Ranking de constancia: días distintos con actividad en los últimos 30 días ---
    const rankingConstancia = Object.keys(diasPorUsuario).map(function(email) {
      const info = nameMap[email] || { nombre: email, grupo: '' };
      return { email: email, nombre: info.nombre, grupo: info.grupo, diasActivos: diasPorUsuario[email].size };
    }).sort(function(a, b) { return b.diasActivos - a.diasActivos; }).slice(0, 10);

    // --- Horario pico, en % sobre los entrenamientos que tienen hora guardada ---
    const horarioPico = {
      manana: franjasTotal > 0 ? Math.round(franjas.manana / franjasTotal * 100) : 0,
      tarde:  franjasTotal > 0 ? Math.round(franjas.tarde  / franjasTotal * 100) : 0,
      noche:  franjasTotal > 0 ? Math.round(franjas.noche  / franjasTotal * 100) : 0,
      totalRegistros: franjasTotal
    };

    // --- Tendencia semanal: últimas 8 semanas (lunes a domingo) + semana actual vs anterior ---
    const lunesActual = _lunesDeSemana(ahora);
    const semanas = [];
    for (let s = 7; s >= 0; s--) {
      const inicio = new Date(lunesActual.getTime() - s * 7 * 86400000);
      const fin    = new Date(inicio.getTime() + 6 * 86400000);
      const info   = semanaMap[_formatFecha(inicio)];
      semanas.push({
        label:   _formatFecha(inicio).slice(0, 5) + '-' + _formatFecha(fin).slice(0, 5),
        km:      info ? Math.round(info.km) : 0,
        runners: info ? info.runners.size : 0
      });
    }
    const semanaActualKm   = semanas[semanas.length - 1].km;
    const semanaAnteriorKm = semanas.length > 1 ? semanas[semanas.length - 2].km : 0;

    // --- Tendencia mensual: últimos 6 meses ---
    const NOMBRES_MES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const meses = [];
    for (let m = 5; m >= 0; m--) {
      const d    = new Date(ahora.getFullYear(), ahora.getMonth() - m, 1);
      const key  = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      const info = mesMap[key];
      meses.push({ label: NOMBRES_MES[d.getMonth()], km: info ? Math.round(info.km) : 0 });
    }

    // --- Abandono real: activos7/30 + lista de quién no entrena hace 14+ días (o nunca) ---
    let activos7 = 0, activos30 = 0;
    const listaInactivos = [];
    for (const email in nameMap) {
      const ultima = ultimaActividad[email];
      const diasSinEntrenar = ultima ? Math.floor((ahora.getTime() - ultima.getTime()) / 86400000) : null;
      if (ultima) {
        if (diasSinEntrenar <= 7)  activos7++;
        if (diasSinEntrenar <= 30) activos30++;
      }
      if (diasSinEntrenar === null || diasSinEntrenar >= 14) {
        listaInactivos.push({
          email: email,
          nombre: nameMap[email].nombre,
          grupo:  nameMap[email].grupo,
          diasSinEntrenar: diasSinEntrenar // null = nunca cargó un entrenamiento
        });
      }
    }
    listaInactivos.sort(function(a, b) {
      if (a.diasSinEntrenar === null) return -1;
      if (b.diasSinEntrenar === null) return 1;
      return b.diasSinEntrenar - a.diasSinEntrenar;
    });

    // --- Tasa de lectura de notificaciones (sin contar las que el usuario borró) ---
    let notifEnviadas = 0, notifLeidas = 0;
    const notifSheet = ss.getSheetByName('Notificaciones');
    if (notifSheet && notifSheet.getLastRow() > 1) {
      const nData    = notifSheet.getDataRange().getValues();
      const nHeaders = nData[0];
      const nLeido   = nHeaders.indexOf('Leido');
      const nOculto  = nHeaders.indexOf('Oculto');
      for (let i = 1; i < nData.length; i++) {
        const oculto = nOculto !== -1 ? (nData[i][nOculto] || '').toString().trim().toUpperCase() === 'TRUE' : false;
        if (oculto) continue;
        notifEnviadas++;
        const leido = nLeido !== -1 ? (nData[i][nLeido] || '').toString().trim().toUpperCase() === 'TRUE' : false;
        if (leido) notifLeidas++;
      }
    }

    return {
      success: true,
      rankingConstancia: rankingConstancia,
      horarioPico: horarioPico,
      tendenciaSemanas: semanas,
      semanaActualKm: semanaActualKm,
      semanaAnteriorKm: semanaAnteriorKm,
      tendenciaMeses: meses,
      abandono: {
        activos7:  activos7,
        activos30: activos30,
        total:     totalUsuarios,
        lista:       listaInactivos.slice(0, 10), // para mostrar en pantalla
        todosEmails: listaInactivos.map(function(u) { return u.email; }) // para notificar al segmento completo
      },
      notifLectura: {
        enviadas: notifEnviadas,
        leidas:   notifLeidas,
        pct:      notifEnviadas > 0 ? Math.round(notifLeidas / notifEnviadas * 100) : 0
      }
    };
  } catch(e) {
    Logger.log('getInsightsExtendidos ERROR: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

// ============================================================
// HISTORIAL COMPLETO DE MENSAJES ENVIADOS
// El registro en la hoja Notificaciones nunca se borra, aunque el
// usuario oculte la notificación de su lado (deleteNotificacion() solo
// marca "Oculto" = TRUE) — esto le da al panel una vista de qué se
// dijo, a quién, y si lo llegó a leer u ocultar.
// ============================================================
function getHistorialNotificaciones(token) {
  if (!_adminAutorizado(token)) return { success: false, error: 'No autorizado.' };
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('Notificaciones');
    if (!sheet || sheet.getLastRow() <= 1) return { success: true, historial: [] };

    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailCol  = headers.indexOf('Email_Usuario');
    const msgCol    = headers.indexOf('Mensaje');
    const fechaCol  = headers.indexOf('Fecha');
    const leidoCol  = headers.indexOf('Leido');
    const ocultoCol = headers.indexOf('Oculto');

    let historial = [];
    for (let i = 1; i < data.length; i++) {
      historial.push({
        email:   emailCol  !== -1 ? data[i][emailCol].toString()  : '',
        mensaje: msgCol    !== -1 ? data[i][msgCol].toString()    : '',
        fecha:   fechaCol  !== -1 ? data[i][fechaCol].toString()  : '',
        leido:   leidoCol  !== -1 ? (data[i][leidoCol]  || '').toString().toUpperCase() === 'TRUE' : false,
        oculto:  ocultoCol !== -1 ? (data[i][ocultoCol] || '').toString().toUpperCase() === 'TRUE' : false
      });
    }

    historial.reverse(); // más reciente primero
    return { success: true, historial: historial.slice(0, 300) };
  } catch(e) {
    Logger.log('getHistorialNotificaciones ERROR: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

// Lunes de la semana calendario a la que pertenece 'date' (hora en 0:00)
function _lunesDeSemana(date) {
  const d   = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dow = d.getDay(); // 0=domingo, 1=lunes, ...
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  return d;
}

// ============================================================
// HELPERS INTERNOS
// ============================================================
function _formatFecha(date) {
  const dd   = String(date.getDate()).padStart(2, '0');
  const mm   = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return dd + '/' + mm + '/' + yyyy;
}

// dd/mm/yyyy hh:mm — formato que espera el front para mostrar la hora
function _formatFechaHora(date) {
  const dd   = String(date.getDate()).padStart(2, '0');
  const mm   = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const hh   = String(date.getHours()).padStart(2, '0');
  const min  = String(date.getMinutes()).padStart(2, '0');
  return dd + '/' + mm + '/' + yyyy + ' ' + hh + ':' + min;
}

// ------------------------------------------------------------
// _kmSeguro: convierte el valor crudo de una celda de km a número,
// blindado contra el caso en que Sheets guardó la celda como Date en
// vez de número (pasa con filas viejas/datos de prueba corruptos).
// Number(unDate) devuelve los milisegundos desde 1970 — un número de
// 13 dígitos que arruinaba las sumas de km (números gigantes tipo
// "3575340000000 km" en "Últimas 8 semanas" / "Últimos 6 meses" del
// panel admin, todos de fechas antes del lanzamiento real).
// ------------------------------------------------------------
function _kmSeguro(valor) {
  if (Object.prototype.toString.call(valor) === '[object Date]') return 0;
  return Number(valor) || 0;
}

// ------------------------------------------------------------
// _celdaADate: convierte el valor crudo de una celda Fecha a Date.
// Maneja los 3 casos que Google Sheets puede devolver:
//   1) Objeto Date nativo (cuando Sheets interpreta la celda como fecha)
//   2) String "dd/mm/yyyy" o "dd/mm/yyyy hh:mm" (formato que escribe la app)
//   3) String ISO u otro parseable por Date()
// Devuelve un Date o null si no se puede interpretar.
// ------------------------------------------------------------
function _celdaADate(valor) {
  if (!valor && valor !== 0) return null;

  // Caso 1: ya es un Date de Sheets
  if (Object.prototype.toString.call(valor) === '[object Date]') {
    return isNaN(valor.getTime()) ? null : valor;
  }

  const str = valor.toString().trim();
  if (!str) return null;

  // Caso 2: "dd/mm/yyyy" o "dd/mm/yyyy hh:mm"
  if (str.indexOf('/') !== -1) {
    const parts     = str.split(' ');
    const dateParts = parts[0].split('/');
    if (dateParts.length === 3) {
      const timeParts = parts[1] ? parts[1].split(':') : ['0', '0'];
      const d = new Date(
        parseInt(dateParts[2], 10),
        parseInt(dateParts[1], 10) - 1,
        parseInt(dateParts[0], 10),
        parseInt(timeParts[0], 10) || 0,
        parseInt(timeParts[1], 10) || 0
      );
      return isNaN(d.getTime()) ? null : d;
    }
  }

  // Caso 3: ISO u otro formato que Date() entienda
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

// ------------------------------------------------------------
// _combinarFechaHora: en la hoja Entrenamientos, "Fecha" y "Hora" son
// DOS columnas separadas. Si solo se usa _celdaADate(Fecha), la hora
// queda en 00:00 (medianoche) — eso hacía que "Actividad Reciente"
// mostrara "hace 16h" para algo cargado a las 16:15, porque calculaba
// el tiempo transcurrido desde la medianoche, no desde el momento real.
// Esta función arma el Date correcto combinando las dos columnas.
// ------------------------------------------------------------
function _combinarFechaHora(fechaRaw, horaRaw) {
  const base = _celdaADate(fechaRaw);
  if (!base) return null;

  // La celda Hora puede venir como texto "HH:mm" o, si Sheets la detectó
  // sola como un valor de hora, como un objeto Date (fecha en 1899, hora
  // real en getHours()/getMinutes()) — mismo caso ya contemplado en
  // getShoeHistory() (codigo.gs). Sin este chequeo, horaRaw.toString()
  // devuelve un texto largo tipo fecha completa y el split(':') falla en
  // silencio, dejando la hora en medianoche (síntoma: "hace 12h" en algo
  // recién cargado al mediodía).
  let h, m;
  if (Object.prototype.toString.call(horaRaw) === '[object Date]') {
    if (isNaN(horaRaw.getTime())) return base;
    h = horaRaw.getHours();
    m = horaRaw.getMinutes();
  } else {
    const horaStr = (horaRaw || '').toString().trim();
    if (!horaStr) return base; // sin columna Hora: se mantiene medianoche (mejor que nada)
    const partes = horaStr.split(':');
    h = parseInt(partes[0], 10);
    m = parseInt(partes[1], 10);
  }
  if (isNaN(h) || isNaN(m)) return base;
  return new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, m);
}

// ------------------------------------------------------------
// _mismaFecha: ¿dos Date caen en el mismo día calendario?
// ------------------------------------------------------------
function _mismaFecha(a, b) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear()
      && a.getMonth()    === b.getMonth()
      && a.getDate()     === b.getDate();
}

// Compatibilidad: _parseFecha ahora delega en _celdaADate (más robusto)
function _parseFecha(str) {
  return _celdaADate(str);
}

function _labelDia(date) {
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const now  = new Date();
  const diffDias = Math.round((now.setHours(0,0,0,0) - date.setHours(0,0,0,0)) / 86400000);
  if (diffDias === 0) return 'Hoy';
  if (diffDias === 1) return 'Ayer';
  return dias[new Date(date).getDay()];
}
