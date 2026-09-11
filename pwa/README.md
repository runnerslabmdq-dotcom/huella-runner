# Huella Runner — PWA shell

Esto es **lo único que se sube a Vercel/Netlify**. Es una pantalla de
bienvenida (splash) que redirige a la app real, que vive en Google Apps
Script (carpeta `../gas/` del repo).

## Archivos

- `index.html` — la pantalla de bienvenida. Tiene la URL del `/exec` de
  Apps Script hardcodeada en una constante `GAS_URL` — si el deployment
  de Apps Script cambia de URL, hay que actualizarla acá.
- `manifest.json` — le dice al celular que esto se puede instalar como
  app (nombre, colores, íconos, pantalla completa).
- `service-worker.js` — guarda una copia liviana en el celular para que
  abra más rápido.
- Los íconos (192px y 512px) que usa `manifest.json` ya no son
  archivos locales — están en Cloudinary (misma cuenta que el resto de
  las imágenes de la app). Si hay que cambiarlos, alcanza con
  actualizar las 2 URLs en `manifest.json` y el `apple-touch-icon` de
  `index.html`.

## Deploy

En Vercel/Netlify, la carpeta raíz del proyecto (Root Directory) tiene
que apuntar a esta carpeta (`pwa/`), no a la raíz del repo.

## Qué NO es esto

- No es la app (eso es `../gas/`, va a Apps Script, no a Vercel).
- No es la landing de presentación (`../landing.html`, marketing aparte,
  no forma parte de esta PWA).
