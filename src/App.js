import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from './components/icon';
import GroceryArt from './components/grocery-art';
import ProductCard from './components/product-card';
import ShoppingList from './components/shopping-list';
import { searchProducts } from './services/product-service';
import { money, priceNumber, productId, readShoppingList } from './utils/products';

const categories = [
  { name: 'Lácteos', query: 'leche', icon: 'milk', color: 'bg-[#EDF2F8] text-[#597A9A]' },
  { name: 'Fruta y verdura', query: 'tomate', icon: 'apple', color: 'bg-[#F0F4E5] text-[#6F873F]' },
  { name: 'Pan y cereales', query: 'pan', icon: 'bread', color: 'bg-[#FAF0DF] text-[#B18A50]' },
  { name: 'Huevos', query: 'huevos', icon: 'egg', color: 'bg-[#F7EBE6] text-[#B88067]' },
  { name: 'Despensa', query: 'arroz', icon: 'jar', color: 'bg-[#EFEBF4] text-[#9181A8]' },
];
const focus = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest';

export default function App() {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('leche');
  const [retry, setRetry] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [store, setStore] = useState('Todos');
  const [sort, setSort] = useState('price');
  const [limit, setLimit] = useState(12);
  const [items, setItems] = useState(readShoppingList);
  const [toast, setToast] = useState('');
  const [storageError, setStorageError] = useState(false);
  const dialogRef = useRef(null);
  const infoRef = useRef(null);
  const resultsRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setWarning('');
    setProducts([]);
    searchProducts(query, controller.signal).then(result => {
      setProducts(result.products);
      setWarning(result.warning);
    }).catch(reason => {
      if (reason.name !== 'AbortError') setError(reason.message);
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [query, retry]);

  useEffect(() => {
    try { localStorage.setItem('dealhunt-shopping-list', JSON.stringify(items)); }
    catch { setStorageError(true); }
  }, [items]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const filtered = useMemo(() => {
    const selected = products.filter(product => store === 'Todos' || product.supermercado === store);
    return [...selected].sort((a, b) => sort === 'name' ? a.nombre.localeCompare(b.nombre, 'es') :
      sort === 'price-desc' ? priceNumber(b.precio_unitario) - priceNumber(a.precio_unitario) :
      priceNumber(a.precio_unitario) - priceNumber(b.precio_unitario));
  }, [products, store, sort]);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + priceNumber(item.precio_unitario) * item.quantity, 0);
  const quantities = new Map(items.map(item => [productId(item), item.quantity]));
  const category = categories.find(item => item.query === query);

  const search = (value, scroll = true) => {
    const next = value.trim();
    if (!next) { searchRef.current.focus(); return; }
    setInput(next);
    setQuery(next);
    setRetry(previous => previous + 1);
    setLimit(12);
    setStore('Todos');
    if (scroll) resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const changeQuantity = (product, delta) => {
    setItems(previous => {
      const existing = previous.find(item => productId(item) === productId(product));
      if (!existing && delta > 0) return [...previous, { ...product, quantity: 1 }];
      return previous.map(item => productId(item) === productId(product) ? { ...item, quantity: item.quantity + delta } : item).filter(item => item.quantity > 0);
    });
  };
  const add = product => { changeQuantity(product, 1); setToast(`${product.nombre} añadido a tu lista`); };
  const openList = () => dialogRef.current.showModal();
  const scrollToProducts = () => resultsRef.current.scrollIntoView({ behavior: 'smooth' });

  return <div className="min-h-screen bg-cream font-sans text-ink antialiased selection:bg-[#D5E9C2]">
    <a href="#main" className="sr-only fixed left-4 top-4 z-50 rounded-lg bg-forest p-3 text-white focus:not-sr-only">Saltar al contenido</a>
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[222px] flex-col border-r border-line bg-white px-5 py-8 lg:flex">
      <a href="#main" aria-label="DealHunt, inicio" className={`mb-12 flex items-center gap-2.5 px-3 ${focus}`}><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest text-white"><Icon name="basket" className="h-6 w-6" /></span><span className="text-[23px] font-extrabold tracking-[-1px]">dealhunt<span className="text-[#D89250]">.</span></span></a>
      <p className="mb-4 px-4 text-[10px] font-semibold tracking-[.17em] text-muted">TU COMPRA, MÁS INTELIGENTE</p>
      <nav aria-label="Navegación principal" className="space-y-2">
        <button onClick={scrollToProducts} className={`flex w-full items-center gap-3 rounded-xl bg-mint px-4 py-3.5 text-sm font-semibold text-forest ${focus}`}><Icon name="grid" />Comparador<span className="ml-auto h-1.5 w-1.5 rounded-full bg-forest" /></button>
        <button onClick={openList} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm text-muted hover:bg-cream ${focus}`}><Icon name="list" />Mi lista<span className="ml-auto rounded-md bg-cream px-2 py-0.5 text-xs">{count}</span></button>
        <button onClick={() => infoRef.current.showModal()} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm text-muted hover:bg-cream ${focus}`}><Icon name="info" />Cómo funciona</button>
      </nav>
      <div className="mt-10 border-t border-line pt-7"><p className="mb-5 px-4 text-[10px] font-semibold tracking-[.17em] text-muted">SUPERMERCADOS</p>
        {['Mercadona', 'Dia'].map(name => <button key={name} onClick={() => { setStore(name); setLimit(12); scrollToProducts(); }} className={`mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm hover:bg-cream ${focus}`}><span className={`h-2 w-2 rounded-full ${name === 'Dia' ? 'bg-red-500' : 'bg-green-700'}`} />{name === 'Dia' ? 'DIA' : name}<span className="ml-auto text-xs text-muted">↗</span></button>)}
      </div>
      <div className="mt-auto rounded-2xl bg-[#F5F5EC] p-5"><Icon name="leaf" className="mb-3 h-7 w-7 text-forest" /><p className="text-sm font-bold leading-5">Pequeñas decisiones.<br />Mejores compras.</p><p className="mt-2 text-xs leading-5 text-muted">Compara antes de llenar tu cesta.</p></div>
      <p className="mt-6 px-3 text-[10px] text-muted">Hecho para tu día a día · 2026</p>
    </aside>

    <div className="lg:ml-[222px]">
      <header className="flex h-20 items-center justify-between gap-3 border-b border-line bg-white/80 px-5 sm:px-9 xl:px-12">
        <a href="#main" className="flex items-center gap-2 text-xl font-extrabold tracking-tight lg:hidden"><Icon name="basket" className="h-7 w-7 text-forest" />dealhunt<span className="text-[#D89250]">.</span></a>
        <div className="hidden items-center gap-2 text-sm lg:flex"><span className="text-muted">Tu espacio</span><span className="px-1 text-[#B8C2B6]">/</span><span className="font-medium">Comparador</span></div>
        <div className="flex items-center gap-5"><span className="hidden items-center gap-2 text-xs text-muted sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#87A877]" />Cada compra cuenta</span><button onClick={openList} className={`flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 text-xs font-semibold sm:px-4 ${focus}`}><Icon name="bag" className="h-4 w-4" /><span>Mi lista</span><span className="flex h-5 min-w-5 items-center justify-center rounded-md bg-forest px-1 text-[10px] text-white">{count}</span></button></div>
      </header>

      <main id="main" className="mx-auto max-w-[1540px] px-5 pb-12 pt-7 sm:px-9 sm:pt-9 xl:px-12">
        <div className="mb-6 flex items-end justify-between"><div><p className="mb-1.5 text-xs text-muted">MENOS VUELTAS. MEJORES DECISIONES.</p><h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">Tu compra empieza aquí<span className="text-[#CC8746]">.</span></h1></div><span className="hidden rounded-full border border-line px-3 py-1.5 text-[11px] text-muted sm:block">Comparador de supermercados</span></div>

        <section aria-labelledby="hero-title" className="relative isolate overflow-hidden rounded-[24px] bg-mint px-6 py-8 sm:px-9 sm:py-10">
          <div className="relative z-10 max-w-[590px] xl:max-w-[650px]">
            <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-[#D6E2CB] bg-white/60 px-3 py-1.5 text-[10px] font-semibold tracking-wide text-forest"><Icon name="spark" className="h-3 w-3" /> TU ALIADO EN EL SUPERMERCADO</span>
            <h2 id="hero-title" className="text-[34px] font-bold leading-[1.13] tracking-[-1.5px] sm:text-[44px]">Lo mismo de siempre.<br /><span className="text-[#55764A]">Una compra más inteligente.</span></h2>
            <p className="mb-7 mt-4 max-w-md text-sm leading-6 text-[#61705B]">Encuentra lo que necesitas, compara precios y crea<br className="hidden sm:block" /> tu lista. Todo en un mismo lugar.</p>
            <form onSubmit={event => { event.preventDefault(); search(input); }} role="search" className="flex max-w-[535px] items-center gap-2 rounded-2xl border border-[#D9E2CE] bg-white p-2 shadow-soft focus-within:ring-2 focus-within:ring-forest/40">
              <Icon name="search" className="ml-2 hidden h-5 w-5 shrink-0 text-muted sm:block" /><label htmlFor="product-search" className="sr-only">Buscar productos</label><input id="product-search" ref={searchRef} value={input} onChange={event => setInput(event.target.value)} placeholder="¿Qué necesitas? Leche, arroz, café…" className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-[#8B9589]" /><button type="submit" className={`flex items-center gap-2 rounded-xl bg-forest px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink sm:px-5 ${focus}`}><span>Comparar</span><Icon name="arrow" className="hidden h-4 w-4 sm:block" /></button>
            </form>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]"><span className="mr-1 text-muted">Prueba con:</span>{['Leche', 'Huevos', 'Aceite de oliva'].map(value => <button key={value} onClick={() => search(value.toLowerCase())} className={`rounded-full border border-[#D6E0CB] px-3 py-1.5 text-[#54694A] hover:bg-white ${focus}`}>{value}</button>)}</div>
          </div>
          <div className="pointer-events-none absolute -right-5 bottom-0 hidden h-[330px] w-[380px] opacity-90 min-[1350px]:block 2xl:right-2"><GroceryArt /></div>
        </section>

        <section aria-label="Categorías" className="mb-9 mt-6 grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
          {categories.map(item => <button key={item.name} onClick={() => search(item.query)} aria-pressed={query === item.query} className={`flex min-h-[80px] flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-medium transition hover:-translate-y-0.5 hover:shadow-soft motion-reduce:transform-none xl:flex-row xl:justify-start xl:gap-3 xl:p-4 ${query === item.query ? 'border-[#B7C9A6] bg-white' : 'border-line bg-white/60'} ${focus}`}><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.color}`}><Icon name={item.icon} className="h-6 w-6" /></span><span>{item.name}</span></button>)}
        </section>

        <div className="grid items-start gap-6 min-[1450px]:grid-cols-[minmax(0,1fr)_260px]">
          <section ref={resultsRef} id="productos" aria-labelledby="results-title" className="min-w-0 scroll-mt-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><div className="mb-1 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#CF9556]" /><p className="text-[10px] font-semibold tracking-[.13em] text-muted">EXPLORA Y COMPARA</p></div><h2 id="results-title" className="text-xl font-bold tracking-tight">{category ? `${category.name} para tu día a día` : `Resultados para “${query}”`}</h2></div><p aria-live="polite" className="text-xs text-muted">{loading ? 'Buscando productos…' : `${filtered.length} productos encontrados`}</p></div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div aria-label="Filtrar por supermercado" className="flex gap-1 rounded-xl border border-line bg-[#EEF1E9] p-1">{['Todos', 'Mercadona', 'Dia'].map(value => <button key={value} onClick={() => { setStore(value); setLimit(12); }} aria-pressed={store === value} className={`rounded-lg px-3 py-2 text-xs font-medium transition sm:px-4 ${store === value ? 'bg-white text-forest shadow-sm' : 'text-muted hover:text-forest'} ${focus}`}>{value === 'Dia' ? 'DIA' : value}</button>)}</div><label className="flex items-center gap-2 text-xs text-muted"><span className="sr-only sm:not-sr-only">Ordenar:</span><select aria-label="Ordenar productos" value={sort} onChange={event => setSort(event.target.value)} className={`max-w-full rounded-lg border border-line bg-white px-2 py-2.5 text-xs text-ink ${focus}`}><option value="price">Precio: menor a mayor</option><option value="price-desc">Precio: mayor a menor</option><option value="name">Nombre: A–Z</option></select></label></div>
            {(warning || error) && <div role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">{error || warning}{error && <button onClick={() => setRetry(value => value + 1)} className={`ml-3 font-bold underline ${focus}`}>Reintentar</button>}</div>}
            {loading ? <div aria-label="Cargando productos" aria-busy="true" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4 min-[1450px]:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-[320px] animate-pulse rounded-2xl border border-line bg-white p-5 motion-reduce:animate-none"><div className="h-4 w-20 rounded bg-mint" /><div className="my-5 h-36 rounded-xl bg-cream" /><div className="h-3 rounded bg-cream" /><div className="mt-3 h-3 w-2/3 rounded bg-cream" /></div>)}</div> : <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4 min-[1450px]:grid-cols-3">{filtered.slice(0, limit).map(product => <ProductCard key={productId(product)} product={product} quantity={quantities.get(productId(product)) || 0} onAdd={add} />)}</div>
              {!filtered.length && !error && <div className="rounded-2xl border border-dashed border-[#CAD5C0] bg-white px-6 py-16 text-center"><Icon name="search" className="mx-auto mb-4 h-9 w-9 text-muted" /><h3 className="font-bold">No encontramos ese producto</h3><p className="mt-2 text-sm text-muted">Prueba con otro nombre o selecciona otro supermercado.</p><button onClick={() => search('leche')} className={`mt-5 rounded-xl bg-forest px-5 py-3 text-sm text-white ${focus}`}>Volver a explorar</button></div>}
              {limit < filtered.length && <div className="mt-7 text-center"><button onClick={() => setLimit(value => value + 12)} className={`rounded-xl border border-[#C8D4BE] bg-white px-6 py-3 text-sm font-semibold text-forest hover:bg-mint ${focus}`}>Ver más productos <span className="ml-2 text-muted">+{Math.min(12, filtered.length - limit)}</span></button><p className="mt-3 text-[11px] text-muted">Mostrando {Math.min(limit, filtered.length)} de {filtered.length} productos</p></div>}
            </>}
          </section>

          <aside aria-label="Resumen de tu compra" className="sticky top-6 hidden rounded-2xl border border-line bg-white p-5 min-[1450px]:block"><div className="flex items-center gap-2 border-b border-line pb-4"><Icon name="bag" className="h-5 w-5 text-forest" /><h2 className="text-sm font-bold">Tu próxima compra</h2><span className="ml-auto text-xs text-muted">{count}</span></div>{items.length ? <div className="py-5">{items.slice(0, 3).map(item => <div key={productId(item)} className="mb-4 flex items-start gap-3 text-xs"><span className="rounded-md bg-mint px-2 py-1 text-forest">{item.quantity}×</span><p className="flex-1 leading-5">{item.nombre}</p></div>)}{items.length > 3 && <p className="text-xs text-muted">Y {items.length - 3} productos más…</p>}<div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm"><span>Total estimado</span><strong>{money(total)}</strong></div></div> : <div className="py-8 text-center"><span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream"><Icon name="basket" className="h-7 w-7 text-[#8A9E7D]" /></span><h3 className="text-sm font-semibold">Una lista, todo en orden</h3><p className="mt-2 text-xs leading-5 text-muted">Añade los productos que te gustan<br />y llévalos contigo al súper.</p></div>}<button onClick={openList} className={`flex w-full items-center justify-center gap-2 rounded-xl bg-mint py-3 text-xs font-semibold text-forest hover:bg-[#E1EACF] ${focus}`}>Ver mi lista<Icon name="arrow" className="h-4 w-4" /></button><p className="mt-4 text-center text-[10px] text-muted">Se guarda en este dispositivo</p></aside>
        </div>

        <div className="mt-10 flex items-start gap-3 rounded-xl border border-line bg-[#F0F2E9] px-4 py-3"><Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-muted" /><p className="text-[11px] leading-5 text-muted">Compara también el precio por litro, kilo o unidad y el tamaño del envase. Los precios pueden variar según tienda. El catálogo de DIA es histórico y todavía no se actualiza automáticamente.</p></div>
        <footer className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-[11px] text-muted"><p><span className="font-semibold text-forest">dealhunt.</span> Menos buscar, mejor comprar.</p><button onClick={() => infoRef.current.showModal()} className={`underline-offset-4 hover:underline ${focus}`}>Sobre los precios y los supermercados ↗</button></footer>
      </main>
    </div>
    <div role="status" aria-live="polite" className={`pointer-events-none fixed bottom-5 left-1/2 z-50 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-3 rounded-2xl bg-forest px-5 py-3 text-sm text-white shadow-xl transition ${toast ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}><Icon name="check" className="h-5 w-5 shrink-0" /><span className="line-clamp-2">{toast}</span></div>
    {storageError && <p role="alert" className="fixed bottom-0 left-0 z-40 w-full bg-amber-100 p-2 text-center text-xs text-amber-900">La lista funciona durante esta sesión, pero tu navegador no permite guardarla.</p>}
    <ShoppingList dialogRef={dialogRef} items={items} onQuantity={changeQuantity} total={total} />
    <dialog ref={infoRef} aria-labelledby="info-title" className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-auto rounded-3xl bg-white p-7 text-ink backdrop:bg-ink/40 backdrop:backdrop-blur-sm"><div className="mb-5 flex items-center justify-between"><h2 id="info-title" className="text-xl font-bold">Compra con más información</h2><button autoFocus aria-label="Cerrar información" onClick={() => infoRef.current.close()} className={`rounded-full p-2 hover:bg-cream ${focus}`}><Icon name="close" /></button></div><ol className="space-y-5 text-sm leading-6 text-muted"><li><strong className="block text-ink">1. Busca lo que necesitas</strong>Consultamos Mercadona y el catálogo disponible de DIA.</li><li><strong className="block text-ink">2. Compara el formato y el precio</strong>El orden por precio usa el precio del producto completo. Consulta el precio por unidad para comparar envases del mismo tipo y tamaño. Los resultados no son necesariamente productos equivalentes.</li><li><strong className="block text-ink">3. Prepara tu lista</strong>Añade productos, ajusta cantidades y descarga tu lista. Se guarda únicamente en este navegador.</li></ol><p className="mt-6 rounded-xl bg-cream p-4 text-xs leading-5 text-muted">DealHunt es un comparador independiente. Los precios son orientativos y no están garantizados. DIA usa un catálogo histórico; Mercadona se consulta al buscar. No vendemos productos ni tramitamos pedidos.</p></dialog>
  </div>;
}
