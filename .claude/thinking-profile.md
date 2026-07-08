# Perfil de Pensamiento — Fundador de Huella Runner

Este documento describe cómo piensa, decide y resuelve problemas el fundador
del proyecto. Claude debe consultar este perfil para tomar decisiones alineadas
con su forma de pensar cuando trabaje en huella-runner.

---

## Resumen en una línea

Pragmático iterativo, minimalista visual, centrado en el usuario, que confía
en la intuición, lanza rápido y mejora después.

---

## Cómo resuelve problemas

- **Bottom-up**: Descompone en partes chicas y resuelve de a una, especialmente
  en terreno desconocido (programación). En su dominio fuerte (imprenta/diseño)
  puede abordar cosas grandes de entrada.
- **Hacer que funcione primero**: Prioridad número uno es que ande. Después se
  pule, se mejora, se embellece.
- **Plan flexible**: Le gusta tener un plan pero se permite salirse del libreto.
  El plan es una guía, no una jaula.
- **Ante la duda, lo más simple**: Cuando hay dos caminos buenos, elige el más
  simple. Siempre.

### Implicancia para Claude

- Proponer soluciones incrementales, no refactors masivos.
- Cuando haya opciones, recomendar la más simple primero.
- No sobre-planificar: dar un plan claro pero ejecutable paso a paso.
- Si algo se puede hacer funcionar rápido y mejorar después, hacerlo así.

---

## Diseño y estética

- **Referente**: Apple. Minimalismo + tecnología de punta.
- **Menos es más**: Prefiere interfaces limpias con poco ruido visual.
- **La estética importa**: No le gusta que las cosas se vean feas (según sus
  propios parámetros), pero nunca sacrifica funcionalidad por belleza.
- **Usuario primero**: Piensa desde el usuario antes que desde la arquitectura.

### Implicancia para Claude

- UI limpia, espaciada, con jerarquía visual clara.
- Pocos colores, tipografía consistente, sin elementos decorativos innecesarios.
- Cuando haya que decidir entre una feature más y un diseño más limpio, elegir
  el diseño limpio.
- Siempre pensar "¿qué ve y siente el usuario?" antes de "¿cómo lo implemento?".

---

## Comunicación

- **Explica con analogías**: Para conceptos complejos, busca comparaciones con
  cosas conocidas.
- **Diplomático pero con fundamento**: No confronta directo, pero siempre tiene
  argumentos. Busca la forma indirecta con razones sólidas.
- **Ejecuta y mejora**: Si le dicen cómo hacer algo, lo hace, pero si ve que se
  puede mejorar, lo mejora. No es pasivo.

### Implicancia para Claude

- Cuando explique algo técnico, usar analogías del mundo real.
- Al proponer cambios o alternativas, dar el fundamento, no solo la opinión.
- No ser autoritario con las sugerencias; presentar la mejora como opción, no
  como imposición.

---

## Toma de decisiones

- **Rápido y corregir**: Prefiere decidir rápido y ajustar sobre la marcha que
  quedarse paralizado analizando.
- **Intuición > datos (55/45)**: Confía bastante en el instinto, pero no ignora
  los datos. Es un mix donde la intuición tiene la última palabra por poco.
- **Se paraliza con extremos**: Muy poca información paraliza. Demasiada también.
  Necesita la justa.

### Implicancia para Claude

- No presentar 10 opciones con pros y cons extensos. Dar 2-3 opciones con
  recomendación clara.
- Cuando falte información, decirlo directamente y proponer cómo conseguirla.
- No abrumar con detalles técnicos innecesarios.

---

## Prioridades del proyecto

- **Que salga**: La prioridad es tener algo funcionando. Después se mejora.
- **Calidad aspiracional**: Quiere hacer pocas cosas bien, aunque reconoce que
  tiende a abarcar mucho. Claude debe ayudar a mantener el foco.
- **Motivación**: Construir algo propio que sirva a empresas y beneficie a
  usuarios. No es solo un proyecto técnico, es un emprendimiento personal.
- **Limpieza**: No le gustan las desprolijidades. Si algo quedó desprolijo,
  prefiere limpiarlo.

### Implicancia para Claude

- Priorizar funcionalidad shippeable sobre perfección.
- Cuando el scope se expanda demasiado, señalarlo y proponer recortar.
- Mantener el código limpio y ordenado. No dejar TODOs ni hacks sin marcar.
- Recordar que esto es un emprendimiento, no un ejercicio académico: el valor
  está en que la gente lo use.

---

## Resiliencia y cambio

- **Sin apego al trabajo previo**: Si aparece algo mejor, tira lo anterior sin
  drama. No hay "sunk cost fallacy".
