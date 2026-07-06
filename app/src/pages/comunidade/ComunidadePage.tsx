import { useState, useMemo } from 'react';
import { Tag, Button, Input, Select, Typography, Card, Row, Col, Statistic, Space, message, Modal, Form, Segmented, Badge, Avatar } from 'antd';
import {
  CommentOutlined, SearchOutlined, PlusOutlined, LikeOutlined,
  MessageOutlined, PushpinOutlined, FireOutlined, ShareAltOutlined,
  LikeFilled, HeartOutlined, HeartFilled, SendOutlined, TrophyOutlined, TeamOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { addTopic } from '../../store/slices/comunidadeSlice';
import type { ForumTopic } from '../../types';

const { Title, Text, Paragraph } = Typography;

const categoryConfig: Record<string, { color: string; emoji: string }> = {
  'Dicas de Vendas': { color: 'green', emoji: '💡' },
  'Marketing Digital': { color: 'blue', emoji: '📱' },
  'Gestão Financeira': { color: 'gold', emoji: '💰' },
  'Experiências': { color: 'purple', emoji: '🎯' },
  'Conquistas': { color: 'orange', emoji: '🏆' },
  'Eventos': { color: 'cyan', emoji: '📅' },
  'Sugestões': { color: 'magenta', emoji: '💬' },
  'Dúvidas': { color: 'red', emoji: '❓' },
  'Novidades': { color: 'lime', emoji: '🆕' },
};

const planColors: Record<string, string> = { basico: '#1677ff', intermediario: '#722ed1', avancado: '#faad14' };
const planLabels: Record<string, string> = { basico: 'Básico', intermediario: 'Intermediário', avancado: 'Avançado' };

const authorPlans: Record<string, string> = {
  'Maria Silva': 'avancado', 'João Santos': 'intermediario', 'Ana Oliveira': 'avancado',
  'Carlos Mendes': 'basico', 'Juliana Costa': 'avancado', 'Pedro Lima': 'intermediario',
  'Fernanda Souza': 'avancado', 'Ricardo Alves': 'intermediario', 'Camila Ferreira': 'basico',
  'Bruno Rocha': 'avancado',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}sem`;
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export default function ComunidadePage() {
  const dispatch = useAppDispatch();
  const topics = useAppSelector((s) => s.comunidade.list);
  const { user } = useAppSelector((s) => s.auth);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [view, setView] = useState<string>('feed');
  const [formOpen, setFormOpen] = useState(false);
  const [form] = Form.useForm();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    topics.forEach((t) => map.set(t.category, (map.get(t.category) || 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [topics]);

  const filtered = useMemo(() => {
    return topics.filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.body.toLowerCase().includes(search.toLowerCase()) && !t.authorName.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (view === 'fixados' && t.status !== 'fixado') return false;
      if (view === 'populares') return true;
      return true;
    });
  }, [topics, search, categoryFilter, view]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (view === 'populares') list.sort((a, b) => (b.likes + b.replies * 2) - (a.likes + a.replies * 2));
    else {
      list.sort((a, b) => {
        if (a.status === 'fixado' && b.status !== 'fixado') return -1;
        if (b.status === 'fixado' && a.status !== 'fixado') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
    return list;
  }, [filtered, view]);

  const totalPosts = topics.length;
  const totalReplies = topics.reduce((s, t) => s + t.replies, 0);
  const totalLikes = topics.reduce((s, t) => s + t.likes, 0);
  const activeAuthors = new Set(topics.map((t) => t.authorId)).size;
  const fixados = topics.filter((t) => t.status === 'fixado').length;

  const topContributors = useMemo(() => {
    const map = new Map<string, { name: string; posts: number; likes: number }>();
    topics.forEach((t) => {
      const entry = map.get(t.authorId) || { name: t.authorName, posts: 0, likes: 0 };
      entry.posts++;
      entry.likes += t.likes;
      map.set(t.authorId, entry);
    });
    return Array.from(map.values()).sort((a, b) => (b.likes + b.posts * 5) - (a.likes + a.posts * 5)).slice(0, 5);
  }, [topics]);

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSave = (id: string) => {
    setSavedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); message.info('Removido dos salvos'); } else { next.add(id); message.success('Post salvo!'); }
      return next;
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleCreate = (values: { title: string; category: string; body: string }) => {
    const topic: ForumTopic = {
      id: `post-${Date.now()}`, title: values.title, body: values.body,
      authorId: user?.id || 'admin', authorName: user?.name || 'Admin',
      category: values.category, status: 'aberto', replies: 0, views: 0, likes: 0,
      lastReplyAt: null, createdAt: new Date().toISOString(),
    };
    dispatch(addTopic(topic));
    message.success('Post publicado!');
    setFormOpen(false);
    form.resetFields();
  };

  const PostCard = ({ post }: { post: ForumTopic }) => {
    const isFixado = post.status === 'fixado';
    const isLiked = likedPosts.has(post.id);
    const isSaved = savedPosts.has(post.id);
    const isExpanded = expandedPosts.has(post.id);
    const plan = authorPlans[post.authorName] || 'basico';
    const catConf = categoryConfig[post.category] || { color: 'default', emoji: '📝' };
    const shouldTruncate = post.body.length > 200;
    const displayBody = shouldTruncate && !isExpanded ? post.body.substring(0, 200) + '...' : post.body;

    return (
      <div style={{
        background: '#fff', borderRadius: 10, border: '1px solid #f0f0f0',
        overflow: 'hidden', transition: 'box-shadow 0.2s',
        borderTop: isFixado ? '3px solid #faad14' : undefined,
      }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)')}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}>
        {isFixado && (
          <div style={{ background: '#fffbe6', padding: '4px 16px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#ad8b00' }}>
            <PushpinOutlined /> Post fixado pela administração
          </div>
        )}

        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <Avatar size={44} style={{ background: planColors[plan], fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
              {post.authorName.charAt(0)}
            </Avatar>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Text strong style={{ fontSize: 14 }}>{post.authorName}</Text>
                <Tag color={planColors[plan]} style={{ fontSize: 10, margin: 0, lineHeight: '16px' }}>{planLabels[plan]}</Tag>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#888' }}>
                <span>{timeAgo(post.createdAt)}</span>
                <span>·</span>
                <Tag color={catConf.color} style={{ fontSize: 10, margin: 0 }}>{catConf.emoji} {post.category}</Tag>
              </div>
            </div>
          </div>

          <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 6 }}>{post.title}</Text>
          <div style={{ fontSize: 13, color: '#333', lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: shouldTruncate ? 4 : 12 }}>
            {displayBody}
          </div>
          {shouldTruncate && (
            <Button type="link" size="small" style={{ padding: 0, marginBottom: 8, fontSize: 12 }} onClick={() => toggleExpand(post.id)}>
              {isExpanded ? 'ver menos' : '...ver mais'}
            </Button>
          )}

          <div style={{ borderTop: '1px solid #f5f5f5', paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 4, fontSize: 12, color: '#888' }}>
              {(post.likes + (isLiked ? 1 : 0)) > 0 && <span>{post.likes + (isLiked ? 1 : 0)} curtida{(post.likes + (isLiked ? 1 : 0)) !== 1 ? 's' : ''}</span>}
              {post.replies > 0 && <span>· {post.replies} comentário{post.replies !== 1 ? 's' : ''}</span>}
              {post.views > 0 && <span>· {post.views.toLocaleString('pt-BR')} visualizações</span>}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f5f5f5', marginTop: 4, paddingTop: 4, display: 'flex', justifyContent: 'space-around' }}>
            <Button type="text" size="small" icon={isLiked ? <LikeFilled style={{ color: '#1677ff' }} /> : <LikeOutlined />} onClick={() => toggleLike(post.id)}
              style={{ flex: 1, color: isLiked ? '#1677ff' : '#666' }}>
              Curtir
            </Button>
            <Button type="text" size="small" icon={<MessageOutlined />} style={{ flex: 1, color: '#666' }}
              onClick={() => message.info('Comentários serão implementados com Firestore.')}>
              Comentar
            </Button>
            <Button type="text" size="small" icon={<ShareAltOutlined />} style={{ flex: 1, color: '#666' }}
              onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/comunidade/${post.id}`); message.success('Link copiado!'); }}>
              Compartilhar
            </Button>
            <Button type="text" size="small" icon={isSaved ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />} onClick={() => toggleSave(post.id)}
              style={{ flex: 1, color: isSaved ? '#ff4d4f' : '#666' }}>
              Salvar
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <TeamOutlined style={{ marginRight: 8 }} />
          Comunidade DigitaisBR
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>Criar Post</Button>
      </div>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #1677ff' }}>
            <Statistic title="Posts" value={totalPosts} styles={{ content: { color: '#1677ff', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #52c41a' }}>
            <Statistic title="Comentários" value={totalReplies} styles={{ content: { color: '#52c41a', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #ff4d4f' }}>
            <Statistic title="Curtidas" value={totalLikes} styles={{ content: { color: '#ff4d4f', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #722ed1' }}>
            <Statistic title="Membros Ativos" value={activeAuthors} styles={{ content: { color: '#722ed1', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #faad14' }}>
            <Statistic title="Fixados" value={fixados} styles={{ content: { color: '#faad14', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card size="small" style={{ borderLeft: '3px solid #13c2c2' }}>
            <Statistic title="Categorias" value={categories.length} styles={{ content: { color: '#13c2c2', fontSize: 20 } }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #f0f0f0', padding: 16, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 12 }}
              onClick={() => setFormOpen(true)}>
              <Avatar size={40} style={{ background: '#1677ff', flexShrink: 0 }} icon={<SendOutlined />} />
              <div style={{ flex: 1, background: '#f5f5f5', borderRadius: 20, padding: '10px 16px', color: '#888', fontSize: 14 }}>
                Compartilhe uma dica, experiência ou conquista...
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <Segmented
              value={view}
              onChange={(v) => setView(v as string)}
              options={[
                { label: 'Feed', value: 'feed' },
                { label: <span><FireOutlined /> Populares</span>, value: 'populares' },
                { label: <Badge count={fixados} size="small" offset={[8, -2]}><span><PushpinOutlined /> Fixados</span></Badge>, value: 'fixados' },
              ]}
            />
            <Space size={8} wrap>
              <Input placeholder="Buscar..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 200 }} allowClear size="small" />
              <Select value={categoryFilter} onChange={setCategoryFilter} style={{ width: 150 }} size="small">
                <Select.Option value="all">Todas categorias</Select.Option>
                {categories.map(([cat]) => (
                  <Select.Option key={cat} value={cat}>{(categoryConfig[cat]?.emoji || '📝')} {cat}</Select.Option>
                ))}
              </Select>
            </Space>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sorted.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#888', background: '#fff', borderRadius: 10, border: '1px solid #f0f0f0' }}>
                <CommentOutlined style={{ fontSize: 48, marginBottom: 12 }} />
                <div style={{ fontSize: 16 }}>Nenhum post encontrado</div>
                <Button type="primary" style={{ marginTop: 12 }} onClick={() => setFormOpen(true)}>Criar o primeiro post</Button>
              </div>
            ) : sorted.map((post) => <PostCard key={post.id} post={post} />)}
          </div>

          {sorted.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>{sorted.length} post{sorted.length !== 1 ? 's' : ''} exibido{sorted.length !== 1 ? 's' : ''}</Text>
            </div>
          )}
        </Col>

        <Col xs={24} lg={8}>
          <Card size="small" style={{ marginBottom: 12, borderRadius: 10 }} title={<><TrophyOutlined style={{ color: '#faad14', marginRight: 6 }} />Top Contribuidores</>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topContributors.map((c, i) => {
                const plan = authorPlans[c.name] || 'basico';
                return (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: i === 0 ? '#faad14' : i === 1 ? '#bfbfbf' : i === 2 ? '#d48806' : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: i < 3 ? '#fff' : '#888', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <Avatar size={32} style={{ background: planColors[plan], flexShrink: 0 }}>{c.name.charAt(0)}</Avatar>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: 13 }}>{c.name}</Text>
                      <div style={{ fontSize: 11, color: '#888' }}>{c.posts} posts · {c.likes} curtidas</div>
                    </div>
                    <Tag color={planColors[plan]} style={{ fontSize: 10, margin: 0 }}>{planLabels[plan]}</Tag>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card size="small" style={{ marginBottom: 12, borderRadius: 10 }} title={<><FireOutlined style={{ color: '#ff4d4f', marginRight: 6 }} />Categorias</>}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {categories.map(([cat, count]) => {
                const conf = categoryConfig[cat] || { color: 'default', emoji: '📝' };
                const isActive = categoryFilter === cat;
                return (
                  <Tag key={cat} color={isActive ? conf.color : undefined}
                    style={{ cursor: 'pointer', borderRadius: 16, padding: '2px 10px', fontSize: 12, background: isActive ? undefined : '#fafafa' }}
                    onClick={() => setCategoryFilter(isActive ? 'all' : cat)}>
                    {conf.emoji} {cat} ({count})
                  </Tag>
                );
              })}
            </div>
          </Card>

          <Card size="small" style={{ borderRadius: 10 }} title="Sobre a Comunidade">
            <Paragraph type="secondary" style={{ fontSize: 12, margin: 0 }}>
              Espaço para associados compartilharem dicas, experiências, conquistas e tirarem dúvidas. Ajude a comunidade a crescer compartilhando seu conhecimento!
            </Paragraph>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <Tag color="blue">{totalPosts} posts</Tag>
              <Tag color="green">{activeAuthors} membros</Tag>
              <Tag color="red">{totalLikes} curtidas</Tag>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal title="Criar Post" open={formOpen} onCancel={() => { setFormOpen(false); form.resetFields(); }} onOk={() => form.submit()} okText="Publicar" cancelText="Cancelar" width={600}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="title" label="Título do post" rules={[{ required: true, message: 'Dê um título ao seu post' }]}>
            <Input placeholder="Ex: Como aumentei minhas vendas em 300%..." />
          </Form.Item>
          <Form.Item name="category" label="Categoria" rules={[{ required: true }]}>
            <Select placeholder="Selecione a categoria">
              {Object.entries(categoryConfig).map(([cat, conf]) => (
                <Select.Option key={cat} value={cat}>{conf.emoji} {cat}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="body" label="Conteúdo" rules={[{ required: true, message: 'Escreva o conteúdo do post' }]}>
            <Input.TextArea rows={6} placeholder="Compartilhe sua experiência, dica ou conquista com a comunidade..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
