import { buscarProductosDia } from '../../../server/dia-search.mjs';

export function onRequestGet({ params }) {
  return Response.json(buscarProductosDia(params.palabra), {
    headers: { 'Cache-Control': 'no-store' },
  });
}

export function onRequest() {
  return Response.json({ error: 'Método no permitido' }, {
    status: 405,
    headers: { Allow: 'GET' },
  });
}
