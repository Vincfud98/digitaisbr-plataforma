import { useState } from 'react';
import { Card, Typography, Tag, Row, Col, Statistic, Input, Select, Space, Empty, Button, Modal, Form, message, Drawer, Divider, Avatar } from 'antd';
import {
  ReadOutlined, SearchOutlined, EyeOutlined, HeartOutlined, PlayCircleOutlined,
  FileTextOutlined, BookOutlined, AudioOutlined, VideoCameraOutlined, PlusOutlined,
  ClockCircleOutlined, UserOutlined, ArrowRightOutlined, StarFilled, LockOutlined,
} from '@ant-design/icons';
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
  const contents = useAppSelector((s) => s.conteudos.list);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Content | null>(null);
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
          <Card><Statistic title="Publicados" value={totalPublished} prefix={<ReadOutlined />} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Total de Visualizações" value={totalViews} prefix={<EyeOutlined />} valueStyle={{ color: '#1677ff' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Total de Curtidas" value={totalLikes} prefix={<HeartOutlined />} valueStyle={{ color: '#ff4d4f' }} /></Card>
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
                  onClick={() => setSelected(content)}
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

      {/* Detail Drawer */}
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        width={640}
        styles={{ body: { padding: 0 } }}
        title={null}
        closable
      >
        {selected && (() => {
          const tc = typeConfig[selected.type];
          return (
            <div>
              {/* Hero image */}
              <div style={{ position: 'relative', height: 220 }}>
                {selected.imageUrl ? (
                  <img src={selected.imageUrl} alt={selected.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: '100%', background: `linear-gradient(135deg, ${tc.hex}, ${tc.hex}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: 64, color: 'rgba(255,255,255,0.3)' }}>{tc.icon}</div>
                  </div>
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />
                <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20 }}>
                  <Space size={6} style={{ marginBottom: 8 }}>
                    <Tag color={tc.color} style={{ borderRadius: 8 }}>{tc.icon} {tc.label}</Tag>
                    <Tag style={{ borderRadius: 8, background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}>{selected.category}</Tag>
                    {selected.minPlan !== 'basico' && (
                      <Tag color={planConfig[selected.minPlan].color} style={{ borderRadius: 8 }}>
                        <StarFilled /> {planConfig[selected.minPlan].label}
                      </Tag>
                    )}
                  </Space>
                  <Title level={4} style={{ color: '#fff', margin: 0, lineHeight: 1.3 }}>{selected.title}</Title>
                </div>
              </div>

              <div style={{ padding: '20px 24px' }}>
                {/* Meta info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Space size={12}>
                    <Avatar size={32} icon={<UserOutlined />} style={{ background: tc.hex }} />
                    <div>
                      <Text strong style={{ display: 'block', fontSize: 13 }}>{selected.author}</Text>
                      {selected.publishedAt && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <ClockCircleOutlined style={{ marginRight: 4 }} />
                          {new Date(selected.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </Text>
                      )}
                    </div>
                  </Space>
                  <Space size={16}>
                    <span style={{ textAlign: 'center' }}>
                      <EyeOutlined style={{ color: '#1677ff', fontSize: 16 }} />
                      <Text strong style={{ display: 'block', fontSize: 13 }}>{selected.views.toLocaleString('pt-BR')}</Text>
                    </span>
                    <span style={{ textAlign: 'center' }}>
                      <HeartOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
                      <Text strong style={{ display: 'block', fontSize: 13 }}>{selected.likes.toLocaleString('pt-BR')}</Text>
                    </span>
                  </Space>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                {/* Summary */}
                <Paragraph style={{ fontSize: 15, color: '#555', lineHeight: 1.7, marginBottom: 16 }}>
                  {selected.summary}
                </Paragraph>

                {/* Body content */}
                {selected.body ? (
                  <div style={{ background: '#fafafa', borderRadius: 12, padding: 20 }}>
                    {selected.body.split('\n').map((line, i) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <Text key={i} strong style={{ display: 'block', fontSize: 14, marginTop: i > 0 ? 16 : 0, marginBottom: 4 }}>{line.replace(/\*\*/g, '')}</Text>;
                      }
                      if (line.startsWith('- ')) {
                        return <div key={i} style={{ paddingLeft: 16, fontSize: 13, lineHeight: 1.8 }}><ArrowRightOutlined style={{ fontSize: 10, color: tc.hex, marginRight: 8 }} />{line.slice(2)}</div>;
                      }
                      if (line.startsWith('Módulo ') || line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.') || line.startsWith('5.') || line.startsWith('6.') || line.startsWith('7.') || line.startsWith('8.')) {
                        return <div key={i} style={{ paddingLeft: 8, fontSize: 13, lineHeight: 1.8, fontWeight: 500 }}>{line}</div>;
                      }
                      if (!line.trim()) return <div key={i} style={{ height: 8 }} />;
                      return <Paragraph key={i} style={{ fontSize: 13, lineHeight: 1.8, margin: '0 0 4px' }}>{line}</Paragraph>;
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <Text type="secondary">Este conteúdo está em rascunho e ainda não possui corpo.</Text>
                  </div>
                )}

                <Divider style={{ margin: '20px 0 12px' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <Tag color={statusConfig[selected.status].color}>{statusConfig[selected.status].label}</Tag>
                  <Tag color={planConfig[selected.minPlan].color}>Plano: {planConfig[selected.minPlan].label}</Tag>
                  <Tag>{selected.category}</Tag>
                </div>
              </div>
            </div>
          );
        })()}
      </Drawer>

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
