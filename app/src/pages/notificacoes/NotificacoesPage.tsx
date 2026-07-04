import { useState } from 'react';
import { List, Tag, Button, Input, Select, Typography, Card, Row, Col, Statistic, Space, Badge, message } from 'antd';
import {
  BellOutlined, SearchOutlined, CheckOutlined, DollarOutlined, ShoppingCartOutlined,
  GiftOutlined, ReadOutlined, CustomerServiceOutlined, SettingOutlined, DeleteOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { markAsRead, markAllAsRead, removeNotification } from '../../store/slices/notificacoesSlice';
import type { NotificationType } from '../../types';

const { Title, Text } = Typography;

const typeConfig: Record<NotificationType, { color: string; label: string; icon: React.ReactNode }> = {
  sistema: { color: 'blue', label: 'Sistema', icon: <SettingOutlined /> },
  venda: { color: 'green', label: 'Venda', icon: <ShoppingCartOutlined /> },
  comissao: { color: 'gold', label: 'Comissão', icon: <DollarOutlined /> },
  beneficio: { color: 'purple', label: 'Benefício', icon: <GiftOutlined /> },
  conteudo: { color: 'cyan', label: 'Conteúdo', icon: <ReadOutlined /> },
  suporte: { color: 'orange', label: 'Suporte', icon: <CustomerServiceOutlined /> },
};

export default function NotificacoesPage() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((s) => s.notificacoes.list);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all');

  const filtered = notifications.filter((n) => {
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.message.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    if (readFilter === 'unread' && n.read) return false;
    if (readFilter === 'read' && !n.read) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const unreadCount = notifications.filter((n) => !n.read).length;
  const todayCount = notifications.filter((n) => {
    const d = new Date(n.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <BellOutlined style={{ marginRight: 8 }} />
          Central de Notificações
        </Title>
        <Button icon={<CheckOutlined />} onClick={() => { dispatch(markAllAsRead()); message.success('Todas marcadas como lidas!'); }}>
          Marcar todas como lidas
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Não Lidas" value={unreadCount} prefix={<BellOutlined />} valueStyle={{ color: '#ff4d4f' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Total" value={notifications.length} prefix={<BellOutlined />} valueStyle={{ color: '#1677ff' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Hoje" value={todayCount} prefix={<BellOutlined />} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input placeholder="Buscar notificação..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 260 }} allowClear />
          <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 150 }}>
            <Select.Option value="all">Todos tipos</Select.Option>
            {Object.entries(typeConfig).map(([key, cfg]) => (
              <Select.Option key={key} value={key}>{cfg.label}</Select.Option>
            ))}
          </Select>
          <Select value={readFilter} onChange={setReadFilter} style={{ width: 140 }}>
            <Select.Option value="all">Todas</Select.Option>
            <Select.Option value="unread">Não lidas</Select.Option>
            <Select.Option value="read">Lidas</Select.Option>
          </Select>
        </div>

        <List
          dataSource={sorted}
          renderItem={(n) => {
            const tc = typeConfig[n.type];
            return (
              <List.Item
                key={n.id}
                style={{ background: n.read ? 'transparent' : '#f0f5ff', padding: '12px 16px', borderRadius: 8, marginBottom: 4 }}
                actions={[
                  !n.read && (
                    <Button key="read" type="link" size="small" icon={<CheckOutlined />} onClick={() => dispatch(markAsRead(n.id))}>
                      Lida
                    </Button>
                  ),
                  <Button key="del" type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => { dispatch(removeNotification(n.id)); message.success('Removida!'); }} />,
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={
                    <Badge dot={!n.read}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: `${tc.color === 'blue' ? '#1677ff' : tc.color === 'green' ? '#52c41a' : tc.color === 'gold' ? '#faad14' : tc.color === 'purple' ? '#722ed1' : tc.color === 'cyan' ? '#13c2c2' : '#fa8c16'}15`, color: tc.color === 'blue' ? '#1677ff' : tc.color === 'green' ? '#52c41a' : tc.color === 'gold' ? '#faad14' : tc.color === 'purple' ? '#722ed1' : tc.color === 'cyan' ? '#13c2c2' : '#fa8c16' }}>
                        {tc.icon}
                      </div>
                    </Badge>
                  }
                  title={
                    <Space>
                      <Text strong={!n.read}>{n.title}</Text>
                      <Tag color={tc.color}>{tc.label}</Tag>
                      <Tag>{n.channel}</Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <Text type="secondary">{n.message}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>{new Date(n.createdAt).toLocaleDateString('pt-BR')} {new Date(n.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
          pagination={{ pageSize: 10, showTotal: (t) => `${t} notificações` }}
        />
      </Card>
    </div>
  );
}
