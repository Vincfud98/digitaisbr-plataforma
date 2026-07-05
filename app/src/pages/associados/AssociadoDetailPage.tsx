import { Card, Descriptions, Tag, Button, Typography, Row, Col, Statistic, Space, Divider, Timeline, Empty } from 'antd';
import { ArrowLeftOutlined, EditOutlined, ShopOutlined, DollarOutlined, ShoppingCartOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../store';
import type { AssociadoStatus, PlanType } from '../../types';

const { Title } = Typography;

const statusConfig: Record<AssociadoStatus, { color: string; label: string }> = {
  ativo: { color: 'green', label: 'Ativo' },
  inativo: { color: 'default', label: 'Inativo' },
  suspenso: { color: 'orange', label: 'Suspenso' },
  cancelado: { color: 'red', label: 'Cancelado' },
};

const planConfig: Record<PlanType, { color: string; label: string }> = {
  basico: { color: 'blue', label: 'Básico' },
  intermediario: { color: 'purple', label: 'Intermediário' },
  avancado: { color: 'gold', label: 'Avançado' },
};

export default function AssociadoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const assoc = useAppSelector((s) => s.associados.list.find((a) => a.id === id));
  const plan = useAppSelector((s) => s.planos.list.find((p) => p.id === assoc?.planId));

  if (!assoc) {
    return <Empty description="Associado não encontrado" />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/associados')} />
          <Title level={4} style={{ margin: 0 }}>{assoc.name}</Title>
          <Tag color={statusConfig[assoc.status].color}>{statusConfig[assoc.status].label}</Tag>
          <Tag color={planConfig[assoc.planType].color}>{planConfig[assoc.planType].label}</Tag>
        </Space>
        <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/associados/${id}/editar`)}>
          Editar
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Total de Vendas" value={assoc.totalSales} prefix={<ShoppingCartOutlined />} styles={{ content: { color: '#52c41a' } }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Comissão Acumulada" value={assoc.totalCommission} precision={2} prefix={<DollarOutlined />} suffix="R$" styles={{ content: { color: '#faad14' } }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Loja" value={assoc.storeName} prefix={<ShopOutlined />} styles={{ content: { fontSize: 18 } }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Membro desde" value={new Date(assoc.createdAt).toLocaleDateString('pt-BR')} prefix={<CalendarOutlined />} styles={{ content: { fontSize: 18 } }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="Dados Cadastrais">
            <Descriptions column={{ xs: 1, sm: 2 }} size="small" bordered>
              <Descriptions.Item label="Nome">{assoc.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{assoc.email}</Descriptions.Item>
              <Descriptions.Item label="CPF/CNPJ">{assoc.cpfCnpj}</Descriptions.Item>
              <Descriptions.Item label="Telefone">{assoc.phone}</Descriptions.Item>
              <Descriptions.Item label="Endereço" span={2}>{assoc.address}</Descriptions.Item>
              <Descriptions.Item label="Cidade">{assoc.city}</Descriptions.Item>
              <Descriptions.Item label="UF">{assoc.state}</Descriptions.Item>
              <Descriptions.Item label="Slug da Loja">{assoc.storeSlug}</Descriptions.Item>
              <Descriptions.Item label="Última atualização">{new Date(assoc.updatedAt).toLocaleDateString('pt-BR')}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Plano Atual">
            {plan && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Title level={5} style={{ margin: 0 }}>{plan.name} <Tag color={planConfig[plan.type].color}>R$ {plan.price.toFixed(2)}/mês</Tag></Title>
                  <p style={{ color: '#888', margin: '4px 0 0' }}>{plan.description}</p>
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={{ marginBottom: 4, color: '#555' }}>{f}</li>
                  ))}
                </ul>
              </>
            )}
          </Card>

          <Card title="Histórico de Atividades" style={{ marginTop: 16 }}>
            <Timeline
              items={[
                { color: 'green', children: `Cadastro realizado em ${new Date(assoc.createdAt).toLocaleDateString('pt-BR')}` },
                { color: 'blue', children: `Plano ${planConfig[assoc.planType].label} ativado` },
                { color: 'blue', children: `Loja "${assoc.storeName}" criada automaticamente` },
                { children: 'Aguardando mais atividades...' },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
