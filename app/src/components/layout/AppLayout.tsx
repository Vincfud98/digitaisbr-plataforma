import { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Tag, Badge, Breadcrumb, theme, Drawer } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  CrownOutlined,
  GiftOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  BankOutlined,
  PartitionOutlined,
  ReadOutlined,
  CommentOutlined,
  BellOutlined,
  AuditOutlined,
  StarOutlined,
  CustomerServiceOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  SwapOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { logoutUser } from '../../lib/authService';
import PushNotificationPrompt from '../PushNotificationPrompt';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  {
    key: 'cadastros',
    icon: <TeamOutlined />,
    label: 'Cadastros',
    children: [
      { key: '/associados', icon: <TeamOutlined />, label: 'Associados' },
      { key: '/parceiros', icon: <PartitionOutlined />, label: 'Parceiros' },
    ],
  },
  { key: '/planos', icon: <CrownOutlined />, label: 'Planos' },
  { key: '/beneficios', icon: <GiftOutlined />, label: 'Benefícios' },
  {
    key: 'comercial',
    icon: <ShopOutlined />,
    label: 'Comercial',
    children: [
      { key: '/catalogo', icon: <ShoppingCartOutlined />, label: 'Catálogo' },
      { key: '/lojas', icon: <ShopOutlined />, label: 'Lojas' },
      { key: '/vendas', icon: <DollarOutlined />, label: 'Vendas' },
      { key: '/comissoes', icon: <BankOutlined />, label: 'Comissões' },
    ],
  },
  { key: '/conteudos', icon: <ReadOutlined />, label: 'Conteúdos' },
  { key: '/comunidade', icon: <CommentOutlined />, label: 'Comunidade' },
  { key: '/notificacoes', icon: <BellOutlined />, label: 'Notificações' },
  { key: '/servicos', icon: <AuditOutlined />, label: 'Serviços' },
  { key: '/destaques', icon: <StarOutlined />, label: 'Destaques' },
  { key: '/suporte', icon: <CustomerServiceOutlined />, label: 'Suporte' },
  { key: '/comunicacoes', icon: <SendOutlined />, label: 'Comunicações' },
  { key: '/relatorios', icon: <BarChartOutlined />, label: 'Relatórios' },
  { key: '/financeiro', icon: <BankOutlined />, label: 'Financeiro' },
];

const planLabels: Record<string, string> = { basico: 'Básico', intermediario: 'Intermediário', avancado: 'Avançado' };
const planColors: Record<string, string> = { basico: 'blue', intermediario: 'purple', avancado: 'gold' };

const breadcrumbMap: Record<string, string> = {
  associados: 'Associados',
  parceiros: 'Parceiros',
  planos: 'Planos',
  beneficios: 'Benefícios',
  catalogo: 'Catálogo',
  lojas: 'Lojas',
  vendas: 'Vendas',
  comissoes: 'Comissões',
  financeiro: 'Financeiro',
  conteudos: 'Conteúdos',
  comunidade: 'Comunidade',
  notificacoes: 'Notificações',
  servicos: 'Serviços',
  destaques: 'Destaques',
  suporte: 'Suporte',
  comunicacoes: 'Comunicações',
  relatorios: 'Relatórios',
  novo: 'Novo',
  editar: 'Editar',
  preview: 'Preview',
};

function getSelectedKey(pathname: string): string {
  if (pathname === '/') return '/';
  const segments = pathname.split('/').filter(Boolean);
  return '/' + segments[0];
}

function getOpenKeys(pathname: string): string[] {
  const key = getSelectedKey(pathname);
  if (['/associados', '/parceiros'].includes(key)) return ['cadastros'];
  if (['/catalogo', '/lojas', '/vendas', '/comissoes'].includes(key)) return ['comercial'];
  return [];
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const unreadCount = useAppSelector((s) => s.notificacoes.list.filter((n) => !n.read).length);
  const openTickets = useAppSelector((s) => s.suporte.list.filter((t) => t.status === 'aberto').length);
  const { token } = theme.useToken();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selectedKey = getSelectedKey(location.pathname);
  const defaultOpenKeys = getOpenKeys(location.pathname);

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = [
    { title: <Link to="/"><HomeOutlined /></Link> },
    ...pathSegments.map((seg, i) => {
      const path = '/' + pathSegments.slice(0, i + 1).join('/');
      const label = breadcrumbMap[seg] || seg;
      const isLast = i === pathSegments.length - 1;
      return {
        title: isLast ? label : <Link to={path}>{label}</Link>,
      };
    }),
  ];

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: 'Meu Perfil' },
      { key: 'settings', icon: <SettingOutlined />, label: 'Configurações' },
      { key: 'portal', icon: <SwapOutlined />, label: 'Portal do Associado' },
      { type: 'divider' as const },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Sair', danger: true },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'logout') {
        logoutUser().catch(() => {});
        dispatch(logout());
        navigate('/login');
      } else if (key === 'portal') {
        navigate('/portal');
      }
    },
  };

  const siderMenu = (
    <>
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${token.colorBorderSecondary}`, padding: '0 12px' }}>
        <img src="/logo.png" alt="DigitaisBR" style={{ height: isMobile ? 52 : (collapsed ? 36 : 52), objectFit: 'contain' }} />
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={defaultOpenKeys}
        items={menuItems}
        onClick={({ key }) => { navigate(key); if (isMobile) setDrawerOpen(false); }}
        style={{ border: 'none', marginTop: 8 }}
      />
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isMobile ? (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={256}
          styles={{ body: { padding: 0 } }}
        >
          {siderMenu}
        </Drawer>
      ) : (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={256}
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
          {siderMenu}
        </Sider>
      )}

      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 256), transition: 'all 0.2s' }}>
        <Header
          style={{
            padding: isMobile ? '0 12px' : '0 24px',
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
              onClick={() => isMobile ? setDrawerOpen(true) : setCollapsed(!collapsed)}
              style={{ fontSize: 18, cursor: 'pointer', color: token.colorTextSecondary }}
            >
              {isMobile || collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 16 }}>
            <Badge count={openTickets} size="small" offset={[-2, 2]}>
              <CustomerServiceOutlined
                style={{ fontSize: 18, cursor: 'pointer', color: token.colorTextSecondary }}
                onClick={() => navigate('/suporte')}
              />
            </Badge>
            <Badge count={unreadCount} size="small" offset={[-2, 2]}>
              <BellOutlined
                style={{ fontSize: 18, cursor: 'pointer', color: token.colorTextSecondary }}
                onClick={() => navigate('/notificacoes')}
              />
            </Badge>

            <Dropdown menu={userMenu} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                {!isMobile && user?.plan && <Tag color={planColors[user.plan]}>{planLabels[user.plan]}</Tag>}
                {!isMobile && <Text>{user?.name}</Text>}
                <Avatar style={{ background: '#1677ff' }} icon={<UserOutlined />} />
              </div>
            </Dropdown>
          </div>
        </Header>

        <PushNotificationPrompt />
        <Content style={{ margin: isMobile ? 12 : 24, minHeight: 280 }}>
          {pathSegments.length > 0 && (
            <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />
          )}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
