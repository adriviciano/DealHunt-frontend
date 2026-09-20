import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import Icon from './icon';
import { money, priceNumber, productId } from '../utils/products';

export default function ShoppingList({ dialogRef, items, onQuantity, total }) {
  const exportRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const close = () => dialogRef.current.close();

  const download = async () => {
    setExporting(true);
    setError('');
    try {
      const canvas = await html2canvas(exportRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = 'mi-lista-dealhunt.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch { setError('No se ha podido descargar la lista. Vuelve a intentarlo.'); }
    finally { setExporting(false); }
  };

  return <dialog ref={dialogRef} aria-labelledby="shopping-title" onClick={event => { if (event.target === event.currentTarget) close(); }} className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-auto rounded-3xl bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/40 backdrop:backdrop-blur-sm">
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white p-6">
      <div><p className="mb-1 text-xs font-medium text-muted">TODO A MANO</p><h2 id="shopping-title" className="text-xl font-bold">Mi lista de la compra</h2></div>
      <button autoFocus onClick={close} aria-label="Cerrar lista" className="rounded-full p-3 hover:bg-cream focus-visible:outline-forest"><Icon name="close" /></button>
    </div>
    {!items.length ? <div className="px-8 py-12 text-center"><Icon name="basket" className="mx-auto mb-5 h-12 w-12 text-forest" /><h3 className="text-lg font-bold">Tu próxima compra empieza aquí</h3><p className="mt-2 text-sm leading-6 text-muted">Añade productos con el botón + y organiza tu compra por supermercado.</p><button onClick={close} className="mt-6 rounded-xl bg-forest px-6 py-3 text-sm font-semibold text-white">Explorar productos</button></div> : <>
      <div ref={exportRef} className="bg-white p-6">
        <p className="mb-5 text-xs text-muted">DealHunt · Mi compra</p>
        {['Mercadona', 'Dia'].map(store => {
          const products = items.filter(item => item.supermercado === store);
          if (!products.length) return null;
          const subtotal = products.reduce((sum, item) => sum + priceNumber(item.precio_unitario) * item.quantity, 0);
          return <section key={store} className="mb-6"><div className="mb-3 flex items-center justify-between rounded-lg bg-cream px-3 py-2 text-sm font-bold"><h3>{store === 'Dia' ? 'DIA' : store}</h3><span>{money(subtotal)}</span></div>
            {products.map(item => <div key={productId(item)} className="flex items-center gap-3 border-b border-line py-3">
              <div className="min-w-0 flex-1"><p className="text-sm font-medium">{item.nombre}</p><p className="mt-1 text-xs text-muted">{item.quantity} × {money(priceNumber(item.precio_unitario))}</p></div>
              <div data-html2canvas-ignore className="flex shrink-0 items-center rounded-lg border border-line">
                <button onClick={() => onQuantity(item, -1)} aria-label={`Quitar una unidad de ${item.nombre}`} className="p-2 hover:bg-cream"><Icon name="minus" className="h-4 w-4" /></button>
                <span className="min-w-5 text-center text-sm">{item.quantity}</span>
                <button onClick={() => onQuantity(item, 1)} aria-label={`Añadir una unidad de ${item.nombre}`} className="p-2 hover:bg-cream"><Icon name="plus" className="h-4 w-4" /></button>
              </div>
            </div>)}
          </section>;
        })}
        <div className="flex items-center justify-between border-t-2 border-forest pt-4"><span className="font-semibold">Total estimado</span><strong className="text-2xl">{money(total)}</strong></div>
        <p className="mt-3 text-xs leading-5 text-muted">Los precios pueden variar. DIA utiliza un catálogo histórico.</p>
      </div>
      <div className="px-6 pb-6"><button onClick={download} disabled={exporting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-3 text-sm font-semibold text-white hover:bg-ink disabled:opacity-50"><Icon name="download" />{exporting ? 'Preparando imagen…' : 'Descargar mi lista'}</button>{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}</div>
    </>}
  </dialog>;
}
