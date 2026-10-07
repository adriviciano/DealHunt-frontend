export const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// Las familias separan características que no deben cambiar al sustituir un producto.
export const genericProducts = [
  { id: 'leche-entera', name: 'Leche entera', query: 'leche entera', match: /^leche entera\b/, exclude: /sin lactosa|fresca|proteina|calcio|condensada|polvo/ },
  { id: 'leche-semi', name: 'Leche semidesnatada', query: 'leche semidesnatada', match: /^leche semidesnatada\b/, exclude: /sin lactosa|fresca|proteina|calcio/ },
  { id: 'leche-desnatada', name: 'Leche desnatada', query: 'leche desnatada', match: /^leche desnatada\b/, exclude: /sin lactosa|fresca|proteina|calcio/ },
  { id: 'leche-entera-sin-lactosa', name: 'Leche entera sin lactosa', query: 'leche entera', match: /^leche entera\b.*sin lactosa/, exclude: /fresca|proteina|calcio/ },
  { id: 'pan-molde', name: 'Pan de molde blanco', query: 'pan', aliases: ['pan'], match: /^pan (de )?molde\b/, exclude: /integral|semilla|sin gluten|sin corteza|brioche|rustico|espelta|centeno|maiz|proteina/ },
  { id: 'pan-integral', name: 'Pan de molde integral', query: 'pan', match: /^pan (de )?molde\b.*integral/, exclude: /semilla|sin gluten|sin corteza|espelta|centeno/ },
  { id: 'cafe-soluble', name: 'Café soluble', query: 'café soluble', match: /^cafe soluble\b/, exclude: /descafeinado|cappuccino|capuchino|mezcla|torrefacto|con leche/ },
  { id: 'cafe-soluble-descafeinado', name: 'Café soluble descafeinado', query: 'café soluble descafeinado', match: /^cafe soluble\b.*descafeinado/, exclude: /cappuccino|capuchino|con leche/ },
  { id: 'arroz-largo', name: 'Arroz largo', query: 'arroz largo', aliases: ['arroz'], match: /^arroz\b.*largo/, exclude: /integral|cocido|basmati|salvaje|vaporizado/ },
  { id: 'arroz-redondo', name: 'Arroz redondo', query: 'arroz redondo', match: /^arroz\b.*redondo/, exclude: /integral|cocido|bomba/ },
  { id: 'aceite-oliva-virgen-extra', name: 'Aceite de oliva virgen extra', query: 'aceite', aliases: ['aceite de oliva'], match: /^aceite\b.*oliva virgen extra/, exclude: /spray|aromatizado/ },
  { id: 'huevos-m', name: 'Huevos M', query: 'huevos', aliases: ['huevos'], match: /^huevos\b.*\bm\b/, exclude: /ecologico|campero|cocido|codorniz|clara|m\/l/ },
  { id: 'huevos-l', name: 'Huevos L', query: 'huevos', match: /^huevos\b.*\bl\b/, exclude: /ecologico|campero|cocido|codorniz|clara|m\/l/ },
  { id: 'azucar', name: 'Azúcar blanco', query: 'azúcar', match: /^azucar\b/, exclude: /moreno|cana|glas|vainill/ },
  { id: 'sal', name: 'Sal fina', query: 'sal', match: /^sal (marina )?fina\b/, exclude: /yodada|hierba/ },
  { id: 'espaguetis', name: 'Espaguetis', query: 'espagueti', match: /^(espagueti|spaghetti)/, exclude: /integral|sin gluten|huevo/ },
];

export const genericById = id => genericProducts.find(item => item.id === id);
export function matchesGeneric(product, generic) {
  const name = normalize(product.nombre);
  return Boolean(generic && generic.match.test(name) && !generic.exclude.test(name));
}
export function inferGeneric(product) {
  return genericProducts.find(generic => matchesGeneric(product, generic));
}
export function resolveGeneric(query) {
  const normalized = normalize(query);
  return genericProducts.find(generic => normalize(generic.name) === normalized || generic.aliases?.some(alias => normalize(alias) === normalized));
}
