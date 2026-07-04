import { useState } from 'react';
import { Card, Typography, Tag, Row, Col, Statistic, Input, Select, Space, Empty, Button, Modal, Form, message } from 'antd';
import {
  ReadOutlined, SearchOutlined, EyeOutlined, HeartOutlined, PlayCircleOutlined,
  FileTextOutlined, BookOutlined, AudioOutlined, VideoCameraOutlined, PlusOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { addContent } from '../../store/slices/conteudosSlice';
import type { Content, ContentType, ContentStatus, PlanType } from '../../types';

const { Title, Text, Paragraph } = Typography;

const typeConfig: Record<ContentType, { color: string; label: string; icon: React.ReactNode }> = {
  artigo: { color: 'blue', label: 'Artigo', icon: <FileTextOutlined /> },
  video: { color: 'red', label: 'Vídeo', icon: <VideoCameraOutlined /> },
  ebook: { color: 'green', label: 'E-book', icon: <BookOutlined /> },
  curso: { color: 'purple', label: 'Curso', icon: <PlayCircleOutlined /> },
  podcast: { color: 'orange', label: 'Podcast', icon: <AudioOutlined /> },
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
          Conteúdos Educacionais
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
                  style={{ height: '100%' }}
                  cover={
                    <div style={{ height: 120, background: `linear-gradient(135deg, ${tc.color === 'blue' ? '#1677ff' : tc.color === 'red' ? '#ff4d4f' : tc.color === 'green' ? '#52c41a' : tc.color === 'purple' ? '#722ed1' : '#fa8c16'}22, ${tc.color === 'blue' ? '#1677ff' : tc.color === 'red' ? '#ff4d4f' : tc.color === 'green' ? '#52c41a' : tc.color === 'purple' ? '#722ed1' : '#fa8c16'}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <div style={{ fontSize: 36, color: tc.color === 'blue' ? '#1677ff' : tc.color === 'red' ? '#ff4d4f' : tc.color === 'green' ? '#52c41a' : tc.color === 'purple' ? '#722ed1' : '#fa8c16' }}>{tc.icon}</div>
                      <div style={{ position: 'absolute', top: 8, right: 8 }}>
                        <Tag color={statusConfig[content.status].color}>{statusConfig[content.status].label}</Tag>
                      </div>
                      <div style={{ position: 'absolute', top: 8, left: 8 }}>
                        <Tag color={tc.color}>{tc.label}</Tag>
                      </div>
                    </div>
                  }
                >
                  <Card.Meta
                    title={<Text style={{ fontSize: 14 }}>{content.title}</Text>}
                    description={
                      <div>
                        <Paragraph type="secondary" style={{ fontSize: 12, margin: '4px 0 8px' }}>
                          {content.summary}
                        </Paragraph>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Space size={12}>
                            <Text type="secondary" style={{ fontSize: 11 }}><EyeOutlined /> {content.views}</Text>
                            <Text type="secondary" style={{ fontSize: 11 }}><HeartOutlined /> {content.likes}</Text>
                          </Space>
                          <Tag color={planConfig[content.minPlan].color} style={{ fontSize: 10 }}>{planConfig[content.minPlan].label}</Tag>
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary" style={{ fontSize: 11 }}>{content.author}</Text>
                          {content.publishedAt && <Text type="secondary" style={{ fontSize: 11 }}> · {new Date(content.publishedAt).toLocaleDateString('pt-BR')}</Text>}
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

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
            imageUrl: '',
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
                  <Select.Option value="Marketing">Marketing</Select.Option>
                  <Select.Option value="Vendas">Vendas</Select.Option>
                  <Select.Option value="Finanças">Finanças</Select.Option>
                  <Select.Option value="Gestão">Gestão</Select.Option>
                  <Select.Option value="Tecnologia">Tecnologia</Select.Option>
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
