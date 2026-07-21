# Huella Runner — contexto general

> Documento de referencia única. Si en algún momento hace falta
> explicarle la app a alguien nuevo (un dev, un sponsor, un socio) o
> retomar el proyecto después de un tiempo sin tocarlo, empezar por acá.

## Qué es, en una frase

Una PWA minimalista que registra corredores, zapatillas y kilómetros,
y traduce eso en el dato que casi ningún runner lleva: el desgaste real
de cada par, para saber cuándo cambiarlas antes de lesionarse.

## Qué hace hoy (funcionalidad real, no plan)

- **Registro de usuarios** (nombre, email, contraseña hasheada, nivel,
  grupo, ubicación).
- **Registro de zapatillas** por usuario: marca, modelo (con catálogo
  desplegable + foto, o carga manual), talle, género, alias, km
  iniciales, y desde el 20/07 un **límite de km opcional por
  zapatilla** (por defecto 650, editable al cargarla).
- **Registro de kilómetros** por entrenamiento, asociados a una
  zapatilla — con carga manual, botones rápidos (5/10/21/42K) o carga
  por voz.
- **Estado de desgaste** por zapatilla (Normal → Positivo → Bajo →
  Crítico) calculado contra ese límite, con **cupón de descuento**
  automático (`HR-DESGASTE-...`) al llegar a Crítico.
- **Carrusel** de zapatillas activas (estilo coverflow) + **Locker**
  para las archivadas.
- **Notificaciones** in-app (buzón), sin push real todavía.
- **Modal de "dato de comunidad"**: al cargar una zapatilla, si ya hay
  otros usuarios con esa marca/modelo, muestra cuántos son y cuántos km
  acumulados llevan entre todos (social proof), con botón de compartir.
- **Panel de administrador** separado (`Admin.html`), protegido por
  token: estadísticas, ranking de usuarios, actividad, envío de
  notificaciones (a todos / grupo / individual), salud del sistema
  (cupones emitidos, último corrido del cron nocturno).
- **Recuperación de contraseña**: genera una temporal por mail, fuerza
  a elegir una nueva con doble ingreso en el próximo login.

## Qué NO existe todavía (para no asumir que sí)

- Suscripción paga / límite de zapatillas para usuarios free (charlado,
  no construido — ver `HISTORIAL-CAMBIOS.md` para la discusión).
- Categorización de límite de km por material/tipo de zapatilla ("Paso
  2" — hay datos de referencia juntados en
  `docs/categorias-zapatillas-referencia.md`, sin implementar).
- Toast con dato/categoría al elegir zapatilla (misma referencia de
  arriba, sin implementar).
- Partnerships con tiendas/marcas, agente IA en el panel admin
  (especificado en `AGENTE-IA-SPEC.md`, no construido).
- Push notifications reales (hoy son solo in-app).
- Instagram de la app: cuenta creada (@huellarunnermdq), en fase
  "incógnita" (sin revelar el producto todavía), sin posteos.

## Arquitectura técnica

```
Usuario → PWA (Vercel, carpeta pwa/) → redirige a → GAS Web App (gas/)
                                                       └─ Google Sheets (DB)
```

- **Backend + frontend server-side**: Google Apps Script (`gas/`).
  `codigo.gs` (core), `admin.gs` (panel admin), `trail-points.gs`
  (desgaste/cupones), `social-proof.gs` (dato de comunidad + cache
  nocturno), `Index.html` (toda la UI de usuario, HTML+CSS+JS en un
  solo archivo), `Admin.html` (UI del panel).
- **Base de datos**: Google Sheets, un spreadsheet con hojas por
  entidad (Usuarios, Zapatillas, Entrenamientos, Notificaciones,
  Cupones_Emitidos, Cache_Modelos).
- **PWA shell** (`pwa/`): sitio estático en Vercel que redirige al
  `/exec` de Apps Script con cache-busting. Sirve el manifest e ícono.
- **Publicar cambios de `gas/`**: copiar/pegar en el editor de Apps
  Script y usar **Implementar → Administrar implementaciones → lápiz →
  Nueva versión → Implementar** — nunca "Nueva implementación" (ver
  `CLAUDE.md`, rompe la URL que usa la PWA).

## Identidad de marca

- **Colores**: fondo negro `#080808`, acento dorado apagado `#C5B358`
  (claro `#D4C570`, oscuro `#A89440`), texto plata `#E8E8E8`, gris
  `#888888`.
- **Tipografía**: Montserrat (400/700/900) para casi todo; Bebas Neue
  solo para el logo del sponsor original (Open Sports).
- **Tono**: directo, minimalista estilo Apple, sin adornos. Frase ancla:
  *"Tus zapatillas hablan"*.

## Negocio

- **Audiencia primaria**: corredores — arranca en Mar del Plata /
  Argentina, PWA gratis.
- **Audiencia secundaria**: tiendas/marcas de zapatillas, vía datos
  agregados (ver `AGENTE-IA-SPEC.md` — generador de pitches para
  sponsors) o comisión por derivar ventas cuando una zapatilla llega a
  "Crítico".
- **Monetización futura charlada** (sin construir): suscripción
  ~USD 1/mes para registro ilimitado de zapatillas (hoy todo es
  gratis e ilimitado); ver `HISTORIAL-CAMBIOS.md` para el detalle de la
  charla y las alternativas consideradas.
- **Legal**: ya existe un texto de privacidad en la app (acordeón
  "Privacidad y Tratamiento de Datos" en Index.html) que promete no
  compartir datos personales con terceros — cualquier partnership que
  implique compartir datos reales de usuarios necesita revisar ese
  texto primero.

## Otros documentos del proyecto

| Doc | Para qué |
|---|---|
| `CLAUDE.md` | Perfil de decisión del fundador + reglas de proceso (deploy, changelog) |
| `HISTORIAL-CAMBIOS.md` | Changelog completo, por archivo y por fecha |
| `AGENTE-IA-SPEC.md` | Spec de la feature de agente IA para el panel admin |
| `docs/cloudinarys-zapatillas.md` | Catálogo de fotos de zapatillas por marca/modelo |
| `docs/como-agregar-zapatillas.md` | Flujo fijo para cargar modelos nuevos al catálogo |
| `docs/categorias-zapatillas-referencia.md` | Datos juntados para el futuro toast / Paso 2 de límite por material |
| `docs/campana-lanzamiento-incognita.md` | Brief de Meta Ads para el lanzamiento (buyer personas, creativos) |
| `docs/instagram-lanzamiento.md` | Bio y posteos planeados para @huellarunnermdq |
| `docs/pwa-sources-julio-2026.md` | Notas técnicas de la PWA |
