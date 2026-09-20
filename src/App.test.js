import { fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import App from './App';
import { searchProducts } from './services/product-service';

jest.mock('./services/product-service');
jest.mock('html2canvas', () => jest.fn());
const milk = { nombre: 'Leche entera de prueba', supermercado: 'Dia', precio_unitario: '1,20 €', precio_por_unidad: '(1,20 €/L)', imagen: '/leche.png' };

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  searchProducts.mockResolvedValue({ products: [milk], warning: '' });
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  Element.prototype.scrollIntoView = jest.fn();
});

test('busca productos y permite filtrar por supermercado', async () => {
  render(<App />);
  expect(await screen.findByRole('heading', { name: milk.nombre })).toBeInTheDocument();
  fireEvent.change(screen.getByRole('textbox', { name: 'Buscar productos' }), { target: { value: 'arroz' } });
  fireEvent.click(screen.getByRole('button', { name: 'Comparar', exact: true }));
  await waitFor(() => expect(searchProducts).toHaveBeenLastCalledWith('arroz', expect.any(AbortSignal)));
  expect(await screen.findByRole('heading', { name: milk.nombre })).toBeInTheDocument();
  const filters = screen.getByLabelText('Filtrar por supermercado');
  fireEvent.click(within(filters).getByRole('button', { name: 'Mercadona' }));
  expect(screen.getByText('No encontramos ese producto')).toBeInTheDocument();
});

test('añade productos, ajusta cantidades y guarda la lista', async () => {
  render(<App />);
  fireEvent.click(await screen.findByRole('button', { name: `Añadir ${milk.nombre} a la lista` }));
  fireEvent.click(screen.getByRole('button', { name: 'Mi lista 1', exact: true }));
  const dialog = screen.getByRole('dialog', { name: 'Mi lista de la compra' });
  expect(within(dialog).getByText('1 × 1,20 €')).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button', { name: `Añadir una unidad de ${milk.nombre}` }));
  expect(within(dialog).getByText('2 × 1,20 €')).toBeInTheDocument();
  await waitFor(() => expect(JSON.parse(localStorage.getItem('dealhunt-shopping-list'))[0].quantity).toBe(2));
  fireEvent.click(within(dialog).getByRole('button', { name: `Quitar una unidad de ${milk.nombre}` }));
  fireEvent.click(within(dialog).getByRole('button', { name: `Quitar una unidad de ${milk.nombre}` }));
  expect(within(dialog).getByText('Tu próxima compra empieza aquí')).toBeInTheDocument();
});

test('explica los errores y permite reintentar', async () => {
  searchProducts.mockRejectedValueOnce(new Error('No se pudo conectar.'));
  render(<App />);
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar.');
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(await screen.findByRole('heading', { name: milk.nombre })).toBeInTheDocument();
});
