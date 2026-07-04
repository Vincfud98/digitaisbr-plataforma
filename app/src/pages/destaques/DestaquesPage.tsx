import { useState } from 'react';
import { Table, Tag, Button, Input, Select, Typography, Card, Row, Col, Statistic, Switch, Popconfirm, message, Modal, Form, InputNumber, DatePicker } from 'antd';
import { StarOutlined, SearchOutlined, PlusOutlined, ShopOutlined, ShoppingCartOutlined, EyeOutlined, RiseOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { addHighlight, toggleHighlightActive, removeHighlight } from '../../store/slices/destaquesSlice';
import type { HighlightItem } from '../../types';

const { Title, Text } = Typography;

export default function DestaquesPage() {
  const dispatch = useAppDispatch();
  const highlights = useAppSelector((s) => s.destaques.list);
  const lojas = useAppSelector((s) => s.lojas.list);
  const produtos = useAppSelector((s) => s.catalogo.list);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [formType, setFormType] = useState<'loja' | 'produto'>('loja');
  const [form] = Form.useForm();

  const filtered = highlights.filter((h) => {
    if (search && !h.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all' && h.type !== typeFilter) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => a.position - b.position);
  const totalActive = highlights.filter((h) => h.active).length;
  const totalClicks = highlights.reduce((sum, h) => sum + h.clicks, 0);
  const totalImpressions = highlights.reduce((sum, h) => sum + h.impressions, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0';

  const columns = [
    {
      title: '#',
      dataIndex: 'position',
      key: 'position',
      width: 50,
      render: (v: number) => <Tag>{v}</Tag>,
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (v: string) => (
        <Tag color={v === 'loja' ? 'blue' : 'green'} icon={v === 'loja' ? <ShopOutlined /> : <ShoppingCartOutlined />}>
          {v === 'loja' ? 'Loja' : 'Produto'}
        </Tag>
      ),
    },
    {
      title: 'Destaque',
      key: 'title',
      render: (_: unknown, r: HighlightItem) => (
        <div>
          <Text strong>{r.title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{r.subtitle}</Text>
        </div>
      ),
    },
    {
      title: 'Cliques',
      dataIndex: 'clicks',
      key: 'clicks',
      width: 90,
      render: (v: number) => v.toLocaleString('pt-BR'),
    },
    {
      title: 'Impressões',
      dataIndex: 'impressions',
      key: 'impressions',
      width: 110,
      render: (v: number) => v.toLocaleString('pt-BR'),
    },
    {
      title: 'CTR',
      key: 'ctr',
      width: 80,
      render: (_: unknown, r: HighlightItem) => {
        const ctr = r.impressions > 0 ? ((r.clicks / r.impressions) * 100).toFixed(1) : '0';
        return <Text>{ctr}%</Text>;
      },
    },
    {
      title: 'Período',
      key: 'period',
      width: 180,
      render: (_: unknown, r: HighlightItem) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {new Date(r.startDate).toLocaleDateString('pt-BR')}
          {r.endDate ? ` - ${new Date(r.endDate).toLocaleDateString('pt-BR')}` : ' - Sem fim'}
        </Text>
      ),
    },
    {
      title: 'Ativo',
      key: 'active',
      width: 70,
      render: (_: unknown, r: HighlightItem) => (
        <Switch checked={r.active} size="small" onChange={() => dispatch(toggleHighlightActive(r.id))} />
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 80,
      render: (_: unknown, r: HighlightItem) => (
        <Popconfirm title="Remover destaque?" onConfirm={() => { dispatch(removeHighlight(r.id)); message.success('Removido!'); }} okText="Sim" cancelText="Não">
          <Button type="link" size="small" danger>Remover</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <StarOutlined style={{ marginRight: 8 }} />
          Destaques e Vitrine
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>Novo Destaque</Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={6}>
          <Card><Statistic title="Destaques Ativos" value={totalActive} prefix={<StarOutlined />} valueStyle={{ color: '#faad14' }} /></Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card><Statistic title="Total de Cliques" value={totalClicks} prefix={<EyeOutlined />} valueStyle={{ color: '#1677ff' }} /></Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card><Statistic title="Impressões" value={totalImpressions} prefix={<EyeOutlined />} valueStyle={{ color: '#722ed1' }} /></Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card><Statistic title="CTR Médio" value={`${avgCtr}%`} prefix={<RiseOutlined />} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input placeholder="Buscar destaque..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 260 }} allowClear />
          <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 140 }}>
            <Select.Option value="all">Todos tipos</Select.Option>
            <Select.Option value="loja">Lojas</Select.Option>
            <Select.Option value="produto">Produtos</Select.Option>
          </Select>
        </div>

        <Table
          dataSource={sorted}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 12, showSizeChanger: false, showTotal: (t) => `${t} destaques` }}
          size="middle"
        />
      </Card>

      <Modal
        title="Novo Destaque"
        open={formOpen}
        onCancel={() => { setFormOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Salvar"
        cancelText="Cancelar"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={(values) => {
          const ref = formType === 'loja'
            ? lojas.find((l) => l.id === values.referenceId)
            : produtos.find((p) => p.id === values.referenceId);
          const item: HighlightItem = {
            id: `hl-${Date.now()}`,
            type: formType,
            referenceId: values.referenceId,
            title: ref ? (formType === 'loja' ? (ref as typeof lojas[0]).name : (ref as typeof produtos[0]).name) : values.title || 'Destaque',
            subtitle: values.subtitle || '',
            image: '',
            position: values.position || highlights.length + 1,
            active: true,
            clicks: 0,
            impressions: 0,
            startDate: values.startDate ? values.startDate.toISOString() : new Date().toISOString(),
            endDate: values.endDate ? values.endDate.toISOString() : null,
            createdAt: new Date().toISOString(),
          };
          dispatch(addHighlight(item));
          message.success('Destaque adicionado!');
          setFormOpen(false);
          form.resetFields();
        }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Tipo">
                <Select value={formType} onChange={(v) => { setFormType(v); form.resetFields(['referenceId']); }}>
                  <Select.Option value="loja">Loja</Select.Option>
                  <Select.Option value="produto">Produto</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="referenceId" label={formType === 'loja' ? 'Loja' : 'Produto'} rules={[{ required: true }]}>
                <Select placeholder="Selecione" showSearch optionFilterProp="children">
                  {formType === 'loja'
                    ? lojas.filter((l) => l.active).map((l) => <Select.Option key={l.id} value={l.id}>{l.name}</Select.Option>)
                    : produtos.filter((p) => p.status === 'ativo').map((p) => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)
                  }
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="subtitle" label="Subtítulo"><Input placeholder="Texto de apoio" /></Form.Item>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="position" label="Posição"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="startDate" label="Início"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="endDate" label="Fim (opcional)"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
