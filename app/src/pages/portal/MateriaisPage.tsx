import { useState } from 'react';
import { Card, Typography, Tag, Row, Col, Button, Input, Tabs, Space, message, Empty } from 'antd';
import {
  PictureOutlined, CopyOutlined, DownloadOutlined, SearchOutlined,
  FileImageOutlined, VideoCameraOutlined, FileTextOutlined, MobileOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface Material {
  id: string;
  title: string;
  type: 'banner' | 'story' | 'post' | 'video' | 'copy';
  format: string;
  category: string;
  description: string;
  preview: string;
  copyText?: string;
}

const mockMaterials: Material[] = [
  { id: 'm1', title: 'Banner Promoção Geral', type: 'banner', format: '1200x628', category: 'Promoção', description: 'Banner para Facebook/LinkedIn com CTA de compra', preview: 'linear-gradient(135deg, #1677ff, #722ed1)', copyText: 'Confira os melhores produtos com desconto exclusivo! Use meu link e ganhe benefícios especiais.' },
  { id: 'm2', title: 'Story - Novo Produto', type: 'story', format: '1080x1920', category: 'Lançamento', description: 'Template de story para divulgar novos produtos', preview: 'linear-gradient(135deg, #f5222d, #fa8c16)', copyText: 'Acabou de chegar! 🔥 Novo produto na minha loja. Arrasta pra cima e confere!' },
  { id: 'm3', title: 'Post Carrossel', type: 'post', format: '1080x1080', category: 'Educativo', description: 'Template de carrossel com 5 slides sobre benefícios', preview: 'linear-gradient(135deg, #52c41a, #13c2c2)' },
  { id: 'm4', title: 'Vídeo Review Template', type: 'video', format: '16:9', category: 'Review', description: 'Script e roteiro para review de produtos', preview: 'linear-gradient(135deg, #722ed1, #eb2f96)' },
  { id: 'm5', title: 'Copy - Urgência', type: 'copy', format: 'Texto', category: 'Vendas', description: 'Texto pronto para postagens com senso de urgência', preview: 'linear-gradient(135deg, #faad14, #f5222d)', copyText: '⏰ ÚLTIMAS HORAS! Aproveite essa oferta exclusiva antes que acabe. Produtos selecionados com até 30% OFF na minha loja. Link na bio! 🔗' },
  { id: 'm6', title: 'Banner Black Friday', type: 'banner', format: '1200x628', category: 'Sazonal', description: 'Banner temático para Black Friday', preview: 'linear-gradient(135deg, #000, #434343)' },
  { id: 'm7', title: 'Story Depoimento', type: 'story', format: '1080x1920', category: 'Social Proof', description: 'Template para compartilhar depoimentos de clientes', preview: 'linear-gradient(135deg, #1677ff, #36cfc9)' },
  { id: 'm8', title: 'Copy - Benefícios', type: 'copy', format: 'Texto', category: 'Institucional', description: 'Texto explicando os benefícios da plataforma', preview: 'linear-gradient(135deg, #52c41a, #1677ff)', copyText: '🌟 Sabia que como associado DigitaisBR você tem acesso a descontos exclusivos, produtos selecionados e suporte premium? Vem fazer parte! Acesse minha loja pelo link na bio.' },
  { id: 'm9', title: 'Post Feed - Produto', type: 'post', format: '1080x1080', category: 'Produto', description: 'Template de post para destacar um produto específico', preview: 'linear-gradient(135deg, #eb2f96, #722ed1)' },
  { id: 'm10', title: 'Copy - Cupom', type: 'copy', format: 'Texto', category: 'Cupom', description: 'Texto para divulgar cupom de desconto exclusivo', preview: 'linear-gradient(135deg, #faad14, #52c41a)', copyText: '🎉 CUPOM EXCLUSIVO! Use o código [SEU_CUPOM] e ganhe desconto na minha loja DigitaisBR. Válido por tempo limitado! Corre lá: [SEU_LINK]' },
  { id: 'm11', title: 'Reels Script - Unboxing', type: 'video', format: '9:16', category: 'Unboxing', description: 'Roteiro para reels de unboxing com pontos de corte', preview: 'linear-gradient(135deg, #f5222d, #722ed1)' },
  { id: 'm12', title: 'Banner Dia das Mães', type: 'banner', format: '1200x628', category: 'Sazonal', description: 'Banner temático para Dia das Mães', preview: 'linear-gradient(135deg, #eb2f96, #ff85c0)' },
];

const typeConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  banner: { icon: <FileImageOutlined />, color: '#1677ff', label: 'Banner' },
  story: { icon: <MobileOutlined />, color: '#722ed1', label: 'Story' },
  post: { icon: <PictureOutlined />, color: '#52c41a', label: 'Post' },
  video: { icon: <VideoCameraOutlined />, color: '#f5222d', label: 'Vídeo' },
  copy: { icon: <FileTextOutlined />, color: '#faad14', label: 'Copy' },
};

