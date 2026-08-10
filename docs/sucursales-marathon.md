# Sucursales de Marathon — referencia para enrutamiento por zona

> Creado: 10/08/2026 13:28 (hora Argentina). Datos pasados por el
> fundador directo en el chat (copiados de `marathon.com.ar/pages/sucursales`
> — no se pudo acceder a la página desde acá, el entorno bloquea la
> mayoría de sitios externos, mismo problema que con Cloudinary).
>
> Mismo criterio que `docs/sucursales-open-sports.md`: es solo acopio de
> datos para cuando se retome la idea del botón "Ver en tienda" enrutado
> por provincia/ciudad del usuario. Marathon **no es** un partner
> confirmado de Huella Runner — esto es solo referencia por si se suma
> más adelante.

## Tucumán

**Sucursales:**

| Ciudad | Dirección |
|---|---|
| Aguilares | Juan Bautista Alberdi 952 |
| Concepción | Gral. José de San Martín 1234 |
| Concepción | Gral. José de San Martín 1399 |
| Monteros | Colón 180 |
| San Miguel de Tucumán | Av. 24 de Septiembre 232 |
| San Miguel de Tucumán | Junín 298 |
| San Miguel de Tucumán | 25 de Mayo 251 |
| San Miguel de Tucumán | Emilio Castelar 1201-1299 |
| San Miguel de Tucumán | Av. Gral. Roca 3440 |
| San Miguel de Tucumán | Maipú 200 |
| Tafí Viejo | Av. Leandro N. Alem 279 |
| Yerba Buena | Av. Juan Domingo Perón 1900 |
| Yerba Buena | Próxima apertura |

**Calle M:**

| Ciudad | Dirección |
|---|---|
| San Miguel de Tucumán | 25 de Mayo 251 |

**Outlet:**

| Ciudad | Dirección |
|---|---|
| Concepción | Italia 1931 |
| San Miguel de Tucumán | Av. Sarmiento 278 |
| San Miguel de Tucumán | Av. Gral. Roca 3440 |
| San Miguel de Tucumán | Emilio Castelar 1201-1299 |

## Salta

**Sucursales:**

| Ciudad | Dirección |
|---|---|
| Joaquín V. González | Av. San Martín 368 |
| Metán | Av. 9 de Julio 276 |
| Salta | Av. Tavella y Av. Ex Combatientes de Malvinas |
| Salta | La Florida 171 |
| San Lorenzo | Próxima apertura |
| Tartagal | Güemes 467 |

**Calle M:**

| Ciudad | Dirección |
|---|---|
| Salta | 20 de Febrero 1437 |
| Salta | Av. Tavella y Av. Ex Combatientes de Malvinas |

**Outlet:**

| Ciudad | Dirección |
|---|---|
| Salta | Av. Tavella y Av. Ex Combatientes de Malvinas |

## Santa Fe

**Sucursales:**

| Ciudad | Dirección |
|---|---|
| Rosario | Bv. Oroño 6000 |
| Rosario | San Luis 1261 |
| Rosario | Av. Pres. Perón 5115 |
| Rosario | Mendoza 3790 |
| Rosario | Nansen 255 |

**Outlet:**

| Ciudad | Dirección |
|---|---|
| Rosario | San Luis 1340 |

## Chaco

| Ciudad | Dirección |
|---|---|
| Resistencia | Ruta Nacional 16 y Av. Sabin 3500 |
| Roque Sáenz Peña | Próxima apertura |

## Jujuy

| Ciudad | Dirección |
|---|---|
| Gral. San Martín (Ledesma) | Belgrano 390 |

## Resumen

30 puntos listados (sucursales + Calle M + outlet, sin contar las
"Próxima apertura"): 13 en Tucumán, 8 en Salta, 6 en Santa Fe
(Rosario), 2 en Chaco, 1 en Jujuy. Sin presencia en Buenos Aires/Mar
del Plata (a diferencia de Open Sports).

## Enlaces online — estructura de URL

El fundador pasó dos ejemplos de la tienda online:

```
https://marathon.com.ar/collections/calzado-zapatillas-running/hombre?filter.v.availability=1
https://marathon.com.ar/collections/all?filter.p.product_type=Calzado&filter.v.availability=1&filter.v.option.talle=45
```

Es una tienda **Shopify** (`filter.v.option.*` es la sintaxis estándar
de filtros de colección de Shopify, distinta a la de Open Sports que
usa `talle-calzado-{talle}.html` como segmento de URL). Si en algún
momento se suma como sponsor, el link filtrado por talle se armaría
más o menos así:

```
https://marathon.com.ar/collections/all?filter.p.product_type=Calzado&filter.v.availability=1&filter.v.option.talle={talle}
```

Faltaría confirmar el segmento de género (no vino en los ejemplos que
pasó el fundador) y si "talle" acepta medios números (43.5) o solo
enteros — mismo caveat que quedó pendiente con Open Sports.
