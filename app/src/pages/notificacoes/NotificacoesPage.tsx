import { useState, useMemo } from 'react';
import { Tag, Button, Input, Select, Typography, Card, Row, Col, Statistic, Badge, message, Segmented, DatePicker } from 'antd';
import {
  BellOutlined, SearchOutlined, CheckOutlined, DollarOutlined, ShoppingCartOutlined,
  GiftOutlined, ReadOutlined, CustomerServiceOutlined, SettingOutlined, DeleteOutlined,
  MailOutlined, MobileOutlined, NotificationOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { markAsRead, markAllAsRead, removeNotification } from '../../store/slices/notificacoesSlice';
import type { Notification, NotificationType, NotificationChannel } from '../../types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const typeConfig: Record<NotificationType, { color: string; hex: string; label: string; icon: React.ReactNode }> = {
  sistema: { color: 'blue', hex: '#1677ff', label: 'Sistema', icon: <SettingOutlined /> },
  venda: { color: 'green', hex: '#52c41a', label: 'Venda', icon: <ShoppingCartOutlined /> },
  comissao: { color: 'gold', hex: '#faad14', label: 'Comissão', icon: <DollarOutlined /> },
  beneficio: { color: 'purple', hex: '#722ed1', label: 'Benefício', icon: <GiftOutlined /> },
  conteudo: { color: 'cyan', hex: '#13c2c2', label: 'Conteúdo', icon: <ReadOutlined /> },
  suporte: { color: 'orange', hex: '#fa8c16', label: 'Suporte', icon: <CustomerServiceOutlined /> },
};

