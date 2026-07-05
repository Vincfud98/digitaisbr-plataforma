import { useState } from 'react';
import { Card, Typography, Tag, Row, Col, Statistic, Input, Select, Space, Empty, Button, Modal, Form, message, Avatar } from 'antd';
import {
  ReadOutlined, SearchOutlined, EyeOutlined, HeartOutlined, PlayCircleOutlined,
  FileTextOutlined, BookOutlined, AudioOutlined, VideoCameraOutlined, PlusOutlined,
  ClockCircleOutlined, UserOutlined, LockOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { addContent } from '../../store/slices/conteudosSlice';
import type { Content, ContentType, ContentStatus, PlanType } from '../../types';

const { Title, Text, Paragraph } = Typography;

const typeConfig: Record<ContentType, { color: string; hex: string; label: string; icon: React.ReactNode }> = {
  artigo: { color: 'blue', hex: '#1677ff', label: 'Artigo', icon: <FileTextOutlined /> },
  video: { color: 'red', hex: '#ff4d4f', label: 'Vídeo', icon: <VideoCameraOutlined /> },
  ebook: { color: 'green', hex: '#52c41a', label: 'E-book', icon: <BookOutlined /> },
  curso: { color: 'purple', hex: '#722ed1', label: 'Curso', icon: <PlayCircleOutlined /> },
  podcast: { color: 'orange', hex: '#fa8c16', label: 'Podcast', icon: <AudioOutlined /> },
};

const planConfig: Record<PlanType, { color: string; label: string }> = {
  basico: { color: 'blue', label: 'Básico+' },
  intermediario: { color: 'purple', label: 'Intermediário+' },
  avancado: { color: 'gold', label: 'Avançado' },
};

const statusConfig: Record<ContentStatus, { color: string; label: string }> = {
  publicado: { color: 'green', label: 'Publicado' },
  rascunho: { color: 'orange', label: 'Rascunho' },
  arquivado: { color: 'default', label: 'Arquivado' },
};

export default function ConteudosPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const contents = useAppSelector((s) => s.conteudos.list);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [form] = Form.useForm();

  const filtered = contents.filter((c) => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.category.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  const totalPublished = contents.filter((c) => c.status === 'publicado').length;
  const totalViews = contents.reduce((sum, c) => sum + c.views, 0);
  const totalLikes = contents.reduce((sum, c) => sum + c.likes, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <ReadOutlined style={{ marginRight: 8 }} />
          Conteúdos para Creators
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>Novo Conteúdo</Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Publicados" value={totalPublished} prefix={<ReadOutlined />} styles={{ content: { color: '#52c41a' } }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Total de Visualizações" value={totalViews} prefix={<EyeOutlined />} styles={{ content: { color: '#1677ff' } }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Total de Curtidas" value={totalLikes} prefix={<HeartOutlined />} styles={{ content: { color: '#ff4d4f' } }} /></Card>
        </Col>
      </Row>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input placeholder="Buscar por título ou categoria..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 280 }} allowClear />
        <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 140 }}>
          <Select.Option value="all">Todos tipos</Select.Option>
          <Select.Option value="artigo">Artigo</Select.Option>
          <Select.Option value="video">Vídeo</Select.Option>
          <Select.Option value="ebook">E-book</Select.Option>
          <Select.Option value="curso">Curso</Select.Option>
          <Select.Option value="podcast">Podcast</Select.Option>
        </Select>
        <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 150 }}>
          <Select.Option value="all">Todos status</Select.Option>
          <Select.Option value="publicado">Publicado</Select.Option>
          <Select.Option value="rascunho">Rascunho</Select.Option>
          <Select.Option value="arquivado">Arquivado</Select.Option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Empty description="Nenhum conteúdo encontrado" />
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((content: Content) => {
            const tc = typeConfig[content.type];
            return (
              <Col xs={24} sm={12} lg={8} xl={6} key={content.id}>
                <Card
                  hoverable
                  onClick={() => navigate(`/conteudos/${content.id}`)}
                  style={{ height: '100%', borderRadius: 12, overflow: 'hidden' }}
                  styles={{ body: { padding: 16 } }}
                  cover={
                    <div style={{ height: 160, position: 'relative', overflow: 'hidden' }}>
                      {content.imageUrl ? (
                        <img
                          src={content.imageUrl}
                          alt={content.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{
                          height: '100%',
                          background: `linear-gradient(135deg, ${tc.hex}22, ${tc.hex}44)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <div style={{ fontSize: 48, color: tc.hex, opacity: 0.6 }}>{tc.icon}</div>
                        </div>
                      )}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                      <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4 }}>
                        <Tag color={tc.color} style={{ borderRadius: 8, fontSize: 11 }}>{tc.icon} {tc.label}</Tag>
                      </div>
                      <div style={{ position: 'absolute', top: 8, right: 8 }}>
                        <Tag color={statusConfig[content.status].color} style={{ borderRadius: 8, fontSize: 11 }}>{statusConfig[content.status].label}</Tag>
                      </div>
                      {content.minPlan !== 'basico' && (
                        <div style={{ position: 'absolute', bottom: 8, right: 8 }}>
                          <Tag color={planConfig[content.minPlan].color} style={{ borderRadius: 8, fontSize: 10, border: 'none' }}>
                            <LockOutlined /> {planConfig[content.minPlan].label}
                          </Tag>
                        </div>
                      )}
                      <div style={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', gap: 10 }}>
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}><EyeOutlined /> {content.views.toLocaleString('pt-BR')}</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}><HeartOutlined /> {content.likes.toLocaleString('pt-BR')}</Text>
                      </div>
                    </div>
                  }
                >
                  <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 6, lineHeight: 1.3 }}>
                    {content.title}
                  </Text>
                  <Paragraph type="secondary" style={{ fontSize: 12, margin: '0 0 10px', lineHeight: 1.5 }} ellipsis={{ rows: 2 }}>
                    {content.summary}
                  </Paragraph>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size={6}>
                      <Avatar size={20} icon={<UserOutlined />} style={{ background: tc.hex, fontSize: 10 }} />
                      <Text type="secondary" style={{ fontSize: 11 }}>{content.author}</Text>
                    </Space>
                    {content.publishedAt && (
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        <ClockCircleOutlined /> {new Date(content.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </Text>
                    )}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Create Modal */}
      <Modal
        title="Novo Conteúdo"
        open={formOpen}
        onCancel={() => { setFormOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Salvar"
        cancelText="Cancelar"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={(values) => {
          const content: Content = {
            id: `cnt-${Date.now()}`,
            title: values.title,
            summary: values.summary,
            body: values.body || '',
            type: values.type,
            category: values.category,
            author: values.author,
            minPlan: values.minPlan,
            status: values.status || 'rascunho',
            views: 0,
            likes: 0,
            imageUrl: values.imageUrl || '',
            publishedAt: values.status === 'publicado' ? new Date().toISOString() : null,
            createdAt: new Date().toISOString(),
          };
          dispatch(addContent(content));
          message.success('Conteúdo adicionado!');
          setFormOpen(false);
          form.resetFields();
        }}>
          <Form.Item name="title" label="Título" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="summary" label="Resumo" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="imageUrl" label="URL da Imagem"><Input placeholder="https://..." /></Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="Tipo" rules={[{ required: true }]}>
                <Select placeholder="Selecione">
                  <Select.Option value="artigo">Artigo</Select.Option>
                  <Select.Option value="video">Vídeo</Select.Option>
                  <Select.Option value="ebook">E-book</Select.Option>
                  <Select.Option value="curso">Curso</Select.Option>
                  <Select.Option value="podcast">Podcast</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label="Categoria" rules={[{ required: true }]}>
                <Select placeholder="Selecione">
                  <Select.Option value="Instagram">Instagram</Select.Option>
                  <Select.Option value="Monetização">Monetização</Select.Option>
                  <Select.Option value="Produção">Produção</Select.Option>
                  <Select.Option value="Plataformas">Plataformas</Select.Option>
                  <Select.Option value="Edição">Edição</Select.Option>
                  <Select.Option value="Finanças">Finanças</Select.Option>
                  <Select.Option value="Jurídico">Jurídico</Select.Option>
                  <Select.Option value="Marketing">Marketing</Select.Option>
                  <Select.Option value="Tendências">Tendências</Select.Option>
                  <Select.Option value="Tutorial">Tutorial</Select.Option>
                  <Select.Option value="Inspiração">Inspiração</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="author" label="Autor" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={8}>
              <Form.Item name="minPlan" label="Plano Mínimo" rules={[{ required: true }]}>
                <Select placeholder="Selecione">
                  <Select.Option value="basico">Básico</Select.Option>
                  <Select.Option value="intermediario">Intermediário</Select.Option>
                  <Select.Option value="avancado">Avançado</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="Status" initialValue="rascunho">
                <Select>
                  <Select.Option value="rascunho">Rascunho</Select.Option>
                  <Select.Option value="publicado">Publicado</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="body" label="Conteúdo"><Input.TextArea rows={4} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
