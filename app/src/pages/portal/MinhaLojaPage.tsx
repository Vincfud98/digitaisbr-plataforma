import { useState } from 'react';
import { Card, Typography, Tag, Row, Col, Statistic, List, Button, Avatar, Empty, Input, message, Tabs, Modal, Form, InputNumber, Select } from 'antd';
import {
  ShopOutlined, EyeOutlined, ShoppingCartOutlined, SearchOutlined,
  PlusOutlined, DeleteOutlined, EditOutlined,
  AppstoreAddOutlined, FileAddOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { updateStore } from '../../store/slices/lojasSlice';
import { addProduct, updateProduct } from '../../store/slices/catalogoSlice';
import { categories } from '../../data/categories';
import type { Product } from '../../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

export default function MinhaLojaPage() {
  const dispatch = useAppDispatch();
  const associados = useAppSelector((s) => s.associados.list);
  const lojas = useAppSelector((s) => s.lojas.list);
  const catalogo = useAppSelector((s) => s.catalogo.list);
  const vendas = useAppSelector((s) => s.vendas.list);
  const { user } = useAppSelector((s) => s.auth);
  const [search, setSearch] = useState('');
  const [searchCatalogo, setSearchCatalogo] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
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
  const produtosDisponiveis = catalogo.filter((p) => p.status === 'ativo' && !loja.productIds.includes(p.id) && !p.id.startsWith('own-'));
  const minhasVendas = vendas.filter((v) => v.storeSlug === loja.slug);
  const receitaTotal = minhasVendas.filter((v) => v.status === 'aprovada').reduce((s, v) => s + v.totalPrice, 0);

  const filteredDisponiveis = produtosDisponiveis.filter((p) => {
    if (searchCatalogo && !p.name.toLowerCase().includes(searchCatalogo.toLowerCase())) return false;
    if (catFilter !== 'all' && p.categoryId !== catFilter) return false;
    return true;
  });

  const filteredMeus = meusProdutos.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

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
    const updated: Product = {
      ...editProduct,
      ...values,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    dispatch(updateProduct(updated));
    message.success('Produto atualizado!');
    setEditProduct(null);
    form.resetFields();
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    form.setFieldsValue({
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      price: product.price,
      stock: product.stock,
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <ShopOutlined style={{ marginRight: 8 }} />
          {loja.name}
        </Title>
        <Tag color={loja.active ? 'green' : 'orange'}>{loja.active ? 'Ativa' : 'Inativa'}</Tag>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Produtos" value={meusProdutos.length} prefix={<ShopOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Visualizações" value={loja.totalViews} prefix={<EyeOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Vendas" value={minhasVendas.length} prefix={<ShoppingCartOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Receita" value={receitaTotal} precision={2} prefix="R$" styles={{ content: { color: '#52c41a' } }} /></Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="meus"
        items={[
          {
            key: 'meus',
            label: <span><ShopOutlined /> Meus Produtos ({meusProdutos.length})</span>,
            children: (
              <Card
                extra={
                  <Input placeholder="Buscar..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 220 }} allowClear size="small" />
                }
              >
                {filteredMeus.length === 0 ? (
                  <Empty description="Nenhum produto na loja ainda. Adicione do catálogo ou crie seus próprios!" />
                ) : (
                  <List
                    dataSource={filteredMeus}
                    renderItem={(p) => (
                      <List.Item
                        actions={[
                          ...(p.id.startsWith('own-') ? [
                            <Button key="edit" type="text" icon={<EditOutlined />} size="small" onClick={() => openEdit(p)} />,
                          ] : []),
                          <Button key="rm" type="text" danger icon={<DeleteOutlined />} size="small" onClick={() => handleRemoveProduct(p.id)} />,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar shape="square" size={48} style={{ background: p.id.startsWith('own-') ? '#722ed1' : '#1677ff' }} icon={<ShopOutlined />} />}
                          title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Text style={{ fontSize: 14 }}>{p.name}</Text>
                              {p.id.startsWith('own-') ? (
                                <Tag color="purple" style={{ fontSize: 10 }}>Próprio</Tag>
                              ) : (
                                <Tag color="blue" style={{ fontSize: 10 }}>Catálogo</Tag>
                              )}
                            </div>
                          }
                          description={
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              R$ {p.price.toFixed(2)} · {categoryMap[p.categoryId]?.name || p.categoryId}
                              {!p.id.startsWith('own-') && ` · Comissão: ${p.commissionPercent}%`}
                              {p.stock > 0 && ` · Estoque: ${p.stock}`}
                            </Text>
                          }
                        />
                      </List.Item>
                    )}
                    pagination={{ pageSize: 10, size: 'small' }}
                  />
                )}
              </Card>
            ),
          },
          {
            key: 'catalogo',
            label: <span><AppstoreAddOutlined /> Catálogo Central ({produtosDisponiveis.length})</span>,
            children: (
              <Card
                title="Escolha produtos do catálogo para vender na sua loja"
                extra={<Text type="secondary">{filteredDisponiveis.length} disponível(is)</Text>}
              >
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  <Input
                    placeholder="Buscar produto..."
                    prefix={<SearchOutlined />}
                    value={searchCatalogo}
                    onChange={(e) => setSearchCatalogo(e.target.value)}
                    style={{ width: 240 }}
                    allowClear
                  />
                  <Select
                    value={catFilter}
                    onChange={setCatFilter}
                    style={{ width: 200 }}
                    options={[
                      { value: 'all', label: 'Todas as categorias' },
                      ...categories.map((c) => ({ value: c.id, label: c.name })),
                    ]}
                  />
                </div>
                {filteredDisponiveis.length === 0 ? (
                  <Empty description="Nenhum produto disponível com esses filtros." />
                ) : (
                  <Row gutter={[12, 12]}>
                    {filteredDisponiveis.slice(0, 30).map((p) => (
                      <Col xs={24} sm={12} md={8} key={p.id}>
                        <Card
                          size="small"
                          hoverable
                          style={{ height: '100%' }}
                          actions={[
                            <Button key="add" type="link" icon={<PlusOutlined />} onClick={() => handleAddFromCatalog(p.id)}>
                              Adicionar à Loja
                            </Button>,
                          ]}
                        >
                          <Card.Meta
                            avatar={<Avatar shape="square" size={48} style={{ background: categoryMap[p.categoryId]?.color || '#1677ff' }} icon={<ShoppingCartOutlined />} />}
                            title={<Text style={{ fontSize: 13 }}>{p.name}</Text>}
                            description={
                              <div>
                                <Tag color={categoryMap[p.categoryId]?.color} style={{ fontSize: 10 }}>{categoryMap[p.categoryId]?.name}</Tag>
                                <div style={{ marginTop: 4 }}>
                                  <Text strong style={{ color: '#1677ff' }}>R$ {p.price.toFixed(2)}</Text>
                                  <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>Comissão: {p.commissionPercent}%</Text>
                                </div>
                                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
                                  {p.description.length > 80 ? p.description.slice(0, 80) + '...' : p.description}
                                </Text>
                              </div>
                            }
                          />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </Card>
            ),
          },
          {
            key: 'proprio',
            label: <span><FileAddOutlined /> Criar Produto Próprio</span>,
            children: (
              <div>
                <Card
                  title="Seus Produtos Próprios"
                  extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditProduct(null); form.resetFields(); setFormOpen(true); }}>
                      Novo Produto
                    </Button>
                  }
                >
                  {meusPropriosProdutos.length === 0 ? (
                    <Empty description="Você ainda não criou nenhum produto próprio. Crie agora!">
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditProduct(null); form.resetFields(); setFormOpen(true); }}>
                        Criar Meu Primeiro Produto
                      </Button>
                    </Empty>
                  ) : (
                    <Row gutter={[12, 12]}>
                      {meusPropriosProdutos.map((p) => (
                        <Col xs={24} sm={12} md={8} key={p.id}>
                          <Card
                            size="small"
                            hoverable
                            actions={[
                              <Button key="edit" type="link" icon={<EditOutlined />} onClick={() => { openEdit(p); setFormOpen(true); }}>Editar</Button>,
                              <Button key="rm" type="link" danger icon={<DeleteOutlined />} onClick={() => handleRemoveProduct(p.id)}>Remover</Button>,
                            ]}
                          >
                            <Card.Meta
                              avatar={<Avatar shape="square" size={48} style={{ background: '#722ed1' }} icon={<ShopOutlined />} />}
                              title={<Text style={{ fontSize: 13 }}>{p.name}</Text>}
                              description={
                                <div>
                                  <Tag color={categoryMap[p.categoryId]?.color} style={{ fontSize: 10 }}>{categoryMap[p.categoryId]?.name}</Tag>
                                  <div style={{ marginTop: 4 }}>
                                    <Text strong style={{ color: '#722ed1' }}>R$ {p.price.toFixed(2)}</Text>
                                    {p.stock > 0 && <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>Estoque: {p.stock}</Text>}
                                  </div>
                                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
                                    {p.description.length > 80 ? p.description.slice(0, 80) + '...' : p.description}
                                  </Text>
                                </div>
                              }
                            />
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </Card>
              </div>
            ),
          },
        ]}
      />

      <Modal
        title={editProduct ? 'Editar Produto' : 'Novo Produto Próprio'}
        open={formOpen}
        onCancel={() => { setFormOpen(false); setEditProduct(null); form.resetFields(); }}
        onOk={() => form.submit()}
        okText={editProduct ? 'Salvar' : 'Criar Produto'}
        cancelText="Cancelar"
        width={520}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editProduct ? handleEditProduct : handleCreateProduct}
        >
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