const channelConfig: Record<NotificationChannel, { icon: React.ReactNode; label: string }> = {
  'in-app': { icon: <BellOutlined />, label: 'In-App' },
  'email': { icon: <MailOutlined />, label: 'Email' },
  'push': { icon: <MobileOutlined />, label: 'Push' },
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d atrás`;
  return d.toLocaleDateString('pt-BR');
}

export default function NotificacoesPage() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((s) => s.notificacoes.list);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  const [view, setView] = useState<string>('todas');

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.message.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter !== 'all' && n.type !== typeFilter) return false;
      if (channelFilter !== 'all' && n.channel !== channelFilter) return false;
      if (view === 'nao_lidas' && n.read) return false;
      if (view === 'lidas' && !n.read) return false;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const d = new Date(n.createdAt);
        if (d < dateRange[0].toDate() || d > dateRange[1].toDate()) return false;
      }
      return true;
    });
  }, [notifications, search, typeFilter, channelFilter, view, dateRange]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [filtered]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.filter((n) => n.read).length;

  const typeSummary = useMemo(() => {
    const map = new Map<string, number>();
    notifications.forEach((n) => map.set(n.type, (map.get(n.type) || 0) + 1));
    return Object.entries(typeConfig).map(([key, cfg]) => ({ key, ...cfg, count: map.get(key) || 0 })).filter((t) => t.count > 0).sort((a, b) => b.count - a.count);
  }, [notifications]);

  const channelSummary = useMemo(() => {
    const map = new Map<string, number>();
    notifications.forEach((n) => map.set(n.channel, (map.get(n.channel) || 0) + 1));
    return Object.entries(channelConfig).map(([key, cfg]) => ({ key, ...cfg, count: map.get(key) || 0 })).filter((c) => c.count > 0);
  }, [notifications]);

  const NotifCard = ({ n }: { n: Notification }) => {
    const tc = typeConfig[n.type];
    const cc = channelConfig[n.channel];
    return (
      <div
        style={{
          padding: '14px 16px',
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          background: n.read ? '#fff' : '#f0f5ff',
          borderLeft: `3px solid ${tc.hex}`,
          transition: 'box-shadow 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <Badge dot={!n.read} offset={[-2, 2]}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, background: `${tc.hex}15`, color: tc.hex, flexShrink: 0,
            }}>
              {tc.icon}
            </div>
          </Badge>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
              <Text strong={!n.read} style={{ fontSize: 14 }}>{n.title}</Text>
              <Tag color={tc.color} style={{ fontSize: 10, margin: 0 }}>{tc.label}</Tag>
              <Tag icon={cc.icon} style={{ fontSize: 10, margin: 0 }}>{cc.label}</Tag>
            </div>
            <Text type="secondary" style={{ fontSize: 13 }}>{n.message}</Text>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {timeAgo(n.createdAt)} · {new Date(n.createdAt).toLocaleDateString('pt-BR')} {new Date(n.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            {!n.read && (
              <Button type="text" size="small" icon={<CheckOutlined />} style={{ color: '#52c41a' }} onClick={() => dispatch(markAsRead(n.id))} />
            )}
            <Button type="text" size="small" icon={<DeleteOutlined />} danger onClick={() => { dispatch(removeNotification(n.id)); message.success('Removida!'); }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <BellOutlined style={{ marginRight: 8 }} />
          Central de Notificações
        </Title>
        {unreadCount > 0 && (
          <Button type="primary" icon={<CheckOutlined />} onClick={() => { dispatch(markAllAsRead()); message.success('Todas marcadas como lidas!'); }}>
            Marcar todas como lidas ({unreadCount})
          </Button>
        )}
      </div>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6} lg={5}>
          <Card size="small" style={{ borderLeft: '3px solid #ff4d4f' }}>
            <Statistic title="Não Lidas" value={unreadCount} styles={{ content: { color: '#ff4d4f', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={5}>
          <Card size="small" style={{ borderLeft: '3px solid #52c41a' }}>
            <Statistic title="Lidas" value={readCount} styles={{ content: { color: '#52c41a', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={5}>
          <Card size="small" style={{ borderLeft: '3px solid #1677ff' }}>
            <Statistic title="Total" value={notifications.length} styles={{ content: { color: '#1677ff', fontSize: 20 } }} />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={9}>
          <Card size="small">
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', height: '100%', flexWrap: 'wrap' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Por tipo:</Text>
              {typeSummary.map((t) => (
                <Tag
                  key={t.key}
                  color={typeFilter === t.key ? t.color : undefined}
                  style={{ cursor: 'pointer', margin: 0 }}
                  onClick={() => setTypeFilter(typeFilter === t.key ? 'all' : t.key)}
                >
                  {t.label} ({t.count})
                </Tag>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Por canal:</Text>
              {channelSummary.map((c) => (
                <Tag
                  key={c.key}
                  color={channelFilter === c.key ? 'blue' : undefined}
                  icon={c.icon}
                  style={{ cursor: 'pointer', margin: 0 }}
                  onClick={() => setChannelFilter(channelFilter === c.key ? 'all' : c.key)}
                >
                  {c.label} ({c.count})
                </Tag>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <Segmented
            value={view}
            onChange={(v) => setView(v as string)}
            options={[
              { label: `Todas (${notifications.length})`, value: 'todas' },
              { label: <Badge count={unreadCount} size="small" offset={[8, -2]}><span>Não Lidas</span></Badge>, value: 'nao_lidas' },
              { label: `Lidas (${readCount})`, value: 'lidas' },
            ]}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input placeholder="Buscar notificação..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 280 }} allowClear />
          <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 150 }}>
            <Select.Option value="all">Todos tipos</Select.Option>
            {Object.entries(typeConfig).map(([key, cfg]) => (
              <Select.Option key={key} value={key}>{cfg.label}</Select.Option>
            ))}
          </Select>
          <Select value={channelFilter} onChange={setChannelFilter} style={{ width: 140 }}>
            <Select.Option value="all">Todos canais</Select.Option>
            <Select.Option value="in-app">In-App</Select.Option>
            <Select.Option value="email">Email</Select.Option>
            <Select.Option value="push">Push</Select.Option>
          </Select>
          <RangePicker format="DD/MM/YYYY" placeholder={['Data início', 'Data fim']} onChange={(dates) => setDateRange(dates as [any, any] | null)} style={{ width: 240 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sorted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
              <NotificationOutlined style={{ fontSize: 40, marginBottom: 12 }} />
              <div>Nenhuma notificação encontrada</div>
            </div>
          ) : (
            sorted.map((n) => <NotifCard key={n.id} n={n} />)
          )}
        </div>

        {sorted.length > 0 && (
          <div style={{ marginTop: 12, textAlign: 'right', fontSize: 12, color: '#888' }}>
            {sorted.length} notificaç{sorted.length !== 1 ? 'ões' : 'ão'}
          </div>
        )}
      </Card>
    </div>
  );
}
