# Guía completa de trabajo — Huella Runner PWA

## Dónde está cada cosa

Hoy el proyecto vive en **dos lugares**:

| Lugar | Qué es | Para qué |
|-------|--------|----------|
| **Google Apps Script** | El editor donde corre la app real | Editar y publicar para los usuarios |
| **GitHub** (`runnerslabmdq-dotcom/huella-runner`) | El depósito / caja fuerte | Guardar versiones, trabajar con Claude |

> ⚠️ **Importante:** GitHub y Apps Script NO se sincronizan solos. Si editás en uno, el otro no se entera.

---

## Cómo funciona GitHub (conceptos básicos)

- **Repositorio (repo):** La carpeta del proyecto. El nuestro: `huella-runner`.
- **Branch (rama):** Una copia paralela para probar cambios sin romper lo que funciona. `main` es la versión estable.
- **Commit:** Una foto del código en un momento. Tiene un mensaje que dice qué cambió.
- **Push:** Subir cambios a GitHub (a la nube).
- **Pull:** Bajar cambios de GitHub a tu PC.
- **Pull Request (PR):** Pedido para fusionar una rama con `main`.

---

## Cómo trabaja Claude Code con los archivos

```
Yo (Claude) leo el repo → Edito archivos → Commit + Push a GitHub → Vos copiás a Apps Script
```

**Yo edito en GitHub, no en Apps Script.** No tengo acceso al editor de Google. Todo lo que hago queda en la carpeta `gas/` del repo.

Después de que yo pusheo, **vos tenés que copiar los cambios al editor de Apps Script** para que la app real se actualice.

---

## Flujo de trabajo día a día (4 pasos)

### Paso 1 — Pedirme el cambio
Me lo pedís por chat. Ejemplo: *"Agregá la Hoka Transport al catálogo"*.

### Paso 2 — Yo hago el cambio en GitHub
Edito los archivos en una rama nueva, hago commit y pusheo. Te muestro qué cambié.

### Paso 3 — Vos bajás los cambios

**Opción A (copiar a mano):**
1. Abrí GitHub → repo → carpeta `gas/`
2. Abrí el archivo que cambié (ej: `index.html`)
3. Clic en **"Raw"** o **"Copy raw file"**
4. Pegá todo en el editor de Apps Script, reemplazando el archivo viejo

**Opción B (con clasp, más pro):**
```bash
cd gas/
git pull origin main      # Bajar cambios de GitHub
clasp push                # Subir a Apps Script
```

### Paso 4 — Publicar en Apps Script
1. **Implementar** → **Administrar implementaciones**
2. Editar la implementación existente (el lapicito ✏️)
3. En "Versión" elegir **"Nueva versión"**
4. **Implementar**

La app real se actualiza al instante.

---

## Configurar clasp (una sola vez)

clasp conecta tu PC con Apps Script para no copiar a mano.

```bash
# 1. Instalar
npm install -g @google/clasp

# 2. Loguearte (abre el navegador)
clasp login

# 3. En la carpeta gas/ del repo, crear .clasp.json:
{
  "scriptId": "TU_SCRIPT_ID",
  "rootDir": "."
}
```

El Script ID está en Apps Script → Configuración (engranaje) → IDs.

**Bajar cambios de Apps Script a GitHub:**
```bash
clasp pull                          # Bajar de Apps Script
git add .
git commit -m "Sync desde Apps Script"
git push origin main
```

---

## Cómo sacar el cartel de Google

Ese banner que dice *"Esta aplicación fue creada por otro usuario"* aparece porque la app se sirve desde `script.google.com`.

### Opción A — Rápida: dominio propio con iframe
- Comprar dominio (ej: huellarunner.com, ~$15/año)
- Crear página que cargue la app en un `<iframe>` fullscreen
- **Pro:** rápido. **Contra:** algunos navegadores bloquean cookies en iframes.

### Opción B — Definitiva: migrar el frontend (recomendada)
Separar en dos partes:
1. **Frontend** (HTML/CSS/JS) → hosteado en Vercel, Netlify o GitHub Pages (gratis)
2. **Backend** (lógica + datos) → Apps Script sigue como API, Google Sheets como base de datos

```
Usuario → huellarunner.com → Vercel/Netlify → API (Apps Script) → Google Sheets
```

**Resultado:** sin cartel, URL propia, PWA instalable, más rápida.

El trabajo es cambiar las llamadas `google.script.run` por `fetch()` a tu GAS como API. Se puede hacer progresivamente, pantalla por pantalla.

---

## Estructura del repo

```
huella-runner/
├── gas/                    ← Código de Apps Script (lo que Claude edita)
│   ├── index.html          ← Frontend principal de la app
│   ├── codigo.gs           ← Backend (lógica, base de datos)
│   ├── admin.html          ← Panel de administración
│   ├── admin.gs            ← Backend del admin
│   ├── social-proof-ui.html
│   ├── social-proof.gs
│   └── trail-points.gs
├── index.html              ← Shell PWA (splash → redirect a GAS)
├── landing.html            ← Landing page
├── manifest.json           ← Configuración PWA
├── service-worker.js       ← Cache offline
├── CLAUDE.md               ← Instrucciones para Claude
├── GUIA.md                 ← Esta guía
└── TAREAS.md               ← Tareas pendientes
```

---

## Regla de oro

> **GitHub** = tu backup y lugar de trabajo con Claude.
> **Apps Script** = donde la app vive para los usuarios.
> Siempre mantené ambos sincronizados.
