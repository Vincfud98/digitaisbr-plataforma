import { useState } from 'react';
import { Card, Typography, Tag, Row, Col, Statistic, Input, Select, Space, Empty, Button, Modal, Form, DatePicker, message } from 'antd';
import { GiftOutlined, SearchOutlined, HeartOutlined, PercentageOutlined, DollarOutlined, KeyOutlined, PlusOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { addBenefit } from '../../store/slices/beneficiosSlice';
import type { Benefit, BenefitType, PlanType } from '../../types';

const { Title, Text, Paragraph } = Typography;

const typeConfig: Record<BenefitType, { color: string; label: string; icon: React.ReactNode }> = {
  desconto: { color: 'green', label: 'Desconto', icon: <PercentageOutlined /> },
  servico: { color: 'blue', label: 'Serviço', icon: <HeartOutlined /> },
  acesso: { color: 'purple', label: 'Acesso', icon: <KeyOutlined /> },
  cashback: { color: 'gold', label: 'Cashback', icon: <DollarOutlined /> },
};

const planConfig: Record<PlanType, { color: string; label: string }> = {
  basico: { color: 'blue', label: 'Básico+' },
  intermediario: { color: 'purple', label: 'Intermediário+' },
  avancado: { color: 'gold', label: 'Avançado' },
};


export default function BeneficiosPage() {
  const dispatch = useAppDispatch();
  const benefits = useAppSelector((s) => s.beneficios.list);
  const partners = useAppSelector((s) => s.parceiros.list);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [form] = Form.useForm();

  const partnerMap = Object.fromEntries(partners.map((p) => [p.id, p]));

  const filtered = benefits.filter((b) => {
    if (b.status !== 'ativo') return false;
    if (search && !b.title.toLowerCase().includes(search.toLowerCase()) && !b.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all' && b.type !== typeFilter) return false;
    if (planFilter !== 'all' && b.minPlan !== planFilter) return false;
    return true;
  });

  const totalActive = benefits.filter((b) => b.status === 'ativo').length;
  const totalUsage = benefits.reduce((sum, b) => sum + b.usageCount, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <GiftOutlined style={{ marginRight: 8 }} />
          Benefícios dos Associados
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>Novo Benefício</Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Benefícios Ativos" value={totalActive} prefix={<GiftOutlined />} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Parceiros Ativos" value={partners.filter((p) => p.status === 'ativo').length} prefix={<HeartOutlined />} valueStyle={{ color: '#1677ff' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Total de Utilizações" value={totalUsage} prefix={<PercentageOutlined />} valueStyle={{ color: '#722ed1' }} /></Card>
        </Col>
      </Row>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input placeholder="Buscar benefício..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 280 }} allowClear />
        <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 150 }}>
          <Select.Option value="all">Todos tipos</Select.Option>
          <Select.Option value="desconto">Desconto</Select.Option>
          <Select.Option value="servico">Serviço</Select.Option>
          <Select.Option value="acesso">Acesso</Select.Option>
          <Select.Option value="cashback">Cashback</Select.Option>
        </Select>
        <Select value={planFilter} onChange={setPlanFilter} style={{ width: 160 }}>
          <Select.Option value="all">Todos planos</Select.Option>
          <Select.Option value="basico">Básico+</Select.Option>
          <Select.Option value="intermediario">Intermediário+</Select.Option>
          <Select.Option value="avancado">Avançado</Select.Option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Empty description="Nenhum benefício encontrado" />
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((benefit: Benefit) => {
            const partner = partnerMap[benefit.partnerId];
            const tc = typeConfig[benefit.type];
            return (
              <Col xs={24} sm={12} lg={8} key={benefit.id}>
                <Card
                  hoverable
                  style={{ height: '100%' }}
                  actions={[
                    <Space key="usage">
                      <Text type="secondary">{benefit.usageCount} utilizações</Text>
                    </Space>,
                  ]}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Tag color={tc.color} icon={tc.icon}>{tc.label}</Tag>
                    <Tag color={planConfig[benefit.minPlan].color}>{planConfig[benefit.minPlan].label}</Tag>
                  </div>
                  <Title level={5} style={{ margin: '0 0 4px' }}>{benefit.title}</Title>
                  <Paragraph type="secondary" style={{ margin: '0 0 12px', fontSize: 13 }}>{benefit.description}</Paragraph>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: 18, color: '#52c41a' }}>{benefit.value}</Text>
                    {partner && <Text type="secondary" style={{ fontSize: 12 }}>{partner.name}</Text>}
                  </div>
                  {benefit.expiresAt && (
                    <div style={{ marginTop: 8 }}>
                      <Tag color="orange">Expira em {new Date(benefit.expiresAt).toLocaleDateString('pt-BR')}</Tag>
                    </div>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <Modal
        title="Novo Benefício"
        open={formOpen}
        onCancel={() => { setFormOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Salvar"
        cancelText="Cancelar"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={(values) => {
          const benefit: Benefit = {
            id: `ben-${Date.now()}`,
            title: values.title,
            description: values.description,
            type: values.type,
            value: values.value,
            partnerId: values.partnerId,
            minPlan: values.minPlan,
            status: 'ativo',
            usageCount: 0,
            expiresAt: values.expiresAt ? values.expiresAt.toISOString() : null,
            createdAt: new Date().toISOString(),
          };
          dispatch(addBenefit(benefit));
          message.success('Benefício adicionado!');
          setFormOpen(false);
          form.resetFields();
        }}>
          <Form.Item name="title" label="Título" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Descrição" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="Tipo" rules={[{ required: true }]}>
                <Select placeholder="Selecione">
                  <Select.Option value="desconto">Desconto</Select.Option>
                  <Select.Option value="servico">Serviço</Select.Option>
                  <Select.Option value="acesso">Acesso</Select.Option>
                  <Select.Option value="cashback">Cashback</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}><Form.Item name="value" label="Valor" rules={[{ required: true }]}><Input placeholder="Ex: 20% de desconto" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="partnerId" label="Parceiro" rules={[{ required: true }]}>
                <Select placeholder="Selecione">
                  {partners.filter((p) => p.status === 'ativo').map((p) => (
                    <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="minPlan" label="Plano Mínimo" rules={[{ required: true }]}>
                <Select placeholder="Selecione">
                  <Select.Option value="basico">Básico</Select.Option>
                  <Select.Option value="intermediario">Intermediário</Select.Option>
                  <Select.Option value="avancado">Avançado</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="expiresAt" label="Data de Expiração (opcional)"><DatePicker style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
