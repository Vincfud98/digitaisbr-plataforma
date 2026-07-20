import { useEffect } from 'react';
import { Card, Form, Input, Select, Button, Typography, Row, Col, Divider, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { addAssociado, updateAssociado } from '../../store/slices/associadosSlice';
import type { Associado } from '../../types';

const { Title } = Typography;

const brStates = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

export default function AssociadoFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const { list } = useAppSelector((s) => s.associados);
  const plans = useAppSelector((s) => s.planos.list);
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      const assoc = list.find((a) => a.id === id);
      if (assoc) form.setFieldsValue(assoc);
      else navigate('/associados');
    }
  }, [id, isEditing, list, form, navigate]);

  const onFinish = (values: Omit<Associado, 'id' | 'createdAt' | 'updatedAt' | 'totalSales' | 'totalCommission' | 'storeSlug' | 'storeName'>) => {
    const plan = plans.find((p) => p.id === values.planId);
    const slug = values.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');

    if (isEditing) {
      const existing = list.find((a) => a.id === id)!;
      dispatch(updateAssociado({
        ...existing,
        ...values,
        planType: plan?.type || 'basico',
        storeSlug: slug,
        storeName: `Loja ${values.name.split(' ')[0]}`,
        updatedAt: new Date().toISOString().split('T')[0],
      }));
      message.success('Associado atualizado com sucesso!');
    } else {
      dispatch(addAssociado({
        ...values,
        id: `assoc-${crypto.randomUUID()}`,
        planType: plan?.type || 'basico',
        storeSlug: slug,
        storeName: `Loja ${values.name.split(' ')[0]}`,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        totalSales: 0,
        totalCommission: 0,
      }));
      message.success('Associado criado com sucesso!');
    }
    navigate('/associados');
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/associados')} />
        <Title level={4} style={{ margin: 0 }}>{isEditing ? 'Editar Associado' : 'Novo Associado'}</Title>
      </div>

      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: 'ativo', planId: 'plan-basico' }}>
          <Divider titlePlacement="left">Dados Pessoais</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="name" label="Nome completo" rules={[{ required: true, message: 'Informe o nome' }]}>
                <Input placeholder="Nome completo" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Informe o email' }, { type: 'email', message: 'Email inválido' }]}>
                <Input placeholder="email@exemplo.com" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="cpfCnpj" label="CPF/CNPJ" rules={[{ required: true, message: 'Informe o CPF ou CNPJ' }]}>
                <Input placeholder="000.000.000-00" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="phone" label="Telefone" rules={[{ required: true, message: 'Informe o telefone' }]}>
                <Input placeholder="(00) 90000-0000" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                <Select options={[{ value: 'ativo', label: 'Ativo' }, { value: 'inativo', label: 'Inativo' }, { value: 'suspenso', label: 'Suspenso' }, { value: 'cancelado', label: 'Cancelado' }]} />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left">Endereço</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="address" label="Endereço" rules={[{ required: true, message: 'Informe o endereço' }]}>
                <Input placeholder="Rua, número, complemento" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="city" label="Cidade" rules={[{ required: true, message: 'Informe a cidade' }]}>
                <Input placeholder="Cidade" />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item name="state" label="UF" rules={[{ required: true, message: 'Informe o estado' }]}>
                <Select showSearch placeholder="UF" options={brStates.map((s) => ({ value: s, label: s }))} />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left">Plano</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="planId" label="Plano" rules={[{ required: true, message: 'Selecione um plano' }]}>
                <Select options={plans.map((p) => ({ value: p.id, label: `${p.name} — R$ ${p.price.toFixed(2)}/mês` }))} />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24 }}>
            <Button onClick={() => navigate('/associados')}>Cancelar</Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              {isEditing ? 'Salvar Alterações' : 'Criar Associado'}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
