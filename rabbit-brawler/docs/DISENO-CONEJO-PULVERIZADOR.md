# Diseño de Conejo Pulverizador (post-rediseño belt-scroll)

## Problema del prototipo v1

El amigo del jugador señaló correctamente que **no se sentía Beat 'em up**:

- El nivel eran **6 pantallas fijas** (arenas).
- La cámara no acompañaba un recorrido lateral.
- Faltaba la sensación de **calle/bosque continuo** con locks de pelea.

Eso lo acercaba más a un *room clearer* que a un brawler clásico.

## Objetivos del rediseño v2

1. Cumplir el checklist de `GENERO-BEATEMUP.md`.
2. Conservar el brief creativo original:
   - Conejo blanco musculoso, gráficos tipo NES.
   - Zanahorias zombies, bosque terrorífico.
   - 3 vidas, daño 0.5, lechugas.
   - Puño (1 hit) / patada (2 hits, más rango).
   - 30 enemigos, 5 por sección, 6 secciones.
   - Una zanahoria agresora a la vez.
3. Mejorar calidad: parallax, depth sorting, GO, hit feedback, jefe final.

## Arquitectura del nivel

```
Mundo X: 0 ─────────────────────────────────────────────► ~1920
         §1      §2      §3      §4      §5      §6(jefe)
         lock    lock    lock    lock    lock    lock
```

| Parámetro | Valor |
| --- | --- |
| Ancho de sección | 320 px mundo |
| Secciones | 6 |
| Enemigos / sección | 5 (sección 6: 4 + 1 **Zanahoria Rey**) |
| Total a eliminar | 30 |
| Profundidad jugable | `PLAY_TOP` … `PLAY_BOTTOM` (cinta de suelo) |
| Tolerancia de hit en profundidad | 12 px |

### Fight lock

1. El jugador camina a la derecha; la cámara lo sigue.
2. Al cruzar `lockX` de la sección actual con enemigos vivos, entra **lock**:
   - No puede avanzar más allá del borde derecho de la sección.
   - La cámara se ancla al tramo de pelea.
3. Al derrotar a todos: estado `go`, flecha **GO →**, scroll libre hasta el siguiente lock.
4. Tras la sección 6: victoria de nivel.

## Combate

| Ataque | Rango X | Daño | Uso |
| --- | --- | --- | --- |
| Puño (A / Z) | corto | 2 (mata normal en 1) | Peek-a-boo cercano |
| Patada (B / X) | largo | 1 (mata normal en 2) | Control de espacio |

- Hitbox solo si `|depthPlayer - depthEnemy| ≤ DEPTH_HIT`.
- Knockback en X y ligero en profundidad.
- Invulnerabilidad post-golpe + gracia al spawn.

### IA

- **Idle / flank**: no agresoras se posicionan a los lados y cambian de profundidad.
- **Aggressor única** (`attackLock`): approach → windup (telegraph) → strike.
- **Zanahoria Rey** (sección 6): más HP, windup más corto, daño 1.0.

## Cámara y render

- `cameraX` sigue a `player.x - W*0.35`, clamp al mundo / lock.
- Fondo en capas parallax (cielo, luna, árboles lejanos, niebla, suelo).
- Sprites ordenados por Y (profundidad) para solapamiento correcto.
- Scanlines suaves estilo NES.

## Controles

| Entrada | Acción |
| --- | --- |
| ←→↑↓ / WASD / D-pad | Movimiento en el plano |
| Z / A | Puño |
| X / B | Patada |

## Archivos

| Ruta | Rol |
| --- | --- |
| `index.html` | Shell + HUD + controles táctiles |
| `css/style.css` | UI móvil / desktop |
| `js/game.js` | Simulación belt-scroll |
| `conejo-pulverizador.html` | Build monolítico para móvil offline |
| `docs/GENERO-BEATEMUP.md` | Investigación del género |
| `docs/DISENO-CONEJO-PULVERIZADOR.md` | Este documento |

## Criterios de aceptación

- [x] Se percibe scroll lateral al caminar a la derecha sin pelea.
- [x] Al entrar en una oleada, el avance se bloquea hasta limpiar.
- [x] Aparece **GO →** y se puede seguir caminando.
- [x] Golpes fallan si el enemigo está en otra profundidad lejana.
- [x] 30 bajas completan el nivel; game over a 0 vidas.
- [x] Jugable en móvil con cruceta + A/B.

## Verificación automatizada (headless)

- Cámara avanza con el jugador antes del primer lock (`cameraX` > 0).
- Tras limpiar cada tramo: estado `go` → caminar → siguiente `sectionIndex`.
- Tramo 6 con Rey Zanahoria; al limpiar 30 enemigos → `win`.
