import { useState, useMemo } from 'react';
import { Card, Typography, Button, Row, Col, Input, Switch, ColorPicker, Form, message, Space, Tag, Checkbox, Empty, Divider, Upload } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, ShopOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { updateStore } from '../../store/slices/lojasSlice';
import { uploadStoreLogo, uploadStoreBanner } from '../../lib/storageService';
import { categories } from '../../data/categories';
import type { Store, Product, ProductExclusivity, PlanType } from '../../types';

const { Title, Text } = Typography;

const exclusivityAllowed: Record<ProductExclusivity, PlanType[]> = {
  todos: ['basico', 'intermediario', 'avancado'],
  intermediario: ['intermediario', 'avancado'],
  avancado: ['avancado'],
};

export default function LojaConfigPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const store = useAppSelector((s) => s.lojas.list.find((st) => st.id === id));
  const associado = useAppSelector((s) => s.associados.list.find((a) => a.id === store?.associadoId));
  const plan = useAppSelector((s) => s.planos.list.find((p) => p.id === associado?.planId));
  const allProducts = useAppSelector((s) => s.catalogo.list);

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(store?.productIds || []);
  const [config, setConfig] = useState(store?.config || { primaryColor: '#1677ff', bannerUrl: '', logoUrl: '', description: '', showWhatsapp: false, whatsappNumber: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const availableProducts = useMemo(() => {
    if (!associado) return [];
    return allProducts.filter((p) => p.status === 'ativo' && exclusivityAllowed[p.exclusivity].includes(associado.planType));
  }, [allProducts, associado]);

  const maxProducts = plan?.maxProducts ?? 20;
  const canAddMore = maxProducts === -1 || selectedProductIds.length < maxProducts;
  const canCustomize = plan?.customization ?? false;

  if (!store || !associado) return <Empty description="Loja não encontrada" />;

  const handleToggleProduct = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(selectedProductIds.filter((id) => id !== productId));
    } else if (canAddMore) {
      setSelectedProductIds([...selectedProductIds, productId]);
    } else {
      message.warning(`Limite de ${maxProducts} produtos atingido para o plano ${plan?.name}`);
    }
  };

  const handleSave = async () => {
    setUploading(true);
    try {
      const updatedConfig = { ...config };
      if (logoFile) {
        updatedConfig.logoUrl = await uploadStoreLogo(logoFile, store.id);
      }
      if (bannerFile) {
        updatedConfig.bannerUrl = await uploadStoreBanner(bannerFile, store.id);
      }
      const updated: Store = {
        ...store,
        productIds: selectedProductIds,
        config: updatedConfig,
      };
      dispatch(updateStore(updated));
      message.success('Loja atualizada com sucesso!');
      navigate('/lojas');
    } catch {
      message.error('Erro ao fazer upload das imagens.');
    } finally {
      setUploading(false);
    }
  };

  const groupedProducts = categories.map((cat) => ({
    ...cat,
    products: availableProducts.filter((p) => p.categoryId === cat.id),
  })).filter((g) => g.products.length > 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/lojas')} />
          <Title level={4} style={{ margin: 0 }}><ShopOutlined style={{ marginRight: 8 }} />{store.name}</Title>
          <Tag color={store.active ? 'green' : 'default'}>{store.active ? 'Ativa' : 'Inativa'}</Tag>
        </Space>
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => navigate(`/lojas/${id}/preview`)}>Preview</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={uploading}>Salvar</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title={`Produtos Disponíveis — ${selectedProductIds.length}${maxProducts === -1 ? '' : `/${maxProducts}`} selecionados`}>
            {groupedProducts.map((group) => (
              <div key={group.id} style={{ marginBottom: 20 }}>
                <Title level={5} style={{ margin: '0 0 8px' }}>
                  <Tag color={group.color}>{group.name}</Tag>
                </Title>
                <Row gutter={[8, 8]}>
                  {group.products.map((product: Product) => {
                    const selected = selectedProductIds.includes(product.id);
                    return (
                      <Col xs={24} sm={12} key={product.id}>
                        <Card
                          size="small"
                          hoverable
                          style={{ borderColor: selected ? '#1677ff' : undefined, background: selected ? '#e6f4ff' : undefined }}
                          onClick={() => handleToggleProduct(product.id)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <Checkbox checked={selected} style={{ marginRight: 8 }} />
                              <Text strong>{product.name}</Text>
                              <div style={{ fontSize: 12, color: '#888', marginLeft: 24 }}>
                                R$ {product.price.toFixed(2)} — {product.commissionPercent}% comissão
                              </div>
                            </div>
                            {product.exclusivity !== 'todos' && (
                              <Tag color={product.exclusivity === 'avancado' ? 'gold' : 'purple'} style={{ fontSize: 10 }}>
                                {product.exclusivity === 'avancado' ? 'Exclusivo' : 'Inter+'}
                              </Tag>
                            )}
                          </div>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            ))}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Personalização da Loja">
            {!canCustomize && (
              <div style={{ marginBottom: 16, padding: 12, background: '#fff7e6', borderRadius: 8, border: '1px solid #ffd591' }}>
                <Text type="warning">Personalização visual disponível a partir do plano Intermediário.</Text>
              </div>
            )}
            <Form layout="vertical">
              <Form.Item label="Descrição da Loja">
                <Input.TextArea rows={3} value={config.description} onChange={(e) => setConfig({ ...config, description: e.target.value })} />
              </Form.Item>
              <Form.Item label="Cor Principal">
                <ColorPicker value={config.primaryColor} disabled={!canCustomize} onChange={(_, hex) => setConfig({ ...config, primaryColor: hex })} />
              </Form.Item>
              <Form.Item label="Logo da Loja">
                <Upload
                  listType="picture-card"
                  accept="image/*"
                  maxCount={1}
                  disabled={!canCustomize}
                  beforeUpload={(file) => { setLogoFile(file); return false; }}
                  onRemove={() => { setLogoFile(null); setConfig({ ...config, logoUrl: '' }); }}
                  defaultFileList={config.logoUrl ? [{ uid: '-1', name: 'logo', status: 'done', url: config.logoUrl }] : []}
                >
                  {!logoFile && !config.logoUrl && <div><UploadOutlined /><div style={{ marginTop: 8 }}>Logo</div></div>}
                </Upload>
              </Form.Item>
              <Form.Item label="Banner da Loja">
                <Upload
                  listType="picture-card"
                  accept="image/*"
                  maxCount={1}
                  disabled={!canCustomize}
                  beforeUpload={(file) => { setBannerFile(file); return false; }}
                  onRemove={() => { setBannerFile(null); setConfig({ ...config, bannerUrl: '' }); }}
                  defaultFileList={config.bannerUrl ? [{ uid: '-1', name: 'banner', status: 'done', url: config.bannerUrl }] : []}
                >
                  {!bannerFile && !config.bannerUrl && <div><UploadOutlined /><div style={{ marginTop: 8 }}>Banner</div></div>}
                </Upload>
              </Form.Item>
              <Divider />
              <Form.Item label="Mostrar WhatsApp">
                <Switch checked={config.showWhatsapp} onChange={(v) => setConfig({ ...config, showWhatsapp: v })} />
              </Form.Item>
              {config.showWhatsapp && (
                <Form.Item label="Número WhatsApp">
                  <Input value={config.whatsappNumber} onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })} />
                </Form.Item>
              )}
            </Form>
          </Card>

          <Card title="Informações" style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div><Text type="secondary">Associado:</Text> <Text strong>{associado.name}</Text></div>
              <div><Text type="secondary">Plano:</Text> <Tag>{plan?.name}</Tag></div>
              <div><Text type="secondary">URL Pública:</Text> <Text copyable code>/loja/{store.slug}</Text></div>
              <div><Text type="secondary">Desde:</Text> <Text>{new Date(store.createdAt).toLocaleDateString('pt-BR')}</Text></div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
