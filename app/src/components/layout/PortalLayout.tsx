import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Tag, Badge, theme } from 'antd';
import {
  DashboardOutlined,
  ShopOutlined,
  GiftOutlined,
  ShoppingCartOutlined,
  CrownOutlined,
  ReadOutlined,
  CommentOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SwapOutlined,
  CustomerServiceOutlined,
  LinkOutlined,
  PictureOutlined,
  WalletOutlined,
  TagOutlined,
  BarChartOutlined,
  ApiOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { logoutUser } from '../../lib/authService';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/portal', icon: <DashboardOutlined />, label: 'Meu Painel' },
  { key: '/portal/loja', icon: <ShopOutlined />, label: 'Minha Loja' },
  { key: '/portal/vendas', icon: <ShoppingCartOutlined />, label: 'Minhas Vendas' },
  { key: '/portal/beneficios', icon: <GiftOutlined />, label: 'Meus Benefícios' },
  { key: '/portal/plano', icon: <CrownOutlined />, label: 'Meu Plano' },
  { key: '/portal/links', icon: <LinkOutlined />, label: 'Links de Afiliado' },
  { key: '/portal/materiais', icon: <PictureOutlined />, label: 'Materiais' },
  { key: '/portal/financeiro', icon: <WalletOutlined />, label: 'Financeiro' },
  { key: '/portal/perfil', icon: <UserOutlined />, label: 'Meu Perfil' },
  { key: '/portal/cupons', icon: <TagOutlined />, label: 'Cupons' },
  { key: '/portal/performance', icon: <BarChartOutlined />, label: 'Performance' },
  { key: '/portal/redes-sociais', icon: <ApiOutlined />, label: 'Redes Sociais' },
  { key: '/portal/ranking', icon: <TrophyOutlined />, label: 'Ranking' },
  { key: '/portal/conteudos', icon: <ReadOutlined />, label: 'Conteúdos' },
  { key: '/portal/comunidade', icon: <CommentOutlined />, label: 'Comunidade' },
  { key: '/portal/notificacoes', icon: <BellOutlined />, label: 'Notificações' },
  { key: '/portal/suporte', icon: <CustomerServiceOutlined />, label: 'Suporte' },
];

const planLabels: Record<string, string> = { basico: 'Básico', intermediario: 'Intermediário', avancado: 'Avançado' };
const planColors: Record<string, string> = { basico: 'blue', intermediario: 'purple', avancado: 'gold' };

function getSelectedKey(pathname: string): string {
  if (pathname === '/portal') return '/portal';
  const match = menuItems.find((m) => m.key !== '/portal' && pathname.startsWith(m.key));
  return match?.key || '/portal';
}

export default function PortalLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const unreadCount = useAppSelector((s) => s.notificacoes.list.filter((n) => !n.read).length);
  const { token } = theme.useToken();

  const selectedKey = getSelectedKey(location.pathname);
  const plan = user?.plan || 'basico';

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: 'Meu Perfil' },
      { key: 'settings', icon: <SettingOutlined />, label: 'Configurações' },
      ...(user?.role === 'admin' ? [{ key: 'admin', icon: <SwapOutlined />, label: 'Painel Admin' }] : []),
      { type: 'divider' as const },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Sair', danger: true },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'logout') {
        logoutUser().catch(() => {});
        dispatch(logout());
        navigate('/login');
      } else if (key === 'admin') {
        navigate('/');
      }
    },
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderBottom: `1px solid ${token.colorBorderSecondary}`, padding: '0 12px' }}>
          <img src="/logo.png" alt="DigitaisBR" style={{ height: collapsed ? 36 : 48, objectFit: 'contain' }} />
          {!collapsed && <Tag color={planColors[plan]} style={{ fontSize: 10 }}>{planLabels[plan]}</Tag>}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ border: 'none', marginTop: 8 }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'all 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18, cursor: 'pointer', color: token.colorTextSecondary }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
            <Text type="secondary">Portal do Associado</Text>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Badge count={unreadCount} size="small" offset={[-2, 2]}>
              <BellOutlined
                style={{ fontSize: 18, cursor: 'pointer', color: token.colorTextSecondary }}
                onClick={() => navigate('/portal/notificacoes')}
              />
            </Badge>

            <Dropdown menu={userMenu} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <Text>{user?.name}</Text>
                <Avatar style={{ background: '#1677ff' }} icon={<UserOutlined />} />
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: 24, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
