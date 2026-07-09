# Migración completa — Huella Runner PWA

Paso a paso para tener la app en tu dominio, a pantalla completa en el
celular, sin cartel de Google ni cosas mezcladas.

---

## Fase 0 — Crear el Gmail nuevo (5 minutos)

1. Ir a [accounts.google.com](https://accounts.google.com) → Crear cuenta
2. Elegir un nombre tipo `huellarunnerapp@gmail.com`
3. Guardar la contraseña en algún lugar seguro

> Este Gmail va a ser el "dueño" de todo: Sheets, Apps Script, Vercel, GitHub.

---

## Fase 1 — Crear el Google Sheet nuevo (15 minutos)

### 1.1 Logueate con el Gmail nuevo

### 1.2 Crear un Sheet vacío
1. Ir a [sheets.google.com](https://sheets.google.com) → Sheet en blanco
2. Nombrarlo **"Huella Runner — Base de datos"**

### 1.3 Crear las hojas (pestañas) que usa la app
Renombrar/agregar pestañas con estos nombres exactos:

| Pestaña | Qué guarda |
|---------|-----------|
| `Usuarios` | Nombre, email, contraseña, provincia, ciudad, etc. |
| `Zapatillas` | Cada zapatilla registrada por cada usuario |
| `Entrenamientos` | Cada registro de km |
| `Notificaciones` | Mensajes y premios enviados |

### 1.4 Copiar los encabezados
Abrir tu Sheet actual (el de la cuenta vieja) y copiar la **fila 1** (los
encabezados) de cada pestaña al Sheet nuevo. Solo la fila 1, no los datos.

> 💡 Los datos arrancan vacíos. Es un proyecto limpio.

### 1.5 Copiar el ID del Sheet nuevo
Está en la URL: `https://docs.google.com/spreadsheets/d/`**ESTE_ES_EL_ID**`/edit`

Guardar ese ID, lo vas a necesitar en el paso siguiente.

---

## Fase 2 — Crear el Apps Script nuevo (20 minutos)

### 2.1 Desde el Sheet nuevo
1. Menú **Extensiones** → **Apps Script**
2. Se abre un proyecto de Apps Script vinculado al Sheet

### 2.2 Copiar los archivos del proyecto
Ir a GitHub → repo `huella-runner` → carpeta `gas/` y copiar cada archivo:

| Archivo en GitHub | Qué hacer en Apps Script |
|---|---|
| `codigo.gs` | Reemplazar el contenido de `Código.gs` (el que viene por defecto) |
| `index.html` | Archivo → Nuevo → HTML → nombrarlo `index` → pegar contenido |
| `admin.html` | Archivo → Nuevo → HTML → nombrarlo `admin` → pegar contenido |
| `admin.gs` | Archivo → Nuevo → Script → nombrarlo `admin` → pegar contenido |
| `social-proof-ui.html` | Archivo → Nuevo → HTML → pegar |
| `social-proof.gs` | Archivo → Nuevo → Script → pegar |
| `trail-points.gs` | Archivo → Nuevo → Script → pegar |

### 2.3 Cambiar el ID del Sheet
En `codigo.gs`, buscar la línea:
```javascript
const SHEET_ID = '1zPS06n_ufECAw-4yWUHzQJDbpqYjxtoL24akjOo0Ofo';
```
Reemplazarla con el ID de tu Sheet nuevo (el que guardaste en 1.5).

### 2.4 Publicar (deploy)
1. **Implementar** → **Nueva implementación**
2. Tipo: **Aplicación web**
3. Ejecutar como: **Yo** (el Gmail nuevo)
4. Acceso: **Cualquier persona**
5. **Implementar**
6. Copiar la URL que te da → esa es tu app funcionando

### 2.5 Probar
Abrí la URL en el celular. Debería funcionar igual que antes (con el cartel
de Google todavía, lo sacamos en la Fase 4).

---

## Fase 3 — GitHub con la cuenta nueva (10 minutos)

### 3.1 Crear cuenta en GitHub
1. Ir a [github.com](https://github.com) → Sign up
2. Usar el Gmail nuevo

### 3.2 Opción A: transferir el repo actual (recomendado)
Desde tu cuenta actual de GitHub:
1. Ir al repo `huella-runner` → **Settings** → **Danger Zone**
2. **Transfer repository** → poner el nombre de tu cuenta nueva
3. Aceptar desde la cuenta nueva

### 3.2 Opción B: crear repo nuevo y subir
Si preferís empezar limpio:
1. Crear repo nuevo `huella-runner` en la cuenta nueva
2. Yo me encargo de pushear todo ahí

> 💡 Después de esto, me agregás el nuevo repo a Claude Code y seguimos
> trabajando igual.

---

## Fase 4 — Vercel: sacar el cartel de Google (15 minutos)

Esta es la parte más importante. Acá la app deja de depender del dominio
de Google y se ve a pantalla completa, instalable, sin banners.

### 4.1 Crear cuenta en Vercel
1. Ir a [vercel.com](https://vercel.com) → Sign up
2. Elegir **"Continue with GitHub"** (usa tu cuenta nueva de GitHub)
3. Autorizar

### 4.2 Conectar el repo
1. **Add New Project** → seleccionar el repo `huella-runner`
2. Framework Preset: **Other**
3. Root Directory: dejar como está (raíz)
4. **Deploy**

En 30 segundos tu app está en: `https://huella-runner.vercel.app`

### 4.3 Lo que hay que migrar (esto lo hacemos juntos)

Para que funcione desde Vercel, hay que cambiar cómo el frontend habla
con Apps Script:

**Antes (dentro de GAS):**
```javascript
google.script.run.withSuccessHandler(callback).getUserShoes(email);
```

**Después (desde Vercel):**
```javascript
fetch('https://script.google.com/.../exec?action=getUserShoes&email=' + email)
  .then(r => r.json())
  .then(callback);
```

Esto lo hacemos progresivamente. No es necesario migrar todo de una.

### 4.4 PWA a pantalla completa en el celular

El `manifest.json` que ya tenemos dice `"display": "standalone"`, eso hace
que cuando el usuario instala la app, se abra **sin barra del navegador**.

Para que funcione perfecto desde Vercel:
1. El `manifest.json` ya está en el repo ✅
2. El `service-worker.js` ya está ✅
3. Los íconos ya están ✅
4. Solo hay que ajustar las URLs internas

**Cómo se instala en el celular:**
- **Android:** Chrome → menú (⋮) → "Añadir a pantalla de inicio"
- **iPhone:** Safari → compartir (↑) → "Añadir a inicio"

Se abre como app nativa, a pantalla completa, sin barra de Chrome/Safari.

---

## Fase 5 — Dominio propio (opcional, cuando quieras)

### 5.1 Comprar dominio
- [Namecheap](https://namecheap.com) o [Google Domains](https://domains.google) → ~$12/año
- Buscar `huellarunner.com` o `huellarunner.com.ar`

### 5.2 Conectar a Vercel
1. En Vercel → tu proyecto → **Settings** → **Domains**
2. Agregar tu dominio
3. Vercel te dice qué DNS configurar
4. En Namecheap/Google Domains, agregar los registros DNS que pide Vercel
5. En 5-30 minutos queda activo

**Resultado:** los usuarios entran a `huellarunner.com`, ven la app a
pantalla completa, sin cartel de Google, instalable como app.

---

## Resumen del orden

| Fase | Qué | Tiempo | Costo |
|------|-----|--------|-------|
| 0 | Gmail nuevo | 5 min | Gratis |
| 1 | Google Sheet nuevo | 15 min | Gratis |
| 2 | Apps Script nuevo | 20 min | Gratis |
| 3 | GitHub con cuenta nueva | 10 min | Gratis |
| 4 | Vercel (sacar cartel) | 15 min | Gratis |
| 5 | Dominio propio | 10 min | ~$12/año |

**Total: ~1 hora para tener todo limpio y funcionando.**

Las fases 0-3 las podés hacer vos solo siguiendo los pasos.
La fase 4 (migración a Vercel) la hacemos juntos — yo hago los cambios
de código y vos deployás.