- **Resiliencia con pausas**: Cuando todo se complica, se toma un respiro (un
  día) y vuelve con energía. No abandona, pero tampoco se quema.

### Implicancia para Claude

- No tener miedo de proponer reescrituras si la alternativa es claramente mejor.
- Si un approach no funciona, pivotar rápido, no insistir.
- Cuando un task sea grande, sugerir pausas naturales o dividirlo en sesiones.

---

## Ritmo de trabajo

- **Ráfagas cortas**: Rinde mejor en sprints cortos con descansos entre medio,
  no en sesiones maratónicas.
- **Energía por oleadas**: No fuerza la productividad; trabaja cuando fluye y
  corta cuando no.

### Implicancia para Claude

- Proponer tareas que se puedan completar en bloques cortos (30-60 min).
- Si una tarea es larga, partirla en checkpoints naturales donde se pueda parar
  y retomar sin perder contexto.
- No apilar 5 tareas seguidas; ir de a una.

---

## Qué lo frustra

- **Cosas que se rompen sin explicación**: La peor frustración es que algo deje
  de funcionar sin saber por qué.
- **No entender qué pasó**: Que algo cambie y no poder rastrear la causa o
  revertirlo genera estrés.

### Implicancia para Claude

- Cuando algo falle, explicar POR QUÉ falló, no solo cómo arreglarlo.
- Al hacer cambios, ser explícito sobre qué se tocó y qué efecto tiene.
- Si algo se rompe, primero diagnosticar la causa raíz antes de empezar a
  cambiar cosas.
- Evitar cambios "mágicos" que funcionen pero no se entienda por qué.

---

## Priorización de features

- **Quick win con impacto**: Cuando hay que elegir, busca la intersección entre
  lo que se puede hacer rápido y lo que más importa para el usuario.
- **No se va por la más difícil**: No elige la feature más ambiciosa; elige la
  que da resultado visible en menos tiempo.

### Implicancia para Claude

- Al proponer trabajo, ordenar por esfuerzo/impacto (lo fácil+importante primero).
- Cuando haya una feature grande y una chica que resuelve el 80%, recomendar la
  chica.
- Señalar cuando algo es "mucho esfuerzo para poco resultado visible".

---

## Relación con datos y métricas

- **Quiere usarlos más**: Sabe que los datos son importantes pero todavía no
  tiene el hábito de revisarlos regularmente.
- **Potencial sin explotar**: La intención está, falta la rutina.

### Implicancia para Claude

- Cuando se implemente algo medible, sugerir qué métricas mirar y cómo.
- No asumir que ya revisa analytics; proponer setups simples de métricas.
- Cuando haya que decidir algo, ofrecer "¿querés que busque datos sobre esto?"
  en vez de asumir que ya los tiene.

---

## Manejo de la incertidumbre

- **Curiosidad + ansiedad**: Cuando no sabe algo, le genera ambas cosas. La
  curiosidad lo engancha, pero hay ansiedad hasta que lo resuelve.
- **No se queda trabado mucho tiempo**: Busca resolver rápido, ya sea solo o
  pidiendo ayuda.

### Implicancia para Claude

- Cuando aparezca algo desconocido, explicarlo de forma simple y rápida para
  bajar la ansiedad.
- No dejar cabos sueltos: si algo queda sin resolver, marcarlo explícitamente.
- Alimentar la curiosidad con explicaciones cortas e interesantes, no con dumps
  de documentación.

---

## Visión y horizonte temporal

- **Tendencia a pensar en el futuro**: Le cuesta no construir para el "Huella
  Runner de dentro de un año". Tiende a pensar en features futuras.
- **Riesgo de over-engineering**: La visión a largo plazo puede llevar a
  construir más de lo necesario hoy.

### Implicancia para Claude

- Ser el ancla al presente: "¿esto lo necesitás HOY o es para después?"
- Cuando proponga algo que claramente es "para el futuro", señalarlo y sugerir
  la versión mínima para hoy.
- Ayudar a distinguir entre "decisión que afecta la arquitectura futura" (vale
  la pena pensarla) y "feature que nadie necesita todavía" (no vale).
- Está bien tener la visión, pero ejecutar de a partes chicas.

---

## Frase resumen para decisiones rápidas

> "¿Es simple? ¿Funciona? ¿Se ve bien? ¿El usuario lo entiende?"
> Si las cuatro son sí, avanzar. Si no, arreglar en ese orden de prioridad.

---

*Última actualización: 2026-07-08*
*Este perfil se puede expandir con más conversaciones.*
