import { useState } from 'react';
import { Card, Typography, Tag, Row, Col, Statistic, Button, Input, message, Avatar, Form, Modal } from 'antd';
import {
  InstagramOutlined, YoutubeOutlined, GlobalOutlined,
  LinkOutlined, CheckCircleOutlined, PlusOutlined,
  UserOutlined, HeartOutlined, EyeOutlined, VideoCameraOutlined,
  DisconnectOutlined, ApiOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  connected: boolean;
  followers: number;
  engagement: number;
  posts: number;
  icon: React.ReactNode;
  color: string;
  url: string;
}

const initialAccounts: SocialAccount[] = [
  { id: 'ig', platform: 'Instagram', username: '@maria.influencer', connected: true, followers: 45200, engagement: 4.8, posts: 892, icon: <InstagramOutlined />, color: '#E4405F', url: 'https://instagram.com/maria.influencer' },
  { id: 'yt', platform: 'YouTube', username: 'Maria Influencer', connected: true, followers: 12800, engagement: 6.2, posts: 156, icon: <YoutubeOutlined />, color: '#FF0000', url: 'https://youtube.com/@mariainfluencer' },
  { id: 'tk', platform: 'TikTok', username: '@maria.tk', connected: true, followers: 78500, engagement: 8.1, posts: 342, icon: <VideoCameraOutlined />, color: '#000000', url: 'https://tiktok.com/@maria.tk' },
  { id: 'tw', platform: 'Twitter / X', username: '', connected: false, followers: 0, engagement: 0, posts: 0, icon: <GlobalOutlined />, color: '#1DA1F2', url: '' },
];

export default function RedesSociaisPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>(initialAccounts);
  const [connectModal, setConnectModal] = useState<SocialAccount | null>(null);
  const [form] = Form.useForm();

  const connectedAccounts = accounts.filter((a) => a.connected);
  const totalFollowers = connectedAccounts.reduce((s, a) => s + a.followers, 0);
  const avgEngagement = connectedAccounts.length > 0 ? connectedAccounts.reduce((s, a) => s + a.engagement, 0) / connectedAccounts.length : 0;
  const totalPosts = connectedAccounts.reduce((s, a) => s + a.posts, 0);

  const handleConnect = (values: { username: string }) => {
    if (!connectModal) return;
    setAccounts(accounts.map((a) => a.id === connectModal.id ? {
      ...a,
      connected: true,
      username: values.username,
      followers: Math.floor(Math.random() * 10000) + 500,
      engagement: Math.random() * 5 + 2,
      posts: Math.floor(Math.random() * 200) + 20,
    } : a));
    message.success(`${connectModal.platform} conectado com sucesso!`);
    setConnectModal(null);
    form.resetFields();
  };

  const handleDisconnect = (id: string) => {
    setAccounts(accounts.map((a) => a.id === id ? { ...a, connected: false, username: '', followers: 0, engagement: 0, posts: 0 } : a));
    message.success('Conta desconectada.');
  };

  const formatFollowers = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <div>
      <Title level={4} style={{ margin: '0 0 16px' }}>
        <ApiOutlined style={{ marginRight: 8 }} />
        Redes Sociais
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Contas Conectadas" value={connectedAccounts.length} suffix={`/ ${accounts.length}`} prefix={<LinkOutlined />} styles={{ content: { color: '#1677ff' } }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Total Seguidores" value={totalFollowers} prefix={<UserOutlined />} formatter={(v) => formatFollowers(v as number)} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Engajamento Médio" value={avgEngagement} precision={1} suffix="%" prefix={<HeartOutlined />} styles={{ content: { color: '#eb2f96' } }} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Total Posts" value={totalPosts} prefix={<EyeOutlined />} /></Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {accounts.map((account) => (
          <Col xs={24} sm={12} key={account.id}>
            <Card
              style={{ borderLeft: `4px solid ${account.color}` }}
              actions={account.connected ? [
                <Button key="view" type="link" onClick={() => window.open(account.url, '_blank')}>Ver Perfil</Button>,
                <Button key="disc" type="link" danger icon={<DisconnectOutlined />} onClick={() => handleDisconnect(account.id)}>Desconectar</Button>,
              ] : [
                <Button key="conn" type="link" icon={<PlusOutlined />} onClick={() => { setConnectModal(account); form.resetFields(); }}>Conectar</Button>,
              ]}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Avatar size={56} style={{ background: account.color, fontSize: 24 }} icon={account.icon} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Text strong style={{ fontSize: 16 }}>{account.platform}</Text>
                    {account.connected ? (
                      <Tag color="green" icon={<CheckCircleOutlined />}>Conectado</Tag>
                    ) : (
                      <Tag color="default">Não conectado</Tag>
                    )}
                  </div>
                  {account.connected ? (
                    <div>
                      <Text type="secondary">{account.username}</Text>
                      <Row gutter={16} style={{ marginTop: 8 }}>
                        <Col span={8}>
                          <Statistic title="Seguidores" value={account.followers} formatter={(v) => formatFollowers(v as number)} styles={{ content: { fontSize: 16 } }} />
                        </Col>
                        <Col span={8}>
                          <Statistic title="Engajamento" value={account.engagement} precision={1} suffix="%" styles={{ content: { fontSize: 16, color: '#eb2f96' } }} />
                        </Col>
                        <Col span={8}>
                          <Statistic title="Posts" value={account.posts} styles={{ content: { fontSize: 16 } }} />
                        </Col>
                      </Row>
                    </div>
                  ) : (
                    <Paragraph type="secondary" style={{ margin: 0 }}>
                      Conecte sua conta do {account.platform} para exibir métricas e sincronizar conteúdo.
                    </Paragraph>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={`Conectar ${connectModal?.platform || ''}`}
        open={!!connectModal}
        onCancel={() => { setConnectModal(null); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Conectar"
        cancelText="Cancelar"
      >
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Avatar size={64} style={{ background: connectModal?.color }} icon={connectModal?.icon} />
          <Title level={5} style={{ margin: '8px 0 0' }}>{connectModal?.platform}</Title>
        </div>
        <Form form={form} layout="vertical" onFinish={handleConnect}>
          <Form.Item name="username" label="Nome de usuário" rules={[{ required: true, message: 'Informe o usuário' }]}>
            <Input placeholder={`@seu_usuario_no_${connectModal?.platform?.toLowerCase()}`} />
          </Form.Item>
        </Form>
        <Text type="secondary" style={{ fontSize: 11 }}>
          Em uma versão futura, a conexão será via OAuth para sincronizar métricas automaticamente.
        </Text>
      </Modal>
    </div>
  );
}
