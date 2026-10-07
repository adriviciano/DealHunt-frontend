import { genericById, inferGeneric, matchesGeneric, normalize } from '../models/generic-products';
import { priceNumber } from './products';

export const itemGeneric = item => genericById(item.genericId) || inferGeneric(item);

// El precio de referencia permite calcular litros/kilos del envase, incluidos packs.
export function packSize(product) {
  const reference = normalize(product.precio_por_unidad).replace(',', '.');
  const match = reference.match(/([\d.]+)\s*€\s*\/\s*(?:(100)\s*)?(kg|gr\.?|g|ml\.?|l\.?|litro|ud\.?|unidad|dc|docena)(?:\b|\))/);
  const price = priceNumber(product.precio_unitario);
  if (!match || !price || Number(match[1]) <= 0) return null;
  const rawUnit = match[3].replace('.', '');
  const unit = ['g', 'gr', 'kg'].includes(rawUnit) ? 'kg' : ['ml', 'l', 'litro'].includes(rawUnit) ? 'L' : 'ud';
  const scale = (match[2] ? 100 : 1) * (['g', 'gr', 'ml'].includes(rawUnit) ? 0.001 : ['dc', 'docena'].includes(rawUnit) ? 12 : 1);
  let amount = price / Number(match[1]) * scale;
  if (unit === 'ud') {
    const rounded = Math.round(amount);
    if (Math.abs(rounded - amount) > 0.12 || rounded < 1) return null;
    amount = rounded;
  }
  return { amount, unit };
}

export function findEquivalent(item, store, products) {
  const generic = itemGeneric(item);
  if (item.supermercado === store) return { status: 'matched', product: item, quantity: item.quantity, original: true, size: packSize(item) };
  if (!generic || !matchesGeneric(item, generic)) return { status: 'missing', reason: 'Tipo pendiente de definir: elige un producto genérico para comparar.' };
  const sourceSize = packSize(item);
  if (!sourceSize) return { status: 'missing', reason: 'No se puede comprobar la cantidad de este envase.' };
  const targetAmount = sourceSize.amount * item.quantity;
  const options = products.filter(product => product.supermercado === store && matchesGeneric(product, generic)).flatMap(product => {
    const size = packSize(product);
    if (!size || size.unit !== sourceSize.unit) return [];
    // Nunca se compra menos cantidad: se permiten hasta un 10 % más por redondeo/envases.
    const quantity = Math.max(1, Math.ceil(targetAmount / size.amount - 0.015));
    const difference = (size.amount * quantity - targetAmount) / targetAmount;
    if (difference < -0.015 || difference > 0.10) return [];
    return [{ status: 'matched', product, quantity, original: false, size, difference, targetAmount }];
  });
  options.sort((a, b) => priceNumber(a.product.precio_unitario) * a.quantity - priceNumber(b.product.precio_unitario) * b.quantity || Math.abs(a.difference) - Math.abs(b.difference));
  return options[0] || { status: 'missing', reason: 'No encontramos el mismo tipo con una cantidad comparable.' };
}

export function buildStoreBasket(items, store, catalogs) {
  const rows = items.map(item => {
    const generic = itemGeneric(item);
    const catalog = generic ? catalogs[generic.id] : null;
    if (item.supermercado !== store && generic && (!catalog || catalog.status === 'loading')) return { item, status: 'loading' };
    if (item.supermercado !== store && catalog?.status === 'error') return { item, status: 'error', reason: 'No se pudo consultar el catálogo. Reintenta la comparación.' };
    if (item.supermercado !== store && catalog?.missingStores?.includes(store)) return { item, status: 'error', reason: `No se pudo consultar ${store === 'Dia' ? 'DIA' : store}.` };
    return { item, ...findEquivalent(item, store, catalog?.products || []) };
  });
  const complete = rows.every(row => row.status === 'matched');
  const loading = rows.some(row => row.status === 'loading');
  const subtotal = rows.reduce((sum, row) => row.status === 'matched' ? sum + priceNumber(row.product.precio_unitario) * row.quantity : sum, 0);
  return { store, rows, complete, loading, subtotal, missing: rows.filter(row => row.status !== 'matched').length };
}
