import { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, Typography, Row, Col, message, Space, Upload } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { addProduct, updateProduct } from '../../store/slices/catalogoSlice';
import { uploadProductImage } from '../../lib/storageService';
import { categories } from '../../data/categories';
import type { Product } from '../../types';

const { Title } = Typography;

export default function ProdutoFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const existing = useAppSelector((s) => s.catalogo.list.find((p) => p.id === id));
  const isEditing = !!id && !!existing;
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (isEditing && existing) {
      form.setFieldsValue(existing);
    }
  }, [isEditing, existing, form]);

  const handleSubmit = async (values: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const productId = isEditing ? existing!.id : `prod-${Date.now()}`;
    let imageUrl = isEditing ? existing!.image : '';

    if (imageFile) {
      try {
        imageUrl = await uploadProductImage(imageFile, productId);
      } catch {
        message.error('Erro ao enviar imagem.');
        return;
      }
    }

    if (isEditing) {
      dispatch(updateProduct({ ...existing!, ...values, image: imageUrl, updatedAt: now }));
      message.success('Produto atualizado!');
    } else {
      const newProduct: Product = {
        ...values,
        id: productId,
        image: imageUrl,
        createdAt: now,
        updatedAt: now,
      };
      dispatch(addProduct(newProduct));
      message.success('Produto criado!');
    }
    navigate('/catalogo');
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/catalogo')} />
        <Title level={4} style={{ margin: 0 }}>{isEditing ? 'Editar Produto' : 'Novo Produto'}</Title>
      </div>

      <Card>
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'ativo', exclusivity: 'todos', stock: -1, commissionPercent: 10 }}>
          <Title level={5}>Informações do Produto</Title>
          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item name="name" label="Nome do Produto" rules={[{ required: true, message: 'Informe o nome' }]}>
                <Input placeholder="Ex: Curso Marketing Digital" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="sku" label="SKU" rules={[{ required: true, message: 'Informe o SKU' }]}>
                <Input placeholder="Ex: EDU-005" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Descrição" rules={[{ required: true, message: 'Informe a descrição' }]}>
            <Input.TextArea rows={3} placeholder="Descrição detalhada do produto..." />
          </Form.Item>

          <Title level={5}>Preço & Comissão</Title>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="price" label="Preço (R$)" rules={[{ required: true, message: 'Informe o preço' }]}>
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} prefix="R$" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="commissionPercent" label="Comissão (%)" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} style={{ width: '100%' }} suffix="%" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="stock" label="Estoque (-1 = ilimitado)">
                <InputNumber min={-1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Title level={5}>Classificação</Title>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="categoryId" label="Categoria" rules={[{ required: true, message: 'Selecione' }]}>
                <Select placeholder="Selecione...">
                  {categories.map((c) => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="ativo">Ativo</Select.Option>
                  <Select.Option value="inativo">Inativo</Select.Option>
                  <Select.Option value="esgotado">Esgotado</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="exclusivity" label="Exclusividade por Plano" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="todos">Todos os planos</Select.Option>
                  <Select.Option value="intermediario">Intermediário+</Select.Option>
                  <Select.Option value="avancado">Somente Avançado</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="checkoutUrl" label="URL de Checkout Externo">
            <Input placeholder="https://checkout.digitaisbr.com/..." />
          </Form.Item>

          <Title level={5}>Imagem do Produto</Title>
          <Form.Item>
            <Upload
              listType="picture-card"
              accept="image/*"
              maxCount={1}
              beforeUpload={(file) => { setImageFile(file); return false; }}
              onRemove={() => setImageFile(null)}
              defaultFileList={
                isEditing && existing?.image
                  ? [{ uid: '-1', name: 'imagem-atual', status: 'done' as const, url: existing.image }]
                  : []
              }
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
                <div style={{ fontSize: 11, color: '#999' }}>Max. 5MB</div>
              </div>
            </Upload>
          </Form.Item>

          <Space style={{ marginTop: 16 }}>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>{isEditing ? 'Salvar Alterações' : 'Criar Produto'}</Button>
            <Button onClick={() => navigate('/catalogo')}>Cancelar</Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}
