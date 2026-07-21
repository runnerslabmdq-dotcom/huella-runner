# Huella Runner

## Perfil de decisión del fundador

**SIEMPRE ACTIVO** — Este perfil aplica en todo momento: trabajando en
conversación con el fundador, ejecutando tareas planificadas, o tomando
decisiones autónomas. No es solo para trabajo autónomo.

Consultar `.claude/thinking-profile.md` para el perfil completo.

### Cómo aplicar el perfil en conversación

- **Al explicar algo**: Usar analogías del mundo real, no jerga técnica.
- **Al proponer opciones**: Máximo 2-3, con recomendación clara y breve.
- **Al encontrar complejidad**: Descomponer en partes chicas, ir paso a paso.
- **Al recibir una idea del fundador**: Ejecutarla, y si se puede mejorar,
  proponer la mejora como opción, no como corrección.
- **Al notar que el scope crece**: Señalarlo. Ayudar a mantener el foco.
- **Al dar información**: La justa. Ni de más ni de menos. Demasiado paraliza
  igual que muy poco.

### Reglas rápidas derivadas del perfil

1. **Simple primero**: Ante dos opciones, elegir la más simple.
2. **Que funcione**: Priorizar funcionalidad sobre perfección.
3. **Usuario primero**: Pensar desde el usuario, no desde la arquitectura.
4. **Minimalista**: UI limpia, estilo Apple. Menos es más.
5. **Incrementos chicos**: Proponer cambios de a partes, no refactors masivos.
6. **Pocas opciones**: No presentar más de 2-3 alternativas, con recomendación.
7. **Sin apego**: Si algo mejor aparece, pivotar sin drama.
8. **Código limpio**: No dejar desprolijidades ni hacks sin resolver.

## Registro de cambios

Antes de investigar si algo "ya se arregló", revisar `HISTORIAL-CAMBIOS.md`
(raíz del repo) — ahí está el resumen de qué se cambió en cada archivo
`.gs`/`.html`. Actualizarlo cada vez que se mergea un cambio de código.

**El encabezado de fecha de cada archivo (`Última actualización: ...`)
SIEMPRE debe llevar fecha Y hora** (ej. `17/07/2026 14:42 (hora
Argentina)`), nunca solo la fecha — el fundador necesita la hora exacta
para no confundirse sobre qué versión tiene pegada en el GAS. Para la
hora real, correr `TZ='America/Argentina/Buenos_Aires' date '+%d/%m/%Y
%H:%M'` en vez de inventarla.

## Regla permanente: cómo publicar cambios en Apps Script

Cuando el fundador pegue código nuevo en el editor de Apps Script y quiera
publicarlo, SIEMPRE recordarle este camino exacto:

**Implementar → Administrar implementaciones → lápiz (Editar) → Nueva
versión → Implementar**, sobre la implementación que ya existe.

**NUNCA** "Nueva implementación" — eso genera una URL distinta de Google,
y como esa URL está guardada en `pwa/index.html` (`GAS_URL`), si cambia,
la PWA de Vercel se queda apuntando a la versión vieja y hay que
actualizar y volver a mergear `pwa/index.html` a mano. Ya pasó más de una
vez (ver `HISTORIAL-CAMBIOS.md`, sección `pwa/`) y es la causa más común
de "esto en la PC anda bien pero en el celu no".

## Regla permanente: confirmación antes de cambiar algo

Desde el 20/07/2026, antes de hacer CUALQUIER cambio al proyecto (editar
código, commitear, mergear un PR), pedirle al fundador que confirme con
una palabra clave que él tiene. **La palabra no se guarda en este
archivo ni en ningún archivo del repo** (mismo criterio que el
`ADMIN_TOKEN`: un secreto no va en un repo compartido) — se la vuelve a
pedir cada vez, en la conversación. Leer o investigar el código sin
modificar nada no requiere esta confirmación, solo aplica antes de
escribir/commitear/mergear.
