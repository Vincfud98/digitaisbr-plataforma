import { useState } from 'react';
import { Table, Tag, Button, Input, Select, Typography, Card, Row, Col, Statistic, Space, Avatar, Modal, Form, message } from 'antd';
import { CommentOutlined, SearchOutlined, PlusOutlined, EyeOutlined, LikeOutlined, MessageOutlined, PushpinOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { addTopic } from '../../store/slices/comunidadeSlice';
import type { ForumTopic, ForumTopicStatus } from '../../types';

const { Title, Text } = Typography;

const statusConfig: Record<ForumTopicStatus, { color: string; label: string }> = {
  aberto: { color: 'green', label: 'Aberto' },
  fechado: { color: 'default', label: 'Fechado' },
  fixado: { color: 'gold', label: 'Fixado' },
};

const categoryColors: Record<string, string> = {
  'Dicas de Vendas': 'green',
  'Marketing Digital': 'blue',
  'Gestão Financeira': 'gold',
  'Produtos': 'purple',
  'Sugestões': 'orange',
  'Geral': 'default',
  'Novidades': 'cyan',
};

export default function ComunidadePage() {
  const dispatch = useAppDispatch();
  const topics = useAppSelector((s) => s.comunidade.list);
  const { user } = useAppSelector((s) => s.auth);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [form] = Form.useForm();

  const filtered = topics.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.status === 'fixado' && b.status !== 'fixado') return -1;
    if (b.status === 'fixado' && a.status !== 'fixado') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalOpen = topics.filter((t) => t.status === 'aberto' || t.status === 'fixado').length;
  const totalReplies = topics.reduce((sum, t) => sum + t.replies, 0);
  const totalViews = topics.reduce((sum, t) => sum + t.views, 0);

  const categories = [...new Set(topics.map((t) => t.category))];

  const columns = [
    {
      title: 'Tópico',
      key: 'title',
      render: (_: unknown, r: ForumTopic) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar style={{ background: '#1677ff', flexShrink: 0 }}>{r.authorName.charAt(0)}</Avatar>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {r.status === 'fixado' && <PushpinOutlined style={{ color: '#faad14' }} />}
              <Text strong>{r.title}</Text>
            </div>
            <div style={{ fontSize: 12, color: '#888' }}>
              por {r.authorName} · {new Date(r.createdAt).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Categoria',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (v: string) => <Tag color={categoryColors[v] || 'default'}>{v}</Tag>,
    },
    {
      title: 'Respostas',
      dataIndex: 'replies',
      key: 'replies',
      width: 100,
      render: (v: number) => <Space><MessageOutlined /> {v}</Space>,
    },
    {
      title: 'Views',
      dataIndex: 'views',
      key: 'views',
      width: 100,
      render: (v: number) => <Space><EyeOutlined /> {v}</Space>,
    },
    {
      title: 'Likes',
      dataIndex: 'likes',
      key: 'likes',
      width: 80,
      render: (v: number) => <Space><LikeOutlined /> {v}</Space>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: ForumTopicStatus) => <Tag color={statusConfig[v].color}>{statusConfig[v].label}</Tag>,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <CommentOutlined style={{ marginRight: 8 }} />
          Comunidade
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>Novo Tópico</Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Tópicos Ativos" value={totalOpen} prefix={<CommentOutlined />} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Total de Respostas" value={totalReplies} prefix={<MessageOutlined />} valueStyle={{ color: '#1677ff' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Total de Visualizações" value={totalViews} prefix={<EyeOutlined />} valueStyle={{ color: '#722ed1' }} /></Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input placeholder="Buscar tópico..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 280 }} allowClear />
          <Select value={categoryFilter} onChange={setCategoryFilter} style={{ width: 180 }}>
            <Select.Option value="all">Todas categorias</Select.Option>
            {categories.map((c) => <Select.Option key={c} value={c}>{c}</Select.Option>)}
          </Select>
        </div>

        <Table
          dataSource={sorted}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (t) => `${t} tópicos` }}
          size="middle"
        />
      </Card>

      <Modal
        title="Novo Tópico"
        open={formOpen}
        onCancel={() => { setFormOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Publicar"
        cancelText="Cancelar"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={(values) => {
          const topic: ForumTopic = {
            id: `topic-${Date.now()}`,
            title: values.title,
            body: values.body,
            authorId: user?.id || 'admin',
            authorName: user?.name || 'Admin',
            category: values.category,
            status: 'aberto',
            replies: 0,
            views: 0,
            likes: 0,
            lastReplyAt: null,
            createdAt: new Date().toISOString(),
          };
          dispatch(addTopic(topic));
          message.success('Tópico criado!');
          setFormOpen(false);
          form.resetFields();
        }}>
          <Form.Item name="title" label="Título" rules={[{ required: true }]}><Input placeholder="Título do tópico" /></Form.Item>
          <Form.Item name="category" label="Categoria" rules={[{ required: true }]}>
            <Select placeholder="Selecione">
              <Select.Option value="Dicas de Vendas">Dicas de Vendas</Select.Option>
              <Select.Option value="Marketing Digital">Marketing Digital</Select.Option>
              <Select.Option value="Gestão Financeira">Gestão Financeira</Select.Option>
              <Select.Option value="Produtos">Produtos</Select.Option>
              <Select.Option value="Sugestões">Sugestões</Select.Option>
              <Select.Option value="Geral">Geral</Select.Option>
              <Select.Option value="Novidades">Novidades</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="body" label="Mensagem" rules={[{ required: true }]}><Input.TextArea rows={5} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
