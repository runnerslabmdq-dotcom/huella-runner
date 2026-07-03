// ============================================================
// HUELLA RUNNER — TRAIL POINTS: FIDELIZACIÓN + ANTI-FRAUDE
// Archivo: trail-points.gs
// ============================================================
// ARQUITECTURA DE SHEETS REQUERIDA:
//
// Pestaña: Zapatillas (ya existente — agregar columnas)
//   ... columnas actuales ...
//   + KM_Actuales         (número — ya existe)
//   + Estado              (texto — ya existe)
//   + Cupon_Emitido       (TRUE/FALSE)
//   + Cupon_Codigo        (texto, ej: TT-DESGASTE-A3X9)
//   + Cupon_FechaEmision  (fecha)
//
// Pestaña: Entrenamientos (ya existente — agregar columnas)
//   ... columnas actuales ...
//   + Tipo_Carga          (Manual / Sincronizada)
//   + KM_Brutos           (número — los que ingresó el usuario)
//   + KM_Sumados          (número — los efectivamente acreditados tras ponderación)
//   + Estado_Validacion   (Aprobada / Sospechosa / Rechazada)
//   + Motivo_Rechazo      (texto — detalle del filtro que activó)
//
// Pestaña nueva: Cupones_Emitidos
//   Codigo, Email_Usuario, ID_Zapa, Marca, Modelo, KM_Al_Emitir,
//   Fecha_Emision, Estado (Disponible / Usado / Vencido)
// ============================================================

// ---- CONFIG CENTRAL (ajustar según negocio) ----------------
var TP = {
  KM_UMBRAL_CUPON:      650,    // km para disparar cupón
  KM_MAX_DIA:           120,    // filtro diario anti-fraude
  KM_MAX_SEMANA:        180,    // filtro semanal anti-fraude
  FACTOR_MANUAL:        0.85,   // ponderación carga manual
  PREFIJO_CUPON:        'TT-DESGASTE-',
  SHEET_CUPONES:        'Cupones_Emitidos',
  SHEET_ZAPAS:          'Zapatillas',
  SHEET_TRAIN:          'Entrenamientos',
};

