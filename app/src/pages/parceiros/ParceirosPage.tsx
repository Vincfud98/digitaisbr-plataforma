import { useState } from 'react';
import { Table, Tag, Button, Input, Select, Typography, Space, Card, Row, Col, Statistic, Popconfirm, message, Modal, Descriptions, Form } from 'antd';
import { PartitionOutlined, SearchOutlined, PlusOutlined, EyeOutlined, DeleteOutlined, TeamOutlined, GiftOutlined, GlobalOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { addPartner, removePartner } from '../../store/slices/parceirosSlice';
import type { Partner, PartnerStatus } from '../../types';

const { Title, Text, Link } = Typography;

const statusConfig: Record<PartnerStatus, { color: string; label: string }> = {
  ativo: { color: 'green', label: 'Ativo' },
  inativo: { color: 'default', label: 'Inativo' },
  pendente: { color: 'orange', label: 'Pendente' },
};

export default function ParceirosPage() {
  const dispatch = useAppDispatch();
  const partners = useAppSelector((s) => s.parceiros.list);
  const benefits = useAppSelector((s) => s.beneficios.list);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [detailPartner, setDetailPartner] = useState<Partner | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form] = Form.useForm();

  const filtered = partners.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.category.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  const totalActive = partners.filter((p) => p.status === 'ativo').length;
  const totalBenefits = benefits.filter((b) => b.status === 'ativo').length;

  const handleDelete = (id: string) => {
    dispatch(removePartner(id));
    message.success('Parceiro removido!');
  };

  const columns = [
    {
      title: 'Parceiro',
      key: 'name',
      render: (_: unknown, r: Partner) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.name}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{r.category}</div>
        </div>
      ),
    },
    { title: 'CNPJ', dataIndex: 'cnpj', key: 'cnpj' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Benefícios',
      key: 'benefits',
      render: (_: unknown, r: Partner) => {
        const count = benefits.filter((b) => b.partnerId === r.id && b.status === 'ativo').length;
        return <Tag color="blue">{count}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v: PartnerStatus) => <Tag color={statusConfig[v].color}>{statusConfig[v].label}</Tag>,
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: unknown, r: Partner) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setDetailPartner(r)} />
          <Popconfirm title="Remover parceiro?" onConfirm={() => handleDelete(r.id)} okText="Sim" cancelText="Não">
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const partnerBenefits = detailPartner ? benefits.filter((b) => b.partnerId === detailPartner.id) : [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <PartitionOutlined style={{ marginRight: 8 }} />
          Gestão de Parceiros
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>Novo Parceiro</Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Parceiros Ativos" value={totalActive} prefix={<TeamOutlined />} styles={{ content: { color: '#52c41a' } }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Benefícios Ativos" value={totalBenefits} prefix={<GiftOutlined />} styles={{ content: { color: '#1677ff' } }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Total de Parceiros" value={partners.length} prefix={<PartitionOutlined />} /></Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input placeholder="Buscar por nome ou categoria..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 280 }} allowClear />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 150 }}>
            <Select.Option value="all">Todos status</Select.Option>
            <Select.Option value="ativo">Ativo</Select.Option>
            <Select.Option value="inativo">Inativo</Select.Option>
            <Select.Option value="pendente">Pendente</Select.Option>
          </Select>
        </div>

        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (t) => `${t} parceiros` }}
          size="middle"
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title="Novo Parceiro"
        open={formOpen}
        onCancel={() => { setFormOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Salvar"
        cancelText="Cancelar"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={(values) => {
          const partner: Partner = {
            id: `par-${Date.now()}`,
            ...values,
            logo: '',
            benefitCount: 0,
            status: values.status || 'pendente',
            createdAt: new Date().toISOString(),
          };
          dispatch(addPartner(partner));
          message.success('Parceiro adicionado!');
          setFormOpen(false);
          form.resetFields();
        }}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="Nome" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="cnpj" label="CNPJ" rules={[{ required: true }]}><Input placeholder="00.000.000/0000-00" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="phone" label="Telefone" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Categoria" rules={[{ required: true }]}>
                <Select placeholder="Selecione">
                  <Select.Option value="Saúde">Saúde</Select.Option>
                  <Select.Option value="Educação">Educação</Select.Option>
                  <Select.Option value="Tecnologia">Tecnologia</Select.Option>
                  <Select.Option value="Alimentação">Alimentação</Select.Option>
                  <Select.Option value="Varejo">Varejo</Select.Option>
                  <Select.Option value="Serviços">Serviços</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status" initialValue="pendente">
                <Select>
                  <Select.Option value="ativo">Ativo</Select.Option>
                  <Select.Option value="pendente">Pendente</Select.Option>
                  <Select.Option value="inativo">Inativo</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="website" label="Website"><Input placeholder="https://" /></Form.Item>
          <Form.Item name="description" label="Descrição" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>

      <Modal
        title={detailPartner?.name}
        open={!!detailPartner}
        onCancel={() => setDetailPartner(null)}
        footer={null}
        width={650}
      >
        {detailPartner && (
          <>
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="CNPJ">{detailPartner.cnpj}</Descriptions.Item>
              <Descriptions.Item label="Categoria">{detailPartner.category}</Descriptions.Item>
              <Descriptions.Item label="Email">{detailPartner.email}</Descriptions.Item>
              <Descriptions.Item label="Telefone">{detailPartner.phone}</Descriptions.Item>
              <Descriptions.Item label="Site" span={2}>
                <Link href={detailPartner.website} target="_blank"><GlobalOutlined /> {detailPartner.website}</Link>
              </Descriptions.Item>
              <Descriptions.Item label="Status"><Tag color={statusConfig[detailPartner.status].color}>{statusConfig[detailPartner.status].label}</Tag></Descriptions.Item>
              <Descriptions.Item label="Desde">{new Date(detailPartner.createdAt).toLocaleDateString('pt-BR')}</Descriptions.Item>
              <Descriptions.Item label="Descrição" span={2}>{detailPartner.description}</Descriptions.Item>
            </Descriptions>

            <Title level={5}>Benefícios ({partnerBenefits.length})</Title>
            {partnerBenefits.map((b) => (
              <Card size="small" key={b.id} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <Text strong>{b.title}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>{b.description}</Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Tag color="green">{b.value}</Tag>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>{b.usageCount} usos</Text>
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}
      </Modal>
    </div>
  );
}
