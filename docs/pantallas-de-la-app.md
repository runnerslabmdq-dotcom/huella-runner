# Pantallas de la app — referencia con código clave

> Creado: 21/07/2026. Recorrido pantalla por pantalla de la app (todo
> vive en `gas/index.html`, salvo el panel admin que es
> `gas/admin.html`), con una explicación simple de qué hace cada una y
> el código más importante que la maneja. Solo documentación — no
> cambia nada de cómo funciona la app.

---

## 1. Onboarding (bienvenida inicial)

**Qué es:** la pantalla completa que tapa todo la primera vez que
alguien abre la app en un celu/navegador. Explica qué es Huella Runner
y tiene el acordeón de "Ver legales". Después de aceptarla una vez, no
vuelve a aparecer (se guarda en el celu).

**Dónde vive:** `<div id="onboarding-screen">` (línea 1350).

**Código clave** — se guarda que ya se vio, para no repetirla:
```js
function cerrarPantallaOnboarding() {
  try { localStorage.setItem('hr_onboarding_visto', '1'); } catch(e) {}
  var ob = document.getElementById('onboarding-screen');
  ...
}
```
Y al cargar la página, si ya se aceptó antes, se oculta de una sin
mostrarla ni un instante:
```js
if (localStorage.getItem('hr_onboarding_visto') === '1') {
  document.getElementById('onboarding-screen').style.display = 'none';
}
```

---

## 2. Login

**Qué es:** la pantalla de entrada normal (después de la primera vez).
Pide email y contraseña. Desde acá se entra al dashboard, al registro,
o se recupera la contraseña. También tiene su propio "Ver legales"
(agregado el 21/07, antes solo estaba en el onboarding).

**Dónde vive:** `<div id="view-login">` (línea 1449).

**Código clave** — `doLogin()`: valida los campos, llama al backend, y
según la respuesta decide a dónde va el usuario (dashboard, cambio de
contraseña obligatorio, o panel admin):
```js
if (res.requiereCambioPassword) {
  // Entró con una contraseña temporal — antes de dejarlo pasar a
  // cualquier lado, tiene que elegir una definitiva.
  switchView('view-set-password');
  return;
}
if (res.esAdmin) {
  // Pide la URL real del panel admin y lo manda para allá
  google.script.run.withSuccessHandler(...).getAdminUrl();
  return;
}
```
Backend: `loginUser(email, password)` en `codigo.gs` — verifica la
contraseña hasheada (`_verificarPassword`) y decide `esAdmin` mirando
`ADMIN_EMAILS` (en `admin.gs`) o la columna `Rol` del Sheet.

---

## 3. Registro

**Qué es:** alta de una cuenta nueva — nombre, apellido, email,
contraseña (doble ingreso), nivel, grupo, fecha de nacimiento,
provincia/ciudad, celular.

**Dónde vive:** `<div id="view-register">` (línea 1520).

**Código clave** — `doRegister()`: junta todos los campos del
formulario (incluido el "grupo manual" si eligió "Otro") y valida antes
de mandar:
```js
if (!n || !e || !p || !pc) { err.innerText = 'Completá todos los campos obligatorios.'; ... return; }
if (p !== pc) { err.innerText = 'Las contraseñas no coinciden.'; ... return; }
```
Backend: `registerUser(...)` en `codigo.gs` — hashea la contraseña
(`_hashPassword`) antes de guardarla, nunca en texto plano.

---

## 4. Elegí tu contraseña nueva (set-password)

**Qué es:** pantalla que aparece SOLO cuando alguien entra con una
contraseña temporal (la que manda "¿Olvidaste tu contraseña?"). Pide
la contraseña nueva dos veces antes de dejarlo pasar a cualquier otro
lado.

**Dónde vive:** `<div id="view-set-password">` (línea 1785).

**Código clave** — `guardarNuevaPassword()`: valida largo mínimo y que
coincidan, y recién ahí deja pasar al dashboard:
```js
if (p1.length < 6) { err.innerText = 'La contraseña debe tener al menos 6 caracteres.'; ... return; }
if (p1 !== p2) { err.innerText = 'Las contraseñas no coinciden.'; ... return; }
```
Backend: `establecerNuevaPassword(email, nuevaPassword)` en
`codigo.gs` — guarda la nueva hasheada y saca la marca de
`Requiere_Cambio_Password`.

