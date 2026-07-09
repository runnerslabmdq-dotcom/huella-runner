# Huella Runner — Plan definitivo

## Visión

PWA completa e instalable para registrar el kilometraje de zapatillas de running.
Backend: Google Apps Script + Google Sheets (gratis, ya funciona).
Frontend: HTML/CSS/JS vanilla, sin frameworks.

---

## Estado actual del repo

### Lo que sirve y se queda

| Archivo | Qué es |
|---|---|
| `landing.html` | Landing page de marketing (completa, profesional) |
| `icons/` | Íconos PWA 192x192 y 512x512 |
| `assets/screenshots/` | Screenshots de la app para la landing |
| `gas/` | Código fuente del GAS actual (referencia para migración) |
| `manifest.json` | Manifest PWA (necesita actualización menor) |
| `service-worker.js` | Service Worker básico (se mejorará) |
| `.claude/` | Perfil de fundador + 9 sub-agentes especializados |

### Lo que cambia

| Archivo | Acción |
|---|---|
| `index.html` | Se reemplaza: de splash-redirect a app shell PWA real |
| URLs de GAS | Se actualizan cuando se migre a la cuenta Gmail nueva |

---

## Pendiente: migración de cuenta Gmail

- [ ] Crear nuevo proyecto GAS en la cuenta Gmail nueva
- [ ] Copiar el código de `gas/` al nuevo proyecto
- [ ] Deployar como web app
- [ ] Actualizar la URL de GAS en `landing.html` y en la PWA
- [ ] Verificar que todo funcione con la nueva URL

---

## Fases de construcción (próximas sesiones)

### Fase 1 — App Shell PWA
- [ ] Crear `index.html` como app shell (navegación, layout, tema dark/gold)
- [ ] Implementar navegación entre secciones (Login, Zapatillas, KM, Perfil)
- [ ] Mejorar Service Worker con cache estratégico
- [ ] Completar manifest.json (más tamaños de íconos, shortcuts)
- [ ] Agregar install prompt customizado

### Fase 2 — Login y autenticación
- [ ] Pantalla de login conectada al GAS
- [ ] Manejo de sesión (localStorage o similar)
- [ ] Flujo de registro de usuario nuevo

### Fase 3 — Funcionalidades core
- [ ] Dashboard de zapatillas (semáforo de desgaste)
- [ ] Registrar kilómetros
- [ ] Agregar/editar zapatillas
- [ ] Historial de carreras

### Fase 4 — Features avanzadas
- [ ] Notificaciones de desgaste
- [ ] Social proof (datos de la comunidad)
- [ ] Trail Points (sistema de fidelización)
- [ ] Panel admin

### Fase 5 — Pulido
- [ ] SEO de la landing page
- [ ] Accesibilidad WCAG 2.1 AA
- [ ] Performance optimization (Lighthouse 90+)
- [ ] Soporte offline real

---

## Diseño

- **Background**: `#080808` (negro profundo)
- **Accent**: `#FFD700` (amarillo gold)
- **Texto**: `#E8E8E8` (blanco suave)
- **Secundario**: `#555` (gris)
- **Verde**: `#5CE65C` (para estados positivos)
- **Tipografía**: Bebas Neue (títulos) + Montserrat (cuerpo)
- **Estilo**: dark, moderno, deportivo, minimalista

---

*Última actualización: 2026-07-09*
