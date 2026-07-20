# Cómo agregar zapatillas nuevas — flujo fijo

> Referencia para cuando el fundador pasa una lista de links de Cloudinary
> para agregar modelos nuevos (ej. "enlaces para Hoka, misma metodología
> de siempre"). Seguir estos pasos siempre, en este orden.

## 1. Qué manda el fundador

Una lista de URLs de Cloudinary, una por línea, típicamente con este
formato de nombre de archivo:

```
Marca_Nombre_Del_Modelo_ST_xxxxxx.png
```

- El `ST` (a veces `TT`) es una marca de referencia **propia del
  fundador**, no va en el desplegable ni en ningún lado visible.
- A veces también manda el nombre a mano en el mensaje (ej. "10 asics
  st") — igual, siempre confirmar el nombre final leyendo el archivo.

## 2. Sacar el nombre del modelo del link

Del nombre de archivo `Hoka_Cielo_X1_2.0_ST_vaozia.png` el modelo es
**"Cielo X1 2.0"**: sacar la marca (ya la sabemos), sacar el sufijo
`ST`/`TT` y el hash final de Cloudinary (`_vaozia`), y convertir los
`_` en espacios.

## 3. Revisar si el modelo ya existe

Antes de agregar, `grep` el nombre en `gas/index.html` (`catalogo` y
`modelImages`) — si el modelo **ya está** en el desplegable:
- Si es la MISMA zapatilla con una foto nueva/mejor → se reemplaza el
  link en `modelImages`, no se duplica la entrada en `catalogo`.
- Si dudás si es la misma zapatilla o una variante distinta → preguntar
  antes de asumir (evita nombres duplicados feos en el desplegable).

## 4. Dónde tocar en `gas/index.html`

Dos lugares, siempre juntos:

1. **`modelImages`** (objeto, cerca de la línea ~2048): agregar una
   entrada `"marca_modelo_normalizado": "<link>"`. La clave se arma así
   (función `_normKey`, ya en el código): todo minúscula, sin acentos,
   espacios → `_`. Ojo que **no** saca puntos ni otros símbolos (ej.
   "Cielo X1 2.0" → `cielo_x1_2.0`, con el punto incluido).
2. **`catalogo`** (objeto, cerca de la línea ~2165): agregar el nombre
   del modelo (tal cual se va a mostrar, sin ST/TT) al array de esa
   marca. Si la marca no tiene array todavía, crear la entrada.

## 5. Actualizar el registro de links

`docs/cloudinarys-zapatillas.md` — agregar una fila a la tabla de
"Modelos específicos" con Marca | Modelo | Link. Si reemplaza una foto
existente, dejar una nota corta tipo *(actualizada dd/mm — reemplaza la
foto anterior, mismo modelo)*.

## 6. Encabezado de versión + changelog

- Bump del header de `gas/index.html` (`Última actualización:` con
  fecha y hora real — correr
  `TZ='America/Argentina/Buenos_Aires' date '+%d/%m/%Y %H:%M'`, nunca
  inventar la hora) y una línea en "Cambios en esta versión" con los
  modelos agregados.
- Entrada nueva en `HISTORIAL-CAMBIOS.md`.

## 7. Merge

Mismo flujo de git de siempre: rama `claude/huella-runner-final-review-hzscva`
reiniciada desde `origin/main` si ya estaba mergeada, commit, push, PR,
merge.

## 8. Avisar al fundador

Al final, decirle que tiene que copiar y pegar `Index.html` en el editor
de Apps Script y publicar con **Implementar → Administrar
implementaciones → lápiz → Nueva versión → Implementar** (nunca "Nueva
implementación").
