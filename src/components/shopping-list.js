import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import Icon from './icon';
import { money, priceNumber, productId } from '../utils/products';
import { itemGeneric, packSize } from '../utils/basket-comparison';

const amountLabel = (size, quantity) => size ? `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(size.amount * quantity)} ${size.unit}` : 'Cantidad sin verificar';
const storeName = store => store === 'Dia' ? 'DIA' : store;

export default function ShoppingList({ dialogRef, items, onQuantity, total, baskets, onRetry }) {
  const exportRef = useRef(null);
  const [active, setActive] = useState('mixed');
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const close = () => dialogRef.current.close();
  const mixed = { store: 'mixed', complete: true, subtotal: total, missing: 0, rows: items.map(item => ({ item, product: item, quantity: item.quantity, status: 'matched', original: true, size: packSize(item) })) };
  const options = [mixed, ...baskets];
  const selected = options.find(basket => basket.store === active) || mixed;
  const selectedName = active === 'mixed' ? 'Tu selección' : `Todo en ${storeName(active)}`;
  const pending = baskets.some(basket => basket.loading);
  const hasErrors = baskets.some(basket => basket.rows.some(row => row.status === 'error'));

  const download = async () => {
    setExporting(true);
    setError('');
    try {
      const canvas = await html2canvas(exportRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `dealhunt-${active === 'mixed' ? 'mi-seleccion' : active.toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch { setError('No se ha podido descargar la lista. Vuelve a intentarlo.'); }
    finally { setExporting(false); }
  };

  return <dialog ref={dialogRef} aria-labelledby="shopping-title" onClick={event => { if (event.target === event.currentTarget) close(); }} className="m-auto max-h-[92dvh] w-[calc(100%-1rem)] max-w-5xl overflow-auto rounded-3xl bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/40 backdrop:backdrop-blur-sm sm:w-[calc(100%-2rem)]">
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white p-5 sm:p-6">
      <div><p className="mb-1 text-xs font-medium text-muted">LA MISMA COMPRA, TRES OPCIONES</p><h2 id="shopping-title" className="text-xl font-bold">Mi lista de la compra</h2></div>
      <button autoFocus onClick={close} aria-label="Cerrar lista" className="rounded-full p-3 hover:bg-cream focus-visible:outline-forest"><Icon name="close" /></button>
    </div>
    {!items.length ? <div className="px-8 py-12 text-center"><Icon name="basket" className="mx-auto mb-5 h-12 w-12 text-forest" /><h3 className="text-lg font-bold">Tu próxima compra empieza aquí</h3><p className="mt-2 text-sm leading-6 text-muted">Elige productos genéricos y la opción del supermercado que quieras. Aquí compararás las tres cestas.</p><button onClick={close} className="mt-6 rounded-xl bg-forest px-6 py-3 text-sm font-semibold text-white">Elegir productos</button></div> : <>
      <div className="p-5 pb-0 sm:p-6 sm:pb-0">
        <p className="mb-4 text-sm leading-6 text-muted">Tu selección puede mezclar supermercados. Las otras cestas buscan el mismo tipo de producto y una cantidad comparable, aunque cambie la marca.</p>
        <div aria-label="Opciones de compra" className="grid gap-3 sm:grid-cols-3">
          {options.map(basket => {
            const title = basket.store === 'mixed' ? 'Tu selección' : `Todo en ${storeName(basket.store)}`;
            const difference = basket.subtotal - total;
            return <button key={basket.store} aria-pressed={active === basket.store} onClick={() => setActive(basket.store)} className={`rounded-2xl border p-4 text-left transition focus-visible:outline-forest ${active === basket.store ? 'border-forest bg-mint ring-1 ring-forest' : 'border-line hover:bg-cream'}`}>
              <span className="flex items-center justify-between gap-2 text-sm font-bold">{title}<Icon name={basket.store === 'mixed' ? 'basket' : 'store'} className="h-4 w-4" /></span>
              <strong className="mt-3 block text-2xl">{basket.loading ? 'Comparando…' : basket.complete ? money(basket.subtotal) : 'Incompleta'}</strong>
              <span className="mt-2 block text-xs leading-5 text-muted">{basket.store === 'mixed' ? `${items.length} productos genéricos · tus elecciones` : basket.loading ? 'Buscando productos equivalentes' : !basket.complete ? `${basket.missing} ${basket.missing === 1 ? 'producto pendiente' : 'productos pendientes'} · sin ahorro calculado` : Math.abs(difference) < 0.005 ? 'Mismo coste que tu selección' : `${money(Math.abs(difference))} ${difference < 0 ? 'menos' : 'más'} que tu selección`}</span>
            </button>;
          })}
        </div>
        {pending && <p role="status" className="mt-3 text-xs text-muted">Estamos consultando los supermercados para completar la comparación…</p>}
        {hasErrors && <div role="alert" className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Algún supermercado no respondió.<button onClick={onRetry} className="ml-2 font-semibold underline">Reintentar comparación</button></div>}
      </div>
      <div ref={exportRef} className="bg-white p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4"><h3 className="text-lg font-bold">{selectedName}</h3><span className="text-xs text-muted">{active === 'mixed' ? 'Ajusta tus cantidades aquí' : 'Equivalentes sugeridos · revisa los formatos'}</span></div>
        <div className="space-y-3">
          {selected.rows.map(row => {
            const generic = itemGeneric(row.item);
            return <article key={productId(row.item)} className={`rounded-xl border p-4 ${row.status === 'matched' ? 'border-line' : 'border-amber-200 bg-amber-50'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1"><h4 className="text-sm font-bold">{generic?.name || row.item.nombre}</h4>
                  {row.status === 'matched' ? <><p className="mt-1 text-sm leading-5 text-muted">{row.product.nombre}</p><p className="mt-2 text-xs font-medium text-forest">{storeName(row.product.supermercado)} · {row.quantity} × {money(priceNumber(row.product.precio_unitario))} · {amountLabel(row.size, row.quantity)}</p>{active !== 'mixed' && !row.original && <p className="mt-2 text-xs leading-5 text-muted">Sustituye: {row.item.nombre} ({storeName(row.item.supermercado)}). Cantidad elegida: {amountLabel(packSize(row.item), row.item.quantity)}.</p>}</> : <p className="mt-2 text-sm leading-5 text-amber-900">{row.status === 'loading' ? 'Buscando equivalente…' : row.reason}</p>}
                </div>
                {row.status === 'matched' && <strong className="text-base">{money(priceNumber(row.product.precio_unitario) * row.quantity)}</strong>}
              </div>
              {active === 'mixed' && <div data-html2canvas-ignore className="mt-3 flex flex-wrap items-center justify-between gap-3"><button onClick={() => onQuantity(row.item, -row.item.quantity)} className="text-xs text-muted underline hover:text-red-700" aria-label={`Eliminar ${generic?.name || row.item.nombre}`}>Eliminar producto</button><div className="flex items-center rounded-lg border border-line"><button onClick={() => onQuantity(row.item, -1)} aria-label={`Quitar una unidad de ${row.item.nombre}`} className="p-3 hover:bg-cream"><Icon name="minus" className="h-4 w-4" /></button><span className="min-w-6 text-center text-sm">{row.item.quantity}</span><button onClick={() => onQuantity(row.item, 1)} aria-label={`Añadir una unidad de ${row.item.nombre}`} className="p-3 hover:bg-cream"><Icon name="plus" className="h-4 w-4" /></button></div></div>}
            </article>;
          })}
        </div>
        <div className="mt-5 flex items-center justify-between gap-3 border-t-2 border-forest pt-4"><span className="font-semibold">{selected.complete ? 'Total estimado' : 'Subtotal de productos encontrados'}</span><strong className="text-2xl">{money(selected.subtotal)}</strong></div>
        {!selected.complete && <p className="mt-2 text-xs font-medium text-amber-800">Cesta incompleta. Este subtotal no es comparable con el total de tu selección.</p>}
        <p className="mt-4 text-xs leading-5 text-muted">Equivalencias por tipo y cantidad (hasta un 10 % más si cambia el envase). Los precios pueden variar y DIA usa un catálogo histórico. Comprueba ingredientes y alérgenos antes de comprar.</p>
      </div>
      <div className="px-5 pb-5 sm:px-6 sm:pb-6"><button onClick={download} disabled={exporting || selected.loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-3 text-sm font-semibold text-white hover:bg-ink disabled:opacity-50"><Icon name="download" />{exporting ? 'Preparando imagen…' : `Descargar ${selectedName.toLowerCase()}${selected.complete ? '' : ' (incompleta)'}`}</button>{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}</div>
    </>}
  </dialog>;
}
