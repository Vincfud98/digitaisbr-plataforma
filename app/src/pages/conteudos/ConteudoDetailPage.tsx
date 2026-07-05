import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Tag, Space, Button, Card, Row, Col, Avatar, Progress, Divider, List, Empty } from 'antd';
import {
  ArrowLeftOutlined, EyeOutlined, HeartOutlined, HeartFilled, ShareAltOutlined,
  PlayCircleOutlined, PlayCircleFilled, FileTextOutlined, BookOutlined, AudioOutlined,
  VideoCameraOutlined, UserOutlined, ClockCircleOutlined, CalendarOutlined,
  DownloadOutlined, CheckCircleOutlined, LockOutlined, StarFilled,
  RightOutlined, ReadOutlined, SoundOutlined, FilePdfOutlined, CrownOutlined,
} from '@ant-design/icons';
import { useAppSelector } from '../../store';
import type { Content, ContentType, PlanType } from '../../types';

const { Title, Text, Paragraph } = Typography;

const typeConfig: Record<ContentType, { color: string; hex: string; label: string; icon: React.ReactNode }> = {
  artigo: { color: 'blue', hex: '#1677ff', label: 'Artigo', icon: <FileTextOutlined /> },
  video: { color: 'red', hex: '#ff4d4f', label: 'Vídeo', icon: <VideoCameraOutlined /> },
  ebook: { color: 'green', hex: '#52c41a', label: 'E-book', icon: <BookOutlined /> },
  curso: { color: 'purple', hex: '#722ed1', label: 'Curso', icon: <PlayCircleOutlined /> },
  podcast: { color: 'orange', hex: '#fa8c16', label: 'Podcast', icon: <AudioOutlined /> },
};

const planConfig: Record<PlanType, { color: string; label: string }> = {
  basico: { color: 'blue', label: 'Básico' },
  intermediario: { color: 'purple', label: 'Intermediário' },
  avancado: { color: 'gold', label: 'Avançado' },
};

function seededRandom(seed: number) {
  return Math.abs(Math.sin(seed) * 10000) % 1;
}

function VideoPlayer({ content }: { content: Content }) {
  if (content.videoUrl) {
    return (
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '56.25%',
        background: '#000',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 24,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}>
        <iframe
          src={content.videoUrl}
          title={content.title}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      paddingTop: '56.25%',
      background: '#000',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 24,
    }}>
      <img
        src={content.imageUrl || `https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&h=675&fit=crop`}
        alt={content.title}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.3)',
      }}>
        <PlayCircleFilled style={{ fontSize: 72, color: '#fff', cursor: 'pointer', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }} />
        <Text style={{ color: '#fff', marginTop: 12, fontSize: 16, fontWeight: 500 }}>Assistir {content.type === 'curso' ? 'Aulas' : 'Vídeo'}</Text>
      </div>
    </div>
  );
}

