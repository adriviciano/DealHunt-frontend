const paths = {
  search: 'M21 21l-5-5M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z',
  basket: 'm3 9 2 11h14l2-11H3Zm4 0 5-6 5 6M9 13v3m6-3v3',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  close: 'm6 6 12 12M6 18 18 6',
  check: 'm5 12 4 4L19 6',
  leaf: 'M20 3C9 2 2 6 5 15c8 5 16-1 15-12ZM3 21 15 9',
  info: 'M12 11v6m0-10h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  bag: 'M5 7h14l1 14H4L5 7Zm3 0V5a4 4 0 0 1 8 0v2',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  store: 'm3 3-2 6c0 3 4 4 6 1 2 3 6 3 8 0 2 3 6 2 6-1l-2-6H3Zm0 10v8h18v-8M9 21v-6h6v6',
  milk: 'M8 3h8v4l3 4v10H5V11l3-4V3Zm0 4h8M5 11h14m-7 0v10',
  apple: 'M12 7c-6-5-12 2-8 10 3 7 6 3 8 3s5 4 8-3c4-8-2-15-8-10Zm0 0c0-4 1-5 4-5',
  bread: 'M5 19V9c-5-4 0-8 7-7 7-1 12 3 7 7v10H5Zm4-6 2-3m2 3 2-3',
  egg: 'M20 14c0 5-4 8-8 8s-8-3-8-8S8 2 12 2s8 7 8 12Z',
  jar: 'M7 3h10v4H7zM7 7l-2 4v10h14V11l-2-4M5 12h14m-14 5h14',
  spark: 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z',
};

export default function Icon({ name, className = 'h-5 w-5', ...props }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d={paths[name] || paths.basket} /></svg>;
}
