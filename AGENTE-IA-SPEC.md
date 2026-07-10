# Huella Runner — Agente IA para Panel de Administrador

> Documento de especificación. Origen: conversación de diseño (julio 2026).
> Para Claude Code: leé este doc completo antes de tocar código. Es la fuente de verdad de esta feature.

---

## 1. Contexto del proyecto

Huella Runner es una webapp minimalista que hace **una sola cosa bien**:

- Registra **usuarios** (corredores)
- Registra **zapatillas** (marca / modelo por usuario)
- Registra **kilómetros** corridos (asociados a usuario y zapatilla)

No se va a expandir el alcance de la app de cara al usuario final. La nueva feature vive **exclusivamente en el panel de administrador**.

## 2. Objetivo de la feature

Agregar un **agente IA** (Claude vía API de Anthropic) al panel de admin, con acceso de **solo lectura** a los datos, para:

1. Explotar los datos existentes sin construir decenas de pantallas de estadísticas.
2. Generar material comercial con datos reales para conseguir **sponsors y collabs** con negocios de indumentaria/zapatillas deportivas (objetivo de negocio principal del fundador).

## 3. Capacidades del agente (una sola base, tres usos)

Es **un único agente** con acceso de lectura a la base de datos. Las tres capacidades son distintas formas de preguntarle, no tres desarrollos separados.

### 3.1 Analista de datos en lenguaje natural — *prioridad Fase 1*
El admin pregunta en lenguaje natural y el agente consulta los datos y responde.

Ejemplos:
- "¿Cuántos km se corrieron este mes?"
- "¿Qué marca de zapatilla es la más usada?"
- "¿Cuántos usuarios activos tengo?"
- "Top 10 corredores por km del último trimestre"

Salida: número directo, resumen corto o tabla simple. Gráficos: opcional, fase posterior.

### 3.2 Generador de material para sponsors — *prioridad Fase 1*
El admin pide un pitch y el agente lo redacta usando **datos reales** de la plataforma.

Ejemplo de input: "Armame un pitch para un local de zapatillas."
Ejemplo de output esperado: argumento de venta con métricas posta ("120 corredores activos, 4.500 km mensuales, 40% usa Nike"), tono profesional, listo para copiar y enviar.

### 3.3 Detector de insights — *Fase 2*
El agente detecta patrones útiles sin que se le pregunte.

Ejemplo: "15 usuarios superaron los 600 km con la misma zapatilla → momento ideal para ofrecerles descuento en una nueva" (gancho directo para una collab).

Implementación sugerida Fase 2: botón "Buscar insights" en el panel (on-demand). Automatizarlo con cron/scheduled job queda para más adelante.

## 4. Enfoque técnico

### Arquitectura general
```
Panel Admin (frontend)
   └─> Backend propio (endpoint /admin/agent)
         ├─> API de Anthropic (claude, /v1/messages, con tool use)
         └─> Base de datos (SOLO LECTURA)
```

### Reglas clave
- **La API key de Anthropic vive en el backend.** Nunca en el frontend.
- **Acceso solo lectura a la DB.** El agente no crea, edita ni borra nada. Idealmente usar un usuario de DB con permisos de solo lectura o funciones de consulta acotadas.
- **Tool use:** exponer al modelo herramientas tipo `query_stats(metric, period)`, `top_shoes(limit)`, `active_users(period)` en vez de SQL libre. Empezar con 3-5 tools simples; agregar según necesidad real.
- **Sin datos sensibles al modelo:** enviar datos agregados o anonimizados cuando sea posible (para pitches alcanza con totales y porcentajes).
- **Auth:** el endpoint del agente solo accesible para rol admin.

### Modelo sugerido
`claude-sonnet-4-6` como default (buen balance costo/calidad para consultas de datos y redacción). Se puede subir de modelo si los pitches necesitan más pulido.

## 5. UI del panel (lineamientos)

Estética minimalista tipo Apple, consistente con el resto de la app:
- Un chat simple dentro del panel admin: input abajo, historial arriba, mucho aire.
- 3-4 chips de acciones rápidas sobre el input: "Resumen del mes", "Zapatilla más usada", "Pitch para sponsor".
- Pocos colores, tipografía consistente, cero decoración innecesaria.
- Respuestas del agente en texto limpio; tablas solo cuando aporten.

## 6. Plan de fases

| Fase | Alcance | Criterio de listo |
|------|---------|-------------------|
| **1** | Endpoint backend + 3-5 tools de lectura + chat en panel admin + capacidades 3.1 y 3.2 | El admin pregunta métricas y genera un pitch con datos reales |
| **2** | Detector de insights (botón on-demand) + chips de acciones rápidas | Un click devuelve 2-3 insights accionables |
| **3** (opcional) | Gráficos en respuestas, insights automáticos programados | Solo si la Fase 1-2 demuestra uso real |

## 7. Filosofía de implementación (para Claude Code)

- **Que funcione primero, pulir después.** Incremental, sin refactors masivos.
- **Ante dos caminos buenos, el más simple.**
- **Código limpio, sin TODOs ni hacks sin marcar.**
- **Si el alcance se expande, frenar y recortar.** Esta feature es un chat de admin con tools de lectura — nada más.
