# PWA — Novedades y fuentes (julio 2026)

> Recopilado el 11/07/2026 para decisiones de Huella Runner.

## Cambios aplicados

- `manifest.json`: agregado `display_override: ["fullscreen", "standalone"]` para pantalla completa en Android con fallback a standalone en iOS.

## Novedades clave

### iOS 26 — PWA por defecto
Desde iOS 26, cualquier sitio agregado al home screen se abre como web app (sin barra de Safari). Toggle "Open as Web App" activado por defecto.

### iOS 26.1 — Bug de barra opaca
PWAs en portrait muestran una barra opaca arriba. No ocurre en landscape. Parcialmente mejorado en iOS 26.2.

### Push Notifications en Safari
Safari 18.4 agregó Declarative Web Push para PWAs en home screen. Permite push notifications en iPhone sin app nativa.

### Service Worker ya no obligatorio para instalar
Chrome y Edge ya no exigen service worker para mostrar el prompt de instalación. Solo el manifest.

### display_override
Nueva propiedad del manifest que permite definir una cadena de prioridad de modos de pantalla (fullscreen > standalone > minimal-ui > browser).

## Fuentes

- [15 Essential PWA Features Every Web App Needs in 2026](https://www.alphonsolabs.com/pwa-must-have-features-2026/)
- [iOS 26.1 PWA full screen broken — MacRumors Forums](https://forums.macrumors.com/threads/ios-26-1-pwa-full-screen-broken.2470545/)
- [PWA on iOS: Install Guide & Limits for Advertisers 2026](https://deepclick.com/resources/blog/progressive-web-apps-on-ios/)
- [Do Progressive Web Apps Work on iOS? Complete Guide 2026](https://www.mobiloud.com/blog/progressive-web-apps-ios)
- [Google Chrome & PWAs — firt.dev](https://firt.dev/notes/chrome/)
- [iOS 26 WebApps: Turn Any Website into Full-Screen App (YouTube)](https://www.youtube.com/watch?v=ONefLkWy6BU)
- [PWA Mobile Testing Checklist 2026](https://mobileviewer.github.io/pwa-mobile-testing-checklist-2026)
- [Progressive Web Apps 2026: Complete Development Guide](https://www.digitalapplied.com/blog/progressive-web-apps-2026-complete-development-guide)
