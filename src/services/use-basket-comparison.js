import { useEffect, useMemo, useState } from 'react';
import { genericById } from '../models/generic-products';
import { buildStoreBasket, itemGeneric } from '../utils/basket-comparison';
import { searchProducts } from './product-service';

export function useBasketComparison(items) {
  const [catalogs, setCatalogs] = useState({});
  const [revision, setRevision] = useState(0);
  const signature = [...new Set(items.map(item => itemGeneric(item)?.id).filter(Boolean))].sort().join(',');

  useEffect(() => {
    const ids = signature ? signature.split(',') : [];
    const controller = new AbortController();
    setCatalogs({});
    for (const id of ids) {
      const generic = genericById(id);
      searchProducts(generic.query, controller.signal).then(result => {
        if (!controller.signal.aborted) setCatalogs(previous => ({ ...previous, [id]: { ...result, status: 'ready' } }));
      }).catch(reason => {
        if (reason.name !== 'AbortError' && !controller.signal.aborted) setCatalogs(previous => ({ ...previous, [id]: { status: 'error' } }));
      });
    }
    return () => controller.abort();
  }, [signature, revision]);

  const baskets = useMemo(() => ['Mercadona', 'Dia'].map(store => buildStoreBasket(items, store, catalogs)), [items, catalogs]);
  return { baskets, retryComparison: () => setRevision(value => value + 1) };
}
