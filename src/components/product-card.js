import Icon from './icon';
import { money, priceNumber } from '../utils/products';

export default function ProductCard({ product, quantity, onAdd }) {
  const isDia = product.supermercado === 'Dia';
  return <article className="group flex h-full flex-col rounded-2xl border border-line bg-white p-4 transition duration-200 hover:-translate-y-1 hover:border-[#C8D4C0] hover:shadow-soft motion-reduce:transform-none">
    <div className="flex items-center justify-between gap-2">
      <span className={`rounded-md px-2 py-1 text-[10px] font-extrabold tracking-wide ${isDia ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-800'}`}>{isDia ? 'DIA' : 'MERCADONA'}</span>
      {quantity > 0 && <span className="flex items-center gap-1 text-xs font-medium text-forest"><Icon name="check" className="h-3 w-3" />{quantity} en tu lista</span>}
    </div>
    <div className="my-4 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-white sm:h-40">
      <img src={product.imagen} alt={product.nombre} loading="lazy" className="max-h-full max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none" onError={event => { event.currentTarget.style.display = 'none'; }} />
    </div>
    <h3 className="mb-2 min-h-10 text-sm font-semibold leading-5 text-ink">{product.nombre}</h3>
    <p className="mb-4 text-xs text-muted">{product.precio_por_unidad?.replace(/[()]/g, '').replace('.', ',')}</p>
    <div className="mt-auto flex items-end justify-between gap-2 border-t border-line pt-3">
      <div><span className="block text-[10px] text-muted">Precio del producto</span><span className="text-xl font-bold tracking-tight">{money(priceNumber(product.precio_unitario))}</span></div>
      <button onClick={() => onAdd(product)} aria-label={`Añadir ${product.nombre} a la lista`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint text-forest transition hover:bg-forest hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"><Icon name="plus" /></button>
    </div>
  </article>;
}
