import { Card, Typography, Row, Col, Tag, Button, Empty, Space, Divider } from 'antd';
import { ArrowLeftOutlined, ShopOutlined, WhatsAppOutlined, ShoppingCartOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { categories } from '../../data/categories';
import type { Product } from '../../types';

const { Title, Text, Paragraph } = Typography;

export default function LojaPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = useAppSelector((s) => s.lojas.list.find((st) => st.id === id));
  const associado = useAppSelector((s) => s.associados.list.find((a) => a.id === store?.associadoId));
  const allProducts = useAppSelector((s) => s.catalogo.list);

  if (!store || !associado) return <Empty description="Loja não encontrada" />;

  const storeProducts = allProducts.filter((p) => store.productIds.includes(p.id) && p.status === 'ativo');
  const grouped = categories.map((cat) => ({
    ...cat,
    products: storeProducts.filter((p) => p.categoryId === cat.id),
  })).filter((g) => g.products.length > 0);

  const primaryColor = store.config.primaryColor || '#1677ff';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/lojas')} />
          <Title level={4} style={{ margin: 0 }}>Preview da Loja</Title>
          <Tag color="blue">digitaisbr.com/loja/{store.slug}</Tag>
        </Space>
        <Button icon={<SettingOutlined />} onClick={() => navigate(`/lojas/${id}`)}>Configurar</Button>
      </div>

      <Card
        style={{ border: `2px solid ${primaryColor}`, borderRadius: 12, overflow: 'hidden' }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ background: primaryColor, padding: '32px 24px', color: '#fff', textAlign: 'center' }}>
          <ShopOutlined style={{ fontSize: 48, marginBottom: 8 }} />
          <Title level={2} style={{ color: '#fff', margin: '8px 0 4px' }}>{store.name}</Title>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>{associado.name}</Text>
          <Paragraph style={{ color: 'rgba(255,255,255,0.75)', maxWidth: 600, margin: '12px auto 0' }}>
            {store.config.description}
          </Paragraph>
          {store.config.showWhatsapp && store.config.whatsappNumber && (
            <Button
              type="primary"
              icon={<WhatsAppOutlined />}
              style={{ marginTop: 16, background: '#25D366', borderColor: '#25D366' }}
              size="large"
            >
              WhatsApp
            </Button>
          )}
        </div>

        <div style={{ padding: 24 }}>
          {storeProducts.length === 0 ? (
            <Empty description="Nenhum produto na loja" />
          ) : (
            grouped.map((group) => (
              <div key={group.id} style={{ marginBottom: 32 }}>
                <Divider titlePlacement="left">
                  <Tag color={group.color} style={{ fontSize: 14, padding: '2px 12px' }}>{group.name}</Tag>
                </Divider>
                <Row gutter={[16, 16]}>
                  {group.products.map((product: Product) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                      <Card
                        hoverable
                        style={{ height: '100%' }}
                        cover={
                          <div style={{ height: 140, background: `linear-gradient(135deg, ${primaryColor}22, ${primaryColor}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShoppingCartOutlined style={{ fontSize: 40, color: primaryColor }} />
                          </div>
                        }
                        actions={[
                          <Button key="buy" type="link" style={{ color: primaryColor }}>
                            <ShoppingCartOutlined /> Comprar
                          </Button>,
                        ]}
                      >
                        <Card.Meta
                          title={<Text style={{ fontSize: 14 }}>{product.name}</Text>}
                          description={
                            <div>
                              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                                {product.description.length > 60 ? product.description.slice(0, 60) + '...' : product.description}
                              </Text>
                              <Text strong style={{ fontSize: 18, color: primaryColor }}>
                                R$ {product.price.toFixed(2)}
                              </Text>
                            </div>
                          }
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            ))
          )}
        </div>

        <div style={{ background: '#fafafa', padding: '16px 24px', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Loja virtual por <Text strong>DigitaisBR</Text> — Todos os direitos reservados
          </Text>
        </div>
      </Card>
    </div>
  );
}
