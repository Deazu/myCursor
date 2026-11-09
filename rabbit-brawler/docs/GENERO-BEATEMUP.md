# Investigación: género Beat 'em up (brawler / belt-scroll)

Documento de referencia para el rediseño de **Conejo Pulverizador**. Fuentes principales: Wikipedia (*Beat 'em up*), análisis de belt-scroll (Sechter), ensayos de diseño (Jiggeh), historia de *Streets of Rage* / *Final Fight*.

## 1. Definición

Un **beat 'em up** (también *brawler* o, en algunos mercados, *beat 'em all*) es un juego de acción centrado en combate cuerpo a cuerpo contra **muchos enemigos** a la vez.

Lo que lo distingue de un *fighting game* 1v1 o de un *platformer* de acción:

| No es | Sí es |
| --- | --- |
| Arena fija sin avance de nivel | Nivel que se **recorre** (casi siempre de izquierda a derecha) |
| Solo eje X (como Kung-Fu Master puro) | Plano con **profundidad** (eje Y / “lanes”) |
| Un duelo simétrico | Oleadas, jefes y power-ups de vida/armas |

## 2. Mecánica canónica: belt-scroll

Desde *Double Dragon* (1987) y sobre todo *Final Fight* (1989), el estándar se llama **belt-scroll**:

1. **Scroll horizontal continuo** de un escenario largo (calle, bosque, etc.).
2. Cámara ligeramente oblicua / “cinta” de suelo: el jugador se mueve en **X** (avance) y en **Y** (profundidad: acercarse/alejarse de la cámara).
3. Los golpes solo conectan si atacante y objetivo están en **profundidad similar** (misma “lane” aproximada).
4. Los enemigos pueden rodear desde delante, detrás y distintos planos de profundidad.

Sin desplazamiento lateral + profundidad, el producto se percibe como pelea en salas o arena, **no** como beat 'em up clásico. Esa fue la crítica válida al prototipo anterior (pantallas fijas 320px sin cámara que siga al jugador).

## 3. Ritmo de nivel (macro pacing)

Flujo típico de un stage:

```
caminar → encuentro (lock) → limpiar oleada → “GO →” → caminar → …
→ jefe de fin de nivel
```

- El jugador **avanza libremente** hasta un punto de encuentro.
- Al llegar, la cámara / el progreso se **bloquean** hasta derrotar al grupo.
- Al limpiar, aparece la señal de continuar (flecha **GO**) y el scroll se libera.
- Al final del stage hay un enemigo más fuerte (jefe). En esta demo: oleada final reforzada en la sección 6.

Buen pacing = variar densidad, tipos de enemigo y respiros; malo = repetir la misma pelea en cajas idénticas sin sensación de viaje.

## 4. Combate (micro pacing)

Convenciones de controles (arcade / 16-bit):

- Pocos botones (a menudo **2 ataques** + movimiento).
- Combos cortos, agarres, saltos y especiales según el título.
- Feedback claro: hitstun, knockback, barras o pips de vida, score.

En Conejo Pulverizador (restricciones del brief original):

- Solo **puño** (corto, alto daño) y **patada** (largo alcance, menos daño).
- 3 vidas; daño enemigo 0.5; lechugas recuperan.
- Las zanahorias intentan golpear **de una en una** (turno de agresión), pero el resto **rodea** en profundidad — típico de belt-scroll, no de duelistas.

## 5. Referencias clave

| Título | Aporte al género |
| --- | --- |
| *Kung-Fu Master* (1984) | Side-scroll de golpes; poco o nada de profundidad |
| *Double Dragon* (1987) | Populariza co-op y movimiento en plano con profundidad |
| *Final Fight* (1989) | Codifica el belt-scroll Capcom: sprites grandes, locks, jefe |
| *Streets of Rage* (1991–) | Consola: personajes distintos, especiales, pacing de stages |

## 6. Checklist de autenticidad (lo que debe cumplir la demo)

- [x] Scroll horizontal continuo con cámara que sigue al jugador
- [x] Movimiento libre en profundidad (Y) dentro de la “cinta” de suelo
- [x] Colisión de golpes condicionada por profundidad
- [x] Secciones con **fight lock** + señal **GO →** al limpiar
- [x] Oleadas a lo largo de un bosque largo (viaje), no 6 arenas sueltas
- [x] HUD de progreso de stage / kills / vidas
- [x] Power-up de vida en el recorrido
- [x] Jefe o cierre de stage en la última sección
