import { Card, Typography, Row, Col, Tag, Button, Empty, Divider, Avatar, Input, Badge, message } from 'antd';
import {
  ShopOutlined, WhatsAppOutlined, ShoppingCartOutlined, SearchOutlined,
  UserOutlined, StarFilled, SafetyCertificateOutlined, InstagramOutlined,
  YoutubeOutlined, GlobalOutlined, TeamOutlined, FireOutlined,
  ThunderboltOutlined, HeartOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEO from '../../components/SEO';
import { useAppSelector, useAppDispatch } from '../../store';
import { addToCart } from '../../store/slices/cartSlice';
import { categories } from '../../data/categories';
import type { Product, PlanType } from '../../types';

const { Title, Text, Paragraph } = Typography;

const planBadge: Record<PlanType, { label: string; color: string }> = {
  basico: { label: 'Creator', color: '#1677ff' },
  intermediario: { label: 'Creator Pro', color: '#722ed1' },
  avancado: { label: 'Creator Premium', color: '#faad14' },
};

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace('.0', '') + 'K';
  return String(n);
}

export default function LojaPublicaPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const lojas = useAppSelector((s) => s.lojas.list);
  const associados = useAppSelector((s) => s.associados.list);
  const allProducts = useAppSelector((s) => s.catalogo.list);
  const vendas = useAppSelector((s) => s.vendas.list);
  const cartItems = useAppSelector((s) => s.cart.items);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({
      item: { productId: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 },
      storeSlug: slug || '',
    }));
    message.success(`${product.name} adicionado ao carrinho`);
  };

  const store = lojas.find((l) => l.slug === slug);
  const associado = associados.find((a) => a.id === store?.associadoId);

  if (!store || !associado) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <Empty
          description={
            <div>
              <Title level={4}>Perfil não encontrado</Title>
              <Text type="secondary">Verifique o endereço e tente novamente.</Text>
            </div>
          }
        />
      </div>
    );
  }

  const primaryColor = store.config.primaryColor || '#1677ff';
  const plan = associado.planType as PlanType;
  const badge = planBadge[plan];

  const storeProducts = allProducts.filter((p) => store.productIds.includes(p.id) && p.status === 'ativo');
  const storeVendas = vendas.filter((v) => v.storeSlug === store.slug && v.status === 'aprovada');

  const filteredProducts = storeProducts.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
    return true;
  });

  const usedCategories = categories.filter((c) => storeProducts.some((p) => p.categoryId === c.id));

  const grouped = usedCategories.map((cat) => ({
    ...cat,
    products: filteredProducts.filter((p) => p.categoryId === cat.id),
  })).filter((g) => g.products.length > 0);

  const socialLinks = [
    associado.instagram && { icon: <InstagramOutlined />, label: associado.instagram, color: '#E4405F', url: `https://instagram.com/${associado.instagram.replace('@', '')}` },
    associado.youtube && { icon: <YoutubeOutlined />, label: associado.youtube, color: '#FF0000', url: `https://youtube.com/${associado.youtube}` },
    associado.tiktok && { icon: <span style={{ fontWeight: 800, fontSize: 13 }}>T</span>, label: associado.tiktok, color: '#000', url: `https://tiktok.com/${associado.tiktok.replace('@', '')}` },
    associado.website && { icon: <GlobalOutlined />, label: 'Meu Site', color: '#1677ff', url: associado.website },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; color: string; url: string }[];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <SEO
        title={`${associado.name} | DigitaisBR`}
        description={associado.bio || `Perfil de ${associado.name} na DigitaisBR`}
        url={`https://digitaisbr-plataforma.web.app/loja/${slug}`}
      />

      {/* Hero Profile */}
      <div style={{
        background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc, #722ed1)`,
        padding: '48px 24px 40px',
        textAlign: 'center',
        color: '#fff',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 16, right: 24 }}>
          <Tag style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', fontSize: 11 }}>
            <SafetyCertificateOutlined /> DigitaisBR
          </Tag>
        </div>

        <Avatar
          size={100}
          style={{ background: 'rgba(255,255,255,0.2)', marginBottom: 16, border: '4px solid rgba(255,255,255,0.4)' }}
          icon={<UserOutlined />}
          src={associado.avatar}
        />

        <Title level={2} style={{ color: '#fff', margin: '0 0 4px' }}>{associado.name}</Title>

        <div style={{ margin: '8px 0 4px' }}>
          {associado.niche && (
            <Tag style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', fontSize: 13, padding: '2px 12px', borderRadius: 12 }}>
              <FireOutlined /> {associado.niche}
            </Tag>
          )}
          <Tag style={{ background: badge.color, color: '#fff', border: 'none', fontSize: 12, padding: '2px 10px', borderRadius: 12 }}>
            <StarFilled /> {badge.label}
          </Tag>
        </div>

        {associado.bio && (
          <Paragraph style={{ color: 'rgba(255,255,255,0.9)', maxWidth: 480, margin: '12px auto 0', fontSize: 15, lineHeight: 1.6 }}>
            {associado.bio}
          </Paragraph>
        )}

        {/* Audience Metrics */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 20, flexWrap: 'wrap' }}>
          {associado.followers && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>
                <TeamOutlined style={{ marginRight: 4 }} />
                {formatFollowers(associado.followers)}
              </div>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Seguidores</Text>
            </div>
          )}
          {associado.engagementRate && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>
                <ThunderboltOutlined style={{ marginRight: 4 }} />
                {associado.engagementRate}%
              </div>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Engajamento</Text>
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>
              <HeartOutlined style={{ marginRight: 4 }} />
              {storeProducts.length}
            </div>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Recomendações</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>
              <ShoppingCartOutlined style={{ marginRight: 4 }} />
              {storeVendas.length}
            </div>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Vendas</Text>
          </div>
        </div>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            {socialLinks.map((link, i) => (
              <Button
                key={i}
                size="large"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: '#fff',
                  borderRadius: 24,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                icon={link.icon}
                onClick={() => window.open(link.url, '_blank')}
              >
                {link.label}
              </Button>
            ))}
          </div>
        )}

        {/* WhatsApp */}
        {store.config.showWhatsapp && store.config.whatsappNumber && (
          <div style={{ marginTop: 16 }}>
            <Button icon={<WhatsAppOutlined />} style={{ background: '#25D366', borderColor: '#25D366', color: '#fff', borderRadius: 24 }} size="large">
              Fale comigo no WhatsApp
            </Button>
          </div>
        )}
      </div>

      {/* Section: Minhas Recomendações */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>
            <HeartOutlined style={{ color: primaryColor, marginRight: 8 }} />
            Minhas Recomendações
          </Title>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
          <Input
            placeholder="Buscar recomendação..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', maxWidth: 260, borderRadius: 20 }}
            allowClear
          />
          <Tag.CheckableTag
            checked={selectedCategory === 'all'}
            onChange={() => setSelectedCategory('all')}
            style={{ padding: '4px 12px', borderRadius: 12, fontSize: 13 }}
          >
            Todos ({storeProducts.length})
          </Tag.CheckableTag>
          {usedCategories.map((c) => (
            <Tag.CheckableTag
              key={c.id}
              checked={selectedCategory === c.id}
              onChange={() => setSelectedCategory(c.id)}
              style={{ padding: '4px 12px', borderRadius: 12, fontSize: 13 }}
            >
              {c.name} ({storeProducts.filter((p) => p.categoryId === c.id).length})
            </Tag.CheckableTag>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 40px' }}>
        {filteredProducts.length === 0 ? (
          <Empty description="Nenhuma recomendação encontrada" style={{ padding: 60 }} />
        ) : selectedCategory !== 'all' ? (
          <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
            {filteredProducts.map((product) => (
              <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                <ProductCard product={product} primaryColor={primaryColor} onAdd={handleAddToCart} creatorName={associado.name.split(' ')[0]} />
              </Col>
            ))}
          </Row>
        ) : (
          grouped.map((group) => (
            <div key={group.id} style={{ marginBottom: 24 }}>
              <Divider titlePlacement="left" style={{ margin: '16px 0' }}>
                <Tag color={group.color} style={{ fontSize: 14, padding: '2px 16px', borderRadius: 12 }}>{group.name}</Tag>
              </Divider>
              <Row gutter={[16, 16]}>
                {group.products.map((product) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                    <ProductCard product={product} primaryColor={primaryColor} onAdd={handleAddToCart} creatorName={associado.name.split(' ')[0]} />
                  </Col>
                ))}
              </Row>
            </div>
          ))
        )}
      </div>

      {/* Cart FAB */}
      {cartCount > 0 && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
          <Badge count={cartCount} size="default">
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={<ShoppingCartOutlined />}
              onClick={() => navigate('/checkout')}
              style={{ width: 56, height: 56, fontSize: 24, background: primaryColor, borderColor: primaryColor, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
            />
          </Badge>
        </div>
      )}

      {/* Footer */}
      <div style={{ background: '#fff', borderTop: '1px solid #e8e8e8', padding: '24px', textAlign: 'center' }}>
        <ShopOutlined style={{ fontSize: 20, color: primaryColor, marginBottom: 8 }} />
        <br />
        <Text type="secondary" style={{ fontSize: 13 }}>
          Perfil de <Text strong>{associado.name}</Text>
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: 11 }}>
          Powered by <Text strong style={{ color: '#1677ff' }}>DigitaisBR</Text> — Associação de Criadores Digitais
        </Text>
      </div>
    </div>
  );
}

