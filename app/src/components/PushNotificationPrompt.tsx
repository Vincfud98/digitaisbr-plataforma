import { useState } from 'react';
import { Alert, Button, message, Space } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useAppSelector } from '../store';
import { isPushSupported, requestNotificationPermission } from '../lib/pushService';

const STORAGE_KEY = 'push_asked';

export default function PushNotificationPrompt() {
  const user = useAppSelector((s) => s.auth.user);
  const [visible, setVisible] = useState(() => {
    if (!isPushSupported()) return false;
    return localStorage.getItem(STORAGE_KEY) !== 'true';
  });
  const [loading, setLoading] = useState(false);

  if (!visible || !user) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  const activate = async () => {
    setLoading(true);
    const userId = user.firebaseUid || user.id;
    if (!userId) { setLoading(false); return; }
    const token = await requestNotificationPermission(userId);
    setLoading(false);
    if (token) {
      message.success('Notificações ativadas!');
    }
    dismiss();
  };

  return (
    <Alert
      banner
      type="info"
      icon={<BellOutlined />}
      message={
        <Space wrap>
          <span>Ative as notificações para ficar por dentro de tudo!</span>
          <Button type="primary" size="small" loading={loading} onClick={activate}>
            Ativar Notificações
          </Button>
          <Button size="small" onClick={dismiss}>Agora não</Button>
        </Space>
      }
      closable
      onClose={dismiss}
      style={{ marginBottom: 0 }}
    />
  );
}
