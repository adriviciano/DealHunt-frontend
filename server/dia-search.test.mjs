import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buscarProductosDia } from './dia-search.mjs';
import { onRequestGet, onRequest } from '../functions/api/dia/[palabra].js';

test('busca sin distinguir mayúsculas y conserva el contrato de productos', () => {
  const productos = buscarProductosDia('leche');
  assert.ok(productos.length > 0);
  assert.deepEqual(buscarProductosDia(' LECHE '), productos);
  for (const producto of productos) {
    assert.ok(producto.nombre.toLowerCase().includes('leche'));
    for (const campo of ['categoria', 'nombre', 'precio_unitario', 'precio_por_unidad', 'imagen']) {
      assert.equal(typeof producto[campo], 'string');
    }
  }
});

test('devuelve una lista vacía para consultas vacías o sin resultados', () => {
  assert.deepEqual(buscarProductosDia('  '), []);
  assert.deepEqual(buscarProductosDia('zzzz-producto-inexistente-zzzz'), []);
});

test('la ruta sirve JSON y rechaza otros métodos', async () => {
  const response = onRequestGet({ params: { palabra: 'leche' } });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('Content-Type'), /application\/json/);
  assert.deepEqual(await response.json(), buscarProductosDia('leche'));
  assert.equal(onRequest().status, 405);
});
