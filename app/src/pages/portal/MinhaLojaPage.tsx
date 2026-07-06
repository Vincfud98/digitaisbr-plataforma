import { useState, useMemo } from 'react';
import { Card, Typography, Tag, Row, Col, Statistic, Button, Empty, Input, message, Modal, Form, InputNumber, Select, Tooltip, Segmented, Rate } from 'antd';
import {
  ShopOutlined, EyeOutlined, ShoppingCartOutlined, SearchOutlined,
  PlusOutlined, DeleteOutlined, EditOutlined, DollarOutlined,
  AppstoreAddOutlined, FileAddOutlined, CheckCircleOutlined,
  HeartOutlined, StarOutlined, FireOutlined,
  PercentageOutlined, RiseOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { updateStore } from '../../store/slices/lojasSlice';
import { addProduct, updateProduct } from '../../store/slices/catalogoSlice';
import { categories } from '../../data/categories';
import type { Product } from '../../types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

const categoryIcons: Record<string, React.ReactNode> = {
  'cat-1': <HeartOutlined />,
  'cat-2': <StarOutlined />,
  'cat-3': <DollarOutlined />,
  'cat-4': <AppstoreAddOutlined />,
  'cat-5': <FireOutlined />,
  'cat-6': <EyeOutlined />,
  'cat-7': <RiseOutlined />,
};

const productImages: Record<string, string> = {
  'cat-1': 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
  'cat-2': 'linear-gradient(135deg, #f9ca24, #f0932b)',
  'cat-3': 'linear-gradient(135deg, #6ab04c, #27ae60)',
  'cat-4': 'linear-gradient(135deg, #4834d4, #686de0)',
  'cat-5': 'linear-gradient(135deg, #e056fd, #be2edd)',
  'cat-6': 'linear-gradient(135deg, #22a6b3, #7ed6df)',
  'cat-7': 'linear-gradient(135deg, #eb4d4b, #ff6348)',
};

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function ProductCard({ product, onAdd, onRemove, onEdit, isInStore, isOwn, index }: {
  product: Product; onAdd?: () => void; onRemove?: () => void; onEdit?: () => void;
  isInStore: boolean; isOwn: boolean; index: number;
}) {
  const cat = categoryMap[product.categoryId];
  const bg = productImages[product.categoryId] || 'linear-gradient(135deg, #667eea, #764ba2)';
  const rating = 3.5 + seededRandom(index + 100) * 1.5;
  const sales = Math.floor(seededRandom(index + 200) * 500) + 10;
  const comissaoEstimada = product.price * product.commissionPercent / 100;

  return (
    <Card
      hoverable
      style={{ height: '100%', overflow: 'hidden', borderRadius: 12 }}
      styles={{ body: { padding: 0 } }}
      cover={
        <div style={{
          background: bg,
          height: 140,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{ fontSize: 48, color: 'rgba(255,255,255,0.9)' }}>
            {categoryIcons[product.categoryId] || <ShopOutlined />}
          </div>
          {isInStore && (
            <div style={{
              position: 'absolute', top: 8, left: 8,
              background: '#52c41a', color: '#fff', padding: '2px 10px',
              borderRadius: 12, fontSize: 11, fontWeight: 600,
            }}>
              <CheckCircleOutlined /> Na sua loja
            </div>
          )}
          {isOwn && (
            <div style={{
              position: 'absolute', top: 8, left: 8,
              background: '#722ed1', color: '#fff', padding: '2px 10px',
              borderRadius: 12, fontSize: 11, fontWeight: 600,
            }}>
              Produto Próprio
            </div>
          )}
          {!isOwn && product.commissionPercent >= 20 && (
            <div style={{
              position: 'absolute', top: 8, right: 8,
              background: '#faad14', color: '#fff', padding: '2px 10px',
              borderRadius: 12, fontSize: 11, fontWeight: 600,
            }}>
              <FireOutlined /> Alta Comissão
            </div>
          )}
        </div>
      }
    >
      <div style={{ padding: '12px 16px 16px' }}>
        <Tag color={cat?.color} style={{ fontSize: 10, marginBottom: 8 }}>{cat?.name || 'Geral'}</Tag>
        <Title level={5} style={{ margin: '0 0 4px', fontSize: 14, lineHeight: 1.3 }} ellipsis={{ rows: 2 }}>
          {product.name}
        </Title>
        <Paragraph type="secondary" style={{ fontSize: 12, margin: '0 0 8px' }} ellipsis={{ rows: 2 }}>
          {product.description}
        </Paragraph>

        {!isOwn && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
            <Rate disabled value={Math.round(rating * 2) / 2} allowHalf style={{ fontSize: 12 }} />
            <Text type="secondary" style={{ fontSize: 11 }}>({sales} vendas)</Text>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
          <div>
            <Text strong style={{ fontSize: 20, color: '#1677ff' }}>R$ {product.price.toFixed(2)}</Text>
          </div>
          {!isOwn && product.commissionPercent > 0 && (
            <Tooltip title={`Você ganha R$ ${comissaoEstimada.toFixed(2)} por venda`}>
              <Tag color="green" style={{ margin: 0 }}>
                <PercentageOutlined /> {product.commissionPercent}% comissão
              </Tag>
            </Tooltip>
          )}
        </div>

        {!isOwn && product.commissionPercent > 0 && (
          <div style={{
            background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8,
            padding: '6px 10px', marginBottom: 12, textAlign: 'center',
          }}>
            <Text style={{ fontSize: 11, color: '#389e0d' }}>Ganho estimado por venda: </Text>
            <Text strong style={{ color: '#389e0d' }}>R$ {comissaoEstimada.toFixed(2)}</Text>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          {isInStore || isOwn ? (
            <>
              {isOwn && onEdit && (
                <Button icon={<EditOutlined />} style={{ flex: 1 }} onClick={onEdit}>Editar</Button>
              )}
              {onRemove && (
                <Button danger icon={<DeleteOutlined />} style={{ flex: isOwn ? 1 : undefined, width: isOwn ? undefined : '100%' }} onClick={onRemove}>
                  Remover
                </Button>
              )}
            </>
          ) : (
            <Button type="primary" icon={<PlusOutlined />} block onClick={onAdd}>
              Adicionar à Minha Loja
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function MinhaLojaPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const associados = useAppSelector((s) => s.associados.list);
  const lojas = useAppSelector((s) => s.lojas.list);
  const catalogo = useAppSelector((s) => s.catalogo.list);
  const vendas = useAppSelector((s) => s.vendas.list);
  const { user } = useAppSelector((s) => s.auth);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [tab, setTab] = useState<string>('catalogo');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  const associado = associados.find((a) => a.id === (user?.id || 'assoc-1')) || associados[0];
  const loja = lojas.find((l) => l.associadoId === associado?.id);

  if (!loja) {
    return (
      <Card>
        <Empty description="Sua loja ainda não foi criada. Contate o administrador." />
      </Card>
    );
  }

  const meusProdutos = catalogo.filter((p) => loja.productIds.includes(p.id));
  const meusPropriosProdutos = meusProdutos.filter((p) => p.id.startsWith('own-'));
  const produtosDisponiveis = catalogo.filter((p) => p.status === 'ativo' && !p.id.startsWith('own-'));
  const minhasVendas = vendas.filter((v) => v.storeSlug === loja.slug);
  const receitaTotal = minhasVendas.filter((v) => v.status === 'aprovada').reduce((s, v) => s + v.totalPrice, 0);
  const comissoesEstimadas = meusProdutos.reduce((s, p) => s + (p.price * p.commissionPercent / 100), 0);

  const getProductList = () => {
    let list: Product[] = [];
    if (tab === 'catalogo') list = produtosDisponiveis;
    else if (tab === 'meus') list = meusProdutos;
    else list = meusPropriosProdutos;

    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (catFilter !== 'all') list = list.filter((p) => p.categoryId === catFilter);

    if (sortBy === 'popular') list = [...list].sort((a, b) => b.commissionPercent - a.commissionPercent);
    else if (sortBy === 'price-low') list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') list = [...list].sort((a, b) => b.price - a.price);
    else if (sortBy === 'commission') list = [...list].sort((a, b) => b.commissionPercent - a.commissionPercent);
    else if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return list;
  };

  const productList = getProductList();
  const catCounts = useMemo(() => {
    const src = tab === 'catalogo' ? produtosDisponiveis : tab === 'meus' ? meusProdutos : meusPropriosProdutos;
    const counts: Record<string, number> = {};
    src.forEach((p) => { counts[p.categoryId] = (counts[p.categoryId] || 0) + 1; });
    return counts;
  }, [tab, produtosDisponiveis, meusProdutos, meusPropriosProdutos]);

  const handleAddFromCatalog = (productId: string) => {
    dispatch(updateStore({ ...loja, productIds: [...loja.productIds, productId] }));
    message.success('Produto adicionado à sua loja!');
  };

  const handleRemoveProduct = (productId: string) => {
    dispatch(updateStore({ ...loja, productIds: loja.productIds.filter((id) => id !== productId) }));
    message.success('Produto removido da loja.');
  };

  const handleCreateProduct = (values: { name: string; description: string; categoryId: string; price: number; stock: number }) => {
    const newProduct: Product = {
      id: `own-${Date.now()}`,
      name: values.name,
      description: values.description,
      categoryId: values.categoryId,
      price: values.price,
      commissionPercent: 0,
      image: '',
      status: 'ativo',
      exclusivity: 'todos',
      sku: `OWN-${Date.now().toString(36).toUpperCase()}`,
      stock: values.stock || 0,
      checkoutUrl: '',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    dispatch(addProduct(newProduct));
    dispatch(updateStore({ ...loja, productIds: [...loja.productIds, newProduct.id] }));
    message.success('Produto próprio criado e adicionado à loja!');
    setFormOpen(false);
    form.resetFields();
  };

  const handleEditProduct = (values: { name: string; description: string; categoryId: string; price: number; stock: number }) => {
    if (!editProduct) return;
    dispatch(updateProduct({ ...editProduct, ...values, updatedAt: new Date().toISOString().split('T')[0] }));
    message.success('Produto atualizado!');
    setEditProduct(null);
    setFormOpen(false);
    form.resetFields();
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    form.setFieldsValue({ name: product.name, description: product.description, categoryId: product.categoryId, price: product.price, stock: product.stock });
    setFormOpen(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Title level={4} style={{ margin: 0 }}>
            <ShopOutlined style={{ marginRight: 8 }} />
            {loja.name}
          </Title>
          <Tag color={loja.active ? 'green' : 'orange'}>{loja.active ? 'Ativa' : 'Inativa'}</Tag>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" icon={<EyeOutlined />} onClick={() => navigate(`/loja/${loja.slug}`)}>
            Ver como Cliente
          </Button>
          {tab === 'proprio' && (
            <Button icon={<PlusOutlined />} onClick={() => { setEditProduct(null); form.resetFields(); setFormOpen(true); }}>
              Novo Produto
            </Button>
          )}
        </div>
      </div>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="Na Minha Loja" value={meusProdutos.length} prefix={<ShopOutlined />}
              styles={{ content: { fontSize: 22 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="Vendas" value={minhasVendas.length} prefix={<ShoppingCartOutlined />}
              styles={{ content: { fontSize: 22 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="Receita" value={receitaTotal} precision={2} prefix="R$"
              styles={{ content: { color: '#52c41a', fontSize: 22 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="Comissão/venda" value={comissoesEstimadas} precision={2} prefix="R$"
              suffix={<Text type="secondary" style={{ fontSize: 11 }}>est.</Text>}
              styles={{ content: { color: '#1677ff', fontSize: 22 } }} />
          </Card>
        </Col>
      </Row>

      <Segmented
        options={[
          { label: `Marketplace (${produtosDisponiveis.length})`, value: 'catalogo', icon: <AppstoreAddOutlined /> },
          { label: `Minha Loja (${meusProdutos.length})`, value: 'meus', icon: <ShopOutlined /> },
          { label: `Meus Produtos (${meusPropriosProdutos.length})`, value: 'proprio', icon: <FileAddOutlined /> },
        ]}
        value={tab}
        onChange={(v) => { setTab(v as string); setCatFilter('all'); setSearch(''); }}
        block
        style={{ marginBottom: 16 }}
      />

      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input
            placeholder="Buscar produtos..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 260 }}
            allowClear
          />
          <Select
            value={sortBy}
            onChange={setSortBy}
            style={{ width: 180 }}
            options={[
              { value: 'popular', label: 'Mais populares' },
              { value: 'commission', label: 'Maior comissão' },
              { value: 'price-low', label: 'Menor preço' },
              { value: 'price-high', label: 'Maior preço' },
              { value: 'name', label: 'A-Z' },
            ]}
          />
          <div style={{ flex: 1 }} />
          <Text type="secondary">{productList.length} produto(s)</Text>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <Tag
            color={catFilter === 'all' ? '#1677ff' : undefined}
            style={{ cursor: 'pointer', borderRadius: 16, padding: '2px 12px' }}
            onClick={() => setCatFilter('all')}
          >
            Todos
          </Tag>
          {categories.map((c) => {
            const count = catCounts[c.id] || 0;
            if (count === 0 && tab !== 'catalogo') return null;
            return (
              <Tag
                key={c.id}
                color={catFilter === c.id ? c.color : undefined}
                style={{ cursor: 'pointer', borderRadius: 16, padding: '2px 12px' }}
                onClick={() => setCatFilter(catFilter === c.id ? 'all' : c.id)}
              >
                {c.name} ({count})
              </Tag>
            );
          })}
        </div>
      </Card>

      {productList.length === 0 ? (
        <Card>
          <Empty
            description={
              tab === 'proprio'
                ? 'Você ainda não criou nenhum produto próprio.'
                : tab === 'meus'
                ? 'Nenhum produto na sua loja ainda. Explore o Marketplace!'
                : 'Nenhum produto encontrado com esses filtros.'
            }
          >
            {tab === 'proprio' && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditProduct(null); form.resetFields(); setFormOpen(true); }}>
                Criar Meu Primeiro Produto
              </Button>
            )}
            {tab === 'meus' && (
              <Button type="primary" icon={<AppstoreAddOutlined />} onClick={() => setTab('catalogo')}>
                Explorar Marketplace
              </Button>
            )}
          </Empty>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {productList.map((p, i) => (
            <Col xs={24} sm={12} md={8} lg={6} key={p.id}>
              <ProductCard
                product={p}
                index={i}
                isInStore={loja.productIds.includes(p.id)}
                isOwn={p.id.startsWith('own-')}
                onAdd={() => handleAddFromCatalog(p.id)}
                onRemove={() => handleRemoveProduct(p.id)}
                onEdit={() => openEdit(p)}
              />
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={editProduct ? 'Editar Produto' : 'Novo Produto Próprio'}
        open={formOpen}
        onCancel={() => { setFormOpen(false); setEditProduct(null); form.resetFields(); }}
        onOk={() => form.submit()}
        okText={editProduct ? 'Salvar' : 'Criar Produto'}
        cancelText="Cancelar"
        width={520}
      >
        <Form form={form} layout="vertical" onFinish={editProduct ? handleEditProduct : handleCreateProduct}>
          <Form.Item name="name" label="Nome do Produto" rules={[{ required: true, message: 'Informe o nome' }]}>
            <Input placeholder="Ex: Camiseta Exclusiva DigitaisBR" />
          </Form.Item>
          <Form.Item name="description" label="Descrição" rules={[{ required: true, message: 'Descreva o produto' }]}>
            <TextArea rows={3} placeholder="Descrição detalhada do produto..." showCount maxLength={500} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="categoryId" label="Categoria" rules={[{ required: true, message: 'Selecione' }]}>
                <Select placeholder="Selecione" options={categories.map((c) => ({ value: c.id, label: c.name }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="price" label="Preço (R$)" rules={[{ required: true, message: 'Informe o preço' }]}>
                <InputNumber min={0.01} step={0.01} precision={2} style={{ width: '100%' }} placeholder="0,00" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="stock" label="Estoque (opcional)" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Quantidade disponível (0 = ilimitado)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
