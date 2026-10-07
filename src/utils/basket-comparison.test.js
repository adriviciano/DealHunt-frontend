import { buildStoreBasket, findEquivalent, packSize } from './basket-comparison';
import { genericById, matchesGeneric } from '../models/generic-products';

const milk = (store, price = '1,00 €', reference = '(1,00 €/L)', name = 'Leche entera marca brik 1 l') => ({ nombre: name, supermercado: store, precio_unitario: price, precio_por_unidad: reference, imagen: '/milk.png', quantity: 1, genericId: 'leche-entera' });

test('separa entera, semidesnatada, sin lactosa y productos con leche', () => {
  const generic = genericById('leche-entera');
  expect(matchesGeneric(milk('Dia'), generic)).toBe(true);
  for (const name of ['Leche semidesnatada 1 l', 'Leche entera sin lactosa 1 l', 'Chocolate con leche entera', 'Leche entera fresca 1 l']) {
    expect(matchesGeneric({ nombre: name }, generic)).toBe(false);
  }
});

test('convierte referencias por kilo, litro, 100 ml y docena', () => {
  expect(packSize(milk('Dia', '6,00 €', '(1,00 €/L)'))).toEqual({ amount: 6, unit: 'L' });
  expect(packSize(milk('Dia', '2,00 €', '(0,40 €/100 ML.)'))).toEqual({ amount: 0.5, unit: 'L' });
  expect(packSize(milk('Dia', '3,00 €', '(6,00 €/kg)'))).toEqual({ amount: 0.5, unit: 'kg' });
  expect(packSize(milk('Dia', '4,00 €', '(2,00 €/dc)'))).toEqual({ amount: 24, unit: 'ud' });
});

test('adapta seis litros a seis envases y elige el coste más bajo', () => {
  const item = { ...milk('Dia'), quantity: 6 };
  const result = findEquivalent(item, 'Mercadona', [milk('Mercadona', '0,90 €', '(0,90 €/L)'), milk('Mercadona', '6,00 €', '(1,00 €/L)')]);
  expect(result.status).toBe('matched');
  expect(result.quantity).toBe(6);
  expect(result.product.precio_unitario).toBe('0,90 €');
});

test('rechaza un pack demasiado grande y formatos de otra unidad', () => {
  expect(findEquivalent(milk('Dia'), 'Mercadona', [milk('Mercadona', '6,00 €', '(1,00 €/L)')]).status).toBe('missing');
  expect(findEquivalent(milk('Dia'), 'Mercadona', [milk('Mercadona', '1,00 €', '(1,00 €/kg)')]).status).toBe('missing');
});

test('rechaza diferencias superiores al 10 % y cantidades desconocidas', () => {
  expect(findEquivalent(milk('Dia'), 'Mercadona', [milk('Mercadona', '1,50 €', '(1,00 €/L)')]).status).toBe('missing');
  expect(findEquivalent({ ...milk('Dia'), precio_por_unidad: '' }, 'Mercadona', [milk('Mercadona')]).status).toBe('missing');
});

test('conserva la selección original al comprar en el mismo supermercado', () => {
  const item = milk('Mercadona', '1,50 €', '(1,50 €/L)');
  expect(findEquivalent(item, 'Mercadona', [milk('Mercadona')]).product).toBe(item);
});

test('una cesta incompleta muestra solo subtotal y nunca total comparable', () => {
  const items = [milk('Dia'), { ...milk('Dia'), genericId: 'cafe-soluble', nombre: 'Café soluble clásico', precio_por_unidad: '(10 €/kg)' }];
  const basket = buildStoreBasket(items, 'Mercadona', { 'leche-entera': { status: 'ready', products: [milk('Mercadona')] }, 'cafe-soluble': { status: 'ready', products: [] } });
  expect(basket.complete).toBe(false);
  expect(basket.missing).toBe(1);
  expect(basket.subtotal).toBe(1);
});

test('distingue catálogo no consultado, error de conexión y falta de equivalente', () => {
  expect(buildStoreBasket([milk('Dia')], 'Mercadona', {}).loading).toBe(true);
  expect(buildStoreBasket([milk('Dia')], 'Mercadona', { 'leche-entera': { status: 'ready', products: [], missingStores: ['Mercadona'] } }).rows[0].status).toBe('error');
  expect(buildStoreBasket([milk('Dia')], 'Mercadona', { 'leche-entera': { status: 'ready', products: [] } }).rows[0].status).toBe('missing');
});
