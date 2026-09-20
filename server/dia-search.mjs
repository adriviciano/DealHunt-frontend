import productos from './productos-dia.json' with { type: 'json' };

// Conserva la búsqueda del backend original sobre su catálogo local.
export function buscarProductosDia(palabra) {
  const consulta = palabra.trim().toLowerCase();
  if (!consulta) return [];
  return productos.filter(producto => producto.nombre.toLowerCase().includes(consulta));
}
