// ============================================================
// HUELLA RUNNER — admin.gs
// Última actualización: 14/07/2026 12:25 (hora Argentina)
// Cambios en esta versión:
//   - Agregado ADMIN_EMAILS: huellarunner@gmail.com ahora es admin
//     automáticamente (sin depender de la columna Rol del sheet)
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
// Cambiá ADMIN_TOKEN por una clave secreta tuya
// Acceso: ...exec?page=admin&token=TU_CLAVE
// ============================================================
const ADMIN_TOKEN = 'huella-admin-2024';

// Emails que son admin automáticamente, sin importar la columna Rol
// del sheet Usuarios. Para sacar a alguien de acá, borrar su email.
const ADMIN_EMAILS = ['huellarunner@gmail.com'];

function _adminAutorizado(token) {
  return token && token.toString() === ADMIN_TOKEN;
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
function getAdminStats() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);

    // --- Usuarios ---
    const usersSheet = ss.getSheetByName('Usuarios');
    const usuariosTotales = usersSheet && usersSheet.getLastRow() > 1
      ? usersSheet.getLastRow() - 1 : 0;

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

      for (let i = 1; i < trainData.length; i++) {
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
function getAdminUsuarios() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);

    const usersSheet = ss.getSheetByName('Usuarios');
    if (!usersSheet || usersSheet.getLastRow() <= 1) return [];

    const usersData    = usersSheet.getDataRange().getValues();
    const usersHeaders = usersData[0];
    const nomCol    = usersHeaders.indexOf('Nombre');
    const apeCol    = usersHeaders.indexOf('Apellido');
    const emailCol  = usersHeaders.indexOf('Email');
    const nivelCol  = usersHeaders.indexOf('Nivel');
    const grupoCol  = usersHeaders.indexOf('Grupo');
    const pisadaCol = usersHeaders.indexOf('Pisada');

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
      const tEmailCol = tHeaders.indexOf('Email_Usuario');
      const tFechaCol = tHeaders.indexOf('Fecha');
      for (let i = 1; i < tData.length; i++) {
        const em        = tData[i][tEmailCol] ? tData[i][tEmailCol].toString().trim().toLowerCase() : '';
        const fechaDate = _celdaADate(tData[i][tFechaCol]);
        if (em && fechaDate && _mismaFecha(fechaDate, ahora)) activosHoy.add(em);
      }
    }

    const usuarios = [];
    for (let i = 1; i < usersData.length; i++) {
      const email = emailCol !== -1 ? usersData[i][emailCol].toString().trim().toLowerCase() : '';
      if (!email) continue;
      usuarios.push({
        nombre:    nomCol    !== -1 ? usersData[i][nomCol].toString()    : '',
        apellido:  apeCol    !== -1 ? usersData[i][apeCol].toString()    : '',
        email:     email,
        nivel:     nivelCol  !== -1 ? usersData[i][nivelCol].toString()  : '',
        grupo:     grupoCol  !== -1 ? usersData[i][grupoCol].toString()  : '',
        pisada:    pisadaCol !== -1 ? usersData[i][pisadaCol].toString() : '',
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
function getRankingUsuarios() {
  try {
    const usuarios = getAdminUsuarios();
    return usuarios
      .sort(function(a, b) { return b.kmTotales - a.kmTotales; })
      .slice(0, 10);
  } catch(e) {
    Logger.log('getRankingUsuarios ERROR: ' + e.toString());
    return [];
  }
}

// ============================================================
// ACTIVIDAD RECIENTE (últimos 10 eventos combinados)
// Tipo: 'entrenamiento' | 'registro'
// ============================================================
function getActividadReciente() {
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
      const tEmailCol = tHeaders.indexOf('Email_Usuario');
      const tKmCol    = tHeaders.indexOf('KM_Sumados');
      const tFechaCol = tHeaders.indexOf('Fecha');
      const tZapaCol  = tHeaders.indexOf('ID_Zapa');

      // Tomar los últimos 20 registros (están ordenados cronológicamente)
      const desde = Math.max(1, tData.length - 20);
      for (let i = tData.length - 1; i >= desde; i--) {
        const email = tData[i][tEmailCol] ? tData[i][tEmailCol].toString().trim().toLowerCase() : '';
        const km    = Number(tData[i][tKmCol]) || 0;
        const idZapa = tZapaCol !== -1 && tData[i][tZapaCol] ? tData[i][tZapaCol].toString() : '';
        const fechaDate = _celdaADate(tData[i][tFechaCol]);
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

    // Ordenar por fecha descendente y devolver los 10 más recientes
    eventos.sort(function(a, b) {
      const ta = a.ts ? a.ts.getTime() : 0;
      const tb = b.ts ? b.ts.getTime() : 0;
      return tb - ta;
    });

    return eventos.slice(0, 10).map(function(ev) {
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
// ACTIVIDAD POR DÍA — últimos 7 días para el gráfico de barras
// Retorna array de 7 objetos: { dia, label, cantidad, km }
// ============================================================
function getActividadPorDia() {
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
      const tEmailCol = tHeaders.indexOf('Email_Usuario');
      const tKmCol    = tHeaders.indexOf('KM_Sumados');
      const tFechaCol = tHeaders.indexOf('Fecha');

      for (let i = 1; i < tData.length; i++) {
        const email     = tData[i][tEmailCol] ? tData[i][tEmailCol].toString().trim().toLowerCase() : '';
        const km        = Number(tData[i][tKmCol]) || 0;
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