function PodcastPlayer({ content }: { content: Content }) {
  const tc = typeConfig.podcast;
  const seed = content.id.charCodeAt(content.id.length - 1);
  const duration = Math.floor(seededRandom(seed) * 45) + 15;
  return (
    <Card style={{ borderRadius: 12, marginBottom: 24, background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{
          width: 120, height: 120, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}>
          <img src={content.imageUrl} alt={content.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1 }}>
          <Text style={{ color: tc.hex, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            <SoundOutlined /> Podcast
          </Text>
          <Title level={5} style={{ color: '#fff', margin: '4px 0 8px' }}>{content.title}</Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <PlayCircleFilled style={{ fontSize: 40, color: tc.hex, cursor: 'pointer' }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '0%', height: '100%', background: tc.hex, borderRadius: 3 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>0:00</Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{duration}:00</Text>
              </div>
            </div>
          </div>
          <Space size={8}>
            <Button size="small" ghost icon={<DownloadOutlined />} style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)' }}>
              Baixar MP3
            </Button>
            <Button size="small" ghost icon={<ShareAltOutlined />} style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)' }}>
              Compartilhar
            </Button>
          </Space>
        </div>
      </div>
    </Card>
  );
}

function EbookSection({ content }: { content: Content }) {
  const seed = content.id.charCodeAt(content.id.length - 1);
  const pages = Math.floor(seededRandom(seed) * 60) + 20;
  return (
    <Card style={{ borderRadius: 12, marginBottom: 24, background: 'linear-gradient(135deg, #f0fdf0, #e8f5e9)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{
          width: 140, height: 190, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
          boxShadow: '8px 8px 24px rgba(0,0,0,0.15)',
          transform: 'rotate(-3deg)',
        }}>
          <img src={content.imageUrl} alt={content.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1 }}>
          <Tag color="green" style={{ marginBottom: 8 }}><BookOutlined /> E-book</Tag>
          <Title level={4} style={{ margin: '0 0 8px' }}>{content.title}</Title>
          <Paragraph type="secondary" style={{ margin: '0 0 16px' }}>{content.summary}</Paragraph>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div><Text type="secondary" style={{ fontSize: 12 }}>Páginas</Text><br /><Text strong>{pages}</Text></div>
            <div><Text type="secondary" style={{ fontSize: 12 }}>Formato</Text><br /><Text strong>PDF</Text></div>
            <div><Text type="secondary" style={{ fontSize: 12 }}>Autor</Text><br /><Text strong>{content.author}</Text></div>
          </div>
          <Space>
            <Button type="primary" icon={<DownloadOutlined />} size="large" style={{ background: '#52c41a', borderColor: '#52c41a' }}>
              Baixar E-book (PDF)
            </Button>
            <Button icon={<ReadOutlined />} size="large">
              Ler Online
            </Button>
          </Space>
        </div>
      </div>
    </Card>
  );
}

function CourseModules({ content }: { content: Content }) {
  const lines = content.body.split('\n').filter(l => l.trim());
  const modules = lines.filter(l => /^(Módulo|Aula|Capítulo)\s/i.test(l) || /^\d+[\.\)]\s/.test(l));
  const tc = typeConfig.curso;

  const moduleList = modules.length > 0 ? modules : [
    'Módulo 1: Introdução',
    'Módulo 2: Fundamentos',
    'Módulo 3: Prática',
    'Módulo 4: Avançado',
    'Módulo 5: Projeto Final',
  ];

  return (
    <Card
      title={<><PlayCircleOutlined style={{ color: tc.hex, marginRight: 8 }} />Grade do Curso</>}
      style={{ borderRadius: 12, marginBottom: 24 }}
      extra={<Tag color="purple">{moduleList.length} módulos</Tag>}
    >
      <List
        dataSource={moduleList}
        renderItem={(item, idx) => {
          const seed = idx * 7 + 3;
          const completed = idx < 0;
          const duration = Math.floor(seededRandom(seed) * 30) + 10;
          return (
            <List.Item
              style={{
                padding: '12px 16px',
                borderRadius: 8,
                marginBottom: 4,
                background: completed ? '#f6ffed' : idx === 0 ? `${tc.hex}08` : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              extra={
                <Space>
                  <Text type="secondary" style={{ fontSize: 12 }}>{duration} min</Text>
                  {completed ? (
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                  ) : (
                    <PlayCircleFilled style={{ color: idx === 0 ? tc.hex : '#d9d9d9', fontSize: 18 }} />
                  )}
                </Space>
              }
            >
              <Space>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: completed ? '#52c41a' : idx === 0 ? tc.hex : '#f0f0f0',
                  color: completed || idx === 0 ? '#fff' : '#999',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 600,
                }}>
                  {completed ? <CheckCircleOutlined /> : idx + 1}
                </div>
                <div>
                  <Text strong style={{ fontSize: 14 }}>{item.replace(/^(Módulo\s?\d+[:\s-]*|Aula\s?\d+[:\s-]*|\d+[\.\)]\s*)/i, '').trim() || item}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {item.match(/^(Módulo|Aula|Capítulo)\s?\d+/i)?.[0] || `Aula ${idx + 1}`}
                  </Text>
                </div>
              </Space>
            </List.Item>
          );
        }}
      />
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Progress percent={0} strokeColor={tc.hex} style={{ maxWidth: 400, margin: '0 auto' }} />
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>0 de {moduleList.length} módulos concluídos</Text>
      </div>
    </Card>
  );
}

function ArticleBody({ body, typeHex }: { body: string; typeHex: string }) {
  const elements = body.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return (
        <Title key={i} level={5} style={{ marginTop: i > 0 ? 24 : 0, marginBottom: 8, color: '#1a1a1a' }}>
          {line.replace(/\*\*/g, '')}
        </Title>
      );
    }
    if (/^\*\*[^*]+\*\*$/.test(line.trim())) {
      return (
        <Title key={i} level={5} style={{ marginTop: i > 0 ? 24 : 0, marginBottom: 8, color: '#1a1a1a' }}>
          {line.trim().replace(/\*\*/g, '')}
        </Title>
      );
    }
    if (line.startsWith('- ')) {
      return (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingLeft: 8, marginBottom: 6 }}>
          <RightOutlined style={{ fontSize: 10, color: typeHex, marginTop: 6, flexShrink: 0 }} />
          <Text style={{ fontSize: 15, lineHeight: 1.7 }}>{line.slice(2)}</Text>
        </div>
      );
    }
    if (/^(Módulo|Aula|Capítulo)\s/i.test(line) || /^\d+[\.\)]\s/.test(line)) {
      return (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: `${typeHex}08`, borderRadius: 8, marginBottom: 4, borderLeft: `3px solid ${typeHex}` }}>
          <Text strong style={{ fontSize: 14 }}>{line}</Text>
        </div>
      );
    }
    if (!line.trim()) return <div key={i} style={{ height: 12 }} />;
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <Paragraph key={i} style={{ fontSize: 15, lineHeight: 1.8, margin: '0 0 8px', color: '#333' }}>
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <Text key={j} strong>{part.replace(/\*\*/g, '')}</Text>;
          }
          return part;
        })}
      </Paragraph>
    );
  });
  return <div>{elements}</div>;
}

