# Nácar Live

Aplicación para Android y Windows que consulta la API pública de GitHub y presenta el workflow reciente y la release pública más reciente de [Nácar GNU/Linux](https://github.com/CRISTOP-bot/nacar-linux) y [DylanOS](https://github.com/CRISTOP-bot/DylanOS).

## Qué muestra

- Último workflow visible en Actions y su estado real (ejecutándose, exitoso o fallido).
- Release pública más reciente y enlace directo a sus archivos.
- Fecha de actualización y manejo visible de límites o fallos de la API.
- Aviso explícito: un workflow exitoso no demuestra por sí solo que un ISO arranque ni que funcione una instalación.

No usa tokens ni requiere inicio de sesión: solo consulta información pública. Los límites de la API de GitHub aplican.

## Releases automáticas

Cada push a `main` construye Windows y Android en GitHub Actions. Si ambos builds pasan, se crea una release con instalador NSIS, portable de Windows y APK Android. El número de versión `2.0.<número de ejecución>` se asigna automáticamente; los PR ejecutan builds pero no publican. El APK está firmado con la clave de depuración de Android y es para instalación manual/pruebas, no para Google Play.

## Desarrollo

Requiere Node.js 20+. `npm install`, `npm run check` y `npm start` ejecutan la app Windows durante desarrollo. Para Android se requiere Java 21 y Android SDK; Capacitor genera el proyecto nativo con `npx cap add android` y `npx cap sync android`.

## Licencia

GPL-3.0-or-later.
