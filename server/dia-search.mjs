import productos from './productos-dia.mjs';

// Conserva la búsqueda del backend original sobre su catálogo local.
export function buscarProductosDia(palabra) {
  const normalizar = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  const consulta = normalizar(palabra);
  if (!consulta) return [];
  return productos.filter(producto => normalizar(producto.nombre).includes(consulta));
}
