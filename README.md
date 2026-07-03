# Huella Runner

App PWA para registrar el kilometraje de zapatillas de running/trail, con módulos de comunidad y fidelización.

## Estructura del repositorio

```
index.html          → Shell de splash/redirect de la PWA (carga GAS_URL)
manifest.json        → Manifest de la PWA (íconos, nombre, colores)
service-worker.js    → Cache offline de la PWA
icons/                → Íconos de la PWA (192px y 512px)
landing.html         → Landing page de presentación/marketing (standalone)
assets/screenshots/   → Capturas reales de la app, usadas en landing.html
gas/                   → Código fuente de Google Apps Script (backend + UI real de la app)
  codigo.gs            → Backend principal
  admin.gs             → Backend del panel admin
  index.html           → UI principal de la SPA (se pega en Apps Script)
  admin.html            → UI del panel admin (se pega en Apps Script)
  social-proof.gs        → Módulo "Social Proof de Durabilidad" (backend)
  social-proof-ui.html    → Módulo "Social Proof de Durabilidad" (fragmentos frontend)
  trail-points.gs          → Módulo "Trail Points" (loyalty + anti-fraude)
TAREAS.md              → Lista de tareas/mejoras pendientes
```

## Notas

- La app real corre en Google Apps Script. Los archivos en `gas/` deben copiarse manualmente
  al editor de Apps Script — no se despliegan solos desde este repo.
- `index.html`, `manifest.json`, `service-worker.js` e `icons/` son el shell de la PWA que
  redirige a la app de Apps Script.
- `landing.html` es independiente y se puede alojar en cualquier hosting estático
  (GitHub Pages, Vercel, etc.) sin afectar la app real.