export default function MateriaisPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');

  const filtered = mockMaterials.filter((m) => {
    if (tab !== 'all' && m.type !== tab) return false;
    if (search && !m.title.toLowerCase().includes(search.toLowerCase()) && !m.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const copyCopyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => message.success('Texto copiado!')).catch(() => message.info(text));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <PictureOutlined style={{ marginRight: 8 }} />
          Materiais de Divulgação
        </Title>
        <Input placeholder="Buscar material..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 260 }} allowClear />
      </div>

      <Tabs activeKey={tab} onChange={setTab} items={[
        { key: 'all', label: `Todos (${mockMaterials.length})` },
        { key: 'banner', label: `Banners (${mockMaterials.filter((m) => m.type === 'banner').length})` },
        { key: 'story', label: `Stories (${mockMaterials.filter((m) => m.type === 'story').length})` },
        { key: 'post', label: `Posts (${mockMaterials.filter((m) => m.type === 'post').length})` },
        { key: 'video', label: `Vídeos (${mockMaterials.filter((m) => m.type === 'video').length})` },
        { key: 'copy', label: `Copies (${mockMaterials.filter((m) => m.type === 'copy').length})` },
      ]} />

      {filtered.length === 0 ? (
        <Empty description="Nenhum material encontrado." />
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((m) => {
            const tc = typeConfig[m.type];
            return (
              <Col xs={24} sm={12} md={8} key={m.id}>
                <Card
                  hoverable
                  cover={
                    <div style={{
                      aspectRatio: '16/9',
                      background: m.preview,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: 8,
                      borderRadius: '8px 8px 0 0',
                    }}>
                      <div style={{ fontSize: 40, color: 'rgba(255,255,255,0.9)' }}>{tc.icon}</div>
                      <Tag style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}>{m.format}</Tag>
                    </div>
                  }
                  actions={
                    m.type === 'copy' && m.copyText
                      ? [
                          <Button key="copy" type="link" icon={<CopyOutlined />} onClick={() => copyCopyText(m.copyText!)}>Copiar Texto</Button>,
                        ]
                      : [
                          <Button key="dl" type="link" icon={<DownloadOutlined />} onClick={() => message.info('Downloads serão integrados ao Firebase Storage.')}>Baixar</Button>,
                        ]
                  }
                >
                  <Card.Meta
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 13 }}>{m.title}</Text>
                      </div>
                    }
                    description={
                      <div>
                        <Space size={4} style={{ marginBottom: 4 }}>
                          <Tag color={tc.color} style={{ fontSize: 10 }}>{tc.label}</Tag>
                          <Tag style={{ fontSize: 10 }}>{m.category}</Tag>
                        </Space>
                        <Paragraph type="secondary" style={{ fontSize: 11, margin: 0 }} ellipsis={{ rows: 2 }}>{m.description}</Paragraph>
                        {m.type === 'copy' && m.copyText && (
                          <div style={{ background: '#f5f5f5', padding: 8, borderRadius: 6, marginTop: 6 }}>
                            <Text style={{ fontSize: 11, fontStyle: 'italic' }}>{m.copyText.slice(0, 100)}...</Text>
                          </div>
                        )}
                      </div>
                    }
                  />
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}
