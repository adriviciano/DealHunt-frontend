import { buscarProductosDia } from '../../../server/dia-search.mjs';

export function onRequestGet({ params }) {
  let query;
  try {
    // Pages entrega los segmentos de ruta codificados; decodifica espacios y tildes.
    query = decodeURIComponent(params.palabra);
  } catch {
    return Response.json({ error: 'Búsqueda no válida' }, { status: 400 });
  }
  return Response.json(buscarProductosDia(query), {
    headers: { 'Cache-Control': 'no-store' },
  });
}

export function onRequest() {
  return Response.json({ error: 'Método no permitido' }, {
    status: 405,
    headers: { Allow: 'GET' },
  });
}
