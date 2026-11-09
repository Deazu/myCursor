# Conejo Pulverizador

Demo **belt-scroll Beat 'em up** estilo NES para móvil (HTML5, publicable / empaquetable como APK).

Documentación:

- [`docs/GENERO-BEATEMUP.md`](docs/GENERO-BEATEMUP.md) — investigación del género
- [`docs/DISENO-CONEJO-PULVERIZADOR.md`](docs/DISENO-CONEJO-PULVERIZADOR.md) — diseño v2 y por qué el v1 no bastaba

## Por qué es un Beat 'em up

- **Scroll lateral continuo** con cámara que sigue al conejo
- Movimiento en **profundidad** (↑↓) sobre la cinta de suelo
- Golpes que requieren **alinear profundidad**
- **Fight locks**: limpias la oleada → aparece **GO →** → sigues caminando
- 6 tramos · 30 zanahorias · cierre con **Rey Zanahoria**

## Reglas (brief)

| Regla | Valor |
| --- | --- |
| Vidas | 3 (game over a 0) |
| Daño enemigo | 0.5 (Rey: 1.0) |
| Puño | corto, 2 daño (mata normal en 1) |
| Patada | más alcance, 1 daño (mata normal en 2) |
| Recuperación | lechugas (+1) |
| IA | una zanahoria agresora a la vez; el resto flanquea |
| Objetivo | 30 bajas |

## Controles

**Teclado:** WASD / flechas · `Z` puño · `X` patada  
**Táctil:** cruceta + A / B

## Jugar

```bash
cd rabbit-brawler
npm start
```

`http://localhost:4173` — también `conejo-pulverizador.html` (archivo único).

App publicada: confirma en Cursor Publish Settings / pill de la app.

## APK

```bash
npm run build:web
npm run cap:init    # primera vez
npm run cap:sync
npm run cap:open
```
