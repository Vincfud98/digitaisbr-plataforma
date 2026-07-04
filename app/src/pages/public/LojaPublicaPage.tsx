import { Card, Typography, Row, Col, Tag, Button, Empty, Divider, Avatar, Space, Input, Badge, message } from 'antd';
import {
  ShopOutlined, WhatsAppOutlined, ShoppingCartOutlined, SearchOutlined,
  UserOutlined, StarFilled, SafetyCertificateOutlined,
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
  basico: { label: 'Associado', color: '#1677ff' },
  intermediario: { label: 'Associado Pro', color: '#722ed1' },
  avancado: { label: 'Associado Premium', color: '#faad14' },
};

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
              <Title level={4}>Loja não encontrada</Title>
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

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <SEO
        title={store.name}
        description={store.config.description || `Loja de ${associado.name}`}
        url={`https://digitaisbr-plataforma.web.app/loja/${slug}`}
      />
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
        padding: '40px 24px 32px',
        textAlign: 'center',
        color: '#fff',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 16, right: 24 }}>
          <Tag style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', fontSize: 11 }}>
            <SafetyCertificateOutlined /> DigitaisBR
          </Tag>
        </div>

        <Avatar size={80} style={{ background: 'rgba(255,255,255,0.2)', marginBottom: 12, border: '3px solid rgba(255,255,255,0.4)' }} icon={<UserOutlined />} />

        <Title level={2} style={{ color: '#fff', margin: '0 0 4px' }}>{store.name}</Title>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>{associado.name}</Text>

        <div style={{ margin: '12px 0' }}>
          <Tag style={{ background: badge.color, color: '#fff', border: 'none', fontSize: 12, padding: '2px 10px' }}>
            <StarFilled /> {badge.label}
          </Tag>
        </div>

        {store.config.description && (
          <Paragraph style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 500, margin: '0 auto', fontSize: 14 }}>
            {store.config.description}
          </Paragraph>
        )}

        <Space style={{ marginTop: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{storeProducts.length}</div>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Produtos</Text>
          </div>
          <Divider type="vertical" style={{ background: 'rgba(255,255,255,0.3)', height: 30 }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{store.totalViews.toLocaleString()}</div>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Visitas</Text>
          </div>
          <Divider type="vertical" style={{ background: 'rgba(255,255,255,0.3)', height: 30 }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{storeVendas.length}</div>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Vendas</Text>
          </div>
        </Space>

        <div style={{ marginTop: 16 }}>
          <Space>
            {store.config.showWhatsapp && store.config.whatsappNumber && (
              <Button icon={<WhatsAppOutlined />} style={{ background: '#25D366', borderColor: '#25D366', color: '#fff' }} size="large">
                WhatsApp
              </Button>
            )}
          </Space>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px 0' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input
            placeholder="Buscar produto..."
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

      {/* Produtos */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px 40px' }}>
        {filteredProducts.length === 0 ? (
          <Empty description="Nenhum produto encontrado" style={{ padding: 60 }} />
        ) : selectedCategory !== 'all' ? (
          <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
            {filteredProducts.map((product) => (
              <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                <ProductCard product={product} primaryColor={primaryColor} onAdd={handleAddToCart} />
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
                    <ProductCard product={product} primaryColor={primaryColor} onAdd={handleAddToCart} />
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
          Loja virtual de <Text strong>{associado.name}</Text>
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: 11 }}>
          Powered by <Text strong style={{ color: '#1677ff' }}>DigitaisBR</Text> — Associação de Criadores Digitais
        </Text>
      </div>
    </div>
  );
}

function ProductCard({ product, primaryColor, onAdd }: { product: Product; primaryColor: string; onAdd: (p: Product) => void }) {
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