// ============================================================
// PUNTO DE ENTRADA PRINCIPAL
// Reemplaza / complementa logTraining() existente.
// Devuelve { success, kmAcreditados, validacion, cupon? }
// ============================================================
function registrarActividadTrailPoints(email, idZapa, kmBrutos, tipoCarga, fecha, hora) {
  try {
    if (!email || !idZapa || !kmBrutos) {
      return { success: false, error: 'Parámetros incompletos.' };
    }

    const emailClean  = email.toString().trim().toLowerCase();
    const km          = Math.abs(Number(kmBrutos)) || 0;
    const tipo        = (tipoCarga || 'Manual').toString().trim();
    const fechaStr    = fecha || _hoy();
    const horaStr     = hora  || '';

    if (km <= 0) return { success: false, error: 'KM debe ser mayor a cero.' };

    // A: Validar contra umbrales biológicos
    const validacion = _validarUmbralesBiologicos(emailClean, km, fechaStr);
    if (validacion.estado === 'Rechazada') {
      _guardarEntrenamiento(emailClean, idZapa, km, 0, tipo, fechaStr, horaStr,
                            'Rechazada', validacion.motivo);
      return { success: false, error: validacion.motivo, validacion: 'Rechazada' };
    }

    // B: Ponderar según tipo de carga
    const kmAcreditados = _ponderarKm(km, tipo, fechaStr, horaStr);
    if (kmAcreditados === null) {
      return { success: false, error: 'Carga manual requiere fecha y hora exacta.' };
    }

    // Guardar entrenamiento aprobado
    _guardarEntrenamiento(emailClean, idZapa, km, kmAcreditados, tipo, fechaStr, horaStr,
                          validacion.estado, validacion.motivo);

    // C: Sumar KM a la zapatilla y verificar umbral de cupón
    const resultadoCupon = _sumarKmYVerificarUmbral(emailClean, idZapa, kmAcreditados);

    return {
      success:        true,
      kmBrutos:       km,
      kmAcreditados:  kmAcreditados,
      validacion:     validacion.estado,
      cupon:          resultadoCupon || null
    };

  } catch(e) {
    Logger.log('registrarActividadTrailPoints ERROR: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

// ============================================================
// REGLA A — Límites de velocidad biológica
// Devuelve { estado: 'Aprobada'|'Sospechosa'|'Rechazada', motivo }
// ============================================================
function _validarUmbralesBiologicos(email, km, fechaStr) {
  // Filtro diario absoluto
  if (km > TP.KM_MAX_DIA) {
    return {
      estado: 'Rechazada',
      motivo: `Supera el máximo diario permitido (${TP.KM_MAX_DIA} km). Actividad: ${km} km.`
    };
  }

  // Filtro semanal acumulado
  const kmSemana = _sumaKmUltimos7Dias(email, fechaStr);
  const total    = kmSemana + km;

  if (total > TP.KM_MAX_SEMANA) {
    return {
      estado: 'Sospechosa',
      motivo: `Acumulado semanal excede ${TP.KM_MAX_SEMANA} km (acumulado: ${kmSemana} km + nuevo: ${km} km = ${total} km). KM congelados.`
    };
  }

  return { estado: 'Aprobada', motivo: '' };
}

function _sumaKmUltimos7Dias(email, fechaStr) {
  try {
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(TP.SHEET_TRAIN);
    if (!sheet || sheet.getLastRow() < 2) return 0;

    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const col = {
      email:    headers.indexOf('Email_Usuario'),
      km:       headers.indexOf('KM_Sumados'),
      fecha:    headers.indexOf('Fecha'),
      estado:   headers.indexOf('Estado_Validacion'),
    };

    const limite = new Date(_parseFechaStr(fechaStr).getTime() - 7 * 86400000);
    let suma = 0;

    for (let i = 1; i < data.length; i++) {
      const rowEmail  = (data[i][col.email]  || '').toString().trim().toLowerCase();
      const rowEstado = (data[i][col.estado] || '').toString().trim();
      if (rowEmail !== email) continue;
      if (rowEstado === 'Rechazada') continue;  // no cuentan los rechazados

      const rowFecha = _celdaADate(data[i][col.fecha]);
      if (!rowFecha || rowFecha < limite) continue;

      suma += Number(data[i][col.km]) || 0;
    }

    return suma;
  } catch(e) {
    Logger.log('_sumaKmUltimos7Dias ERROR: ' + e.toString());
    return 0;
  }
}

// ============================================================
// REGLA B — Ponderación de carga
// Retorna los km efectivos a acreditar, o null si la carga
// manual no tiene los campos obligatorios.
// ============================================================
function _ponderarKm(km, tipoCarga, fecha, hora) {
  if (tipoCarga === 'Sincronizada') {
    return km;  // 100% — fuente oficial
  }

  // Manual: requiere fecha Y hora explícitas
  if (!fecha || !hora) return null;

  return Math.round(km * TP.FACTOR_MANUAL * 100) / 100;
}

// ============================================================
// GUARDAR ENTRENAMIENTO en hoja Entrenamientos
// ============================================================
function _guardarEntrenamiento(email, idZapa, kmBrutos, kmSumados, tipo,
                               fecha, hora, estadoVal, motivoRechazo) {
  const ss    = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(TP.SHEET_TRAIN);
  if (!sheet) return;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Columnas nuevas de Trail Points — agregar si no existen
  const nuevas = ['Tipo_Carga', 'KM_Brutos', 'KM_Sumados', 'Estado_Validacion', 'Motivo_Rechazo'];
  nuevas.forEach(h => {
    if (!headers.includes(h)) {
      const col = sheet.getLastColumn() + 1;
      sheet.getRange(1, col).setValue(h);
      headers.push(h);
    }
  });

  const newRow = new Array(headers.length).fill('');
  const set = (key, val) => {
    const i = headers.indexOf(key);
    if (i !== -1) newRow[i] = val;
  };

  set('Email_Usuario',    email);
  set('ID_Zapa',          idZapa);
  set('Fecha',            fecha);
  set('Hora',             hora);
  set('KM_Brutos',        kmBrutos);
  set('KM_Sumados',       kmSumados);
  set('Tipo_Carga',       tipo);
  set('Estado_Validacion', estadoVal);
  set('Motivo_Rechazo',   motivoRechazo);

  sheet.appendRow(newRow);
  SpreadsheetApp.flush();
}

// ============================================================
// REGLA C — Sumar KM a zapatilla + disparar cupón si corresponde
// Devuelve el objeto cupón si se emitió, o null.
// ============================================================
function _sumarKmYVerificarUmbral(email, idZapa, kmAcreditados) {
  if (kmAcreditados <= 0) return null;

  try {
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(TP.SHEET_ZAPAS);
    if (!sheet || sheet.getLastRow() < 2) return null;

    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const col = {
      id:          headers.indexOf('ID_Zapa'),
      email:       headers.indexOf('Email_Usuario'),
      km:          headers.indexOf('KM_Actuales'),
      estado:      headers.indexOf('Estado'),
      marca:       headers.indexOf('Marca'),
      modelo:      headers.indexOf('Modelo'),
      cuponEmitido: _colEnsure(sheet, headers, 'Cupon_Emitido'),
      cuponCodigo:  _colEnsure(sheet, headers, 'Cupon_Codigo'),
      cuponFecha:   _colEnsure(sheet, headers, 'Cupon_FechaEmision'),
    };

    for (let i = 1; i < data.length; i++) {
      const rowId    = (data[i][col.id]    || '').toString().trim();
      const rowEmail = (data[i][col.email] || '').toString().trim().toLowerCase();

      if (rowId !== idZapa.toString().trim() || rowEmail !== email) continue;

      const kmActuales  = Number(data[i][col.km]) || 0;
      const kmNuevos    = kmActuales + kmAcreditados;

      // Actualizar KM en la hoja
      sheet.getRange(i + 1, col.km + 1).setValue(kmNuevos);

      // Actualizar estado de desgaste
      const nuevoEstado = _calcularEstadoDesgaste(kmNuevos);
      sheet.getRange(i + 1, col.estado + 1).setValue(nuevoEstado);

      SpreadsheetApp.flush();

      // Verificar si corresponde emitir cupón
      const yaEmitido = data[i][col.cuponEmitido];
      if (!yaEmitido && kmNuevos >= TP.KM_UMBRAL_CUPON) {
        const marca  = (data[i][col.marca]  || '').toString().trim();
        const modelo = (data[i][col.modelo] || '').toString().trim();

        const cupon = _emitirCupon(email, idZapa, marca, modelo, kmNuevos);

        // Marcar en la zapatilla
        sheet.getRange(i + 1, col.cuponEmitido + 1).setValue(true);
        sheet.getRange(i + 1, col.cuponCodigo  + 1).setValue(cupon.codigo);
        sheet.getRange(i + 1, col.cuponFecha   + 1).setValue(cupon.fecha);
        SpreadsheetApp.flush();

        return cupon;
      }

      return null;
    }

    return null;

  } catch(e) {
    Logger.log('_sumarKmYVerificarUmbral ERROR: ' + e.toString());
    return null;
  }
}

function _calcularEstadoDesgaste(km) {
  if (km >= TP.KM_UMBRAL_CUPON) return 'Crítico';
  if (km >= TP.KM_UMBRAL_CUPON * 0.80) return 'Bajo';
  if (km >= TP.KM_UMBRAL_CUPON * 0.55) return 'Positivo';
  return 'Normal';
}

// ============================================================
// EMITIR CUPÓN ÚNICO — Genera código y lo persiste
// ============================================================
function _emitirCupon(email, idZapa, marca, modelo, kmAlEmitir) {
  const codigo = TP.PREFIJO_CUPON + _generarCodigoAlfanumerico(6);
  const fecha  = _hoy();

  const ss    = SpreadsheetApp.openById(SHEET_ID);
  let cSheet  = ss.getSheetByName(TP.SHEET_CUPONES);
  if (!cSheet) {
    cSheet = ss.insertSheet(TP.SHEET_CUPONES);
    cSheet.appendRow([
      'Codigo', 'Email_Usuario', 'ID_Zapa', 'Marca', 'Modelo',
      'KM_Al_Emitir', 'Fecha_Emision', 'Estado'
    ]);
  }

  cSheet.appendRow([codigo, email, idZapa, marca, modelo, kmAlEmitir, fecha, 'Disponible']);
  SpreadsheetApp.flush();

  // Notificar al usuario en-app
  try {
    enviarNotificacion(
      'individual',
      email,
      `Tus ${marca} ${modelo} llegaron a ${kmAlEmitir} km de trail. ` +
      `Cupón de descuento: ${codigo}. ¡Usalo en tu próxima compra en Todo Trail!`,
      'Premio'
    );
  } catch(_) {}

  return { codigo, fecha, marca, modelo, kmAlEmitir };
}

// ============================================================
// CONSULTA PÚBLICA — El frontend muestra el cupón disponible
// ============================================================
function getCuponDisponible(email) {
  try {
    const ss     = SpreadsheetApp.openById(SHEET_ID);
    const sheet  = ss.getSheetByName(TP.SHEET_CUPONES);
    if (!sheet || sheet.getLastRow() < 2) return null;

    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const col = {
      codigo:  headers.indexOf('Codigo'),
      email:   headers.indexOf('Email_Usuario'),
      marca:   headers.indexOf('Marca'),
      modelo:  headers.indexOf('Modelo'),
      kmEmitir: headers.indexOf('KM_Al_Emitir'),
      fecha:   headers.indexOf('Fecha_Emision'),
      estado:  headers.indexOf('Estado'),
    };

    const emailClean = email.toString().trim().toLowerCase();
    const cupones    = [];

    for (let i = 1; i < data.length; i++) {
      const rowEmail  = (data[i][col.email]  || '').toString().trim().toLowerCase();
      const rowEstado = (data[i][col.estado] || '').toString().trim();
      if (rowEmail === emailClean && rowEstado === 'Disponible') {
        cupones.push({
          codigo:    data[i][col.codigo].toString(),
          marca:     data[i][col.marca].toString(),
          modelo:    data[i][col.modelo].toString(),
          km:        Number(data[i][col.kmEmitir]) || 0,
          fecha:     data[i][col.fecha].toString(),
        });
      }
    }

    return cupones.length > 0 ? cupones : null;

  } catch(e) {
    Logger.log('getCuponDisponible ERROR: ' + e.toString());
    return null;
  }
}

// Marcar cupón como usado (llamar al canjear en Todo Trail)
function marcarCuponUsado(email, codigo) {
  try {
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(TP.SHEET_CUPONES);
    if (!sheet || sheet.getLastRow() < 2) return { success: false };

    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const colCodigo = headers.indexOf('Codigo');
    const colEmail  = headers.indexOf('Email_Usuario');
    const colEstado = headers.indexOf('Estado');
    const emailClean = email.toString().trim().toLowerCase();

    for (let i = 1; i < data.length; i++) {
      if (data[i][colCodigo].toString() === codigo &&
          data[i][colEmail].toString().trim().toLowerCase() === emailClean) {
        sheet.getRange(i + 1, colEstado + 1).setValue('Usado');
        SpreadsheetApp.flush();
        return { success: true };
      }
    }

    return { success: false, error: 'Cupón no encontrado.' };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

// ============================================================
// HELPERS INTERNOS
// ============================================================

// Asegura que una columna exista en la hoja y devuelve su índice (0-based)
function _colEnsure(sheet, headers, nombre) {
  let idx = headers.indexOf(nombre);
  if (idx === -1) {
    idx = headers.length;
    sheet.getRange(1, idx + 1).setValue(nombre);
    headers.push(nombre);
  }
  return idx;
}

function _generarCodigoAlfanumerico(longitud) {
  const chars  = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let resultado = '';
  for (let i = 0; i < longitud; i++) {
    resultado += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return resultado;
}

function _hoy() {
  const d  = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return dd + '/' + mm + '/' + d.getFullYear();
}

function _parseFechaStr(str) {
  if (!str) return new Date();
  const parts = str.split('/');
  if (parts.length === 3) {
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }
  return new Date(str);
}
