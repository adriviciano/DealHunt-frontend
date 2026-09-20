export const money = value => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
export const priceNumber = value => Number.parseFloat(String(value).replace(',', '.')) || 0;
export const productId = item => `${item.supermercado}:${item.id || `${item.nombre}:${item.imagen}:${item.precio_unitario}`}`;

export function readShoppingList() {
  try {
    const items = JSON.parse(localStorage.getItem('dealhunt-shopping-list') || '[]');
    if (!Array.isArray(items)) return [];
    return items.filter(item => item && typeof item.nombre === 'string' &&
      typeof item.precio_unitario === 'string' && typeof item.imagen === 'string' &&
      ['Dia', 'Mercadona'].includes(item.supermercado) && Number.isInteger(item.quantity) && item.quantity > 0);
  } catch { return []; }
}
