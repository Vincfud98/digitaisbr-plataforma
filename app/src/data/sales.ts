import type { Sale } from '../types';
import { mockAssociados } from './associados';
import { mockProducts } from './products';

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const customerNames = [
  'Maria Oliveira', 'José Santos', 'Patrícia Lima', 'Carlos Ferreira', 'Juliana Costa',
  'Roberto Almeida', 'Camila Souza', 'Marcelo Pereira', 'Aline Rodrigues', 'Fernando Gomes',
  'Vanessa Martins', 'Ricardo Barbosa', 'Tatiana Rocha', 'Gustavo Lopes', 'Priscila Mendes',
  'Leandro Correia', 'Amanda Teixeira', 'Thiago Moreira', 'Bruna Cardoso', 'Rafael Machado',
];

const statuses: Sale['status'][] = ['aprovada', 'aprovada', 'aprovada', 'aprovada', 'pendente', 'cancelada', 'reembolsada'];

const activeAssociados = mockAssociados.filter((a) => a.status === 'ativo');
const activeProducts = mockProducts.filter((p) => p.status === 'ativo');

export const mockSales: Sale[] = Array.from({ length: 60 }, (_, i) => {
  const assoc = activeAssociados[Math.floor(seededRandom(i + 700) * activeAssociados.length)];
  const product = activeProducts[Math.floor(seededRandom(i + 800) * activeProducts.length)];
  const qty = Math.floor(seededRandom(i + 900) * 3) + 1;
  const status = statuses[Math.floor(seededRandom(i + 1000) * statuses.length)];
  const daysAgo = Math.floor(seededRandom(i + 1100) * 90);
  const date = new Date(2025, 5, 20);
  date.setDate(date.getDate() - daysAgo);
  const customer = customerNames[Math.floor(seededRandom(i + 1200) * customerNames.length)];

  return {
    id: `sale-${i + 1}`,
    productId: product.id,
    associadoId: assoc.id,
    storeSlug: assoc.storeSlug,
    customerName: customer,
    customerEmail: `${customer.toLowerCase().replace(/\s+/g, '.')}@email.com`,
    quantity: qty,
    unitPrice: product.price,
    totalPrice: product.price * qty,
    status,
    checkoutRef: `CHK-${String(10000 + i)}`,
    createdAt: date.toISOString().split('T')[0],
  };
});
