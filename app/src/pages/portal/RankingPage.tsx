import { Card, Typography, Tag, Row, Col, Statistic, Avatar, Space, Progress, List } from 'antd';
import {
  TrophyOutlined, StarOutlined, FireOutlined, CrownOutlined,
  RiseOutlined, TeamOutlined, ShoppingCartOutlined, DollarOutlined,
  CheckCircleOutlined, GiftOutlined, ThunderboltOutlined,
  HeartOutlined, UserOutlined,
} from '@ant-design/icons';
import { useAppSelector } from '../../store';

const { Title, Text } = Typography;

function seededRandom(seed: number): number {
  return Math.abs(Math.sin(seed) * 10000) % 1;
}

interface RankEntry {
  id: string;
  name: string;
  avatar: string;
  plan: string;
  sales: number;
  revenue: number;
  score: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

export default function RankingPage() {
  const associados = useAppSelector((s) => s.associados.list);
  const { user } = useAppSelector((s) => s.auth);

  const myAssociado = associados.find((a) => a.id === (user?.id || 'assoc-1')) || associados[0];

  const ranking: RankEntry[] = associados.slice(0, 20).map((a, i) => {
    const seed = i * 23 + 11;
    const sales = Math.floor(seededRandom(seed) * 200) + 10;
    const revenue = Math.floor(seededRandom(seed + 1) * 50000) + 1000;
    return {
      id: a.id,
      name: a.name,
      avatar: '',
      plan: a.planType,
      sales,
      revenue,
      score: Math.floor(sales * 10 + revenue / 100),
    };
  }).sort((a, b) => b.score - a.score);

  const myRank = ranking.findIndex((r) => r.id === myAssociado?.id) + 1;
  const myEntry = ranking.find((r) => r.id === myAssociado?.id);
  const totalAssociados = associados.length;
  const percentile = myRank > 0 ? Math.round(((totalAssociados - myRank) / totalAssociados) * 100) : 0;

  const achievements: Achievement[] = [
    { id: 'a1', title: 'Primeira Venda', description: 'Realize sua primeira venda na plataforma', icon: <ShoppingCartOutlined />, color: '#52c41a', unlocked: true, progress: 1, target: 1 },
    { id: 'a2', title: 'Vendedor Bronze', description: 'Alcance 10 vendas', icon: <TrophyOutlined />, color: '#d48806', unlocked: true, progress: 10, target: 10 },
    { id: 'a3', title: 'Vendedor Prata', description: 'Alcance 50 vendas', icon: <TrophyOutlined />, color: '#8c8c8c', unlocked: true, progress: 50, target: 50 },
    { id: 'a4', title: 'Vendedor Ouro', description: 'Alcance 100 vendas', icon: <TrophyOutlined />, color: '#faad14', unlocked: false, progress: 67, target: 100 },
    { id: 'a5', title: 'R$ 1.000 em Comissões', description: 'Ganhe R$ 1.000 em comissões', icon: <DollarOutlined />, color: '#52c41a', unlocked: true, progress: 1000, target: 1000 },
    { id: 'a6', title: 'R$ 5.000 em Comissões', description: 'Ganhe R$ 5.000 em comissões', icon: <DollarOutlined />, color: '#1677ff', unlocked: false, progress: 3200, target: 5000 },
    { id: 'a7', title: 'Loja Completa', description: 'Tenha pelo menos 20 produtos na loja', icon: <GiftOutlined />, color: '#722ed1', unlocked: false, progress: 12, target: 20 },
    { id: 'a8', title: 'Influencer Popular', description: 'Alcance 1000 cliques nos links', icon: <FireOutlined />, color: '#f5222d', unlocked: true, progress: 1000, target: 1000 },
    { id: 'a9', title: 'Cupom Master', description: 'Crie 5 cupons de desconto', icon: <StarOutlined />, color: '#eb2f96', unlocked: false, progress: 3, target: 5 },
    { id: 'a10', title: 'Networker', description: 'Participe de 10 tópicos na comunidade', icon: <TeamOutlined />, color: '#13c2c2', unlocked: false, progress: 4, target: 10 },
    { id: 'a11', title: 'Raio', description: 'Faça 5 vendas em um único dia', icon: <ThunderboltOutlined />, color: '#faad14', unlocked: false, progress: 3, target: 5 },
    { id: 'a12', title: 'Fã Fiel', description: 'Mantenha a conta ativa por 6 meses', icon: <HeartOutlined />, color: '#f5222d', unlocked: true, progress: 6, target: 6 },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const planColors: Record<string, string> = { basico: 'blue', intermediario: 'purple', avancado: 'gold' };
  const planLabels: Record<string, string> = { basico: 'Básico', intermediario: 'Intermediário', avancado: 'Avançado' };
  const rankColors = ['#faad14', '#8c8c8c', '#d48806'];

  return (
    <div>
      <Title level={4} style={{ margin: '0 0 16px' }}>
        <TrophyOutlined style={{ marginRight: 8 }} />
        Ranking e Conquistas
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Sua Posição"
              value={myRank > 0 ? `${myRank}º` : '-'}
              prefix={<CrownOutlined />}
              valueStyle={{ color: myRank <= 3 ? '#faad14' : myRank <= 10 ? '#1677ff' : undefined }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Pontuação" value={myEntry?.score || 0} prefix={<StarOutlined />} valueStyle={{ color: '#722ed1' }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Top" value={percentile} suffix="%" prefix={<RiseOutlined />} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Conquistas" value={unlockedCount} suffix={`/ ${achievements.length}`} prefix={<TrophyOutlined />} valueStyle={{ color: '#faad14' }} /></Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <Card title={<><CrownOutlined /> Top 10 Associados</>} size="small">
            <List
              dataSource={ranking.slice(0, 10)}
              renderItem={(entry, i) => {
                const isMe = entry.id === myAssociado?.id;
                return (
                  <List.Item style={{ background: isMe ? '#f0f5ff' : undefined, padding: '8px 12px', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                      <div style={{ width: 32, textAlign: 'center' }}>
                        {i < 3 ? (
                          <TrophyOutlined style={{ fontSize: 20, color: rankColors[i] }} />
                        ) : (
                          <Text strong style={{ fontSize: 16, color: '#8c8c8c' }}>{i + 1}</Text>
                        )}
                      </div>
                      <Avatar style={{ background: isMe ? '#1677ff' : '#d9d9d9' }} icon={<UserOutlined />} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Text strong style={{ fontSize: 13 }}>{entry.name}</Text>
                          {isMe && <Tag color="blue" style={{ fontSize: 10 }}>Você</Tag>}
                        </div>
                        <Space size={8}>
                          <Tag color={planColors[entry.plan]} style={{ fontSize: 10 }}>{planLabels[entry.plan]}</Tag>
                          <Text type="secondary" style={{ fontSize: 11 }}>{entry.sales} vendas</Text>
                        </Space>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Text strong style={{ color: '#722ed1', fontSize: 14 }}>{entry.score}</Text>
                        <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>pts</Text>
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card title={<><StarOutlined /> Conquistas ({unlockedCount}/{achievements.length})</>} size="small">
            <Row gutter={[12, 12]}>
              {achievements.map((a) => (
                <Col xs={12} sm={8} key={a.id}>
                  <Card
                    size="small"
                    style={{
                      textAlign: 'center',
                      opacity: a.unlocked ? 1 : 0.5,
                      border: a.unlocked ? `2px solid ${a.color}` : undefined,
                    }}
                  >
                    <div style={{ fontSize: 28, color: a.unlocked ? a.color : '#d9d9d9', marginBottom: 4 }}>{a.icon}</div>
                    <Text strong style={{ fontSize: 11, display: 'block' }}>{a.title}</Text>
                    {a.unlocked ? (
                      <Tag color="green" style={{ fontSize: 9, marginTop: 4 }}><CheckCircleOutlined /> Desbloqueada</Tag>
                    ) : (
                      <div style={{ marginTop: 4 }}>
                        <Progress percent={Math.round((a.progress / a.target) * 100)} size="small" strokeColor={a.color} />
                        <Text type="secondary" style={{ fontSize: 9 }}>{a.progress}/{a.target}</Text>
                      </div>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
