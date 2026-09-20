# Despliegue en Cloudflare Pages

Este proyecto usa Create React App. La salida de producción es `build`.

## Configuración

- Repositorio: `adriviciano/DealHunt-frontend`.
- Directorio raíz: raíz del repositorio (dejar vacío).
- Comando de compilación: `npm run build`.
- Directorio de salida: `build`.
- Variable de compilación: `REACT_APP_API_URL=https://backend-dealhunt.adriviciano.com`.

Las variables `REACT_APP_*` quedan incluidas en el código público. La URL de API debe ser HTTPS. Cambiar esta variable requiere volver a compilar.

## Compilación local

```sh
npm ci
npm run build
```

La carpeta `build` puede subirse mediante Direct Upload en Cloudflare Pages. Para despliegues automáticos, conectar el repositorio y utilizar la configuración anterior.

## Conexión con el backend

El backend actual permite CORS únicamente desde `https://dealhunt.adriviciano.com`. Para probar con la URL asignada por Pages, añadir ese origen exacto a la configuración CORS del backend y desplegar ese cambio en el servidor. No habilitar todos los subdominios de Pages.

Si se conserva el dominio actual, asociarlo al proyecto de Pages y comprobar el despliegue antes de cambiar sus registros DNS. Verificar una búsqueda real y la lista de la compra tras el cambio.

Documentación: https://developers.cloudflare.com/pages/configuration/build-configuration/
