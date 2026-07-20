import { useState } from 'react';
import { Card, Typography, Tag, Row, Col, Statistic, Table, Button, Modal, Form, Input, InputNumber, Select, DatePicker, message, Space } from 'antd';
import {
  TagOutlined, PlusOutlined, CopyOutlined, DeleteOutlined,
  GiftOutlined, ShoppingCartOutlined, PercentageOutlined,
  CheckCircleOutlined, StopOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface Coupon {
  id: string;
  code: string;
  type: 'percentual' | 'fixo';
  value: number;
  minPurchase: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
}

const initialCoupons: Coupon[] = [
  { id: 'cup-1', code: 'MARIA10', type: 'percentual', value: 10, minPurchase: 50, maxUses: 100, usedCount: 47, active: true, expiresAt: '2026-08-31', createdAt: '2026-06-01' },
  { id: 'cup-2', code: 'PROMO20', type: 'percentual', value: 20, minPurchase: 100, maxUses: 50, usedCount: 50, active: false, expiresAt: '2026-06-30', createdAt: '2026-05-15' },
  { id: 'cup-3', code: 'FRETE0', type: 'fixo', value: 25, minPurchase: 80, maxUses: 200, usedCount: 89, active: true, expiresAt: null, createdAt: '2026-06-10' },
  { id: 'cup-4', code: 'BEMVINDO', type: 'percentual', value: 15, minPurchase: 0, maxUses: 500, usedCount: 213, active: true, expiresAt: null, createdAt: '2026-04-01' },
  { id: 'cup-5', code: 'VIP30', type: 'percentual', value: 30, minPurchase: 200, maxUses: 20, usedCount: 8, active: true, expiresAt: '2026-09-30', createdAt: '2026-06-20' },
];

export default function CuponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [formOpen, setFormOpen] = useState(false);
  const [form] = Form.useForm();

  const activeCoupons = coupons.filter((c) => c.active);
  const totalUses = coupons.reduce((s, c) => s + c.usedCount, 0);
  const avgDiscount = coupons.length > 0 ? coupons.reduce((s, c) => s + c.value, 0) / coupons.length : 0;

  const handleCreate = (values: { code: string; type: 'percentual' | 'fixo'; value: number; minPurchase: number; maxUses: number; expiresAt?: { format: (f: string) => string } }) => {
    const exists = coupons.find((c) => c.code.toUpperCase() === values.code.toUpperCase());
    if (exists) {
      message.error('Já existe um cupom com esse código!');
      return;
    }
    const newCoupon: Coupon = {
      id: `cup-${Date.now()}`,
      code: values.code.toUpperCase(),
      type: values.type,
      value: values.value,
      minPurchase: values.minPurchase || 0,
      maxUses: values.maxUses || 999,
      usedCount: 0,
      active: true,
      expiresAt: values.expiresAt ? values.expiresAt.format('YYYY-MM-DD') : null,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCoupons([newCoupon, ...coupons]);
    message.success(`Cupom ${newCoupon.code} criado com sucesso!`);
    setFormOpen(false);
    form.resetFields();
  };

  const toggleCoupon = (id: string) => {
    setCoupons(coupons.map((c) => c.id === id ? { ...c, active: !c.active } : c));
    message.success('Status do cupom atualizado!');
  };

  const deleteCoupon = (id: string) => {
    setCoupons(coupons.filter((c) => c.id !== id));
    message.success('Cupom removido!');
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => message.success(`Código ${code} copiado!`)).catch(() => message.info(code));
  };

  const columns: ColumnsType<Coupon> = [
    {
      title: 'Código',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => (
        <Space>
          <Tag color="blue" style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>{code}</Tag>
          <Button type="text" icon={<CopyOutlined />} size="small" onClick={() => copyCode(code)} />
        </Space>
      ),
    },
    {
      title: 'Desconto',
      key: 'discount',
      render: (_: unknown, r: Coupon) => (
        <Text strong style={{ color: '#52c41a' }}>
          {r.type === 'percentual' ? `${r.value}%` : `R$ ${r.value.toFixed(2)}`}
        </Text>
      ),
    },
    {
      title: 'Compra Mín.',
      dataIndex: 'minPurchase',
      key: 'min',
      render: (v: number) => v > 0 ? `R$ ${v.toFixed(2)}` : '-',
    },
    {
      title: 'Usos',
      key: 'uses',
      render: (_: unknown, r: Coupon) => (
        <div>
          <Text>{r.usedCount} / {r.maxUses}</Text>
          <div style={{ width: 60, height: 4, background: '#f0f0f0', borderRadius: 2, marginTop: 2 }}>
            <div style={{ width: `${Math.min((r.usedCount / r.maxUses) * 100, 100)}%`, height: '100%', background: r.usedCount >= r.maxUses ? '#f5222d' : '#52c41a', borderRadius: 2 }} />
          </div>
        </div>
      ),
    },
    {
      title: 'Validade',
      dataIndex: 'expiresAt',
      key: 'expires',
      render: (d: string | null) => {
        if (!d) return <Tag>Sem limite</Tag>;
        const expired = new Date(d) < new Date();
        return <Tag color={expired ? 'red' : 'default'}>{expired ? 'Expirado' : new Date(d).toLocaleDateString('pt-BR')}</Tag>;
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: unknown, r: Coupon) => (
        <Tag color={r.active ? 'green' : 'default'} icon={r.active ? <CheckCircleOutlined /> : <StopOutlined />}>
          {r.active ? 'Ativo' : 'Inativo'}
        </Tag>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: unknown, r: Coupon) => (
        <Space>
          <Button type="text" size="small" onClick={() => toggleCoupon(r.id)}>
            {r.active ? 'Desativar' : 'Ativar'}
          </Button>
          <Button type="text" danger icon={<DeleteOutlined />} size="small" onClick={() => deleteCoupon(r.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <TagOutlined style={{ marginRight: 8 }} />
          Meus Cupons de Desconto
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>Criar Cupom</Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Cupons Ativos" value={activeCoupons.length} prefix={<TagOutlined />} styles={{ content: { color: '#52c41a' } }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Total de Usos" value={totalUses} prefix={<ShoppingCartOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Desconto Médio" value={avgDiscount} precision={0} suffix="%" prefix={<PercentageOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Total Cupons" value={coupons.length} prefix={<GiftOutlined />} /></Card>
        </Col>
      </Row>

      <Card>
        <Table columns={columns} dataSource={coupons} rowKey="id" size="small" pagination={{ pageSize: 10 }} scroll={{ x: 700 }} />
      </Card>

      <Modal
        title="Criar Novo Cupom"
        open={formOpen}
        onCancel={() => { setFormOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Criar Cupom"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} initialValues={{ type: 'percentual', maxUses: 100 }}>
          <Form.Item name="code" label="Código do Cupom" rules={[{ required: true, message: 'Crie um código' }]} extra="Ex: MARIA10, PROMO20, BEMVINDO">
            <Input placeholder="MEUCUPOM" style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }} maxLength={15} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="Tipo de Desconto" rules={[{ required: true }]}>
                <Select options={[{ value: 'percentual', label: 'Percentual (%)' }, { value: 'fixo', label: 'Valor Fixo (R$)' }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="value" label="Valor" rules={[{ required: true, message: 'Informe o valor' }]}>
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="minPurchase" label="Compra Mínima (R$)" initialValue={0}>
                <InputNumber min={0} step={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="maxUses" label="Máx. de Usos">
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="expiresAt" label="Data de Expiração (opcional)">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Sem limite" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
