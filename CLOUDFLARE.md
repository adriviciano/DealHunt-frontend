# DealHunt en Cloudflare Pages

Frontend y API temporal: https://dealhunt-frontend.pages.dev/

## Despliegue automático

- Repositorio: adriviciano/DealHunt-frontend, rama main.
- Directorio raíz: raíz del repositorio.
- Compilación: `npm run build`; salida: `build`.
- API por defecto: `/api`. No requiere variables.
- `REACT_APP_API_URL` permite apuntar a otro backend al compilar. Es una variable pública.

Cloudflare compila también `functions/` y publica la API mediante Pages Functions. No subir únicamente `build` mediante arrastrar y soltar: eso no despliega estas funciones.

## Backend temporal

`GET /api/dia/:palabra` reproduce la búsqueda por nombre del servidor Express original. El catálogo `server/productos-dia.json` es una copia de `DealHunt-backend/server/dia/productos_dia.json` tomada el 20 de septiembre de 2026; esa fecha no indica cuándo se actualizaron los precios. No se actualiza automáticamente. Para actualizarlo, copiar de nuevo el catálogo y desplegar.

La API comparte dominio con el frontend y no necesita CORS. El catálogo se incluye en la función, fuera de los archivos estáticos y del paquete del navegador. `_routes.json` limita la ejecución de funciones a `/api/*`.

Mercadona mantiene la consulta existente a Algolia desde el navegador.

## Desarrollo local

Requiere Node 22 o posterior para las pruebas de API.

```sh
npm ci
npm start
```

El servidor de desarrollo redirige `/api` a la API temporal de Pages; permite trabajar en Windows sin arrancar el servidor original. Para cambiar el backend local, modificar `proxy` en `package.json` y reiniciar el servidor de desarrollo.

```sh
npm run test:api
npm run build
```

Para desarrollar las funciones localmente, compilar y usar `npx wrangler pages dev build` desde este directorio.

Documentación: https://developers.cloudflare.com/pages/functions/get-started/
