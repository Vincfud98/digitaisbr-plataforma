import { useState, useMemo } from 'react';
import { Tag, Button, Input, Select, Typography, Card, Row, Col, Statistic, Space, Modal, Form, message, Segmented, Badge, DatePicker } from 'antd';
import { CommentOutlined, SearchOutlined, PlusOutlined, EyeOutlined, LikeOutlined, MessageOutlined, PushpinOutlined, FireOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { addTopic } from '../../store/slices/comunidadeSlice';
import type { ForumTopic, ForumTopicStatus } from '../../types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  const [view, setView] = useState<string>('todos');
  const [formOpen, setFormOpen] = useState(false);
  const [form] = Form.useForm();

  const categories = useMemo(() => [...new Set(topics.map((t) => t.category))], [topics]);

  const filtered = useMemo(() => {
    return topics.filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.authorName.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (view === 'fixados' && t.status !== 'fixado') return false;
      if (view === 'recentes' && t.status === 'fixado') return false;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const d = new Date(t.createdAt);
        if (d < dateRange[0].toDate() || d > dateRange[1].toDate()) return false;
      }
      return true;
    });
  }, [topics, search, categoryFilter, statusFilter, view, dateRange]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    if (a.status === 'fixado' && b.status !== 'fixado') return -1;
    if (b.status === 'fixado' && a.status !== 'fixado') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }), [filtered]);

  const totalOpen = topics.filter((t) => t.status === 'aberto' || t.status === 'fixado').length;
  const totalReplies = topics.reduce((sum, t) => sum + t.replies, 0);
  const totalViews = topics.reduce((sum, t) => sum + t.views, 0);
  const totalLikes = topics.reduce((sum, t) => sum + t.likes, 0);
  const fixados = topics.filter((t) => t.status === 'fixado').length;
  const avgReplies = topics.length > 0 ? totalReplies / topics.length : 0;

  const topCategories = useMemo(() => {
    const map = new Map<string, { count: number; replies: number; views: number }>();
    topics.forEach((t) => {
      const entry = map.get(t.category) || { count: 0, replies: 0, views: 0 };
      entry.count++;
      entry.replies += t.replies;
      entry.views += t.views;
      map.set(t.category, entry);
    });
    return Array.from(map.entries()).map(([cat, data]) => ({ cat, ...data })).sort((a, b) => b.count - a.count);
  }, [topics]);

  const handleCreate = (values: { title: string; category: string; body: string }) => {
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
  };

  const TopicCard = ({ topic }: { topic: ForumTopic }) => {
    const isFixado = topic.status === 'fixado';
    return (
      <div style={{
        padding: 16,
        border: '1px solid #f0f0f0',
        borderRadius: 8,
        background: isFixado ? '#fffbe6' : '#fff',
        borderLeft: isFixado ? '3px solid #faad14' : '3px solid transparent',
        transition: 'box-shadow 0.2s',
        cursor: 'default',
      }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: isFixado ? '#faad14' : '#1677ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                {topic.authorName.charAt(0)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isFixado && <PushpinOutlined style={{ color: '#faad14', fontSize: 13 }} />}
                  <Text strong style={{ fontSize: 14 }}>{topic.title}</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  por {topic.authorName} · {new Date(topic.createdAt).toLocaleDateString('pt-BR')}
                </Text>
              </div>
            </div>
            {topic.body && (
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4, marginLeft: 40 }}>
                {topic.body.length > 120 ? topic.body.substring(0, 120) + '...' : topic.body}
              </Text>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <Tag color={categoryColors[topic.category] || 'default'}>{topic.category}</Tag>
            <Tag color={statusConfig[topic.status].color}>{statusConfig[topic.status].label}</Tag>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20, marginTop: 10, marginLeft: 40 }}>
          <Space size={4} style={{ fontSize: 12, color: '#888' }}>
            <MessageOutlined />
            <span>{topic.replies} respostas</span>
          </Space>
          <Space size={4} style={{ fontSize: 12, color: '#888' }}>
            <EyeOutlined />
            <span>{topic.views.toLocaleString('pt-BR')}</span>
          </Space>
          <Space size={4} style={{ fontSize: 12, color: '#888' }}>
            <LikeOutlined />
            <span>{topic.likes}</span>
          </Space>
          {topic.lastReplyAt && (
            <Space size={4} style={{ fontSize: 12, color: '#888' }}>
              <ClockCircleOutlined />
              <span>Última resp. {new Date(topic.lastReplyAt).toLocaleDateString('pt-BR')}</span>
            </Space>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <CommentOutlined style={{ marginRight: 8 }} />
          Comunidade
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>Novo Tópico</Button>
      </div>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #52c41a' }}>
            <Statistic title="Tópicos Ativos" value={totalOpen} styles={{ content: { color: '#52c41a', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #1677ff' }}>
            <Statistic title="Total Respostas" value={totalReplies} styles={{ content: { color: '#1677ff', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #722ed1' }}>
            <Statistic title="Visualizações" value={totalViews} styles={{ content: { color: '#722ed1', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #ff4d4f' }}>
            <Statistic title="Total Likes" value={totalLikes} styles={{ content: { color: '#ff4d4f', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #faad14' }}>
            <Statistic title="Fixados" value={fixados} styles={{ content: { color: '#faad14', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #888' }}>
            <Statistic title="Média Respostas" value={avgReplies} precision={1} styles={{ content: { fontSize: 20 } }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24}>
          <Card title={<><FireOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />Categorias Populares</>} size="small">
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
              {topCategories.map((c) => (
                <div
                  key={c.cat}
                  onClick={() => setCategoryFilter(c.cat === categoryFilter ? 'all' : c.cat)}
                  style={{
                    minWidth: 160,
                    padding: 12,
                    background: categoryFilter === c.cat ? '#e6f4ff' : '#fafafa',
                    borderRadius: 8,
                    border: categoryFilter === c.cat ? '1px solid #91caff' : '1px solid #f0f0f0',
                    flexShrink: 0,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ marginBottom: 6 }}>
                    <Tag color={categoryColors[c.cat] || 'default'} style={{ margin: 0 }}>{c.cat}</Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <Text type="secondary">{c.count} tópicos</Text>
                    <Text strong>{c.replies} resp.</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 2 }}>
                    <Text type="secondary"><EyeOutlined /> {c.views.toLocaleString('pt-BR')}</Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <Segmented
            value={view}
            onChange={(v) => { setView(v as string); setStatusFilter('all'); }}
            options={[
              { label: `Todos (${topics.length})`, value: 'todos' },
              { label: <Badge count={fixados} size="small" offset={[8, -2]}><span>Fixados</span></Badge>, value: 'fixados' },
              { label: `Recentes`, value: 'recentes' },
            ]}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input placeholder="Buscar tópico ou autor..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 280 }} allowClear />
          <Select value={categoryFilter} onChange={setCategoryFilter} style={{ width: 180 }}>
            <Select.Option value="all">Todas categorias</Select.Option>
            {categories.map((c) => <Select.Option key={c} value={c}>{c}</Select.Option>)}
          </Select>
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 140 }} disabled={view !== 'todos'}>
            <Select.Option value="all">Todos status</Select.Option>
            <Select.Option value="aberto">Aberto</Select.Option>
            <Select.Option value="fixado">Fixado</Select.Option>
            <Select.Option value="fechado">Fechado</Select.Option>
          </Select>
          <RangePicker format="DD/MM/YYYY" placeholder={['Data início', 'Data fim']} onChange={(dates) => setDateRange(dates as [any, any] | null)} style={{ width: 240 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
              <CommentOutlined style={{ fontSize: 40, marginBottom: 12 }} />
              <div>Nenhum tópico encontrado</div>
            </div>
          ) : (
            sorted.map((topic) => <TopicCard key={topic.id} topic={topic} />)
          )}
        </div>

        {sorted.length > 0 && (
          <div style={{ marginTop: 12, textAlign: 'right', fontSize: 12, color: '#888' }}>
            {sorted.length} tópico{sorted.length !== 1 ? 's' : ''}
          </div>
        )}
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
        <Form form={form} layout="vertical" onFinish={handleCreate}>
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
          <Form.Item name="body" label="Mensagem" rules={[{ required: true }]}><Input.TextArea rows={5} placeholder="Escreva sua mensagem..." /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
