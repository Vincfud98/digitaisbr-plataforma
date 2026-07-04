import { Card, Typography, List, Tag, Button, Space, Empty, message } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { markAsRead, removeNotification } from '../../store/slices/notificacoesSlice';

const { Title, Text } = Typography;

const typeColors: Record<string, string> = {
  info: 'blue', alerta: 'orange', sucesso: 'green', sistema: 'default', promocao: 'purple',
};
const typeLabels: Record<string, string> = {
  info: 'Info', alerta: 'Alerta', sucesso: 'Sucesso', sistema: 'Sistema', promocao: 'Promoção',
};

export default function PortalNotificacoesPage() {
  const dispatch = useAppDispatch();
  const notificacoes = useAppSelector((s) => s.notificacoes.list);
  const sorted = [...notificacoes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const unread = notificacoes.filter((n) => !n.read).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          <BellOutlined style={{ marginRight: 8 }} />
          Notificações
          {unread > 0 && <Tag color="red" style={{ marginLeft: 8 }}>{unread} nova(s)</Tag>}
        </Title>
        <Button
          onClick={() => {
            notificacoes.filter((n) => !n.read).forEach((n) => dispatch(markAsRead(n.id)));
            message.success('Todas marcadas como lidas.');
          }}
          disabled={unread === 0}
        >
          <CheckOutlined /> Marcar todas como lidas
        </Button>
      </div>

      <Card>
        {sorted.length === 0 ? (
          <Empty description="Nenhuma notificação." />
        ) : (
          <List
            dataSource={sorted}
            renderItem={(n) => (
              <List.Item
                style={{
                  background: n.read ? undefined : '#f0f5ff',
                  padding: '12px 16px',
                  borderRadius: 6,
                  marginBottom: 4,
                }}
                actions={[
                  !n.read && (
                    <Button key="read" type="link" size="small" onClick={() => dispatch(markAsRead(n.id))}>
                      <CheckOutlined /> Lida
                    </Button>
                  ),
                  <Button key="rm" type="text" danger size="small" icon={<DeleteOutlined />}
                    onClick={() => { dispatch(removeNotification(n.id)); message.success('Removida.'); }} />,
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Tag color={typeColors[n.type] || 'default'}>{typeLabels[n.type] || n.type}</Tag>
                      <Text strong={!n.read} style={{ fontSize: 14 }}>{n.title}</Text>
                    </Space>
                  }
                  description={
                    <>
                      <Text type="secondary" style={{ fontSize: 12 }}>{n.message}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {new Date(n.createdAt).toLocaleDateString('pt-BR')} às {new Date(n.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
