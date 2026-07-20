import { useState } from 'react';
import { Card, Typography, Tag, Button, Row, Col, List, Modal, Form, Input, InputNumber, Switch, message, Space, Statistic } from 'antd';
import { CrownOutlined, EditOutlined, CheckCircleOutlined, StarOutlined, TeamOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { updatePlan } from '../../store/slices/planosSlice';
import type { Plan, PlanType } from '../../types';
import { planColorsHex } from '../../constants';

const { Title, Text } = Typography;

const planColors = planColorsHex;
const planIcons: Record<PlanType, React.ReactNode> = {
  basico: <CrownOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
  intermediario: <CrownOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
  avancado: <StarOutlined style={{ fontSize: 32, color: '#faad14' }} />,
};

export default function PlanosPage() {
  const dispatch = useAppDispatch();
  const { list: plans } = useAppSelector((s) => s.planos);
  const associados = useAppSelector((s) => s.associados.list);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [form] = Form.useForm();

  const getAssocCount = (planId: string) => associados.filter((a) => a.planId === planId).length;

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    form.setFieldsValue({ ...plan, features: plan.features.join('\n') });
    setEditModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (!editingPlan) return;
      dispatch(updatePlan({
        ...editingPlan,
        ...values,
        features: values.features.split('\n').filter((f: string) => f.trim()),
      }));
      setEditModalOpen(false);
      message.success('Plano atualizado com sucesso!');
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          <CrownOutlined style={{ marginRight: 8 }} />
          Gestão de Planos
        </Title>
      </div>

      <Row gutter={[24, 24]}>
        {plans.map((plan) => {
          const count = getAssocCount(plan.id);
          return (
            <Col xs={24} md={8} key={plan.id}>
              <Card
                hoverable
                style={{ borderTop: `3px solid ${planColors[plan.type]}`, height: '100%' }}
                actions={[
                  <Button key="edit" type="link" icon={<EditOutlined />} onClick={() => handleEdit(plan)}>
                    Editar
                  </Button>,
                ]}
              >
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  {planIcons[plan.type]}
                  <Title level={4} style={{ margin: '8px 0 0' }}>{plan.name}</Title>
                  <div style={{ margin: '8px 0' }}>
                    <Text style={{ fontSize: 28, fontWeight: 700, color: planColors[plan.type] }}>
                      R$ {plan.price.toFixed(2)}
                    </Text>
                    <Text type="secondary">/mês</Text>
                  </div>
                  <Text type="secondary">{plan.description}</Text>
                </div>

                <div style={{ margin: '16px 0', textAlign: 'center' }}>
                  <Statistic title="Associados ativos" value={count} prefix={<TeamOutlined />} />
                </div>

                <List
                  size="small"
                  dataSource={plan.features}
                  renderItem={(item) => (
                    <List.Item style={{ padding: '6px 0', border: 'none' }}>
                      <Space>
                        <CheckCircleOutlined style={{ color: planColors[plan.type] }} />
                        <Text>{item}</Text>
                      </Space>
                    </List.Item>
                  )}
                />

                <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {plan.customization && <Tag color="blue">Personalização</Tag>}
                  {plan.legalSupport && <Tag color="green">Jurídico</Tag>}
                  {plan.accountingSupport && <Tag color="green">Contábil</Tag>}
                  {plan.exclusiveProducts && <Tag color="gold">Exclusivos</Tag>}
                  {plan.priority && <Tag color="red">Prioritário</Tag>}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Modal
        title={`Editar Plano — ${editingPlan?.name}`}
        open={editModalOpen}
        onOk={handleSave}
        onCancel={() => setEditModalOpen(false)}
        okText="Salvar"
        cancelText="Cancelar"
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Nome do Plano" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="price" label="Preço mensal (R$)" rules={[{ required: true }]}>
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Descrição" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="features" label="Funcionalidades (uma por linha)" rules={[{ required: true }]}>
            <Input.TextArea rows={5} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="maxProducts" label="Máx. Produtos">
                <InputNumber min={-1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="customization" label="Personalização" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="exclusiveProducts" label="Prod. Exclusivos" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="legalSupport" label="Jurídico" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="accountingSupport" label="Contábil" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
