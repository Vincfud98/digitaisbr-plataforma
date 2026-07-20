import { useState } from 'react';
import { Card, Typography, Tag, Row, Col, Input, Select, Empty, Avatar, Space } from 'antd';
import {
  ReadOutlined, SearchOutlined, LockOutlined, EyeOutlined, HeartOutlined,
  UserOutlined, ClockCircleOutlined, FileTextOutlined, VideoCameraOutlined,
  BookOutlined, PlayCircleOutlined, AudioOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import type { PlanType, Content, ContentType } from '../../types';

const { Title, Text, Paragraph } = Typography;

const planLabels: Record<PlanType, string> = { basico: 'Básico', intermediario: 'Intermediário', avancado: 'Avançado' };
const planColors: Record<PlanType, string> = { basico: 'blue', intermediario: 'purple', avancado: 'gold' };
const planOrder: PlanType[] = ['basico', 'intermediario', 'avancado'];

const typeConfig: Record<ContentType, { color: string; hex: string; label: string; icon: React.ReactNode }> = {
  artigo: { color: 'blue', hex: '#1677ff', label: 'Artigo', icon: <FileTextOutlined /> },
  video: { color: 'red', hex: '#ff4d4f', label: 'Vídeo', icon: <VideoCameraOutlined /> },
  ebook: { color: 'green', hex: '#52c41a', label: 'E-book', icon: <BookOutlined /> },
  curso: { color: 'purple', hex: '#722ed1', label: 'Curso', icon: <PlayCircleOutlined /> },
  podcast: { color: 'orange', hex: '#fa8c16', label: 'Podcast', icon: <AudioOutlined /> },
};


export default function PortalConteudosPage() {
  const navigate = useNavigate();
  const conteudos = useAppSelector((s) => s.conteudos.list);
  const associados = useAppSelector((s) => s.associados.list);
  const { user } = useAppSelector((s) => s.auth);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const associado = associados.find((a) => a.id === 'assoc-1') || associados[0];
  const plan = (associado?.planType || user?.plan || 'basico') as PlanType;
  const planIdx = planOrder.indexOf(plan);

  const publicados = conteudos.filter((c) => c.status === 'publicado');
  const disponiveis = publicados.filter((c) => planOrder.indexOf(c.minPlan) <= planIdx);
  const bloqueados = publicados.filter((c) => planOrder.indexOf(c.minPlan) > planIdx);

  const categories = [...new Set(publicados.map((c) => c.category))];

  const filterContent = (list: Content[]) => list.filter((c) => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.summary.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    return true;
  });

  const filteredDisp = filterContent(disponiveis);
  const filteredBloq = filterContent(bloqueados);

  return (
    <div>
      <Title level={4} style={{ marginBottom: 8 }}>
        <ReadOutlined style={{ marginRight: 8 }} />
        Conteúdos
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        {disponiveis.length} conteúdo(s) disponível(is) no seu plano <Tag color={planColors[plan]}>{planLabels[plan]}</Tag>
      </Text>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input placeholder="Buscar conteúdo..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 260 }} allowClear />
        <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 140 }}>
          <Select.Option value="all">Todos os tipos</Select.Option>
          <Select.Option value="artigo">Artigo</Select.Option>
          <Select.Option value="video">Vídeo</Select.Option>
          <Select.Option value="podcast">Podcast</Select.Option>
          <Select.Option value="ebook">E-book</Select.Option>
        </Select>
        <Select value={categoryFilter} onChange={setCategoryFilter} style={{ width: 180 }}>
          <Select.Option value="all">Todas categorias</Select.Option>
          {categories.map((c) => <Select.Option key={c} value={c}>{c}</Select.Option>)}
        </Select>
      </div>

      <Row gutter={[16, 16]}>
        {filteredDisp.map((c) => {
          const tc = typeConfig[c.type];
          return (
            <Col xs={24} sm={12} lg={8} key={c.id}>
              <Card
                hoverable
                onClick={() => navigate(`/portal/conteudos/${c.id}`)}
                style={{ height: '100%', borderRadius: 12, overflow: 'hidden' }}
                styles={{ body: { padding: 16 } }}
                cover={
                  <div style={{ aspectRatio: '16/9', position: 'relative', overflow: 'hidden' }}>
                    {c.imageUrl ? (
                      <img src={c.imageUrl} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${tc.hex}22, ${tc.hex}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: 40, color: tc.hex, opacity: 0.6 }}>{tc.icon}</div>
                      </div>
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
                    <div style={{ position: 'absolute', top: 8, left: 8 }}>
                      <Tag color={tc.color} style={{ borderRadius: 8, fontSize: 11 }}>{tc.icon} {tc.label}</Tag>
                    </div>
                    <div style={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', gap: 10 }}>
                      <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 11 }}><EyeOutlined /> {c.views.toLocaleString('pt-BR')}</Text>
                      <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 11 }}><HeartOutlined /> {c.likes.toLocaleString('pt-BR')}</Text>
                    </div>
                  </div>
                }
              >
                <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 6, lineHeight: 1.3 }}>{c.title}</Text>
                <Paragraph type="secondary" style={{ fontSize: 12, margin: '0 0 10px', lineHeight: 1.5 }} ellipsis={{ rows: 2 }}>
                  {c.summary}
                </Paragraph>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space size={6}>
                    <Avatar size={20} icon={<UserOutlined />} style={{ background: tc.hex, fontSize: 10 }} />
                    <Text type="secondary" style={{ fontSize: 11 }}>{c.author}</Text>
                  </Space>
                  {c.publishedAt && (
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      <ClockCircleOutlined /> {new Date(c.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </Text>
                  )}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {filteredDisp.length === 0 && <Empty description="Nenhum conteúdo encontrado." style={{ margin: '40px 0' }} />}

      {filteredBloq.length > 0 && (
        <>
          <Title level={5} style={{ marginTop: 24 }}>
            <LockOutlined style={{ marginRight: 8 }} />
            Conteúdos do plano superior ({filteredBloq.length})
          </Title>
          <Row gutter={[16, 16]}>
            {filteredBloq.map((c) => (
              <Col xs={24} sm={12} lg={8} key={c.id}>
                <Card size="small" style={{ opacity: 0.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Tag>{c.type.charAt(0).toUpperCase() + c.type.slice(1)}</Tag>
                    <Tag color={planColors[c.minPlan]}>{planLabels[c.minPlan]}</Tag>
                  </div>
                  <Title level={5} style={{ margin: 0, fontSize: 14 }}>{c.title}</Title>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    <LockOutlined /> Requer plano {planLabels[c.minPlan]}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </div>
  );
}
