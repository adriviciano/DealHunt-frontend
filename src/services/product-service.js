import { productId } from '../utils/products';

const server = (process.env.REACT_APP_API_URL || '/api').replace(/\/+$/, '');
const mercadonaUrl = 'https://7uzjkl1dj0-dsn.algolia.net/1/indexes/products_prod_4315_es/query?x-algolia-application-id=7UZJKL1DJ0&x-algolia-api-key=9d8f2e39e90df472b4f2e559a116fe17';

async function readJson(url, options) {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  if (options.signal?.aborted) cancel();
  options.signal?.addEventListener('abort', cancel, { once: true });
  const timer = setTimeout(cancel, 15000);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error('No se pudo consultar el supermercado.');
    return await response.json();
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', cancel);
  }
}

export async function searchProducts(query, signal) {
  const [dia, mercadona] = await Promise.allSettled([
    readJson(`${server}/dia/${encodeURIComponent(query)}`, { signal }).then(items => {
      if (!Array.isArray(items)) throw new Error('Catálogo no disponible.');
      return items.map(item => ({ ...item, supermercado: 'Dia' }));
    }),
    readJson(mercadonaUrl, {
      method: 'POST', signal, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params: new URLSearchParams({ query, hitsPerPage: '100' }).toString() }),
    }).then(data => {
      if (!Array.isArray(data.hits)) throw new Error('Catálogo no disponible.');
      return data.hits.map(item => ({
        id: item.objectID, supermercado: 'Mercadona', nombre: item.display_name,
        categoria: item.categories?.[0]?.name || '',
        precio_unitario: `${item.price_instructions.unit_price} €`,
        precio_por_unidad: `(${item.price_instructions.reference_price} €/${item.price_instructions.reference_format})`,
        imagen: item.thumbnail,
      }));
    }),
  ]);
  if (signal?.aborted) throw new DOMException('Búsqueda cancelada', 'AbortError');
  const missing = [];
  if (dia.status === 'rejected') missing.push('DIA');
  if (mercadona.status === 'rejected') missing.push('Mercadona');
  if (missing.length === 2) throw new Error('No hemos podido conectar con los supermercados. Prueba de nuevo en un momento.');
  const allProducts = [dia, mercadona].flatMap(result => result.status === 'fulfilled' ? result.value : []);
  const products = [...new Map(allProducts.map(product => [productId(product), product])).values()];
  return { products, missingStores: [dia.status === 'rejected' ? 'Dia' : null, mercadona.status === 'rejected' ? 'Mercadona' : null].filter(Boolean), warning: missing.length ? `No hemos podido consultar ${missing.join(' y ')}. Te mostramos los resultados disponibles.` : '' };
}
