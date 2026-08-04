# Ilustraciones de los animales — OpenMoji

Los SVG de esta carpeta provienen de **OpenMoji**, el proyecto abierto de emojis
de la HfG Schwäbisch Gmünd.

- Sitio: https://openmoji.org
- Licencia: **Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**
- Texto de la licencia: https://creativecommons.org/licenses/by-sa/4.0/

## Cambios realizados

Los archivos originales se conservan aquí sin modificar. Las versiones que usa la
aplicación (`src/data/animals.ts`, generado por `scripts/generate-animals.mjs`) son
**obras derivadas**: cada ilustración se escala y se centra dentro de un lienzo de
200×200 con un fondo redondeado de color.

## Qué implica para este proyecto

CC BY-SA 4.0 es una licencia *copyleft* para las imágenes:

- Hay que mantener la atribución a OpenMoji allí donde se distribuyan (la app la
  muestra en la pantalla de inicio y el README la incluye).
- Las ilustraciones derivadas —incluidas las que se imprimen en las cartillas PDF—
  se distribuyen también bajo CC BY-SA 4.0.

El código de la aplicación sigue siendo MIT; la licencia CC BY-SA 4.0 solo alcanza a
las ilustraciones y a lo que se derive de ellas.