---

## 5. Dashboard / Carrusel de zapatillas

**Qué es:** la pantalla principal después de loguearse. Muestra las
zapatillas activas del usuario en un carrusel (estilo "coverflow"),
cada una con su foto, barra de desgaste, y botones para sumar km o ver
historial. Es la pantalla que más se usa de toda la app.

**Dónde vive:** `<div id="view-dashboard">` (línea 1670).

**Código clave** — `renderArmario(shoes)`: arma cada tarjeta del
carrusel, calculando el % de desgaste contra el límite propio de esa
zapatilla (o 650 km por defecto):
```js
var limite    = Number(s.KM_Limite) || KM_LIMITE_DEFAULT;
var perc      = Math.min((km / limite) * 100, 100);
var warnHtml = perc >= 70
  ? '<div class="cf-warn">' + (perc >= 85 ? '⚠️' : '🔶') + '</div>'
  : '';
```
Backend: `getUserShoes(email)` en `codigo.gs` — trae todas las
zapatillas activas (no archivadas) del usuario.

---

## 6. Agregar zapatilla

**Qué es:** el formulario para registrar una zapatilla nueva — marca,
modelo (desplegable con foto o carga manual), talle, género, km
iniciales, y el límite de km opcional (agregado el 20/07, Paso 1).
Tiene una miniatura que se actualiza sola a medida que elegís marca y
modelo.

**Dónde vive:** `<div id="view-add-shoe">` (línea 1706).

**Código clave** — `saveShoe()`: arma los datos y, si el registro
resultó ser un modelo que ya usan otros corredores, muestra el modal
de "dato de comunidad":
```js
const d = {
  marca: marcaFinal, modelo: modeloFinal, talle: ..., genero: ...,
  km: kmVal, kmLimite: kmLimiteVal, alias: ''
};
...
if (res && res.socialProof && res.socialProof.esNuevo === false) {
  mostrarSocialProofModal(d.marca, d.modelo, res.socialProof);
}
```
Backend: `addShoe(email, formData)` en `codigo.gs` — guarda la
zapatilla y calcula el estado de desgaste inicial.

---

## 7. Notificaciones (buzón)

**Qué es:** la lista de avisos que le llegaron al usuario (cupones de
desgaste, mensajes del admin). Se puede marcar como leída o borrar
(borrado suave — la fila no se elimina, se marca `Oculto`).

**Dónde vive:** `<div id="view-notificaciones">` (línea 1771).

**Código clave** — `renderNotificaciones(notifs)`: arma cada tarjeta,
parseando la fecha a mano (arreglado el 21/07 para no confundir
día/mes):
```js
var partes = raw.toString().trim().split(' ');
var dp = partes[0].split('/');
d = new Date(+dp[2], +dp[1] - 1, +dp[0], +tp[0], +tp[1]);
```
Backend: `getNotificacionesUsuario(email)` en `codigo.gs`.

---

## 8. Panel de administrador (`Admin.html`, archivo aparte)

**Qué es:** el panel para vos (el fundador) — estadísticas generales,
ranking de usuarios y de calzado, actividad reciente, alertas de
desgaste, envío de notificaciones (a todos / grupo / individual), y
salud del sistema (cupones, cron nocturno). Protegido por un token que
vive en Propiedades del script, no en el código.

**Dónde vive:** `gas/admin.html` completo (archivo separado de
`Index.html`).

**Código clave** — `cargarTodo()`: dispara todas las cargas de datos
del panel al abrirlo:
```js
function cargarTodo() {
  cargarMetricas();
  cargarRanking();
  cargarActividad();
  cargarAlertas();
  cargarUsuarios();
  cargarGrupos();
  cargarActividadPorDia();
  cargarSaludSistema();
}
```
Cada una de esas llama a su función del backend con el token
(`ADMIN_TOKEN`) de por medio, ej. `getAdminDashboardData(ADMIN_TOKEN)`
para las alertas de desgaste (arreglada el 21/07 para usar el límite
propio de cada zapatilla).

---

## Nota

No incluí acá los modales (Registrar KM, Historial, Confirmar
eliminar, Locker, Recuperar contraseña, Voz, Dato de comunidad) porque
técnicamente no son "pantallas" — se abren encima de una pantalla, no
la reemplazan. Si querés ese mismo tratamiento para los modales,
avisame y armo una segunda parte.
