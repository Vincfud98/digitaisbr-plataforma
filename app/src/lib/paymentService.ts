import type { CartItem, OrderCustomer, PaymentMethod } from '../types';

export interface PaymentPreference {
  id: string;
  initPoint: string;
  pixQrCode?: string;
  pixCode?: string;
  boletoUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
}

const MERCADOPAGO_PUBLIC_KEY = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || '';

export function isMercadoPagoConfigured(): boolean {
  return !!MERCADOPAGO_PUBLIC_KEY;
}

export async function createPaymentPreference(params: {
  items: CartItem[];
  customer: OrderCustomer;
  paymentMethod: PaymentMethod;
  storeSlug: string;
  orderId: string;
}): Promise<PaymentPreference> {
  if (!isMercadoPagoConfigured()) {
    return simulatePayment(params);
  }

  const response = await fetch('/api/create-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: params.items.map((item) => ({
        title: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: 'BRL',
      })),
      payer: {
        name: params.customer.name,
        email: params.customer.email,
        identification: { type: 'CPF', number: params.customer.cpf.replace(/\D/g, '') },
      },
      payment_method: params.paymentMethod,
      external_reference: params.orderId,
      notification_url: `${window.location.origin}/api/payment-webhook`,
    }),
  });

  if (!response.ok) throw new Error('Falha ao criar pagamento');
  return response.json();
}

function simulatePayment(params: {
  items: CartItem[];
  customer: OrderCustomer;
  paymentMethod: PaymentMethod;
  orderId: string;
}): PaymentPreference {
  const total = params.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const finalTotal = params.paymentMethod === 'pix' ? total * 0.95 : total;

  const pixCode = `00020126580014br.gov.bcb.pix0136${params.orderId}520400005303986540${finalTotal.toFixed(2)}5802BR`;

  return {
    id: params.orderId,
    initPoint: '',
    status: 'pending',
    ...(params.paymentMethod === 'pix' && { pixQrCode: pixCode, pixCode }),
    ...(params.paymentMethod === 'boleto' && {
      boletoUrl: `https://boleto.digitaisbr.com/${params.orderId}`,
    }),
  };
}

export async function checkPaymentStatus(paymentId: string): Promise<'pending' | 'approved' | 'rejected'> {
  if (!isMercadoPagoConfigured()) return 'pending';

  const response = await fetch(`/api/payment-status/${paymentId}`);
  if (!response.ok) return 'pending';
  const data = await response.json();
  return data.status;
}
