import { useState } from 'react';
import { Card, Typography, Button, Steps, Form, Input, Radio, message, Divider, Space, Tag, Result, Descriptions } from 'antd';
import {
  ShoppingCartOutlined, UserOutlined, CreditCardOutlined, CheckCircleOutlined,
  ArrowLeftOutlined, DeleteOutlined, MinusOutlined, PlusOutlined,
  QrcodeOutlined, BarcodeOutlined, CopyOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { updateQuantity, removeFromCart, clearCart } from '../../store/slices/cartSlice';
import { addSale } from '../../store/slices/vendasSlice';
import { setAll as setComissoes } from '../../store/slices/comissoesSlice';
import { createOrder } from '../../lib/firestoreSync';
import { createPaymentPreference } from '../../lib/paymentService';
import type { PaymentMethod, OrderCustomer } from '../../types';

const { Title, Text } = Typography;

function formatCPF(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

function formatCEP(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2');
}

function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits.charAt(i)) * (10 - i);
  let check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  if (check !== parseInt(digits.charAt(9))) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits.charAt(i)) * (11 - i);
  check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  if (check !== parseInt(digits.charAt(10))) return false;
  return true;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, storeSlug } = useAppSelector((s) => s.cart);
  const lojas = useAppSelector((s) => s.lojas.list);
  const allProducts = useAppSelector((s) => s.catalogo.list);
  const comissoes = useAppSelector((s) => s.comissoes.list);
  const store = lojas.find((l) => l.slug === storeSlug);

  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState<OrderCustomer | null>(null);
  const [payment, setPayment] = useState<PaymentMethod>('pix');
  const [orderId, setOrderId] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderStoreName, setOrderStoreName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [lastOrderTime, setLastOrderTime] = useState(0);
  const [form] = Form.useForm();

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const primaryColor = store?.config.primaryColor || '#1677ff';

  if (items.length === 0 && step < 3) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <Result
          icon={<ShoppingCartOutlined style={{ color: '#999' }} />}
          title="Carrinho vazio"
          subTitle="Adicione produtos antes de continuar"
          extra={
            <Button type="primary" onClick={() => navigate(storeSlug ? `/loja/${storeSlug}` : '/')}>
              Voltar à loja
            </Button>
          }
        />
      </div>
    );
  }

  const handleCustomerSubmit = (values: OrderCustomer) => {
    setCustomer(values);
    setStep(2);
  };

  const handleFinishOrder = async () => {
    if (!customer || !store) return;
    if (!customer.name || !customer.email || !customer.cpf || !customer.phone) {
      message.error('Preencha todos os dados antes de finalizar.');
      setStep(1);
      return;
    }
    const now = Date.now();
    if (now - lastOrderTime < 30000) {
      message.warning('Aguarde 30 segundos antes de fazer outro pedido.');
      return;
    }
    setProcessing(true);

    try {
      const result = await createOrder({
        items,
        customer,
        paymentMethod: payment,
        storeSlug: store.slug,
        storeName: store.name,
        associadoId: store.associadoId,
        products: allProducts,
      });

      const finalTotal = payment === 'pix' ? subtotal * 0.95 : subtotal;
      setOrderId(result.orderId);
      setOrderTotal(finalTotal);
      setOrderStoreName(store.name);

      result.sales.forEach((sale) => dispatch(addSale(sale)));
      dispatch(setComissoes([...comissoes, ...result.commissions]));

      await createPaymentPreference({
        items,
        customer,
        paymentMethod: payment,
        storeSlug: store.slug,
        orderId: result.orderId,
      });

      dispatch(clearCart());
      setLastOrderTime(Date.now());
      setStep(3);
      message.success('Pedido realizado com sucesso!');
    } catch (err) {
      console.error('Order error:', err);
      message.error('Erro ao processar pedido. Tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  const pixCode = '00020126580014br.gov.bcb.pix0136' + orderId + '520400005303986540' + subtotal.toFixed(2) + '5802BR';

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ background: primaryColor, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          style={{ color: '#fff' }}
          onClick={() => step === 0 ? navigate(`/loja/${storeSlug}`) : setStep(step - 1)}
        />
        <Title level={4} style={{ color: '#fff', margin: 0 }}>
          {step === 3 ? 'Pedido Confirmado' : 'Checkout'}
        </Title>
        {store && <Text style={{ color: 'rgba(255,255,255,0.8)', marginLeft: 'auto', fontSize: 13 }}>{store.name}</Text>}
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
        {step < 3 && (
          <Steps
            current={step}
            size="small"
            style={{ marginBottom: 24 }}
            items={[
              { title: 'Carrinho', icon: <ShoppingCartOutlined /> },
              { title: 'Dados', icon: <UserOutlined /> },
              { title: 'Pagamento', icon: <CreditCardOutlined /> },
            ]}
          />
        )}

        {step === 0 && (
          <Card title={`Carrinho (${items.length} ${items.length === 1 ? 'item' : 'itens'})`}>
            {items.map((item) => (
              <div key={item.productId} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 8, overflow: 'hidden',
                    background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}30)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    ) : (
                      <ShoppingCartOutlined style={{ fontSize: 20, color: primaryColor, opacity: 0.5 }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ display: 'block', fontSize: 14 }}>{item.name}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>R$ {item.price.toFixed(2)} un.</Text>
                  </div>
                  <Button
                    type="text" danger icon={<DeleteOutlined />} size="small"
                    onClick={() => dispatch(removeFromCart(item.productId))}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingLeft: 60 }}>
                  <Space>
                    <Button
                      size="small" icon={<MinusOutlined />}
                      onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))}
                    />
                    <Text strong>{item.quantity}</Text>
                    <Button
                      size="small" icon={<PlusOutlined />}
                      onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                    />
                  </Space>
                  <Text strong style={{ fontSize: 15, color: primaryColor }}>R$ {(item.price * item.quantity).toFixed(2)}</Text>
                </div>
              </div>
            ))}
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={4} style={{ margin: 0 }}>Total</Title>
              <Title level={3} style={{ margin: 0, color: primaryColor }}>R$ {subtotal.toFixed(2)}</Title>
            </div>
            <Button
              type="primary" size="large" block
              style={{ marginTop: 16, background: primaryColor, borderColor: primaryColor }}
              onClick={() => setStep(1)}
            >
              Continuar
            </Button>
          </Card>
        )}

        {step === 1 && (
          <Card title="Seus Dados">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCustomerSubmit}
              initialValues={customer || {}}
              size="large"
            >
              <Form.Item name="name" label="Nome completo" rules={[{ required: true, message: 'Informe seu nome' }]}>
                <Input placeholder="João da Silva" />
              </Form.Item>
              <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Informe seu email' }, { type: 'email', message: 'Email inválido' }]}>
                <Input placeholder="joao@email.com" />
              </Form.Item>
              <Form.Item name="phone" label="Telefone" rules={[
                { required: true, message: 'Informe seu telefone' },
                { validator: (_, val) => {
                  if (!val) return Promise.resolve();
                  const digits = val.replace(/\D/g, '');
                  return digits.length >= 10 && digits.length <= 11
                    ? Promise.resolve()
                    : Promise.reject('Telefone inválido. Use (XX) XXXXX-XXXX');
                }},
              ]}>
                <Input
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  onChange={(e) => form.setFieldValue('phone', formatPhone(e.target.value))}
                />
              </Form.Item>
              <Form.Item name="cpf" label="CPF" rules={[
                { required: true, message: 'Informe seu CPF' },
                { validator: (_, val) => val && validateCPF(val) ? Promise.resolve() : Promise.reject('CPF inválido') },
              ]}>
                <Input
                  placeholder="000.000.000-00"
                  maxLength={14}
                  onChange={(e) => form.setFieldValue('cpf', formatCPF(e.target.value))}
                />
              </Form.Item>
              <Form.Item name="cep" label="CEP" rules={[
                { required: true, message: 'Informe seu CEP' },
                { validator: (_, val) => {
                  if (!val) return Promise.resolve();
                  const digits = val.replace(/\D/g, '');
                  return digits.length === 8
                    ? Promise.resolve()
                    : Promise.reject('CEP inválido. Use XXXXX-XXX');
                }},
              ]}>
                <Input
                  placeholder="00000-000"
                  maxLength={9}
                  onChange={(e) => form.setFieldValue('cep', formatCEP(e.target.value))}
                />
              </Form.Item>
              <Button type="primary" htmlType="submit" block style={{ background: primaryColor, borderColor: primaryColor }}>
                Continuar para pagamento
              </Button>
            </Form>
          </Card>
        )}

        {step === 2 && (
          <div>
            <Card title="Resumo do Pedido" style={{ marginBottom: 16 }}>
              {items.map((item) => (
                <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                  <Text>{item.quantity}x {item.name}</Text>
                  <Text strong>R$ {(item.price * item.quantity).toFixed(2)}</Text>
                </div>
              ))}
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong style={{ fontSize: 16 }}>Total</Text>
                <Text strong style={{ fontSize: 18, color: primaryColor }}>R$ {subtotal.toFixed(2)}</Text>
              </div>
            </Card>

            <Card title="Forma de Pagamento">
              <Radio.Group
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                style={{ width: '100%' }}
              >
                <Space orientation="vertical" style={{ width: '100%' }}>
                  <Radio.Button value="pix" style={{ width: '100%', height: 56, display: 'flex', alignItems: 'center', borderRadius: 8, marginBottom: 8 }}>
                    <Space>
                      <QrcodeOutlined style={{ fontSize: 20, color: '#32BCAD' }} />
                      <div>
                        <Text strong>Pix</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>Aprovação instantânea</Text>
                      </div>
                      <Tag color="green" style={{ marginLeft: 8 }}>-5%</Tag>
                    </Space>
                  </Radio.Button>
                  <Radio.Button value="cartao" style={{ width: '100%', height: 56, display: 'flex', alignItems: 'center', borderRadius: 8, marginBottom: 8 }}>
                    <Space>
                      <CreditCardOutlined style={{ fontSize: 20, color: '#1677ff' }} />
                      <div>
                        <Text strong>Cartão de Crédito</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>Em até 12x</Text>
                      </div>
                    </Space>
                  </Radio.Button>
                  <Radio.Button value="boleto" style={{ width: '100%', height: 56, display: 'flex', alignItems: 'center', borderRadius: 8 }}>
                    <Space>
                      <BarcodeOutlined style={{ fontSize: 20, color: '#666' }} />
                      <div>
                        <Text strong>Boleto Bancário</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>Aprovação em até 3 dias</Text>
                      </div>
                    </Space>
                  </Radio.Button>
                </Space>
              </Radio.Group>

              {payment === 'pix' && (
                <div style={{ marginTop: 12, padding: 8, background: '#f6ffed', borderRadius: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Desconto de 5% no Pix: <Text strong style={{ color: '#52c41a' }}>R$ {(subtotal * 0.95).toFixed(2)}</Text>
                  </Text>
                </div>
              )}

              <Button
                type="primary" size="large" block
                style={{ marginTop: 20, background: primaryColor, borderColor: primaryColor }}
                onClick={handleFinishOrder}
                loading={processing}
                icon={<CheckCircleOutlined />}
              >
                Finalizar Pedido — R$ {(payment === 'pix' ? subtotal * 0.95 : subtotal).toFixed(2)}
              </Button>
            </Card>
          </div>
        )}

        {step === 3 && (
          <Result
            status="success"
            title="Pedido realizado!"
            subTitle={`Pedido ${orderId} criado com sucesso`}
            extra={[
              payment === 'pix' && (
                <Card key="pix" style={{ textAlign: 'left', marginBottom: 16 }}>
                  <Title level={5}><QrcodeOutlined /> Pague com Pix</Title>
                  <div style={{ background: '#f6f6f6', padding: 12, borderRadius: 8, fontFamily: 'monospace', fontSize: 11, wordBreak: 'break-all', marginBottom: 12 }}>
                    {pixCode}
                  </div>
                  <Button icon={<CopyOutlined />} block onClick={() => { navigator.clipboard.writeText(pixCode); message.success('Código Pix copiado!'); }}>
                    Copiar código Pix
                  </Button>
                </Card>
              ),
              payment === 'boleto' && (
                <Card key="boleto" style={{ textAlign: 'left', marginBottom: 16 }}>
                  <Title level={5}><BarcodeOutlined /> Boleto Bancário</Title>
                  <Text type="secondary">O boleto será enviado para seu email. Prazo de aprovação: até 3 dias úteis.</Text>
                </Card>
              ),
              payment === 'cartao' && (
                <Card key="cartao" style={{ textAlign: 'left', marginBottom: 16 }}>
                  <Title level={5}><CreditCardOutlined /> Cartão de Crédito</Title>
                  <Text type="secondary">Pagamento processado. Você receberá a confirmação por email.</Text>
                </Card>
              ),
              <Card key="details" style={{ textAlign: 'left', marginBottom: 16 }}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Pedido">{orderId}</Descriptions.Item>
                  <Descriptions.Item label="Loja">{orderStoreName}</Descriptions.Item>
                  <Descriptions.Item label="Pagamento">
                    {payment === 'pix' ? 'Pix' : payment === 'cartao' ? 'Cartão de Crédito' : 'Boleto'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total">
                    <Text strong style={{ color: primaryColor }}>
                      R$ {orderTotal.toFixed(2)}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>,
              <Button
                key="back" type="primary"
                style={{ background: primaryColor, borderColor: primaryColor }}
                onClick={() => navigate(`/loja/${storeSlug}`)}
              >
                Voltar à loja
              </Button>,
            ].filter(Boolean)}
          />
        )}
      </div>
    </div>
  );
}