function ProductCard({ product, primaryColor, onAdd, creatorName }: { product: Product; primaryColor: string; onAdd: (p: Product) => void; creatorName: string }) {
  return (
    <Card
      hoverable
      style={{ height: '100%', borderRadius: 12, overflow: 'hidden' }}
      cover={
        <div style={{
          height: 160,
          background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}30)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          {product.image ? (
            <img src={product.image} alt={product.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
          ) : (
            <ShoppingCartOutlined style={{ fontSize: 48, color: primaryColor, opacity: 0.5 }} />
          )}
          {product.exclusivity !== 'todos' && (
            <Tag color="gold" style={{ position: 'absolute', top: 8, right: 8, fontSize: 10 }}>
              <StarFilled /> Exclusivo
            </Tag>
          )}
          <Tag style={{ position: 'absolute', bottom: 8, left: 8, fontSize: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: 8 }}>
            <HeartOutlined /> Indicação {creatorName}
          </Tag>
        </div>
      }
    >
      <Card.Meta
        title={<Text style={{ fontSize: 14 }}>{product.name}</Text>}
        description={
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12, minHeight: 36 }}>
              {product.description.length > 70 ? product.description.slice(0, 70) + '...' : product.description}
            </Text>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong style={{ fontSize: 20, color: primaryColor }}>
                R$ {product.price.toFixed(2)}
              </Text>
              <Button type="primary" size="small" icon={<ShoppingCartOutlined />} style={{ background: primaryColor, borderColor: primaryColor, borderRadius: 16 }} onClick={() => onAdd(product)}>
                Comprar
              </Button>
            </div>
          </div>
        }
      />
    </Card>
  );
}