export default function ConteudoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const contents = useAppSelector((s) => s.conteudos.list);

  const content = contents.find((c) => c.id === id);

  const related = useMemo(() => {
    if (!content) return [];
    return contents
      .filter((c) => c.id !== content.id && c.status === 'publicado' && (c.category === content.category || c.type === content.type))
      .slice(0, 3);
  }, [content, contents]);

  if (!content) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <Empty description="Conteúdo não encontrado" />
        <Button type="primary" onClick={() => navigate(-1)} style={{ marginTop: 16 }}>Voltar</Button>
      </div>
    );
  }

  const tc = typeConfig[content.type];
  const seed = content.id.charCodeAt(content.id.length - 1);
  const readTime = Math.floor(seededRandom(seed) * 15) + 5;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Back button */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 12, padding: '4px 0', color: '#666' }}
      >
        Voltar para Conteúdos
      </Button>

      {/* Hero */}
      <div style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
        height: content.type === 'podcast' ? 0 : 320,
        display: content.type === 'podcast' ? 'none' : 'block',
      }}>
        <img
          src={content.imageUrl || `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=400&fit=crop`}
          alt={content.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)',
        }} />
        <div style={{ position: 'absolute', top: 16, left: 20 }}>
          <Space size={6}>
            <Tag color={tc.color} style={{ borderRadius: 10, fontSize: 13, padding: '4px 12px' }}>
              {tc.icon} {tc.label}
            </Tag>
            <Tag style={{ borderRadius: 10, background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', padding: '4px 12px' }}>
              {content.category}
            </Tag>
            {content.minPlan !== 'basico' && (
              <Tag color={planConfig[content.minPlan].color} style={{ borderRadius: 10, padding: '4px 12px' }}>
                <CrownOutlined /> {planConfig[content.minPlan].label}
              </Tag>
            )}
          </Space>
        </div>
        <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
          <Title level={2} style={{ color: '#fff', margin: '0 0 8px', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            {content.title}
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>{content.summary}</Text>
        </div>
      </div>

      {/* Meta bar */}
      <Card size="small" style={{ borderRadius: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Space size={16}>
            <Space>
              <Avatar size={40} icon={<UserOutlined />} style={{ background: tc.hex }} />
              <div>
                <Text strong>{content.author}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  {content.publishedAt
                    ? new Date(content.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
                    : 'Rascunho'
                  }
                </Text>
              </div>
            </Space>
            <Divider orientation="vertical" style={{ height: 32 }} />
            <Space size={16}>
              <span><EyeOutlined style={{ color: '#1677ff' }} /> <Text strong>{content.views.toLocaleString('pt-BR')}</Text></span>
              <span><HeartOutlined style={{ color: '#ff4d4f' }} /> <Text strong>{content.likes.toLocaleString('pt-BR')}</Text></span>
              <span><ClockCircleOutlined style={{ color: '#888' }} /> <Text type="secondary">{readTime} min</Text></span>
            </Space>
          </Space>
          <Space>
            <Button icon={<HeartFilled style={{ color: '#ff4d4f' }} />}>Curtir</Button>
            <Button icon={<ShareAltOutlined />}>Compartilhar</Button>
            {content.type === 'ebook' && (
              <Button type="primary" icon={<DownloadOutlined />} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                Baixar PDF
              </Button>
            )}
          </Space>
        </div>
      </Card>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          {/* Type-specific media */}
          {(content.type === 'video' || content.type === 'curso') && <VideoPlayer content={content} />}
          {content.type === 'podcast' && <PodcastPlayer content={content} />}
          {content.type === 'ebook' && <EbookSection content={content} />}

          {/* Course modules */}
          {content.type === 'curso' && <CourseModules content={content} />}

          {/* Article body */}
          {content.body ? (
            <Card style={{ borderRadius: 12, marginBottom: 24 }}>
              <div style={{ padding: '8px 0' }}>
                {content.type === 'artigo' && (
                  <div style={{ marginBottom: 20, padding: '16px 20px', background: '#f8f9fa', borderRadius: 10, borderLeft: `4px solid ${tc.hex}` }}>
                    <Text style={{ fontSize: 16, lineHeight: 1.7, color: '#555', fontStyle: 'italic' }}>{content.summary}</Text>
                  </div>
                )}
                <ArticleBody body={content.body} typeHex={tc.hex} />
              </div>
            </Card>
          ) : (
            <Card style={{ borderRadius: 12, marginBottom: 24 }}>
              <div style={{ textAlign: 'center', padding: 40 }}>
                <LockOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                <br />
                <Text type="secondary" style={{ fontSize: 16 }}>Este conteúdo está em preparação.</Text>
              </div>
            </Card>
          )}
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          {/* Content info card */}
          <Card title="Sobre este conteúdo" size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Tipo</Text>
                <Tag color={tc.color}>{tc.icon} {tc.label}</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Categoria</Text>
                <Tag>{content.category}</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Plano mínimo</Text>
                <Tag color={planConfig[content.minPlan].color}>{planConfig[content.minPlan].label}</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Leitura</Text>
                <Text>{readTime} min</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Status</Text>
                <Tag color={content.status === 'publicado' ? 'green' : 'orange'}>
                  {content.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                </Tag>
              </div>
            </div>
          </Card>

          {/* Resources */}
          {content.type !== 'artigo' && (
            <Card title="Recursos" size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {content.type === 'video' && (
                  <>
                    <Button block icon={<VideoCameraOutlined />} style={{ textAlign: 'left' }}>Vídeo em HD (1080p)</Button>
                    <Button block icon={<FileTextOutlined />} style={{ textAlign: 'left' }}>Slides da apresentação</Button>
                    <Button block icon={<DownloadOutlined />} style={{ textAlign: 'left' }}>Material complementar</Button>
                  </>
                )}
                {content.type === 'curso' && (
                  <>
                    <Button block icon={<FilePdfOutlined />} style={{ textAlign: 'left' }}>Apostila do curso (PDF)</Button>
                    <Button block icon={<FileTextOutlined />} style={{ textAlign: 'left' }}>Templates e modelos</Button>
                    <Button block icon={<DownloadOutlined />} style={{ textAlign: 'left' }}>Exercícios práticos</Button>
                    <Button block icon={<StarFilled style={{ color: '#faad14' }} />} style={{ textAlign: 'left' }}>Certificado de conclusão</Button>
                  </>
                )}
                {content.type === 'ebook' && (
                  <>
                    <Button block type="primary" icon={<DownloadOutlined />} style={{ textAlign: 'left', background: '#52c41a', borderColor: '#52c41a' }}>Download PDF</Button>
                    <Button block icon={<ReadOutlined />} style={{ textAlign: 'left' }}>Ler no navegador</Button>
                    <Button block icon={<FileTextOutlined />} style={{ textAlign: 'left' }}>Planilhas complementares</Button>
                  </>
                )}
                {content.type === 'podcast' && (
                  <>
                    <Button block icon={<DownloadOutlined />} style={{ textAlign: 'left' }}>Baixar MP3</Button>
                    <Button block icon={<FileTextOutlined />} style={{ textAlign: 'left' }}>Transcrição completa</Button>
                    <Button block icon={<ReadOutlined />} style={{ textAlign: 'left' }}>Notas do episódio</Button>
                  </>
                )}
              </div>
            </Card>
          )}

          {/* Related content */}
          {related.length > 0 && (
            <Card title="Conteúdos relacionados" size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {related.map((r) => {
                  const rtc = typeConfig[r.type];
                  return (
                    <div
                      key={r.id}
                      onClick={() => navigate(`/conteudos/${r.id}`)}
                      style={{
                        display: 'flex', gap: 12, cursor: 'pointer',
                        padding: 8, borderRadius: 8, transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{
                        width: 70, height: 50, borderRadius: 6, overflow: 'hidden', flexShrink: 0,
                      }}>
                        <img
                          src={r.imageUrl || `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=140&h=100&fit=crop`}
                          alt={r.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text strong style={{ fontSize: 12, display: 'block', lineHeight: 1.3 }} ellipsis>{r.title}</Text>
                        <Space size={4} style={{ marginTop: 4 }}>
                          <Tag color={rtc.color} style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px' }}>{rtc.label}</Tag>
                          <Text type="secondary" style={{ fontSize: 11 }}>{r.views.toLocaleString('pt-BR')} views</Text>
                        </Space>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
