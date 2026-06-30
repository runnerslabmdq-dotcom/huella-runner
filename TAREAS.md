# Tareas pendientes — Huella Runner PWA

## Contexto
Huella Runner es una webapp construida en Google Apps Script (GAS) que queremos convertir en una PWA completa e instalable. El repo actual tiene solo el shell PWA (splash screen → redirect al GAS).

**URL GAS (producción):** `https://script.google.com/macros/s/AKfycbwPGUBAE6ZsSowikCWKGHJPSwSnu5hfwsFY0S8h4r7erHopRyAByvZIYoKNFObOdsK6/exec`

**Credenciales de prueba:**
- Usuario: edragotto@hotmail.com
- Password: Jagger2310

---

## BUGS CRÍTICOS A CORREGIR EN EL REPO ACTUAL

### Bug 1 — Paths de íconos rotos
Los archivos `icon-192.png` e `icon-512.png` están en la raíz del repo pero el código los busca en `./icons/`.

**Acción:** Crear carpeta `icons/`, mover los íconos ahí, y asegurarse que `index.html`, `manifest.json` y `service-worker.js` usen el path `./icons/icon-*.png`.

### Bug 2 — GAS URL desactualizada en index.html
La `GAS_URL` en `index.html` línea 81 apunta a una versión vieja del script. Actualizar a la URL de producción de arriba.

### Bug 3 — `window.location.replace` impide navegar "atrás"
En `index.html` cambiar `window.location.replace(GAS_URL)` por `window.location.href = GAS_URL`.

### Bug 4 — Service Worker cachea paths inexistentes
El SW intenta cachear `./icons/icon-192.png` y `./icons/icon-512.png` antes de que existan. Corregir junto con Bug 1.

---

## TAREA PRINCIPAL — Convertir en PWA completa

Si el usuario pegó los archivos del Google Apps Script en este repo (buscar archivos `.gs` y `.html` en la carpeta), hacer lo siguiente:

### Opción A — PWA Shell completo (si hay código GAS disponible)
1. Revisar el código GAS para entender todas las secciones (Login, Zapatillas, KM, etc.)
2. Proponer arquitectura PWA moderna que reemplace o complemente el GAS
3. Implementar:
   - Service Worker con cache estratégico
   - Manifest completo con todas las resoluciones de íconos
   - Soporte offline básico
   - Install prompt nativo

### Opción B — Mejoras al shell actual (si NO hay código GAS)
1. Corregir los 4 bugs listados arriba
2. Mejorar el splash screen con mejor tipografía
3. Agregar meta tags para SEO y compartir en redes
4. Mejorar el Service Worker para precachear assets correctamente
5. Agregar soporte para iOS (apple-touch-icon en múltiples resoluciones)
6. Agregar un install prompt customizado ("Instalá la app")

---

## DISEÑO — Paleta y estilo definidos
- Background: `#080808` (negro profundo)
- Accent: `#FFD700` (amarillo gold)
- Texto: `#E8E8E8` (blanco suave)
- Secundario: `#555` (gris)
- Tipografía sugerida: Inter o DM Sans (importar de Google Fonts)
- Estilo: dark, moderno, deportivo

---

## INSTRUCCIÓN PARA LA PRÓXIMA SESIÓN
Al retomar esta sesión, leer este archivo y ejecutar las tareas en orden:
1. Primero corregir los 4 bugs críticos
2. Luego buscar si el usuario pegó archivos GAS en la carpeta
3. Si hay archivos GAS, hacer análisis y proponer PWA completa
4. Si no hay archivos GAS, ejecutar Opción B
5. Hacer commit y push al branch `claude/todotrail-site-analysis-e62pir`

Branch de trabajo: `claude/todotrail-site-analysis-e62pir`
