import { Card, Descriptions, Tag, Button, Typography, Row, Col, Statistic, Space, Empty, Divider } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DollarOutlined, ShoppingCartOutlined, LinkOutlined, InboxOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { categories } from '../../data/categories';
import type { ProductStatus, ProductExclusivity } from '../../types';

const { Title, Paragraph } = Typography;

const statusConfig: Record<ProductStatus, { color: string; label: string }> = {
  ativo: { color: 'green', label: 'Ativo' },
  inativo: { color: 'default', label: 'Inativo' },
  esgotado: { color: 'red', label: 'Esgotado' },
};

const exclusivityConfig: Record<ProductExclusivity, { color: string; label: string }> = {
  todos: { color: 'blue', label: 'Todos os planos' },
  intermediario: { color: 'purple', label: 'Intermediário+' },
  avancado: { color: 'gold', label: 'Somente Avançado' },
};

const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

export default function ProdutoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = useAppSelector((s) => s.catalogo.list.find((p) => p.id === id));
  const stores = useAppSelector((s) => s.lojas.list);

  if (!product) return <Empty description="Produto não encontrado" />;

  const category = categoryMap[product.categoryId];
  const storesWithProduct = stores.filter((s) => s.productIds.includes(product.id));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/catalogo')} />
          <Title level={4} style={{ margin: 0 }}>{product.name}</Title>
          <Tag color={statusConfig[product.status].color}>{statusConfig[product.status].label}</Tag>
          {category && <Tag color={category.color}>{category.name}</Tag>}
        </Space>
        <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/catalogo/${id}/editar`)}>Editar</Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Preço" value={product.price} precision={2} prefix="R$" styles={{ content: { color: '#1677ff' } }} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Comissão" value={product.commissionPercent} suffix="%" prefix={<DollarOutlined />} styles={{ content: { color: '#52c41a' } }} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Estoque" value={product.stock === -1 ? 'Ilimitado' : product.stock} prefix={<InboxOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Em Lojas" value={storesWithProduct.length} prefix={<ShoppingCartOutlined />} styles={{ content: { color: '#722ed1' } }} /></Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="Detalhes do Produto">
            <Paragraph>{product.description}</Paragraph>
            <Divider />
            <Descriptions column={{ xs: 1, sm: 2 }} size="small" bordered>
              <Descriptions.Item label="SKU">{product.sku}</Descriptions.Item>
              <Descriptions.Item label="Categoria">{category?.name}</Descriptions.Item>
              <Descriptions.Item label="Status"><Tag color={statusConfig[product.status].color}>{statusConfig[product.status].label}</Tag></Descriptions.Item>
              <Descriptions.Item label="Exclusividade"><Tag color={exclusivityConfig[product.exclusivity].color}>{exclusivityConfig[product.exclusivity].label}</Tag></Descriptions.Item>
              <Descriptions.Item label="Criado em">{new Date(product.createdAt).toLocaleDateString('pt-BR')}</Descriptions.Item>
              <Descriptions.Item label="Atualizado em">{new Date(product.updatedAt).toLocaleDateString('pt-BR')}</Descriptions.Item>
              <Descriptions.Item label="Checkout" span={2}>
                <a href={product.checkoutUrl} target="_blank" rel="noopener noreferrer">
                  <LinkOutlined /> {product.checkoutUrl}
                </a>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={`Lojas com este produto (${storesWithProduct.length})`}>
            {storesWithProduct.length === 0 ? (
              <Empty description="Nenhuma loja adicionou este produto" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              storesWithProduct.map((s) => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span>{s.name}</span>
                  <Tag color={s.active ? 'green' : 'default'}>{s.active ? 'Ativa' : 'Inativa'}</Tag>
                </div>
              ))
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
