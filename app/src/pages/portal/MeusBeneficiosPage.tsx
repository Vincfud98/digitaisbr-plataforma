import { Card, Typography, Tag, Row, Col, List, Empty, Input } from 'antd';
import { useState } from 'react';
import { GiftOutlined, SearchOutlined, LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAppSelector } from '../../store';
import type { PlanType } from '../../types';
import { planLabels, planColors } from '../../constants';

const { Title, Text } = Typography;

const planOrder: PlanType[] = ['basico', 'intermediario', 'avancado'];

export default function MeusBeneficiosPage() {
  const associados = useAppSelector((s) => s.associados.list);
  const beneficios = useAppSelector((s) => s.beneficios.list);
  const parceiros = useAppSelector((s) => s.parceiros.list);
  const { user } = useAppSelector((s) => s.auth);
  const [search, setSearch] = useState('');

  const associado = associados.find((a) => a.id === 'assoc-1') || associados[0];
  const plan = (associado?.planType || user?.plan || 'basico') as PlanType;

  const ativos = beneficios.filter((b) => b.status === 'ativo');

  const disponiveis = ativos.filter((b) => planOrder.indexOf(b.minPlan) <= planOrder.indexOf(plan));
  const bloqueados = ativos.filter((b) => planOrder.indexOf(b.minPlan) > planOrder.indexOf(plan));

  const filterFn = (title: string) => !search || title.toLowerCase().includes(search.toLowerCase());

  const parceiroPorId = (id: string) => parceiros.find((p) => p.id === id);

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <GiftOutlined style={{ marginRight: 8 }} />
        Meus Benefícios
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Seu plano <Tag color={planColors[plan]}>{planLabels[plan]}</Tag> dá acesso a {disponiveis.length} benefício(s).
        {bloqueados.length > 0 && ` Faça upgrade para desbloquear mais ${bloqueados.length}.`}
      </Text>

      <Input placeholder="Buscar benefício..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 300, marginBottom: 16 }} allowClear />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title={<><CheckCircleOutlined style={{ color: '#52c41a' }} /> Disponíveis ({disponiveis.filter((b) => filterFn(b.title)).length})</>} size="small">
            {disponiveis.filter((b) => filterFn(b.title)).length === 0 ? (
              <Empty description="Nenhum benefício encontrado." />
            ) : (
              <List
                dataSource={disponiveis.filter((b) => filterFn(b.title))}
                renderItem={(b) => {
                  const parceiro = parceiroPorId(b.partnerId);
                  return (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<GiftOutlined style={{ fontSize: 24, color: '#52c41a' }} />}
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text strong>{b.title}</Text>
                            <Tag color="green">{b.value}</Tag>
                          </div>
                        }
                        description={
                          <>
                            <Text type="secondary" style={{ fontSize: 12 }}>{b.description}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {parceiro && `Parceiro: ${parceiro.name} · `}
                              Tipo: {b.type} · Plano mín: <Tag color={planColors[b.minPlan]} style={{ fontSize: 10 }}>{planLabels[b.minPlan]}</Tag>
                            </Text>
                          </>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title={<><LockOutlined style={{ color: '#fa8c16' }} /> Bloqueados ({bloqueados.filter((b) => filterFn(b.title)).length})</>} size="small">
            {bloqueados.filter((b) => filterFn(b.title)).length === 0 ? (
              <Empty description="Nenhum benefício bloqueado." />
            ) : (
              <List
                size="small"
                dataSource={bloqueados.filter((b) => filterFn(b.title))}
                renderItem={(b) => (
                  <List.Item>
                    <div style={{ opacity: 0.6 }}>
                      <Text style={{ fontSize: 13 }}>{b.title}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Requer <Tag color={planColors[b.minPlan]} style={{ fontSize: 10 }}>{planLabels[b.minPlan]}</Tag>
                      </Text>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
