# Conejo Pulverizador

Demo de un solo nivel **Beat'em up** estilo NES para móvil (web, empaquetable como APK).

## Historia

Un conejo blanco musculoso recorre un bosque terrorífico y elimina zanahorias zombies a puñetazos y patadas.

## Reglas de la demo

| Regla | Valor |
| --- | --- |
| Vidas del conejo | 3 (se acaba el juego al llegar a 0) |
| Daño enemigo | 0.5 por golpe |
| Ataques | Puño (corto, 1 golpe mata) · Patada (más alcance, 2 golpes matan) |
| Recuperación | Lechugas al azar (+1 vida) |
| IA enemiga | Solo una zanahoria intenta golpear a la vez |
| Pantallas | 6 |
| Enemigos por pantalla | 5 |
| Objetivo | Eliminar 30 zanahorias |

No puedes avanzar de pantalla hasta limpiar a todos los enemigos de la actual.

## Controles

**Teclado:** WASD / flechas · `Z` puño · `X` patada · Enter para menús  
**Táctil:** cruceta + botones A (puño) / B (patada)

## Jugar en el navegador

```bash
cd rabbit-brawler
npm start
```

Abre `http://localhost:4173` (también funciona sirviendo la carpeta con cualquier static server).

En el teléfono: abre la misma URL en la red local, o despliega la carpeta como sitio estático / PWA.

## Generar APK (Android)

La demo es HTML5/Canvas. Para APK usa Capacitor:

```bash
cd rabbit-brawler
npm run build:web
npm run cap:init    # solo la primera vez
npm run cap:sync
npm run cap:open    # abre Android Studio → Build APK / Bundle
```

Requisitos: Android Studio, JDK y SDK de Android instalados en tu máquina.
